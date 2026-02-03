import React from "react";
import { Message } from "@/contexts/MessagingContext";

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
    return (
        <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
            {!isOwn && (
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 flex items-center justify-center overflow-hidden border border-neutral-200 dark:border-neutral-700">
                    {message.sender?.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={message.sender.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <i className="las la-user text-neutral-400"></i>
                    )}
                </div>
            )}

            <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm transition-all ${isOwn
                    ? "bg-primary-600 text-white rounded-br-none"
                    : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-bl-none"
                    }`}
            >
                {message.type === "IMAGE" && message.fileUrl && (
                    <div className="rounded-lg overflow-hidden mb-2 border border-black/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={message.fileUrl}
                            alt="Shared"
                            className="max-w-full hover:scale-105 transition-transform duration-300 pointer-events-auto cursor-pointer"
                        />
                    </div>
                )}
                {message.type === "VIDEO" && message.fileUrl && (
                    <div className="rounded-lg overflow-hidden mb-2">
                        <video
                            src={message.fileUrl}
                            controls
                            className="max-w-full"
                        />
                    </div>
                )}
                {message.type === "FILE" && message.fileUrl && (
                    <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center space-x-3 p-2 rounded-lg mb-2 ${isOwn ? "bg-primary-700/50" : "bg-neutral-50 dark:bg-neutral-900"
                            } hover:opacity-90 transition-opacity`}
                    >
                        <div className={`w-10 h-10 rounded flex items-center justify-center ${isOwn ? "bg-white/20" : "bg-primary-100 dark:bg-primary-900/40"
                            }`}>
                            <i className={`las la-file-alt text-2xl ${isOwn ? "text-white" : "text-primary-600"}`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{message.fileName || "Document"}</p>
                            <p className={`text-[10px] uppercase opacity-70`}>{((message.fileSize || 0) / 1024).toFixed(1)} KB</p>
                        </div>
                    </a>
                )}
                {message.content && <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>}

                <div className={`flex items-center gap-1.5 mt-1 opacity-70 ${isOwn ? "justify-end" : "justify-start"}`}>
                    <span className="text-[10px]">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isOwn && (
                        <i className={`las ${message.isRead ? "la-check-double text-blue-300" : "la-check"} text-xs animate-pulse`}></i>
                    )}
                </div>
            </div>
        </div>
    );
};


export default MessageBubble;
