"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/services/api";
import { useAuth } from "./AuthContext";
import { database } from "@/lib/firebase";
import { ref, onValue, push, set, update, query, orderByChild } from "firebase/database";

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    propertyId?: string;
    content?: string;
    type: "TEXT" | "IMAGE" | "VIDEO" | "FILE";
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    isRead: boolean;
    createdAt: string;
    sender?: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    receiver?: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
}

export interface Conversation {
    partnerId: string;
    partner: {
        id: string;
        name: string;
        avatarUrl?: string;
        role: string;
    };
    lastMessage?: Message;
    unreadCount: number;
}

interface MessagingContextType {
    conversations: Conversation[];
    selectedPartnerId: string | null;
    messages: Message[];
    unreadCount: number;
    loading: boolean;
    sendMessage: (receiverId: string, content?: string, file?: File) => Promise<void>;
    selectConversation: (partnerId: string) => void;
    startConversation: (partnerId: string) => Promise<void>;
    refreshConversations: () => Promise<void>;
    markAsRead: (partnerId: string) => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Helper to generate consistent conversation ID
    const getConversationId = (user1: string, user2: string) => {
        return [user1, user2].sort().join("_");
    };

    // Listen for conversations
    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const conversationsRef = ref(database, `user-conversations/${user.id}`);
        const unsubscribe = onValue(conversationsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedConversations: Conversation[] = Object.entries(data).map(([partnerId, val]: [string, any]) => ({
                    partnerId,
                    partner: val.partner,
                    lastMessage: val.lastMessage,
                    unreadCount: val.unreadCount || 0,
                }));

                // Sort by last message time
                loadedConversations.sort((a, b) => {
                    const timeA = new Date(a.lastMessage?.createdAt || 0).getTime();
                    const timeB = new Date(b.lastMessage?.createdAt || 0).getTime();
                    return timeB - timeA;
                });

                setConversations(loadedConversations);

                // Calculate total unread count
                const totalUnread = loadedConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
                setUnreadCount(totalUnread);
            } else {
                setConversations([]);
                setUnreadCount(0);
            }
        });

        return () => unsubscribe();
    }, [isAuthenticated, user]);

    // Listen for messages when a conversation is selected
    useEffect(() => {
        if (!isAuthenticated || !user?.id || !selectedPartnerId) return;

        setLoading(true);
        const conversationId = getConversationId(user.id, selectedPartnerId);
        const messagesRef = query(ref(database, `messages/${conversationId}`), orderByChild("createdAt"));

        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedMessages: Message[] = Object.values(data);
                setMessages(loadedMessages);

                // Mark as read logic would go here (update unreadCount in Firebase)
                // For now, we'll just do it locally or via a separate effect
                if (loadedMessages.length > 0) {
                    // Reset unread count for this conversation in Firebase
                    const userConvRef = ref(database, `user-conversations/${user.id}/${selectedPartnerId}`);
                    // We update only if needed to avoid loops, but for now simple set is okay
                    // set(userConvRef, { ...existingData, unreadCount: 0 }); 
                    // Ideally we need to read existing data first or use update
                }
            } else {
                setMessages([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isAuthenticated, user, selectedPartnerId]);

    const selectConversation = useCallback(async (partnerId: string) => {
        setSelectedPartnerId(partnerId);
        // Mark as read in Firebase
        if (user?.id) {
            // We need to update the unreadCount to 0 for this conversation
            // This requires knowing the current state or just updating the field
            // For MVP we might skip strict unread sync or implement it simply
        }
    }, [user]);

    const sendMessage = useCallback(async (receiverId: string, content?: string, file?: File) => {
        console.log("Attempting to send message to:", receiverId);
        console.log("Current user:", user);
        if (!user?.id) {
            console.error("User ID missing in sendMessage");
            return;
        }
        if (!receiverId) {
            console.error("Receiver ID missing in sendMessage");
            return;
        }

        try {
            let fileUrl: string | undefined;
            let fileName: string | undefined;
            let fileSize: number | undefined;
            let messageType: "TEXT" | "IMAGE" | "VIDEO" | "FILE" = "TEXT";

            // Upload file if provided (keep using backend for storage for now)
            if (file) {
                const formData = new FormData();
                if (file.type.startsWith("image/")) {
                    formData.append("images", file);
                    messageType = "IMAGE";
                    const uploadResponse = await api.post("/upload/multiple", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                    fileUrl = uploadResponse.data[0]?.url;
                } else if (file.type.startsWith("video/")) {
                    formData.append("video", file);
                    messageType = "VIDEO";
                    const uploadResponse = await api.post("/upload/video", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                    fileUrl = uploadResponse.data.url;
                } else {
                    messageType = "FILE";
                    // TODO: Implement general file upload
                }
                fileName = file.name;
                fileSize = file.size;
            }

            const conversationId = getConversationId(user.id, receiverId);
            console.log("Conversation ID:", conversationId);
            const newMessageRef = push(ref(database, `messages/${conversationId}`));
            console.log("New message ref key:", newMessageRef.key);

            const message: Message = {
                id: newMessageRef.key!,
                senderId: user.id,
                receiverId,
                content,
                type: messageType,
                ...(fileUrl && { fileUrl }),
                ...(fileName && { fileName }),
                ...(fileSize && { fileSize }),
                isRead: false,
                createdAt: new Date().toISOString(),
                sender: {
                    id: user.id,
                    name: user.name || "User",
                    ...(user.avatarUrl && { avatarUrl: user.avatarUrl }),
                }
            };

            console.log("Writing message to Firebase:", message);
            await set(newMessageRef, message);
            console.log("Message written successfully");

            // Update conversations for both users
            console.log("Preparing conversation updates...");
            const updates: any = {};

            // Get complete partner details
            const currentConv = conversations.find(c => c.partnerId === receiverId);
            console.log("Current conversation:", currentConv);

            const partnerDetails = currentConv?.partner || {
                id: receiverId,
                name: "Unknown",
                role: "HUNTER"
            };

            // Update sender's conversation list
            updates[`user-conversations/${user.id}/${receiverId}/lastMessage`] = message;
            updates[`user-conversations/${user.id}/${receiverId}/partner`] = partnerDetails;

            // Update receiver's conversation list
            updates[`user-conversations/${receiverId}/${user.id}/lastMessage`] = message;
            updates[`user-conversations/${receiverId}/${user.id}/partner`] = {
                id: user.id,
                name: user.name || "User",
                avatarUrl: user.avatarUrl || null,
                role: user.role || "TENANT"
            };
            updates[`user-conversations/${receiverId}/${user.id}/unreadCount`] = 1;

            console.log("Firebase updates to apply:", updates);
            await update(ref(database), updates);
            console.log("Conversation updates complete");

        } catch (error) {
            console.error("Failed to send message:", error);
            throw error;
        }
    }, [user, conversations]);

    const markAsRead = useCallback(async (partnerId: string) => {
        if (!user?.id) return;
        const userConvRef = ref(database, `user-conversations/${user.id}/${partnerId}`);
        await update(userConvRef, { unreadCount: 0 });
    }, [user]);

    const refreshConversations = useCallback(async () => {
        // No-op for Firebase as it's real-time
    }, []);

    const startConversation = useCallback(async (partnerId: string) => {
        if (!user?.id) return;

        // Check if already exists
        if (conversations.find(c => c.partnerId === partnerId)) {
            console.log("Conversation already exists, selecting:", partnerId);
            selectConversation(partnerId);
            return;
        }

        // Fetch partner details
        try {
            setLoading(true);
            console.log("Fetching partner details for:", partnerId);
            let partnerData;
            try {
                const response = await api.get(`/users/hunter/${partnerId}`);
                partnerData = response.data.hunter || response.data.user || response.data;
                console.log("Partner data fetched:", partnerData);
            } catch (e) {
                console.error("Failed to fetch partner details", e);
                return;
            }

            const partner = {
                id: partnerData.id,
                name: partnerData.name,
                avatarUrl: partnerData.avatarUrl,
                role: partnerData.role,
            };

            // Create entry in user-conversations
            const updates: any = {};
            updates[`user-conversations/${user.id}/${partnerId}`] = {
                partner,
                unreadCount: 0,
                lastMessage: null
            };

            await update(ref(database), updates);
            setSelectedPartnerId(partnerId);
        } catch (error) {
            console.error("Failed to start conversation:", error);
        } finally {
            setLoading(false);
        }
    }, [user, conversations, selectConversation]);

    return (
        <MessagingContext.Provider
            value={{
                conversations,
                selectedPartnerId,
                messages,
                unreadCount,
                loading,
                sendMessage,
                selectConversation,
                startConversation,
                refreshConversations,
                markAsRead,
            }}
        >
            {children}
        </MessagingContext.Provider>
    );
}

export function useMessaging() {
    const context = useContext(MessagingContext);
    if (context === undefined) {
        throw new Error("useMessaging must be used within a MessagingProvider");
    }
    return context;
}
