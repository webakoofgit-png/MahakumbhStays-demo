import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const base = process.env.BASE_URL ?? "http://127.0.0.1:8080";
const browser = spawn(
  process.env.BROWSER_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=9333",
    `--user-data-dir=${path.resolve("node_modules/.cache/stay-browser-profile")}`,
    "about:blank",
  ],
  { windowsHide: true, stdio: "ignore" },
);
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
const report = [];
let seq = 0;
const pending = new Map();
const errors = [];
try {
  let pages;
  for (let i = 0; i < 50; i++) {
    try {
      pages = await (await fetch("http://127.0.0.1:9333/json")).json();
      if (pages.length) break;
    } catch {}
    await pause(200);
  }
  ws = new WebSocket(pages.find((p) => p.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      m.error ? p.reject(m.error) : p.resolve(m.result);
    } else if (m.method === "Runtime.exceptionThrown") {
      errors.push(
        m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text,
      );
    }
  };
  function cdp(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const r = await cdp("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails)
      throw Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result?.value;
  }
  async function waitFor(expression) {
    for (let i = 0; i < 80; i++) {
      if (await evaluate(expression)) return;
      await pause(150);
    }
    throw Error("Timed out: " + expression);
  }
  async function go(url, { keepEnquiry = false } = {}) {
    await cdp("Page.navigate", { url: base + url });
    await waitFor(`document.readyState==='complete'&&!!document.querySelector('.site-header')`);
    await waitFor(
      `!document.querySelector("[role=status]")?.textContent.includes("Getting your stay ready")`,
    );
    if (url.startsWith("/property/")) await waitFor("!!document.querySelector('.property-detail')");
    if (url.startsWith("/owner") || url.startsWith("/admin"))
      await waitFor("!!document.querySelector('.dashboard-shell')");
    await pause(url === "/" ? 1200 : 700);
    if (!keepEnquiry) {
      const hasEnquiry = await evaluate("!!document.querySelector('.enquiry-popup')");
      if (hasEnquiry) {
        await evaluate("document.querySelector('.enquiry-popup>button.absolute').click()");
        await pause(250);
      }
    }
  }
  async function clickText(text, selector = "button") {
    await evaluate(
      `(()=>{const e=[...document.querySelectorAll(${JSON.stringify(selector)})].find(e=>e.textContent.includes(${JSON.stringify(text)}));if(!e)throw Error('Missing '+${JSON.stringify(text)});e.click();})()`,
    );
    await pause(250);
  }
  async function click(selector) {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    await pause(250);
  }
  async function fill(selector, value) {
    await evaluate(
      `(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`,
    );
    await pause(150);
  }
  async function assert(label, expression) {
    const ok = await evaluate(expression);
    report.push({ label, passed: !!ok });
    if (!ok) {
      const diagnostics = await evaluate(
        `(()=>{const e=document.querySelector('.enquiry-popup');if(!e)return null;const c=getComputedStyle(e);return {rect:e.getBoundingClientRect().toJSON(),scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,translate:c.translate,transform:c.transform,top:c.top,left:c.left,width:c.width,height:c.height,links:[...document.querySelectorAll('link[rel=stylesheet]')].map(l=>l.href),styles:[...document.styleSheets].filter(s=>s.href?.includes('hospitality')).map(s=>{try{return [...s.cssRules].slice(-4).map(r=>r.cssText)}catch{return 'unreadable'}})}})()`,
      );
      console.log(JSON.stringify(diagnostics));
      throw Error("Failed: " + label);
    }
  }
  async function viewport(width, height) {
    await cdp("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    await pause(250);
  }
  async function shot(name) {
    await evaluate("window.scrollTo(0,0)");
    await pause(700);
    const r = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    fs.writeFileSync(`artifacts/${name}.png`, Buffer.from(r.data, "base64"));
  }
  async function captureSection(selector, name) {
    await evaluate(
      `(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();window.scrollTo({top:window.scrollY+r.top-90,behavior:'instant'});})()`,
    );
    await pause(500);
    const shot = await cdp("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    fs.writeFileSync("artifacts/" + name + ".png", Buffer.from(shot.data, "base64"));
  }
  async function shotCurrent(name) {
    const r = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    fs.writeFileSync("artifacts/" + name + ".png", Buffer.from(r.data, "base64"));
  }
  await cdp("Page.enable");
  await cdp("Runtime.enable");
  await viewport(1440, 1000);
  await go("/");
  await evaluate("localStorage.clear()");
  await go("/");
  await pause(1000);
  await go("/", { keepEnquiry: true });
  await waitFor("!!document.querySelector('.enquiry-popup')");
  await assert(
    "Homepage entry automatically shows enquiry popup",
    `!!document.querySelector('[role=dialog].enquiry-popup')&&document.querySelector('.enquiry-visual img').naturalWidth>0`,
  );
  for (const width of [360, 390, 430, 768, 1024, 1440]) {
    await viewport(width, width < 600 ? 844 : 1000);
    await shotCurrent("enquiry-popup-" + width);
    await assert(
      "Enquiry popup " + width + "px: fits viewport",
      `(()=>{const r=document.querySelector('.enquiry-popup').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1&&document.querySelector('.enquiry-popup').scrollWidth<=document.querySelector('.enquiry-popup').clientWidth+1&&document.querySelector('.enquiry-popup').scrollHeight<=document.querySelector('.enquiry-popup').clientHeight+1})()`,
    );
    await assert(
      "Enquiry popup " + width + "px: image remains visible",
      `document.querySelector('.enquiry-visual').getBoundingClientRect().height>80`,
    );
  }
  await assert(
    "Quick enquiry has only three fields",
    `document.querySelectorAll('.enquiry-form input,.enquiry-form select,.enquiry-form textarea').length===3`,
  );
  for (const [width, height] of [
    [1100, 600],
    [1440, 650],
    [390, 640],
    [360, 568],
    [844, 390],
  ]) {
    await viewport(width, height);
    await shotCurrent("enquiry-compact-" + width + "x" + height);
    await assert(
      "Quick enquiry " + width + "x" + height + ": no internal scrolling",
      `(()=>{const e=document.querySelector('.enquiry-popup');const r=e.getBoundingClientRect();return e.scrollHeight<=e.clientHeight+1&&e.scrollWidth<=e.clientWidth+1&&r.top>=0&&r.bottom<=innerHeight+1&&document.querySelector('.enquiry-form button[type=submit]').getBoundingClientRect().bottom<=r.bottom})()`,
    );
  }
  await viewport(1440, 1000);
  await fill(".enquiry-popup input[name=name]", "Ananya Patil");
  await fill(".enquiry-popup input[name=phone]", "invalid1234");
  await clickText("Enquire about my stay");
  await assert(
    "Enquiry validates phone without losing form",
    `document.querySelector('.enquiry-popup [role=alert]').textContent.includes('10–15 digits')`,
  );
  await fill(".enquiry-popup input[name=phone]", "9876543210");
  await clickText("Enquire about my stay");
  await assert(
    "Enquiry submission saves to shared demo data",
    `JSON.parse(localStorage.getItem('mahakumbhstays-demo-state')).enquiries.some(e=>e.contactPerson==='Ananya Patil'&&e.status==='new')&&document.querySelector('.enquiry-success').textContent.includes('One step closer')`,
  );
  await clickText("Continue exploring");
  if (process.env.ENQUIRY_ONLY === "1") {
    report.push({ label: "No uncaught browser exceptions", passed: errors.length === 0, errors });
    fs.writeFileSync("artifacts/enquiry-compact-report.json", JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    ws.close();
    browser.kill();
    process.exit(errors.length ? 1 : 0);
  }

  await captureSection(".cinema-section", "cinema-desktop");
  await waitFor(
    "document.querySelector('.hero-video').readyState>=2&&!document.querySelector('.hero-video').paused",
  );
  await assert(
    "Hero video is muted, looping and inline",
    `(()=>{const v=document.querySelector('.hero-video');return v.muted&&v.defaultMuted&&v.loop&&v.playsInline&&v.duration>0})()`,
  );
  const time = await evaluate("document.querySelector('.hero-video').currentTime");
  await pause(400);
  await assert(
    "Hero video actually advances",
    `document.querySelector('.hero-video').currentTime!==${time}`,
  );
  await click('[aria-label="Pause Kumbh Mela video"]');
  await assert("Hero video pause works", `document.querySelector('.hero-video').paused`);
  await click('[aria-label="Play Kumbh Mela video"]');
  await waitFor("!document.querySelector('.hero-video').paused");
  await captureSection(".premium-footer", "premium-footer-desktop");
  await click(".footer-enquire-button");
  await assert(
    "Footer can reopen the enquiry form",
    `!!document.querySelector('.enquiry-popup .enquiry-form')`,
  );
  await click(".enquiry-popup>button.absolute");
  await viewport(390, 844);
  await captureSection(".premium-footer", "premium-footer-mobile");
  await assert(
    "Footer fits mobile without horizontal overflow",
    `document.documentElement.scrollWidth<=innerWidth`,
  );
  await click(".footer-bottom button");
  await waitFor("window.scrollY<20");
  await assert("Footer back-to-top works", `window.scrollY<20`);
  await viewport(1440, 1000);
  await evaluate("localStorage.clear()");
  await go("/");
  await shot("home-desktop");
  await assert(
    "Homepage renders without horizontal overflow",
    `document.querySelector('h1').textContent.includes('Find Your Perfect Stay for Nashik Kumbh 2027')&&document.documentElement.scrollWidth<=innerWidth`,
  );
  await assert(
    "Featured composition preserves demo labels",
    `document.querySelectorAll('.featured-grid .property-card').length===5&&[...document.querySelectorAll('.featured-grid .property-card')].every(e=>e.textContent.includes('Demo Listing'))`,
  );
  await captureSection(".signature-destinations", "signature-explorer-desktop");
  await captureSection(".featured-stays", "signature-featured-desktop");
  await captureSection(".journey-section", "signature-journeys-desktop");
  await click(".featured-grid .heart-button");
  await assert(
    "Featured wishlist remains functional",
    `document.querySelector('.featured-grid .heart-button').getAttribute('aria-pressed')==='true'`,
  );
  await click(".featured-grid .heart-button");
  await click(".featured-grid .quick-view");
  await assert(
    "Featured quick view preserves property information",
    `document.querySelector('[role=dialog]').textContent.includes('Explore this stay')`,
  );
  await click("[role=dialog] button.absolute");
  await click('[aria-label="Show Trimbakeshwar"]');
  await assert(
    "Destination index and active photo update",
    `document.querySelector('.showcase-primary h3').textContent==='Trimbakeshwar'&&document.querySelector('.destination-index strong').textContent==='02'`,
  );
  await click(".showcase-primary .showcase-cta");
  await assert(
    "Explorer action applies real destination filter",
    `document.querySelectorAll('.property-card').length>0&&[...document.querySelectorAll('.card-location>span')].every(e=>e.textContent.includes('Trimbakeshwar'))`,
  );
  await fill("input[list=destinations]", "");
  await click(".search-submit");
  for (const [title, condition] of [
    [
      "Near Trimbakeshwar",
      "[...document.querySelectorAll('.card-location>span')].every(e=>e.textContent.includes('Trimbakeshwar'))",
    ],
    [
      "Family Accommodation",
      "[...document.querySelectorAll('.property-card')].every(e=>e.textContent.includes('Family rooms'))",
    ],
    [
      "Budget-Friendly Stays",
      "[...document.querySelectorAll('.card-price strong')].every(e=>Number(e.textContent.replace(/[^0-9]/g,''))<=2000)",
    ],
  ]) {
    await clickText(title, ".journey-card");
    await assert(
      "Journey collection: " + title,
      'document.querySelectorAll(".property-card").length>0&&' + condition,
    );
  }
  await go("/");
  await evaluate("localStorage.clear()");
  await go("/");
  await viewport(390, 844);
  await captureSection(".signature-destinations", "signature-explorer-mobile");
  await captureSection(".featured-stays", "signature-featured-mobile");
  await assert(
    "Featured mobile rail supports swipe",
    `getComputedStyle(document.querySelector('.featured-grid')).scrollSnapType.includes('x')&&document.querySelector('.featured-grid').scrollWidth>document.querySelector('.featured-grid').clientWidth`,
  );
  await evaluate(
    `document.querySelector('.featured-grid').scrollTo({left:330,behavior:'instant'})`,
  );
  await pause(300);
  await assert(
    "Featured native horizontal scroll advances cards",
    `document.querySelector('.featured-grid').scrollLeft>0`,
  );
  await click('.mobile-bottom-nav a[href="/wishlist"]');
  await waitFor(`location.pathname==='/wishlist'`);
  await assert(
    "Saved navigation opens the existing wishlist route",
    `document.querySelector('.mobile-bottom-nav a[href="/wishlist"]').getAttribute('aria-current')==='page'`,
  );
  await click('.mobile-bottom-nav a[href="/bookings"]');
  await waitFor(`location.pathname==='/bookings'`);
  await assert(
    "Bookings navigation opens existing booking route",
    `document.querySelector('h1').textContent.includes('Good memories')`,
  );
  await go("/");
  await viewport(1440, 1000);
  await clickText("Budget Stays");
  await assert(
    "Budget chip filters actual room prices",
    `[...document.querySelectorAll('.card-price strong')].every(e=>Number(e.textContent.replace(/[^0-9]/g,''))<=2000)`,
  );
  await clickText("Budget Stays");
  await clickText("Family Friendly");
  await assert(
    "Family chip filters family rooms",
    `[...document.querySelectorAll('.property-card')].every(e=>e.textContent.includes('Family rooms'))`,
  );
  await clickText("Family Friendly");
  await clickText("Parking Available");
  await assert(
    "Parking chip filters parking amenity",
    `[...document.querySelectorAll('.property-card')].every(e=>e.textContent.includes('Parking'))`,
  );
  await clickText("Parking Available");
  await fill("input[list=destinations]", "Trimbakeshwar");
  await click(".search-submit");
  await assert(
    "Destination search filters actual locations",
    `[...document.querySelectorAll('.card-location>span')].every(e=>e.textContent.includes('Trimbakeshwar'))`,
  );
  await fill("input[list=destinations]", "");
  await click(".search-submit");
  await click(".guest-button");
  await click('[aria-label="Add adults"]');
  await clickText("Done");
  await assert(
    "Guest selector updates search",
    `document.querySelector('.guest-button').textContent.includes('3 guests')`,
  );
  await click(".guest-button");
  await click('[aria-label="Remove adults"]');
  await clickText("Done");
  await click(".heart-button");
  await assert(
    "Wishlist heart persists in shared store",
    `JSON.parse(localStorage.getItem('mahakumbhstays-demo-state')).wishlist.length===1`,
  );
  await click(".quick-view");
  await assert(
    "Quick view opens accessible dialog",
    `!!document.querySelector('[role=dialog] .modal-photo')`,
  );
  await click("[role=dialog] button.absolute");
  await evaluate(`document.querySelectorAll('.compare-button').forEach((e,i)=>{if(i<3)e.click()})`);
  await pause(300);
  await clickText("Compare stays");
  await assert(
    "Compares three properties",
    `document.querySelectorAll('.comparison-grid article').length===3`,
  );
  await click("[role=dialog] button.absolute");
  await click('[aria-label="Clear comparison"]');
  await click('[aria-label="Check-in"]');
  await assert(
    "Date picker opens",
    `!!document.querySelector('[data-slot=popover-content], .date-popover')`,
  );
  await cdp("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  await pause(200);
  await viewport(768, 1024);
  await shot("home-tablet");
  await assert("Tablet layout has no overflow", `document.documentElement.scrollWidth<=innerWidth`);
  await viewport(390, 844);
  await shot("home-mobile");
  await clickText("Filters");
  await assert(
    "Mobile filters open as a bottom sheet",
    `getComputedStyle(document.querySelector('[role=dialog]')).bottom==='0px'`,
  );
  await click("[role=dialog] button.absolute");
  await assert(
    "Mobile destinations use horizontal snap cards",
    `getComputedStyle(document.querySelector('.destination-snap-track')).scrollSnapType.includes('x') && document.querySelectorAll('.destination-snap-card').length===5`,
  );
  await assert("Mobile layout has no overflow", `document.documentElement.scrollWidth<=innerWidth`);
  await click(".mobile-search-entry");
  await assert(
    "Mobile search opens accessible sheet",
    `!!document.querySelector('[role=dialog].search-sheet')&&getComputedStyle(document.querySelector('.mobile-bottom-nav')).visibility==='hidden'`,
  );
  const sheetImage = await cdp("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  fs.writeFileSync("artifacts/signature-search-mobile.png", Buffer.from(sheetImage.data, "base64"));
  await fill('[aria-label="Search check-in"]', "2027-06-05");
  await clickText("Search Stays", "[role=dialog] button");
  await assert(
    "Incomplete dates keep one clear search dialog",
    `document.querySelectorAll('[role=dialog]').length===1&&document.querySelector('[role=alert]').textContent.includes('later check-out')`,
  );
  await fill('[aria-label="Search check-out"]', "2027-06-07");
  await click('[role=dialog] [aria-label="Add adults"]');
  await assert(
    "Guest counter does not accidentally submit search",
    `!!document.querySelector('[role=dialog].search-sheet')`,
  );
  await click('[role=dialog] [aria-label="Remove adults"]');
  await clickText("Search Stays", "[role=dialog] button");
  await assert(
    "Mobile search applies dates and closes sheet",
    `!document.querySelector('[role=dialog]')&&JSON.parse(localStorage.getItem('mahakumbhstays-demo-state')).searchCriteria.checkIn==='2027-06-05'`,
  );
  await click('[aria-label="Go to Igatpuri"]');
  await pause(500);
  await assert(
    "Swipe pagination updates active destination",
    `document.querySelector('.destination-index strong').textContent==='05'`,
  );
  for (const width of [360, 390, 430, 768, 1024, 1440]) {
    await viewport(width, width < 600 ? 844 : 1000);
    await shot("signature-home-" + width);
    await assert(
      "Homepage " + width + "px: no overflow",
      `document.documentElement.scrollWidth<=innerWidth`,
    );
    await assert(
      "Homepage " + width + "px: search above fold",
      width < 600
        ? `document.querySelector('.mobile-search-entry').getBoundingClientRect().bottom<innerHeight-66`
        : `document.querySelector('.desktop-search-surface').getBoundingClientRect().bottom<innerHeight`,
    );
    if (width < 600)
      await assert(
        "Homepage " + width + "px: sticky navigation",
        `getComputedStyle(document.querySelector('.site-header')).position==='sticky'&&getComputedStyle(document.querySelector('.mobile-bottom-nav')).display==='grid'`,
      );
  }
  await viewport(390, 844);
  const href = await evaluate(`document.querySelector('.card-photo a').getAttribute('href')`);
  await go(href);
  await assert(
    "Mobile sticky booking control is visible",
    `getComputedStyle(document.querySelector('.mobile-booking-bar')).display==='flex'`,
  );
  await shot("property-mobile");
  await clickText("Check availability");
  await assert(
    "Booking opens mobile bottom sheet",
    `getComputedStyle(document.querySelector('[role=dialog]')).bottom==='0px'`,
  );
  await click("[role=dialog] button.absolute");
  await viewport(1440, 1000);
  await go(href);
  await click(".detail-gallery button");
  await click('[aria-label="Next photo"]');
  await assert(
    "Fullscreen gallery navigates photos",
    `document.querySelector('[role=dialog] .lightbox img').alt.includes('photo 2')`,
  );
  await click("[role=dialog] button.absolute");
  await fill('[aria-label="Booking check-in"]', "2027-06-05");
  await fill('[aria-label="Booking check-out"]', "2027-06-07");
  await clickText("Reserve your stay");
  await waitFor(`!!document.querySelector('.booking-stepper')`);
  await clickText("Continue");
  await clickText("Continue to demo payment");
  await clickText("Test failed payment");
  await assert(
    "Failed payment gives accessible feedback",
    `document.querySelector('[role=alert]').textContent.includes('failed')`,
  );
  await clickText("Simulate payment ·");
  await assert(
    "Successful simulated payment confirms booking",
    `document.querySelector('.confirmation').textContent.includes('Simulated payment successful')`,
  );
  await go("/bookings");
  await clickText("Request cancellation");
  await assert(
    "Cancellation request updates shared booking",
    `JSON.parse(localStorage.getItem('mahakumbhstays-demo-state')).bookings.at(-1).status==='refund_requested'`,
  );
  await go("/admin");
  await shot("admin-desktop");
  await clickText("Bookings", ".dashboard-sidebar button");
  await clickText("Approve refund");
  await clickText("Applications", ".dashboard-sidebar button");
  await clickText("Approve & publish");
  await assert(
    "Admin approval publishes a property",
    `JSON.parse(localStorage.getItem('mahakumbhstays-demo-state')).properties.some(p=>p.name==='Rane Tourist Home'&&p.status==='approved')`,
  );
  await go("/owner");
  await clickText("Properties", ".dashboard-sidebar button");
  await clickText("Edit listing");
  await fill("input[name=name]", "Godavari Comfort Inn · Updated");
  await clickText("Save listing");
  await assert(
    "Owner edit updates shared property",
    `JSON.parse(localStorage.getItem('mahakumbhstays-demo-state')).properties[0].name.includes('Updated')`,
  );
  await clickText("Edit room");
  await fill("input[name=price]", "2345");
  await clickText("Save room");
  await assert(
    "Owner room pricing persists",
    `JSON.parse(localStorage.getItem('mahakumbhstays-demo-state')).properties[0].rooms[0].pricePerNight===2345`,
  );
  await viewport(390, 844);
  await shot("owner-mobile");
  await assert(
    "Mobile dashboard has no page overflow",
    `document.documentElement.scrollWidth<=innerWidth`,
  );
  await go("/");
  await clickText("Group bookings");
  for (const [name, value] of Object.entries({
    group: "Family reunion",
    name: "Asha Patil",
    email: "asha@example.com",
    phone: "9876543210",
    guests: "12",
    in: "2027-06-10",
    out: "2027-06-12",
    budget: "2500",
  }))
    await fill("[role=dialog] input[name=" + name + "]", value);
  await clickText("Send group enquiry");
  await assert(
    "Group enquiry reaches shared admin data",
    `JSON.parse(localStorage.getItem('mahakumbhstays-demo-state')).enquiries.some(e=>e.groupName==='Family reunion')`,
  );
  await clickText("Got it");
  await cdp("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await assert(
    "Reduced motion disables decorative animations",
    `getComputedStyle(document.querySelector('[data-reveal]')).animationName==='none'`,
  );
  for (const route of ["/property/godavari-comfort-inn", "/owner", "/admin"]) {
    await go(route);
    for (const width of [360, 390, 430, 768, 1024, 1440]) {
      await viewport(width, width < 600 ? 844 : 1000);
      await assert(
        route + " " + width + "px: no page overflow",
        `document.documentElement.scrollWidth<=innerWidth`,
      );
      if (route.startsWith("/property") && width < 600)
        await assert(
          "Property " + width + "px: booking bar unobstructed",
          `!document.querySelector('.mobile-bottom-nav')&&getComputedStyle(document.querySelector('.mobile-booking-bar')).display==='flex'`,
        );
    }
  }
  await go("/");
  await evaluate('window.scrollTo({top:0,behavior:"instant"})');
  await assert(
    "Reduced motion keeps hero video paused by default",
    `document.querySelector('.hero-video').paused&&document.querySelector('.hero-video').muted`,
  );
  await captureSection(".cinema-section", "cinema-reduced-motion");
  await click('[aria-label="Play Kumbh Mela video"]');
  await waitFor("!document.querySelector('.hero-video').paused");
  await assert(
    "Reduced motion still allows explicit user playback",
    `!document.querySelector('.hero-video').paused&&document.querySelector('.hero-video').muted`,
  );
  await cdp("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await go("/admin");
  await assert(
    "Admin pages are not interrupted by the visitor popup",
    `!document.querySelector('.enquiry-popup')`,
  );
  report.push({ label: "No uncaught browser exceptions", passed: errors.length === 0, errors });
  fs.writeFileSync("artifacts/browser-report.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.push({ label: "Browser run", passed: false, error: String(error) });
  fs.writeFileSync("artifacts/browser-report.json", JSON.stringify({ report, errors }, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  ws?.close();
  browser.kill();
}
