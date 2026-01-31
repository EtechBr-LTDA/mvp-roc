import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { RestaurantsModule } from "./modules/restaurants/restaurants.module";
import { VouchersModule } from "./modules/vouchers/vouchers.module";
import { ValidationModule } from "./modules/validation/validation.module";
import { AdminModule } from "./modules/admin/admin.module";
import { GeolocationModule } from "./modules/geolocation/geolocation.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    // Logger estruturado com Pino
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === "production" ? "info" : "debug",
        transport: process.env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
        // Não logar dados sensíveis
        redact: ["req.headers.authorization", "req.body.password", "req.body.cpf"],
      },
    }),
    // Rate Limiting global: 100 requests por minuto por IP
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000, // 1 segundo
        limit: 10, // 10 requests por segundo
      },
      {
        name: "medium",
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto
      },
      {
        name: "long",
        ttl: 3600000, // 1 hora
        limit: 1000, // 1000 requests por hora
      },
    ]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RestaurantsModule,
    VouchersModule,
    ValidationModule,
    AdminModule,
    GeolocationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
