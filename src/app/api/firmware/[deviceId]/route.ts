
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

        // Where the OTA server picks binaries up from. Set FIRMWARE_DIR in
        // deployment; falls back to ./firmware for local development.
        const uploadDir = process.env.FIRMWARE_DIR ?? path.join(process.cwd(), 'firmware');

        await mkdir(uploadDir, { recursive: true });

        // The filename comes from the client, so strip any path segments before
        // joining it to the upload directory.
        const filename = path.basename(file.name);
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
