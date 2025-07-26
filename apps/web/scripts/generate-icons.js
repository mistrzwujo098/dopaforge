#!/usr/bin/env node
// Generate PWA icons

const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const publicDir = path.join(__dirname, '..', 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate SVG icons as placeholders
sizes.forEach(size => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="#10b981"/>
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="${size * 0.3}px" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle" 
    dominant-baseline="middle"
  >
    DF
  </text>
</svg>`;

  fs.writeFileSync(path.join(publicDir, `icon-${size}.svg`), svg);
  console.log(`Generated icon-${size}.svg`);
});

// Create a simple screenshot placeholder
const screenshot = `<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1920" fill="#f3f4f6"/>
  <rect x="40" y="40" width="1000" height="200" rx="20" fill="#10b981"/>
  <text 
    x="540" 
    y="140" 
    font-family="Arial, sans-serif" 
    font-size="60px" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle" 
    dominant-baseline="middle"
  >
    DopaForge
  </text>
  <text 
    x="540" 
    y="960" 
    font-family="Arial, sans-serif" 
    font-size="40px" 
    fill="#6b7280" 
    text-anchor="middle" 
    dominant-baseline="middle"
  >
    Transform procrastination into productivity
  </text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'screenshot-1.svg'), screenshot);
console.log('Generated screenshot-1.svg');

console.log('\nNote: These are SVG placeholders. For production, you should:');
console.log('1. Convert these to PNG using a tool like sharp or imagemagick');
console.log('2. Or create proper PNG icons using a design tool');