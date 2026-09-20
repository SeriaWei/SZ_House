// Cleanest possible Chrome run: NO evaluateOnNewDocument patches at all.
// Only --disable-blink-features=AutomationControlled + ignoreDefaultArgs.
// Then: natural reload allowed, 25s settle, THEN fresh goto. Capture statuses.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run(browserName, exe, profileBase) {
    console.log(`\n############ ${browserName}: ${exe} ############`);
    const PROFILE = path.join(process.cwd(), 'scratch', `.profile-${browserName}-${Date.now()}`);
    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: exe,
            headless: false,
            userDataDir: PROFILE,
            ignoreDefaultArgs: ['--enable-automation'],
            defaultViewport: null,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--no-first-run', '--no-default-browser-check', '--disable-infobars',
                '--window-size=1600,1000', '--window-position=10,10', '--lang=zh-CN', '--disable-sync',
            ],
        });
    } catch (e) {
        console.log(`launch failed: ${e.message.split('\n')[0]}`);
        return;
    }
    const page = await browser.newPage();
    const res = [];
    page.on('response', async (r) => {
        const u = r.url();
        if (u.startsWith('https://fdc.zjj.sz.gov.cn')) {
            res.push({ st: r.status(), u: u.slice(0, 120) });
        }
    });
    page.on('pageerror', (e) => console.log('[pageerror]', String(e.message).slice(0, 200)));
    page.on('console', (m) => { if (m.type() === 'error') console.log(`[c.error] ${m.text().slice(0, 130)}`); });

    console.log('[+] goto #1');
    await page.goto('https://fdc.zjj.sz.gov.cn/public/marketInfo/housePriceTrendInfo.html', { waitUntil: 'domcontentloaded', timeout: 60000 })
        .catch((e) => console.log('goto1 err', e.message));

    // settle long; watch state
    for (let i = 0; i < 16; i++) {
        await sleep(1500);
        if (i % 4 === 0) {
            try {
                const st = await page.evaluate(() => ({
                    t: document.title, lt: (document.body?.innerText || '').slice(0, 40),
                    wd: navigator.webdriver, ls: Object.keys(localStorage).filter((k) => !/^\d+$/.test(k)),
                }));
                console.log(`[settle ${i}] wd=${st.wd} ls=${JSON.stringify(st.ls)}`);
            } catch (e) {}
        }
    }
    const cookies = await page.cookies().catch(() => []);
    console.log('cookies after settle:', cookies.map((c) => `${c.name}:${c.value.length}B`).join(' '));

    console.log('[+] goto #2 (fresh)');
    await page.goto('https://fdc.zjj.sz.gov.cn/public/marketInfo/housePriceTrendInfo.html', { waitUntil: 'domcontentloaded', timeout: 60000 })
        .catch((e) => console.log('goto2 err', e.message));
    await sleep(7000);

    console.log('[responses]');
    for (const r of res) console.log(`  ${r.st} ${r.u}`);
    await browser.close();
}

await run('chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', '.profile-clean');
try {
    const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    if (fs.existsSync(edge)) await run('edge', edge, '.profile-edge');
} catch (e) { console.log('edge err', e.message); }
console.log('[+] all done');