import { ExecutionContext, SetMetadata } from "@nestjs/common"
import { Reflector } from "@nestjs/core"

export const PUBLIC_KEY = 'public'
export const Public = () => SetMetadata(PUBLIC_KEY, true)

export const isPublic = (ctx: ExecutionContext, reflector: Reflector) => {
    const isPublic = reflector.getAllAndOverride<Boolean>(PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()])
    return isPublic
}