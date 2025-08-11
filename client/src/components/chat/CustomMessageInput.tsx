"use client";

import React, { useState, useRef } from "react";
import {
    useChannelStateContext,
    useChannelActionContext
} from "stream-chat-react";
import { Smile, Paperclip, Send, X, Image as ImageIcon, FileText } from "lucide-react";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const CustomMessageInput = () => {
    const [text, setText] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [imageUploads, setImageUploads] = useState<Array<{ id: string; file: File; url?: string }>>([]);
    const [fileUploads, setFileUploads] = useState<Array<{ id: string; file: File }>>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { channel } = useChannelStateContext();
    const { sendMessage } = useChannelActionContext();

    // Handle emoji selection
    const handleEmojiSelect = (emoji: any) => {
        const cursorPosition = textareaRef.current?.selectionStart || 0;
        const textBeforeCursor = text.slice(0, cursorPosition);
        const textAfterCursor = text.slice(cursorPosition);

        setText(`${textBeforeCursor}${emoji.native}${textAfterCursor}`);
        setShowEmojiPicker(false);
    };

    // Handle file input change
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // For now, we'll disable file uploads until we resolve the error
        alert("File uploads are temporarily disabled. Please use text messages only.");

        // Reset the input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Remove an image upload
    const removeImage = (id: string) => {
        setImageUploads(prev => prev.filter(image => image.id !== id));
    };

    // Remove a file upload
    const removeFile = (id: string) => {
        setFileUploads(prev => prev.filter(file => file.id !== id));
    };

    // Handle message submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!text.trim()) return;

        try {
            // For now, let's simplify and just send text messages
            // We'll handle attachments separately in a future update
            if (text.trim()) {
                // Use any type to bypass TypeScript errors for now
                const messageData: any = {
                    text: text.trim(),
                };

                await sendMessage(messageData);
            }

            // Reset state
            setText("");
            setImageUploads([]);
            setFileUploads([]);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Handle text change
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    // Render file upload previews
    const renderFileUploads = () => {
        if (!imageUploads.length && !fileUploads.length) return null;

        return (
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {/* Image uploads */}
                {imageUploads.map((image, index) => (
                    <div key={`image-${index}`} className="relative">
                        <img
                            src={image.url}
                            alt={`Upload ${index + 1}`}
                            className="h-20 w-20 object-cover rounded-md"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {/* File uploads */}
                {fileUploads.map((file, index) => (
                    <div key={`file-${index}`} className="relative flex items-center bg-gray-100 p-2 rounded-md">
                        <FileText size={16} className="mr-2 text-gray-600" />
                        <span className="text-sm truncate max-w-[150px]">{file.file.name}</span>
                        <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="ml-2 text-red-500"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    // Check if users are typing
    const renderTypingIndicator = () => {
        const typing = channel?.state?.typing || {};
        const typingUsers = Object.values(typing).filter(
            ({ user }) => user?.id !== channel?._client?.userID
        );

        if (!typingUsers.length) return null;

        return (
            <div className="text-xs text-gray-500 h-5 mt-1">
                {typingUsers.length === 1 ? (
                    <span>{typingUsers[0].user?.name || 'Someone'} is typing...</span>
                ) : (
                    <span>Several people are typing...</span>
                )}
            </div>
        );
    };

    return (
        <div className="border-t border-gray-200 p-4">
            {renderFileUploads()}

            <form onSubmit={handleSubmit} className="relative">
                {renderTypingIndicator()}

                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                    <div className="flex items-center px-3">
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <Smile size={20} />
                        </button>

                        <div className="relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileInputChange}
                                className="hidden"
                                multiple
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="ml-2 text-gray-500 hover:text-gray-700"
                            >
                                <Paperclip size={20} />
                            </button>
                        </div>
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={handleChange}
                        placeholder="Type a message..."
                        className="flex-1 py-2 px-3 focus:outline-none resize-none max-h-32 min-h-[40px]"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                handleSubmit(e);
                            }
                        }}
                    />

                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className={`bg-blue-500 text-white p-2 px-4 ${!text.trim()
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-blue-600'
                            }`}
                    >
                        <Send size={20} />
                    </button>
                </div>

                {showEmojiPicker && (
                    <div
                        ref={emojiPickerRef}
                        className="absolute bottom-full mb-2 z-10"
                    >
                        <Picker
                            data={data}
                            onEmojiSelect={handleEmojiSelect}
                            theme="light"
                        />
                    </div>
                )}
            </form>
        </div>
    );
};

export default CustomMessageInput;