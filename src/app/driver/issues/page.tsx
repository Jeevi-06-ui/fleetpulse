'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DefectSeverity } from '@/types';
import { defectReportSchema } from '@/lib/validation/schemas';
import { AlertTriangle, ArrowLeft, Camera, ShieldAlert, CheckCircle2 } from 'lucide-react';

function DriverIssuesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preTripId = searchParams.get('tripId') || '';
  const preVehicleId = searchParams.get('vehicleId') || '';

  const { state, dispatch } = useFleet();

  const [vehicleId, setVehicleId] = useState(
    preVehicleId || state.vehicles[0]?.id || ''
  );
  const [tripId, setTripId] = useState(preTripId);
  const [severity, setSeverity] = useState<DefectSeverity>('medium');
  const [description, setDescription] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  // Local-only file reader simulation for photo/attachment preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setAttachmentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parseResult = defectReportSchema.safeParse({
      vehicleId,
      tripId: tripId || undefined,
      severity,
      description: description.trim(),
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const newDefectId = `def-${Date.now().toString().slice(-4)}`;
    const defectCode = `DEF-2026-${Date.now().toString().slice(-3)}`;
    const now = new Date().toISOString();

    const newDefect = {
      id: newDefectId,
      defectCode,
      vehicleId,
      tripId: tripId || undefined,
      reporterDriverId: state.session.driverId || state.drivers[0]?.id || 'drv-01',
      checklistResults: [{ item: 'Driver Road Defect Report', passed: false }],
      severity,
      description: description.trim(),
      status: 'reported' as const,
      reportedAt: now,
      attachmentName: attachmentName || undefined,
      attachmentDataUrl: attachmentPreview || undefined,
    };

    dispatch({ type: 'REPORT_DEFECT', payload: newDefect });
    setSuccessSubmitted(true);
    setTimeout(() => {
      router.push('/driver');
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link href="/driver">
          <Button variant="outline" size="sm" className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Report Vehicle Defect or Mechanical Issue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Logs an immediate maintenance flag. Critical issues automatically ground the vehicle from dispatch.
          </p>
        </div>
      </div>

      {successSubmitted ? (
        <Card className="p-8 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Defect Successfully Filed
          </h2>
          <p className="text-xs text-slate-500">
            Operations and terminal maintenance teams have been alerted. Redirecting to driver cockpit...
          </p>
        </Card>
      ) : (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vehicle Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Affected Vehicle *
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
              >
                {state.vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registration} — {v.name} ({v.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Pill Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Defect Severity Classification *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'critical'] as DefectSeverity[]).map((sev) => (
                  <button
                    type="button"
                    key={sev}
                    onClick={() => setSeverity(sev)}
                    className={`py-2 px-3 rounded-fleet text-xs font-semibold border transition-all text-center capitalize ${
                      severity === sev
                        ? sev === 'critical'
                          ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                          : sev === 'high'
                          ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                          : sev === 'medium'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-blue-500 text-white border-blue-600 shadow-sm'
                        : 'border-slate-300 dark:border-fleet-border-dark text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-fleet-navy-800'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
              {severity === 'critical' && (
                <div className="mt-2 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-fleet text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Warning: Selecting Critical will instantly ground this vehicle from dispatch until terminal repairs are signed off.
                  </span>
                </div>
              )}
            </div>

            {/* Defect Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Issue Description *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the mechanical symptom, sound, vibration, leak, or electrical failure in detail (at least 10 characters)..."
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-slate-900 dark:text-white focus:outline-none"
              />
              {errors.description && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Photo / File Attachment (Simulated Local Preview) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Attach Photo Evidence (Local In-Browser Preview)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-fleet-navy-800 border border-slate-300 dark:border-fleet-border-dark rounded-fleet text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors">
                  <Camera className="w-4 h-4 text-fleet-primary" />
                  <span>Choose Photo / File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {attachmentName && (
                  <span className="text-xs text-slate-500 truncate max-w-xs">{attachmentName}</span>
                )}
              </div>

              {attachmentPreview && (
                <div className="mt-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachmentPreview}
                    alt="Defect preview"
                    className="w-40 h-28 object-cover rounded-fleet border border-slate-300 dark:border-fleet-border-dark"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Preview rendered client-side. No images sent to external servers.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-fleet-border-dark flex justify-end gap-3">
              <Link href="/driver">
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              </Link>
              <Button variant="danger" size="sm" type="submit">
                Submit Defect Report
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

export default function DriverIssuesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading defect reporting...</div>}>
      <DriverIssuesContent />
    </Suspense>
  );
}
