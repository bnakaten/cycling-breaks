/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React, { useState } from 'react';
import { AnalysisResponse, AnalysisSettings, GPXPoint, GPXStop } from '../types';
import { DEMO_GPX_XML } from '../demoGPX';
import { UploadForm } from '../components/UploadForm';
import { StatsDashboard } from '../components/StatsDashboard';
import { MapContainer } from '../components/MapContainer';
import { StopList } from '../components/StopList';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Sparkles, FileSpreadsheet } from 'lucide-react';

export function HomePage() {
  const [points, setPoints] = useState<GPXPoint[]>([]);
  const [stops, setStops] = useState<GPXStop[]>([]);
  const [selectedStop, setSelectedStop] = useState<GPXStop | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [filename, setFilename] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadPhase, setUploadPhase] = useState<'uploading' | 'analyzing' | null>(null);

  const handleAnalyze = (content: string, name: string, settings: AnalysisSettings) => {
    setIsLoading(true);
    setError(null);
    setSelectedStop(null);
    setUploadProgress(0);
    setUploadPhase('uploading');

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result: AnalysisResponse = JSON.parse(xhr.responseText);
          if (result.success) {
            setPoints(result.points);
            setStops(result.stops);
            setSummary(result.summary);
            setTimezone(result.timezone || '');
            setFilename(name);
          } else {
            throw new Error(result.error || 'Unknown error during analysis.');
          }
        } catch (parseErr: any) {
          console.error(parseErr);
          setError(parseErr.message || 'Error processing the response.');
        }
      } else {
        let errMsg = `Network error (${xhr.status})`;
        try {
          const errDetail = JSON.parse(xhr.responseText);
          errMsg = errDetail.error || errMsg;
        } catch {}
        setError(errMsg);
      }
      setIsLoading(false);
      setUploadProgress(null);
      setUploadPhase(null);
    });

    xhr.addEventListener('error', () => {
      setError('Connection to analysis server failed.');
      setIsLoading(false);
      setUploadProgress(null);
      setUploadPhase(null);
    });

    xhr.addEventListener('abort', () => {
      setIsLoading(false);
      setUploadProgress(null);
      setUploadPhase(null);
    });

    xhr.open('POST', '/api/analyze');
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
        setUploadPhase('analyzing');
      }
    });

    xhr.send(JSON.stringify({ content, settings }));
  };

  const handleLoadDemo = () => {
    const defaultSettings: AnalysisSettings = {
      minDurationMinutes: 5,
      maxRadiusMeters: 15,
      detectionMethod: 'hybrid',
      gpsFilterOutliers: true,
      tolerateShortMovements: true,
    };
    handleAnalyze(DEMO_GPX_XML, 'muenchen_altstadt_tour.gpx', defaultSettings);
  };

  return (
    <>
      {points.length === 0 && (
        <div className="col-span-full bg-white border border-[#E5E7EB] rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider text-blue-700 bg-blue-50 uppercase border border-blue-100">
              Welcome to Tour Standzeit
            </span>
            <h2 className="text-lg md:text-xl font-bold text-[#111827] tracking-tight">
              Analyze stop times from recorded GPX routes
            </h2>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              This application lets you upload GPS data paths and search them in detail for
              stop times (pauses/stops). The algorithm eliminates GPS jitter,
              filters signal outliers and lists all rest periods in both tabular form and visualised on an interactive OSM map.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className="text-[10px] bg-slate-50 text-[#6B7280] px-2 py-0.5 rounded border border-[#E5E7EB]">
                Adjustable minimum duration
              </span>
              <span className="text-[10px] bg-slate-50 text-[#6B7280] px-2 py-0.5 rounded border border-[#E5E7EB]">
                Selectable maximum radius
              </span>
              <span className="text-[10px] bg-slate-50 text-[#6B7280] px-2 py-0.5 rounded border border-[#E5E7EB]">
                Interactive map sections
              </span>
              <span className="text-[10px] bg-slate-50 text-[#6B7280] px-2 py-0.5 rounded border border-[#E5E7EB]">
                Hybrid calculation
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 min-w-[200px] w-full md:w-auto">
            <button
              onClick={handleLoadDemo}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded font-semibold text-xs transition duration-150 tracking-wide text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} />
              Load demo data
            </button>
            <p className="text-[10px] text-[#6B7280] text-center">
              Test directly with our historic walking tour.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 h-full">
          <UploadForm
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            error={error}
            uploadProgress={uploadProgress}
            uploadPhase={uploadPhase}
          />
        </div>

        <div className="lg:col-span-8 space-y-6 flex flex-col h-full">
          {points.length > 0 && summary && (
            <div className="animate-fade-in-down">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <FileSpreadsheet size={15} />
                  <span className="text-xs font-semibold text-slate-500">
                    Results for: <strong className="text-slate-800 font-bold">{filename}</strong>
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  ● Analysis complete
                </span>
              </div>
              <StatsDashboard summary={summary} />
            </div>
          )}

          <div className="h-[450px] md:h-[500px] w-full min-h-[300px] shrink-0">
            <ErrorBoundary>
              <MapContainer
                points={points}
                stops={stops}
                selectedStop={selectedStop}
                onStopSelect={setSelectedStop}
                timezone={timezone}
              />
            </ErrorBoundary>
          </div>

          {points.length > 0 && (
            <div className="grow">
              <StopList
                stops={stops}
                selectedStop={selectedStop}
                onStopSelect={setSelectedStop}
                timezone={timezone}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
