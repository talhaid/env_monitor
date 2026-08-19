'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchLatestTelemetry } from '@/lib/api';
import { Device } from '@/lib/types';
import { STALE_AFTER_MS } from '@/lib/constants';
import { DeviceCard } from '@/components/DeviceCard';

const FIXED_DEVICES = [
  { deviceId: 'esp32-001', location: 'Lobby' },
  { deviceId: 'esp32-002', location: 'Laboratory' },
];

export default function Home() {
  const { data: latestData, dataUpdatedAt, isError, error } = useQuery({
    queryKey: ['latestTelemetry'],
    queryFn: fetchLatestTelemetry,
    refetchInterval: 5000,
  });

  const devices: Device[] = FIXED_DEVICES.map(fixed => {
    const live = latestData?.find(
      d => d.deviceId.toLowerCase().trim() === fixed.deviceId.toLowerCase().trim()
    );

    // A node is online while its last reading is newer than the stale
    // threshold, measured against the moment we received the poll response.
    // The threshold spans a few poll intervals so latency does not flicker it.
    const lastSeen = live?.timestamp ? new Date(live.timestamp).getTime() : 0;
    const isOffline = !live || dataUpdatedAt - lastSeen > STALE_AFTER_MS;

    if (live && !isOffline) {
      return { ...live, location: fixed.location, lastSeen, status: 'online', alarmStatus: 'normal' };
    }

    // Offline nodes render with zeroed readings rather than stale ones, so the
    // card never shows a number that looks current.
    return {
      ...fixed,
      tempC: 0,
      pressureHpa: 0,
      fw: 'Unknown',
      lastSeen,
      status: 'offline',
      alarmStatus: 'normal',
    };
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
