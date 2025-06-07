let collectWeeklyMetrics: any;
let scheduleUpdated: any;

beforeAll(async () => {
  process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
  const mod = await import('@/inngest/functions');
  collectWeeklyMetrics = mod.collectWeeklyMetrics;
  scheduleUpdated = mod.scheduleUpdated;
});

describe('Inngest functions', () => {
  it('collectWeeklyMetrics has correct id', () => {
    expect(collectWeeklyMetrics.id()).toBe('collect-weekly-video-metrics');
  });

  it('scheduleUpdated has correct id', () => {
    expect(scheduleUpdated.id()).toBe('schedule-updated');
  });
});

