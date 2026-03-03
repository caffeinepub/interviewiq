import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Difficulty, InterviewStatus } from "../backend.d";

export function StatusBadge({ status }: { status: InterviewStatus }) {
  const configs: Record<InterviewStatus, { label: string; className: string }> =
    {
      [InterviewStatus.scheduled]: {
        label: "Scheduled",
        className: "bg-info/10 text-info border-info/30 hover:bg-info/20",
      },
      [InterviewStatus.inProgress]: {
        label: "In Progress",
        className:
          "bg-warning/10 text-warning border-warning/30 hover:bg-warning/20",
      },
      [InterviewStatus.completed]: {
        label: "Completed",
        className:
          "bg-success/10 text-success border-success/30 hover:bg-success/20",
      },
      [InterviewStatus.evaluated]: {
        label: "Evaluated",
        className:
          "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20",
      },
    };

  const config = configs[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", config.className)}
    >
      {config.label}
    </Badge>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const configs: Record<Difficulty, { label: string; className: string }> = {
    [Difficulty.easy]: {
      label: "Easy",
      className:
        "bg-success/10 text-success border-success/30 hover:bg-success/20",
    },
    [Difficulty.medium]: {
      label: "Medium",
      className:
        "bg-warning/10 text-warning border-warning/30 hover:bg-warning/20",
    },
    [Difficulty.hard]: {
      label: "Hard",
      className:
        "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20",
    },
  };

  const config = configs[difficulty] ?? {
    label: difficulty,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", config.className)}
    >
      {config.label}
    </Badge>
  );
}
