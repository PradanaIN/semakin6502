import { WhatsappService } from '../src/notifications/whatsapp.service';
import { ConfigService } from '@nestjs/config';

describe('WhatsappService retries', () => {
  let service: WhatsappService;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    const config = {
      get: (key: string) => {
        if (key === 'FONNTE_TOKEN' || key === 'WHATSAPP_TOKEN') {
          return 'token';
        }
        if (key === 'WHATSAPP_API_URL') {
          return 'http://example.com';
        }
        return undefined;
      },
    } as unknown as ConfigService;

    service = new WhatsappService(config);
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('attempts exactly maxAttempts times on failure', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'err',
      text: jest.fn().mockResolvedValue('err'),
    });

    await expect(
      service.send('1', 'msg', {}, 3)
    ).rejects.toThrow('WhatsApp API responded with 500');

    expect(fetchMock).toHaveBeenCalledTimes(3);

    const options = fetchMock.mock.calls[0][1];
    expect(options.body).toBeInstanceOf(FormData);
    expect((options.body as FormData).get('message')).toBe('msg');
  });

  it('stops retrying after a successful attempt', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'err',
        text: jest.fn().mockResolvedValue('err'),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

    const res = await service.send('1', 'msg', {}, 3);

    expect(res).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const options = fetchMock.mock.calls[0][1];
    expect(options.body).toBeInstanceOf(FormData);
  });

  it('throws when API returns success false', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ success: false, message: 'error occurred' }),
    });

    await expect(service.send('1', 'msg')).rejects.toThrow('error occurred');
  });
});
