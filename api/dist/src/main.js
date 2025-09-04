"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const logging_interceptor_1 = require("./common/logging.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, cookie_parser_1.default)());
    app.use((0, helmet_1.default)());
    const configService = app.get(config_1.ConfigService);
    const isProd = configService.get("NODE_ENV") === "production";
    const logLevels = isProd
        ? ["log", "warn", "error"]
        : ["log", "warn", "error", "debug", "verbose"];
    app.useLogger(logLevels);
    const origins = (configService.get("CORS_ORIGIN") || "http://localhost:5173")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
    await app.enableCors(origins.length
        ? { origin: origins, credentials: true }
        : { credentials: true });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle("SEMAKIN 6502 API")
        .setDescription("API documentation")
        .setVersion("1.0")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup("docs", app, document);
    const port = configService.get("PORT") || 3000;
    await app.listen(port);
}
bootstrap();
