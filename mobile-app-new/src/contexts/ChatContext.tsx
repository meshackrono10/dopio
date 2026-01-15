import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    type: 'text' | 'image' | 'location' | 'video' | 'call' | 'document';
    status?: 'sent' | 'delivered' | 'read';
    images?: string[];
    latitude?: number;
    longitude?: number;
    address?: string;
}

interface ChatContextType {
    messages: Record<string, Message[]>;
    sendMessage: (roomId: string, text: string) => void;
    joinRoom: (roomId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const socket = socketService.connect();

    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (data: any) => {
            const { roomId, message, senderId } = data;
            const newMessage: Message = {
                id: Date.now().toString(),
                senderId,
                text: message,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'text',
            };

            setMessages(prev => ({
                ...prev,
                [roomId]: [...(prev[roomId] || []), newMessage],
            }));
        });

        return () => {
            socket.off('receive_message');
        };
    }, [socket]);

    const joinRoom = useCallback((roomId: string) => {
        socket?.emit('join_room', roomId);
    }, [socket]);

    const sendMessage = useCallback((roomId: string, text: string) => {
        if (!user) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: user.id,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
            status: 'sent',
        };

        setMessages(prev => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), newMessage],
        }));

        socket?.emit('send_message', {
            roomId,
            message: text,
            senderId: user.id,
        });
    }, [socket, user]);

    return (
        <ChatContext.Provider value={{ messages, sendMessage, joinRoom }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
