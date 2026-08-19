# env_monitor

A real-time environmental monitoring dashboard for ESP32 sensor nodes. Devices
report temperature and pressure over the network; the dashboard polls the
telemetry API, evaluates each reading against per-location alarm thresholds, and
lets you push a new firmware binary to a node over the air.

Originally built during an internship for a two-node deployment, so the device
list and its thresholds are still defined in code — see
[Known limitations](#known-limitations).

## Features

- **Live device grid** — one card per node with current temperature, alarm state
  and firmware version, refreshed every 5 seconds.
- **Threshold alarms** — each location defines its own normal band. A reading
  outside it raises `warning`, past the hard limit raises `alarm`. A cold-storage
  room and a lobby need different rules, so the thresholds are per-location
  rather than global.
- **Offline detection** — a node whose newest reading is older than the stale
  threshold drops to `offline` instead of showing a number that looks current.
- **Trend chart** — rolling in-memory buffer of the last 20 readings per device.
- **OTA firmware upload** — drop a `.bin` in the browser and it lands in the
  directory your OTA server serves from.

## Architecture

```
ESP32 node  ──HTTP──▶  Telemetry API  ──poll──▶  Next.js dashboard
   │                   /api/latest                     │
   │                   /api/config                     │
   └──────────────OTA fetch──────────────  /api/firmware/[deviceId]
                                            writes .bin to FIRMWARE_DIR
```

The dashboard is read-only against the telemetry API. The one write path is the
firmware upload, which is handled by a Next.js route handler rather than the
telemetry API, so the binary never has to make an extra hop.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
TanStack Query · Chart.js · Axios

## Getting started

```bash
git clone https://github.com/talhaid/env_monitor.git
cd env_monitor
npm install
cp .env.example .env.local   # then point NEXT_PUBLIC_API_URL at your API
npm run dev
```

Open http://localhost:3000.

### Configuration

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | yes | Base URL of the telemetry API. The dashboard polls `<url>/api/latest`. |
| `FIRMWARE_DIR` | no | Where uploaded `.bin` files are written. Defaults to `./firmware`. |

### Telemetry API contract

The dashboard expects `GET /api/latest` to return an object, or an array of
objects, shaped like:

```json
{
  "deviceId": "esp32-001",
  "location": "Lobby",
  "tempC": 24.3,
  "pressureHpa": 1013,
  "fw": "1.0.4",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

Readings are deduplicated by `deviceId`, keeping the most recent per device.

## Project layout

```
src/
  app/
    page.tsx                        device grid
    device/[id]/page.tsx            detail view, trend chart, OTA upload
    api/firmware/[deviceId]/route.ts firmware upload handler
  components/                       DeviceCard, TelemetryChart, FirmwareUploader
  lib/
    api.ts                          telemetry client
    alarms.ts                       threshold rules per location
    constants.ts                    stale threshold, history length
    types.ts
```

## Known limitations

- Devices and their alarm thresholds are defined in code rather than loaded from
  configuration.
- The firmware upload endpoint has no authentication and no size limit — fine
  behind a private network, not for a public deployment.
- Trend history lives in component state, so it resets on navigation. There is no
  historical storage.

## License

MIT — see [LICENSE](LICENSE).
