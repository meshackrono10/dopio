"use client";

import React, { useState, useRef, useEffect } from "react";
import { MOCK_PROPERTIES, MOCK_HAUNTERS } from "@/data/mockData";
import Image from "next/image";
import ButtonPrimary from "@/shared/ButtonPrimary";

interface Message {
    id: string;
    senderId: string;
    senderType: "tenant" | "haunter";
    message: string;
    messageType: "text" | "location";
    timestamp: string;
    metadata?: {
        lat?: number;
        lng?: number;
    };
}

export default function ChatPage() {
    const property = MOCK_PROPERTIES[0];
    const haunter = property.houseHaunter;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            senderId: haunter.id.toString(),
            senderType: "haunter",
            message: "Hello! Thank you for booking a viewing. I'm ready to show you the properties.",
            messageType: "text",
            timestamp: "10:30 AM",
        },
        {
            id: "2",
            senderId: "tenant-1",
            senderType: "tenant",
            message: "Hi! I'm excited to view the property. What time works best for you?",
            messageType: "text",
            timestamp: "10:32 AM",
        },
        {
            id: "3",
            senderId: haunter.id.toString(),
            senderType: "haunter",
            message: "I can meet you tomorrow at 2 PM. Here's the exact location:",
            messageType: "text",
            timestamp: "10:35 AM",
        },
        {
            id: "4",
            senderId: haunter.id.toString(),
            senderType: "haunter",
            message: "Meeting Point Location",
            messageType: "location",
            timestamp: "10:35 AM",
            metadata: {
                lat: -1.2921,
                lng: 36.8219,
            },
        },
    ]);

    const [newMessage, setNewMessage] = useState("");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const message: Message = {
            id: Date.now().toString(),
            senderId: "tenant-1",
            senderType: "tenant",
            message: newMessage,
            messageType: "text",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages([...messages, message]);
        setNewMessage("");
    };

    return (
        <div className="nc-ChatPage">
            <div className="container max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col">
                {/* Header */}
                <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden relative">
                            <Image fill src={haunter.profilePhoto} alt={haunter.name} className="object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold text-lg">{haunter.name}</h2>
                                {haunter.isVerified && (
                                    <i className="las la-check-circle text-primary-600"></i>
                                )}
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Viewing: {property.title}
                            </p>
                        </div>
                        <button className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-600 hover:border-primary-500 transition-colors text-sm">
                            <i className="las la-phone mr-1"></i>
                            Call
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-900">
                    {messages.map((msg) => {
                        const isOwn = msg.senderType === "tenant";

                        return (
                            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-md ${isOwn ? "order-2" : ""}`}>
                                    {msg.messageType === "text" ? (
                                        <div
                                            className={`rounded-2xl px-4 py-3 ${isOwn
                                                    ? "bg-primary-600 text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                                                }`}
                                        >
                                            <p className="text-sm">{msg.message}</p>
                                        </div>
                                    ) : (
                                        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-3 border border-neutral-200 dark:border-neutral-700">
                                            <div className="flex items-center gap-2 mb-2">
                                                <i className="las la-map-marker text-primary-600 text-xl"></i>
                                                <span className="font-medium text-sm">{msg.message}</span>
                                            </div>
                                            <div className="bg-neutral-100 dark:bg-neutral-700 rounded-lg p-3 text-center">
                                                <i className="las la-map text-4xl text-neutral-400"></i>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                                                    Lat: {msg.metadata?.lat}, Lng: {msg.metadata?.lng}
                                                </p>
                                            </div>
                                            <button className="w-full mt-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors">
                                                <i className="las la-directions mr-1"></i>
                                                Open in Maps
                                            </button>
                                        </div>
                                    )}
                                    <p className="text-xs text-neutral-400 mt-1 px-2">{msg.timestamp}</p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4">
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors">
                            <i className="las la-paperclip text-2xl text-neutral-500"></i>
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-neutral-50 dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-full text-sm font-normal h-11 px-4 py-3"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            <i className="las la-paper-plane mr-1"></i>
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
