import { NextResponse } from 'next/server';
import { fetchAutomationsOverview, n8nConfigured } from '@/lib/n8n';
import type { AutomationsOverview } from '@/lib/types';

export async function GET() {
  if (!n8nConfigured()) {
    const payload: AutomationsOverview = { configured: false, error: null, workflows: [], recentExecutions: [] };
    return NextResponse.json(payload);
  }

  try {
    const overview = await fetchAutomationsOverview();
    const payload: AutomationsOverview = { configured: true, error: null, ...overview };
    return NextResponse.json(payload);
  } catch (err) {
    const payload: AutomationsOverview = {
      configured: true,
      error: err instanceof Error ? err.message : 'n8n unreachable',
      workflows: [],
      recentExecutions: [],
    };
    return NextResponse.json(payload, { status: 502 });
  }
}
