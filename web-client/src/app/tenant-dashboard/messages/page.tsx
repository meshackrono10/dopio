"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessaging } from "@/contexts/MessagingContext";
import { useToast } from "@/components/Toast";
import MessageBubble from "@/components/MessageBubble";
import Image from "next/image";
import Skeleton from "@/shared/Skeleton";

export default function MessagesPage() {
    const { user } = useAuth();
    const {
        conversations,
        messages,
        sendMessage: firebaseSendMessage,
        loading: messagesLoading,
        selectConversation,
        selectedPartnerId: selectedConversation
    } = useMessaging();

    const { showToast } = useToast();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const activeConversation = conversations.find((c) => c.partnerId === selectedConversation);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Messages</h1>
                <p className="text-neutral-500">Chat with House Hunters</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* Left Sidebar - Conversations List */}
                <div className="lg:col-span-1 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                        <h3 className="font-semibold text-lg">Conversations</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            {conversations.length} conversations
                        </p>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: "calc(600px - 80px)" }}>
                        {conversations.map((conv) => (
                            <button
                                key={conv.partnerId}
                                onClick={() => selectConversation(conv.partnerId)}
                                className={`w-full p-4 border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-left ${selectedConversation === conv.partnerId ? "bg-primary-50 dark:bg-primary-900/20" : ""
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden relative flex-shrink-0">
                                        {conv.partner.avatarUrl ? (
                                            <Image fill src={conv.partner.avatarUrl} alt={conv.partner.name} className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                                                <i className="las la-user-tie text-xl text-neutral-500 dark:text-neutral-400"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold truncate">{conv.partner.name}</h4>
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate">
                                            {conv.lastMessage?.content || "No messages yet"}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="inline-block w-2 h-2 bg-primary-600 rounded-full mt-1"></span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Chat Panel */}
                <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col">
                    {selectedConversation && activeConversation ? (
                        <>
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden relative">
                                        {activeConversation.partner.avatarUrl ? (
                                            <Image fill src={activeConversation.partner.avatarUrl} alt={activeConversation.partner.name} className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                                                <i className="las la-user-tie text-lg text-neutral-500 dark:text-neutral-400"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{activeConversation.partner.name}</h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                                            {activeConversation.partner.role.toLowerCase()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-900">
                                {messagesLoading && messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Skeleton className="w-full h-full" />
                                    </div>
                                ) : (
                                    messages.map((msg: any) => (
                                        <MessageBubble
                                            key={msg.id}
                                            message={msg}
                                            isOwn={msg.senderId === user?.id}
                                        />
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                                    >
                                        <i className="las la-paperclip text-2xl text-neutral-500 dark:text-neutral-400"></i>
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        accept="image/*,video/*"
                                    />
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => { e.key === "Enter" && handleSendMessage() }}
                                        placeholder="Type a message..."
                                        className="flex-1 border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-neutral-50 dark:border-neutral-700 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 dark:bg-neutral-900 rounded-full text-sm font-normal h-11 px-4 py-3"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
                                    >
                                        <i className="las la-paper-plane mr-1"></i>
                                        Send
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
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
