"use client";

import { useChat, Conversation } from "@/providers/chat.provider";
import Image from "next/image";
import { format } from "date-fns";
import { ChannelListMessengerProps, useChatContext } from "stream-chat-react";
import { Channel as StreamChannel } from "stream-chat";
import { useGetUsers } from "@/hooks/useStreamConnectionApi";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface User {
    id: string;
    username: string;
    email: string;
    profile_pic: string | null;
}

export default function ChatSidebar({ loadedChannels }: ChannelListMessengerProps) {
    const { client, setActiveChannel, channel: activeChannel } = useChatContext();

    const [search, setSearch] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const { data: usersResponse, isLoading, error } = useGetUsers(search);

    // Extract users from the response
    const users = usersResponse?.data?.data?.filter((user: User) => user.id !== client?.userID) || [];

    // Function to create a new channel with a user
    const createNewChannel = async (userId: string, username: string) => {
        if (!client) return;

        try {
            // want to chagne adding user and creating channel thing through backend later
            const exisitngUsers = await client.queryUsers({
                id: { $eq: userId }
            });
            if (exisitngUsers.users.length === 0) {
                await client.upsertUser({
                    id: userId,
                    name: username,
                    role: 'user',
                    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
                    // email: email
                });
            }
            // 
            // Create a new channel
            const channel = client.channel('messaging', {
                members: [client.userID || '', userId],
            });

            // Initialize the channel
            await channel.create();
            // await channel.watch();

            // Set as active channel
            setActiveChannel(channel);
            setIsSearching(false);
            setSearch("");
        } catch (error) {
            console.error("Error creating channel:", error);
        }
    };

    // Filter users based on existing channels
    // useEffect(() => {
    //     if (!isSearching || !users.length) return;

    //     // Get existing channel member IDs
    //     const existingMemberIds = new Set<string>();
    //     loadedChannels?.forEach(channel => {
    //         Object.values(channel.state.members || {}).forEach(member => {
    //             if (member.user?.id && member.user.id !== client?.userID) {
    //                 existingMemberIds.add(member.user.id);
    //             }
    //         });
    //     });

    //     // Separate users into those with existing channels and those without
    //     const usersWithChannels: User[] = [];

    //     users.forEach((user: User) => {
    //         if (existingMemberIds.has(user.id)) {
    //             usersWithChannels.push(user);
    //         }
    //     });

    //     // Combine the arrays with users with channels first
    //     setSearchResults([...usersWithChannels,]);
    // }, [users, loadedChannels, isSearching, client?.userID]);

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
                <div className="mt-3 relative">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setIsSearching(e.target.value.length > 0);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="absolute right-3 top-2.5 text-gray-400">
                            <Search size={18} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-140px)]">
                {isSearching ? (
                    <div className="divide-y divide-gray-100">
                        {isLoading ? (
                            <div className="p-4 text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-500">Searching users...</p>
                            </div>
                        ) : users.length > 0 ? (
                            <>
                                <div className="p-2 bg-gray-50">
                                    <p className="text-xs text-gray-500 font-medium px-2">SEARCH RESULTS</p>
                                </div>
                                {users.map((user: User) => (
                                    <UserSearchItem
                                        key={user.id}
                                        user={user}
                                        onClick={() => createNewChannel(user.id, user.username)}
                                        hasExistingChannel={!!loadedChannels?.some(channel =>
                                            Object.values(channel.state.members || {}).some(
                                                member => member.user?.id === user.id
                                            )
                                        )}
                                    />
                                ))}
                            </>
                        ) : search.length > 0 ? (
                            <div className="p-4 text-center text-gray-500">No users found</div>
                        ) : null}
                    </div>
                ) : (
                    loadedChannels && loadedChannels.length > 0 ? (
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
                    )
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

interface UserSearchItemProps {
    user: User;
    onClick: () => void;
    hasExistingChannel: boolean;
}

function UserSearchItem({ user, onClick, hasExistingChannel }: UserSearchItemProps) {
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
                <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">{user.username}</h3>
                </div>
                <p className="text-sm text-gray-500 truncate">
                    {hasExistingChannel ? 'Existing conversation' : 'Start a new conversation'}
                </p>
            </div>
        </div>
    );
}

function ChannelItem({ channel, isActive, onClick }: ChannelItemProps) {
    // Get the other user in the channel (for direct messages)
    const otherUser = Object.values(channel.state.members || {}).find(
        (member) => member.user?.id !== channel._client.userID
    )?.user;

    // Get the channel name or use the other user's name for direct messages
    const channelName = otherUser?.name || 'Unknown Channel';

    // Get the last message
    const lastMessage = channel.state.messages[channel.state.messages.length - 1];
    const lastMessageText = lastMessage?.text || lastMessage?.attachments?.[0]?.fallback || 'No messages yet';
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
