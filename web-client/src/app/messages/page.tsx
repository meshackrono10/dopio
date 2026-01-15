"use client";

import React, { useEffect } from "react";
import { useMessaging } from "@/contexts/MessagingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";

const MessagesPage = () => {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const {
        conversations,
        selectedPartnerId,
        messages,
        loading: messagesLoading,
        sendMessage,
        selectConversation,
        startConversation,
    } = useMessaging();
    const router = useRouter();
    const searchParams = useSearchParams();
    const partnerId = searchParams.get("partnerId");

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, authLoading, router]);

    // Handle deep linking to a specific conversation
    useEffect(() => {
        if (partnerId && isAuthenticated && selectedPartnerId !== partnerId) {
            startConversation(partnerId);
        }
    }, [partnerId, isAuthenticated, startConversation, selectedPartnerId]);

    const handleSendMessage = async (content: string, file?: File) => {
        console.log("[MessagesPage] handleSendMessage called", { content, file, selectedPartnerId });
        if (selectedPartnerId) {
            console.log("[MessagesPage] Calling sendMessage with selectedPartnerId:", selectedPartnerId);
            await sendMessage(selectedPartnerId, content, file);
            console.log("[MessagesPage] sendMessage completed");
        } else {
            console.error("[MessagesPage] No selectedPartnerId!");
        }
    };

    const selectedConversation = conversations.find(
        (c) => c.partnerId === selectedPartnerId
    );

    if (authLoading) {
        return (
            <div className="container mx-auto py-24 flex justify-center">
                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Messages</h1>


            <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
                {/* Conversations List */}
                <ChatList
                    conversations={conversations}
                    selectedPartnerId={selectedPartnerId}
                    onSelectConversation={selectConversation}
                    className="col-span-12 md:col-span-4"
                />

                {/* Chat Window */}
                <div className="col-span-12 md:col-span-8">
                    <ChatWindow
                        selectedConversation={selectedConversation}
                        messages={messages}
                        loading={messagesLoading}
                        currentUserId={user?.id || ""}
                        onSendMessage={handleSendMessage}
                    />
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
