"use client";

import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { ChatProvider } from "@/providers/chat.provider";

export default function ChatPage() {
    return (
        <ChatProvider>
            <div className="flex h-[calc(100vh-64px)]">
                <div className="w-80 h-full">
                    <ChatSidebar />
                </div>
                <div className="flex-1 h-full">
                    <ChatWindow />
                </div>
            </div>
        </ChatProvider>
    );
}
