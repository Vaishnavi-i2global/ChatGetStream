"use client";

import React from "react";
import { useChannelStateContext } from "stream-chat-react";
import { format } from "date-fns";
import { User, ArrowLeft, CircleDot } from "lucide-react";

const CustomChannelHeader = () => {
    const { channel } = useChannelStateContext();

    // Get the other member in the channel
    const otherMember = Object.values(channel?.state?.members || {}).find(
        (member) => member.user?.id !== channel?._client?.userID
    );

    const otherUser = otherMember?.user;
    const isOnline = otherMember?.user?.online || false;
    const lastActive = otherMember?.user?.last_active;

    // Format the last active time
    const formatLastActive = () => {
        if (!lastActive) return "Unknown";
        return format(new Date(lastActive), "MMM d, h:mm a");
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
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
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></div>
                </div>
                <div className="ml-3">
                    <h3 className="font-medium text-gray-900">{otherUser?.name || "Unknown"}</h3>
                    <p className="text-xs text-gray-500">
                        {isOnline ? "Online" : `Last seen ${formatLastActive()}`}
                    </p>
                </div>
            </div>
            <div className="flex items-center">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                    <CircleDot size={18} />
                </button>
            </div>
        </div>
    );
};

export default CustomChannelHeader;
