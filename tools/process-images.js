const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'assets/img/source');
const outDir = path.join(__dirname, 'assets/img');

const jobs = [
  { in: 'hero.jpg', out: 'hero', widths: [900, 1600, 2400], quality: 72 },
  { in: 'terrain-table.jpg', out: 'terrain-table', widths: [900, 1400], quality: 74 },
  { in: 'pizza.jpg', out: 'pizza', widths: [800, 1200], quality: 74 },
  { in: 'croque.jpg', out: 'croque', widths: [800, 1200], quality: 74 },
  { in: 'coach-gautier.jpg', out: 'coach-gautier', widths: [700, 1100], quality: 76 },
  { in: 'buffet-seminaire.jpg', out: 'buffet-seminaire', widths: [900, 1400], quality: 74 },
  { in: 'seminaire-2.jpg', out: 'seminaire-2', widths: [900, 1400], quality: 74 },
  { in: 'terrain-sponsorise.jpg', out: 'terrain-sponsorise', widths: [900, 1400], quality: 74 },
  { in: 'vitre-sponsorisee.jpg', out: 'vitre-sponsorisee', widths: [900, 1400], quality: 74 },
  { in: 'partenariat-auto.jpg', out: 'partenariat-auto', widths: [900, 1400], quality: 74 },
];

async function run() {
  for (const job of jobs) {
    const inputPath = path.join(srcDir, job.in);
    if (!fs.existsSync(inputPath)) { console.log('SKIP missing', job.in); continue; }
    for (const w of job.widths) {
      const outPath = path.join(outDir, `${job.out}-${w}.webp`);
      await sharp(inputPath).resize({ width: w }).webp({ quality: job.quality }).toFile(outPath);
      console.log('wrote', outPath);
    }
  }
  // logo -> png trimmed + webp fallback not needed, keep png but resize
  await sharp(path.join(srcDir, 'logo.png')).resize({ width: 500 }).png({ quality: 90 }).toFile(path.join(outDir, 'logo.png'));
  console.log('wrote logo.png');

  // app screenshot
  await sharp(path.join(srcDir, 'app-screenshot.png')).resize({ width: 700 }).webp({ quality: 80 }).toFile(path.join(outDir, 'app-screenshot.webp'));
  console.log('wrote app-screenshot.webp');

  await sharp(path.join(srcDir, 'badge-apple.png')).resize({ width: 300 }).png().toFile(path.join(outDir, 'badge-apple.png'));
  await sharp(path.join(srcDir, 'badge-google.png')).resize({ width: 300 }).png().toFile(path.join(outDir, 'badge-google.png'));
  console.log('wrote badges');
}

run().catch(e => { console.error(e); process.exit(1); });
