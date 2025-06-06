import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const creator = await prisma.creator.findUnique({
      where: {
        id: id,
      },
      include: {
        campaigns: true,
      },
    });

    if (!creator) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(creator);
  } catch (error) {
    console.error('Error fetching creator:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creator' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, channelId, email, status, pitchNotes } = body;

    const creator = await prisma.creator.update({
      where: {
        id: id,
      },
      data: {
        ...(name && { name }),
        ...(channelId && { channelId }),
        ...(email !== undefined && { email: email || null }),
        ...(status && { status }),
        ...(pitchNotes !== undefined && { pitchNotes }),
      },
    });

    return NextResponse.json(creator);
  } catch (error) {
    console.error('Error updating creator:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A creator with this channel ID already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update creator' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.creator.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Creator deleted successfully' });
  } catch (error) {
    console.error('Error deleting creator:', error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete creator' },
      { status: 500 }
    );
  }
}
