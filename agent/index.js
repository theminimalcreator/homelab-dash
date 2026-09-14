const http = require('http');
const os = require('os');

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
    loadAvg: os.loadavg(),
    uptime: os.uptime()
  }));
}).listen(3001, '0.0.0.0', () => console.log('Agente Alpine rodando na porta 3001'));
