import type { ReactNode } from "react";
import { AlertCircleIcon, CheckCircle2Icon, LightbulbIcon, SparklesIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface CalloutProps {
  title: string;
  children: ReactNode;
  kind?: "note" | "insight" | "success" | "caution";
}

const icons = {
  note: SparklesIcon,
  insight: LightbulbIcon,
  success: CheckCircle2Icon,
  caution: AlertCircleIcon,
};

export function Callout({ title, children, kind = "note" }: CalloutProps) {
  const Icon = icons[kind];
  return (
    <Alert className={cn("my-6 grid grid-cols-[auto_1fr] gap-x-3", kind === "caution" && "border-destructive/45")}>
      <Icon className="mt-0.5 text-primary" aria-hidden="true" />
      <div>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="lesson-prose">{children}</AlertDescription>
      </div>
    </Alert>
  );
}
