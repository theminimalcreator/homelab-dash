import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { rowToNode, type NodeRecord } from '@/lib/nodes';
import { collectNodeStats } from '@/lib/collectNodeStats';
import type { NodeStats } from '@/lib/types';

const FETCH_TIMEOUT_MS = 5000;

type ClusterNodeEntry = {
  node: { id: number; name: string; kind: string; subtitle: string | null };
  online: boolean;
  stats: NodeStats | null;
};

function publicNode(node: NodeRecord): ClusterNodeEntry['node'] {
  return { id: node.id, name: node.name, kind: node.kind, subtitle: node.subtitle };
}

async function fetchStats(url: string, token: string | null): Promise<NodeStats> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: token ? { 'X-Node-Token': token } : {},
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`bad status ${res.status}`);
    return (await res.json()) as NodeStats;
  } finally {
    clearTimeout(timeout);
  }
}

async function collectSelf(node: NodeRecord): Promise<NodeStats> {
  // Hub-and-spoke (see spec.md): the Master has no peer of its own to ping —
  // every other Node pings it instead, via that Node's own MASTER_URL env var.
  return (await collectNodeStats({
    peerUrl: null,
    capabilities: {
      tracksClaudeCode: node.tracksClaudeCode,
      tracksWakeLock: node.tracksWakeLock,
      servicesRuntime: node.servicesRuntime,
    },
  })) as NodeStats;
}

export async function GET() {
  const { rows } = await query('SELECT * FROM nodes ORDER BY id');
  const nodes = rows.map(rowToNode);

  const settled = await Promise.allSettled(
    nodes.map(async (node: NodeRecord): Promise<ClusterNodeEntry> => {
      if (node.isSelf) {
        return { node: publicNode(node), online: true, stats: await collectSelf(node) };
      }
      if (!node.statsUrl) {
        return { node: publicNode(node), online: false, stats: null };
      }
      const stats = await fetchStats(node.statsUrl, node.authToken);
      return { node: publicNode(node), online: true, stats };
    }),
  );

  const payload: ClusterNodeEntry[] = settled.map((result, i) =>
    result.status === 'fulfilled'
      ? result.value
      : { node: publicNode(nodes[i]), online: false, stats: null },
  );

  return NextResponse.json(payload);
}
