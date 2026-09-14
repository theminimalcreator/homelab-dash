import type { NodeStats } from "./types";

export type Alert = {
  id: string;
  nodeName: string;
  message: string;
};

const DISK_USE_PERCENT_THRESHOLD = 90;

export function computeAlerts(
  nodes: { name: string; online: boolean; stats: NodeStats | null }[],
): Alert[] {
  const alerts: Alert[] = [];

  for (const node of nodes) {
    if (!node.online) {
      alerts.push({
        id: `${node.name}-offline`,
        nodeName: node.name,
        message: `${node.name} offline`,
      });
      continue;
    }

    const usePercent = node.stats?.hardware.disk?.usePercent;
    if (usePercent !== null && usePercent !== undefined && usePercent >= DISK_USE_PERCENT_THRESHOLD) {
      alerts.push({
        id: `${node.name}-disk`,
        nodeName: node.name,
        message: `Disco baixo: ${node.name} ${100 - usePercent}% livre`,
      });
    }
  }

  return alerts;
}
