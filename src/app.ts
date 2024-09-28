import express from 'express';
const router = express.Router();
import cors from 'cors';
import { errorHandler, jsonParseErrorHandler, methodNotAllowedErrorHandler, notFoundErrorHandler, payloadTooLargeErrorHandler } from './middleware/error_middleware';

import audio from './routes/audio';
import { createUploadDirectory } from './util';

const createServer = (app) => {
    app.disable('x-powered-by');
    app.use(cors());
    app.use(express.json({ limit: 26214400 }));
    app.use(jsonParseErrorHandler);
    app.use(express.urlencoded({ limit: 26214400, extended: false }));
    app.use(payloadTooLargeErrorHandler);
    createUploadDirectory();

    app.use('/audio', audio, router.all('/', methodNotAllowedErrorHandler));

    // Middleware error handlers
    app.use(notFoundErrorHandler);
    app.use(errorHandler);
};

export default createServer;
