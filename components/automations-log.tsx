import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { N8nExecution } from "@/lib/types";
import { formatRelativeTime, formatExecutionDuration } from "@/lib/format";
import { n8nStatusVariant, n8nStatusLabel } from "@/components/automations-table";

type AutomationsLogProps = { executions: N8nExecution[] };

export function AutomationsLog({ executions }: AutomationsLogProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Workflow</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Modo</TableHead>
          <TableHead>Quando</TableHead>
          <TableHead>Duração</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {executions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              Nenhuma execução recente
            </TableCell>
          </TableRow>
        ) : (
          executions.map((ex) => (
            <TableRow key={ex.id}>
              <TableCell className="font-medium">{ex.workflowName ?? `#${ex.workflowId}`}</TableCell>
              <TableCell>
                <Badge variant={n8nStatusVariant(ex.status)}>{n8nStatusLabel(ex.status)}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{ex.mode}</TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {formatRelativeTime(ex.startedAt)}
              </TableCell>
              <TableCell className="font-mono">
                {formatExecutionDuration(ex.startedAt, ex.stoppedAt)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
