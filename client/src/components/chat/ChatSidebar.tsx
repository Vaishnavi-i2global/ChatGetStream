"use client";

import { useChat, Conversation } from "@/providers/chat.provider";
import Image from "next/image";
import { format } from "date-fns";
import { ChannelListMessengerProps, useChatContext } from "stream-chat-react";
import { Channel as StreamChannel } from "stream-chat";

export default function ChatSidebar({ loadedChannels }: ChannelListMessengerProps) {
    const { setActiveChannel, channel: activeChannel } = useChatContext();
    const { conversations, activeConversation, setActiveConversation } = useChat();

    const formatTime = (date: string | undefined) => {
        if (!date) return "";
        return format(new Date(date), "h:mm a");
    };

    return (
        <div className="w-full h-full bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Messages</h2>
                <div className="mt-2 text-sm text-gray-500">
                    <span>{loadedChannels?.length || 0} chats available</span>
                </div>
            </div>
            <div className="overflow-y-auto h-[calc(100%-70px)]">
                {loadedChannels && loadedChannels.length > 0 ? (
                    loadedChannels.map((channel) => (
                        <ChannelItem
                            key={channel.id}
                            channel={channel}
                            isActive={activeChannel?.id === channel.id}
                            onClick={() => setActiveChannel(channel)}
                        />
                    ))
                ) : (
                    <div className="p-4 text-center text-gray-500">No channels found</div>
                )}
            </div>
        </div>
    );
}

interface ChannelItemProps {
    channel: StreamChannel;
    isActive: boolean;
    onClick: () => void;
}

function ChannelItem({ channel, isActive, onClick }: ChannelItemProps) {
    // Get the other user in the channel (for direct messages)


    const otherUser = Object.values(channel.state.members || {}).find(
        (member) => member.user?.id !== channel._client.userID
    )?.user;
    console.log(otherUser, "otherUser")
    // Get the channel name or use the other user's name for direct messages
    const channelName = otherUser?.name || 'Unknown Channel';

    // Get the last message
    const lastMessage = channel.state.messages[channel.state.messages.length - 1];
    const lastMessageText = lastMessage?.text || 'No messages yet';
    const lastMessageTime = lastMessage?.created_at;

    // Check if there are unread messages
    const unreadCount = channel.countUnread();

    return (
        <div
            className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${isActive ? "bg-blue-50" : ""}`}
            onClick={onClick}
        >
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                    {channelName.charAt(0)}
                </div>
                {unreadCount > 0 && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
            </div>
            <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">{channelName}</h3>
                    <span className="text-xs text-gray-500">
                        {lastMessageTime && format(new Date(lastMessageTime), "h:mm a")}
                    </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{lastMessageText}</p>
            </div>
        </div>
    );
}
