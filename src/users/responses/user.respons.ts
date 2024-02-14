import { $Enums, Provider, User } from "@prisma/client";
import { Exclude } from "class-transformer";

export class UserResponse {
    id: string;
    email: string;
    name: string;
    accessToken: string;
    updatedAt: Date;
    roles: $Enums.Role[];

    constructor(user: User) {
        this.id = user.id;
        this.email = user.email;
        this.name = user.name;
        this.updatedAt = user.updatedAt;
        this.roles = user.roles;
    }
}