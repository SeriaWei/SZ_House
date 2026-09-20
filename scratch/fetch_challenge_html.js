// Fetch the 412 challenge page and dump FULL html to see structure: is there a
// click-to-continue / slider / button requiring human interaction?
const https = require('https');
const zlib = require('zlib');

https.get('https://fdc.zjj.sz.gov.cn/public/marketInfo/housePriceTrendInfo.html', {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
}, (res) => {
    console.log('status:', res.statusCode);
    console.log('headers:', JSON.stringify(res.headers));
    const chunks = [];
    res.on('data', (c) => chunks.push(c));
    res.on('end', () => {
        let buf = Buffer.concat(chunks);
        const enc = res.headers['content-encoding'];
        if (enc && enc.includes('gzip')) buf = zlib.gunzipSync(buf);
        const html = buf.toString('utf8');
        console.log('len:', html.length);
        require('fs').writeFileSync('scratch/live_challenge_html.html', html);
        console.log('---BODY START---');
        console.log(html);
        console.log('---BODY END---');
    });
}).on('error', (e) => console.log('err', e.message));