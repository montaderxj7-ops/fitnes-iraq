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

    if (!coach) {
      return new NextResponse('Not found', { status: 404 });
    }

    const appName = coach.appName && coach.appName !== "Gym System" ? coach.appName : coach.name;
    const primaryColor = coach.primaryColor || '#D6F854';
    
    // Instead of using base64 directly which Google WebAPK generator rejects,
    // we use a dedicated API route that serves the binary image.
    const iconUrl = coach.logo ? `/api/icon/${slug}` : '/favicon.ico';
    let iconType = 'image/png';
    
    // Try to guess the type from the base64 string if available
    if (coach.logo && coach.logo.startsWith('data:image/')) {
      iconType = coach.logo.split(';')[0].split(':')[1];
    }

    const manifest = {
      id: `/${slug}`,
      name: appName,
      short_name: appName,
      description: `التطبيق التدريبي الخاص بـ ${coach.name}`,
      start_url: `/${slug}`,
      display: 'standalone',
      background_color: '#050505',
      theme_color: primaryColor,
      icons: [
        {
          src: iconUrl,
          sizes: '192x192',
          type: iconType,
          purpose: 'any'
        },
        {
          src: iconUrl,
          sizes: '192x192',
          type: iconType,
          purpose: 'maskable'
        },
        {
          src: iconUrl,
          sizes: '512x512',
          type: iconType,
          purpose: 'any'
        },
        {
          src: iconUrl,
          sizes: '512x512',
          type: iconType,
          purpose: 'maskable'
        }
      ]
    };

    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
        // Cache control to allow refreshing if coach changes logo/color
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating manifest:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
