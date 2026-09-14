import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ServiceStat } from "@/lib/types";
import { formatBytes, formatUptimeMs } from "@/lib/format";

type ServicesTableProps = {
  rows: { nodeName: string; service: ServiceStat }[];
};

export function ServicesTable({ rows }: ServicesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Node</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>CPU</TableHead>
          <TableHead>RAM</TableHead>
          <TableHead>Restarts</TableHead>
          <TableHead>Uptime</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
              Nenhum serviço disponível
            </TableCell>
          </TableRow>
        ) : (
          rows.map(({ nodeName, service }) => (
            <TableRow key={`${nodeName}-${service.name}`}>
              <TableCell className="text-muted-foreground">{nodeName}</TableCell>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell>
                <Badge variant={service.status === "online" ? "default" : "destructive"}>
                  {service.status}
                </Badge>
              </TableCell>
              <TableCell className="font-mono">{service.cpu}%</TableCell>
              <TableCell className="font-mono">{formatBytes(service.mem)}</TableCell>
              <TableCell className="font-mono">{service.restarts}</TableCell>
              <TableCell className="font-mono">{formatUptimeMs(service.uptimeMs)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
