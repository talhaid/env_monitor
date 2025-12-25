import axios from 'axios';
import { Telemetry, Config } from './types';

const API_BASE_URL = 'http://165.227.69.142:3000';

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

        const processedItem = {
            ...item,
            // FORCE client-side timestamp to prevent clock skew issues
            timestamp: new Date().toISOString()
        };
        uniqueDevices.set(item.deviceId, processedItem);
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

    const response = await api.post(`/api/firmware/${deviceId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
