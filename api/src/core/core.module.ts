import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AppConfigModule } from "./config/app-config.module";
import { CacheConfigModule } from "./cache/cache.module";
import { ThrottlingModule } from "./throttling/throttling.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [
    AppConfigModule,
    CacheConfigModule,
    ScheduleModule.forRoot(),
    ThrottlingModule,
    DatabaseModule,
  ],
  exports: [DatabaseModule],
})
export class CoreModule {}
