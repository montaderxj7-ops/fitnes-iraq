import React from 'react';
import { ClientAppFlow } from '@/components/client-app/ClientAppFlow';
import { getPublicCoachData } from '@/actions/coach';
import { notFound } from 'next/navigation';

export default async function ClientAppPage({ params }: { params: Promise<{ coachSlug: string }> | { coachSlug: string } }) {
  const resolvedParams = await params;
  const res = await getPublicCoachData(resolvedParams.coachSlug);
  
  if (!res || !res.success || !res.coach) {
    return notFound();
  }

  return (
    <div className="h-screen w-full bg-black">
      <ClientAppFlow coach={res.coach as any} />
    </div>
  );
}
