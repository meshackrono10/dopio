import React from "react";
import { Message } from "@/contexts/MessagingContext";

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
    return (
        <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn
                    ? "bg-primary-600 text-white"
                    : "bg-neutral-100 dark:bg-neutral-800"
                    }`}
            >
                {message.type === "IMAGE" && message.fileUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={message.fileUrl}
                        alt="Shared"
                        className="rounded-lg mb-2 max-w-full"
                    />
                )}
                {message.type === "VIDEO" && message.fileUrl && (
                    <video
                        src={message.fileUrl}
                        controls
                        className="rounded-lg mb-2 max-w-full"
                    />
                )}
                {message.type === "FILE" && message.fileUrl && (
                    <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-primary-600 hover:underline"
                    >
                        <i className="las la-file text-2xl"></i>
                        <span>{message.fileName}</span>
                    </a>
                )}
                {message.content && <p>{message.content}</p>}
                <p
                    className={`text-xs mt-1 ${isOwn ? "text-primary-100" : "text-neutral-500"
                        }`}
                >
                    {new Date(message.createdAt).toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
};

export default MessageBubble;
