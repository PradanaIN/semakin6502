import { NestFactory } from "@nestjs/core";
import { ValidationPipe, LogLevel } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./common/logging.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(helmet());

  const configService = app.get(ConfigService);
  const isProd = configService.get<string>("NODE_ENV") === "production";
  const logLevels: LogLevel[] = isProd
    ? ["log", "warn", "error"]
    : ["log", "warn", "error", "debug", "verbose"];
  app.useLogger(logLevels);
  const origins = (configService.get<string>("CORS_ORIGIN") || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  await app.enableCors(
    origins.length
      ? { origin: origins, credentials: true }
      : { credentials: true }
  );
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
  );
  app.useGlobalInterceptors(new LoggingInterceptor());
  const swaggerConfig = new DocumentBuilder()
    .setTitle("SEMAKIN 6502 API")
    .setDescription("API documentation")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);
  const port = configService.get<number>("PORT") || 3000;
  await app.listen(port);
}
bootstrap();
