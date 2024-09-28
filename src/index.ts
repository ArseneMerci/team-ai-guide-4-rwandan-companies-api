import express from 'express';
import dotenv from 'dotenv';
import { Server } from 'http';
import createServer from './app';
dotenv.config();

const app = express();

// set app port
const port = parseInt(process.env.PORT) || 8000;

let server: Server;
(async () => {
    createServer(app);
    server = app.listen(port, () => {
        console.log(`Service listening on port ${port}`);
    });
})().catch(err => {
    console.error('Error on service startup:', err);
});

// Kill processes on process end
const closeGracefully = async (signal) => {
    console.log(`Received signal to terminate: ${signal}`);
    server.close(() => {
        console.log('API stopped');
    });
    process.kill(process.pid, signal);
};
process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);
