'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Printer,
  FileText,
  Truck,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  QrCode,
} from 'lucide-react';

export default function TripWaybillPage() {
  const params = useParams();
  const router = useRouter();
  const { state } = useFleet();
  const tripId = params.id as string;

  const trip = state.trips.find((t) => t.id === tripId);

  if (!trip) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Trip Not Found</h2>
        <p className="text-xs text-slate-500">
          Trip identifier ({tripId}) was not found in the operations database.
        </p>
        <Link href="/trips">
          <Button variant="primary" size="sm">
            Return to Trips Central
          </Button>
        </Link>
      </div>
    );
  }

  const vehicle = state.vehicles.find((v) => v.id === trip.vehicleId);
  const driver = state.drivers.find((d) => d.id === trip.driverId);

  const handlePrint = () => {
    window.print();
  };

  const waybillNumber = `WB-2026-${trip.tripNumber.replace('TRIP-', '')}`;
  const sealNumber = `SL-${trip.id.toUpperCase()}-992`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:m-0 print:p-0 print:max-w-none">
      {/* Top Controls (Hidden on Print) */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link href={`/trips/${trip.id}`}>
            <Button variant="outline" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-fleet-primary" />
              Official Consignment Waybill & POD
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generated for legal transit dispatch, highway toll inspection, and Proof of Delivery.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handlePrint}
          icon={<Printer className="w-4 h-4" />}
        >
          Print Waybill / POD
        </Button>
      </div>

      {/* Waybill Printable Document Container */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-fleet shadow-lg border border-slate-200 print:border-none print:shadow-none print:p-6 print:text-black">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-widest font-mono">
                FP
              </div>
              <span className="text-2xl font-black tracking-wider text-slate-900">
                FLEETPULSE LOGISTICS
              </span>
            </div>
            <div className="text-xs text-slate-600 font-medium mt-1">
              Jeevix Technologies Pvt. Ltd. • Freight Operations Division
            </div>
            <div className="text-[10px] text-slate-500">
              HQ: Electronic City Phase 1, Hosur Road, Bengaluru, Karnataka 560100
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              GSTIN: 29AAACJ8192K1Z5 • Support: dispatch@jeevix-fleetpulse.io
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 bg-slate-900 text-white text-[11px] font-mono font-bold tracking-widest uppercase rounded">
              STANDARD CONSIGNMENT NOTE
            </span>
            <div className="mt-2 text-sm font-bold font-mono text-slate-900">
              {waybillNumber}
            </div>
            <div className="text-xs text-slate-600 font-mono">
              Trip Ref: {trip.tripNumber}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Issued: {new Date(trip.scheduledStart).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
            </div>
          </div>
        </div>

        {/* Consignor & Consignee Grid */}
        <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-300 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              1. CONSIGNOR (DISPATCH ORIGIN)
            </span>
            <div className="font-bold text-slate-900 text-sm mt-1">{trip.origin.name}</div>
            <div className="text-slate-600 mt-1">
              Logistics Terminal Gate 4, Freight Corridor Sector
            </div>
            <div className="text-slate-500 text-[11px] mt-1">
              Dispatch Officer: Chandan Mayur A (Senior Operations)
            </div>
            <div className="text-slate-500 text-[11px] font-mono">
              Contact: +91 80 4429 8800
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              2. CONSIGNEE (DELIVERY DESTINATION)
            </span>
            <div className="font-bold text-slate-900 text-sm mt-1">{trip.destination.name}</div>
            <div className="text-slate-600 mt-1">
              Central Receiving Warehouse, Bay 12-B
            </div>
            <div className="text-slate-500 text-[11px] mt-1">
              Delivery Terms: Freight Prepaid / Door Delivery
            </div>
            <div className="text-slate-500 text-[11px] font-mono">
              Receiving POC: Receiving Manager on Duty
            </div>
          </div>
        </div>

        {/* Vehicle, Driver & Cargo Manifest Table */}
        <div className="py-6 border-b border-slate-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            3. VEHICLE, CREW & CONSIGNMENT MANIFEST
          </h3>
          <table className="w-full text-xs text-left border border-slate-300">
            <tbody>
              <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                <td className="p-2 border-r border-slate-200 w-1/4">Registration No.</td>
                <td className="p-2 border-r border-slate-200 w-1/4 font-mono text-slate-900">
                  {vehicle?.registration || 'N/A'}
                </td>
                <td className="p-2 border-r border-slate-200 w-1/4">Vehicle Model / Class</td>
                <td className="p-2 w-1/4 text-slate-900">
                  {vehicle?.name} ({vehicle?.category.toUpperCase()})
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-200 font-semibold text-slate-700">Assigned Driver</td>
                <td className="p-2 border-r border-slate-200 text-slate-900">
                  {driver?.name || 'Unassigned'}
                </td>
                <td className="p-2 border-r border-slate-200 font-semibold text-slate-700">Commercial License</td>
                <td className="p-2 font-mono text-slate-900">
                  {driver?.licenseNumber || 'N/A'} ({driver?.licenseCategory})
                </td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="p-2 border-r border-slate-200 font-semibold text-slate-700">Cargo Description</td>
                <td className="p-2 border-r border-slate-200 text-slate-900" colSpan={3}>
                  {trip.cargoDescription}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-200 font-semibold text-slate-700">Route Distance</td>
                <td className="p-2 border-r border-slate-200 text-slate-900 font-mono">
                  {trip.distanceKm} KM (Estimated)
                </td>
                <td className="p-2 border-r border-slate-200 font-semibold text-slate-700">Security Seal No.</td>
                <td className="p-2 font-mono text-slate-900">{sealNumber}</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-200 font-semibold text-slate-700">Dispatch Departure</td>
                <td className="p-2 border-r border-slate-200 text-slate-900 font-mono">
                  {new Date(trip.scheduledStart).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </td>
                <td className="p-2 border-r border-slate-200 font-semibold text-slate-700">Expected ETA</td>
                <td className="p-2 font-mono text-slate-900">
                  {new Date(trip.scheduledEnd).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Safety Inspection & Compliance Verification */}
        <div className="py-6 border-b border-slate-300 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            4. PRE-DISPATCH SAFETY & COMPLIANCE VERIFICATION
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {trip.checklist.map((item) => (
              <div
                key={item.id}
                className={`p-2 rounded border text-[11px] flex items-center justify-between ${
                  item.completed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>{item.label}</span>
                <span className="font-bold">{item.completed ? 'VERIFIED ✓' : 'PENDING'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Proof of Delivery (POD) & Legal Sign-off Box */}
        <div className="pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            5. PROOF OF DELIVERY (POD) & ACKNOWLEDGEMENT OF RECEIPT
          </h3>
          <div className="grid grid-cols-2 gap-8 text-xs">
            {/* Driver Attestation */}
            <div className="border border-slate-300 p-4 rounded flex flex-col justify-between h-36">
              <div>
                <span className="font-bold text-slate-800">Commercial Driver Attestation</span>
                <p className="text-[10px] text-slate-500 mt-1">
                  I certify that the goods listed above were safely inspected, transported, and
                  delivered with security seals intact.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-600">
                <div>
                  <span className="font-mono font-bold text-slate-900">{driver?.name}</span>
                  <div className="text-[9px] text-slate-400">Driver Signature & Date</div>
                </div>
                <div className="font-mono text-[10px]">
                  {trip.status === 'completed' ? 'SIGNED ✓' : 'Pending Signature'}
                </div>
              </div>
            </div>

            {/* Consignee POD Sign-off */}
            <div className="border border-slate-300 p-4 rounded flex flex-col justify-between h-36">
              <div>
                <span className="font-bold text-slate-800">Consignee Receiving Acknowledgement (POD)</span>
                <p className="text-[10px] text-slate-500 mt-1">
                  Received consignment in good order and condition without visible damage or seal breach.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-600">
                <div>
                  <span className="font-mono font-bold text-slate-900">
                    {trip.destination.name} Receiving
                  </span>
                  <div className="text-[9px] text-slate-400">Receiver Stamp, Sign & IST Timestamp</div>
                </div>
                <div className="font-mono text-[10px]">
                  {trip.status === 'completed' ? 'POD ACCEPTED ✓' : 'Pending Delivery'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer / Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500 font-mono">
          <div>
            FLEETPULSE ENTERPRISE TELEMATICS • EMPOWERED BY JEEVIX TECHNOLOGIES
          </div>
          <div>PAGE 1 OF 1 • ELECTRONIC CONSIGNMENT NOTE • SYSTEM GENERATED</div>
        </div>
      </div>
    </div>
  );
}
