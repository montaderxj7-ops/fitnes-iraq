import React from 'react';
import { ClientAppFlow } from '@/components/client-app/ClientAppFlow';
import { getPublicCoachData } from '@/actions/coach';
import { notFound } from 'next/navigation';

export default async function ClientAppPage({ params }: { params: { coachSlug: string } }) {
  const res = await getPublicCoachData(params.coachSlug);
  
  if (!res || !res.success || !res.coach) {
    return notFound();
  }

  return (
    <div className="h-screen w-full bg-black">
      <ClientAppFlow coach={res.coach as any} />
    </div>
  );
}
