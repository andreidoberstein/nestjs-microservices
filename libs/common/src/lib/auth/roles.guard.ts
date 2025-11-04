import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {ROLES_KEY} from "./roles.decorator";
import {JwtPayload} from "@app/common";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required) return true

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload & { roles?: string[] };

    if (!user?.roles) return false

    return required.every((role) => user.roles!.includes(role));
  }
}


