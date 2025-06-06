import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import {
  campaignCreated,
  checkCampaignAnalytics,
  testFunction,
  collectWeeklyMetrics,
} from "../../../inngest/functions";

// Create an API that serves your functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [campaignCreated, checkCampaignAnalytics, testFunction, collectWeeklyMetrics],
});
