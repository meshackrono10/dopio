import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import logger from './logger';

export const initSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.id}`);

        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            logger.info(`User ${socket.id} joined room: ${roomId}`);
        });

        socket.on('send_message', (data) => {
            // data: { roomId, message, senderId }
            io.to(data.roomId).emit('receive_message', data);
            logger.info(`Message sent in room ${data.roomId}`);
        });

        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};
