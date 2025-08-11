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
import clsx from "clsx";

const ChatContainer = () => {
  const { streamClient, isLoading, error } = useStreamConnection();

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
    <div className=" h-screen">
      <Chat client={streamClient} theme='str-chat__theme-custom'>
        <section data-sidebar={"close"} className="grid  gap-4 data-[sidebar=close]:md:grid-cols-[1fr_3fr] data-[sidebar=open]:md:grid-cols-[1fr_3fr_1.5fr] h-full">

          <ChannelList
            setActiveChannelOnMount={false}
            List={ChatSidebar}
            sendChannelsToList={true}
            filters={{
              members: { $in: [streamClient.userID || ''] }
            }}
          // sort={{ last_message_at: -1 }}
          // options={{
          //   state: true,
          //   watch: true,
          //   presence: true,
          //   limit: 10,
          // }}
          />

          <Channel>

            <Window>
              <div className="flex flex-col justify-between h-full">
                <ChannelHeader />
                <div className="px-4 py-3 overflow-y-auto flex flex-col gap-4 h-full">
                  <MessageList />
                </div>

                <MessageInput />
              </div>

            </Window>


            {/* <Thread /> */}
          </Channel>
          {/* <div>
            sdf
          </div> */}
        </section>
      </Chat>
    </div>
  );
};

export default ChatContainer;
