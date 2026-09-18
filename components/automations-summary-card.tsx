import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AutomationsOverview } from "@/lib/types";

export function AutomationsSummaryCard({ automations }: { automations: AutomationsOverview }) {
  if (!automations.configured) return null;

  const total = automations.workflows.length;
  const failing = automations.workflows.filter((wf) => wf.lastExecution?.status === "error").length;
  const ok = automations.workflows.filter((wf) => wf.lastExecution?.status === "success").length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Automações</CardTitle>
        <Link href="/automations" className="text-sm text-muted-foreground hover:text-foreground">
          Ver tudo →
        </Link>
      </CardHeader>
      <CardContent>
        {automations.error ? (
          <p className="text-sm text-destructive">Não foi possível falar com o n8n: {automations.error}</p>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">{total} workflow(s) ativo(s)</span>
            {failing > 0 && <Badge variant="destructive">{failing} com falha</Badge>}
            {ok > 0 && <Badge variant="default">{ok} ok</Badge>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
