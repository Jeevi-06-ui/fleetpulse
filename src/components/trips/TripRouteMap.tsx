'use client';

import React from 'react';
import { RouteLocation } from '@/types';

interface TripRouteMapProps {
  origin: RouteLocation;
  destination: RouteLocation;
  routePoints: [number, number][];
  currentCoordinates?: [number, number];
  status: string;
}

export const TripRouteMap: React.FC<TripRouteMapProps> = ({
  origin,
  destination,
  routePoints,
  currentCoordinates,
  status,
}) => {
  const pointsStr = routePoints.map((p) => p.join(',')).join(' ');

  return (
    <div className="relative w-full h-64 bg-slate-950 border border-slate-200 dark:border-fleet-border-dark rounded-fleet overflow-hidden">
      <div className="absolute top-2 left-2 z-10 px-2.5 py-0.5 bg-slate-900/90 text-[10px] font-mono text-teal-400 rounded border border-slate-800">
        Schematic Transit Corridor
      </div>

      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Route Line */}
        <polyline
          points={pointsStr}
          fill="none"
          stroke="#1E3A5F"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={pointsStr}
          fill="none"
          stroke="#13C8C1"
          strokeWidth="1.2"
          strokeDasharray={status === 'inProgress' ? '3,1' : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Origin Node */}
        <g transform={`translate(${origin.coordinates[0]}, ${origin.coordinates[1]})`}>
          <circle r="3" fill="#071525" stroke="#10B981" strokeWidth="1.5" />
          <circle r="1.2" fill="#10B981" />
          <text
            x="4"
            y="1.5"
            fill="#A7F3D0"
            fontSize="3"
            fontFamily="monospace"
            fontWeight="bold"
          >
            ORIGIN
          </text>
        </g>

        {/* Destination Node */}
        <g transform={`translate(${destination.coordinates[0]}, ${destination.coordinates[1]})`}>
          <circle r="3" fill="#071525" stroke="#3B82F6" strokeWidth="1.5" />
          <circle r="1.2" fill="#3B82F6" />
          <text
            x="4"
            y="1.5"
            fill="#BFDBFE"
            fontSize="3"
            fontFamily="monospace"
            fontWeight="bold"
          >
            DEST
          </text>
        </g>

        {/* Current Vehicle Position (if in transit) */}
        {currentCoordinates && status === 'inProgress' && (
          <g transform={`translate(${currentCoordinates[0]}, ${currentCoordinates[1]})`}>
            <circle r="4" fill="none" stroke="#13C8C1" strokeWidth="0.8" className="animate-ping" />
            <circle r="2.5" fill="#071525" stroke="#13C8C1" strokeWidth="1.5" />
            <circle r="1" fill="#13C8C1" />
          </g>
        )}
      </svg>

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/90 px-3 py-1 rounded border border-slate-800">
        <span>{origin.name}</span>
        <span>→</span>
        <span>{destination.name}</span>
      </div>
    </div>
  );
};
