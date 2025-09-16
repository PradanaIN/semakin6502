import Joi from "joi";

const FIFTEEN_MINUTES_IN_SECONDS = 15 * 60;

export const configurationValidationSchema = Joi.object({
  THROTTLE_TTL: Joi.number().default(FIFTEEN_MINUTES_IN_SECONDS),
  THROTTLE_LIMIT: Joi.number().default(1000),
  REDIS_URL: Joi.string().uri().optional(),
  COOKIE_DOMAIN: Joi.string().allow(""),
  COOKIE_SAMESITE: Joi.string().valid("lax", "strict", "none"),
  NODE_ENV: Joi.string(),
  CORS_ORIGIN: Joi.string(),
  WEB_URL: Joi.string().uri().allow("").optional(),
  FONNTE_TOKEN: Joi.string(),
  WHATSAPP_TOKEN: Joi.string(),
  WHATSAPP_API_URL: Joi.string().uri().required(),
  PORT: Joi.number(),
  PHONE_VALIDATION_ENABLED: Joi.boolean().default(true),
}).or("FONNTE_TOKEN", "WHATSAPP_TOKEN");
