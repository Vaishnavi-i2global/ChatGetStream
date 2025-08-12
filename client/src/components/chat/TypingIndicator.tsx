"use client";

import React from "react";
import { useTypingContext, useChatContext } from "stream-chat-react";

type TypingIndicatorProps = {
    className?: string;
};

const TypingIndicator = ({ className = "" }: TypingIndicatorProps) => {
    const { typing = {} } = useTypingContext();
    const { client } = useChatContext();

    // Filter typing users to exclude the current user
    const typingUsers = Object.values(typing).filter(
        ({ user }) => user?.id !== client.userID
    );

    if (!typingUsers.length) return null;

    return (
        <div className={`flex items-center text-xs text-gray-500 h-5 ${className}`}>
            {typingUsers.length === 1 ? (
                <>
                    <span className="mr-2">{typingUsers[0].user?.name || "Someone"} is typing</span>
                    <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                    </div>
                </>
            ) : (
                <>
                    <span className="mr-2">Several people are typing</span>
                    <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TypingIndicator;
