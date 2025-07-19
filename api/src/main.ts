import { NestFactory } from "@nestjs/core";
import { ValidationPipe, LogLevel } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./common/logging.interceptor";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  // Fail fast when DATABASE_URL is missing
  throw new Error("DATABASE_URL environment variable is required");
}

async function bootstrap() {
  const isProd = process.env.NODE_ENV === "production";
  const logLevels: LogLevel[] = isProd
    ? ["log", "warn", "error"]
    : ["log", "warn", "error", "debug", "verbose"];
  const app = await NestFactory.create(AppModule, { logger: logLevels });
  app.use(cookieParser());

  const origins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  await app.enableCors(
    origins.length
      ? { origin: origins, credentials: true }
      : { credentials: true }
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
