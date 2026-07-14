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
    
    // We use a dedicated API route that serves a perfectly square SVG wrapper
    // around the coach's logo to guarantee WebAPK generation works.
    const iconUrl = coach.logo ? `/api/icon/${slug}` : '/favicon.ico';
    const iconType = coach.logo ? 'image/svg+xml' : 'image/x-icon';

    const manifest = {
      id: `/${slug}`,
      name: appName,
      short_name: appName,
      description: `التطبيق التدريبي الخاص بـ ${coach.name}`,
      start_url: `/${slug}`,
      scope: '/',
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
        // Disable caching so Chrome always fetches the latest appName and logo
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error generating manifest:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
