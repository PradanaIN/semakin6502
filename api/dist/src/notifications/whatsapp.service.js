"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let WhatsappService = WhatsappService_1 = class WhatsappService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(WhatsappService_1.name);
        const fonnte = this.config.get("FONNTE_TOKEN");
        const generic = this.config.get("WHATSAPP_TOKEN");
        this.token = fonnte || generic || undefined;
        this.apiUrl = this.config.get("WHATSAPP_API_URL");
        // If using generic token (non-Fonnte), default to Bearer scheme unless already present
        const hasBearerPrefix = (this.token || "").toLowerCase().startsWith("bearer ");
        this.useBearer = !!generic && !hasBearerPrefix;
    }
    async send(to, message, options = {}, maxAttempts = 1) {
        if (!this.apiUrl || !this.token) {
            this.logger.error("WhatsApp service is not configured properly");
            return;
        }
        const payload = { target: to, message, ...options };
        const form = new FormData();
        for (const [k, v] of Object.entries(payload)) {
            if (v !== undefined && v !== null) {
                form.append(k, v);
            }
        }
        const headers = {
            Authorization: this.useBearer
                ? `Bearer ${String(this.token).replace(/^bearer\s+/i, "")}`
                : String(this.token),
        };
        const formHeaders = form.getHeaders?.();
        if (formHeaders && formHeaders["content-type"]) {
            headers["Content-Type"] = formHeaders["content-type"];
        }
        const maskedToken = String(this.token).replace(/.(?=.{4})/g, "*");
        let urlForLog = this.apiUrl;
        try {
            const u = new URL(this.apiUrl);
            urlForLog = `${u.origin}${u.pathname}`;
        }
        catch { }
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                this.logger.debug("Sending WhatsApp message", {
                    target: payload.target,
                    options: {
                        method: "POST",
                        // Log masked token and explicit scheme used
                        headers: {
                            ...headers,
                            Authorization: this.useBearer
                                ? `Bearer ${maskedToken}`
                                : maskedToken,
                        },
                    },
                    url: urlForLog,
                });
                const res = await fetch(this.apiUrl, {
                    method: "POST",
                    headers,
                    body: form,
                });
                if (!res.ok) {
                    const text = await res.text();
                    let data;
                    try {
                        data = JSON.parse(text);
                    }
                    catch {
                        data = undefined;
                    }
                    const message = data?.message ||
                        data?.detail ||
                        data?.error ||
                        text ||
                        "Unknown error";
                    const quotaExceeded = res.status === 429 ||
                        data?.code === "quota_exceeded" ||
                        /quota/i.test(message);
                    if (quotaExceeded) {
                        this.logger.error(`WhatsApp quota exhausted: ${res.status} ${res.statusText} - ${message}`, { status: res.status, message, payload });
                        return {
                            success: false,
                            quotaExceeded: true,
                            status: res.status,
                            message,
                            data,
                        };
                    }
                    this.logger.error(`Failed to send WhatsApp message: ${res.status} ${res.statusText} - ${message}`, { status: res.status, message, payload });
                    if (res.status >= 500 && attempt + 1 < maxAttempts) {
                        continue;
                    }
                    throw new Error(`WhatsApp API responded with ${res.status}`);
                }
                const data = await res.json().catch(() => undefined);
                if (data?.success === false ||
                    (typeof data?.message === "string" && /error/i.test(data.message))) {
                    const errorMessage = data?.message || "WhatsApp API returned success: false";
                    this.logger.error("WhatsApp API error", {
                        status: res.status,
                        message: errorMessage,
                        payload,
                    });
                    throw new Error(errorMessage);
                }
                this.logger.debug("WhatsApp API response", data);
                return data;
            }
            catch (err) {
                const anyErr = err;
                this.logger.error("WhatsApp message send failed", {
                    status: anyErr?.status,
                    message: err.message,
                    code: anyErr?.code || anyErr?.cause?.code,
                    errno: anyErr?.errno || anyErr?.cause?.errno,
                    address: anyErr?.cause?.address,
                    url: urlForLog,
                    payload,
                });
                if (attempt + 1 >= maxAttempts) {
                    throw err;
                }
            }
        }
    }
    async sendMessage(to, message, options = {}, maxAttempts = 1) {
        return this.send(to, message, options, maxAttempts);
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WhatsappService);
