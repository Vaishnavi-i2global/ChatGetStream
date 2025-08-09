"use client";
import React from "react";
import ChatWindow from "./ChatWindow";
import ChatSidebar from "./ChatSidebar";
import type {
  User,
  ChannelSort,
  ChannelFilters,
  ChannelOptions,
} from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import "stream-chat-react/dist/css/v2/index.css";
import { useStreamConnection } from "@/providers/streamconnection.provider";

const ChatContainer = () => {
  const { streamClient, isLoading, error } = useStreamConnection();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center text-red-500">
          <p className="text-xl font-bold">Error connecting to chat</p>
          <p className="mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!streamClient) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <p className="text-xl font-bold">Chat client not initialized</p>
          <p className="mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <Chat client={streamClient}>
      <ChannelList />
      <Channel>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
};

export default ChatContainer;
