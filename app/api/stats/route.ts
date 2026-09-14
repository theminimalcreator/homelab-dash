import { NextResponse } from 'next/server';
import { collectNodeStats } from '@/lib/collectNodeStats';

export async function GET() {
  try {
    const stats = await collectNodeStats({ peerUrl: process.env.DEV_NODE_URL });
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch server stats' }, { status: 500 });
  }
}
