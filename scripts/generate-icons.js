// Script pour générer les icônes PWA programmatiquement
// À exécuter: node scripts/generate-icons.js
const fs = require('fs');
const path = require('path');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

function generateSVGIcon(size) {
  const center = size / 2;
  const hex = size * 0.42;
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 30) * Math.PI / 180;
    return `${center + hex * Math.cos(angle)},${center + hex * Math.sin(angle)}`;
  }).join(' ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <polygon points="${points}" fill="#7c3aed" opacity="0.8"/>
  <polygon points="${points}" fill="none" stroke="#06b6d4" stroke-width="${size * 0.02}"/>
  <text x="${center}" y="${center + size * 0.08}" text-anchor="middle"
    font-size="${size * 0.28}" fill="#ffffff" font-family="monospace" font-weight="bold">S</text>
</svg>`;
}

for (const size of SIZES) {
  const svgContent = generateSVGIcon(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svgContent);
  // Pour PNG réel, utiliser sharp ou canvas en production
  // Ici on crée des SVG valides
  console.log(`Generated icon-${size}x${size}.svg`);
}

// Apple touch icon
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), generateSVGIcon(180));
fs.writeFileSync(path.join(iconsDir, 'favicon-32x32.svg'), generateSVGIcon(32));

console.log('Icons generated in public/icons/');
