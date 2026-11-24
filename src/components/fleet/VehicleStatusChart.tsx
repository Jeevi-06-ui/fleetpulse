'use client';

import React from 'react';
import { useFleet } from '@/context/FleetContext';
import { Card } from '@/components/ui/Card';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';

export const VehicleStatusChart: React.FC = () => {
  const { state } = useFleet();
  const m = state.metrics;

  const statusData = [
    { name: 'Available', value: m.availableVehicles, color: '#10B981' },
    { name: 'In Transit', value: m.inTransitVehicles, color: '#13C8C1' },
    { name: 'Assigned', value: m.assignedVehicles, color: '#3B82F6' },
    { name: 'Maintenance', value: m.maintenanceVehicles, color: '#F59E0B' },
    { name: 'Inactive', value: m.inactiveVehicles, color: '#64748B' },
  ];

  // Category distribution
  const categoryCounts = state.vehicles.reduce((acc, v) => {
    acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCounts).map(([cat, count]) => ({
    category: cat.replace('Truck', 'Trk').replace('Commercial', 'Comm'),
    count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Fleet Status Donut */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Fleet Operational Readiness
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current real-time asset deployment status
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-fleet-primary bg-fleet-primary/10 px-2 py-0.5 rounded">
            {m.activeFleet} Active Units
          </span>
        </div>

        <div className="h-52 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#071525',
                  borderColor: '#1E3A5F',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 dark:border-fleet-border-dark text-[11px]">
          {statusData.map((s) => (
            <div key={s.name} className="flex flex-col items-center text-center">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Category Breakdown Bar */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Fleet Asset Distribution by Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tonnage and powertrain classification breakdown
            </p>
          </div>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 15, right: 10, left: -20, bottom: 25 }}>
              <XAxis
                dataKey="category"
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#071525',
                  borderColor: '#1E3A5F',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="count" fill="#4169E1" radius={[4, 4, 0, 0]} name="Vehicles" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-fleet-border-dark flex justify-between">
          <span>Electric Fleet Transition: 3 EV Units (15%)</span>
          <span className="font-mono">Clean Energy Initiative</span>
        </div>
      </Card>
    </div>
  );
};
