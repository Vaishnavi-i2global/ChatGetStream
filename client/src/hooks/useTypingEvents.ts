import { useRef, useEffect } from 'react';
import { Channel } from 'stream-chat';


export const useTypingEvents = (channel: Channel | undefined) => {
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clean up typing timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            // Make sure to stop typing when component unmounts
            if (channel) {
                channel.stopTyping();
            }
        };
    }, [channel]);

    // Send typing start event to the channel
    const startTyping = () => {
        if (channel) {
            channel.keystroke();
        }
    };

    //   Stop typing after a delay
    const scheduleStopTyping = (delay = 3000) => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (channel) {
                channel.stopTyping();
            }
        }, delay);
    };

    // Immediately stop typing
    const stopTyping = () => {
        if (channel) {
            channel.stopTyping();
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };
    //    Immediately stop typing
    const handleTyping = (text: string) => {
        if (text.length > 0) {
            startTyping();
            scheduleStopTyping();
        } else {
            stopTyping();
        }
    };

    return {
        handleTyping,
        startTyping,
        stopTyping,
    };
};
