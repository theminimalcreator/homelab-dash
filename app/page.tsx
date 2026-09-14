"use client";

import { useEffect, useState } from "react";
import { NodeCard } from "@/components/node-card";
import { ServicesTable } from "@/components/services-table";
import { AlertsBanner } from "@/components/alerts-banner";
import { computeAlerts } from "@/lib/alerts";
import type { NodeStats } from "@/lib/types";

const DEV_NODE_URL = process.env.NEXT_PUBLIC_DEV_NODE_URL;

export default function Dashboard() {
  const [masterStats, setMasterStats] = useState<NodeStats | null>(null);
  const [devStats, setDevStats] = useState<NodeStats | null>(null);
  const [masterOnline, setMasterOnline] = useState(false);
  const [devOnline, setDevOnline] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) throw new Error("bad status");
        setMasterStats(await res.json());
        setMasterOnline(true);
      } catch {
        setMasterOnline(false);
      }

      if (DEV_NODE_URL) {
        try {
          const res = await fetch(DEV_NODE_URL);
          if (!res.ok) throw new Error("bad status");
          setDevStats(await res.json());
          setDevOnline(true);
        } catch {
          setDevOnline(false);
        }
      }

      setLoaded(true);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!loaded) {
    return <div className="p-10 font-mono text-foreground">Carregando cluster...</div>;
  }

  const alerts = computeAlerts([
    { name: "Master", online: masterOnline, stats: masterStats },
    { name: "Dev Node", online: devOnline, stats: devStats },
  ]);

  const serviceRows = [
    ...(masterStats?.services ?? []).map((service) => ({ nodeName: "Master", service })),
    ...(devStats?.services ?? []).map((service) => ({ nodeName: "Dev Node", service })),
  ];

  return (
    <main className="min-h-screen bg-background p-8 font-mono text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-bold">Homelab Cluster</h1>

        <AlertsBanner alerts={alerts} />

        <div className="grid grid-cols-2 gap-4">
          <NodeCard title="Master" subtitle="Poco X3 GT" online={masterOnline} stats={masterStats} />
          <NodeCard
            title="Dev Node"
            subtitle="Redmi Note 12 5G"
            online={devOnline}
            stats={devStats}
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Services</h2>
          <ServicesTable rows={serviceRows} />
        </div>
      </div>
    </main>
  );
}
