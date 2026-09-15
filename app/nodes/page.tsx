"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NodesTable } from "@/components/nodes-table";
import { NodeFormDialog } from "@/components/node-form-dialog";
import { Button } from "@/components/ui/button";
import type { NodeRecord } from "@/lib/nodes";

export default function NodesPage() {
  const [nodes, setNodes] = useState<NodeRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<NodeRecord | null>(null);
  // Bumped to force an immediate refetch (mutations below) and to remount
  // NodeFormDialog with fresh state each time it opens (see its `key` prop).
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchNodes() {
      const res = await fetch("/api/nodes");
      const data = await res.json();
      if (!cancelled) {
        setNodes(data);
        setLoaded(true);
      }
    }
    fetchNodes();
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  function openCreateDialog() {
    setEditingNode(null);
    setDialogOpen(true);
    setRefreshToken((k) => k + 1);
  }

  function openEditDialog(node: NodeRecord) {
    setEditingNode(node);
    setDialogOpen(true);
    setRefreshToken((k) => k + 1);
  }

  async function handleDelete(node: NodeRecord) {
    if (!confirm(`Apagar o Node "${node.name}"? Essa ação não pode ser desfeita.`)) return;
    await fetch(`/api/nodes/${node.id}`, { method: "DELETE" });
    setRefreshToken((k) => k + 1);
  }

  function handleSaved() {
    setDialogOpen(false);
    setRefreshToken((k) => k + 1);
  }

  return (
    <main className="min-h-screen bg-background p-8 font-mono text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Nodes</h1>
          </div>
          <Button onClick={openCreateDialog}>Novo Node</Button>
        </div>

        <NodesTable
          nodes={nodes}
          loaded={loaded}
          onEdit={openEditDialog}
          onDelete={handleDelete}
        />
      </div>

      <NodeFormDialog
        key={refreshToken}
        open={dialogOpen}
        node={editingNode}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
      />
    </main>
  );
}
