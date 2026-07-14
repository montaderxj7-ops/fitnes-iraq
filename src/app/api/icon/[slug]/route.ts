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

    if (iconUrl.startsWith('data:image/')) {
      const parts = iconUrl.split(',');
      const meta = parts[0];
      const base64Data = parts[1];
      const mimeType = meta.split(':')[1].split(';')[0];
      
      const buffer = Buffer.from(base64Data, 'base64');
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      });
    }

    // If it's a regular URL, just redirect to it
    return NextResponse.redirect(iconUrl);
    
  } catch (error) {
    console.error('Error serving icon:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
