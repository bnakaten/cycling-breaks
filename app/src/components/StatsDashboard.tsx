/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnalysisSummary } from '../types';
import { Clock, Navigation, MapPin, Activity, HelpCircle, ShieldAlert } from 'lucide-react';

interface StatsDashboardProps {
  summary: AnalysisSummary;
}

export function StatsDashboard({ summary }: StatsDashboardProps) {
  // Convert meters to km
  const distanceKm = (summary.totalDistanceMeters / 1000).toFixed(2);
  
  // Format total track duration
  const formatTrackDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const displaySeconds = seconds % 60;
    const displayMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours} Std. ${displayMinutes} Min.`;
    }
    return `${displayMinutes} Min. ${displaySeconds} Sek.`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Gesamt-Standzeit (Summed Stop Duration) */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex items-start gap-3.5">
        <div className="p-2.5 bg-rose-50 rounded text-rose-600 flex-shrink-0">
          <Clock size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Gesamt-Standzeit</p>
          <p className="text-lg font-bold font-mono text-[#111827] mt-1 truncate">
            {summary.totalStopDurationFormatted}
          </p>
          <p className="text-[10px] text-[#6B7280] mt-1">
            Summe aller erkannten Stopps
          </p>
        </div>
      </div>

      {/* 2. Standzeit-Anteil (Stop Ratio) */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex items-start gap-3.5">
        <div className="p-2.5 bg-amber-50 rounded text-amber-600 flex-shrink-0">
          <Activity size={18} />
        </div>
        <div className="min-w-0 w-full">
          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Standzeit-Anteil</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <p className="text-lg font-bold text-[#111827] font-mono">
              {summary.stopRatioPercent}%
            </p>
            <span className="text-[10px] text-[#6B7280]">der Route</span>
          </div>
          
          {/* Micro Progress Bar */}
          <div className="w-full bg-slate-100 h-1 rounded overflow-hidden mt-3">
            <div 
              className="bg-amber-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min(100, summary.stopRatioPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Anzahl der Stopps (Stop Count) */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex items-start gap-3.5">
        <div className="p-2.5 bg-blue-50 rounded text-blue-600 flex-shrink-0">
          <MapPin size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Anzahl der Stopps</p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-lg font-bold text-[#111827] font-mono">
              {summary.stopCount}
            </p>
            <span className="text-[10px] text-[#6B7280] ml-1">Aufenthalte</span>
          </div>
          <p className="text-[10px] text-[#6B7280] mt-1">
            Ruhephasen erkannt
          </p>
        </div>
      </div>

      {/* 4. Streckendetails (Distance & Duration) */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex items-start gap-3.5">
        <div className="p-2.5 bg-slate-50 rounded text-slate-600 flex-shrink-0">
          <Navigation size={18} />
        </div>
        <div className="min-w-0 w-full">
          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Streckendetails</p>
          <div className="grid grid-cols-2 gap-2 mt-1.5 text-xs">
            <div>
              <p className="text-[10px] text-[#6B7280]">Distanz:</p>
              <p className="font-semibold text-slate-800 font-mono mt-0.5">{distanceKm} km</p>
            </div>
            <div>
              <p className="text-[10px] text-[#6B7280]">Dauer:</p>
              <p className="font-semibold text-slate-800 font-mono mt-0.5 truncate" title={formatTrackDuration(summary.totalTrackDurationMs)}>
                {formatTrackDuration(summary.totalTrackDurationMs)}
              </p>
            </div>
          </div>
          {summary.filteredPointsCount > 0 && (
            <div className="mt-2 flex items-center gap-1 text-[9px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded w-fit">
              <ShieldAlert size={9} />
              <span>{summary.filteredPointsCount} Sprünge gefiltert</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
