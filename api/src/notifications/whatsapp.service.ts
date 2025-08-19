import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface WhatsappPayload {
  target: string;
  message: string;
  schedule?: string | number;
  delay?: number;
  [key: string]: unknown;
}

interface SendOptions {
  schedule?: string | number;
  delay?: number;
  [key: string]: unknown;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly token?: string;
  private readonly apiUrl?: string;

  constructor(private readonly config: ConfigService) {
    this.token =
      this.config.get<string>("FONNTE_TOKEN") ||
      this.config.get<string>("WHATSAPP_TOKEN");
    this.apiUrl = this.config.get<string>("WHATSAPP_API_URL");
  }

  async send(
    to: string,
    message: string,
    options: Record<string, unknown> = {},
    maxAttempts = 1,
  ) {
    if (!this.apiUrl || !this.token) {
      this.logger.error("WhatsApp service is not configured properly");
      return;
    }

    const payload: WhatsappPayload = { target: to, message, ...options };

    let body: string | FormData;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
    };

    const hasBinary = Object.values(payload).some((v) =>
      typeof v === "object" && v !== null &&
      (v instanceof Buffer || (typeof Blob !== "undefined" && v instanceof Blob)),
    );

    if (hasBinary) {
      const form = new FormData();
      for (const [k, v] of Object.entries(payload)) {
        if (v !== undefined && v !== null) {
          form.append(k, v as any);
        }
      }
      body = form;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(payload);
    }

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await fetch(this.apiUrl, {
          method: "POST",
          headers,
          body,
        });

        if (!res.ok) {
          const text = await res.text();
          let data: any;
          try {
            data = JSON.parse(text);
          } catch {
            data = undefined;
          }

          const message =
            data?.message || data?.detail || data?.error || text || "Unknown error";
          const quotaExceeded =
            res.status === 429 ||
            data?.code === "quota_exceeded" ||
            /quota/i.test(message);

          if (quotaExceeded) {
            this.logger.warn(
              `WhatsApp quota exhausted: ${res.status} ${res.statusText} - ${message}`,
            );
            return {
              success: false,
              quotaExceeded: true,
              status: res.status,
              message,
              data,
            };
          }

          this.logger.error(
            `Failed to send WhatsApp message: ${res.status} ${res.statusText} - ${message}`,
          );

          if (res.status >= 500 && attempt + 1 < maxAttempts) {
            continue;
          }
          throw new Error(`WhatsApp API responded with ${res.status}`);
        }

        return await res.json().catch(() => undefined);
      } catch (err) {
        this.logger.error("WhatsApp message send failed", err as Error);
        if (attempt + 1 >= maxAttempts) {
          throw err;
        }
      }
    }
  }

  async sendMessage(
    to: string,
    message: string,
    options: Record<string, unknown> = {},
    maxAttempts = 1,
  ) {
    return this.send(to, message, options, maxAttempts);
  }
}

