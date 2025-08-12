"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { Search } from "lucide-react";
import {
    useChatContext,
    ChannelListMessengerProps,
} from "stream-chat-react";
import { Channel as StreamChannel, Event } from "stream-chat";

import { useGetUsers, useCreateChannel } from "@/hooks/useStreamConnectionApi";
import { useStreamConnection } from "@/providers/streamconnection.provider";

interface User {
    id: string;
    username: string;
    email: string;
    profile_pic: string | null;
}

export default function ChatSidebar({ loadedChannels }: ChannelListMessengerProps) {
    const { client, setActiveChannel, channel: activeChannel } = useChatContext();
    const { setActiveChannel: setCustomActiveChannel } = useStreamConnection();

    const [search, setSearch] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const { data: usersResponse, isLoading } = useGetUsers(search);
    const { createChannel } = useCreateChannel();

    const users: User[] =
        usersResponse?.data?.data?.filter((u: User) => u.id !== client?.userID) || [];

    /** Create a new chat channel with a user */
    const handleCreateChannel = async (userId: string) => {
        if (!client) return;

        try {
            const res = await createChannel({
                sender_id: client.userID || "",
                receiver_id: userId,
                created_by: client.userID || "",
            });

            const channelId = res.data.channel_id;
            const channel = client.channel("messaging", channelId);

            await channel.watch();
            setActiveChannel(channel);
            setCustomActiveChannel(channel);

            setSearch("");
            setIsSearching(false);
        } catch (err) {
            console.error("Error creating channel:", err);
        }
    };

    return (
        <div className="w-full h-full bg-white border-r border-gray-200">
            {/* Header */}
            <SidebarHeader totalChats={loadedChannels?.length || 0} />

            {/* Search */}
            <SearchBox
                value={search}
                onChange={(val) => {
                    setSearch(val);
                    setIsSearching(val.length > 0);
                }}
            />

            {/* List */}
            <div className="overflow-y-auto h-[calc(100%-140px)]">
                {isSearching ? (
                    <SearchResults
                        users={users}
                        isLoading={isLoading}
                        loadedChannels={loadedChannels}
                        onUserSelect={handleCreateChannel}
                    />
                ) : (
                    <ChannelList
                        channels={loadedChannels}
                        activeChannelId={activeChannel?.id}
                        onChannelSelect={(ch) => {
                            setActiveChannel(ch);
                            setCustomActiveChannel(ch);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

/* ---------- Small Components ---------- */

function SidebarHeader({ totalChats }: { totalChats: number }) {
    return (
        <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Messages</h2>
            <p className="mt-2 text-sm text-gray-500">{totalChats} chats available</p>
        </div>
    );
}

function SearchBox({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    return (
        <div className="p-4 border-b border-gray-200">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute right-3 top-2.5 text-gray-400">
                    <Search size={18} />
                </div>
            </div>
        </div>
    );
}

function SearchResults({
    users,
    isLoading,
    loadedChannels,
    onUserSelect,
}: {
    users: User[];
    isLoading: boolean;
    loadedChannels?: StreamChannel[];
    onUserSelect: (id: string) => void;
}) {
    if (isLoading) {
        return (
            <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Searching users...</p>
            </div>
        );
    }

    if (users.length === 0) {
        return <div className="p-4 text-center text-gray-500">No users found</div>;
    }

    return (
        <>
            <div className="p-2 bg-gray-50">
                <p className="text-xs text-gray-500 font-medium px-2">SEARCH RESULTS</p>
            </div>
            {users.map((user) => {
                const hasChannel = loadedChannels?.some((ch) =>
                    Object.values(ch.state.members || {}).some(
                        (m) => m.user?.id === user.id
                    )
                );
                return (
                    <UserSearchItem
                        key={user.id}
                        user={user}
                        onClick={() => onUserSelect(user.id)}
                        hasExistingChannel={!!hasChannel}
                    />
                );
            })}
        </>
    );
}

function UserSearchItem({
    user,
    onClick,
    hasExistingChannel,
}: {
    user: User;
    onClick: () => void;
    hasExistingChannel: boolean;
}) {
    return (
        <div
            className="flex items-center p-4 cursor-pointer hover:bg-gray-50"
            onClick={onClick}
        >
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                {hasExistingChannel && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
            </div>
            <div className="ml-3 flex-1">
                <h3 className="font-medium text-gray-900">{user.username}</h3>
                <p className="text-sm text-gray-500 truncate">
                    {hasExistingChannel ? "Existing conversation" : "Start a conversation"}
                </p>
            </div>
        </div>
    );
}

function ChannelList({
    channels,
    activeChannelId,
    onChannelSelect,
}: {
    channels?: StreamChannel[];
    activeChannelId?: string;
    onChannelSelect: (ch: StreamChannel) => void;
}) {
    if (!channels || channels.length === 0) {
        return <div className="p-4 text-center text-gray-500">No channels found</div>;
    }

    return (
        <>
            {channels.map((ch) => (
                <ChannelItem
                    key={ch.id}
                    channel={ch}
                    isActive={ch.id === activeChannelId}
                    onClick={() => onChannelSelect(ch)}
                />
            ))}
        </>
    );
}

function ChannelItem({
    channel,
    isActive,
    onClick,
}: {
    channel: StreamChannel;
    isActive: boolean;
    onClick: () => void;
}) {
    const [latestMessage, setLatestMessage] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(channel.countUnread());

    const otherUser = Object.values(channel.state.members || {}).find(
        (m) => m.user?.id !== channel._client.userID
    )?.user;

    const channelName =
        otherUser?.name || otherUser?.username || "Unknown Channel";

    useEffect(() => {
        const updateLatestMessage = () => {
            const sorted = [...channel.state.messages].sort(
                (a, b) =>
                    new Date(b.created_at || "").getTime() -
                    new Date(a.created_at || "").getTime()
            );
            setLatestMessage(sorted[0]);
        };

        const updateUnread = () => {
            setUnreadCount(channel.countUnread());
        };

        // Initialize state
        updateLatestMessage();
        updateUnread();

        // Event: New message
        const handleNew = (event: any) => {
            updateLatestMessage();
            if (event.user?.id !== channel._client.userID) {
                updateUnread();
            }
        };

        // Event: Message updated
        const handleUpdate = () => updateLatestMessage();

        // Event: Message deleted
        const handleDelete = () => updateLatestMessage();

        // Event: Mark messages as read
        const handleRead = () => updateUnread();

        // Register listeners
        channel.on("message.new", handleNew);
        channel.on("message.updated", handleUpdate);
        channel.on("message.deleted", handleDelete);
        channel.on("message.read", handleRead);
        channel.on("notification.mark_read", handleRead);

        // Cleanup
        return () => {
            channel.off("message.new", handleNew);
            channel.off("message.updated", handleUpdate);
            channel.off("message.deleted", handleDelete);
            channel.off("message.read", handleRead);
            channel.off("notification.mark_read", handleRead);
        };
    }, [channel]);

    const lastText =
        latestMessage?.text ||
        latestMessage?.attachments?.[0]?.fallback ||
        "No messages yet";

    const lastTime = latestMessage?.created_at;

    return (
        <div
            className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${isActive ? "bg-blue-50" : ""
                }`}
            onClick={onClick}
        >
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                    {channelName.charAt(0)}
                </div>
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[1.2rem] h-4 px-1 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                    </div>
                )}
            </div>
            <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">{channelName}</h3>
                    <span className="text-xs text-gray-500">
                        {lastTime && format(new Date(lastTime), "h:mm a")}
                    </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{lastText}</p>
            </div>
        </div>
    );
}

;
