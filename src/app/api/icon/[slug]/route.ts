import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await params;
    const slug = decodeURIComponent(resolvedParams.slug);
    const coach = await prisma.coachProfile.findUnique({
      where: { slug }
    });

    if (!coach || !coach.logo) {
      return new NextResponse('Not found', { status: 404 });
    }

    const iconUrl = coach.logo;

    // To guarantee that Android WebAPK generation accepts the image,
    // we MUST provide a perfectly square image (e.g., 512x512).
    // The easiest way to ensure this without an image processing library is 
    // to wrap their base64 image inside a perfectly square SVG container.
    const primaryColor = coach.primaryColor || '#D6F854';
    
    const svgContent = `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="${primaryColor}" />
        <image href="${iconUrl}" width="512" height="512" preserveAspectRatio="xMidYMid slice" />
      </svg>
    `.trim();

    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
    
  } catch (error) {
    console.error('Error serving icon:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
