// filepath: src/app/api/settings/trigger-collection/route.ts
import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST() {
  try {
    // Manually trigger the weekly metrics collection
    const result = await inngest.send({
      name: "app/youtube.video_metrics.collect.weekly",
      data: {
        triggeredAt: new Date().toISOString(),
        manual: true,
      },
    });

    return NextResponse.json({
      success: true,
      eventId: result.ids[0],
      message: "Collection triggered successfully",
      triggeredAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error triggering collection:", error);
    return NextResponse.json(
      { error: "Failed to trigger collection" },
      { status: 500 }
    );
  }
}
