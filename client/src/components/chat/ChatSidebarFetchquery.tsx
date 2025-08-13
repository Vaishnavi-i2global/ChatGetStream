"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { Search } from "lucide-react";
import { throttle } from "lodash";
import {
    useChatContext,
} from "stream-chat-react";
import { Channel as StreamChannel, Event, ChannelFilters, ChannelOptions, ChannelSort } from "stream-chat";

import { useGetUsers, useCreateChannel } from "@/hooks/useStreamConnectionApi";
import { useStreamConnection } from "@/providers/streamconnection.provider";

interface User {
    id: string;
    username: string;
    email: string;
    profile_pic: string | null;
}

// Simple props interface for ChatSidebar
interface ChatSidebarProps {
    loadedChannels?: StreamChannel[]; // This prop is now effectively unused in the main ChatSidebar logic
}

export default function ChatSidebar({ loadedChannels }: ChatSidebarProps) {
    const { client, setActiveChannel, channel: activeChannel } = useChatContext();
    const { setActiveChannel: setCustomActiveChannel } = useStreamConnection();

    const [search, setSearch] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // Channel query states
    const [channels, setChannels] = useState<StreamChannel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 8; // Limit for fetching channels

    // Reference to the container for scroll detection
    const containerRef = useRef<HTMLDivElement>(null);

    const { data: usersResponse, isLoading } = useGetUsers(search);
    const { createChannel } = useCreateChannel();

    // Scroll threshold in pixels
    const SCROLL_THRESHOLD = 200;

    // Track if we're currently loading to prevent duplicate calls
    const isLoadingRef = useRef(false);

    // Function to fetch channels directly
    const queryChannels = useCallback(async (loadMore = false) => {
        // Prevent duplicate calls
        if (!client) return;
        if (isLoadingRef.current) return;
        if (loading && !loadMore) return;
        if (loadMore && !hasMore) return;

        try {
            isLoadingRef.current = true;
            setLoading(true);

            // Define filters, sort, and options
            const filters: ChannelFilters = {
                members: { $in: [client.userID || ''] }
            };

            const sort: ChannelSort = { last_message_at: -1 };

            const options: ChannelOptions = {
                limit: LIMIT,
                offset: loadMore ? offset : 0,
                message_limit: 15,
                state: true,
                watch: true,
                presence: true,
            };

            console.log(`Fetching channels: offset=${options.offset}, limit=${options.limit}`);

            // Query channels from the client
            const response = await client.queryChannels(filters, sort, options);
            console.log(`Received ${response.length} channels`);

            // Update state based on whether we're loading more or initial load
            if (loadMore) {
                // Check for duplicates to avoid adding the same channel twice
                const existingIds = new Set(channels.map(ch => ch.id));
                const newChannels = response.filter(ch => !existingIds.has(ch.id));

                if (newChannels.length > 0) {
                    setChannels(prev => [...prev, ...newChannels]);
                    setOffset(prev => prev + newChannels.length);
                }
            } else {
                setChannels(response);
                setOffset(response.length);
            }

            // Check if we have more channels to load
            setHasMore(response.length === LIMIT);

        } catch (err) {
            console.error('Error fetching channels:', err);
            setError(err instanceof Error ? err : new Error('Unknown error fetching channels'));
        } finally {
            setLoading(false);
            // Add a small delay before allowing new requests to prevent rapid consecutive calls
            setTimeout(() => {
                isLoadingRef.current = false;
            }, 300);
        }
    }, [client, offset, loading, hasMore, channels, LIMIT]);

    // Use a ref to track initial load
    const initialLoadRef = useRef(false);

    // Load initial channels only once
    useEffect(() => {
        if (client && !initialLoadRef.current) {
            initialLoadRef.current = true;
            queryChannels();
        }
    }, [client, queryChannels]);

    // Track if we're currently loading more to prevent multiple calls
    const isLoadingMoreRef = useRef(false);

    // Create a throttled scroll handler to prevent excessive calls
    const handleScroll = useCallback(
        throttle(() => {
            // Prevent loading if:
            // - No container ref
            // - Already loading
            // - No more channels to load
            // - User is searching
            // - Already in the process of loading more
            if (!containerRef.current || loading || !hasMore || isSearching || isLoadingMoreRef.current) return;

            const container = containerRef.current;
            const { scrollTop, scrollHeight, clientHeight } = container;

            // Calculate distance from bottom
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

            // Load more channels when user scrolls near the bottom
            if (distanceFromBottom < SCROLL_THRESHOLD) {
                console.log(`Loading more channels. Distance from bottom: ${distanceFromBottom}px`);

                // Set flag to prevent multiple calls
                isLoadingMoreRef.current = true;

                // Load more channels
                queryChannels(true).finally(() => {
                    // Reset flag when done, regardless of success or failure
                    setTimeout(() => {
                        isLoadingMoreRef.current = false;
                    }, 500); // Add a small delay to prevent rapid consecutive calls
                });
            }
        }, 500), // Increased throttle to 500ms for better performance
        [loading, hasMore, isSearching, queryChannels, SCROLL_THRESHOLD]
    );

    // Add scroll event listener
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            // Add passive event listener for better scroll performance
            container.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
                // Make sure to cancel any pending throttled executions
                handleScroll.cancel();
            }
        };
    }, [handleScroll]);

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
            <SidebarHeader totalChats={channels?.length || 0} />

            {/* Search */}
            <SearchBox
                value={search}
                onChange={(val) => {
                    setSearch(val);
                    setIsSearching(val.length > 0);
                }}
            />

            {/* List */}
            <div
                ref={containerRef}
                className="overflow-y-auto max-h-[calc(100vh-170px)]"
            >
                {isSearching ? (
                    <SearchResults
                        users={users}
                        isLoading={isLoading}
                        loadedChannels={channels} // Use our directly fetched channels
                        onUserSelect={handleCreateChannel}
                    />
                ) : (
                    <>
                        {/* Initial loading state */}
                        {loading && channels.length === 0 && (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        )}

                        {/* Error state */}
                        {error && (
                            <div className="p-4 text-center text-red-500">
                                <p>Error loading channels</p>
                                <button
                                    onClick={() => queryChannels()}
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Channel list */}
                        <ChannelList
                            channels={channels} // Use our directly fetched channels
                            activeChannelId={activeChannel?.id}
                            onChannelSelect={(ch) => {
                                setActiveChannel(ch);
                                setCustomActiveChannel(ch);
                            }}
                        />

                        {/* Loading more indicator */}
                        {loading && channels.length > 0 && (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        )}

                        {/* End of list indicator */}
                        {!hasMore && channels.length > 0 && !loading && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No more channels to load
                            </div>
                        )}
                    </>
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
