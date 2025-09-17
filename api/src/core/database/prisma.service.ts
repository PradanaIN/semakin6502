import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const databaseUrl =
      process.env.DATABASE_URL ?? PrismaService.composeDatabaseUrl();

    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = databaseUrl;
    }

    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private static composeDatabaseUrl(): string {
    const host = process.env.DATABASE_HOST;
    const port = process.env.DATABASE_PORT ?? "3306";
    const user = process.env.DATABASE_USER;
    const database = process.env.DATABASE_NAME;

    if (!host || !user || !database) {
      throw new Error(
        "DATABASE_URL is not set and database connection pieces are incomplete.",
      );
    }

    const rawPassword = process.env.DATABASE_PASSWORD ?? "";
    const passwordSegment = rawPassword
      ? `:${encodeURIComponent(rawPassword)}`
      : "";
    const portSegment = port ? `:${port}` : "";

    return `mysql://${user}${passwordSegment}@${host}${portSegment}/${database}`;
  }
}
