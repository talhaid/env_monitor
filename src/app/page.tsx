'use client';

import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { fetchLatestTelemetry } from '@/lib/api';
import { DeviceCard } from '@/components/DeviceCard';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { data: latestData, isLoading, isError, error } = useQuery({
    queryKey: ['latestTelemetry'],
    queryFn: fetchLatestTelemetry,
    refetchInterval: 5000,
  });



  const FIXED_DEVICES = [
    { deviceId: 'esp32-001', location: 'Lobby' },
    { deviceId: 'esp32-002', location: 'Laboratory' },
  ];

  const devices = FIXED_DEVICES.map(fixed => {
    // Case-insensitive match with trim
    const live = latestData?.find(d => d.deviceId.toLowerCase().trim() === fixed.deviceId.toLowerCase().trim());

    // Offline Logic: > 7 seconds from timestamp
    let isOffline = true;
    if (live && live.timestamp) {
      const lastSeen = new Date(live.timestamp).getTime();
      const now = Date.now();
      const diff = now - lastSeen;
      // If diff is less than 15000ms (15s), it is ONLINE.
      // Relaxed from 7s to prevent flickering due to poll jitter or latency
      if (diff < 15000) {
        isOffline = false;
      }
    } else if (live) {
      // If live exists but no timestamp? (API ensures it now), treat as fresh if just fetched?
      // API sets it to 'now' if missing, so diff would be 0.
      isOffline = false;
    }

    if (live && !isOffline) {
      // Force the nice location name AND include status 'online'
      return { ...live, location: fixed.location, status: 'online' };
    }

    // Fallback to offline state
    // If we have stale live data, we might want to show it but greyed out?
    // Requirement: "go offline... and there is not new one". Use offline style.
    return {
      ...fixed,
      // If we have stale data, render it but marked offline? Or zero it out?
      // Previous code zeroed it out. Let's keep it zeroed for clean "OFFLINE" look or 
      // preserve last known values? "Pressure display... removed". 
      // Let's stick to safe defaults for offline.
      tempC: live ? live.tempC : 0,
      pressureHpa: live ? live.pressureHpa : 0,
      fw: live ? live.fw : 'Unknown',
      timestamp: live ? live.timestamp : undefined,
      status: 'offline',
      alarmStatus: 'normal'
    } as any;
  });



  return (
    <main className="min-h-screen bg-black p-8 md:p-16">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-16 flex items-end justify-between border-b border-neutral-800/50 pb-8">
          <div>
            <h1 className="text-6xl font-black tracking-tighter text-white mb-2 flex items-baseline">
              MONITOR
              <span className="text-neutral-600 ml-2">v0.1</span>
            </h1>
            <p className="text-neutral-400 font-mono text-xs tracking-[0.2em] uppercase">System Status Dashboard</p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-neutral-900/80 rounded-full text-[10px] text-neutral-400 font-bold border border-neutral-800 tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
              <span>SYSTEM ONLINE</span>
            </div>
          </div>
        </header>

        {isError && (
          <div className="mb-12 p-6 bg-red-950/20 border-l-4 border-red-900 text-red-700 font-mono">
            ERR: {(error as Error).message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {devices.map((device) => (
            <div key={device.deviceId} className="min-h-[400px]">
              <DeviceCard device={device} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
