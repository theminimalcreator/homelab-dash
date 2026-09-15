"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { NodeRecord, ServicesRuntime } from "@/lib/nodes";

type FormState = {
  name: string;
  subtitle: string;
  kind: string;
  statsUrl: string;
  sshUser: string;
  sshPort: string;
  authToken: string;
  tracksClaudeCode: boolean;
  tracksWakeLock: boolean;
  servicesRuntime: ServicesRuntime;
  isSelf: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  subtitle: "",
  kind: "",
  statsUrl: "",
  sshUser: "",
  sshPort: "",
  authToken: "",
  tracksClaudeCode: false,
  tracksWakeLock: false,
  servicesRuntime: "none",
  isSelf: false,
};

function nodeToForm(node: NodeRecord | null): FormState {
  if (!node) return EMPTY_FORM;
  return {
    name: node.name,
    subtitle: node.subtitle ?? "",
    kind: node.kind,
    statsUrl: node.statsUrl ?? "",
    sshUser: node.sshUser ?? "",
    sshPort: node.sshPort != null ? String(node.sshPort) : "",
    authToken: node.authToken ?? "",
    tracksClaudeCode: node.tracksClaudeCode,
    tracksWakeLock: node.tracksWakeLock,
    servicesRuntime: node.servicesRuntime,
    isSelf: node.isSelf,
  };
}

type NodeFormDialogProps = {
  open: boolean;
  node: NodeRecord | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function NodeFormDialog({ open, node, onOpenChange, onSaved }: NodeFormDialogProps) {
  // No effect needed to reset on open: the parent remounts this component
  // (via a `key` prop) each time it opens, so this lazy initializer alone
  // keeps the form in sync with `node` without a setState-in-effect.
  const [form, setForm] = useState<FormState>(() => nodeToForm(node));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      subtitle: form.subtitle || null,
      kind: form.kind,
      statsUrl: form.statsUrl || null,
      sshUser: form.sshUser || null,
      sshPort: form.sshPort ? Number(form.sshPort) : null,
      authToken: form.authToken || null,
      tracksClaudeCode: form.tracksClaudeCode,
      tracksWakeLock: form.tracksWakeLock,
      servicesRuntime: form.servicesRuntime,
      isSelf: form.isSelf,
    };

    const res = await fetch(node ? `/api/nodes/${node.id}` : "/api/nodes", {
      method: node ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Erro ao salvar");
      return;
    }

    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{node ? `Editar ${node.name}` : "Novo Node"}</DialogTitle>
          <DialogDescription>
            {node ? "Altera a configuração desse Node." : "Cadastra um Node novo no Cluster."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="node-name">Nome</Label>
              <Input
                id="node-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="node-subtitle">Subtítulo</Label>
              <Input
                id="node-subtitle"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="node-kind">Kind</Label>
            <Input
              id="node-kind"
              value={form.kind}
              onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
              placeholder="termux-master, termux-dev, linux-vps..."
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="node-stats-url">Stats URL</Label>
            <Input
              id="node-stats-url"
              value={form.statsUrl}
              onChange={(e) => setForm((f) => ({ ...f, statsUrl: e.target.value }))}
              placeholder="http://192.168.x.x:3001"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="node-ssh-user">SSH user</Label>
              <Input
                id="node-ssh-user"
                value={form.sshUser}
                onChange={(e) => setForm((f) => ({ ...f, sshUser: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="node-ssh-port">SSH porta</Label>
              <Input
                id="node-ssh-port"
                type="number"
                value={form.sshPort}
                onChange={(e) => setForm((f) => ({ ...f, sshPort: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="node-auth-token">Auth token</Label>
            <Input
              id="node-auth-token"
              value={form.authToken}
              onChange={(e) => setForm((f) => ({ ...f, authToken: e.target.value }))}
              placeholder="valor esperado no header X-Node-Token"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="node-services-runtime">Services runtime</Label>
            <Select
              value={form.servicesRuntime}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, servicesRuntime: value as ServicesRuntime }))
              }
            >
              <SelectTrigger id="node-services-runtime" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">none</SelectItem>
                <SelectItem value="pm2">pm2</SelectItem>
                <SelectItem value="docker">docker</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
            <Label className="font-normal">
              <Checkbox
                checked={form.tracksClaudeCode}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, tracksClaudeCode: checked === true }))
                }
              />
              Rastreia Claude Code
            </Label>
            <Label className="font-normal">
              <Checkbox
                checked={form.tracksWakeLock}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, tracksWakeLock: checked === true }))
                }
              />
              Rastreia wake lock
            </Label>
            <Label className="font-normal">
              <Checkbox
                checked={form.isSelf}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isSelf: checked === true }))}
              />
              É esse Node (self)
            </Label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
