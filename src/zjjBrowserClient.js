// Real-Chrome browser client to bypass the 知道创宇 JSL anti-bot challenge.
//
// KEY INSIGHT (proven experimentally):
//   * The site's `cuyGLa6e` request signature is computed at runtime by the JSL
//     challenge script; it is NOT a deterministic encryption of `_t`. It cannot
//     be reproduced outside a real browser.
//   * jsdom / replaying captured cookies / "stealth" patched browsers ALL get 400.
//   * The ONLY thing that works: a clean, UNPATCHED real Chrome launched with
//     `--disable-blink-features=AutomationControlled` (→ navigator.webdriver=false
//     natively) and NO Object.defineProperty patches — the heavy stealth patches
//     are themselves detectable (JSL pool references defineProperty /
//     getOwnPropertyDescriptors) and cause the 400.
//   * Headless is detected (400). A headed Chrome window must appear briefly.
//
// Strategy: launch headed Chrome once → it fetches the challenge page, JSL sets
// the 560fKc21qsOeP cookie and reloads → real page loads → we call the API via
// page.evaluate(fetch) so the JSL-hooked fetch adds a valid `cuyGLa6e` for us.
const path = require('path');
const fs = require('fs');
const os = require('os');

const SITE_URL = 'https://fdc.zjj.sz.gov.cn/public/marketInfo/housePriceTrendInfo.html';
const API_URL = 'https://fdc.zjj.sz.gov.cn/api/marketInfoShow/getFjzsInfoData';

const CHROME_CANDIDATES = [
    process.env.CHROME_PATH,
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    // Linux (GitHub Actions ubuntu-latest preinstalls google-chrome-stable)
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
];

let browser = null;
let page = null;
let profileDir = null;
let ready = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findChrome() {
    for (const c of CHROME_CANDIDATES) {
        if (c && fs.existsSync(c)) return c;
    }
    return null;
}

async function launchBrowser() {
    const exe = findChrome();
    if (!exe) {
        throw new Error('Chrome/Edge not found. Install Chrome or set CHROME_PATH.');
    }
    try {
        // eslint-disable-next-line global-require
        const puppeteer = require('puppeteer-core');
        profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'szhouse-jsl-'));
        const args = [
            '--disable-blink-features=AutomationControlled',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-infobars',
            '--window-size=1600,1000',
            '--window-position=10,10',
            '--lang=zh-CN',
            '--disable-sync',
        ];
        if (process.platform === 'linux') {
            // CI containers have limited /dev/shm; and root needs --no-sandbox.
            args.push('--disable-dev-shm-usage');
            if (typeof process.getuid === 'function' && process.getuid() === 0) {
                args.push('--no-sandbox');
            }
        }
        const launched = await puppeteer.launch({
            executablePath: exe,
            headless: false, // headless=new is detected (400)
            userDataDir: profileDir,
            ignoreDefaultArgs: ['--enable-automation'],
            defaultViewport: null,
            args,
        });
        browser = launched;
        page = await launched.newPage();
        // never leave browser windows hanging
        launched.on('disconnected', () => { browser = null; page = null; });
        return launched;
    } catch (e) {
        browser = null;
        page = null;
        throw e;
    }
}

// Drive the challenge: first visit gets 412 + JSL; JSL computes cookie + reloads;
// the real page loads and document.title appears.
async function solveChallenge() {
    await page.goto(SITE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // JSL sets 560fKc21qsOeP via document.cookie after solving the challenge.
    // Wait for it (on slow CI this can take a few seconds).
    let hasCookie = false;
    for (let i = 0; i < 30; i++) {
        await sleep(1000);
        try {
            const cookies = await page.cookies();
            hasCookie = cookies.some((c) => c.name === '560fKc21qsOeP' && c.value.length > 100);
            if (hasCookie) break;
        } catch (e) { /* navigation in progress */ }
    }
    console.log(`[jsl] solved cookie after ${hasCookie ? 'ok' : 'timeout'}`);

    // ALWAYS do a fresh navigation: the proven-working flow is challenge page
    // (412) → cookie appears → second goto serves the real page (200). The JSL
    // auto-reload does not reliably happen on its own.
    await page.goto(SITE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch((e) => {
        console.log('[jsl] forced reload err:', e.message);
    });
    await sleep(6000);

    // Now wait for the real app page (document.title populated) — requires that the
    // challenge cookie was accepted on reload.
    let loaded = false;
    for (let i = 0; i < 24; i++) {
        await sleep(1500);
        try {
            const t = await page.evaluate(() => document.title);
            if (t && t.length > 0) { loaded = true; break; }
        } catch (e) { /* navigation in progress */ }
    }
    if (!loaded) {
        throw new Error('JSL challenge: page did not load after retries (fingerprint rejected?)');
    }
    // Give the app + JSL fetch-hook script a moment to install itself, so our
    // page.evaluate(fetch) calls get a valid cuyGLa6e signature.
    await sleep(4000);
    console.log('[jsl] app page loaded');
}

async function ensureReady() {
    if (ready && browser && browser.isConnected() && page) return;
    if (!browser || !browser.isConnected()) {
        await launchBrowser();
    }
    if (!ready) {
        await solveChallenge();
        ready = true;
    }
}

// Call an arbitrary API from inside the page so JSL's fetch hook attaches a valid
// cuyGLa6e. Returns the FULL envelope {status, msg, data} (same shape as the
// direct HTTPS call would return).
async function fetchApi(url, payload) {
    await ensureReady();
    const result = await page.evaluate(async (args) => {
        const res = await fetch(args.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args.payload),
        });
        const text = await res.text();
        let json = null;
        try { json = JSON.parse(text); } catch (e) {}
        return { status: res.status, json, raw: text.slice(0, 500) };
    }, { url, payload });

    if (result.status !== 200 || !result.json) {
        throw new Error(`API via browser failed: status=${result.status} raw=${result.raw}`);
    }
    return result.json; // {status, msg, data}
}

// Convenience wrapper for the trend data endpoint: returns parsedData.data.
async function fetchApiData(startDate, endDate) {
    const envelope = await fetchApi(
        'https://fdc.zjj.sz.gov.cn/api/marketInfoShow/getFjzsInfoData',
        { startDate, endDate, dateType: '', _t: Date.now() }
    );
    if (envelope.status !== 1) {
        throw new Error(`API error: ${envelope.msg}`);
    }
    return envelope.data; // {date[], ysfDealArea[], ysfTotalTs[], esfDealArea[], esfTotalTs[], bigEventCont[]}
}

async function closeBrowser() {
    if (browser && browser.isConnected()) {
        await browser.close().catch(() => {});
    }
    if (profileDir && fs.existsSync(profileDir)) {
        fs.rmSync(profileDir, { recursive: true, force: true });
    }
    browser = null;
    page = null;
    ready = false;
}

module.exports = { fetchApiData, fetchApi, closeBrowser };