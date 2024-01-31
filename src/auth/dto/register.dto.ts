import { IsPasswordsMatchingConstraint } from "@shared/decorators/is-password-constraint.decorator"
import { IsEmail, IsString, MinLength, Validate } from "class-validator"

export class RegisterDto {
    @IsEmail()
    email: string

    @IsString()
    @MinLength(6)
    password: string

    @IsString()
    @MinLength(6)
    @Validate(IsPasswordsMatchingConstraint)
    passwordRepeat: string

    @IsString()
    name?: string
}
