"use client";

import { useState } from "react";
import { useChat } from "@/providers/chat.provider";
import { format } from "date-fns";
import { useAuth } from "@/providers/auth.provider";
import { Send } from "lucide-react";

export default function ChatWindow() {
    const { activeConversation, sendMessage } = useChat();
    const { user } = useAuth();
    const [messageInput, setMessageInput] = useState("");

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (messageInput.trim()) {
            sendMessage(messageInput);
            setMessageInput("");
        }
    };

    if (!activeConversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-700">Select a conversation</h3>
                    <p className="text-gray-500 mt-1">Choose a chat from the sidebar to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                    {activeConversation.participantName.charAt(0)}
                </div>
                <div className="ml-3">
                    <h3 className="font-medium text-gray-900">{activeConversation.participantName}</h3>
                    <p className="text-xs text-gray-500">Online</p>
                </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {activeConversation.messages.map((message) => (
                    <div
                        key={message.id}
                        className={`mb-4 flex ${message.senderId === user?.id ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`max-w-xs md:max-w-md rounded-lg p-3 ${message.senderId === user?.id
                                ? "bg-blue-500 text-white rounded-br-none"
                                : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                                }`}
                        >
                            <p>{message.content}</p>
                            <div
                                className={`text-xs mt-1 ${message.senderId === user?.id ? "text-blue-100" : "text-gray-500"
                                    }`}
                            >
                                {format(new Date(message.timestamp), "h:mm a")}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                        type="text"
                        placeholder="Type a message"
                        className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
