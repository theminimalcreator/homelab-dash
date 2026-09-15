import type { QueryResultRow } from 'pg';

export const SERVICES_RUNTIMES = ['pm2', 'docker', 'none'] as const;
export type ServicesRuntime = (typeof SERVICES_RUNTIMES)[number];

export interface NodeRecord {
  id: number;
  name: string;
  subtitle: string | null;
  kind: string;
  statsUrl: string | null;
  sshUser: string | null;
  sshPort: number | null;
  authToken: string | null;
  tracksClaudeCode: boolean;
  tracksWakeLock: boolean;
  servicesRuntime: ServicesRuntime;
  isSelf: boolean;
  createdAt: string;
  updatedAt: string;
}

export function rowToNode(row: QueryResultRow): NodeRecord {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle,
    kind: row.kind,
    statsUrl: row.stats_url,
    sshUser: row.ssh_user,
    sshPort: row.ssh_port,
    authToken: row.auth_token,
    tracksClaudeCode: row.tracks_claude_code,
    tracksWakeLock: row.tracks_wake_lock,
    servicesRuntime: row.services_runtime,
    isSelf: row.is_self,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Fields a caller may set through the CRUD API, camelCase as received from JSON. */
export interface NodeInput {
  name?: unknown;
  subtitle?: unknown;
  kind?: unknown;
  statsUrl?: unknown;
  sshUser?: unknown;
  sshPort?: unknown;
  authToken?: unknown;
  tracksClaudeCode?: unknown;
  tracksWakeLock?: unknown;
  servicesRuntime?: unknown;
  isSelf?: unknown;
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** `partial: true` skips the required-field checks (used for PATCH). */
export function validateNodeInput(body: NodeInput, { partial }: { partial: boolean }): ValidationResult {
  if (!partial) {
    if (!isNonEmptyString(body.name)) return { ok: false, error: 'name is required' };
    if (!isNonEmptyString(body.kind)) return { ok: false, error: 'kind is required' };
  } else {
    if (body.name !== undefined && !isNonEmptyString(body.name)) {
      return { ok: false, error: 'name must be a non-empty string' };
    }
    if (body.kind !== undefined && !isNonEmptyString(body.kind)) {
      return { ok: false, error: 'kind must be a non-empty string' };
    }
  }

  if (body.servicesRuntime !== undefined && !SERVICES_RUNTIMES.includes(body.servicesRuntime as ServicesRuntime)) {
    return { ok: false, error: `servicesRuntime must be one of ${SERVICES_RUNTIMES.join(', ')}` };
  }

  if (body.sshPort !== undefined && body.sshPort !== null) {
    const port = Number(body.sshPort);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return { ok: false, error: 'sshPort must be an integer between 1 and 65535' };
    }
  }

  return { ok: true };
}
