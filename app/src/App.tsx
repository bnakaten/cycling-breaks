/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { AnalysisResponse, AnalysisSettings, GPXPoint, GPXStop } from './types';
import { DEMO_GPX_XML } from './demoGPX';
import { UploadForm } from './components/UploadForm';
import { StatsDashboard } from './components/StatsDashboard';
import { MapContainer } from './components/MapContainer';
import { StopList } from './components/StopList';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BuildInfo } from './components/BuildInfo';
import { UserMenu } from './components/UserMenu';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Info, Sparkles, FileSpreadsheet, HelpCircle } from 'lucide-react';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const [points, setPoints] = useState<GPXPoint[]>([]);
  const [stops, setStops] = useState<GPXStop[]>([]);
  const [selectedStop, setSelectedStop] = useState<GPXStop | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [filename, setFilename] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadPhase, setUploadPhase] = useState<'uploading' | 'analyzing' | null>(null);

  const { user, isLoading: authLoading, login, stravaConfigured, configureStrava } = useAuth();

  const [showStravaConfig, setShowStravaConfig] = useState(false);
  const [configClientId, setConfigClientId] = useState('');
  const [configClientSecret, setConfigClientSecret] = useState('');
  const [configRedirectUri, setConfigRedirectUri] = useState('https://cycling-breaks.onrender.com/api/auth/strava/callback');
  const [configError, setConfigError] = useState<string | null>(null);
  const [configSaving, setConfigSaving] = useState(false);
  const [showStravaHelp, setShowStravaHelp] = useState(false);

  // Trigger analysis by calling Express REST API back-end
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

  // Load the Munich tour demo directly
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

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigError(null);
    setConfigSaving(true);
    try {
      await configureStrava(configClientId, configClientSecret, configRedirectUri);
      login();
    } catch (err: any) {
      setConfigError(err.message || 'Error saving.');
    } finally {
      setConfigSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] pb-12 flex flex-col font-sans">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="logo.png" alt="Tour Standzeit" className="w-9 h-9 rounded" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[#111827]">Tour Standzeit</h1>
            <p className="text-[10px] text-[#6B7280] font-semibold uppercase tracking-wider">
              Stop-time Analysis &amp; Waypoint Filter
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {(() => {
            if (authLoading) return null;
            if (user) return <UserMenu key="menu" />;
            if (showStravaConfig) {
              return (
                <div key="config" className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-[#FC4C02]">1.</span>
                    <span className="text-[10px] text-[#374151]">Setup Strava API application</span>
                    <button
                      type="button"
                      onClick={() => setShowStravaHelp(true)}
                      className="text-[#9CA3AF] hover:text-[#2563EB] transition cursor-pointer"
                      title="How to get Strava API credentials"
                    >
                      <HelpCircle size={12} />
                    </button>
                  </div>
                  <form onSubmit={handleConfigSubmit} className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold text-[#FC4C02]">2.</span>
                    <input
                      type="text"
                      placeholder="Client ID"
                      value={configClientId}
                      onChange={(e) => setConfigClientId(e.target.value)}
                      className="text-[10px] border border-[#E5E7EB] rounded px-2 py-1 w-28 focus:outline-none focus:border-[#FC4C02]"
                    />
                    <input
                      type="text"
                      placeholder="Client Secret"
                      value={configClientSecret}
                      onChange={(e) => setConfigClientSecret(e.target.value)}
                      className="text-[10px] border border-[#E5E7EB] rounded px-2 py-1 w-32 focus:outline-none focus:border-[#FC4C02]"
                    />
                    <input
                      type="text"
                      placeholder="http://cycling-breaks.onrender.com/api/auth/strava/callback"
                      value={configRedirectUri}
                      onChange={(e) => setConfigRedirectUri(e.target.value)}
                      className="text-[10px] border border-[#E5E7EB] rounded px-2 py-1 w-64 focus:outline-none focus:border-[#FC4C02]"
                    />
                    <button
                      type="submit"
                      disabled={configSaving}
                      className="bg-[#FC4C02] hover:bg-[#E34402] text-white text-[10px] px-2 py-1 rounded font-semibold disabled:opacity-50 transition cursor-pointer"
                    >
                      {configSaving ? 'Saving...' : 'Save & connect'}
                    </button>
                    {stravaConfigured && (
                      <button
                        type="button"
                        onClick={() => { setShowStravaConfig(false); login(); }}
                        className="bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#374151] text-[10px] px-2 py-1 rounded font-semibold transition cursor-pointer"
                      >
                         Connect
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { setShowStravaConfig(false); setConfigError(null); }}
                      className="text-[10px] text-[#6B7280] hover:text-[#111827] px-1 py-1 cursor-pointer"
                    >
                      Cancel
                    </button>
                    {configError && (
                      <span className="text-[10px] text-rose-600 w-full">{configError}</span>
                    )}
                  </form>
                </div>
              );
            }
            return (
              <button
                key="login"
                onClick={() => setShowStravaConfig(true)}
                className="inline-flex items-center gap-1.5 bg-[#FC4C02] hover:bg-[#E34402] text-white text-xs px-3 py-1.5 rounded font-semibold transition cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.01 13.828h4.172" />
                </svg>
                Connect with Strava
              </button>
            );
          })()}
          <button
            onClick={handleLoadDemo}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] hover:border-blue-300 text-[#111827] hover:text-[#2563EB] text-xs px-3 py-1.5 rounded font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={12} className="text-amber-500" />
            Load demo data
          </button>
          
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-[#6B7230] hover:text-[#111827] font-semibold flex items-center gap-1"
          >
            <Info size={11} />
            Maps: &copy; OSM
          </a>
        </div>
      </header>

      {/* 2. Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 pt-6 flex-grow flex flex-col gap-6">
        
        {/* Welcome Callout if no file uploaded */}
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
              
              {/* Feature Tags */}
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

        {/* Dashboard Panels Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: File Upload & Controls */}
          <div className="lg:col-span-4 h-full">
            <UploadForm 
              onAnalyze={handleAnalyze} 
              isLoading={isLoading} 
              error={error}
              uploadProgress={uploadProgress}
              uploadPhase={uploadPhase}
            />
          </div>

          {/* Right Panel: Map, Stats & Table */}
          <div className="lg:col-span-8 space-y-6 flex flex-col h-full">
            
            {/* 2.1. Statistics cards (Only show when data loaded) */}
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

            {/* 2.2. Map Container */}
            <div className="h-[450px] md:h-[500px] w-full min-h-[300px] shrink-0">
              <ErrorBoundary>
                <MapContainer 
                  points={points} 
                  stops={stops} 
                  selectedStop={selectedStop} 
                  onStopSelect={setSelectedStop} 
                />
              </ErrorBoundary>
            </div>

            {/* 2.3. Stop List result table (Only show when data loaded) */}
            {points.length > 0 && (
              <div className="grow">
                <StopList 
                  stops={stops} 
                  selectedStop={selectedStop} 
                  onStopSelect={setSelectedStop} 
                />
              </div>
            )}

          </div>

        </div>

      </main>

      <BuildInfo />

      {showStravaHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowStravaHelp(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-[#111827]">How to get Strava API credentials</h3>
              <button
                onClick={() => setShowStravaHelp(false)}
                className="text-[#9CA3AF] hover:text-[#111827] transition cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Go to <a href="https://strava.com" target="_blank" rel="noopener noreferrer" className="text-[#FC4C02] hover:underline">strava.com</a>, log in, navigate to <strong>Settings</strong> and <strong>My API Application</strong>. Configure the API application as shown below.
              </p>
              <img src="how-to-strava-api.png" alt="How to get Strava API credentials" className="w-full rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
