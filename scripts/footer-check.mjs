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
  await cdp('Page.enable');await cdp('Runtime.enable');await viewport(1440,1000);
  for(const page of ['/about','/contact','/faq','/privacy','/terms','/cancellation']) {
    await go(page);
    await assert(page+' renders dedicated content','!!document.querySelector(".information-page h1")&&!document.querySelector(".property-grid")');
    await assert(page+' footer has complete policies','document.querySelectorAll(".footer-policy-links a").length===3');
  }
  await go('/faq');await click('.information-card summary');await assert('FAQ expands','!!document.querySelector(".information-card[open]")');
  await go('/contact');await click('.information-help .primary-button');await assert('Contact enquiry works','!!document.querySelector(".enquiry-popup")');await click('.enquiry-popup>button.absolute');
  await go('/stays?destination=Trimbakeshwar');
  await waitFor('document.querySelector("input[list=destinations]")?.value==="Trimbakeshwar"&&document.querySelectorAll(".property-card").length>0');
  await assert('Destination URL applies real filter','document.querySelectorAll(".property-card").length>0&&[...document.querySelectorAll(".card-location>span")].every(e=>e.textContent.includes("Trimbakeshwar"))');
  await go('/privacy');for(const width of [360,390,430,768,1024,1440]){await viewport(width,width<600?844:1000);await assert('Information page fits '+width+'px','document.documentElement.scrollWidth<=innerWidth');}
  report.push({label:'No uncaught browser exceptions',passed:errors.length===0,errors});fs.writeFileSync('artifacts/footer-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
} catch (error) {
  report.push({ label: "Browser run", passed: false, error: String(error) });
  fs.writeFileSync("artifacts/footer-report.json", JSON.stringify({ report, errors }, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  ws?.close();
  browser.kill();
}
