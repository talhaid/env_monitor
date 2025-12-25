
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ deviceId: string }> }
) {
    try {
        const { deviceId } = await params;
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.name.endsWith('.bin')) {
            return NextResponse.json(
                { error: 'Invalid file type. Only .bin files are allowed.' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Target path configuration
        // Production path: /root/env-monitor/firmware/
        // Fallback (Local Dev): ./firmware/
        let uploadDir = '/root/env-monitor/firmware/';

        // Check if production path exists/is writable, else fallback to local
        try {
            // minimal check: if we are not on linux root, this likely fails or doesn't exist
            if (!fs.existsSync('/root/env-monitor')) {
                uploadDir = path.join(process.cwd(), 'firmware');
            }
        } catch (e) {
            uploadDir = path.join(process.cwd(), 'firmware');
        }

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        // Force filename to match the device ID or keep original?
        // User scp example: scp esp32-002.bin ...
        // Let's use the uploaded filename to be safe, but maybe sanitize it
        const filename = file.name;
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);

        console.log(`Firmware uploaded for ${deviceId}: ${filepath}`);

        return NextResponse.json({
            success: true,
            message: 'Firmware uploaded successfully',
            path: filepath
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
