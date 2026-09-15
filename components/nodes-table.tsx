import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NodeRecord } from "@/lib/nodes";

type NodesTableProps = {
  nodes: NodeRecord[];
  loaded: boolean;
  onEdit: (node: NodeRecord) => void;
  onDelete: (node: NodeRecord) => void;
};

const EMPTY_VALUE = <span className="text-muted-foreground">—</span>;

export function NodesTable({ nodes, loaded, onEdit, onDelete }: NodesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Kind</TableHead>
          <TableHead>Stats URL</TableHead>
          <TableHead>SSH</TableHead>
          <TableHead>Services</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {!loaded ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              Carregando...
            </TableCell>
          </TableRow>
        ) : nodes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              Nenhum Node cadastrado
            </TableCell>
          </TableRow>
        ) : (
          nodes.map((node) => (
            <TableRow key={node.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {node.name}
                  {node.isSelf && <Badge variant="secondary">self</Badge>}
                </div>
                {node.subtitle && (
                  <div className="text-xs text-muted-foreground">{node.subtitle}</div>
                )}
              </TableCell>
              <TableCell className="font-mono text-xs">{node.kind}</TableCell>
              <TableCell className="font-mono text-xs">{node.statsUrl ?? EMPTY_VALUE}</TableCell>
              <TableCell className="font-mono text-xs">
                {node.sshUser && node.sshPort ? `${node.sshUser}:${node.sshPort}` : EMPTY_VALUE}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{node.servicesRuntime}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onEdit(node)}>
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(node)}>
                  Apagar
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
