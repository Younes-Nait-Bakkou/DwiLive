// --- Types (DTOs) ---
export interface MessageDTO {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: "text" | "image" | "system";
    metadata?: Record<string, unknown>;
    createdAt: string;
}
