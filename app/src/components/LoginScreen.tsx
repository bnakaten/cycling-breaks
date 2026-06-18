import React from 'react';
import { useAuth } from './AuthContext';

export function LoginScreen() {
  const { login, isLoading } = useAuth();

  const params = new URLSearchParams(window.location.search);
  const loginError = params.get('loginError');

  const handleStravaLogin = async () => {
    await login();
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center space-y-4">
          <img src="logo.png" alt="Tour Standzeit" className="w-16 h-16 rounded-xl mx-auto" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
              Tour Standzeit
            </h1>
            <p className="text-sm text-[#6B7280] mt-2">
              Stop-time Analysis &amp; Waypoint Filter
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 space-y-4">
          <p className="text-xs text-[#6B7280] text-center leading-relaxed">
            Connect your Strava account to upload GPX files and
            analyze your stop times.
          </p>

          {loginError && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-700 break-all">
              Login failed: {loginError}
            </div>
          )}

          <button
            onClick={handleStravaLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#FC4C02] hover:bg-[#E34402] text-white rounded font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.01 13.828h4.172" />
            </svg>
            {isLoading ? 'Connecting...' : 'Connect with Strava'}
          </button>
        </div>
      </div>
    </div>
  );
}
