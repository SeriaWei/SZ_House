// Verify: clean Chrome (zero patches) + custom-date in-page fetch (JSL hook must
// sign it) + also test headless=new mode. Goal: arbitrary date ranges work.
import puppeteer from 'puppeteer-core';
import path from 'path';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run(browserName, exe, headless) {
    console.log(`\n############ ${browserName} headless=${headless} ############`);
    const PROFILE = path.join(process.cwd(), 'scratch', `.profile-${browserName}-${headless}-${Date.now()}`);
    const browser = await puppeteer.launch({
        executablePath: exe,
        headless,
        userDataDir: PROFILE,
        ignoreDefaultArgs: ['--enable-automation'],
        defaultViewport: null,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-first-run', '--no-default-browser-check', '--disable-infobars',
            '--window-size=1600,1000', '--window-position=10,10', '--lang=zh-CN', '--disable-sync',
        ],
    });
    const page = await browser.newPage();
    const res = [];
    page.on('response', async (r) => {
        const u = r.url();
        if (u.startsWith('https://fdc.zjj.sz.gov.cn/api/')) {
            let body = '';
            try { body = (await r.text()).slice(0, 800); } catch (e) {}
            res.push({ st: r.status(), u: u.slice(0, 90), body });
        }
    });
    page.on('pageerror', (e) => console.log('[pageerror]', String(e.message).slice(0, 200)));

    console.log('[+] goto #1 (challenge)');
    await page.goto('https://fdc.zjj.sz.gov.cn/public/marketInfo/housePriceTrendInfo.html', { waitUntil: 'domcontentloaded', timeout: 60000 })
        .catch((e) => console.log('goto1 err', e.message));
    // wait for challenge auto-solve + auto reload to load app
    let ok = false;
    for (let i = 0; i < 20; i++) {
        await sleep(1500);
        try {
            const t = await page.evaluate(() => document.title);
            if (t) { ok = true; console.log(`[+] app loaded after ${(i + 1) * 1.5}s title="${t}"`); break; }
        } catch (e) {}
    }
    if (!ok) {
        console.log('[-] not loaded after 30s, doing fresh goto');
        await page.goto('https://fdc.zjj.sz.gov.cn/public/marketInfo/housePriceTrendInfo.html', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
        await sleep(8000);
        try { const t = await page.evaluate(() => document.title); console.log('[+] title', t); } catch (e) {}
    }

    // in-page custom-date fetch; JSL hook should sign it if cookies valid
    console.log('[+] custom fetch: 2026-08-01..2026-08-31');
    const custom = await page.evaluate(async () => {
        const res = await fetch('https://fdc.zjj.sz.gov.cn/api/marketInfoShow/getFjzsInfoData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: '2026-08-01', endDate: '2026-08-31', dateType: '', _t: Date.now() }),
        });
        return { status: res.status, ok: res.ok, body: (await res.text()).slice(0, 3000) };
    }).catch((e) => ({ status: 'ERR', err: String(e) }));
    console.log('custom:', JSON.stringify(custom).slice(0, 2000));

    await sleep(1500);
    console.log('[api responses]');
    for (const r of res) console.log(`  ${r.st} ${r.u}`);
    await browser.close();
}

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
await run('chrome', CHROME, false);
// headless=new test
try { await run('chrome-headless', CHROME, 'new'); } catch (e) { console.log('headless err', e.message.split('\n')[0]); }
console.log('[+] done');