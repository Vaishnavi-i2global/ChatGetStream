"use client";

import React, { useState, useRef, KeyboardEvent } from "react";
import { useChannelStateContext } from "stream-chat-react";
import { Send, Smile, Paperclip, X, Image as ImageIcon, File } from "lucide-react";
import { LocalMessage } from "stream-chat";
import { useChat } from "@/providers/chat.provider";

const CustomMessageInput = () => {
    const [text, setText] = useState("");
    const { setIsFirstMessage } = useChat()
    const [fileUploads, setFileUploads] = useState<Array<{ id: string; file: File; preview?: string }>>([]);
    const { channel, messages } = useChannelStateContext();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle text changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    // Handle key down events - Enter to submit, Shift+Enter for new line
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            if (!e.shiftKey) {
                e.preventDefault(); // Prevent default to avoid adding a new line
                handleSubmit(e as any);
            }
            // If Shift+Enter, let the default behavior happen (add a new line)
        }
    };

    // Handle file input change
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const files = Array.from(e.target.files);

        // Create new file uploads with previews for images
        const newUploads = files.map(file => {
            const id = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const isImage = file.type.startsWith('image/');

            return {
                id,
                file,
                preview: isImage ? URL.createObjectURL(file) : undefined
            };
        });

        setFileUploads(prev => [...prev, ...newUploads]);

        // Reset the input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Remove a file upload
    const removeFile = (id: string) => {
        setFileUploads(prev => {
            const fileToRemove = prev.find(file => file.id === id);

            // Revoke object URL if it's an image preview
            if (fileToRemove?.preview) {
                URL.revokeObjectURL(fileToRemove.preview);
            }

            return prev.filter(file => file.id !== id);
        });
    };

    // Simple message submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!text.trim() && fileUploads.length === 0) return;

        try {
            const attachments = [];

            // Process file uploads
            for (const upload of fileUploads) {
                try {
                    const isImage = upload.file.type.startsWith('image/');

                    if (isImage) {
                        // Upload image
                        const response = await channel.sendImage(upload.file);

                        attachments.push({
                            type: 'image',
                            image_url: response.file,
                            fallback: upload.file.name,
                        });
                    } else {
                        // Upload file
                        const response = await channel.sendFile(upload.file);

                        attachments.push({
                            type: 'file',
                            asset_url: response.file,
                            title: upload.file.name,
                            file_size: upload.file.size,
                        });
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                }
            }
            // Optimistic message
            // const optimisticMessage: LocalMessage = {
            //     id: `temp-${Date.now()}`,
            //     cid: channel.cid,
            //     type: "regular",
            //     text: text.trim(),
            //     user: channel._client.user,
            //     created_at: new Date(),
            //     updated_at: new Date(),
            //     deleted_at: null,
            //     pinned_at: null,
            //     status: "sending",
            // };

            // channel.state.addMessageSorted(optimisticMessage, true); // force insert into local state

            // Use the channel's sendMessage method directly
            await channel.sendMessage({
                text: text.trim(),
                attachments: attachments.length > 0 ? attachments : undefined,
            });
            if (messages?.length === 0) {
                setIsFirstMessage(true);
                // channel.state.addMessageSorted(optimisticMessage, true)
            } else {
                setIsFirstMessage(false);
            }

            await channel.watch();

            // Clear the input
            setText("");
            setFileUploads([]);

            // Focus the textarea after sending
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Check if users are typing
    const renderTypingIndicator = () => {
        const typing = channel?.state?.typing || {};
        const typingUsers = Object.values(typing).filter(
            ({ user }: any) => user?.id !== channel?._client?.userID
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

    // Render file previews
    const renderFilePreviews = () => {
        if (fileUploads.length === 0) return null;

        return (
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {fileUploads.map((upload) => {
                    const isImage = upload.file.type.startsWith('image/');

                    if (isImage && upload.preview) {
                        return (
                            <div key={upload.id} className="relative">
                                <img
                                    src={upload.preview}
                                    alt={upload.file.name}
                                    className="h-20 w-20 object-cover rounded-md"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeFile(upload.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    }

                    return (
                        <div key={upload.id} className="relative flex items-center bg-gray-100 p-2 rounded-md">
                            <File size={16} className="mr-2 text-gray-600" />
                            <span className="text-sm truncate max-w-[150px]">{upload.file.name}</span>
                            <button
                                type="button"
                                onClick={() => removeFile(upload.id)}
                                className="ml-2 text-red-500"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="relative">
                {renderTypingIndicator()}
                {renderFilePreviews()}

                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <div className="flex items-center px-3">

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileInputChange}
                            multiple
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="ml-3 text-gray-500 hover:text-gray-700"
                        >
                            <Paperclip size={20} />
                        </button>
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 py-3 px-3 focus:outline-none resize-none max-h-32 min-h-[40px] border-none"
                        rows={1}
                    />

                    <button
                        type="submit"
                        disabled={!text.trim() && fileUploads.length === 0}
                        className={`bg-blue-500 text-white p-3 px-5 h-full ${!text.trim() && fileUploads.length === 0
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-blue-600'
                            }`}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomMessageInput;