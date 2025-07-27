import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Dynamic params
    const title = searchParams.get('title') || 'DopaForge';
    const description = searchParams.get('description') || 'Twój mózg pokocha być produktywnym';

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(to bottom right, #10b981, #06b6d4)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '60px',
              margin: '40px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h1
              style={{
                fontSize: '60px',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #10b981, #06b6d4)',
                backgroundClip: 'text',
                color: 'transparent',
                margin: '0 0 20px 0',
                textAlign: 'center',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: '24px',
                color: '#6b7280',
                textAlign: 'center',
                maxWidth: '600px',
                margin: '0',
              }}
            >
              {description}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '40px',
                gap: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(to right, #10b981, #06b6d4)',
                  }}
                />
                <span style={{ fontSize: '32px', fontWeight: 'bold' }}>DopaForge</span>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    // Error generating image
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}