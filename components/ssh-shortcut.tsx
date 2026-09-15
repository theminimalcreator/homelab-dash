"use client";

import { useState } from "react";
import { Terminal, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

function legacyCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

type SshShortcutProps = {
  ip: string | null;
  sshUser: string | null;
  sshPort: number | null;
};

export function SshShortcut({ ip, sshUser, sshPort }: SshShortcutProps) {
  const [copied, setCopied] = useState(false);

  if (!ip || !sshUser) return null;

  const command = `ssh -p ${sshPort ?? 22} ${sshUser}@${ip}`;

  const handleClick = async () => {
    let ok = false;
    try {
      // navigator.clipboard needs a secure context (HTTPS/localhost) — this
      // dashboard is served over plain HTTP on the LAN, so it's often
      // unavailable and we fall back to the older execCommand path.
      await navigator.clipboard.writeText(command);
      ok = true;
    } catch {
      ok = legacyCopy(command);
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      title={command}
      className="gap-1.5 text-muted-foreground"
    >
      {copied ? <Check className="size-3.5" /> : <Terminal className="size-3.5" />}
      {copied ? "Copiado" : "SSH"}
    </Button>
  );
}
