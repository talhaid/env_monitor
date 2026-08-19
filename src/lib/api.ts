import axios from 'axios';
import { Telemetry, Config } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
});

export const fetchLatestTelemetry = async (): Promise<Telemetry[]> => {
    const response = await api.get('/api/latest');
    const data = Array.isArray(response.data) ? response.data : [response.data];

    // Deduplicate by deviceId, keeping the last occurrence (assuming chronological order)
    const uniqueDevices = new Map<string, Telemetry>();

    data.forEach((item: Telemetry) => {
        if (!item || !item.deviceId) return;

        // Keep the server's timestamp: staleness is measured against it, so
        // overwriting it here would make every device look permanently online.
        // Only stand in for it when the API omits it entirely.
        uniqueDevices.set(item.deviceId, {
            ...item,
            timestamp: item.timestamp ?? new Date().toISOString(),
        });
    });

    return Array.from(uniqueDevices.values());
};

export const fetchConfig = async (): Promise<Config> => {
    const response = await api.get('/api/config');
    return response.data;
};

export const uploadFirmware = async (deviceId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('deviceId', deviceId);

    // Use axios directly to hit the Next.js API route (relative path)
    // instead of the external API_BASE_URL (port 3000)
    const response = await axios.post(`/api/firmware/${deviceId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
