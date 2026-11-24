'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';
import { Trip, TripStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, Filter, RotateCcw, ArrowUpDown, Eye, Calendar } from 'lucide-react';

export const TripTable: React.FC = () => {
  const { state } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'tripNumber' | 'date' | 'distance'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter trips
  const filteredTrips = state.trips.filter((t) => {
    const matchesSearch =
      t.tripNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.origin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cargoDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort trips
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === 'tripNumber') {
      return sortOrder === 'asc'
        ? a.tripNumber.localeCompare(b.tripNumber)
        : b.tripNumber.localeCompare(a.tripNumber);
    }
    if (sortBy === 'date') {
      const timeA = new Date(a.scheduledStart).getTime();
      const timeB = new Date(b.scheduledStart).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }
    if (sortBy === 'distance') {
      return sortOrder === 'asc' ? a.distanceKm - b.distanceKm : b.distanceKm - a.distanceKm;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedTrips.length / pageSize) || 1;
  const paginatedTrips = sortedTrips.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search trip number, hub, or cargo..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-2.5 py-1.5 bg-white dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses ({state.trips.length})</option>
            <option value="inProgress">
              In Progress ({state.trips.filter((t) => t.status === 'inProgress').length})
            </option>
            <option value="scheduled">
              Scheduled ({state.trips.filter((t) => t.status === 'scheduled').length})
            </option>
            <option value="completed">
              Completed ({state.trips.filter((t) => t.status === 'completed').length})
            </option>
            <option value="cancelled">
              Cancelled ({state.trips.filter((t) => t.status === 'cancelled').length})
            </option>
          </select>

          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-xs text-slate-500 hover:text-fleet-primary flex items-center gap-1 px-2 py-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        <Link href="/trips/new">
          <Button variant="primary" size="sm">
            + Schedule New Trip
          </Button>
        </Link>
      </div>

      {/* Trips Table */}
      <div className="bg-white dark:bg-fleet-panel-dark border border-slate-200 dark:border-fleet-border-dark rounded-fleet overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-fleet-navy-800/80 border-b border-slate-200 dark:border-fleet-border-dark text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-fleet-primary select-none"
                  onClick={() => {
                    if (sortBy === 'tripNumber') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('tripNumber');
                      setSortOrder('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    Trip ID <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Origin → Destination</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Driver</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-fleet-primary select-none"
                  onClick={() => {
                    if (sortBy === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('date');
                      setSortOrder('desc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    Schedule <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-fleet-primary select-none"
                  onClick={() => {
                    if (sortBy === 'distance') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('distance');
                      setSortOrder('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    Distance <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-fleet-navy-800">
              {paginatedTrips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No trips match the selected search criteria.
                  </td>
                </tr>
              ) : (
                paginatedTrips.map((trip) => {
                  const vehicle = state.vehicles.find((v) => v.id === trip.vehicleId);
                  const driver = state.drivers.find((d) => d.id === trip.driverId);

                  return (
                    <tr
                      key={trip.id}
                      className="hover:bg-slate-50 dark:hover:bg-fleet-navy-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-fleet-primary">
                        <Link href={`/trips/${trip.id}`} className="hover:underline">
                          {trip.tripNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {trip.origin.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          → {trip.destination.name}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {vehicle?.registration || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                        {driver?.name || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 dark:text-slate-200">
                          {new Date(trip.scheduledStart).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(trip.scheduledStart).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {trip.actualDistanceKm || trip.distanceKm} km
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={trip.status as any} size="sm">
                          {trip.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/trips/${trip.id}`}
                          className="inline-flex items-center gap-1 text-fleet-primary hover:text-fleet-primary-hover font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-fleet-navy-800/60 border-t border-slate-200 dark:border-fleet-border-dark flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedTrips.length)} of {sortedTrips.length} trips
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="font-mono text-xs px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
