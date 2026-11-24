'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { VehicleTable } from '@/components/fleet/VehicleTable';
import { AddVehicleModal } from '@/components/fleet/AddVehicleModal';
import { Truck } from 'lucide-react';

function VehiclesContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-fleet-primary" />
            Fleet Vehicle Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, inspect, and register transport assets across heavy, medium, and EV categories.
          </p>
        </div>
      </div>

      <VehicleTable
        onRegisterClick={() => setAddModalOpen(true)}
        initialStatusFilter={initialStatus}
      />

      <AddVehicleModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading vehicles registry...</div>}>
      <VehiclesContent />
    </Suspense>
  );
}
