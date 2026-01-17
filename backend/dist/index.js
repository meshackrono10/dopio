"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit")); // Added rateLimit import
const client_1 = require("@prisma/client");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const propertyRoutes_1 = __importDefault(require("./routes/propertyRoutes"));
const viewingRequestRoutes_1 = __importDefault(require("./routes/viewingRequestRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const bookingWorkflow_1 = __importDefault(require("./routes/bookingWorkflow"));
const rescheduleRoutes_1 = __importDefault(require("./routes/rescheduleRoutes"));
const alternativeRoutes_1 = __importDefault(require("./routes/alternativeRoutes"));
const searchRequestRoutes_1 = __importDefault(require("./routes/searchRequestRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const disputeRoutes_1 = __importDefault(require("./routes/disputeRoutes"));
const logger_1 = __importDefault(require("./config/logger")); // Added logger import
const http_1 = require("http");
const socket_1 = require("./config/socket");
const scheduler_1 = require("./scheduler");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = (0, socket_1.initSocket)(server);
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
const PORT = process.env.PORT || 5000;
// Initialize background tasks
(0, scheduler_1.initScheduler)();
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs (increased for development)
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
// Middleware
// app.use(limiter); // Added rate limiter middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://househaunters.app'] // Replace with real domain
        : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((0, morgan_1.default)('combined', { stream: { write: (message) => logger_1.default.info(message.trim()) } })); // Modified logging middleware
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/properties', propertyRoutes_1.default);
app.use('/api/viewing-requests', viewingRequestRoutes_1.default);
app.use('/api/bookings', bookingRoutes_1.default);
app.use('/api/bookings', bookingWorkflow_1.default);
app.use('/api/bookings', rescheduleRoutes_1.default);
app.use('/api/bookings', alternativeRoutes_1.default);
app.use('/api/search-requests', searchRequestRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/disputes', disputeRoutes_1.default);
// Routes Placeholder - Removed as per instruction's implied change
// app.get('/', (req: Request, res: Response) => {
//     res.json({ message: 'House Haunters API is running' });
// });
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error Handling Middleware
app.use((err, req, res, next) => {
    logger_1.default.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500,
        },
    });
});
server.listen(Number(PORT), '0.0.0.0', () => {
    logger_1.default.info(`Server is running on port ${PORT} and listening on 0.0.0.0`);
});
