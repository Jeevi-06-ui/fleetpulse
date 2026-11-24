'use client';

import React from 'react';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';
import { Card } from '@/components/ui/Card';
import {
  Truck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Percent,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export const KpiStrip: React.FC = () => {
  const { state } = useFleet();
  const m = state.metrics;

  const cards = [
    {
      title: 'Total Fleet Assets',
      value: m.totalFleet,
      subValue: `${m.activeFleet} operational (${m.inactiveVehicles} decommissioned)`,
      icon: Truck,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: '/vehicles',
    },
    {
      title: 'Fleet Utilization',
      value: `${m.fleetUtilizationPct}%`,
      subValue: `${m.inTransitVehicles} vehicles in transit`,
      icon: Percent,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      href: '/tracking',
    },
    {
      title: 'Available for Dispatch',
      value: m.availableVehicles,
      subValue: `${m.assignedVehicles} queued on schedule`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      href: '/vehicles?status=available',
    },
    {
      title: 'Maintenance & Service',
      value: m.maintenanceVehicles,
      subValue: `${m.overdueMaintenanceCount} overdue inspections`,
      icon: Wrench,
      color: m.overdueMaintenanceCount > 0 ? 'text-amber-500' : 'text-slate-400',
      bgColor: m.overdueMaintenanceCount > 0 ? 'bg-amber-500/10' : 'bg-slate-500/10',
      href: '/maintenance',
    },
    {
      title: 'Trip Completion Rate',
      value: `${m.tripCompletionRatePct}%`,
      subValue: `${m.completedTrips} of ${m.totalTrips - m.cancelledTrips} eligible trips`,
      icon: Activity,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      href: '/trips?status=completed',
    },
    {
      title: 'Open Safety Defects',
      value: m.activeDefectsCount,
      subValue: `${m.criticalDefectsCount} critical grounding issues`,
      icon: AlertTriangle,
      color: m.criticalDefectsCount > 0 ? 'text-rose-500' : 'text-slate-400',
      bgColor: m.criticalDefectsCount > 0 ? 'bg-rose-500/10' : 'bg-slate-500/10',
      href: '/inspections',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Link key={i} href={card.href} className="group">
            <Card
              hoverable
              className="p-3.5 h-full flex flex-col justify-between transition-all group-hover:border-slate-400 dark:group-hover:border-fleet-primary/60"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                    {card.title}
                  </span>
                  <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                  {card.value}
                </div>
              </div>
              <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-fleet-border-dark/50">
                <span className="truncate">{card.subValue}</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-fleet-primary transition-colors flex-shrink-0" />
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};
