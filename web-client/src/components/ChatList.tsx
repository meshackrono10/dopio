import React from "react";
import Avatar from "@/shared/Avatar";
import { Conversation } from "@/contexts/MessagingContext";

interface ChatListProps {
    conversations: Conversation[];
    selectedPartnerId: string | null;
    onSelectConversation: (partnerId: string) => void;
    className?: string;
}

const ChatList: React.FC<ChatListProps> = ({
    conversations,
    selectedPartnerId,
    onSelectConversation,
    className = "",
}) => {
    return (
        <div className={`bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden flex flex-col ${className}`}>
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="font-semibold text-lg">Conversations</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500">
                        <i className="las la-comments text-6xl mb-4"></i>
                        <p>No conversations yet</p>
                        <p className="text-sm mt-2">
                            Start chatting by messaging a hunter from a property listing
                        </p>
                    </div>
                ) : (
                    conversations.map((conversation) => (
                        <div
                            key={conversation.partnerId}
                            onClick={() => onSelectConversation(conversation.partnerId)}
                            className={`p-4 border-b border-neutral-100 dark:border-neutral-800 cursor-pointer transition-colors ${selectedPartnerId === conversation.partnerId
                                ? "bg-primary-50 dark:bg-primary-900/20"
                                : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                }`}
                        >
                            <div className="flex items-start space-x-3">
                                <Avatar
                                    imgUrl={conversation.partner.avatarUrl}
                                    sizeClass="h-12 w-12"
                                    radius="rounded-full"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold truncate">
                                            {conversation.partner.name}
                                        </p>
                                        {conversation.unreadCount > 0 && (
                                            <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                                                {conversation.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-neutral-500 truncate">
                                        {conversation.lastMessage?.content || "No messages yet"}
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-1">
                                        {conversation.lastMessage?.createdAt
                                            ? new Date(conversation.lastMessage.createdAt).toLocaleDateString()
                                            : ""}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatList;
