const fs = require('fs');
const path = require('path');
const https = require('https');

const cssPath = path.join(__dirname, 'assets/fonts/fonts.css');
const raw = fs.readFileSync(cssPath, 'utf8');

// Split into blocks separated by comments like /* latin */
const blocks = raw.split(/\/\*\s*([\w-]+)\s*\*\//g).slice(1); // [label, css, label, css, ...]
const latinBlocks = [];
for (let i = 0; i < blocks.length; i += 2) {
  const label = blocks[i];
  const css = blocks[i + 1];
  if (label === 'latin') latinBlocks.push(css.trim());
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode + ' ' + url));
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function run() {
  let outCss = '';
  let n = 0;
  for (const block of latinBlocks) {
    const familyMatch = block.match(/font-family:\s*'([^']+)'/);
    const weightMatch = block.match(/font-weight:\s*(\d+)/);
    const urlMatch = block.match(/url\(([^)]+)\)/);
    if (!familyMatch || !urlMatch) continue;
    const family = familyMatch[1];
    const weight = weightMatch ? weightMatch[1] : '400';
    const slug = family.toLowerCase().replace(/\s+/g, '-');
    const filename = `${slug}-${weight}-latin.woff2`;
    const dest = path.join(__dirname, 'assets/fonts', filename);
    await download(urlMatch[1], dest);
    console.log('downloaded', filename);
    outCss += `@font-face {\n  font-family: '${family}';\n  font-style: normal;\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('${filename}') format('woff2');\n  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2122, U+2212, U+FEFF, U+FFFD;\n}\n\n`;
    n++;
  }
  fs.writeFileSync(path.join(__dirname, 'assets/fonts/fonts-local.css'), outCss);
  console.log('Done,', n, 'fonts written to fonts-local.css');
}

run().catch(e => { console.error(e); process.exit(1); });
