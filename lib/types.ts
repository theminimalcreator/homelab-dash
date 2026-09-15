export type ServiceStat = {
  name: string;
  status: string;
  cpu: number;
  mem: number;
  restarts: number;
  uptimeMs: number | null;
  runtime: "pm2" | "docker";
};

export type NodeStats = {
  hardware: {
    totalMem: number;
    freeMem: number;
    loadAvg: number[];
    cpuCount: number;
    uptime: number;
    disk: { total: string; used: string; available: string; usePercent: number | null } | null;
    cpuTempC: number | null;
    batteryTempC: number | null;
  };
  battery: { percent: number | null; charging: boolean | null };
  network: {
    localIp: string | null;
    peerLatencyMs: number | null;
    externalLatencyMs: number | null;
    connectionType: string | null;
    wifiSignalDbm: number | null;
  };
  services: ServiceStat[];
  claudeCodeActive?: boolean;
  wakeLock?: { requestedAtBoot: boolean };
};
