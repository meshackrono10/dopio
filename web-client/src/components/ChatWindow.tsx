"use client";

import React, { useState, useRef, useEffect } from "react";
import Avatar from "@/shared/Avatar";
import ButtonPrimary from "@/shared/ButtonPrimary";
import MessageBubble from "./MessageBubble";
import { Message, Conversation } from "@/contexts/MessagingContext";

interface ChatWindowProps {
    selectedConversation: Conversation | undefined;
    messages: Message[];
    loading: boolean;
    currentUserId: string;
    onSendMessage: (content: string, file?: File) => Promise<void>;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
    selectedConversation,
    messages,
    loading,
    currentUserId,
    onSendMessage,
}) => {
    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        console.log("[ChatWindow] handleSend called", { messageText, selectedFile });
        if ((!messageText.trim() && !selectedFile)) {
            console.log("[ChatWindow] No content to send, returning");
            return;
        }

        setSending(true);
        console.log("[ChatWindow] Calling onSendMessage");
        try {
            await onSendMessage(messageText.trim(), selectedFile || undefined);
            console.log("[ChatWindow] onSendMessage completed successfully");
            setMessageText("");
            setSelectedFile(null);
        } catch (error) {
            console.error("[ChatWindow] Failed to send message:", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert("File size must be less than 10MB");
                return;
            }
            setSelectedFile(file);
        }
    };

    if (!selectedConversation) {
        return (
            <div className="flex-1 flex items-center justify-center text-neutral-500 bg-white dark:bg-neutral-900 rounded-xl shadow-lg h-full min-h-[500px]">
                <div className="text-center">
                    <i className="las la-comment-dots text-6xl mb-4"></i>
                    <p>Select a conversation to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg flex flex-col h-full min-h-[500px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center space-x-3">
                <Avatar
                    imgUrl={selectedConversation.partner.avatarUrl}
                    sizeClass="h-10 w-10"
                    radius="rounded-full"
                />
                <div>
                    <p className="font-semibold">{selectedConversation.partner.name}</p>
                    <p className="text-xs text-neutral-500">
                        {selectedConversation.partner.role}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                        <p>No messages yet</p>
                        <p className="text-sm mt-2">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            isOwn={message.senderId === currentUserId}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                {selectedFile && (
                    <div className="mb-2 p-2 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-between">
                        <span className="text-sm truncate">{selectedFile.name}</span>
                        <button
                            onClick={() => setSelectedFile(null)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <i className="las la-times"></i>
                        </button>
                    </div>
                )}
                <div className="flex items-center space-x-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*,video/*"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <i className="las la-paperclip text-2xl"></i>
                    </button>
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                    <ButtonPrimary
                        onClick={handleSend}
                        disabled={sending || (!messageText.trim() && !selectedFile)}
                    >
                        <i className="las la-paper-plane"></i>
                    </ButtonPrimary>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
