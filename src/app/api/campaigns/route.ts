// filepath: src/app/api/campaigns/route.ts
import { PrismaClient } from "@prisma/client";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        creator: true,
        snapshots: {
          orderBy: { capturedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { wentLiveAt: "desc" },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { videoId, creatorId, wentLiveAt, costUsd } = await request.json();

    // Validate required fields
    if (!videoId || !creatorId) {
      return NextResponse.json(
        { error: "videoId and creatorId are required" },
        { status: 400 }
      );
    }

    // Extract YouTube video ID from URL if full URL provided
    const extractVideoId = (url: string): string => {
      if (url.length === 11) return url; // Already just the ID
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return match?.[1] || url;
    };

    const cleanVideoId = extractVideoId(videoId);

    // Fetch metadata from YouTube
    const res = await youtube.videos.list({
      part: ["snippet", "statistics"],
      id: [cleanVideoId],
    });
    
    const item = res.data.items?.[0];
    if (!item || !item.snippet || !item.statistics) {
      return NextResponse.json({ error: "Video not found or missing data" }, { status: 404 });
    }

    const { snippet, statistics } = item;

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        creatorId,
        videoId: cleanVideoId,
        title: snippet.title || "Untitled Video",
        wentLiveAt: wentLiveAt ? new Date(wentLiveAt) : new Date(snippet.publishedAt || new Date()),
        costUsd: costUsd ?? null,
        notes: { description: snippet.description },
      },
    });

    // Create initial metrics snapshot
    await prisma.videoMetricSnapshot.create({
      data: {
        campaignId: campaign.id,
        views: Number(statistics.viewCount ?? 0),
        comments: Number(statistics.commentCount ?? 0),
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
