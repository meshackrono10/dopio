"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import EmojiPicker, { Theme } from "emoji-picker-react";

interface EnhancedChatInputProps {
    onSendMessage: (message: string, files?: File[]) => void;
    className?: string;
}

const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({
    onSendMessage,
    className = "",
}) => {
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
    });

    const handleSend = () => {
        if (message.trim() || uploadedFiles.length > 0) {
            onSendMessage(message, uploadedFiles);
            setMessage("");
            setUploadedFiles([]);
        }
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onEmojiClick = (emojiData: any) => {
        setMessage(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className={`enhanced-chat-input ${className}`} {...getRootProps()}>
            <input {...getInputProps()} />

            {isDragActive && (
                <div className="absolute inset-0 bg-primary-500/10 border-2 border-dashed border-primary-500 rounded-xl flex items-center justify-center z-10">
                    <div className="text-center">
                        <i className="las la-cloud-upload-alt text-6xl text-primary-600 mb-2"></i>
                        <p className="text-primary-700 dark:text-primary-300 font-medium">Drop files here</p>
                    </div>
                </div>
            )}

            {/* File Previews */}
            {uploadedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                    {uploadedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg"
                        >
                            <i className="las la-file text-lg text-neutral-600 dark:text-neutral-300"></i>
                            <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                            <button
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <i className="las la-times"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-end gap-2">
                {/* Attachment Button */}
                <label className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors cursor-pointer">
                    <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={(e) => {
                            if (e.target.files) {
                                setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                            }
                        }}
                        className="hidden"
                    />
                    <i className="las la-paperclip text-2xl text-neutral-500 dark:text-neutral-400"></i>
                </label>

                {/* Emoji Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                    >
                        <i className="las la-smile text-2xl text-neutral-500 dark:text-neutral-400"></i>
                    </button>

                    {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-2 z-50">
                            <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                theme={document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT}
                            />
                        </div>
                    )}
                </div>

                {/* Message Input */}
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Type a message... (Shift+Enter for new line)"
                    className="flex-1 px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl resize-none focus:outline-none focus:border-primary-500 bg-white dark:bg-neutral-900"
                    rows={1}
                    style={{ maxHeight: '120px' }}
                />

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={!message.trim() && uploadedFiles.length === 0}
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    <i className="las la-paper-plane"></i>
                </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                Supported files: Images, PDF, DOC, DOCX • Max 10MB per file
            </p>
        </div>
    );
};

export default EnhancedChatInput;
