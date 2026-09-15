import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { rowToNode, validateNodeInput, type NodeInput } from '@/lib/nodes';

export async function GET() {
  const { rows } = await query('SELECT * FROM nodes ORDER BY id');
  return NextResponse.json(rows.map(rowToNode));
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as NodeInput;

  const validation = validateNodeInput(body, { partial: false });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const { rows } = await query(
      `INSERT INTO nodes
        (name, subtitle, kind, stats_url, ssh_user, ssh_port, auth_token, tracks_claude_code, tracks_wake_lock, services_runtime, is_self)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        body.name,
        body.subtitle ?? null,
        body.kind,
        body.statsUrl ?? null,
        body.sshUser ?? null,
        body.sshPort ?? null,
        body.authToken ?? null,
        !!body.tracksClaudeCode,
        !!body.tracksWakeLock,
        body.servicesRuntime ?? 'none',
        !!body.isSelf,
      ],
    );
    return NextResponse.json(rowToNode(rows[0]), { status: 201 });
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      return NextResponse.json({ error: 'Another Node is already marked as is_self' }, { status: 400 });
    }
    throw err;
  }
}
