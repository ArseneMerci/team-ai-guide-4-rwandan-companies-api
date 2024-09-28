/* eslint-disable no-console */
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { groqTranscribeAudioJob, speechifyText2AudioJob, upload } from '../util';

const router = express.Router();

router.post('/', upload, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file uploaded.' });
        }
        // Get the file path and name
        const originalFilePath = req.file.path;
        const originalFileName = req.file.filename;
        const originalFileFormat = path.extname(originalFileName);
        // create a groq transcription from the audio file
        const transcription: string = await groqTranscribeAudioJob(originalFilePath);
        console.log('Transcription:', transcription);
        // create an audio file from the transcription text using speechify
        const { audio_data: audioData, audio_format: audioFormat } = await speechifyText2AudioJob(transcription, originalFileFormat);

        // send the audio file back to the client
        const transcribedAudioBuffer = Buffer.from(audioData, 'base64');
        const transcribedAudioFileName = `${originalFileName}-trans-${Date.now()}.wav`;
        const transcribedAudioFilePath = path.join(process.env.UPLOAD_PATH, transcribedAudioFileName);

        fs.writeFileSync(transcribedAudioFilePath, transcribedAudioBuffer);

        res.setHeader('Content-Disposition', `inline; filename="${transcribedAudioFileName}"`);
        res.setHeader('Content-Type', `audio/${audioFormat}`);

        const fileStream = fs.createReadStream(transcribedAudioFilePath);
        fileStream.pipe(res);

        fileStream.on('close', () => {
            // clean up the transcribed file
            fs.unlink(transcribedAudioFilePath, (err) => {
                if (err) {
                    console.error('Error deleting transcribed file:', err);
                }
            });
            // clean up the original file
            fs.unlink(originalFilePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });
        });
        console.log('Operation completed successfully');
    } catch (error) {
        res.status(500).json({ error: 'Transcription error', details: error.message });
    }
});

export default router;
