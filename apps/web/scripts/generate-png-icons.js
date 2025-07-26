#!/usr/bin/env node
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Create icons
const sizes = [192, 512];

async function generateIcons() {
  for (const size of sizes) {
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

    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(publicDir, `icon-${size}.png`));
    
    console.log(`Generated icon-${size}.png`);
  }

  // Create screenshot
  const screenshotSvg = `<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
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

  await sharp(Buffer.from(screenshotSvg))
    .png()
    .toFile(path.join(publicDir, 'screenshot-1.png'));
  
  console.log('Generated screenshot-1.png');
}

generateIcons().catch(console.error);