'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DriverTripAliasPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      router.replace(`/trips/${params.id}`);
    } else {
      router.replace('/driver');
    }
  }, [params.id, router]);

  return null;
}
