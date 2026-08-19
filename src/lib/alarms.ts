import { AlarmStatus } from './types';

export const LOCATIONS = {
    LOBBY: 'Lobby',
    LABORATORY: 'Laboratory',
};

export function getAlarmStatus(location: string, tempC: number): AlarmStatus {
    const loc = location || '';

    // Lobby (esp32-001): Normal 22-26, Alarm >= 30
    if (loc === LOCATIONS.LOBBY) {
        if (tempC >= 30) return 'alarm';
        if (tempC >= 22 && tempC <= 26) return 'normal';
        return 'warning'; // Any other value
    }

    // Laboratory (esp32-002): Normal 0-4, Alarm >= 5
    if (loc === LOCATIONS.LABORATORY) {
        if (tempC >= 5) return 'alarm';
        if (tempC >= 0 && tempC <= 4) return 'normal';
        return 'warning';
    }

    return 'normal';
}
