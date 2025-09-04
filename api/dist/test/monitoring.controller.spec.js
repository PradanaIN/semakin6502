"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const monitoring_controller_1 = require("../src/monitoring/monitoring.controller");
const service = {
    lastUpdate: jest.fn(),
};
const controller = new monitoring_controller_1.MonitoringController(service, {});
describe('MonitoringController lastUpdate', () => {
    it('returns ISO string', async () => {
        service.lastUpdate.mockResolvedValue(new Date('2024-06-01T00:00:00.000Z'));
        const res = await controller.lastUpdate();
        expect(res).toEqual({ lastUpdate: '2024-06-01T00:00:00.000Z' });
    });
});
