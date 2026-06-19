/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export interface GPXPoint {
  lat: number;
  lon: number;
  ele?: number; // Elevation in meters
  time: string; // ISO timestamp string
  timestampMs: number; // millisecond timestamp for easy calculations
  
  // Calculated relative to previous point
  distanceFromPrev?: number; // in meters
  timeDiffFromPrev?: number; // in seconds
  speedFromPrev?: number; // in m/s
  cumulativeDistance?: number; // in meters
}

export interface GPXStop {
  id: string;
  startIndex: number;
  endIndex: number;
  startTime: string;
  endTime: string;
  durationMs: number;
  durationFormatted: string;
  lat: number; // Center latitude of the stop
  lon: number; // Center longitude of the stop
  avgEle?: number; // Average elevation
  maxDistanceDelta: number; // Maximum distance of any point in the stop from the center
  pointCount: number;
}

export type DetectionMethod = 'distance' | 'speed' | 'hybrid';

export interface AnalysisSettings {
  minDurationMinutes: number;
  maxRadiusMeters: number;
  detectionMethod: DetectionMethod;
  gpsFilterOutliers: boolean; // Flag to enable outlier filtering (e.g., speed > 150 km/h)
  tolerateShortMovements: boolean; // Flag to enable merging nearby stops with temporary short movements
}

export interface AnalysisRequest {
  filename: string;
  content: string; // Raw XML content of GPX
  settings: AnalysisSettings;
}

export interface AnalysisSummary {
  totalStopDurationMs: number;
  totalStopDurationFormatted: string;
  totalTrackDurationMs: number;
  totalPoints: number;
  filteredPointsCount: number;
  totalDistanceMeters: number;
  stopCount: number;
  stopRatioPercent: number; // Percentage of time spent stationary
}

export interface AnalysisResponse {
  success: boolean;
  error?: string;
  points: GPXPoint[];
  stops: GPXStop[];
  summary: AnalysisSummary;
  timezone?: string;
}

export interface AuthUser {
  userId: number;
  stravaAthleteId: number;
  firstname: string;
  lastname: string;
}
