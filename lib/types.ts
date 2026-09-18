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

export type N8nExecutionStatus =
  | "success"
  | "error"
  | "running"
  | "waiting"
  | "canceled"
  | "crashed"
  | "unknown";

export type N8nExecution = {
  id: string;
  workflowId: string;
  workflowName: string | null;
  status: N8nExecutionStatus;
  mode: string;
  startedAt: string | null;
  stoppedAt: string | null;
};

export type N8nWorkflowHealth = {
  id: string;
  name: string;
  active: boolean;
  lastExecution: N8nExecution | null;
};

export type AutomationsOverview = {
  configured: boolean;
  error: string | null;
  workflows: N8nWorkflowHealth[];
  recentExecutions: N8nExecution[];
};
