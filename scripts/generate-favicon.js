#!/usr/bin/env node
/**
 * Converts assets/images/tiger-paw.svg to favicon.png and icon.png for Expo.
 * Run before `expo export -p web` (or use `npm run build` which runs this first).
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'assets', 'images');
const svgPath = path.join(dir, 'tiger-paw.svg');
const faviconPath = path.join(dir, 'favicon.png');
const iconPath = path.join(dir, 'icon.png');
const splashPath = path.join(dir, 'splash-icon.png');

if (!fs.existsSync(svgPath)) {
  console.warn('scripts/generate-favicon.js: tiger-paw.svg not found, skipping.');
  process.exit(0);
}

let sharp;
try {
  sharp = require('sharp');
} catch (_) {
  console.warn('scripts/generate-favicon.js: sharp not installed. Run: npm install --save-dev sharp');
  console.warn('Favicon/icon PNGs will not be generated. Using SVG only.');
  process.exit(0);
}

const svg = fs.readFileSync(svgPath);

Promise.all([
  sharp(svg).resize(48, 48).png().toFile(faviconPath),
  sharp(svg).resize(1024, 1024).png().toFile(iconPath),
  sharp(svg).resize(200, 200).png().toFile(splashPath),
])
  .then(() => {
    console.log('Generated favicon.png, icon.png, splash-icon.png from tiger-paw.svg');
  })
  .catch((err) => {
    console.error('generate-favicon.js error:', err);
    process.exit(1);
  });
