import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../users/users.service";
import { JwtPayload } from "./auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    configService: ConfigService
  ) {
    const jwtSecret = configService.get<string>("JWT_SECRET");

    if (!jwtSecret) {
      throw new Error("JWT_SECRET não está configurado. Configure a variável de ambiente JWT_SECRET.");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.usersService.findById(payload.sub);
      return {
        id: user.id,
        email: user.email,
        name: user.full_name,
        cpf: user.cpf,
        role: user.role || "user",
      };
    } catch {
      throw new UnauthorizedException("Token inválido");
    }
  }
}
