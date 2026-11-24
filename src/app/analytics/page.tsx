'use client';

import React, { useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Activity, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const { state } = useFleet();
  const m = state.metrics;

  // Monthly trends calculated from deterministic seed data
  const monthlyFleetPerformance = [
    { month: 'Jun', trips: 28, completionRate: 96.4, maintenanceCost: 45000 },
    { month: 'Jul', trips: 32, completionRate: 93.8, maintenanceCost: 52000 },
    { month: 'Aug', trips: 35, completionRate: 97.1, maintenanceCost: 38000 },
    { month: 'Sep', trips: 40, completionRate: 95.0, maintenanceCost: 61000 },
    { month: 'Oct', trips: 42, completionRate: 97.6, maintenanceCost: 48000 },
    { month: 'Nov', trips: m.totalTrips, completionRate: m.tripCompletionRatePct, maintenanceCost: m.totalMaintenanceCostYTD },
  ];

  const categoryTonnageData = [
    { category: 'Heavy Duty', count: 7, avgOdo: 122000, capacity: 28000 },
    { category: 'Medium Freight', count: 5, avgOdo: 68000, capacity: 13500 },
    { category: 'Light Comm', count: 4, avgOdo: 41000, capacity: 5400 },
    { category: 'Electric EV', count: 3, avgOdo: 19400, capacity: 1500 },
    { category: 'Refrigerated', count: 2, avgOdo: 74600, capacity: 14500 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-fleet-primary" />
          Fleet Analytics & Telematics Engine
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Derived key performance indicators, asset utilization rate, downtime analysis, and YTD maintenance expenditure.
        </p>
      </div>

      {/* Formula Documentation Card */}
      <Card className="p-4 bg-slate-900 border-slate-800 text-slate-300 text-xs">
        <h3 className="font-mono text-teal-400 font-bold uppercase text-[11px] mb-2">
          Mathematical KPI Formula Definitions & Denominators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] leading-relaxed">
          <div>
            <strong className="text-white">Fleet Utilization (%):</strong>
            <p className="text-slate-400 font-mono mt-0.5">
              (In-Transit Vehicles / Active Fleet) × 100
            </p>
            <p className="text-slate-500 text-[10px] mt-0.5">
              Denominator excludes permanently decommissioned/inactive assets.
            </p>
          </div>
          <div>
            <strong className="text-white">Trip Completion Rate (%):</strong>
            <p className="text-slate-400 font-mono mt-0.5">
              (Completed Trips / [Total Trips - Cancelled]) × 100
            </p>
            <p className="text-slate-500 text-[10px] mt-0.5">
              Denominator includes only scheduled, in-transit, and completed trips.
            </p>
          </div>
          <div>
            <strong className="text-white">Maintenance Cost Basis:</strong>
            <p className="text-slate-400 font-mono mt-0.5">
              Sum(Actual Costs) + Sum(Estimated for uncompleted)
            </p>
            <p className="text-slate-500 text-[10px] mt-0.5">
              Stated in Indian Rupees (₹ INR), metric units in km.
            </p>
          </div>
        </div>
      </Card>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trip Volume & Completion Rate Trend */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Trip Delivery Efficiency & Volume
              </h3>
              <p className="text-xs text-slate-500">Monthly completed consignments vs completion rate</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyFleetPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#071525',
                    borderColor: '#1E3A5F',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="completionRate"
                  name="Completion %"
                  stroke="#13C8C1"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="trips"
                  name="Total Trips"
                  stroke="#4169E1"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Maintenance Expenditure Trend */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Workshop & Maintenance Expenditure (₹ INR)
              </h3>
              <p className="text-xs text-slate-500">Monthly actual recorded maintenance spend</p>
            </div>
            <span className="font-mono text-xs font-bold text-amber-500">
              ₹{m.totalMaintenanceCostYTD.toLocaleString('en-IN')} YTD
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFleetPerformance} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Cost']}
                  contentStyle={{
                    backgroundColor: '#071525',
                    borderColor: '#1E3A5F',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="maintenanceCost" name="Maintenance Spend" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
