'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Thermometer, Activity, Clock, AlertTriangle } from 'lucide-react';
import { fetchLatestTelemetry } from '@/lib/api';
import { Telemetry } from '@/lib/types';
import { getAlarmStatus } from '@/lib/alarms';
import { TelemetryChart } from '@/components/TelemetryChart';
import { FirmwareUploader } from '@/components/FirmwareUploader';
import { StatusBadge } from '@/components/StatusBadge';

export default function DeviceDetailPage() {
    const params = useParams();
    const deviceId = typeof params?.id === 'string' ? params.id : '';

    const [history, setHistory] = useState<Telemetry[]>([]);

    const { data: allDevices, isLoading } = useQuery({
        queryKey: ['latestTelemetry'],
        queryFn: fetchLatestTelemetry,
        refetchInterval: 2000,
    });

    const liveDeviceData = allDevices?.find(d => d.deviceId.toLowerCase() === deviceId.toLowerCase());

    const FIXED_LOCATIONS: Record<string, string> = {
        'esp32-001': 'Lobby',
        'esp32-002': 'Laboratory'
    };

    // Memoize the device object construction to prevent object reference churn if data hasn't changed
    const device = useMemo(() => {
        if (!liveDeviceData) return null;
        return {
            ...liveDeviceData,
            location: FIXED_LOCATIONS[deviceId] || liveDeviceData.location || 'Unknown Area'
        };
    }, [liveDeviceData, deviceId]); // Only recreate if `liveDeviceData` reference changes (React Query handles stability usually)

    // Calculate Status (7s rule)
    const isOffline = useMemo(() => {
        if (!device || !device.timestamp) return true;
        const diff = Date.now() - new Date(device.timestamp).getTime();
        return diff > 15000;
    }, [device]);

    // Loop Fix: Depend on timestamp string, not object reference.
    useEffect(() => {
        if (device && device.timestamp && !isOffline) {
            setHistory(prev => {
                const lastEntry = prev[prev.length - 1];
                // Prevent duplicate entries if timestamp matches
                if (lastEntry && lastEntry.timestamp === device.timestamp) return prev;

                const newHistory = [...prev, device];
                if (newHistory.length > 20) return newHistory.slice(newHistory.length - 20);
                return newHistory;
            });
        }
    }, [device?.timestamp, isOffline]); // dependency is the primitive timestamp string

    // View Logic: If strictly offline/not found and we want to show "Offline" state:
    if ((!device && !isLoading) || isOffline) {
        const locationName = FIXED_LOCATIONS[deviceId] ? FIXED_LOCATIONS[deviceId].toUpperCase() : 'DEVICE';

        // If we strictly have NO device data at all (first load):
        if (!device) {
            if (FIXED_LOCATIONS[deviceId]) {
                return (
                    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8 text-center text-neutral-400">
                        <h2 className="text-3xl font-bold mb-4 tracking-tight text-white">{locationName} INVALID</h2>
                        <p className="mb-8">No signal received.</p>
                        <Link href="/" className="px-6 py-3 bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors">Return to Dashboard</Link>
                    </div>
                );
            }
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8 text-center text-neutral-400">
                    <h2 className="text-3xl font-bold mb-4 tracking-tight text-white">DEVICE NOT FOUND</h2>
                    <Link href="/" className="px-6 py-3 bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors">Return to Dashboard</Link>
                </div>
            );
        }
    }

    // Safe alarm check
    const alarmStatus = device ? getAlarmStatus(device.location, device.tempC ?? 0) : 'normal';

    return (
        <div className="min-h-screen bg-black p-6 lg:p-12 text-neutral-100">
            <div className="mx-auto max-w-7xl">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center text-sm text-neutral-500 hover:text-white transition-colors tracking-widest uppercase">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Dashboard
                    </Link>
                </div>

                {alarmStatus === 'alarm' && !isOffline && (
                    <div className="mb-8 p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse">
                        <AlertTriangle className="w-8 h-8 mr-4" />
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">CRITICAL ALERT</h3>
                            <p className="text-sm opacity-80">Temperature threshold exceeded for this zone.</p>
                        </div>
                    </div>
                )}

                {isOffline && (
                    <div className="mb-8 p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 text-neutral-400 flex items-center">
                        <Activity className="w-8 h-8 mr-4 opacity-50" />
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">DEVICE OFFLINE</h3>
                            <p className="text-sm opacity-80">Signal lost over 7 seconds ago.</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-neutral-900 pb-8">
                    <div className="flex items-center gap-8">
                        <div className={`p-6 rounded-3xl ${isOffline ? 'bg-neutral-950/50 grayscale' : alarmStatus === 'alarm' ? 'bg-red-950/20 text-red-500 shadow-[0_0_40px_rgba(220,38,38,0.3)] animate-pulse' : 'bg-neutral-900 text-neutral-400'} transition-all`}>
                            <Thermometer className="w-12 h-12" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter mobile:text-3xl">{device?.location?.toUpperCase()}</h1>
                            <div className="flex items-center space-x-4 text-sm text-neutral-500 font-mono tracking-wide">
                                <span>ID: {device?.deviceId}</span>
                                <span className="text-neutral-800">|</span>
                                <span className={`flex items-center ${isOffline ? 'text-neutral-600' : 'text-emerald-500'}`}>
                                    <Activity className="w-3 h-3 mr-2" />
                                    {isOffline ? 'OFFLINE' : 'ACTIVE'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <StatusBadge variant={isOffline ? 'neutral' : alarmStatus === 'alarm' ? 'danger' : alarmStatus === 'warning' ? 'warning' : 'success'} label={isOffline ? 'OFFLINE' : alarmStatus.toUpperCase()} />
                        <div className="px-4 py-1.5 rounded-full bg-neutral-900 text-neutral-400 text-xs font-bold tracking-wider border border-neutral-800">
                            v{device?.fw}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    <div className="lg:col-span-8 space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-8 rounded-3xl bg-neutral-900/30 border border-neutral-800/50">
                                <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest mb-4">Temperature</p>
                                <div className="flex items-baseline space-x-2">
                                    <span className={`text-6xl font-black tracking-tighter ${isOffline ? 'text-neutral-600' : alarmStatus === 'alarm' ? 'text-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse' : 'text-white'}`}>
                                        {(device?.tempC ?? 0).toFixed(1)}
                                    </span>
                                    <span className="text-2xl text-neutral-600 font-light">°C</span>
                                </div>
                            </div>
                            <div className="p-8 rounded-3xl bg-neutral-900/30 border border-neutral-800/50">
                                <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest mb-4">Pressure</p>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-6xl font-bold tracking-tighter text-neutral-400">
                                        {(device?.pressureHpa ?? 0).toFixed(0)}
                                    </span>
                                    <span className="text-xl text-neutral-700">hPa</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 rounded-3xl bg-neutral-900/30 border border-neutral-800/50 border-t-4 border-t-neutral-800">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold text-white tracking-tight">LIVE TREND</h3>
                                <div className="flex items-center space-x-2 text-xs text-neutral-500">
                                    <Clock className="w-4 h-4" />
                                    <span>REALTIME</span>
                                </div>
                            </div>
                            <div className={`h-[300px] w-full transition-all duration-700 ${isOffline ? 'grayscale opacity-30' : 'invert-[.05] hover:invert-0'}`}>
                                <TelemetryChart data={history} />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="p-6 rounded-3xl bg-neutral-900/30 border border-neutral-800/50">
                            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">Recent Events</h3>
                            <div className="space-y-3">
                                {[...history].reverse().slice(0, 6).map((h, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors">
                                        <span className="text-xs font-mono text-neutral-600">#{20 - i}</span>
                                        <div className="flex items-baseline space-x-1">
                                            <span className={`text-sm font-bold ${h.tempC >= 30 || (h.location === 'Laboratory' && h.tempC >= 5) ? 'text-red-500' : 'text-neutral-300'}`}>
                                                {(h.tempC ?? 0).toFixed(1)}°
                                            </span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${h.tempC >= 30 || (h.location === 'Laboratory' && h.tempC >= 5) ? 'bg-red-900/20 text-red-500' : 'bg-neutral-800 text-neutral-500'}`}>
                                            {h.tempC >= 30 || (h.location === 'Laboratory' && h.tempC >= 5) ? 'ALARM' : 'OK'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-neutral-900/30 border border-neutral-800/50">
                            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">Firmware Update</h3>
                            <FirmwareUploader deviceId={deviceId} />
                            <div className="mt-4 p-4 rounded-xl bg-neutral-950/50 border border-neutral-900 text-xs text-neutral-600 leading-relaxed">
                                Upload binary (.bin) to initiate OTA sequence. System will reboot upon completion.
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
