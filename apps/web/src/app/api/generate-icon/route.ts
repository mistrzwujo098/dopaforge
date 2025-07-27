// path: apps/web/src/app/api/generate-icon/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get('size') || '192';
  const size = parseInt(sizeParam);
  
  // Validate size parameter
  if (isNaN(size) || size < 16 || size > 1024) {
    return new NextResponse('Invalid size parameter. Size must be between 16 and 1024.', { 
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }
  
  // Create a simple icon with DopaForge branding
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
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
    </svg>
  `;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}