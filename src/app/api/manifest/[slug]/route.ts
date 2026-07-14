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

    const appName = coach.appName || coach.name;
    const primaryColor = coach.primaryColor || '#D6F854';
    // Use coach.logo if available, otherwise a default gym icon
    const iconUrl = coach.logo && coach.logo.startsWith('http') ? coach.logo : '/favicon.ico';

    const manifest = {
      name: appName,
      short_name: coach.name,
      description: `التطبيق التدريبي الخاص بـ ${coach.name}`,
      start_url: `/${slug}`,
      display: 'standalone',
      background_color: '#050505',
      theme_color: primaryColor,
      icons: [
        {
          src: iconUrl,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: iconUrl,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
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
