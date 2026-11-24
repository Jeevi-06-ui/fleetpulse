'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminVehiclesAliasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/vehicles');
  }, [router]);

  return null;
}
