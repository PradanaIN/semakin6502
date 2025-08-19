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
    maxAttempts = 1
  ) {
    if (!this.apiUrl || !this.token) {
      this.logger.error("WhatsApp service is not configured properly");
      return;
    }

    const payload: WhatsappPayload = { target: to, message, ...options };

    const form = new FormData();
    for (const [k, v] of Object.entries(payload)) {
      if (v !== undefined && v !== null) {
        form.append(k, v as any);
      }
    }

    const headers: Record<string, string> = {
      Authorization: this.token,
    };

    const formHeaders = (form as any).getHeaders?.();
    if (formHeaders && formHeaders["content-type"]) {
      headers["Content-Type"] = formHeaders["content-type"];
    }

    const maskedToken = this.token.replace(/.(?=.{4})/g, "*");

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        this.logger.debug("Sending WhatsApp message", {
          target: payload.target,
          options: {
            method: "POST",
            headers: { ...headers, Authorization: `Bearer ${maskedToken}` },
          },
        });

        const res = await fetch(this.apiUrl, {
          method: "POST",
          headers,
          body: form,
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
            data?.message ||
            data?.detail ||
            data?.error ||
            text ||
            "Unknown error";
          const quotaExceeded =
            res.status === 429 ||
            data?.code === "quota_exceeded" ||
            /quota/i.test(message);

          if (quotaExceeded) {
            this.logger.error(
              `WhatsApp quota exhausted: ${res.status} ${res.statusText} - ${message}`,
              { status: res.status, message, payload }
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
            { status: res.status, message, payload }
          );

          if (res.status >= 500 && attempt + 1 < maxAttempts) {
            continue;
          }
          throw new Error(`WhatsApp API responded with ${res.status}`);
        }

        const data = await res.json().catch(() => undefined);
        if (
          data?.success === false ||
          (typeof data?.message === "string" && /error/i.test(data.message))
        ) {
          const errorMessage =
            data?.message || "WhatsApp API returned success: false";
          this.logger.error("WhatsApp API error", {
            status: res.status,
            message: errorMessage,
            payload,
          });
          throw new Error(errorMessage);
        }
        this.logger.debug("WhatsApp API response", data);
        return data;
      } catch (err) {
        this.logger.error("WhatsApp message send failed", {
          status: (err as any)?.status,
          message: (err as Error).message,
          payload,
        });
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
    maxAttempts = 1
  ) {
    return this.send(to, message, options, maxAttempts);
  }
}
