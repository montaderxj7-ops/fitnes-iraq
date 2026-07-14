import React, { Suspense } from 'react';
import { PwaInstaller } from '@/components/client-app/PwaInstaller';

export default async function CoachLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ coachSlug: string }> | { coachSlug: string };
}) {
  const resolvedParams = await params;
  return (
    <>
      <head>
        <link rel="manifest" href={`/api/manifest/${resolvedParams.coachSlug}`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
      {/* We wrapper the children here, and add the PwaInstaller component */}
      <Suspense fallback={null}>
        <PwaInstaller />
      </Suspense>
      {children}
    </>
  );
}
