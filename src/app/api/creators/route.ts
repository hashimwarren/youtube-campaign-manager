import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const creators = await prisma.creator.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(creators);
  } catch (error) {
    console.error('Error fetching creators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creators' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, channelId, email, status } = body;

    // Basic validation
    if (!name || !channelId) {
      return NextResponse.json(
        { error: 'Name and channel ID are required' },
        { status: 400 }
      );
    }

    const creator = await prisma.creator.create({
      data: {
        name,
        channelId,
        email: email || null,
        status: status || 'SELECTED',
      },
    });

    return NextResponse.json(creator, { status: 201 });
  } catch (error) {
    console.error('Error creating creator:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A creator with this channel ID already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create creator' },
      { status: 500 }
    );
  }
}
