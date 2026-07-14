import { BarChart3Icon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEvidence } from "@/evidence/evidence-context";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LearningCard } from "./learning-card";

export interface ChartSeries {
  dataKey: string;
  label: string;
  color?: string;
}

interface ChartExplorerProps {
  id: string;
  title: string;
  prompt: string;
  data: Array<Record<string, string | number>>;
  xKey: string;
  series: ChartSeries[];
  type?: "line" | "bar";
  xLabel?: string;
  yLabel?: string;
  accessibleSummary: string;
}

const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function ChartExplorer({
  id,
  title,
  prompt,
  data,
  xKey,
  series,
  type = "line",
  xLabel,
  yLabel,
  accessibleSummary,
}: ChartExplorerProps) {
  const { snapshot, recordEvent, markComplete } = useEvidence();
  const completed = snapshot.completedIds.includes(id);
  const common = {
    data,
    margin: { top: 12, right: 18, bottom: 22, left: 12 },
  };

  return (
    <LearningCard
      id={id}
      title={title}
      description={prompt}
      icon={<BarChart3Icon aria-hidden="true" />}
      footer={
        <Button
          type="button"
          variant={completed ? "secondary" : "default"}
          onClick={() => {
            recordEvent(id, "interaction", { action: "chart_inspected", type });
            markComplete(id, { chartType: type });
          }}
        >
          <CheckIcon data-icon="inline-start" aria-hidden="true" />
          {completed ? "Chart inspected" : "I inspected the pattern"}
        </Button>
      }
    >
      <div
        className="h-72 w-full rounded-lg border border-border bg-background p-3"
        role="img"
        aria-label={accessibleSummary}
      >
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart {...common}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey={xKey} label={xLabel ? { value: xLabel, position: "insideBottom", offset: -12 } : undefined} />
              <YAxis label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft" } : undefined} />
              <RechartsTooltip contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", borderRadius: "var(--radius)", color: "var(--popover-foreground)" }} />
              {series.map((item, index) => (
                <Bar key={item.dataKey} dataKey={item.dataKey} name={item.label} fill={item.color ?? chartColors[index % chartColors.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          ) : (
            <LineChart {...common}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey={xKey} label={xLabel ? { value: xLabel, position: "insideBottom", offset: -12 } : undefined} />
              <YAxis label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft" } : undefined} />
              <RechartsTooltip contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", borderRadius: "var(--radius)", color: "var(--popover-foreground)" }} />
              {series.map((item, index) => (
                <Line key={item.dataKey} type="monotone" dataKey={item.dataKey} name={item.label} stroke={item.color ?? chartColors[index % chartColors.length]} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <details className="rounded-lg bg-muted/45 p-3 text-sm text-muted-foreground">
        <summary className="cursor-pointer font-medium text-foreground">Text summary of the chart</summary>
        <p className="mt-2 leading-relaxed">{accessibleSummary}</p>
      </details>
    </LearningCard>
  );
}
