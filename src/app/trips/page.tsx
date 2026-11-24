'use client';

import React from 'react';
import { TripTable } from '@/components/trips/TripTable';
import { Send } from 'lucide-react';

export default function TripsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-6 h-6 text-fleet-primary" />
            Freight Trips & Dispatch Central
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage scheduled consignments, in-transit convoys, past deliveries, and route assignments.
          </p>
        </div>
      </div>

      <TripTable />
    </div>
  );
}
