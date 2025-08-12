"use client";

import React, { useEffect, useState } from "react";
import { useChannelStateContext } from "stream-chat-react";
import { format } from "date-fns";
import { User, ArrowLeft, MoreVertical } from "lucide-react";

const CustomChannelHeader = () => {
    const { channel } = useChannelStateContext();

    const otherMember = Object.values(channel?.state?.members || {}).find(
        (member) => member.user?.id !== channel?._client?.userID
    );
    const otherUserId = otherMember?.user?.id;

    const [isOnline, setIsOnline] = useState(otherMember?.user?.online || false);
    const [lastActive, setLastActive] = useState(otherMember?.user?.last_active);

    // Listen to presence events
    useEffect(() => {
        if (!channel || !otherUserId) return;

        const client = channel.getClient();

        const handlePresenceChange = (event: any) => {
            if (event.user?.id === otherUserId) {
                setIsOnline(event.user.online);
                setLastActive(event.user.last_active);
            }
        };

        client.on("user.presence.changed", handlePresenceChange);

        // Optional: Listen for connection state changes
        client.on("connection.changed", (event: any) => {
            if (event.online === false && event.was_online) {
                setIsOnline(false);
            }
        });

        return () => {
            client.off("user.presence.changed", handlePresenceChange);
            client.off("connection.changed", (event: any) => {
                if (event.online === false && event.was_online) {
                    setIsOnline(false);
                }
            });
        };
    }, [channel, otherUserId]);

    const formatLastActive = () => {
        if (!lastActive) return "Unknown";
        return format(new Date(lastActive), "MMM d, h:mm a");
    };

    const otherUser = otherMember?.user;

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center">
                <button className="mr-2 text-gray-500 hover:text-gray-700 md:hidden">
                    <ArrowLeft size={20} />
                </button>
                <div className="relative">
                    {otherUser?.image ? (
                        <img
                            src={otherUser.image}
                            alt={otherUser.name || "User"}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                            {otherUser?.name?.charAt(0) || <User size={18} />}
                        </div>
                    )}
                    <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-400"
                            }`}
                    ></div>
                </div>
                <div className="ml-3">
                    <h3 className="font-medium text-gray-900">
                        {otherUser?.name || "Unknown"}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {isOnline ? "Online" : `Last seen ${formatLastActive()}`}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                    <MoreVertical size={18} />
                </button>
            </div>
        </div>
    );
};

export default CustomChannelHeader;
