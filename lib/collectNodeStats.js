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

async function getServices() {
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
    }));
  } catch {
    return [];
  }
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

async function collectNodeStats({ role, peerUrl } = {}) {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const loadAvg = os.loadavg();
  const uptime = os.uptime();

  const [disk, services, battery, network] = await Promise.all([
    getDisk(),
    getServices(),
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

  if (role === 'dev') {
    stats.claudeCodeActive = await getClaudeCodeActive();
    stats.wakeLock = { requestedAtBoot: wakeLockRequestedAtBoot };
  }

  return stats;
}

module.exports = { collectNodeStats, requestWakeLockOnce };
