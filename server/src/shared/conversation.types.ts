export interface UserBasic {
    id: string;
    username: string;
    avatarUrl?: string;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    sender: UserBasic;
}
