"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    useChannelStateContext,
} from "stream-chat-react";
import { format } from "date-fns";
import CustomMessage from "./CustomMessage";
import { useChat } from "@/providers/chat.provider";
import { useRouter } from "next/navigation";

const CustomMessageList = () => {
    const { messages, channel } = useChannelStateContext();
    const { isFirstMessage } = useChat()
    const router = useRouter()
    const [prevChannelId, setPrevChannelId] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

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

    // 1️⃣ Jump instantly when channel changes
    useEffect(() => {
        if (channel?.id && channel.id !== prevChannelId) {
            setPrevChannelId(channel.id);
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: "auto" });
            }
        }
    }, [channel?.id]);

    // 2️⃣ Smooth scroll when a new message arrives
    useEffect(() => {
        if (!channel) return;
        if (messagesEndRef.current && messages && messages.length > 0) {
            // Don't trigger smooth scroll on channel switch
            if (channel.id === prevChannelId) {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages?.length]);
    // Handle scroll to load more messages
    const handleScroll = async () => {
        const container = containerRef.current;
        if (!container || !hasMore || loadingMore) return;

        const { scrollTop } = container;
        const isAtTop = scrollTop < 100;

        if (isAtTop) {
            try {
                setLoadingMore(true);

                // Get the oldest message ID
                const oldestMessageId = messages && messages.length > 0 ? messages[0].id : null;

                if (oldestMessageId) {
                    // This would be where you'd load more messages
                    // For now, we'll just simulate it
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // If no more messages are returned, set hasMore to false
                    setHasMore(false);
                }
            } catch (error) {
                console.error("Error loading more messages:", error);
            } finally {
                setLoadingMore(false);
            }
        }
    };

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

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto p-4 bg-gray-50"
            onScroll={handleScroll}
        >
            {loadingMore && (
                <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
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