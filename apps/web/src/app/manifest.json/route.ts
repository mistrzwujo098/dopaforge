import { NextResponse } from 'next/server';
import manifestJson from '../../../public/manifest.json';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(manifestJson, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=604800, immutable',
    },
  });
}