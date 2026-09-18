"use client";

import { useEffect, useState } from "react";
import { AutomationsTable } from "@/components/automations-table";
import { AutomationsLog } from "@/components/automations-log";
import type { AutomationsOverview } from "@/lib/types";

const EMPTY: AutomationsOverview = { configured: true, error: null, workflows: [], recentExecutions: [] };

export default function AutomationsPage() {
  const [data, setData] = useState<AutomationsOverview>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchAutomations() {
      try {
        const res = await fetch("/api/automations");
        const json = (await res.json()) as AutomationsOverview;
        if (!cancelled) setData(json);
      } catch {
        // Keep the last known state on a transient fetch failure.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    fetchAutomations();
    const interval = setInterval(fetchAutomations, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!loaded) {
    return <div className="p-10 font-mono text-foreground">Carregando automações...</div>;
  }

  return (
    <main className="bg-background p-8 font-mono text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-bold">Automações</h1>

        {!data.configured ? (
          <p className="text-sm text-muted-foreground">
            n8n não configurado — defina <code>N8N_URL</code> e <code>N8N_API_KEY</code> no{" "}
            <code>.env</code> do Master.
          </p>
        ) : data.error ? (
          <p className="text-sm text-destructive">Não foi possível falar com o n8n: {data.error}</p>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Workflows ativos</h2>
              <AutomationsTable workflows={data.workflows} />
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Execuções recentes</h2>
              <AutomationsLog executions={data.recentExecutions} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
