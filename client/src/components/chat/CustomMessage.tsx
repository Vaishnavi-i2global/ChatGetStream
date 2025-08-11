"use client";

import React, { useRef } from "react";
import { useMessageContext, renderText, useChannelStateContext } from "stream-chat-react";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

const CustomMessage = () => {
    // Get message data from context
    const { message } = useMessageContext();

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

    return (
        <div
            className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}
            ref={messageWrapperRef}
        >
            {!isOwn && (
                <div className="mr-2 mt-1">
                    {message.user?.image ? (
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
                    className={`rounded-lg p-3 ${isOwn
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                        }`}
                >
                    {message.text && (
                        <div>
                            {renderText(message.text, message.mentioned_users || [])}
                        </div>
                    )}

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
        </div>
    );
};

export default CustomMessage;