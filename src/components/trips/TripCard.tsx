'use client';

import React from 'react';
import Link from 'next/link';
import { Trip, Vehicle, Driver } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Calendar, Clock, Truck, User, ArrowRight } from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  vehicle?: Vehicle;
  driver?: Driver;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, vehicle, driver }) => {
  return (
    <Card hoverable className="p-4 flex flex-col justify-between space-y-3">
      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-xs text-fleet-primary">
            {trip.tripNumber}
          </span>
          <Badge variant={trip.status as any} size="sm">
            {trip.status}
          </Badge>
        </div>

        <div className="mt-2 space-y-1">
          <div className="flex items-start gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
            <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
            <span className="truncate">{trip.origin.name}</span>
          </div>
          <div className="pl-5 text-slate-400 text-[10px]">↓ {trip.distanceKm} km transit</div>
          <div className="flex items-start gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
            <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
            <span className="truncate">{trip.destination.name}</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-fleet-border-dark space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Truck className="w-3 h-3 text-slate-400" />
            <span className="font-mono">{vehicle?.registration || trip.vehicleId}</span>
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            <span>{driver?.name || trip.driverId}</span>
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 text-[10px]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>
              {new Date(trip.scheduledStart).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </span>
          <Link
            href={`/trips/${trip.id}`}
            className="text-fleet-primary hover:underline font-semibold flex items-center gap-0.5"
          >
            Details <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
