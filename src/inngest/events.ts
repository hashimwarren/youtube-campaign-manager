import { z } from 'zod';

export const APP_YOUTUBE_VIDEO_METRICS_COLLECT_WEEKLY =
  'app/youtube.video_metrics.collect.weekly';

export const youtubeVideoMetricsCollectWeekly = {
  name: APP_YOUTUBE_VIDEO_METRICS_COLLECT_WEEKLY,
  data: z.object({
    // No specific data payload needed for a cron-triggered event
    // but defining an empty object schema for consistency.
    triggeredAt: z.string().datetime().optional(), // Inngest might add this
    manual: z.boolean().optional(), // For manual triggers
  }),
};

export const SCHEDULE_UPDATED = 'schedule.updated';

export const scheduleUpdated = {
  name: SCHEDULE_UPDATED,
  data: z.object({
    schedule: z.object({
      dayOfWeek: z.string(),
      hour: z.string(),
      minute: z.string(),
      timezone: z.string(),
      enabled: z.boolean(),
      lastRun: z.string().nullable(),
      nextRun: z.string().nullable(),
    }),
    updatedAt: z.string().datetime(),
  }),
};
