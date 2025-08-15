import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface WhatsappPayload {
  target: string;
  message: string;
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

  async send(to: string, message: string, extra: Record<string, unknown> = {}) {
    if (!this.apiUrl || !this.token) {
      this.logger.error("WhatsApp service is not configured properly");
      return;
    }

    const payload: WhatsappPayload = { target: to, message, ...extra };

    try {
      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(
          `Failed to send WhatsApp message: ${res.status} ${res.statusText} - ${text}`,
        );
        throw new Error(`WhatsApp API responded with ${res.status}`);
      }

      return await res.json().catch(() => undefined);
    } catch (err) {
      this.logger.error("WhatsApp message send failed", err as Error);
      throw err;
    }
  }

  async sendMessage(
    to: string,
    message: string,
    extra: Record<string, unknown> = {},
  ) {
    return this.send(to, message, extra);
  }
}

