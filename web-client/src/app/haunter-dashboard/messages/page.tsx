"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessaging } from "@/contexts/MessagingContext";
import { useToast } from "@/components/Toast";
import MessageBubble from "@/components/MessageBubble";
import { useSearchParams } from "next/navigation";

export default function MessagesPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const partnerIdParam = searchParams.get('partnerId');

    const {
        conversations,
        messages,
        sendMessage: firebaseSendMessage,
        loading: messagesLoading,
        selectConversation,
        startConversation,
        selectedPartnerId: selectedConversation
    } = useMessaging();

    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    // Set selected conversation from URL param if available
    useEffect(() => {
        if (partnerIdParam) {
            startConversation(partnerIdParam);
        }
    }, [partnerIdParam, startConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            await firebaseSendMessage(selectedConversation, newMessage);
            setNewMessage("");
        } catch (error) {
            showToast("error", "Failed to send message");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedConversation) return;

        try {
            await firebaseSendMessage(selectedConversation, undefined, file);
        } catch (error) {
            showToast("error", "Failed to send file");
        }
    };

    return (
        <div className="fixed inset-0 top-[180px] bottom-0 flex flex-col bg-white dark:bg-neutral-900">
            <div className="flex-1 flex overflow-hidden">
                {/* Conversations List */}
                <div className="w-80 border-r border-neutral-200 dark:border-neutral-700 flex flex-col">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                        <h2 className="text-lg font-semibold">Messages</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                                <i className="las la-comments text-4xl mb-2"></i>
                                <p className="text-sm">No conversations yet</p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    key={conv.partnerId}
                                    onClick={() => selectConversation(conv.partnerId)}
                                    className={`w-full p-4 border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left ${selectedConversation === conv.partnerId ? "bg-primary-50 dark:bg-primary-900/20" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                            <i className="las la-user text-primary-600 text-xl"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate">{conv.partner.name}</h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                                                {conv.lastMessage?.content || "No messages yet"}
                                            </p>
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messagesLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400">
                                        <div className="text-center">
                                            <i className="las la-comment-dots text-6xl mb-4"></i>
                                            <p>No messages yet. Start the conversation!</p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <MessageBubble key={message.id} message={message} isOwn={message.senderId === user?.id} />
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="border-t border-neutral-200 dark:border-neutral-700 p-4">
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                                    >
                                        <i className="las la-paperclip text-xl"></i>
                                    </button>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <i className="las la-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400">
                            <div className="text-center">
                                <i className="las la-comments text-6xl mb-4"></i>
                                <p>Select a conversation to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
