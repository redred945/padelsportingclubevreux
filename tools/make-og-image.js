const sharp = require('sharp');
const path = require('path');

const W = 1200, H = 630;
const heroPath = path.join(__dirname, '../assets/img/hero-2400.webp');
const logoPath = path.join(__dirname, '../assets/img/logo.png');
const outPath = path.join(__dirname, '../assets/img/og-image.jpg');

const overlaySvg = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0c0f1f" stop-opacity="0.35"/>
      <stop offset="45%" stop-color="#0c0f1f" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#0c0f1f" stop-opacity="0.92"/>
    </linearGradient>
    <linearGradient id="side" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0c0f1f" stop-opacity="0.55"/>
      <stop offset="45%" stop-color="#0c0f1f" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <rect width="${W}" height="${H}" fill="url(#side)"/>
  <rect x="64" y="440" width="46" height="6" fill="#fae789"/>
  <text x="64" y="512" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="72" fill="#ffffff" letter-spacing="-1">PADEL SPORTING CLUB</text>
  <text x="64" y="560" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="30" fill="#fae789" letter-spacing="4">EVREUX</text>
  <text x="64" y="596" font-family="Arial, Helvetica, sans-serif" font-weight="400" font-size="24" fill="#cfd3ea">11 pistes de padel &#183; 2 terrains de badminton &#183; club-house</text>
</svg>
`);

async function run() {
  const hero = await sharp(heroPath)
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .toBuffer();

  const logo = await sharp(logoPath).resize({ width: 110 }).toBuffer();
  const logoMeta = await sharp(logo).metadata();

  await sharp(hero)
    .composite([
      { input: overlaySvg, top: 0, left: 0 },
      { input: logo, top: 40, left: 64 },
    ])
    .jpeg({ quality: 82 })
    .toFile(outPath);

  console.log('wrote', outPath, `(logo ${logoMeta.width}x${logoMeta.height})`);
}

run().catch(e => { console.error(e); process.exit(1); });
