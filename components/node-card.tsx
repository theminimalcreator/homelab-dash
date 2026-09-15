import type { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SshShortcut } from "@/components/ssh-shortcut";
import type { NodeStats } from "@/lib/types";
import { formatBytes, memPercent, cpuLoadPercent, formatUptime } from "@/lib/format";

type NodeCardProps = {
  title: string;
  subtitle: string | null;
  online: boolean;
  stats: NodeStats | null;
  sshUser: string | null;
  sshPort: number | null;
};

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function MeterRow({
  label,
  percent,
  detail,
}: {
  label: string;
  percent: number;
  detail: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">
          {percent}% · {detail}
        </span>
      </div>
      <Progress value={percent} />
    </div>
  );
}

export function NodeCard({ title, subtitle, online, stats, sshUser, sshPort }: NodeCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </div>
        <div className="flex items-center gap-2">
          <SshShortcut ip={stats?.network.localIp ?? null} sshUser={sshUser} sshPort={sshPort} />
          <Badge variant={online ? "default" : "destructive"}>
            {online ? "online" : "offline"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!stats ? (
          <p className="text-sm text-muted-foreground">Sem dados</p>
        ) : (
          <>
            <section className="space-y-3">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Hardware
              </h3>
              <MeterRow
                label="CPU"
                percent={cpuLoadPercent(stats.hardware.loadAvg[0], stats.hardware.cpuCount)}
                detail={stats.hardware.cpuTempC !== null ? `${stats.hardware.cpuTempC}°C` : "temp N/A"}
              />
              <MeterRow
                label="RAM"
                percent={memPercent(stats.hardware.totalMem, stats.hardware.freeMem)}
                detail={`${formatBytes(stats.hardware.totalMem - stats.hardware.freeMem)} / ${formatBytes(stats.hardware.totalMem)}`}
              />
              {stats.hardware.disk && (
                <MeterRow
                  label="Disco"
                  percent={stats.hardware.disk.usePercent ?? 0}
                  detail={`${stats.hardware.disk.available} livre`}
                />
              )}
              <Stat label="Uptime" value={formatUptime(stats.hardware.uptime)} />
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Bateria
              </h3>
              <Stat
                label="Carga"
                value={
                  stats.battery.percent !== null
                    ? `${stats.battery.percent}%${stats.battery.charging ? " ⚡" : ""}`
                    : "—"
                }
              />
              <Stat
                label="Temp"
                value={stats.hardware.batteryTempC !== null ? `${stats.hardware.batteryTempC}°C` : "N/A"}
              />
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Rede
              </h3>
              <Stat label="IP" value={stats.network.localIp ?? "—"} />
              <Stat
                label="Latência peer"
                value={
                  stats.network.peerLatencyMs !== null
                    ? `${Math.round(stats.network.peerLatencyMs)}ms`
                    : "—"
                }
              />
              <Stat
                label="Wifi"
                value={stats.network.wifiSignalDbm !== null ? `${stats.network.wifiSignalDbm} dBm` : "—"}
              />
            </section>

            {stats.claudeCodeActive !== undefined && (
              <section className="space-y-2">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Claude Code
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`size-2 rounded-full ${stats.claudeCodeActive ? "bg-green-500" : "bg-muted-foreground"}`}
                  />
                  {stats.claudeCodeActive ? "sessão ativa" : "sem sessão"}
                </div>
              </section>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
