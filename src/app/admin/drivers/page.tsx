'use client';

import React, { useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { Driver } from '@/types';
import { calculateDriverScorecard } from '@/lib/domain/safety';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Users,
  Search,
  Award,
  ShieldCheck,
} from 'lucide-react';

export default function AdminDriversPage() {
  const { state } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriverForScorecard, setSelectedDriverForScorecard] = useState<Driver | null>(null);

  const filteredDrivers = state.drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.contactNumber.includes(searchTerm) ||
      d.licenseCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeScorecard = selectedDriverForScorecard
    ? calculateDriverScorecard(selectedDriverForScorecard, state.trips)
    : null;

  const getSafetyGrade = (score: number) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B+';
    return 'B';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-fleet-primary" />
            Commercial Driver Directory & Safety Scorecards
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personnel profiles, licensing categories, pre-trip safety compliance, and telematics scorecards.
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
          const scorecard = calculateDriverScorecard(driver, state.trips);
          const grade = getSafetyGrade(scorecard.safetyScore);

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

                {/* Safety Score Pill & Badges */}
                <div className="mt-2.5 flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-fleet border border-slate-200 dark:border-slate-700/60 text-xs">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-fleet-primary" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Safety Score:
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {scorecard.safetyScore}/100
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      grade.startsWith('A')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    Grade {grade}
                  </span>
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
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Punctuality Rate:</span>
                    <span className="font-mono font-semibold text-emerald-500">
                      {scorecard.punctualityScore}%
                    </span>
                  </div>
                </div>

                {/* Distinction Badges */}
                {scorecard.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-slate-100 dark:border-fleet-border-dark/60">
                    {scorecard.badges.map((badge, bidx) => (
                      <span
                        key={bidx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-fleet-primary/10 text-fleet-primary border border-fleet-primary/20 flex items-center gap-1 font-mono font-semibold"
                      >
                        <Award className="w-2.5 h-2.5" />
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-fleet-border-dark/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Rating: ★ {driver.rating}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDriverForScorecard(driver)}
                  className="text-[11px] py-1 px-2"
                >
                  View Scorecard
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Driver Scorecard Details Modal */}
      {selectedDriverForScorecard && activeScorecard && (
        <Modal
          isOpen={!!selectedDriverForScorecard}
          onClose={() => setSelectedDriverForScorecard(null)}
          title={`Commercial Driver Scorecard — ${selectedDriverForScorecard.name}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-fleet-navy-800 rounded-fleet border border-slate-200 dark:border-fleet-border-dark">
              <div>
                <span className="text-xs text-slate-500">Overall Safety Assessment</span>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{activeScorecard.safetyScore} / 100</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-fleet-primary text-fleet-navy-900 font-bold">
                    Grade {getSafetyGrade(activeScorecard.safetyScore)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Efficiency Standing</span>
                <div className="text-sm font-bold font-mono text-emerald-500">
                  {activeScorecard.fuelEfficiencyRank}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-fleet-navy-800 rounded-fleet border border-slate-200 dark:border-fleet-border-dark">
                <span className="text-[11px] text-slate-500">Checklist Discipline</span>
                <div className="text-base font-bold font-mono text-emerald-500 mt-1">
                  {activeScorecard.checklistComplianceRate}%
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-fleet-navy-800 rounded-fleet border border-slate-200 dark:border-fleet-border-dark">
                <span className="text-[11px] text-slate-500">Punctual Deliveries</span>
                <div className="text-base font-bold font-mono text-fleet-primary mt-1">
                  {activeScorecard.punctualityScore}%
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-fleet-navy-800 rounded-fleet border border-slate-200 dark:border-fleet-border-dark">
                <span className="text-[11px] text-slate-500">Speed Breaches</span>
                <div className="text-base font-bold font-mono text-amber-500 mt-1">
                  {activeScorecard.speedingIncidents}
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Earned Distinction Badges
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {activeScorecard.badges.map((b, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-mono font-semibold flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-fleet text-xs space-y-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Operations Manager Recommendation:
              </span>
              <p className="text-slate-600 dark:text-slate-400 italic">
                {activeScorecard.safetyScore >= 90
                  ? 'Eligible for long-haul interstate hazardous and heavy container freight assignments.'
                  : activeScorecard.safetyScore >= 80
                  ? 'Standard commercial cargo dispatches approved. Continue monitoring yard adherence.'
                  : 'Refresher training recommended regarding pre-trip vehicle checklist completion and terminal speed compliance.'}
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-fleet-border-dark">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDriverForScorecard(null)}
              >
                Close Scorecard
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
