import { NextResponse } from "next/server";
import { inngest } from "../../../inngest/client";

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

// Create a simple async Next.js API route handler
export async function GET() {
  // Send your event payload to Inngest
  await inngest.send({
    name: "test.hello",
    data: {
      email: "testUser@example.com",
      message: "Hello from API route!",
      timestamp: new Date().toISOString(),
    },
  });

  return NextResponse.json({ message: "Event sent!" });
}
