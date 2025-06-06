import { Inngest } from "inngest";
import { prisma } from '@/lib/db'; // Assuming this is your prisma client
import { testFunction, collectWeeklyMetrics } from './functions'; // Import the function to be tested
import { serve } from "inngest/next"; // Required for Inngest to discover functions
import { google } from 'googleapis'; // Import it to mock it

// Mock googleapis
vi.mock('googleapis', () => {
  const mockYoutube = {
    videos: {
      list: vi.fn(), // This is the function we want to mock
    },
  };
  return {
    google: {
      youtube: vi.fn(() => mockYoutube), // Mock the youtube constructor/function
    },
    // Keep other exports if any are used by the SUT (System Under Test)
  };
});

// Helper to access the mock for setting return values and assertions
const mockYoutubeVideosList = google.youtube({}).videos.list as ReturnType<typeof vi.fn>;

// Mock Inngest client for testing
// We use a real Inngest client but connect it to a MemoryCommuniator for local testing.
// This way, it behaves like the real Inngest but doesn't require a separate dev server.
import { InngestCommuniator } from "inngest/src/components/InngestCommuniator";

// Define a type for the communicator if not exported directly
type Communicator = any; // Replace with actual type if available

let inngestTestClient: Inngest;
let communicator: Communicator;

// Helper function to wait for a short period
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

beforeAll(async () => {
  // Initialize Inngest with a MemoryCommunicator for testing
  // NOTE: This setup is conceptual. The actual MemoryCommunicator usage might differ.
  // We might need to run a local Inngest dev server for more integrated tests if this proves difficult.
  // For now, we'll try to simulate or directly invoke.

  // For this test, we'll directly use the main 'inngest' client from the app
  // and assume the Inngest dev server (npx inngest-cli dev) would be running during tests.
  // This is a common approach for testing Inngest functions.
  // The alternative is to use the Inngest Test Kit if available or a more direct invocation.

  // Let's use the actual client from the app.
  // Ensure INNGEST_EVENT_KEY is set if running in a mode that requires it.
  // For local dev server, it's often not needed.
  inngestTestClient = new Inngest({ id: "test-runner" });


  // Clean up any markers from previous test runs
  await prisma.testMarker.deleteMany({});
});

afterAll(async () => {
  // Clean up markers created during the test
  await prisma.testMarker.deleteMany({});
  await prisma.$disconnect();
});

describe('Inngest Functions', () => {
  describe('testFunction', () => {
    it('should create a TestMarker in the database when test.hello event is sent', async () => {
      const eventPayload = {
        message: 'Hello from test ' + Date.now(),
        someTestData: '123',
      };

      // Send the event
      // IMPORTANT: For this to work, the Inngest dev server (npx inngest-cli dev)
      // must be running and configured to pick up functions from this app.
      // The `serve` call below helps Inngest discover functions.
      const { GET, POST, PUT } = serve({ client: inngestTestClient, functions: [testFunction] });


      await inngestTestClient.send({
        name: 'test.hello',
        data: eventPayload,
      });

      // Wait for the function to be processed.
      // This is the trickiest part in an automated test without direct access to Inngest's internal state.
      // We'll poll the database for a few seconds.
      let marker = null;
      for (let i = 0; i < 10; i++) { // Poll for 5 seconds (10 * 500ms)
        await sleep(500);
        marker = await prisma.testMarker.findFirst({
          where: { message: eventPayload.message },
        });
        if (marker) break;
      }

      expect(marker).not.toBeNull();
      expect(marker?.message).toBe(eventPayload.message);
      expect(marker?.payload).toEqual(eventPayload); // Prisma stores payload as JsonValue
    });
  });

  describe('collectWeeklyMetrics', () => {
    beforeEach(async () => {
      // Clear specific data for these tests if necessary
      await prisma.videoMetricSnapshot.deleteMany({});
      await prisma.campaign.deleteMany({});
      // Reset mock call counts before each test if needed
      mockYoutubeVideosList.mockClear();
    });

    it('should fetch campaigns, call YouTube API, and store snapshots', async () => {
      // 1. Setup: Create a campaign in the DB
      const testCampaign = await prisma.campaign.create({
        data: {
          videoId: 'testVideo123',
          title: 'Test Campaign for Metrics',
          wentLiveAt: new Date(),
          creator: { // Assuming creator relationship needs to be satisfied
            create: {
              name: 'Test Creator',
              channelId: 'testChannel123',
              status: 'SELECTED',
            }
          }
          // Add other required fields for Campaign model
        },
      });

      // 2. Mock YouTube API response for this videoId
      const mockApiResponse = {
        data: {
          items: [
            {
              id: 'testVideo123',
              statistics: {
                viewCount: '1000',
                commentCount: '25',
              },
            },
          ],
        },
      };
      mockYoutubeVideosList.mockResolvedValue(mockApiResponse);

      // 3. Send the event to trigger collectWeeklyMetrics
      // Similar to testFunction, ensure Inngest dev server is running or use a test client
      const { GET, POST, PUT } = serve({ client: inngestTestClient, functions: [collectWeeklyMetrics] });

      await inngestTestClient.send({
        name: 'app/youtube.video_metrics.collect.weekly', // Actual event name
        data: { manual: true, triggeredAt: new Date().toISOString() },
      });

      // 4. Wait and Verify
      // Poll for VideoMetricSnapshot creation
      let snapshot = null;
      for (let i = 0; i < 15; i++) { // Poll for ~7.5 seconds
        await sleep(500);
        snapshot = await prisma.videoMetricSnapshot.findFirst({
          where: { campaignId: testCampaign.id },
        });
        if (snapshot) break;
      }

      expect(snapshot).not.toBeNull();
      expect(snapshot?.views).toBe(1000);
      expect(snapshot?.comments).toBe(25);

      // Verify YouTube API was called correctly
      expect(mockYoutubeVideosList).toHaveBeenCalledTimes(1);
      expect(mockYoutubeVideosList).toHaveBeenCalledWith({
        part: ['statistics'],
        id: [testCampaign.videoId],
      });
    });

    // Add more tests: e.g., no campaigns, YouTube API error, multiple campaigns etc.
  });
});
