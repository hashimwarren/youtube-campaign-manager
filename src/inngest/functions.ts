import { inngest } from "./client";
import { youtubeVideoMetricsCollectWeekly } from './events';
import { prisma } from '@/lib/db';
import { google } from 'googleapis';

const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });

// A simple function that will be triggered when a campaign is created
export const campaignCreated = inngest.createFunction(
  { id: "campaign-created" },
  { event: "campaign.created" },
  async ({ event, step }) => {
    // Step 1: Log the campaign creation
    await step.run("log-campaign", async () => {
      console.log(`Campaign created: ${event.data.name}`);
      return { logged: true };
    });

    // Step 2: Send a welcome notification (placeholder for now)
    await step.run("send-notification", async () => {
      console.log(`Sending notification for campaign: ${event.data.name}`);
      // Here you could integrate with email service, Slack, etc.
      return { notificationSent: true };
    });

    // Step 3: Schedule campaign analytics check (in 1 hour)
    await step.sendEvent("schedule-analytics", {
      name: "campaign.check-analytics",
      data: {
        campaignId: event.data.id,
        campaignName: event.data.name,
      },
      delay: "1h",
    });

    return { success: true, campaignId: event.data.id };
  }
);

// A function to check campaign analytics
export const checkCampaignAnalytics = inngest.createFunction(
  { id: "check-campaign-analytics" },
  { event: "campaign.check-analytics" },
  async ({ event, step }) => {
    // Step 1: Fetch analytics data (mock for now)
    const analytics = await step.run("fetch-analytics", async () => {
      console.log(
        `Checking analytics for campaign: ${event.data.campaignName}`
      );

      // Mock analytics data
      return {
        views: Math.floor(Math.random() * 10000),
        clicks: Math.floor(Math.random() * 1000),
        conversions: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString(),
      };
    });

    // Step 2: Store analytics in database (placeholder)
    await step.run("store-analytics", async () => {
      console.log(
        `Storing analytics for campaign ${event.data.campaignId}:`,
        analytics
      );
      // Here you would save to your Neon database
      return { stored: true };
    });

    return {
      success: true,
      campaignId: event.data.campaignId,
      analytics,
    };
  }
);

// A test function you can trigger manually
export const testFunction = inngest.createFunction(
  { id: "test-function" },
  { event: "test.hello" },
  async ({ event }) => {
    console.log("Hello from Inngest!", event.data);
    return {
      message: "Function executed successfully!",
      timestamp: new Date().toISOString(),
      data: event.data,
    };
  }
);

// Collect weekly YouTube video metrics
export const collectWeeklyMetrics = inngest.createFunction(
  { id: 'collect-weekly-video-metrics', name: youtubeVideoMetricsCollectWeekly.name },
  { cron: '0 9 * * FRI' },
  async ({ step }) => {
    // Fetch all campaigns
    const campaigns = await step.run('fetch-campaigns', async () => {
      return prisma.campaign.findMany();
    });

    // Loop through campaigns and record metrics
    for (const campaign of campaigns) {
      await step.run(`metrics-${campaign.id}`, async () => {
        const res = await youtube.videos.list({
          part: ['statistics'],
          id: [campaign.videoId],
        });
        const stats = res.data.items?.[0]?.statistics;
        if (!stats) return null;

        const views = Number(stats.viewCount || 0);
        const comments = Number(stats.commentCount || 0);

        return prisma.videoMetricSnapshot.create({
          data: { campaignId: campaign.id, views, comments },
        });
      });
    }

    return { success: true, fetched: campaigns.length };
  }
);
