'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFleet } from '@/context/FleetContext';
import { Search, Truck, Send, User, ArrowRight, X } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { state } = useFleet();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const matchingVehicles = cleanQuery
    ? state.vehicles
        .filter(
          (v) =>
            v.registration.toLowerCase().includes(cleanQuery) ||
            v.name.toLowerCase().includes(cleanQuery) ||
            v.category.toLowerCase().includes(cleanQuery)
        )
        .slice(0, 5)
    : [];

  const matchingTrips = cleanQuery
    ? state.trips
        .filter(
          (t) =>
            t.tripNumber.toLowerCase().includes(cleanQuery) ||
            t.origin.name.toLowerCase().includes(cleanQuery) ||
            t.destination.name.toLowerCase().includes(cleanQuery)
        )
        .slice(0, 5)
    : [];

  const matchingDrivers = cleanQuery
    ? state.drivers
        .filter(
          (d) =>
            d.name.toLowerCase().includes(cleanQuery) ||
            d.contactNumber.toLowerCase().includes(cleanQuery) ||
            d.licenseCategory.toLowerCase().includes(cleanQuery)
        )
        .slice(0, 4)
    : [];

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  const hasResults =
    matchingVehicles.length > 0 || matchingTrips.length > 0 || matchingDrivers.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-fleet-navy-900 border border-slate-200 dark:border-fleet-border-dark rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-fleet-border-dark">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vehicles (e.g. KA-01), trips (FP-2026), or drivers..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-fleet-navy-800">
          {!query.trim() ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Type registration number, city, or driver name to jump directly to records.
            </div>
          ) : !hasResults ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching vehicles, trips, or drivers found for &quot;{query}&quot;.
            </div>
          ) : (
            <>
              {matchingVehicles.length > 0 && (
                <div className="py-2">
                  <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Vehicles ({matchingVehicles.length})
                  </div>
                  {matchingVehicles.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleSelect(`/vehicles/${v.id}`)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-fleet-navy-800 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-fleet-primary" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {v.registration}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {v.name} • {v.category}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        {v.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {matchingTrips.length > 0 && (
                <div className="py-2">
                  <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Trips ({matchingTrips.length})
                  </div>
                  {matchingTrips.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelect(`/trips/${t.id}`)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-fleet-navy-800 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Send className="w-4 h-4 text-fleet-cobalt" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {t.tripNumber}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {t.origin.name} → {t.destination.name}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        {t.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {matchingDrivers.length > 0 && (
                <div className="py-2">
                  <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Drivers ({matchingDrivers.length})
                  </div>
                  {matchingDrivers.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => handleSelect(`/admin/drivers`)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-fleet-navy-800 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {d.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {d.licenseCategory} • Rating: {d.rating}★
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{d.contactNumber}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-fleet-navy-800/60 border-t border-slate-200 dark:border-fleet-border-dark flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with mouse or keyboard</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  );
};
