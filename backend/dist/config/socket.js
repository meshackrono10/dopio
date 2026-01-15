"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = __importDefault(require("./logger"));
const initSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        logger_1.default.info(`User connected: ${socket.id}`);
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            logger_1.default.info(`User ${socket.id} joined room: ${roomId}`);
        });
        socket.on('send_message', (data) => {
            // data: { roomId, message, senderId }
            io.to(data.roomId).emit('receive_message', data);
            logger_1.default.info(`Message sent in room ${data.roomId}`);
        });
        socket.on('disconnect', () => {
            logger_1.default.info(`User disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
