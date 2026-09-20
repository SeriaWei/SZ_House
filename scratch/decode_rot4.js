// Decode ROT-4 encoded strings in the JSL challenge script
const fs = require('fs');
const src = fs.readFileSync('public-pages/Pe8quxzEGzmH.276d3fc.js', 'utf8');

// ROT-4 decode (only a-z letters, keep others)
function rot4(s) {
    return s.replace(/[a-zA-Z]/g, (ch) => {
        const code = ch.charCodeAt(0);
        const base = code >= 97 ? 97 : 65;
        return String.fromCharCode(((code - base - 4 + 26) % 26) + base);
    });
}

// Extract long runs of printable ASCII containing encoded text
// The _$$Y string pool is a big quoted string. Find quoted strings and decode them.
const quoted = [];
const re = /"((?:[^"\\]|\\.)*)"/g;
let m;
while ((m = re.exec(src)) !== null) {
    const s = m[1];
    if (s.length > 30) quoted.push(s);
}

console.log('=== Quoted strings length > 30:', quoted.length, '===');
quoted.forEach((q, i) => {
    const decoded = rot4(q);
    // Only print if decoded looks like English code
    if (/[a-z]{4,}/.test(decoded.replace(/[^a-z]/g, ' '))) {
        console.log(`--- [${i}] len=${q.length} ---`);
        console.log('RAW    :', q.substring(0, 400));
        console.log('ROT-4  :', decoded.substring(0, 400));
    }
});
