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

    // Set selected conversation and property context from URL param if available
    useEffect(() => {
        const propertyId = searchParams.get('propertyId');
        const propertyTitle = searchParams.get('propertyTitle');
        const partnerId = partnerIdParam;

        if (propertyId && propertyTitle && partnerId) {
            const propertyLink = `Hi! I'm interested in this house: [${propertyTitle}](https://dapio.co.ke/listing-stay-detail/${propertyId})`;
            setNewMessage(propertyLink);

            // Check if conversation exists, if not create it
            const exists = conversations.find(c => c.partnerId === partnerId);
            if (exists) {
                selectConversation(partnerId);
            } else {
                startConversation(partnerId);
            }
        }
    }, [partnerIdParam, searchParams, conversations, selectConversation, startConversation]);

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
        <div className="flex bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-xl overflow-hidden h-[calc(100vh-280px)] min-h-[600px]">
            {/* Conversations List */}
            <div className="w-80 md:w-96 border-r border-neutral-100 dark:border-neutral-800 flex flex-col bg-neutral-50/30 dark:bg-neutral-900/50">
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">Messages</h2>
                        <button className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors">
                            <i className="las la-edit text-xl text-primary-600"></i>
                        </button>
                    </div>
                    <div className="relative">
                        <i className="las la-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></i>
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {conversations.length === 0 ? (
                        <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
                            <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-neutral-900 shadow-sm">
                                <i className="las la-comments text-4xl text-neutral-300"></i>
                            </div>
                            <p className="font-medium">No messages yet</p>
                            <p className="text-xs mt-1">When you start a conversation, it'll show up here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.partnerId}
                                    onClick={() => selectConversation(conv.partnerId)}
                                    className={`w-full p-5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all text-left relative group ${selectedConversation === conv.partnerId
                                        ? "bg-white dark:bg-neutral-800 border-l-4 border-l-primary-600 shadow-sm"
                                        : "border-l-4 border-l-transparent"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center overflow-hidden border-2 border-white dark:border-neutral-900 shadow-sm transition-transform group-hover:scale-105">
                                                {conv.partner.avatarUrl ? (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img src={conv.partner.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <i className="las la-user text-primary-600 text-2xl"></i>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-neutral-900"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className={`font-bold truncate ${selectedConversation === conv.partnerId ? "text-primary-700 dark:text-primary-400" : ""}`}>
                                                    {conv.partner.name}
                                                </h3>
                                                <span className="text-[10px] text-neutral-400 shrink-0">
                                                    {conv.lastMessage?.createdAt
                                                        ? new Date(conv.lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                                                        : ""
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <p className={`text-sm truncate flex-1 ${conv.unreadCount > 0 ? "font-bold text-neutral-900 dark:text-neutral-100" : "text-neutral-500 dark:text-neutral-400"}`}>
                                                    {conv.lastMessage?.content || "Shared a file"}
                                                </p>
                                                {conv.unreadCount > 0 && (
                                                    <span className="bg-primary-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md shadow-primary-600/20">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900 relative">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 px-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center overflow-hidden border border-white dark:border-neutral-800 shadow-sm">
                                    {conversations.find(c => c.partnerId === selectedConversation)?.partner.avatarUrl ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={conversations.find(c => c.partnerId === selectedConversation)?.partner.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <i className="las la-user text-primary-600 text-xl"></i>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                                        {conversations.find(c => c.partnerId === selectedConversation)?.partner.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-green-500 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                                        </span>
                                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
                                            {conversations.find(c => c.partnerId === selectedConversation)?.partner.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-neutral-500 transition-colors">
                                    <i className="las la-phone text-xl"></i>
                                </button>
                                <button className="p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-neutral-500 transition-colors">
                                    <i className="las la-video text-xl"></i>
                                </button>
                                <button className="p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-neutral-500 transition-colors">
                                    <i className="las la-info-circle text-xl"></i>
                                </button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/50 dark:bg-neutral-900/30 custom-scrollbar">
                            {messagesLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400">
                                    <div className="text-center max-w-xs">
                                        <div className="w-24 h-24 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                                            <i className="las la-comment-dots text-5xl text-primary-200"></i>
                                        </div>
                                        <p className="font-bold text-neutral-800 dark:text-neutral-100 text-lg">No messages yet</p>
                                        <p className="text-sm mt-2">Send a friendly greeting to start your conversation with {conversations.find(c => c.partnerId === selectedConversation)?.partner.name}!</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-center my-4">
                                        <span className="px-3 py-1 bg-white dark:bg-neutral-800 rounded-full text-[10px] text-neutral-400 font-bold uppercase tracking-widest border border-neutral-100 dark:border-neutral-700 shadow-sm">Today</span>
                                    </div>
                                    {messages.map((message) => (
                                        <MessageBubble key={message.id} message={message} isOwn={message.senderId === user?.id} />
                                    ))}
                                </>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 px-6 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-end gap-3 bg-neutral-100 dark:bg-neutral-800 p-2 pl-4 rounded-3xl border border-neutral-200 dark:border-neutral-700 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500/50 transition-all shadow-inner">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 hover:bg-white dark:hover:bg-neutral-700 rounded-full text-neutral-500 transition-all mb-0.5 shadow-sm active:scale-95"
                                >
                                    <i className="las la-plus text-xl text-primary-600"></i>
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <div className="flex-1 max-h-32 overflow-y-auto py-2">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="Write your message..."
                                        rows={1}
                                        className="w-full bg-transparent border-none focus:ring-0 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 resize-none py-1 scrollbar-hide"
                                        style={{ minHeight: '24px' }}
                                    />
                                </div>
                                <div className="flex items-center gap-1 mb-0.5 mr-0.5">
                                    <button className="p-2.5 hover:bg-white dark:hover:bg-neutral-700 rounded-full text-neutral-400 transition-colors">
                                        <i className="las la-smile text-xl"></i>
                                    </button>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="w-11 h-11 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-primary-600/30 active:scale-90"
                                    >
                                        <i className="las la-paper-plane text-xl"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full bg-neutral-50/50 dark:bg-neutral-900/50">
                        <div className="text-center max-w-sm px-6">
                            <div className="relative mb-8">
                                <div className="w-32 h-32 bg-white dark:bg-neutral-800 rounded-[40px] shadow-2xl flex items-center justify-center mx-auto border-4 border-white dark:border-neutral-900">
                                    <i className="las la-comments text-6xl text-primary-500"></i>
                                </div>
                                <div className="absolute -top-2 -right-2 w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center animate-bounce">
                                    <i className="las la-bell text-primary-600"></i>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">Your Messages</h2>
                            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8">
                                Select a conversation from the left to read messages and start chatting with users.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700">
                                    <i className="las la-user-check text-2xl text-primary-600 mb-2"></i>
                                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">Verified</p>
                                    <p className="text-[10px] text-neutral-400 mt-1">Chat securely with verified agents</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700">
                                    <i className="las la-clock text-2xl text-primary-600 mb-2"></i>
                                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">Real-time</p>
                                    <p className="text-[10px] text-neutral-400 mt-1">Get instant updates on your inquiries</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
