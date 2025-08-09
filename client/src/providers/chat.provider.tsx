"use client";

import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./auth.provider";

// Define message type
export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: Date;
}

// Define conversation type
export interface Conversation {
    id: string;
    participantId: string;
    participantName: string;
    lastMessage?: string;
    lastMessageTime?: Date;
    unread?: boolean;
    messages: Message[];
}

// Define chat context type
interface ChatContextType {
    conversations: Conversation[];
    activeConversation: Conversation | null;
    setActiveConversation: (conversation: Conversation) => void;
    sendMessage: (content: string) => void;
}

// Create dummy data
const dummyConversations: Conversation[] = [
    {
        id: "1",
        participantId: "user1",
        participantName: "Jordan Lawrence",
        lastMessage: "Hey there! How's it going?",
        lastMessageTime: new Date("2023-10-15T11:42:00"),
        unread: true,
        messages: [
            {
                id: "msg1",
                senderId: "user1",
                senderName: "Jordan Lawrence",
                content: "Hey there! How's it going?",
                timestamp: new Date("2023-10-15T11:42:00"),
            },
        ],
    },
    {
        id: "2",
        participantId: "user2",
        participantName: "Jordan Lawrence",
        lastMessage: "Did you finish the project?",
        lastMessageTime: new Date("2023-10-15T10:30:00"),
        unread: false,
        messages: [
            {
                id: "msg2",
                senderId: "user2",
                senderName: "Jordan Lawrence",
                content: "Did you finish the project?",
                timestamp: new Date("2023-10-15T10:30:00"),
            },
        ],
    },
    {
        id: "3",
        participantId: "user3",
        participantName: "Jordan Lawrence",
        lastMessage: "Let's meet tomorrow",
        lastMessageTime: new Date("2023-10-14T09:15:00"),
        unread: false,
        messages: [
            {
                id: "msg3",
                senderId: "user3",
                senderName: "Jordan Lawrence",
                content: "Let's meet tomorrow",
                timestamp: new Date("2023-10-14T09:15:00"),
            },
        ],
    },
    {
        id: "4",
        participantId: "user4",
        participantName: "Jordan Lawrence",
        lastMessage: "Thanks for your help!",
        lastMessageTime: new Date("2023-10-13T15:20:00"),
        unread: true,
        messages: [
            {
                id: "msg4",
                senderId: "user4",
                senderName: "Jordan Lawrence",
                content: "Thanks for your help!",
                timestamp: new Date("2023-10-13T15:20:00"),
            },
        ],
    },
    {
        id: "5",
        participantId: "user5",
        participantName: "Jordan Lawrence",
        lastMessage: "See you later!",
        lastMessageTime: new Date("2023-10-12T14:10:00"),
        unread: false,
        messages: [
            {
                id: "msg5",
                senderId: "user5",
                senderName: "Jordan Lawrence",
                content: "See you later!",
                timestamp: new Date("2023-10-12T14:10:00"),
            },
        ],
    },
];

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Chat provider component
export function ChatProvider({ children }: React.PropsWithChildren) {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>(dummyConversations);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

    // Send message function
    const sendMessage = (content: string) => {
        if (!activeConversation || !user) return;

        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: user.id || "currentUser",
            senderName: user.username,
            content,
            timestamp: new Date(),
        };

        const updatedConversation = {
            ...activeConversation,
            lastMessage: content,
            lastMessageTime: new Date(),
            messages: [...activeConversation.messages, newMessage],
        };

        setConversations(
            conversations.map((conv) =>
                conv.id === activeConversation.id ? updatedConversation : conv
            )
        );
        setActiveConversation(updatedConversation);
    };

    return (
        <ChatContext.Provider
            value={{
                conversations,
                activeConversation,
                setActiveConversation,
                sendMessage,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

// Custom hook to use chat context
export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}
