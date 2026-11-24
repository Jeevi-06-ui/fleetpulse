'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-fleet-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-mono">Initializing FleetPulse Command Center...</span>
      </div>
    </div>
  );
}
