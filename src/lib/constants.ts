/**
 * A device drops to "offline" once its newest reading is older than this.
 * Kept a few poll intervals wide so latency or jitter does not flicker the UI.
 */
export const STALE_AFTER_MS = 15_000;

/** Number of readings kept in the in-memory trend buffer on the device page. */
export const HISTORY_LENGTH = 20;
