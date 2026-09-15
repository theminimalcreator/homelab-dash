import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { rowToNode, validateNodeInput, type NodeInput } from '@/lib/nodes';

const FIELD_COLUMNS: Record<keyof NodeInput, string> = {
  name: 'name',
  subtitle: 'subtitle',
  kind: 'kind',
  statsUrl: 'stats_url',
  sshUser: 'ssh_user',
  sshPort: 'ssh_port',
  authToken: 'auth_token',
  tracksClaudeCode: 'tracks_claude_code',
  tracksWakeLock: 'tracks_wake_lock',
  servicesRuntime: 'services_runtime',
  isSelf: 'is_self',
};

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { rows } = await query('SELECT * FROM nodes WHERE id = $1', [id]);
  if (rows.length === 0) return NextResponse.json({ error: 'Node not found' }, { status: 404 });
  return NextResponse.json(rowToNode(rows[0]));
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = (await req.json()) as NodeInput;

  const validation = validateNodeInput(body, { partial: true });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];
  for (const [field, column] of Object.entries(FIELD_COLUMNS) as [keyof NodeInput, string][]) {
    if (body[field] === undefined) continue;
    values.push(body[field]);
    setClauses.push(`${column} = $${values.length}`);
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }
  setClauses.push('updated_at = now()');

  values.push(id);

  try {
    const { rows } = await query(
      `UPDATE nodes SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values,
    );
    if (rows.length === 0) return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    return NextResponse.json(rowToNode(rows[0]));
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      return NextResponse.json({ error: 'Another Node is already marked as is_self' }, { status: 400 });
    }
    throw err;
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { rows } = await query('DELETE FROM nodes WHERE id = $1 RETURNING id', [id]);
  if (rows.length === 0) return NextResponse.json({ error: 'Node not found' }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
