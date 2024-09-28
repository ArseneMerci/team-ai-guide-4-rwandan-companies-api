/* eslint-disable @typescript-eslint/typedef */
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import Groq from 'groq-sdk';
import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';

export const createUploadDirectory = () => {
    if (!fs.existsSync(process.env.UPLOAD_PATH)) {
        fs.mkdirSync(process.env.UPLOAD_PATH);
    }
};

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, process.env.UPLOAD_PATH);
    },
    filename: function (_req, file, cb) {
        cb(null, 'audio-' + Date.now() + path.extname(file.originalname));
    },
});

export const upload = (req: Request, res: Response, next: NextFunction) => {
    const multerUpload = multer({
        storage: storage,
        fileFilter: (_req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            if (ext !== '.mp3' && ext !== '.wav' && ext !== '.ogg') {
                const error = new Error('Only audio files are allowed');
                (error as any).code = 'INVALID_FILE_TYPE';
                return cb(error);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 1024 * 1024 * 25, // 25MB file size limit
        },
    }).single('audio');

    multerUpload(req, res, (err: any) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({ error: 'File upload error', details: err.message });
            } else {
                if (err.code === 'INVALID_FILE_TYPE') {
                    return res.status(400).json({ error: 'Invalid file type', details: err.message });
                }
                return res.status(500).json({ error: 'Unknown error', details: err.message });
            }
        }
        next();
    });
};

export const groqTranscribeAudioJob = async (filePath: string): Promise<string> => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    return await groq.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'distil-whisper-large-v3-en',
        response_format: 'text',
        language: 'en',
        temperature: 0.0,
    }) as unknown as string;
};

export const speechifyText2AudioJob = async (transcribedText: string, format: string): Promise <{ audio_data: string; audio_format: string}> => {
    const url = process.env.SPEECHIFY_API_URL;
    const options = {
        method: 'POST',
        headers: {
            accept: '*/*',
            'content-type': 'application/json',
            Authorization: `Bearer ${process.env.SPEECHIFY_API_KEY}`,
        },
        body: JSON.stringify({
            'audio_format': format.startsWith('.') ? format.slice(1) : format,
            'input': `${transcribedText} bitch`,
            'language': 'en-US',
            'model': 'simba-english',
            'options': {
                'loudness_normalization': true,
            },
            'voice_id': 'henry',
        }),
    };
    const response = await fetch(url, options);
    return response.json();
};
