import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  User,
} from "lucide-react";
import { ScoreGauge } from "../components/ScoreGauge";
import { DifficultyBadge, StatusBadge } from "../components/StatusBadge";
import { useGetAllQuestions, useGetSession } from "../hooks/useQueries";

function formatDate(nsTimestamp: bigint): string {
  const ms = Number(nsTimestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AssessmentReport() {
  const { id } = useParams({ from: "/session/$id/report" });
  const sessionId = BigInt(id);

  const { data: session, isLoading: loadingSession } = useGetSession(sessionId);
  const { data: allQuestions, isLoading: loadingQuestions } =
    useGetAllQuestions();

  const isLoading = loadingSession || loadingQuestions;

  if (isLoading) {
    return (
      <div
        className="container py-8 space-y-6 max-w-4xl"
        data-ocid="report.loading_state"
      >
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container py-8 max-w-4xl" data-ocid="report.error_state">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Session not found. It may have been deleted.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const sessionQuestions = session.questionIds.map((qId) =>
    (allQuestions ?? []).find((q) => q.id === qId),
  );

  const overallScore =
    session.overallScore !== undefined ? Number(session.overallScore) : null;

  const getDuration = () => {
    if (!session.startTime || !session.endTime) return null;
    const diffMs =
      (Number(session.endTime) - Number(session.startTime)) / 1_000_000;
    const minutes = Math.floor(diffMs / 60000);
    return `${minutes} minutes`;
  };

  return (
    <div className="container py-8 max-w-4xl space-y-8">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="gap-1.5 -ml-2 text-muted-foreground"
      >
        <Link to="/candidate">
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
      </Button>

      {/* Header Card */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit size={18} className="text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Interview Report
                </span>
              </div>
              <CardTitle className="font-display text-2xl">
                Session #{id}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StatusBadge status={session.status} />
                {session.flagged && (
                  <Badge
                    variant="outline"
                    className="text-xs border-destructive/30 text-destructive bg-destructive/5"
                  >
                    <Flag size={10} className="mr-1" />
                    Flagged
                    {session.flagNote && `: ${session.flagNote}`}
                  </Badge>
                )}
              </div>
            </div>

            {overallScore !== null && (
              <ScoreGauge score={overallScore} size="lg" />
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {session.startTime && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar
                  size={14}
                  className="text-muted-foreground shrink-0"
                />
                <div>
                  <p className="text-xs text-muted-foreground">Started</p>
                  <p>{formatDate(session.startTime)}</p>
                </div>
              </div>
            )}
            {getDuration() && (
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p>{getDuration()}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Candidate</p>
                <p className="font-mono text-xs truncate">
                  {session.candidate.toString().slice(0, 20)}…
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Feedback */}
      {session.feedback && (
        <Card className="border-border/60 border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base text-primary">
              Evaluator Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{session.feedback}</p>
          </CardContent>
        </Card>
      )}

      {/* Score Summary */}
      {overallScore !== null && (
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-base">
              Score Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Score</span>
                <span className="font-semibold text-primary">
                  {overallScore}/100
                </span>
              </div>
              <Progress value={overallScore} className="h-3" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <ScoreRange
                label="Needs Work"
                range="0–59"
                active={overallScore < 60}
                color="text-destructive"
              />
              <ScoreRange
                label="Good"
                range="60–79"
                active={overallScore >= 60 && overallScore < 80}
                color="text-warning"
              />
              <ScoreRange
                label="Excellent"
                range="80–100"
                active={overallScore >= 80}
                color="text-success"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base">
            Interview Questions ({sessionQuestions.length})
          </CardTitle>
          <CardDescription>Questions covered in this session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/60">
            {sessionQuestions.map((q, idx) => {
              if (!q) {
                return (
                  <div
                    key={`missing-q-${String(session.questionIds[idx])}`}
                    className="py-4 text-sm text-muted-foreground"
                    data-ocid={`report.question.item.${idx + 1}`}
                  >
                    Question data unavailable
                  </div>
                );
              }
              return (
                <div
                  key={q.id.toString()}
                  className="py-5 first:pt-0 last:pb-0 space-y-2"
                  data-ocid={`report.question.item.${idx + 1}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Q{idx + 1}
                      </span>
                      <h3 className="font-medium text-sm">{q.title}</h3>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <DifficultyBadge difficulty={q.difficulty} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    {q.description}
                  </p>
                  <div className="flex gap-1.5 pl-7 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-xs border-border/60"
                    >
                      {q.category}
                    </Badge>
                    {q.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-muted-foreground bg-muted/40 rounded px-1.5 py-0.5"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* No Score Yet */}
      {overallScore === null && (
        <div
          className="flex flex-col items-center justify-center py-10 text-center"
          data-ocid="report.pending_state"
        >
          <CheckCircle2 className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-muted-foreground">
            Awaiting Evaluation
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Your evaluator will review and score your session soon.
          </p>
        </div>
      )}
    </div>
  );
}

function ScoreRange({
  label,
  range,
  active,
  color,
}: {
  label: string;
  range: string;
  active: boolean;
  color: string;
}) {
  return (
    <div
      className={`rounded-lg p-3 text-center border transition-colors ${active ? "border-current/30 bg-current/5" : "border-border/60"}`}
    >
      <p
        className={`text-sm font-semibold ${active ? color : "text-muted-foreground"}`}
      >
        {label}
      </p>
      <p className="text-xs text-muted-foreground">{range}</p>
    </div>
  );
}
