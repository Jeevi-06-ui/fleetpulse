'use client';

import React, { useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { Driver } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, Search, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';

export default function AdminDriversPage() {
  const { state } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrivers = state.drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.contactNumber.includes(searchTerm) ||
      d.licenseCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-fleet-primary" />
            Commercial Driver Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personnel profiles, licensing categories, compliance expiry, and trip performance metrics.
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search driver name or phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => {
          const isAssigned = state.vehicles.some((v) => v.assignedDriverId === driver.id);
          const currentVehicle = state.vehicles.find((v) => v.assignedDriverId === driver.id);

          return (
            <Card key={driver.id} className="p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-fleet-navy-800 text-fleet-primary flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-fleet-border-dark">
                      {driver.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {driver.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {driver.licenseCategory}
                      </p>
                    </div>
                  </div>
                  <Badge variant={driver.status as any} size="sm">
                    {driver.status}
                  </Badge>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-fleet-border-dark/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>License No:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {driver.licenseNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>License Expiry:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {driver.licenseExpiry}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Experience:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {driver.experienceYears} Years
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Completed Trips:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {driver.totalTripsCompleted}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-fleet-border-dark/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Rating: ★ {driver.rating}</span>
                {currentVehicle ? (
                  <span className="font-mono text-fleet-primary font-semibold">
                    Steering: {currentVehicle.registration}
                  </span>
                ) : (
                  <span className="text-slate-400">Unassigned</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
