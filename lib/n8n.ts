import type { N8nExecution, N8nExecutionStatus, N8nWorkflowHealth } from "@/lib/types";

const FETCH_TIMEOUT_MS = 5000;

type N8nConfig = { baseUrl: string; apiKey: string };

// Raw shapes as n8n's REST API returns them — kept loose (most fields
// optional) because the exact shape has changed across n8n versions; see
// normalizeStatus below and .scratch/n8n-automations/issues/05-validate-live.md.
type RawN8nWorkflow = { id: string | number; name: string; active: boolean };
type RawN8nExecution = {
  id: string | number;
  workflowId: string | number;
  status?: string;
  finished?: boolean;
  mode?: string;
  startedAt?: string;
  createdAt?: string;
  stoppedAt?: string | null;
};

function getConfig(): N8nConfig | null {
  const baseUrl = process.env.N8N_URL;
  const apiKey = process.env.N8N_API_KEY;
  if (!baseUrl || !apiKey) return null;
  return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey };
}

export function n8nConfigured(): boolean {
  return getConfig() !== null;
}

async function n8nFetch<T>(config: N8nConfig, path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${config.baseUrl}/api/v1${path}`, {
      headers: { "X-N8N-API-KEY": config.apiKey },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`n8n API bad status ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

// n8n's execution shape has changed across versions: some return a `status`
// string directly, older ones only expose `finished`/`stoppedAt`. Handle
// both so this doesn't silently show "unknown" for everything after an n8n
// upgrade — see .scratch/n8n-automations/issues/05-validate-live.md.
function normalizeStatus(raw: RawN8nExecution): N8nExecutionStatus {
  const known: N8nExecutionStatus[] = ["success", "error", "running", "waiting", "canceled", "crashed"];
  const status = raw.status?.toLowerCase();
  if (status && known.includes(status as N8nExecutionStatus)) {
    return status as N8nExecutionStatus;
  }
  if (raw.finished === true) return "success";
  if (!raw.stoppedAt) return "running";
  if (raw.finished === false) return "error";
  return "unknown";
}

function toExecution(raw: RawN8nExecution, nameById: Map<string, string>): N8nExecution {
  const workflowId = String(raw.workflowId);
  return {
    id: String(raw.id),
    workflowId,
    workflowName: nameById.get(workflowId) ?? null,
    status: normalizeStatus(raw),
    mode: raw.mode ?? "unknown",
    startedAt: raw.startedAt ?? raw.createdAt ?? null,
    stoppedAt: raw.stoppedAt ?? null,
  };
}

export async function fetchAutomationsOverview(): Promise<{
  workflows: N8nWorkflowHealth[];
  recentExecutions: N8nExecution[];
}> {
  const config = getConfig();
  if (!config) return { workflows: [], recentExecutions: [] };

  const [workflowsRes, executionsRes] = await Promise.all([
    n8nFetch<{ data?: RawN8nWorkflow[] }>(config, "/workflows?limit=250"),
    n8nFetch<{ data?: RawN8nExecution[] }>(config, "/executions?limit=50"),
  ]);

  const allWorkflows = workflowsRes.data ?? [];
  const nameById = new Map(allWorkflows.map((wf) => [String(wf.id), wf.name]));

  const recentExecutions: N8nExecution[] = (executionsRes.data ?? []).map((raw) =>
    toExecution(raw, nameById),
  );

  const workflows: N8nWorkflowHealth[] = allWorkflows
    .filter((wf) => wf.active)
    .map((wf) => ({
      id: String(wf.id),
      name: wf.name,
      active: wf.active,
      // n8n returns executions most-recent-first; the first match per
      // workflow is therefore its latest run.
      lastExecution: recentExecutions.find((e) => e.workflowId === String(wf.id)) ?? null,
    }));

  return { workflows, recentExecutions };
}
