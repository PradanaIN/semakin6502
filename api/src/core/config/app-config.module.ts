import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { configurationValidationSchema } from "./configuration.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configurationValidationSchema,
    }),
  ],
})
export class AppConfigModule {}
