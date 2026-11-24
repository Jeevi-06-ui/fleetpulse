'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';
import { Vehicle, VehicleCategory, VehicleStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, Filter, RotateCcw, ArrowUpDown, ChevronRight, Eye } from 'lucide-react';

interface VehicleTableProps {
  onRegisterClick?: () => void;
  initialStatusFilter?: string;
}

export const VehicleTable: React.FC<VehicleTableProps> = ({
  onRegisterClick,
  initialStatusFilter = 'all',
}) => {
  const { state } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'registration' | 'odometer' | 'health'>('registration');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter logic
  const filteredVehicles = state.vehicles.filter((v) => {
    const matchesSearch =
      v.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort logic
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (sortBy === 'registration') {
      return sortOrder === 'asc'
        ? a.registration.localeCompare(b.registration)
        : b.registration.localeCompare(a.registration);
    }
    if (sortBy === 'odometer') {
      return sortOrder === 'asc'
        ? a.odometerKm - b.odometerKm
        : b.odometerKm - a.odometerKm;
    }
    if (sortBy === 'health') {
      return sortOrder === 'asc'
        ? a.healthScore - b.healthScore
        : b.healthScore - a.healthScore;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedVehicles.length / pageSize) || 1;
  const paginatedVehicles = sortedVehicles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSortBy('registration');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const getStatusBadgeVariant = (status: VehicleStatus) => {
    switch (status) {
      case 'available':
        return 'available';
      case 'inTransit':
        return 'inTransit';
      case 'assigned':
        return 'assigned';
      case 'maintenance':
        return 'maintenance';
      case 'inactive':
        return 'inactive';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search registration or model..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-2.5 py-1.5 bg-white dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="inTransit">In Transit</option>
            <option value="assigned">Assigned</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-2.5 py-1.5 bg-white dark:bg-fleet-navy-800 border border-slate-200 dark:border-fleet-border-dark rounded-fleet text-slate-700 dark:text-slate-200 focus:outline-none hidden sm:inline"
          >
            <option value="all">All Categories</option>
            <option value="Heavy Duty Truck">Heavy Duty Truck</option>
            <option value="Medium Freight">Medium Freight</option>
            <option value="Light Commercial">Light Commercial</option>
            <option value="Electric Cargo Van">Electric Cargo Van</option>
            <option value="Refrigerated Carrier">Refrigerated Carrier</option>
          </select>

          {/* Reset Filters */}
          {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-xs text-slate-500 hover:text-fleet-primary flex items-center gap-1 px-2 py-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        {onRegisterClick && (
          <Button variant="primary" size="sm" onClick={onRegisterClick}>
            + Register Vehicle
          </Button>
        )}
      </div>

      {/* Table Container with Horizontal Scroll Support */}
      <div className="bg-white dark:bg-fleet-panel-dark border border-slate-200 dark:border-fleet-border-dark rounded-fleet overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-fleet-navy-800/80 border-b border-slate-200 dark:border-fleet-border-dark text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-fleet-primary select-none"
                  onClick={() => {
                    if (sortBy === 'registration') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('registration');
                      setSortOrder('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    Registration
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Vehicle Model / Make</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-fleet-primary select-none"
                  onClick={() => {
                    if (sortBy === 'odometer') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('odometer');
                      setSortOrder('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    Odometer
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Fuel / Power</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-fleet-primary select-none"
                  onClick={() => {
                    if (sortBy === 'health') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('health');
                      setSortOrder('desc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    Health
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-fleet-navy-800">
              {paginatedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No vehicles match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedVehicles.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-slate-50 dark:hover:bg-fleet-navy-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      <Link
                        href={`/vehicles/${v.id}`}
                        className="hover:text-fleet-primary hover:underline"
                      >
                        {v.registration}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{v.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {v.make} ({v.modelYear})
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {v.category}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadgeVariant(v.status)} size="sm">
                        {v.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {v.odometerKm.toLocaleString('en-IN')} km
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {v.fuelType}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({v.fuelLevelPct}%)
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              v.healthScore > 85
                                ? 'bg-emerald-500'
                                : v.healthScore > 65
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${v.healthScore}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px]">{v.healthScore}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/vehicles/${v.id}`}
                        className="inline-flex items-center gap-1 text-fleet-primary hover:text-fleet-primary-hover font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-fleet-navy-800/60 border-t border-slate-200 dark:border-fleet-border-dark flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedVehicles.length)} of {sortedVehicles.length} vehicles
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
