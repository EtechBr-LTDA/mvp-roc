import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module";
import { GeolocationModule } from "../geolocation/geolocation.module";
import { AuthService } from "./auth.service";
import { PasswordResetService } from "./password-reset.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    UsersModule,
    GeolocationModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET") || "fallback-secret-change-in-production",
        signOptions: {
          expiresIn: "7d",
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, PasswordResetService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, PasswordResetService, JwtModule],
})
export class AuthModule {}
