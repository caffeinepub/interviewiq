import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number; // 0–100
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ScoreGauge({ score, size = "md", className }: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - clampedScore / 100);

  const sizes = {
    sm: { svgSize: 80, textSize: "text-lg", labelSize: "text-xs" },
    md: { svgSize: 120, textSize: "text-2xl", labelSize: "text-xs" },
    lg: { svgSize: 160, textSize: "text-4xl", labelSize: "text-sm" },
  };

  const { svgSize, textSize, labelSize } = sizes[size];

  const getColor = (s: number) => {
    if (s >= 80) return "text-success";
    if (s >= 60) return "text-warning";
    return "text-destructive";
  };

  const getStrokeColor = (s: number) => {
    if (s >= 80) return "oklch(var(--success))";
    if (s >= 60) return "oklch(var(--warning))";
    return "oklch(var(--destructive))";
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 100 100"
        className="-rotate-90"
        role="img"
        aria-label={`Score: ${clampedScore} out of 100`}
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-border"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={getStrokeColor(clampedScore)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-display font-bold leading-none",
            textSize,
            getColor(clampedScore),
          )}
        >
          {clampedScore}
        </span>
        <span className={cn("text-muted-foreground", labelSize)}>/ 100</span>
      </div>
    </div>
  );
}
