import { Alert, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import type { Alert as AlertItem } from "@/lib/alerts";

export function AlertsBanner({ alerts }: { alerts: AlertItem[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {alerts.map((alert) => (
        <Alert key={alert.id} variant="destructive" className="w-auto">
          <TriangleAlert />
          <AlertTitle>{alert.message}</AlertTitle>
        </Alert>
      ))}
    </div>
  );
}
