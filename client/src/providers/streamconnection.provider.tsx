"use client";
import React, { useEffect, useState, createContext, useContext } from "react";
import { useAuth } from "./auth.provider";
import { useStreamConnectionApi } from "@/hooks/useStreamConnectionApi";
import { User } from "./auth.provider";
import { StreamChat } from "stream-chat";

interface StreamConnectionContextType {
  streamClient: StreamChat | null;
  isLoading: boolean;
  error: Error | null;
}

const initialContext: StreamConnectionContextType = {
  streamClient: null,
  isLoading: true,
  error: null,
};

const StreamConnectionContext =
  createContext<StreamConnectionContextType>(initialContext);

const StreamConnectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [streamClient, setStreamClient] = useState<StreamChat | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Only fetch token if we have a user
  const {
    data,
    isLoading: apiLoading,
    error: apiError,
  } = useStreamConnectionApi(user as User);

  useEffect(() => {
    // Clear any previous errors
    setError(null);

    // Check for required data
    if (!user || !user.id) {
      setIsLoading(false);
      return;
    }

    if (apiLoading) {
      setIsLoading(true);
      return;
    }

    if (apiError) {
      console.error("API Error:", apiError);
      setError(new Error(apiError.message));
      setIsLoading(false);
      return;
    }

    if (!data?.data?.token) {
      console.error("No token received from API");
      setError(new Error("Failed to get authentication token"));
      setIsLoading(false);
      return;
    }

    // Check if API key is available
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    if (!apiKey) {
      console.error("Stream API key is not defined");
      setError(new Error("Stream API key is missing"));
      setIsLoading(false);
      return;
    }

    try {
      // Initialize Stream Chat client
      const chat = new StreamChat(apiKey);

      let isInterrupted = false;

      // Connect user to Stream
      setIsLoading(true);
      const connectPromise = chat
        .connectUser({ id: user.id, name: user.username }, data.data.token)
        .then(() => {
          if (isInterrupted) return;
          console.log("Stream client connected successfully");
          setStreamClient(chat);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Stream connection error:", err);
          setError(err);
          setIsLoading(false);
        });

      return () => {
        isInterrupted = true;
        setStreamClient(null);

        if (chat.userID) {
          chat.disconnectUser().then(() => {
            console.log("Stream client disconnected");
          });
        }
      };
    } catch (err: any) {
      console.error("Error setting up Stream client:", err);
      setError(err);
      setIsLoading(false);
    }
  }, [user, data, apiLoading, apiError]);

  return (
    <StreamConnectionContext.Provider
      value={{
        streamClient,
        isLoading: isLoading || apiLoading,
        error,
      }}
    >
      {children}
    </StreamConnectionContext.Provider>
  );
};

export const useStreamConnection = () => {
  const context = useContext(StreamConnectionContext);
  if (!context) {
    throw new Error(
      "useStreamConnection must be used within a StreamConnectionProvider"
    );
  }
  return context;
};

export default StreamConnectionProvider;
