import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Headers de segurança HTTP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Necessário para algumas funcionalidades
    })
  );

  // Habilitar CORS para permitir requisições do frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  if (process.env.NODE_ENV !== "production") {
    console.log(`Backend rodando na porta ${port}`);
  }
}

bootstrap();

