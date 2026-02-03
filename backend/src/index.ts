import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit'; // Added rateLimit import
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import propertyRoutes from './routes/propertyRoutes';
import viewingRequestRoutes from './routes/viewingRequestRoutes';
import bookingRoutes from './routes/bookingRoutes';
import bookingWorkflowRoutes from './routes/bookingWorkflow';
import rescheduleRoutes from './routes/rescheduleRoutes';
import alternativeRoutes from './routes/alternativeRoutes';
import paymentRoutes from './routes/paymentRoutes';
import uploadRoutes from './routes/uploadRoutes';
import messageRoutes from './routes/messageRoutes';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import disputeRoutes from './routes/disputeRoutes';
import reviewRoutes from './routes/reviewRoutes';
import notificationRoutes from './routes/notificationRoutes';
import logger from './config/logger'; // Added logger import

import { createServer } from 'http';
import { initSocket } from './config/socket';
import { initScheduler } from './scheduler';

dotenv.config();

const app = express();
const server = createServer(app);
const io = initSocket(server);
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Initialize background tasks
initScheduler();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs (increased for development)
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Middleware
// app.use(limiter); // Added rate limiter middleware
app.use(helmet());
app.use(cors({ // Modified CORS middleware
    origin: process.env.NODE_ENV === 'production'
        ? ['https://househaunters.app'] // Replace with real domain
        : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } })); // Modified logging middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/viewing-requests', viewingRequestRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/bookings', bookingWorkflowRoutes);
app.use('/api/bookings', rescheduleRoutes);
app.use('/api/bookings', alternativeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// Routes Placeholder - Removed as per instruction's implied change
// app.get('/', (req: Request, res: Response) => {
//     res.json({ message: 'House Haunters API is running' });
// });

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500,
        },
    });
});

server.listen(Number(PORT), '0.0.0.0', () => {
    logger.info(`Server is running on port ${PORT} and listening on 0.0.0.0`);
});

export { app, prisma };
