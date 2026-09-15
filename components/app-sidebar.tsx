"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Server, Settings, Boxes, Bell, LogOut, type LucideIcon } from "lucide-react";
import { cn } from "cn";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
};

// Config-driven on purpose: Settings/Services/Alerts are real future
// sections (see .scratch/multi-node/spec.md, "Fora de escopo") — wiring
// them up later is adding one entry here, not restructuring the sidebar.
const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, enabled: true },
  { label: "Nodes", href: "/nodes", icon: Server, enabled: true },
  { label: "Settings", href: "/settings", icon: Settings, enabled: false },
  { label: "Services", href: "/services", icon: Boxes, enabled: false },
  { label: "Alerts", href: "/alerts", icon: Bell, enabled: false },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="flex w-56 shrink-0 flex-col border-r border-border bg-background p-4 font-mono text-foreground">
      <div className="mb-6 px-2.5 text-sm font-bold">Homelab Cluster</div>

      <ul className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          if (!item.enabled) {
            return (
              <li key={item.href}>
                <span
                  className="flex cursor-not-allowed items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground/50"
                  title="Em breve"
                >
                  <Icon className="size-4" />
                  {item.label}
                </span>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-muted hover:text-foreground",
                  active && "bg-muted font-medium",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogOut className="size-4" />
        Sair
      </button>
    </nav>
  );
}
