
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@auth/interface';
import { UsersService } from '@users/users.service';

@Injectable()
class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name)
    constructor(private readonly configServise: ConfigService, private readonly userService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configServise.get('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.userService.findOne(payload.id).catch(err => {
            this.logger.error(err)
            return null
        })
        if (!user) {
            throw new UnauthorizedException()
        }
        return payload
    }
}

export const STRAGIES = [JwtStrategy]