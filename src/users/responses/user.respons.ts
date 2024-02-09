import { $Enums, Provider, User } from "@prisma/client";
import { Exclude } from "class-transformer";

export class UserResponse implements User{
    id: string;
    email: string;
    name: string;
    accessToken: string

    @Exclude()
    password: string;

    @Exclude()
    createdAt: Date;
    
    updatedAt: Date;
    roles: $Enums.Role[];

    @Exclude()
    isBlocked: boolean;

    
    @Exclude()
    provider: Provider;
    
    constructor(user: User) {
        Object.assign(this, user)
    }
}