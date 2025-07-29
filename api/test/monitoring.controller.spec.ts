import { MonitoringController } from '../src/monitoring/monitoring.controller';
import { MonitoringService } from '../src/monitoring/monitoring.service';

const service = {
  lastUpdate: jest.fn(),
} as any;
const controller = new MonitoringController(service as MonitoringService, {} as any);

describe('MonitoringController lastUpdate', () => {
  it('returns ISO string', async () => {
    service.lastUpdate.mockResolvedValue(new Date('2024-06-01T00:00:00.000Z'));
    const res = await controller.lastUpdate();
    expect(res).toEqual({ lastUpdate: '2024-06-01T00:00:00.000Z' });
  });
});
