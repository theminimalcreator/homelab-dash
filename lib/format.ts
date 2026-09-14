export function formatBytes(bytes: number): string {
  const gb = bytes / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
}

export function memPercent(totalMem: number, freeMem: number): number {
  if (!totalMem) return 0;
  return Math.round(((totalMem - freeMem) / totalMem) * 100);
}

export function cpuLoadPercent(loadAvg1: number, cpuCount: number): number {
  if (!cpuCount) return 0;
  return Math.min(100, Math.round((loadAvg1 / cpuCount) * 100));
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatUptimeMs(ms: number | null): string {
  if (ms === null) return "—";
  return formatUptime(ms / 1000);
}
