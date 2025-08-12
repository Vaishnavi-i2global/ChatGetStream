"use client";
import React from "react";

const EmptyChannelState = () => {
    return (
        <div className="flex items-center justify-center h-full bg-white">
            <div className="text-center p-6 max-w-md">
                <div className="mb-4">
                    <svg
                        className="w-16 h-16 mx-auto text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        ></path>
                    </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">No Channel Selected</h2>
                <p className="text-gray-500 mb-4">
                    Select a conversation from the list to start chatting
                </p>
                <p className="text-sm text-gray-400">
                    Your messages are end-to-end encrypted
                </p>
            </div>
        </div>
    );
};

export default EmptyChannelState;
