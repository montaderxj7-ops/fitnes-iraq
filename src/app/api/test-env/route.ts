import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasVapidPublic: !!process.env.VAPID_PUBLIC_KEY,
    hasVapidPrivate: !!process.env.VAPID_PRIVATE_KEY,
    hasNextPublicVapid: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });
}
