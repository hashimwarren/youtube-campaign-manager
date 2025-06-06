// filepath: src/app/api/settings/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

// In-memory storage for demo purposes
// In production, you'd store this in your database
let currentSchedule = {
  dayOfWeek: "5", // Friday
  hour: "09",
  minute: "00",
  timezone: "America/New_York",
  enabled: true,
  lastRun: null as string | null,
  nextRun: null as string | null,
};

export async function GET() {
  try {
    return NextResponse.json(currentSchedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dayOfWeek, hour, minute, timezone, enabled } = body;

    // Update the schedule
    currentSchedule = {
      ...currentSchedule,
      dayOfWeek,
      hour,
      minute,
      timezone,
      enabled,
    };

    // Calculate next run time
    const nextRun = calculateNextRun(currentSchedule);
    currentSchedule.nextRun = nextRun;

    // In a real implementation, you would:
    // 1. Store the new schedule in your database
    // 2. Update or recreate the Inngest cron function with the new schedule
    // 3. Potentially cancel the old scheduled function and create a new one

    // For now, we'll send an event to Inngest to update the schedule
    await inngest.send({
      name: "schedule.updated",
      data: {
        schedule: currentSchedule,
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      schedule: currentSchedule,
      nextRun: currentSchedule.nextRun,
      message: "Schedule updated successfully",
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

function calculateNextRun(schedule: typeof currentSchedule): string {
  const now = new Date();
  const targetDay = parseInt(schedule.dayOfWeek);
  const targetHour = parseInt(schedule.hour);
  const targetMinute = parseInt(schedule.minute);

  // Create a date for the next occurrence
  const nextRun = new Date(now);
  nextRun.setHours(targetHour, targetMinute, 0, 0);

  // Calculate days until target day
  const currentDay = now.getDay();
  let daysUntilTarget = targetDay - currentDay;

  if (daysUntilTarget < 0) {
    daysUntilTarget += 7; // Next week
  } else if (daysUntilTarget === 0) {
    // Same day - check if time has passed
    if (
      now.getHours() > targetHour ||
      (now.getHours() === targetHour && now.getMinutes() >= targetMinute)
    ) {
      daysUntilTarget = 7; // Next week
    }
  }

  nextRun.setDate(now.getDate() + daysUntilTarget);

  return nextRun.toISOString();
}
