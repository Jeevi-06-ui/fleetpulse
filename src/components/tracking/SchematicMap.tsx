'use client';

import React, { useState, useRef } from 'react';
import { Vehicle, Telemetry, GeofenceZone } from '@/types';
import { ZoomIn, ZoomOut, RotateCcw, ShieldAlert, Layers } from 'lucide-react';

interface SchematicMapProps {
  vehicles: Vehicle[];
  telemetry: Record<string, Telemetry>;
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  statusFilter: string;
  geofenceZones?: GeofenceZone[];
}

// Key logistic hubs with schematic coordinates [x, y] on a 100x100 grid
const SCHEMATIC_HUBS = [
  { id: 'hub-blr', name: 'Bengaluru Hub', x: 35, y: 75, code: 'BLR' },
  { id: 'hub-chn', name: 'Chennai Port CFS', x: 85, y: 78, code: 'CHN' },
  { id: 'hub-hyd', name: 'Hyderabad Cargo', x: 55, y: 52, code: 'HYD' },
  { id: 'hub-pne', name: 'Pune MIDC Cluster', x: 25, y: 45, code: 'PNE' },
  { id: 'hub-bom', name: 'Mumbai JNPT Port', x: 20, y: 40, code: 'BOM' },
  { id: 'hub-cbe', name: 'Coimbatore Freight', x: 40, y: 90, code: 'CBE' },
  { id: 'hub-slm', name: 'Salem Logistics Yard', x: 46, y: 88, code: 'SLM' },
  { id: 'hub-hsr', name: 'Hosur SIPCOT', x: 42, y: 80, code: 'HSR' },
  { id: 'hub-vja', name: 'Vijayawada Depot', x: 70, y: 58, code: 'VJA' },
];

// Logistics Freight Highway Corridors
const HIGHWAY_CORRIDORS = [
  { from: [35, 75], to: [85, 78], label: 'NH 48 (Bangalore-Chennai)' },
  { from: [35, 75], to: [42, 80], label: 'Hosur Express' },
  { from: [42, 80], to: [46, 88], label: 'Salem Corridor' },
  { from: [46, 88], to: [40, 90], label: 'Coimbatore Link' },
  { from: [35, 75], to: [55, 52], label: 'NH 44 (Bangalore-Hyderabad)' },
  { from: [55, 52], to: [70, 58], label: 'Vijayawada Express' },
  { from: [20, 40], to: [25, 45], label: 'Mumbai-Pune Expressway' },
  { from: [25, 45], to: [55, 52], label: 'NH 65 (Pune-Hyderabad)' },
];

export const SchematicMap: React.FC<SchematicMapProps> = ({
  vehicles,
  telemetry,
  selectedVehicleId,
  onSelectVehicle,
  statusFilter,
  geofenceZones = [],
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGeofences, setShowGeofences] = useState(true);
  const [showTrails, setShowTrails] = useState(true);

  const mapRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (statusFilter === 'all') return true;
    return v.status === statusFilter;
  });

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'inTransit':
        return '#13C8C1'; // Teal
      case 'available':
        return '#10B981'; // Emerald
      case 'assigned':
        return '#3B82F6'; // Blue
      case 'maintenance':
        return '#F59E0B'; // Amber
      case 'inactive':
        return '#64748B'; // Slate
      default:
        return '#94A3B8';
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-slate-950 border border-slate-200 dark:border-fleet-border-dark rounded-fleet overflow-hidden select-none">
      {/* Top Banner: Mandatory Simulated GPS Warning & Status */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        <div className="px-3 py-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-fleet text-[11px] font-mono text-teal-400 font-semibold flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          SIMULATED GPS / DEMO DATA
        </div>
        <div className="hidden sm:flex px-2.5 py-1 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-fleet text-[11px] text-slate-400">
          Schematic Coordinate Plane (0-100)
        </div>
      </div>

      {/* Layer Toggles & Zoom Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-fleet border border-slate-800 text-[11px] text-slate-300 shadow-xl">
          <button
            onClick={() => setShowGeofences((v) => !v)}
            className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
              showGeofences ? 'bg-fleet-primary/20 text-fleet-primary font-semibold' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Geofence Boundaries"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Geofences</span>
          </button>
          <button
            onClick={() => setShowTrails((v) => !v)}
            className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
              showTrails ? 'bg-fleet-primary/20 text-fleet-primary font-semibold' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Telemetry Breadcrumb Trails"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trails</span>
          </button>
        </div>

        <div className="flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-fleet border border-slate-800 shadow-xl">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        ref={mapRef}
        viewBox="0 0 100 100"
        className={`w-full h-full cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g
          transform={`translate(${panOffset.x / 6}, ${panOffset.y / 6}) scale(${zoomLevel})`}
          style={{ transformOrigin: '50px 50px', transition: isDragging ? 'none' : 'transform 0.15s ease-out' }}
        >
          {/* Subtle Background Coordinate Grid */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Geofence Zone Polygons & Circles */}
          {showGeofences &&
            geofenceZones.map((zone) => {
              const zoneColor =
                zone.type === 'Port Terminal'
                  ? '#F59E0B'
                  : zone.type === 'Depot'
                  ? '#3B82F6'
                  : zone.type === 'Industrial Park'
                  ? '#8B5CF6'
                  : '#EC4899';

              return (
                <g key={zone.id}>
                  <circle
                    cx={zone.coordinates[0]}
                    cy={zone.coordinates[1]}
                    r={zone.radius}
                    fill={zoneColor}
                    fillOpacity="0.08"
                    stroke={zoneColor}
                    strokeWidth="0.5"
                    strokeDasharray="2,1"
                  />
                  <text
                    x={zone.coordinates[0]}
                    y={zone.coordinates[1] - zone.radius - 0.8}
                    fill={zoneColor}
                    fontSize="1.6"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {zone.name.toUpperCase()} (≤{zone.speedLimitKmh} km/h)
                  </text>
                </g>
              );
            })}

          {/* National Freight Highway Corridors */}
          {HIGHWAY_CORRIDORS.map((corr, idx) => (
            <g key={idx}>
              <line
                x1={corr.from[0]}
                y1={corr.from[1]}
                x2={corr.to[0]}
                y2={corr.to[1]}
                stroke="#1E3A5F"
                strokeWidth="1.2"
                strokeDasharray="2,1"
              />
              <line
                x1={corr.from[0]}
                y1={corr.from[1]}
                x2={corr.to[0]}
                y2={corr.to[1]}
                stroke="#0EA5E9"
                strokeWidth="0.4"
                strokeOpacity="0.4"
              />
            </g>
          ))}

          {/* Regional Logistics Hubs Nodes */}
          {SCHEMATIC_HUBS.map((hub) => (
            <g key={hub.id} transform={`translate(${hub.x}, ${hub.y})`}>
              <circle r="2.2" fill="#071525" stroke="#4169E1" strokeWidth="0.8" />
              <circle r="0.8" fill="#60A5FA" />
              <text
                x="3.2"
                y="1"
                fill="#94A3B8"
                fontSize="2.2"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {hub.code}
              </text>
            </g>
          ))}

          {/* Breadcrumb Telemetry Trails */}
          {showTrails &&
            filteredVehicles.map((v) => {
              const tel = telemetry[v.telemetryId];
              if (!tel || !tel.recentTrail || tel.recentTrail.length < 2) return null;

              const trailPoints = [
                ...tel.recentTrail.map((p) => `${p[0]},${p[1]}`),
                `${tel.coordinates[0]},${tel.coordinates[1]}`,
              ].join(' ');

              const markerColor = getMarkerColor(v.status);

              return (
                <polyline
                  key={`trail-${v.id}`}
                  points={trailPoints}
                  fill="none"
                  stroke={markerColor}
                  strokeWidth="0.6"
                  strokeDasharray="1,1"
                  strokeOpacity="0.4"
                />
              );
            })}

          {/* Vehicles Telemetry Markers */}
          {filteredVehicles.map((v) => {
            const tel = telemetry[v.telemetryId];
            if (!tel) return null;

            const isSelected = selectedVehicleId === v.id;
            const markerColor = getMarkerColor(v.status);
            const [vx, vy] = tel.coordinates;

            return (
              <g
                key={v.id}
                transform={`translate(${vx}, ${vy})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectVehicle(v.id);
                }}
                className="cursor-pointer group"
              >
                {/* Ping animation ring for active in-transit vehicles */}
                {v.status === 'inTransit' && (
                  <circle
                    r="3.5"
                    fill="none"
                    stroke={markerColor}
                    strokeWidth="0.4"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}

                {/* Selection Highlight Ring */}
                {isSelected && (
                  <circle
                    r="4.2"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="0.8"
                    strokeDasharray="1,1"
                  />
                )}

                {/* Vehicle Marker Body */}
                <circle
                  r="2.2"
                  fill="#071525"
                  stroke={markerColor}
                  strokeWidth={isSelected ? '1.2' : '0.8'}
                />

                {/* Direction Heading Indicator */}
                <g transform={`rotate(${tel.heading})`}>
                  <polygon points="0,-2.6 1,-0.5 -1,-0.5" fill={markerColor} />
                </g>

                {/* Small Center Dot */}
                <circle r="0.6" fill={markerColor} />

                {/* Vehicle Mini Tag on Hover or when Selected */}
                {(isSelected || v.status === 'inTransit') && (
                  <g transform="translate(0, -3.8)">
                    <rect
                      x="-8"
                      y="-2.5"
                      width="16"
                      height="2.8"
                      rx="0.8"
                      fill="#071525"
                      stroke={markerColor}
                      strokeWidth="0.3"
                    />
                    <text
                      x="0"
                      y="-0.7"
                      fill="#FFFFFF"
                      fontSize="1.6"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {v.registration.split('-')[0]}-{v.registration.split('-')[3]}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-fleet border border-slate-800 flex flex-wrap items-center gap-4 text-[11px] text-slate-300 shadow-xl">
        <span className="font-semibold text-white">Status Key:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
          <span>In Transit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Assigned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Maintenance</span>
        </div>
      </div>
    </div>
  );
};
