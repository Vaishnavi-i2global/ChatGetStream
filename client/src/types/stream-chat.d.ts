import 'stream-chat';
import { MessageDataBase, MessageBase } from 'stream-chat';

declare module 'stream-chat' {
    // Extend the MessageResponse interface to include your custom fields
    interface MessageResponse {
        // Add your custom fields here
        order_details?: {
            order_id: string;
            status: string;
            items: Array<{
                name: string;
                quantity: number;
            }>;
        };
        is_special_message?: boolean;
        priority?: string;
        customType?: string;
        orderId?: string;
        metadata?: Record<string, any>;
        // Add any other custom fields you need
    }

    // Extend the MessageData interface if needed
    type MessageData = MessageBase & {
        // Add custom fields here too if you need them when creating messages
        order_details?: {
            order_id: string;
            status: string;
            items: Array<{
                name: string;
                quantity: number;
            }>;
        };
        is_special_message?: boolean;
        priority?: string;
        customType?: string;
        orderId?: string;
        metadata?: Record<string, any>;
    }
}
