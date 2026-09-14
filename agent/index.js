'use strict';

try {
  process.loadEnvFile();
} catch {
  // no .env in cwd — fall back to whatever's already exported
}

const http = require('http');
const { collectNodeStats, requestWakeLockOnce } = require('../lib/collectNodeStats');

const PORT = 3001;

requestWakeLockOnce();

http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const stats = await collectNodeStats({ role: 'dev', peerUrl: process.env.MASTER_URL });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats));
  } catch {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to collect node stats' }));
  }
}).listen(PORT, '0.0.0.0', () => console.log(`Agente Alpine rodando na porta ${PORT}`));
