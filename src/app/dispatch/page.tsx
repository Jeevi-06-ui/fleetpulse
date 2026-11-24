'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DispatchAliasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/trips');
  }, [router]);

  return null;
}
