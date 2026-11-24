'use client';

import React, { useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { Trip } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateCsv, downloadCsvFile, CsvColumn } from '@/lib/domain/csv';
import { FileSpreadsheet, Download, Search, RotateCcw } from 'lucide-react';

export default function ReportsPage() {
  const { state } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Filter full result set
  const filteredTrips = state.trips.filter((t) => {
    const matchesSearch =
      t.tripNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.origin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cargoDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Secure CSV export matching the ENTIRE filtered result set
  const handleExportCsv = () => {
    const columns: CsvColumn<Trip>[] = [
      { header: 'Trip Number', accessor: (t) => t.tripNumber },
      { header: 'Origin Location', accessor: (t) => t.origin.name },
      { header: 'Destination Location', accessor: (t) => t.destination.name },
      {
        header: 'Vehicle Registration',
        accessor: (t) => state.vehicles.find((v) => v.id === t.vehicleId)?.registration || t.vehicleId,
      },
      {
        header: 'Driver Name',
        accessor: (t) => state.drivers.find((d) => d.id === t.driverId)?.name || t.driverId,
      },
      { header: 'Status', accessor: (t) => t.status },
      { header: 'Scheduled Start', accessor: (t) => t.scheduledStart },
      { header: 'Scheduled End', accessor: (t) => t.scheduledEnd },
      { header: 'Actual Distance (km)', accessor: (t) => t.actualDistanceKm || t.distanceKm },
      { header: 'Cargo Description', accessor: (t) => t.cargoDescription },
      { header: 'Cargo Weight (kg)', accessor: (t) => t.cargoWeightKg },
      { header: 'Consignee Notes', accessor: (t) => t.notes || '' },
    ];

    const csvData = generateCsv(filteredTrips, columns);
    const filename = `FleetPulse_Consignment_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsvFile(csvData, filename);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-fleet-primary" />
            Operational Consignment Reports & CSV Export
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Export comprehensive tabular records matching full filtered cohorts with CSV formula injection protection.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleExportCsv}
          icon={<Download className="w-4 h-4" />}
        >
          Export CSV ({filteredTrips.length} Rows)
        </Button>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-fleet text-xs text-emerald-400 font-semibold flex items-center gap-2 animate-fadeIn">
          ✓ Download initiated: Full dataset matching active search and filters exported to CSV.
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search report records..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-2.5 py-1.5 bg-white dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="all">All Statuses ({state.trips.length})</option>
          <option value="completed">Completed Trips</option>
          <option value="inProgress">In-Transit Convoys</option>
          <option value="scheduled">Scheduled Ahead</option>
          <option value="cancelled">Cancelled Trips</option>
        </select>
      </div>

      {/* Report Table Preview */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-fleet-navy-800/80 border-b border-slate-200 dark:border-fleet-border-dark text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Trip Number</th>
                <th className="py-3 px-4">Origin Hub</th>
                <th className="py-3 px-4">Destination Terminal</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Distance (km)</th>
                <th className="py-3 px-4">Cargo Specification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-fleet-navy-800">
              {filteredTrips.slice(0, 15).map((trip) => {
                const veh = state.vehicles.find((v) => v.id === trip.vehicleId);
                const drv = state.drivers.find((d) => d.id === trip.driverId);

                return (
                  <tr key={trip.id} className="hover:bg-slate-50 dark:hover:bg-fleet-navy-800/50">
                    <td className="py-2.5 px-4 font-mono font-bold text-fleet-primary">
                      {trip.tripNumber}
                    </td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">
                      {trip.origin.name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">
                      {trip.destination.name}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {veh?.registration}
                    </td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{drv?.name}</td>
                    <td className="py-2.5 px-4 capitalize font-semibold">{trip.status}</td>
                    <td className="py-2.5 px-4 font-mono">
                      {trip.actualDistanceKm || trip.distanceKm} km
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {trip.cargoDescription}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-fleet-navy-800/40 text-xs text-slate-400 text-center border-t border-slate-200 dark:border-fleet-border-dark">
          Showing preview of top 15 rows. Export CSV will download all {filteredTrips.length} rows matching your filter.
        </div>
      </Card>
    </div>
  );
}
