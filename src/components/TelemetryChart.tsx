'use client';

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js';
import { Telemetry } from '@/lib/types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface TelemetryChartProps {
    data: Telemetry[];
}

export function TelemetryChart({ data }: TelemetryChartProps) {
    // Sort data by timestamp if available, otherwise assume receiving order (or reverse)
    // Since we might fetch "latest N", we assume they are time-series.
    // We'll reverse if they come latest-first.
    // For now, let's render as is.

    const chartData = {
        labels: data.map((_, i) => `T-${data.length - i}`), // Placeholder labels if no timestamps
        datasets: [
            {
                label: 'Temperature (°C)',
                data: data.map(d => d.tempC),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: false,
            },
        },
    };

    return <Line options={options} data={chartData} />;
}
