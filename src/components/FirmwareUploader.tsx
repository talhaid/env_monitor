'use client';

import { useState } from 'react';
import { uploadFirmware } from '@/lib/api';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FirmwareUploaderProps {
    deviceId: string;
}

export function FirmwareUploader({ deviceId }: FirmwareUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus('idle');

        try {
            await uploadFirmware(deviceId, file);
            setStatus('success');
            setMessage('Firmware uploaded successfully. Rebooting...');
            setFile(null);
        } catch (err) {
            setStatus('error');
            setMessage(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="relative group">
                <input
                    type="file"
                    accept=".bin"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                />
                <div className={`
            flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all duration-300
            ${file
                        ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400'
                        : 'border-neutral-800 bg-neutral-900/50 text-neutral-500 group-hover:bg-neutral-900 group-hover:border-neutral-700 group-hover:text-neutral-300'}
        `}>
                    {file ? (
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="w-6 h-6" />
                            <span className="font-mono text-sm tracking-wide text-white">{file.name}</span>
                        </div>
                    ) : (
                        <>
                            <UploadCloud className="w-8 h-8 mb-3" />
                            <span className="text-xs font-bold tracking-widest uppercase">Select Firmware (.bin)</span>
                        </>
                    )}
                </div>
            </div>

            {file && (
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`
            w-full mt-4 py-3 px-4 rounded-xl font-bold tracking-widest uppercase text-xs transition-all
            ${uploading
                            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            : 'bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/10'}
          `}
                >
                    {uploading ? (
                        <span className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                        </span>
                    ) : (
                        'Start OTA Flash'
                    )}
                </button>
            )}

            {status === 'success' && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {message}
                </div>
            )}

            {status === 'error' && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {message}
                </div>
            )}
        </div>
    );
}
