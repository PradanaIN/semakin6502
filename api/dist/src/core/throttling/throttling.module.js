"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrottlingModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const config_1 = require("@nestjs/config");
let ThrottlingModule = class ThrottlingModule {
};
exports.ThrottlingModule = ThrottlingModule;
exports.ThrottlingModule = ThrottlingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const ttl = config.get("THROTTLE_TTL") ?? 900;
                    const limit = config.get("THROTTLE_LIMIT") ?? 1000;
                    return {
                        throttlers: [{ ttl, limit }],
                        skipIf: (context) => {
                            const req = context.switchToHttp().getRequest();
                            return req.path.startsWith("/health");
                        },
                    };
                },
            }),
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], ThrottlingModule);
