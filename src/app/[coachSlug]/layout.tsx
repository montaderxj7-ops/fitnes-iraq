import React, { Suspense } from 'react';
import { PwaInstaller } from '@/components/client-app/PwaInstaller';
import { getPublicCoachData } from '@/actions/coach';

export default async function CoachLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ coachSlug: string }> | { coachSlug: string };
}) {
  const resolvedParams = await params;
  const res = await getPublicCoachData(resolvedParams.coachSlug);
  
  // Provide safe defaults if fetching fails
  const coachName = res?.coach?.name || 'التطبيق الرياضي';
  const coachLogo = res?.coach?.logo || null;
  const primaryColor = res?.coach?.primaryColor || '#D6F854';

  return (
    <>
      <head>
        <link rel="manifest" href={`/api/manifest/${resolvedParams.coachSlug}`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
      {/* We wrapper the children here, and add the PwaInstaller component */}
      <Suspense fallback={null}>
        <PwaInstaller coachName={coachName} coachLogo={coachLogo} primaryColor={primaryColor} coachSlug={resolvedParams.coachSlug} />
      </Suspense>
      {children}
    </>
  );
}
