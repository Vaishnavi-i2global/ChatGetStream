"use client";

import React, { useRef } from "react";
import { useChannelStateContext, useMessageContext } from "stream-chat-react";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

interface CustomMessageProps {
    message?: any;
}

const CustomMessage = ({ message: propMessage }: CustomMessageProps) => {
    // Get message from props or context
    const messageContext = useMessageContext();
    const message = propMessage || messageContext.message;
    console.log(message, "message")
    // Create a ref for the message wrapper
    const messageWrapperRef = useRef<HTMLDivElement>(null);

    // Get channel data
    const { channel } = useChannelStateContext();

    // Check if message exists
    if (!message) {
        return null;
    }

    // Determine if message is from current user
    const isOwn = message.user?.id === channel?._client?.userID;

    // Format message timestamp
    const messageDate = new Date(message.created_at || Date.now());
    const formatMessageTime = (date: Date) => {
        return format(date, "h:mm a");
    };

    // Handle attachments
    const hasAttachments = message.attachments && message.attachments.length > 0;

    // Render attachments
    const renderAttachments = () => {
        if (!hasAttachments) return null;

        return message.attachments.map((attachment: any, index: number) => {
            // Image attachment
            if (attachment.type === 'image') {
                return (
                    <div key={`${message.id}-image-${index}`} className="mt-2 rounded-lg overflow-hidden">
                        <img
                            src={attachment.image_url}
                            alt={attachment.fallback || "Image"}
                            className="max-w-full h-auto rounded-lg"
                        />
                        {attachment.title && (
                            <p className="text-sm text-gray-500 mt-1">{attachment.title}</p>
                        )}
                    </div>
                );
            }

            // File attachment
            if (attachment.type === 'file') {
                return (
                    <div
                        key={`${message.id}-file-${index}`}
                        className="mt-2 p-3 border border-gray-200 rounded-lg flex items-center"
                    >
                        <div className="mr-3 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-medium truncate">{attachment.title || attachment.name || "File"}</p>
                            <p className="text-xs text-gray-500">
                                {attachment.file_size ? `${Math.round(attachment.file_size / 1024)} KB` : ""}
                            </p>
                        </div>
                        <a
                            href={attachment.asset_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                        >
                            Download
                        </a>
                    </div>
                );
            }

            return null;
        });
    };

    return (
        <div
            className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}
            ref={messageWrapperRef}
        >
            {!isOwn && (
                <div className="mr-2 self-end mb-1">
                    {message.user?.image && message.user.image !== "message" ? (
                        <img
                            src={message.user.image}
                            alt={message.user.name || "User"}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white">
                            {message.user?.name?.charAt(0) || "?"}
                        </div>
                    )}
                </div>
            )}

            <div className={`max-w-[70%]`}>
                {!isOwn && message.user?.name && (
                    <div className="text-xs text-gray-500 mb-1 ml-1">
                        {message.user.name}
                    </div>
                )}

                <div
                    className={`rounded-2xl p-3 ${isOwn
                        ? "bg-blue-500 text-white rounded-br-md"
                        : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                        }`}
                >
                    {message.text && (
                        <div className="text-sm whitespace-pre-wrap">
                            {message.text}
                        </div>
                    )}

                    {renderAttachments()}

                    <div
                        className={`text-xs mt-1 flex items-center justify-end ${isOwn ? "text-blue-100" : "text-gray-500"
                            }`}
                    >
                        <span>{formatMessageTime(messageDate)}</span>

                        {isOwn && (
                            <span className="ml-1">
                                {message.status === 'read' ? (
                                    <CheckCheck size={14} />
                                ) : message.status === 'received' ? (
                                    <Check size={14} />
                                ) : null}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {isOwn && (
                <div className="ml-2 self-end mb-1">
                    {message.user?.image && message.user.image !== "message" ? (
                        <img
                            src={message.user.image}
                            alt={message.user.name || "User"}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                            {message.user?.name?.charAt(0) || "?"}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomMessage;