'use strict';

try {
  process.loadEnvFile();
} catch {
  // no .env in cwd — fall back to whatever's already exported
}

const http = require('http');
const { collectNodeStats, requestWakeLockOnce } = require('../lib/collectNodeStats');

const PORT = 3001;
const AGENT_TOKEN = process.env.AGENT_TOKEN;

if (!AGENT_TOKEN) {
  console.warn('AGENT_TOKEN not set in .env — every request will be rejected with 401.');
}

requestWakeLockOnce();

http.createServer(async (req, res) => {
  if (!AGENT_TOKEN || req.headers['x-node-token'] !== AGENT_TOKEN) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }
  try {
    const stats = await collectNodeStats({
      peerUrl: process.env.MASTER_URL,
      capabilities: { tracksClaudeCode: true, tracksWakeLock: true, servicesRuntime: 'pm2' },
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats));
  } catch {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to collect node stats' }));
  }
}).listen(PORT, '0.0.0.0', () => console.log(`Agente Alpine rodando na porta ${PORT}`));
