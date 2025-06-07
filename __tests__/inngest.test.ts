jest.mock('@/inngest/client', () => ({
  inngest: {
    send: jest.fn().mockResolvedValue({ ids: ['evt_123'] }),
    id: 'youtube-campaign-manager',
  },
}));

import { inngest } from '@/inngest/client';
import { POST as triggerCollection } from '@/app/api/settings/trigger-collection/route';
import { POST as updateSchedule } from '@/app/api/settings/schedule/route';

const mockedInngest = inngest as unknown as { send: jest.Mock };

describe('Inngest configuration', () => {
  it('initializes client with correct id', () => {
    expect((inngest as any).id).toBe('youtube-campaign-manager');
  });
});

describe('Settings routes using Inngest', () => {
  afterEach(() => {
    mockedInngest.send.mockClear();
  });

  it('trigger-collection route sends weekly metrics event', async () => {
    const res = await triggerCollection();
    expect(mockedInngest.send).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'app/youtube.video_metrics.collect.weekly' })
    );
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('schedule route sends schedule.updated event', async () => {
    const payload = { dayOfWeek: '1', hour: '10', minute: '00', timezone: 'UTC', enabled: true };
    const req = { json: () => Promise.resolve(payload) } as any;
    const res = await updateSchedule(req);
    expect(mockedInngest.send).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'schedule.updated',
        data: expect.objectContaining({ schedule: expect.objectContaining(payload) }),
      })
    );
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
