import { Telemetry } from '@/lib/types';
import { getAlarmStatus } from '@/lib/alarms';
import { StatusBadge } from './StatusBadge';
import Link from 'next/link';
import { Thermometer, Activity, Wifi } from 'lucide-react';

interface DeviceCardProps {
    device: Telemetry;
}

export function DeviceCard({ device }: DeviceCardProps) {
    // Safety check for device object
    if (!device) return null;

    const alarmStatus = getAlarmStatus(device.location || 'Unknown', device.tempC ?? 0);
    const isOffline = device.status === 'offline';

    // Status color logic helper
    const getStatusStyles = () => {
        if (isOffline) return 'text-neutral-600 bg-neutral-900 border-neutral-800';
        if (alarmStatus === 'alarm') return 'text-red-500 bg-red-950/30 border-red-900/50 animate-pulse';
        if (alarmStatus === 'warning') return 'text-amber-500 bg-amber-950/30 border-amber-900/50';
        return 'text-emerald-500 bg-emerald-950/30 border-emerald-900/50';
    };

    return (
        <Link href={`/device/${device.deviceId}`}>
            <div className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full border ${isOffline ? 'bg-neutral-950/50 border-neutral-900' :
                    alarmStatus === 'alarm' ? 'bg-red-950/10 border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.2)]' :
                        'bg-neutral-900/40 border-neutral-800 hover:bg-neutral-900/60 hover:border-neutral-700'
                }`}>

                <div className="flex items-start justify-between mb-8">
                    {/* Icon Box */}
                    <div className={`p-4 rounded-2xl border ${getStatusStyles()} transition-colors`}>
                        <Thermometer className="w-8 h-8" />
                    </div>

                    {/* Status Badge */}
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${isOffline ? 'bg-neutral-900 text-neutral-600 border-neutral-800' :
                            alarmStatus === 'alarm' ? 'bg-red-500 text-white border-red-600' :
                                'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                        {isOffline ? 'OFFLINE' : alarmStatus}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-3xl font-black text-white tracking-tight mb-2">{device.location || 'Unknown Location'}</h3>
                    <p className="text-sm text-neutral-500 font-mono tracking-wide">{device.deviceId || 'ID: --'}</p>
                </div>

                <div>
                    <p className="text-xs font-bold text-neutral-600 uppercase tracking-widest mb-1">Temperature</p>
                    <div className="flex items-baseline space-x-2">
                        <span className={`text-6xl font-bold tracking-tighter ${isOffline ? 'text-neutral-800' :
                                alarmStatus === 'alarm' ? 'text-red-500' : 'text-neutral-100'
                            }`}>
                            {(device.tempC ?? 0).toFixed(1)}
                        </span>
                        <span className="text-xl text-neutral-700">°C</span>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 pt-6 border-t border-neutral-800/50 flex items-center justify-between text-xs text-neutral-600 font-medium">
                    <div className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-neutral-700' : 'bg-emerald-500 animate-pulse'}`} />
                        <span>{isOffline ? 'NO CONNECTION' : 'LIVE SIGNAL'}</span>
                    </div>
                    <span>v{device.fw || '--'}</span>
                </div>
            </div>
        </Link>
    );
}
