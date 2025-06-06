import { inngest } from "@/inngest/client";

export default function InngestTestPage() {
  async function triggerTestFunction() {
    "use server";

    // Trigger the test function
    await inngest.send({
      name: "test.hello",
      data: {
        message: "Hello from the test page!",
        timestamp: new Date().toISOString(),
      },
    });
  }

  async function triggerCampaignCreated() {
    "use server";

    // Trigger the campaign created function
    await inngest.send({
      name: "campaign.created",
      data: {
        id: `campaign_${Date.now()}`,
        name: `Test Campaign ${new Date().toLocaleTimeString()}`,
        description: "A test campaign created from the Inngest test page",
        status: "active",
      },
    });
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Inngest Function Testing</h1>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Test Basic Function</h2>
          <p className="text-gray-600 mb-4">
            This will trigger a simple test function that logs a message.
          </p>
          <form action={triggerTestFunction}>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Trigger Test Function
            </button>
          </form>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Test Campaign Workflow</h2>
          <p className="text-gray-600 mb-4">
            This will trigger the campaign creation workflow, which includes:
            <br />• Logging the campaign creation
            <br />• Sending a notification
            <br />• Scheduling analytics check (in 1 hour)
          </p>
          <form action={triggerCampaignCreated}>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Create Test Campaign
            </button>
          </form>
        </div>

        <div className="border rounded-lg p-4 bg-yellow-50">
          <h3 className="text-lg font-semibold mb-2">How to Monitor</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>
              Make sure your Inngest dev server is running:{" "}
              <code className="bg-gray-200 px-1 rounded">
                npx inngest-cli@latest dev
              </code>
            </li>
            <li>
              Open the Inngest dashboard at:{" "}
              <a
                href="http://localhost:8288"
                target="_blank"
                className="text-blue-600 underline"
              >
                http://localhost:8288
              </a>
            </li>
            <li>Click the buttons above to trigger functions</li>
            <li>Watch the functions execute in real-time in the dashboard</li>
            <li>Check your terminal for console logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
