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

// Schedule update handler
export const scheduleUpdated = inngest.createFunction(
  { id: 'schedule-updated', name: 'Schedule Updated Handler' },
  { event: 'schedule.updated' },
  async ({ event, step }) => {
    const { schedule } = event.data;

    await step.run('log-schedule-update', async () => {
      console.log('Schedule updated:', schedule);
      return { updated: true };
    });

    // In a real implementation, you would:
    // 1. Cancel the existing cron function
    // 2. Create a new cron function with the updated schedule
    // 3. Store the new schedule in the database

    return { 
      success: true, 
      newSchedule: schedule,
      updatedAt: event.data.updatedAt 
    };
  }
);

// Enhanced weekly metrics collection with manual trigger support
export const collectWeeklyMetrics = inngest.createFunction(
  { id: 'collect-weekly-video-metrics', name: youtubeVideoMetricsCollectWeekly.name },
  { cron: '0 9 * * FRI' }, // Default schedule - can be updated dynamically
  async ({ event, step }) => {
    const isManual = event?.data?.manual || false;
    
    await step.run('log-collection-start', async () => {
      console.log(`Starting ${isManual ? 'manual' : 'scheduled'} metrics collection`);
      return { started: true };
    });

    // Fetch all campaigns
    const campaigns = await step.run('fetch-campaigns', async () => {
      return prisma.campaign.findMany({
        include: {
          creator: true,
          snapshots: {
            orderBy: { capturedAt: 'desc' },
            take: 1,
          },
        },
      });
    });

    let successCount = 0;
    let errorCount = 0;

    // Loop through campaigns and record metrics
    for (const campaign of campaigns) {
      await step.run(`metrics-${campaign.id}`, async () => {
        try {
          const res = await youtube.videos.list({
            part: ['statistics'],
            id: [campaign.videoId],
          });
          
          const stats = res.data.items?.[0]?.statistics;
          if (!stats) {
            console.log(`No statistics found for video ${campaign.videoId}`);
            errorCount++;
            return null;
          }

          const views = Number(stats.viewCount || 0);
          const comments = Number(stats.commentCount || 0);

          const snapshot = await prisma.videoMetricSnapshot.create({
            data: { 
              campaignId: campaign.id, 
              views, 
              comments,
            },
          });

          console.log(`Collected metrics for ${campaign.title}: ${views} views, ${comments} comments`);
          successCount++;
          
          return snapshot;
        } catch (error) {
          console.error(`Error collecting metrics for campaign ${campaign.id}:`, error);
          errorCount++;
          return null;
        }
      });
    }

    // Log collection summary
    await step.run('log-collection-summary', async () => {
      const summary = {
        totalCampaigns: campaigns.length,
        successCount,
        errorCount,
        collectedAt: new Date().toISOString(),
        manual: isManual,
      };
      
      console.log('Collection summary:', summary);
      return summary;
    });

    return { 
      success: true, 
      totalCampaigns: campaigns.length,
      successCount,
      errorCount,
      isManual,
    };
  }
);
