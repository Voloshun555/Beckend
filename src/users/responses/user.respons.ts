
import { $Enums, Chat, Message } from "@prisma/client";
import { UserWithChatsAndMessages } from "@auth/interface";

export class UserResponse {
    id: string;
    email: string;
    name: string;
    avatar: string
    accessToken: string;
    updatedAt: Date;
    roles: $Enums.Role[];
    chats: Partial<Chat>[];
    message: Partial<Message>[];
    constructor(user: UserWithChatsAndMessages) {
        this.id = user.id;
        this.email = user.email;
        this.name = user.name;
        this.updatedAt = user.updatedAt;
        this.roles = user.roles;
        this.avatar = user.avatar;
        this.chats = user.chats;
        this.message = user.messages
    }
}