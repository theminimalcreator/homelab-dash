'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function tryExec(cmd, timeoutMs = 3000) {
  try {
    const { stdout } = await execAsync(cmd, { timeout: timeoutMs });
    return stdout;
  } catch {
    return null;
  }
}

function parseDf(output) {
  if (!output) return null;
  const lines = output.trim().split('\n');
  if (lines.length < 2) return null;
  const parts = lines[1].trim().split(/\s+/);
  if (parts.length < 5) return null;
  const usePercent = parseInt(parts[4], 10);
  return {
    total: parts[1],
    used: parts[2],
    available: parts[3],
    usePercent: Number.isNaN(usePercent) ? null : usePercent,
  };
}

async function getDisk() {
  // Bare Termux (Master) has "/" mounted on the tiny, always-full Android
  // system partition — $HOME is what actually lands on real storage there.
  // Under proot (Dev Node) $HOME sits inside the mapped root either way.
  return parseDf(await tryExec('df -h "$HOME" 2>/dev/null'));
}

const THERMAL_DIR = '/sys/class/thermal';
const CPU_TYPE_PATTERNS = [/cpu[_-]?therm/i, /cpuss/i, /tsens_tz_sensor/i];
const BATTERY_TYPE_PATTERNS = [/battery/i];

// Zone numbering/labels vary per SoC/ROM and some ROMs block the whole
// class by permission. Discover once, cache the result (including the
// "blocked" case), so we don't re-scan ~90 sysfs files on every poll.
let thermalCache = null;

function discoverThermalZones() {
  if (thermalCache) return thermalCache;
  try {
    const entries = fs.readdirSync(THERMAL_DIR).filter((e) => e.startsWith('thermal_zone'));
    let cpuZone = null;
    let batteryZone = null;
    for (const entry of entries) {
      let type;
      try {
        type = fs.readFileSync(path.join(THERMAL_DIR, entry, 'type'), 'utf8').trim();
      } catch {
        continue;
      }
      if (!cpuZone && CPU_TYPE_PATTERNS.some((re) => re.test(type))) cpuZone = entry;
      if (!batteryZone && BATTERY_TYPE_PATTERNS.some((re) => re.test(type))) batteryZone = entry;
      if (cpuZone && batteryZone) break;
    }
    thermalCache = { blocked: false, cpuZone, batteryZone };
  } catch {
    thermalCache = { blocked: true, cpuZone: null, batteryZone: null };
  }
  return thermalCache;
}

function readZoneTempC(zone) {
  if (!zone) return null;
  try {
    const raw = fs.readFileSync(path.join(THERMAL_DIR, zone, 'temp'), 'utf8').trim();
    const millideg = parseInt(raw, 10);
    if (Number.isNaN(millideg)) return null;
    return Math.round((millideg / 1000) * 10) / 10;
  } catch {
    return null;
  }
}

function getTemps() {
  const zones = discoverThermalZones();
  if (zones.blocked) return { cpuTempC: null, batteryTempC: null };
  return {
    cpuTempC: readZoneTempC(zones.cpuZone),
    batteryTempC: readZoneTempC(zones.batteryZone),
  };
}

async function getPm2Services() {
  const out = await tryExec('pm2 jlist');
  if (!out) return [];
  try {
    const processes = JSON.parse(out);
    return processes.map((p) => ({
      name: p.name,
      status: p.pm2_env?.status ?? 'unknown',
      cpu: p.monit?.cpu ?? 0,
      mem: p.monit?.memory ?? 0,
      restarts: p.pm2_env?.restart_time ?? 0,
      uptimeMs: p.pm2_env?.pm_uptime ? Date.now() - p.pm2_env.pm_uptime : null,
      runtime: 'pm2',
    }));
  } catch {
    return [];
  }
}

function parseNdjson(output) {
  if (!output) return [];
  return output
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function parseDockerCpuPercent(str) {
  if (!str) return 0;
  const n = parseFloat(str.replace('%', ''));
  return Number.isNaN(n) ? 0 : n;
}

// docker's own humanized units (go-humanize, binary base) — e.g. "12.5MiB".
const DOCKER_MEM_UNIT_MULTIPLIERS = {
  b: 1,
  kb: 1000,
  kib: 1024,
  mb: 1000 ** 2,
  mib: 1024 ** 2,
  gb: 1000 ** 3,
  gib: 1024 ** 3,
  tb: 1000 ** 4,
  tib: 1024 ** 4,
};

function parseDockerMemBytes(str) {
  if (!str) return 0;
  const match = str.trim().match(/^([\d.]+)\s*([A-Za-z]+)$/);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const multiplier = DOCKER_MEM_UNIT_MULTIPLIERS[match[2].toLowerCase()];
  if (Number.isNaN(value) || !multiplier) return 0;
  return Math.round(value * multiplier);
}

// Container names are the natural join key here (unique, stable, and
// what we want to display anyway) — `docker stats` only lists running
// containers, `docker ps -a` also lists stopped ones, and RestartCount/
// uptime only come from `docker inspect`. Docker's own naming rules
// (`[a-zA-Z0-9][a-zA-Z0-9_.-]+`) rule out shell-injection via the name.
async function getDockerServices() {
  const psOut = await tryExec("docker ps -a --format '{{json .}}'");
  const containers = parseNdjson(psOut);
  if (containers.length === 0) return [];

  const names = containers.map((c) => c.Names).filter(Boolean);
  const nameArgs = names.join(' ');

  const [statsOut, inspectOut] = await Promise.all([
    tryExec("docker stats --no-stream --format '{{json .}}'"),
    names.length
      ? tryExec(`docker inspect --format '{{.Name}}|{{.RestartCount}}|{{.State.StartedAt}}' ${nameArgs}`)
      : Promise.resolve(null),
  ]);

  const statsByName = new Map();
  for (const s of parseNdjson(statsOut)) {
    if (s.Name) statsByName.set(s.Name, s);
  }

  const inspectByName = new Map();
  if (inspectOut) {
    for (const line of inspectOut.trim().split('\n')) {
      const [rawName, restartCount, startedAt] = line.split('|');
      if (!rawName) continue;
      inspectByName.set(rawName.replace(/^\//, ''), {
        restarts: parseInt(restartCount, 10) || 0,
        uptimeMs: startedAt ? Date.now() - new Date(startedAt).getTime() : null,
      });
    }
  }

  return containers.map((c) => {
    const stats = statsByName.get(c.Names);
    const inspected = inspectByName.get(c.Names);
    return {
      name: c.Names,
      status: (c.State || 'unknown').toLowerCase(),
      cpu: stats ? parseDockerCpuPercent(stats.CPUPerc) : 0,
      mem: stats ? parseDockerMemBytes((stats.MemUsage || '').split('/')[0]) : 0,
      restarts: inspected ? inspected.restarts : 0,
      uptimeMs: inspected ? inspected.uptimeMs : null,
      runtime: 'docker',
    };
  });
}

async function getServices(servicesRuntime) {
  if (servicesRuntime === 'docker') return getDockerServices();
  if (servicesRuntime === 'pm2') return getPm2Services();
  return [];
}

async function getBattery() {
  const out = await tryExec('termux-battery-status');
  if (!out) return { percent: null, charging: null };
  try {
    const data = JSON.parse(out);
    return {
      percent: typeof data.percentage === 'number' ? data.percentage : null,
      charging: data.status ? data.status === 'CHARGING' || data.status === 'FULL' : null,
    };
  } catch {
    return { percent: null, charging: null };
  }
}

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const iface of interfaces.wlan0 || []) {
    if (iface.family === 'IPv4' && !iface.internal) return iface.address;
  }
  for (const name of Object.keys(interfaces)) {
    if (name === 'lo' || name.startsWith('dummy') || name.includes('rmnet')) continue;
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return null;
}

function stripToHost(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

async function pingMs(host) {
  if (!host) return null;
  const out = await tryExec(`ping -c 1 -W 2 ${host}`, 4000);
  if (!out) return null;
  const match = out.match(/time[=<]([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
}

async function getWifi() {
  const out = await tryExec('termux-wifi-connectioninfo');
  if (!out) return { connectionType: null, wifiSignalDbm: null };
  try {
    const data = JSON.parse(out);
    // termux-api reports rssi -1 when not associated to a wifi network
    if (typeof data.rssi === 'number' && data.rssi !== -1) {
      return { connectionType: 'wifi', wifiSignalDbm: data.rssi };
    }
    return { connectionType: null, wifiSignalDbm: null };
  } catch {
    return { connectionType: null, wifiSignalDbm: null };
  }
}

async function getNetwork(peerUrl) {
  const [peerLatencyMs, externalLatencyMs, wifi] = await Promise.all([
    pingMs(stripToHost(peerUrl)),
    pingMs('1.1.1.1'),
    getWifi(),
  ]);
  return {
    localIp: getLocalIp(),
    peerLatencyMs,
    externalLatencyMs,
    connectionType: wifi.connectionType,
    wifiSignalDbm: wifi.wifiSignalDbm,
  };
}

async function getClaudeCodeActive() {
  const out = await tryExec('pgrep -x claude');
  return !!(out && out.trim());
}

// termux-wake-lock only lets you *acquire* a lock; there's no way to read
// wake lock state back without root. This remembers whether we asked for
// one at boot — a proxy for "should still be active", not a live reading.
let wakeLockRequestedAtBoot = false;

async function requestWakeLockOnce() {
  const out = await tryExec('termux-wake-lock', 5000);
  wakeLockRequestedAtBoot = out !== null;
  return wakeLockRequestedAtBoot;
}

/**
 * @param {{ peerUrl?: string | null, capabilities?: { tracksClaudeCode?: boolean, tracksWakeLock?: boolean, servicesRuntime?: 'pm2' | 'docker' | 'none' } }} [options]
 */
async function collectNodeStats({ peerUrl, capabilities = {} } = {}) {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const loadAvg = os.loadavg();
  const uptime = os.uptime();

  const [disk, services, battery, network] = await Promise.all([
    getDisk(),
    getServices(capabilities.servicesRuntime),
    getBattery(),
    getNetwork(peerUrl),
  ]);
  const temps = getTemps();

  const stats = {
    hardware: {
      totalMem,
      freeMem,
      loadAvg,
      // os.cpus() comes back empty on some Android/Termux + Node combos
      // (confirmed on the Master) even though the cores are real;
      // availableParallelism() is the reliable one here.
      cpuCount: os.availableParallelism ? os.availableParallelism() : os.cpus().length,
      uptime,
      disk,
      cpuTempC: temps.cpuTempC,
      batteryTempC: temps.batteryTempC,
    },
    battery,
    network,
    services,
  };

  if (capabilities.tracksClaudeCode) {
    stats.claudeCodeActive = await getClaudeCodeActive();
  }
  if (capabilities.tracksWakeLock) {
    stats.wakeLock = { requestedAtBoot: wakeLockRequestedAtBoot };
  }

  return stats;
}

module.exports = { collectNodeStats, requestWakeLockOnce };
