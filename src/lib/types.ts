export interface Telemetry {
    deviceId: string;
    location: string;
    tempC: number;
    pressureHpa: number;
    fw: string;
    timestamp?: string; // Appending timestamp client-side if not provided
    status?: 'online' | 'offline';
}

export type DeviceStatus = 'online' | 'offline';
export type AlarmStatus = 'normal' | 'warning' | 'alarm';

export interface Device extends Telemetry {
    lastSeen: number; // Timestamp
    status: DeviceStatus;
    alarmStatus: AlarmStatus;
}

export interface Config {
    wifiSsid?: string;
    pollInterval?: number;
    // Add other config fields if known
}
