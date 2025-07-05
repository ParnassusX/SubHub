/**
 * PWA Icon Generation Script
 * This script creates proper PWA icons from the existing SVG icon
 * Run with: node generate-pwa-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple SVG to create basic PWA icons
const createBasicIcon = (size, filename) => {
  const svgContent = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1e40af" rx="${size * 0.1}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" 
        fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">S</text>
</svg>`;

  fs.writeFileSync(path.join(__dirname, 'public', filename), svgContent);
  console.log(`Created ${filename} (${size}x${size})`);
};

// Create basic SVG icons for PWA
console.log('Generating PWA icons...');

// Create icon.svg (main icon)
createBasicIcon(512, 'icon.svg');

// Create masked-icon.svg (maskable icon with padding)
const maskedIconContent = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#1e40af"/>
  <circle cx="256" cy="256" r="180" fill="white" opacity="0.1"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="200" 
        fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">S</text>
</svg>`;

fs.writeFileSync(path.join(__dirname, 'public', 'masked-icon.svg'), maskedIconContent);
console.log('Created masked-icon.svg (512x512)');

// Create favicon.svg
createBasicIcon(32, 'favicon.svg');

// Create a simple PNG placeholder for apple-touch-icon
const appleTouchIconContent = `
<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" fill="#1e40af" rx="18"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="80" 
        fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">S</text>
</svg>`;

fs.writeFileSync(path.join(__dirname, 'public', 'apple-touch-icon.svg'), appleTouchIconContent);
console.log('Created apple-touch-icon.svg (180x180)');

// Update the PNG placeholders with proper content
const pngPlaceholderContent = `<!-- PWA Icon Placeholder -->
<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#1e40af" rx="19"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="80" 
        fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">S</text>
</svg>`;

fs.writeFileSync(path.join(__dirname, 'public', 'icon-192x192.svg'), pngPlaceholderContent);
console.log('Created icon-192x192.svg (192x192)');

console.log('\n✅ PWA icons generated successfully!');
console.log('Note: For production, convert SVG icons to PNG format for better compatibility.');
console.log('You can use online tools or imagemagick: convert icon.svg icon.png');
