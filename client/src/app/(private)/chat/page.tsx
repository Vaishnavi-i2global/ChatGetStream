"use client";

import ChatContainer from "@/components/chat/ChatContainer";
import { ChatProvider } from "@/providers/chat.provider";

export default function ChatPage() {
    return (
        <ChatProvider>
            <ChatContainer />
        </ChatProvider>
    );
}
