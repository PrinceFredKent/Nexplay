import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="luminaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="50%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e11d48" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#090a0f" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="110" fill="#090a0f"/>
  <circle cx="256" cy="256" r="220" fill="url(#glow)"/>
  <rect x="24" y="24" width="464" height="464" rx="90" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="4"/>
  <!-- Cinematic Play & Prism Motif -->
  <path d="M190 140 L370 256 L190 372 Z" fill="url(#luminaGrad)"/>
  <path d="M225 185 L325 256 L225 327 Z" fill="#ffffff" fill-opacity="0.3"/>
</svg>`;

// Maskable icon with 15% safe margin so Android circular/squircle cropping never cuts off the logo
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="luminaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="50%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e11d48" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#090a0f" stop-opacity="0" />
    </radialGradient>
  </defs>
  <!-- Full-bleed background for maskable icon -->
  <rect width="512" height="512" fill="#090a0f"/>
  <circle cx="256" cy="256" r="210" fill="url(#glow)"/>
  
  <!-- Scaled down to safe zone (80% diameter) -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <path d="M190 140 L370 256 L190 372 Z" fill="url(#luminaGrad)"/>
    <path d="M225 185 L325 256 L225 327 Z" fill="#ffffff" fill-opacity="0.3"/>
  </g>
</svg>`;

async function generate() {
  const publicDir = path.resolve(process.cwd(), 'public');

  // Save clean standard SVG
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvg);

  // 1. Generate 192x192 PNG (image/png)
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✅ Generated public/pwa-192x192.png (192x192 PNG)');

  // 2. Generate 512x512 PNG (image/png)
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✅ Generated public/pwa-512x512.png (512x512 PNG)');

  // 3. Generate 512x512 Maskable PNG (image/png)
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✅ Generated public/pwa-maskable-512x512.png (512x512 Maskable PNG)');

  // 4. Generate 180x180 Apple Touch Icon (image/png)
  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅ Generated public/apple-touch-icon.png (180x180 PNG)');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
