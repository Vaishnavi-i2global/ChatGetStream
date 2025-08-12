"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
    useChannelStateContext,
    useChannelActionContext
} from "stream-chat-react";
import { format } from "date-fns";
import CustomMessage from "./CustomMessage";
import { useChat } from "@/providers/chat.provider";
import { useRouter } from "next/navigation";
import throttle from "lodash/throttle";

const CustomMessageList = () => {
    const { messages, channel } = useChannelStateContext();
    const { loadMore: contextLoadMore } = useChannelActionContext();
    const { isFirstMessage } = useChat();
    const router = useRouter();

    // State variables
    const [prevChannelId, setPrevChannelId] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [lastMessageId, setLastMessageId] = useState<string | null>(null);
    const [prevMessageCount, setPrevMessageCount] = useState(0);
    const [isNewMessageArrived, setIsNewMessageArrived] = useState(false);

    // Message pagination settings
    const MESSAGE_LIMIT = 15;
    const SCROLL_THRESHOLD = 150; // pixels from top to trigger loading

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // useEffect(() => {
    //     if (isFirstMessage) {
    //         console.log(isFirstMessage, channel, "asfddf");
    //         // router.refresh()
    //         router.replace("/chat")
    //         // router.prefetch(`/chat`)
    //         const fetchInitialMessages = async () => {

    //             // setIsInitialLoad(true);
    //             // setPrevChannelId(channel.id);

    //             try {
    //                 // Fetch latest messages
    //                 // await channel.query({
    //                 //     messages: { limit: 25 },
    //                 //     watch: true,
    //                 // });
    //                 await channel.watch({ messages: { limit: 10 } });
    //                 console.log(channel.state.messages, messages); // Now populated

    //                 // Alternative: Use channel.watch() which also fetches messages
    //                 // await channel.watch();

    //             } catch (error) {
    //                 console.error('Error fetching initial messages:', error);
    //             } finally {
    //                 // setIsInitialLoad(false);
    //             }
    //         };

    //         fetchInitialMessages();
    //         // const init = async () => {
    //         //     // Scroll instantly
    //         //     if (messagesEndRef.current) {
    //         //         messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    //         //     }

    //         //     try {
    //         //         // Await channel watch
    //         //         await channel.watch({ state: true });
    //         //         console.log(isFirstMessage, "asfddf");
    //         //     } catch (error) {
    //         //         console.error("Error watching channel:", error);
    //         //     }
    //         // };

    //         // init();
    //     }
    // }, [isFirstMessage, channel]);


    // Load more messages with throttling
    const loadMoreMessages = useCallback(async () => {
        if (!channel || !hasMore || loadingMore) return;

        try {
            setLoadingMore(true);
            setError(null);

            // Store current scroll position and height before loading
            const container = containerRef.current;
            let scrollHeight = container?.scrollHeight || 0;
            let scrollPosition = container?.scrollTop || 0;

            // Use the loadMore function from ChannelActionContext
            const hasMoreMessages = await contextLoadMore(MESSAGE_LIMIT);

            // Update hasMore state based on the result
            setHasMore(!!hasMoreMessages);

            // Maintain scroll position after new messages are loaded
            setTimeout(() => {
                if (container) {
                    // Calculate how much the scroll height has changed
                    const newScrollHeight = container.scrollHeight;
                    const scrollHeightDelta = newScrollHeight - scrollHeight;

                    // Adjust scroll position to maintain the same relative position
                    container.scrollTop = scrollPosition + scrollHeightDelta;
                }
            }, 100);

            console.log(`Loaded ${MESSAGE_LIMIT} more messages, has more: ${hasMoreMessages}`);
        } catch (err) {
            console.error("Error loading more messages:", err);
            setError(err instanceof Error ? err : new Error('Unknown error loading messages'));
        } finally {
            setLoadingMore(false);
        }
    }, [channel, hasMore, loadingMore, contextLoadMore]);

    // Create throttled version of loadMoreMessages (only triggers once per 500ms)
    const throttledLoadMore = useCallback(
        throttle(() => {
            loadMoreMessages();
        }, 500),
        [loadMoreMessages]
    );

    // Handle scroll to load more messages
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {

        const container = containerRef.current;
        if (!container || !hasMore || loadingMore) return;

        const { scrollTop } = container;


        if (scrollTop < SCROLL_THRESHOLD) {

            throttledLoadMore();
        }
    }, [hasMore, loadingMore, throttledLoadMore]);

    // Detect new messages vs. loaded older messages
    useEffect(() => {
        if (!channel || !messages || messages.length === 0) return;

        // Get the latest message
        const latestMessage = messages[messages.length - 1];
        const currentLastMessageId = latestMessage?.id;

        // Check if this is a new message (not from loading more)
        if (messages.length > prevMessageCount && currentLastMessageId !== lastMessageId) {
            setIsNewMessageArrived(true);
        } else {
            setIsNewMessageArrived(false);
        }

        // Update state for next comparison
        setPrevMessageCount(messages.length);
        setLastMessageId(currentLastMessageId || null);

    }, [messages, channel, prevMessageCount, lastMessageId]);

    // Scroll to bottom only for new messages or channel changes
    useEffect(() => {
        if (!channel || !messagesEndRef.current) return;

        // Scroll on channel change
        if (channel.id !== prevChannelId) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" });
            return;
        }

        // Scroll on new message, but only if user is already near bottom
        if (isNewMessageArrived) {
            const container = containerRef.current;
            if (container) {
                const { scrollHeight, scrollTop, clientHeight } = container;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 800;

                if (isNearBottom) {
                    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
                }
            }
        }
    }, [isNewMessageArrived, channel?.id, prevChannelId]);

    // Group messages by date
    const groupMessagesByDate = () => {
        if (!messages) return {};

        const groups: { [key: string]: any[] } = {};

        messages.forEach((message) => {
            if (!message.created_at) return;

            const date = new Date(message.created_at);
            const dateStr = format(date, "MMMM d, yyyy");

            if (!groups[dateStr]) {
                groups[dateStr] = [];
            }

            groups[dateStr].push(message);
        });

        return groups;
    };

    const messageGroups = groupMessagesByDate();

    // Reset pagination states when channel changes
    useEffect(() => {
        if (channel?.id && channel.id !== prevChannelId) {
            setHasMore(true);
            setError(null);
            setPrevChannelId(channel.id);
        }
    }, [channel?.id, prevChannelId]);

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto p-4 bg-gray-50 h-full"
            onScroll={handleScroll}
        >
            {/* Loading indicator at the top */}
            {loadingMore && (
                <div className="flex justify-center py-2 mb-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Error message with retry button */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
                    <p>Failed to load messages</p>
                    <button
                        onClick={() => loadMoreMessages()}
                        className="text-sm underline mt-1 hover:text-red-800"
                    >
                        Try again
                    </button>
                </div>
            )}

            {messages && messages.length > 0 ? (
                Object.entries(messageGroups).map(([date, dateMessages]) => (
                    <div key={date} className="mb-6">
                        <div className="flex justify-center mb-4">
                            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                {date}
                            </div>
                        </div>

                        {dateMessages && dateMessages.map((message, i) => (
                            <div key={message.id || `message-${i}`}>
                                <CustomMessage message={message} />
                            </div>
                        ))}
                    </div>
                ))
            ) : (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                        <p>No messages yet</p>
                        <p className="text-sm mt-1">Start the conversation by sending a message</p>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default CustomMessageList;