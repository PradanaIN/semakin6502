"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurationValidationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const FIFTEEN_MINUTES_IN_SECONDS = 15 * 60;
exports.configurationValidationSchema = joi_1.default.object({
    THROTTLE_TTL: joi_1.default.number().default(FIFTEEN_MINUTES_IN_SECONDS),
    THROTTLE_LIMIT: joi_1.default.number().default(1000),
    REDIS_URL: joi_1.default.string().uri().optional(),
    COOKIE_DOMAIN: joi_1.default.string().allow(""),
    COOKIE_SAMESITE: joi_1.default.string().valid("lax", "strict", "none"),
    NODE_ENV: joi_1.default.string(),
    CORS_ORIGIN: joi_1.default.string(),
    WEB_URL: joi_1.default.string().uri().allow("").optional(),
    FONNTE_TOKEN: joi_1.default.string(),
    WHATSAPP_TOKEN: joi_1.default.string(),
    WHATSAPP_API_URL: joi_1.default.string().uri().required(),
    PORT: joi_1.default.number(),
    PHONE_VALIDATION_ENABLED: joi_1.default.boolean().default(true),
}).or("FONNTE_TOKEN", "WHATSAPP_TOKEN");
