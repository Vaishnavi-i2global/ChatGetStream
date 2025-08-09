"use client";

import { useChat, Conversation } from "@/providers/chat.provider";
import Image from "next/image";
import { format } from "date-fns";

export default function ChatSidebar() {
    const { conversations, activeConversation, setActiveConversation } = useChat();

    const formatTime = (date: Date | undefined) => {
        if (!date) return "";
        return format(date, "h:mm a");
    };

    return (
        <div className="w-full h-full bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Messages</h2>
                <div className="mt-2 text-sm text-gray-500">
                    <span>5 chats available</span>
                </div>
            </div>
            <div className="overflow-y-auto h-[calc(100%-70px)]">
                {conversations.map((conversation) => (
                    <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isActive={activeConversation?.id === conversation.id}
                        onClick={() => setActiveConversation(conversation)}
                    />
                ))}
            </div>
        </div>
    );
}

interface ConversationItemProps {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
}

function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
    return (
        <div
            className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${isActive ? "bg-blue-50" : ""
                }`}
            onClick={onClick}
        >
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                    {conversation.participantName.charAt(0)}
                </div>
                {conversation.unread && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
            </div>
            <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">{conversation.participantName}</h3>
                    <span className="text-xs text-gray-500">
                        {conversation.lastMessageTime && format(conversation.lastMessageTime, "h:mm a")}
                    </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
            </div>
        </div>
    );
}
