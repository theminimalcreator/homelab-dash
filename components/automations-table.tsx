import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { N8nExecutionStatus, N8nWorkflowHealth } from "@/lib/types";
import { formatRelativeTime, formatExecutionDuration } from "@/lib/format";

export function n8nStatusVariant(
  status: N8nExecutionStatus | undefined,
): "default" | "destructive" | "secondary" | "outline" {
  switch (status) {
    case "success":
      return "default";
    case "error":
    case "crashed":
      return "destructive";
    case "running":
    case "waiting":
      return "secondary";
    default:
      return "outline";
  }
}

export function n8nStatusLabel(status: N8nExecutionStatus | undefined): string {
  return status ?? "sem execuções";
}

type AutomationsTableProps = { workflows: N8nWorkflowHealth[] };

export function AutomationsTable({ workflows }: AutomationsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Workflow</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Última execução</TableHead>
          <TableHead>Duração</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workflows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              Nenhuma automação ativa
            </TableCell>
          </TableRow>
        ) : (
          workflows.map((wf) => (
            <TableRow key={wf.id}>
              <TableCell className="font-medium">{wf.name}</TableCell>
              <TableCell>
                <Badge variant={n8nStatusVariant(wf.lastExecution?.status)}>
                  {n8nStatusLabel(wf.lastExecution?.status)}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {formatRelativeTime(wf.lastExecution?.startedAt ?? null)}
              </TableCell>
              <TableCell className="font-mono">
                {formatExecutionDuration(
                  wf.lastExecution?.startedAt ?? null,
                  wf.lastExecution?.stoppedAt ?? null,
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
