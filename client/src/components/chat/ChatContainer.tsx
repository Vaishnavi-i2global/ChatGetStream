"use client";
import React from "react";
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
  ChannelList,
  Window,
  MessageInput,
  MessageList,
  useChannelStateContext,
  EmptyStateIndicator,
  useChatContext,
} from "stream-chat-react";

import "stream-chat-react/dist/css/v2/index.css";
import { useStreamConnection } from "@/providers/streamconnection.provider";
import clsx from "clsx";

// Import custom components
import CustomChannelHeader from "./CustomChannelHeader";
import CustomMessageList from "./CustomMessageList";
import CustomMessageInput from "./CustomMessageInput";
import CustomMessage from "./CustomMessage";
import EmptyChannelState from "./EmptyChannelState";

const ChatContainer = () => {
  const { streamClient, isLoading, error, activeChannel } = useStreamConnection();
  console.log(activeChannel, "SDFSDF");
  if (isLoading || !streamClient) {
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

  return (
    <div className="h-screen">
      <Chat client={streamClient} theme="str-chat__theme-custom">
        <section data-sidebar={"close"} className="grid gap-4 data-[sidebar=close]:md:grid-cols-[1fr_3fr] data-[sidebar=open]:md:grid-cols-[1fr_3fr_1.5fr] h-full">
          <ChannelList
            setActiveChannelOnMount={false}
            List={ChatSidebar}
            sendChannelsToList={true}
            filters={{
              members: { $in: [streamClient.userID || ''] }
            }}
            // sort={{ last_message_at: -1 }}
            options={{
              state: true,
              watch: true,
              presence: true,
              limit: 10,
              message_limit: 15
            }}
          />

          {
            !activeChannel ? (
              <EmptyChannelState />
            ) : (<Channel>
              <Window>
                <div className="flex flex-col justify-between h-full">
                  <CustomChannelHeader />
                  <div className="flex-1 bg-gray-50 h-[calc(100vh-150px)] max-h-[calc(100vh-150px)]">
                    <CustomMessageList />
                    {/* <MessageList /> */}
                  </div>
                  <CustomMessageInput />
                  {/* <MessageInput /> */}
                </div>
              </Window>
            </Channel>
            )
          }



          {/* <div>
            sdf
          </div> */}
        </section>
      </Chat>
    </div >
  );
};

export default ChatContainer;