'use client';

import React, { useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { FuelLog } from '@/types';
import { calculateFleetEsgMetrics, checkFuelAnomaly } from '@/lib/domain/fuel';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Fuel,
  Zap,
  Leaf,
  IndianRupee,
  Plus,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function FuelAnalyticsPage() {
  const { state, dispatch } = useFleet();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const esgMetrics = calculateFleetEsgMetrics(state.vehicles, state.fuelLogs);

  // Form State
  const [vehicleId, setVehicleId] = useState(state.vehicles[0]?.id || '');
  const [fuelType, setFuelType] = useState<FuelLog['fuelType']>('Diesel');
  const [quantityLiters, setQuantityLiters] = useState<number>(45);
  const [costInr, setCostInr] = useState<number>(4100);
  const [odometerKm, setOdometerKm] = useState<number>(25000);
  const [stationName, setStationName] = useState('Indian Oil Fleet Depot #14');

  const handleVehicleSelect = (id: string) => {
    setVehicleId(id);
    const v = state.vehicles.find((veh) => veh.id === id);
    if (v) {
      setOdometerKm(v.odometerKm + 150);
      if (v.fuelType === 'Electric') {
        setFuelType('Electric');
        setQuantityLiters(60);
        setCostInr(540);
        setStationName('Tata Power EZ Charge Terminal');
      } else if (v.fuelType === 'CNG') {
        setFuelType('CNG');
        setQuantityLiters(40);
        setCostInr(3400);
        setStationName('GAIL Gas Peenya Station');
      } else {
        setFuelType('Diesel');
        setQuantityLiters(50);
        setCostInr(4500);
        setStationName('Bharat Petroleum Fleet Hub');
      }
    }
  };

  const handleCreateFuelLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: FuelLog = {
      id: `fuel-${Date.now()}`,
      vehicleId,
      date: new Date().toISOString(),
      fuelType,
      quantityLiters: Number(quantityLiters),
      costInr: Number(costInr),
      odometerKm: Number(odometerKm),
      stationName: stationName.trim(),
    };

    dispatch({
      type: 'ADD_FUEL_LOG',
      payload: newLog,
    });

    setIsAddModalOpen(false);
  };

  const filteredLogs = state.fuelLogs.filter((log) => {
    if (filterType === 'all') return true;
    return log.fuelType === filterType;
  });

  // Prepare chart data grouped by vehicle model / registration
  const chartData = state.vehicles.slice(0, 8).map((v) => {
    const logs = state.fuelLogs.filter((l) => l.vehicleId === v.id);
    const totalCost = logs.reduce((acc, l) => acc + l.costInr, 0);
    const totalQty = logs.reduce((acc, l) => acc + l.quantityLiters, 0);

    return {
      registration: v.registration.split('-')[3] || v.registration,
      spend: totalCost,
      quantity: totalQty,
      category: v.category,
    };
  });

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Fuel className="w-6 h-6 text-fleet-primary" />
            Fuel Economy & ESG Carbon Emission Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track hydrocarbon fuel consumption, EV charging kilowatt-hours, operating costs, and carbon offset milestones.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Record Fuel / EV Charge
        </Button>
      </div>

      {/* ESG & Fuel Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Fuel Expenditure</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            ₹{esgMetrics.totalFuelSpentInr.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>Aggregated across all fleet dispatches</span>
          </div>
        </Card>

        {/* Total Fuel Consumed */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Hydrocarbon Consumed</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {esgMetrics.totalDieselLitersConsumed.toLocaleString('en-IN')} L
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Diesel fuel consumed by heavy & medium trucks
          </div>
        </Card>

        {/* Fleet Economy */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Fleet Avg Economy</span>
            <div className="p-2 rounded-lg bg-fleet-primary/10 text-fleet-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {esgMetrics.averageFleetKmpl} km/L
          </div>
          <div className="text-[11px] text-emerald-500 flex items-center gap-1">
            <span>Optimal highway operational efficiency</span>
          </div>
        </Card>

        {/* ESG Carbon Offset */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Clean Energy CO₂ Avoided</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-teal-400 font-mono">
            {esgMetrics.co2SavedByEvFleetKg} kg CO₂
          </div>
          <div className="text-[11px] text-teal-500/90 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{esgMetrics.totalElectricityKwhConsumed} kWh green EV energy deployed</span>
          </div>
        </Card>
      </div>

      {/* Spend & Energy Distribution Chart */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Fuel & Charging Cost Breakdown by Vehicle Asset
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparative expenditure (₹) across sampled commercial freight carriers.
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="registration" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#FFFFFF',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="spend" name="Spend (₹)" fill="#13C8C1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Fuel Transactions Ledger */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Fuel className="w-4 h-4 text-fleet-primary" />
            Fuel & Charging Transaction Logs ({filteredLogs.length})
          </h2>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-white dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Energy Types</option>
            <option value="Diesel">Diesel Fuel</option>
            <option value="Electric">Electric EV (kWh)</option>
            <option value="CNG">CNG Gas</option>
          </select>
        </div>

        <Card className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-fleet-navy-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-fleet-border-dark">
              <tr>
                <th className="py-2.5 px-4">Date & Time</th>
                <th className="py-2.5 px-4">Vehicle</th>
                <th className="py-2.5 px-4">Energy Type</th>
                <th className="py-2.5 px-4">Quantity</th>
                <th className="py-2.5 px-4">Total Amount (₹)</th>
                <th className="py-2.5 px-4">Odometer</th>
                <th className="py-2.5 px-4">Terminal / Vendor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-fleet-border-dark/60">
              {filteredLogs.map((log) => {
                const vehicle = state.vehicles.find((v) => v.id === log.vehicleId);

                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-fleet-navy-800/40">
                    <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {new Date(log.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {vehicle?.registration || log.vehicleId}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          log.fuelType === 'Electric'
                            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {log.fuelType === 'Electric' ? 'EV Battery' : log.fuelType}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-900 dark:text-white font-semibold">
                      {log.quantityLiters} {log.fuelType === 'Electric' ? 'kWh' : 'L'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-emerald-500 font-bold">
                      ₹{log.costInr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">
                      {log.odometerKm.toLocaleString('en-IN')} KM
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {log.stationName}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Record Fuel Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Commercial Fuel or EV Charge Entry"
      >
        <form onSubmit={handleCreateFuelLog} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Fleet Vehicle *
            </label>
            <select
              value={vehicleId}
              onChange={(e) => handleVehicleSelect(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            >
              {state.vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registration} — {v.name} ({v.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fuel / Energy Type
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelLog['fuelType'])}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Diesel">Diesel (Liters)</option>
                <option value="Electric">Electric EV (kWh)</option>
                <option value="CNG">Compressed Natural Gas (kg)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity ({fuelType === 'Electric' ? 'kWh' : 'Liters'}) *
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                required
                value={quantityLiters}
                onChange={(e) => setQuantityLiters(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Expenditure (₹) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={costInr}
                onChange={(e) => setCostInr(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Odometer Reading (KM) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={odometerKm}
                onChange={(e) => setOdometerKm(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dispensing Station / Vendor
            </label>
            <input
              type="text"
              required
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-fleet-border-dark">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Fuel Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
