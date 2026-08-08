/**
 * Genera los iconos de la PWA con estética brutalista (negro/blanco).
 * Ejecutar con: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');

// Icono estándar: marco blanco grueso sobre fondo negro con una "I" central.
const standardSvg = (size) => {
  const stroke = Math.round(size * 0.06);
  const inset = Math.round(size * 0.1);
  const barW = Math.round(size * 0.14);
  const barX = (size - barW) / 2;
  const serifW = Math.round(size * 0.4);
  const serifH = Math.round(size * 0.14);
  const serifX = (size - serifW) / 2;
  const topY = Math.round(size * 0.24);
  const bottomY = size - topY - serifH;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <rect x="${inset}" y="${inset}" width="${size - inset * 2}" height="${size - inset * 2}" fill="none" stroke="#ffffff" stroke-width="${stroke}"/>
  <rect x="${serifX}" y="${topY}" width="${serifW}" height="${serifH}" fill="#ffffff"/>
  <rect x="${barX}" y="${topY}" width="${barW}" height="${bottomY - topY + serifH}" fill="#ffffff"/>
  <rect x="${serifX}" y="${bottomY}" width="${serifW}" height="${serifH}" fill="#ffffff"/>
</svg>`;
};

// Icono maskable: fondo negro a sangre completa, "I" dentro de la zona segura (80%).
const maskableSvg = (size) => {
  const barW = Math.round(size * 0.12);
  const barX = (size - barW) / 2;
  const serifW = Math.round(size * 0.34);
  const serifH = Math.round(size * 0.12);
  const serifX = (size - serifW) / 2;
  const topY = Math.round(size * 0.3);
  const bottomY = size - topY - serifH;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <rect x="${serifX}" y="${topY}" width="${serifW}" height="${serifH}" fill="#ffffff"/>
  <rect x="${barX}" y="${topY}" width="${barW}" height="${bottomY - topY + serifH}" fill="#ffffff"/>
  <rect x="${serifX}" y="${bottomY}" width="${serifW}" height="${serifH}" fill="#ffffff"/>
</svg>`;
};

async function render(svg, size, file) {
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(publicDir, file));
  console.log('wrote', file);
}

await render(standardSvg(192), 192, 'pwa-192x192.png');
await render(standardSvg(512), 512, 'pwa-512x512.png');
await render(maskableSvg(512), 512, 'pwa-maskable-512x512.png');
await render(standardSvg(180), 180, 'apple-touch-icon.png');
await render(standardSvg(64), 64, 'favicon-64x64.png');

// SVG suelto para el <link rel="icon"> escalable.
const fs = await import('fs');
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), standardSvg(512));
console.log('wrote favicon.svg');
