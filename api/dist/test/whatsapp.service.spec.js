"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const whatsapp_service_1 = require("../src/notifications/whatsapp.service");
const BASE_URL = process.env.BASE_URL || "https://semakin.databenuanta.id";
describe("WhatsappService retries", () => {
    let service;
    let fetchMock;
    beforeEach(() => {
        const config = {
            get: (key) => {
                if (key === "FONNTE_TOKEN" || key === "WHATSAPP_TOKEN") {
                    return "token";
                }
                if (key === "WHATSAPP_API_URL") {
                    return BASE_URL;
                }
                return undefined;
            },
        };
        service = new whatsapp_service_1.WhatsappService(config);
        fetchMock = jest.fn();
        global.fetch = fetchMock;
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    it("attempts exactly maxAttempts times on failure", async () => {
        fetchMock.mockResolvedValue({
            ok: false,
            status: 500,
            statusText: "err",
            text: jest.fn().mockResolvedValue("err"),
        });
        await expect(service.send("1", "msg", {}, 3)).rejects.toThrow("WhatsApp API responded with 500");
        expect(fetchMock).toHaveBeenCalledTimes(3);
        const options = fetchMock.mock.calls[0][1];
        expect(options.body).toBeInstanceOf(FormData);
        expect(options.body.get("message")).toBe("msg");
    });
    it("stops retrying after a successful attempt", async () => {
        fetchMock
            .mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: "err",
            text: jest.fn().mockResolvedValue("err"),
        })
            .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({ success: true }),
        });
        const res = await service.send("1", "msg", {}, 3);
        expect(res).toEqual({ success: true });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        const options = fetchMock.mock.calls[0][1];
        expect(options.body).toBeInstanceOf(FormData);
    });
    it("throws when API returns success false", async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: jest
                .fn()
                .mockResolvedValue({ success: false, message: "error occurred" }),
        });
        await expect(service.send("1", "msg")).rejects.toThrow("error occurred");
    });
});
