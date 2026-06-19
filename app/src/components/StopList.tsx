/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React, { useState, useMemo } from 'react';
import { GPXStop } from '../types';
import { MapPin, Clock, ArrowUpDown, Timer, RefreshCw } from 'lucide-react';

interface StopListProps {
  stops: GPXStop[];
  selectedStop: GPXStop | null;
  onStopSelect: (stop: GPXStop | null) => void;
  timezone?: string;
}

type SortField = 'index' | 'startTime' | 'durationMs' | 'maxDistanceDelta' | 'pointCount';
type SortOrder = 'asc' | 'desc';

export function StopList({ stops, selectedStop, onStopSelect, timezone }: StopListProps) {
  const [sortField, setSortField] = useState<SortField>('startTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Handle head cell click for sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Sort stops based on user choice
  const sortedStops = useMemo(() => {
    const list = [...stops];
    return list.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'index') {
        const idxA = stops.indexOf(a);
        const idxB = stops.indexOf(b);
        valA = idxA;
        valB = idxB;
      } else {
        valA = a[sortField];
        valB = b[sortField];
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [stops, sortField, sortOrder]);

  const displayTime = (isoString: string) => {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    if (timezone) options.timeZone = timezone;
    return date.toLocaleTimeString([], options);
  };

  const displayDate = (isoString: string) => {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    if (timezone) options.timeZone = timezone;
    return date.toLocaleDateString([], options);
  };

  if (stops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-[#E5E7EB] rounded-lg">
        <div className="w-9 h-9 rounded bg-[#F9FAFB] flex items-center justify-center text-slate-400 mb-2 border border-[#E5E7EB]">
          <Clock size={16} />
        </div>
        <p className="text-xs font-semibold text-slate-800">No stop times detected</p>
        <p className="text-[11px] text-[#6B7280] max-w-xs mt-1 leading-relaxed">
          Adjust the parameters or upload a different GPX track.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header Info */}
      <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
        <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
          <MapPin size={14} className="text-[#2563EB]" />
          Stop times ({stops.length})
        </h3>
        <span className="text-[10px] text-[#6B7280]">
          Click a row to focus
        </span>
      </div>

      {/* Responsive Scrollable Container */}
      <div className="overflow-x-auto grow">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-[#6B7280] text-[10px] font-bold uppercase tracking-wider bg-[#F9FAFB] select-none">
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-50 hover:text-slate-800 transition"
                onClick={() => handleSort('index')}
              >
                <div className="flex items-center gap-1">
                  # <ArrowUpDown size={10} />
                </div>
              </th>
              
              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-50 hover:text-slate-800 transition"
                onClick={() => handleSort('startTime')}
              >
                <div className="flex items-center gap-1">
                  Start time <ArrowUpDown size={10} />
                </div>
              </th>

              <th className="py-3 px-4 text-[#6B7280]">End time</th>

              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-50 hover:text-slate-800 transition"
                onClick={() => handleSort('durationMs')}
              >
                <div className="flex items-center gap-1">
                  Duration <ArrowUpDown size={10} />
                </div>
              </th>

              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-50 hover:text-slate-800 transition"
                onClick={() => handleSort('maxDistanceDelta')}
              >
                <div className="flex items-center gap-1">
                  Scatter <ArrowUpDown size={10} />
                </div>
              </th>

              <th 
                className="py-3 px-4 cursor-pointer hover:bg-slate-50 hover:text-slate-800 transition"
                onClick={() => handleSort('pointCount')}
              >
                <div className="flex items-center gap-1">
                  Points <ArrowUpDown size={10} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] text-xs">
            {sortedStops.map((stop) => {
              const originalIndex = stops.indexOf(stop);
              const isActive = selectedStop?.id === stop.id;

              return (
                <tr
                  key={stop.id}
                  onClick={() => onStopSelect(isActive ? null : stop)}
                  className={`cursor-pointer transition-colors duration-150 group ${
                    isActive 
                      ? 'bg-blue-50/80 hover:bg-blue-50 text-blue-950 font-medium' 
                      : 'hover:bg-slate-50/70 text-slate-750'
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${
                      isActive 
                        ? 'bg-[#2563EB] text-white' 
                        : 'bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]'
                    }`}>
                      {originalIndex + 1}
                    </span>
                  </td>
                  
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#111827]">
                      {displayTime(stop.startTime)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{displayDate(stop.startTime)}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="font-semibold text-slate-800">{displayTime(stop.endTime)}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{displayDate(stop.endTime)}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-semibold rounded ${
                      isActive 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-[#F9FAFB] text-slate-700 border border-[#E5E7EB]'
                    }`}>
                      <Timer size={11} />
                      {stop.durationFormatted}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-mono">
                    &le; {stop.maxDistanceDelta} m
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-mono">
                    {stop.pointCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
