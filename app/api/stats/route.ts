import { NextResponse } from 'next/server';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Executa o comando CLI direto no terminal e pega a resposta em texto
    const { stdout } = await execAsync('pm2 jlist');
    const processes = JSON.parse(stdout);

    const stats = {
      hardware: {
        totalMem: os.totalmem(),
        freeMem: os.freemem(),
        loadAvg: os.loadavg(),
        uptime: os.uptime(),
      },
      services: processes.map((p: any) => ({
        name: p.name,
        status: p.pm2_env.status,
        cpu: p.monit?.cpu || 0,
        mem: p.monit?.memory || 0,
        restarts: p.pm2_env.restart_time,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch server stats' }, { status: 500 });
  }
}