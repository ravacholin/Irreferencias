/**
 * Genera los iconos de la PWA con estética fanzine xeroxeado (blanco y negro).
 * Papel claro con marca "I" negra en stencil y marco grueso, como un sello
 * fotocopiado. Ejecutar con: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');

const PAPER = '#f4f1e8';
const INK = '#0a0a0a';

// Franja de medios tonos (halftone) para el borde superior: aire de fotocopia.
const halftone = (size) => {
  const r = Math.max(2, Math.round(size * 0.012));
  const gap = r * 3.4;
  const rowY = Math.round(size * 0.12);
  let dots = '';
  for (let x = gap; x < size - gap / 2; x += gap) {
    dots += `<circle cx="${x.toFixed(1)}" cy="${rowY}" r="${r}" fill="${INK}"/>`;
  }
  return dots;
};

// Icono estándar: papel con marco negro grueso y una "I" central de tóner.
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
  <rect width="${size}" height="${size}" fill="${PAPER}"/>
  <rect x="${inset}" y="${inset}" width="${size - inset * 2}" height="${size - inset * 2}" fill="none" stroke="${INK}" stroke-width="${stroke}"/>
  <rect x="${serifX}" y="${topY}" width="${serifW}" height="${serifH}" fill="${INK}"/>
  <rect x="${barX}" y="${topY}" width="${barW}" height="${bottomY - topY + serifH}" fill="${INK}"/>
  <rect x="${serifX}" y="${bottomY}" width="${serifW}" height="${serifH}" fill="${INK}"/>
</svg>`;
};

// Icono maskable: papel a sangre completa, "I" negra dentro de la zona segura.
const maskableSvg = (size) => {
  const barW = Math.round(size * 0.12);
  const barX = (size - barW) / 2;
  const serifW = Math.round(size * 0.34);
  const serifH = Math.round(size * 0.12);
  const serifX = (size - serifW) / 2;
  const topY = Math.round(size * 0.3);
  const bottomY = size - topY - serifH;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${PAPER}"/>
  ${halftone(size)}
  <rect x="${serifX}" y="${topY}" width="${serifW}" height="${serifH}" fill="${INK}"/>
  <rect x="${barX}" y="${topY}" width="${barW}" height="${bottomY - topY + serifH}" fill="${INK}"/>
  <rect x="${serifX}" y="${bottomY}" width="${serifW}" height="${serifH}" fill="${INK}"/>
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
