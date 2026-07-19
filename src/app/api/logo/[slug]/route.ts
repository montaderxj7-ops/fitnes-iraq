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

    if (coach.logo.startsWith('data:image')) {
      const parts = coach.logo.split(',');
      const contentType = parts[0].split(':')[1].split(';')[0];
      const base64Data = parts[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
        },
      });
    }

    // If it's already a URL, redirect to it
    return NextResponse.redirect(coach.logo);
    
  } catch (error) {
    console.error('Error serving logo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
