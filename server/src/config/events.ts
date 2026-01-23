// socket-events.ts

export const SocketEvent = {
    /**
     * Pre-defined events from the socket.io lib
     * */
    System: {
        CONNECT: "connect",
        DISCONNECT: "disconnect",
    },

    /**
     * EVENTS: CLIENT -> SERVER
     * Actions initiated by the user (Emitter: Client).
     */
    Client: {
        // --- Conversation Actions ---
        /**
         * Request to join a specific conversation room.
         */
        JOIN_CONVERSATION: "conversation:join",

        /**
         * Request to leave a conversation room.
         */
        LEAVE_CONVERSATION: "conversation:leave",

        // --- Message Actions ---
        /**
         * User sends a message in a conversation.
         */
        SEND_MESSAGE: "message:send",

        // --- Typing Actions ---
        /**
         * User starts typing in a conversation.
         */
        TYPING_START: "typing:start",

        /**
         * User stops typing in a conversation.
         */
        TYPING_STOP: "typing:stop",
    } as const,

    /**
     * EVENTS: SERVER -> CLIENT
     * Notifications sent to users (Emitter: Server).
     */
    Server: {
        // --- Conversation Events ---
        /**
         * Notification that a user has joined the conversation.
         */
        USER_JOINED_CONVERSATION: "conversation:user_joined",

        /**
         * Notification that a user has left the conversation.
         */
        USER_LEFT_CONVERSATION: "conversation:user_left",

        // --- Message Events ---
        /**
         * A new message has been received in the conversation.
         */
        RECEIVE_MESSAGE: "message:receive",

        // --- Typing Events ---
        /**
         * Notification to display that a specific user is typing.
         */
        DISPLAY_TYPING: "typing:display",
    } as const,
} as const;

// --- OPTIONAL: TYPE HELPERS ---
// This allows you to use these values as TypeScript types in your functions.

// Type = "conversation:join" | "message:send" | ...
export type ClientEventType =
    (typeof SocketEvent.Client)[keyof typeof SocketEvent.Client];

// Type = "conversation:user_joined" | "message:receive" | ...
export type ServerEventType =
    (typeof SocketEvent.Server)[keyof typeof SocketEvent.Server];
