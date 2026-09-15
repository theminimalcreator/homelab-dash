"use client";

import { useEffect, useState } from "react";
import { NodeCard } from "@/components/node-card";
import { ServicesTable } from "@/components/services-table";
import { AlertsBanner } from "@/components/alerts-banner";
import { computeAlerts } from "@/lib/alerts";
import type { NodeStats } from "@/lib/types";

type ClusterEntry = {
  node: {
    id: number;
    name: string;
    kind: string;
    subtitle: string | null;
    sshUser: string | null;
    sshPort: number | null;
  };
  online: boolean;
  stats: NodeStats | null;
};

export default function Dashboard() {
  const [cluster, setCluster] = useState<ClusterEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchCluster() {
      try {
        const res = await fetch("/api/cluster");
        if (!res.ok) throw new Error("bad status");
        const data = (await res.json()) as ClusterEntry[];
        if (!cancelled) setCluster(data);
      } catch {
        // Keep the last known cluster state on a transient fetch failure —
        // a single offline Node is already reflected per-entry by the
        // aggregator itself, this only covers the Master being unreachable.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    fetchCluster();
    const interval = setInterval(fetchCluster, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!loaded) {
    return <div className="p-10 font-mono text-foreground">Carregando cluster...</div>;
  }

  const alerts = computeAlerts(
    cluster.map((entry) => ({ name: entry.node.name, online: entry.online, stats: entry.stats })),
  );

  const serviceRows = cluster.flatMap((entry) =>
    (entry.stats?.services ?? []).map((service) => ({ nodeName: entry.node.name, service })),
  );

  return (
    <main className="min-h-screen bg-background p-8 font-mono text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-bold">Homelab Cluster</h1>

        <AlertsBanner alerts={alerts} />

        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
          {cluster.map((entry) => (
            <NodeCard
              key={entry.node.id}
              title={entry.node.name}
              subtitle={entry.node.subtitle}
              online={entry.online}
              stats={entry.stats}
              sshUser={entry.node.sshUser}
              sshPort={entry.node.sshPort}
            />
          ))}
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Services</h2>
          <ServicesTable rows={serviceRows} />
        </div>
      </div>
    </main>
  );
}
