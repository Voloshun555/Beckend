import { Chat, Message, Token, User } from "@prisma/client"

export interface Tokens {
    accessToken: string
    refreshToken: Token
}

export interface JwtPayload {
    id: string,
    email: string,
    roles: string,
    name: string,
}

export interface UserWithChatsAndMessages extends Partial<User> {
    chats?: Partial<Chat>[];
    messages?: Partial<Message>[];
}