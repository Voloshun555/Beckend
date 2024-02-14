import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@auth/guargs/jwt-auth.guard'

export const Auth = () => UseGuards(JwtAuthGuard)
