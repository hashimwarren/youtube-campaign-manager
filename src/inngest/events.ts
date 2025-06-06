import { z } from 'zod';

export const APP_YOUTUBE_VIDEO_METRICS_COLLECT_WEEKLY =
  'app/youtube.video_metrics.collect.weekly';

export const youtubeVideoMetricsCollectWeekly = {
  name: APP_YOUTUBE_VIDEO_METRICS_COLLECT_WEEKLY,
  data: z.object({
    // No specific data payload needed for a cron-triggered event
    // but defining an empty object schema for consistency.
    triggeredAt: z.string().datetime().optional(), // Inngest might add this
  }),
};
