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
  await cdp('Page.enable'); await cdp('Runtime.enable');
  await viewport(1440,1000); await go('/');
  await click('.map-view-toggle');
  await assert('Area map opens with filtered stays', '!!document.querySelector(".stay-area-map iframe")&&document.querySelectorAll(".area-map-list a").length>0');
  await evaluate('(()=>{const e=document.querySelector(".language-switch");e.value="mr";e.dispatchEvent(new Event("change",{bubbles:true}));})()');
  await pause(300);
  await assert('Marathi navigation and document language', 'document.documentElement.lang==="mr"&&document.querySelector(".header-primary-nav").textContent.includes("मुख्यपृष्ठ")');
  await go('/stays');
  await assert('Language persists between pages', 'document.documentElement.lang==="mr"&&document.querySelector(".language-switch").value==="mr"');
  await evaluate('(()=>{const e=document.querySelector(".language-switch");e.value="en";e.dispatchEvent(new Event("change",{bubbles:true}));})()');
  await viewport(390,844); await go('/stays');
  await click('.mobile-search-entry');
  await fill('[aria-label="Search check-in"]','2027-06-05');
  await fill('[aria-label="Search check-out"]','2027-06-07');
  await clickText('Search Stays','[role=dialog] button');
  await assert('Selected dates show trip totals', 'document.querySelectorAll(".stay-price-summary").length>0');
  await click('.stay-price-summary summary');
  await assert('Price breakdown includes fees', 'document.querySelector(".stay-price-summary[open]").textContent.includes("Demo taxes & fees (8%)")');
  for(const width of [360,390,430,768,1024,1440]){await viewport(width,width<600?844:1000);await assert('Header and results fit '+width+'px','document.documentElement.scrollWidth<=innerWidth');}
  await click('.map-view-toggle');
  await assert('Map on mobile retains area selector','!!document.querySelector(".area-map-sidebar select")');
  report.push({label:'No uncaught exceptions',passed:errors.length===0,errors});
  fs.writeFileSync('artifacts/travel-tools-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
} catch (error) {
  report.push({ label: "Browser run", passed: false, error: String(error) });
  fs.writeFileSync("artifacts/travel-tools-report.json", JSON.stringify({ report, errors }, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  ws?.close();
  browser.kill();
}
