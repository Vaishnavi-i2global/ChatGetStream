"use client";

import ChatContainer from "@/components/chat/ChatContainer";
import { ChatProvider } from "@/providers/chat.provider";
import StreamConnectionProvider from "@/providers/streamconnection.provider";
export default function ChatPage() {
  return (
    <StreamConnectionProvider>
      <ChatProvider>
        <ChatContainer />
      </ChatProvider>
    </StreamConnectionProvider>
  );
}
