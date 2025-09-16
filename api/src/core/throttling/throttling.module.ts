import { ExecutionContext, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const ttl = config.get<number>("THROTTLE_TTL") ?? 900;
        const limit = config.get<number>("THROTTLE_LIMIT") ?? 1000;
        return {
          throttlers: [{ ttl, limit }],
          skipIf: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            return req.path.startsWith("/health");
          },
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ThrottlingModule {}
