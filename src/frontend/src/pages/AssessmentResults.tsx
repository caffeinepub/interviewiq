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
  FileText,
  MessageSquare,
  RefreshCw,
  Star,
  Timer,
  Trophy,
} from "lucide-react";
import type { AnswerSubmission } from "../backend.d";
import { ScoreGauge } from "../components/ScoreGauge";
import { DifficultyBadge, StatusBadge } from "../components/StatusBadge";
import {
  useGetAllQuestions,
  useGetSession,
  useGetSessionAnswers,
} from "../hooks/useQueries";

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

function getDuration(
  startTime: bigint | undefined,
  endTime: bigint | undefined,
): string | null {
  if (!startTime || !endTime) return null;
  const diffMs = (Number(endTime) - Number(startTime)) / 1_000_000;
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function formatTimeTaken(seconds: bigint): string {
  const s = Number(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m > 0) return `${m}m ${rem}s`;
  return `${s}s`;
}

function getPerformanceTier(score: number): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
} {
  if (score >= 80)
    return {
      label: "Outstanding",
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/30",
      icon: <Trophy size={14} className="text-success" />,
    };
  if (score >= 60)
    return {
      label: "Good",
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30",
      icon: <Star size={14} className="text-warning" />,
    };
  if (score >= 40)
    return {
      label: "Decent",
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
      borderColor: "border-orange-400/30",
      icon: <CheckCircle2 size={14} className="text-orange-400" />,
    };
  return {
    label: "Needs Work",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
    icon: <RefreshCw size={14} className="text-destructive" />,
  };
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-warning";
  if (score >= 40) return "bg-orange-400";
  return "bg-destructive";
}

export function AssessmentResults() {
  const { id } = useParams({ from: "/assessment/results/$id" });
  const sessionId = BigInt(id);

  const { data: session, isLoading: loadingSession } = useGetSession(sessionId);
  const { data: allQuestions, isLoading: loadingQuestions } =
    useGetAllQuestions();
  const { data: sessionAnswers, isLoading: loadingAnswers } =
    useGetSessionAnswers(sessionId);

  const isLoading = loadingSession || loadingQuestions || loadingAnswers;

  if (isLoading) {
    return (
      <div
        className="container py-8 space-y-6 max-w-4xl mx-auto"
        data-ocid="assessment-results.loading_state"
      >
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (!session) {
    return (
      <div
        className="container py-8 max-w-4xl mx-auto"
        data-ocid="assessment-results.error_state"
      >
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-1.5 -ml-2 text-muted-foreground mb-6"
        >
          <Link to="/assessment">
            <ArrowLeft size={14} />
            Back to Assessment
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Session not found. It may have been deleted or the ID is invalid.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Build answer map: questionId.toString() → AnswerSubmission
  const answerMap = new Map<string, AnswerSubmission>(
    (sessionAnswers ?? []).map((a) => [a.questionId.toString(), a]),
  );

  const sessionQuestions = session.questionIds.map((qId) =>
    (allQuestions ?? []).find((q) => q.id === qId),
  );

  const overallScore =
    session.overallScore !== undefined ? Number(session.overallScore) : null;
  const duration = getDuration(session.startTime, session.endTime);
  const tier = overallScore !== null ? getPerformanceTier(overallScore) : null;

  const answeredCount = (sessionAnswers ?? []).length;
  const totalCount = session.questionIds.length;

  return (
    <div
      className="container py-8 max-w-4xl mx-auto space-y-6"
      data-ocid="assessment-results.page"
    >
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="gap-1.5 -ml-2 text-muted-foreground"
        data-ocid="assessment-results.back_button"
      >
        <Link to="/assessment">
          <ArrowLeft size={14} />
          Back to Assessment
        </Link>
      </Button>

      {/* Results Header Card */}
      <Card
        className="border-border/60 overflow-hidden"
        data-ocid="assessment-results.score_card"
      >
        <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={16} className="text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Assessment Complete
              </span>
            </div>
            <CardTitle className="font-display text-2xl sm:text-3xl">
              Your Results
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              {/* Left: meta info */}
              <div className="space-y-4 flex-1">
                {/* Status & tier */}
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={session.status} />
                  {tier && (
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold ${tier.color} ${tier.bgColor} ${tier.borderColor} gap-1`}
                    >
                      {tier.icon}
                      {tier.label}
                    </Badge>
                  )}
                </div>

                {/* Score text */}
                {overallScore !== null && (
                  <div>
                    <span className="font-display text-5xl font-bold text-primary">
                      {overallScore}
                    </span>
                    <span className="text-xl text-muted-foreground font-medium">
                      /100
                    </span>
                  </div>
                )}

                {/* Meta grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {session.startTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar
                        size={13}
                        className="text-muted-foreground shrink-0"
                      />
                      <div>
                        <p className="text-xs text-muted-foreground">Started</p>
                        <p className="font-medium text-xs">
                          {formatDate(session.startTime)}
                        </p>
                      </div>
                    </div>
                  )}
                  {duration && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock
                        size={13}
                        className="text-muted-foreground shrink-0"
                      />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Duration
                        </p>
                        <p className="font-medium text-xs">{duration}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <FileText
                      size={13}
                      className="text-muted-foreground shrink-0"
                    />
                    <div>
                      <p className="text-xs text-muted-foreground">Questions</p>
                      <p className="font-medium text-xs">
                        {answeredCount}/{totalCount} answered
                      </p>
                    </div>
                  </div>
                </div>

                {/* Overall feedback */}
                {session.feedback && (
                  <div className="rounded-lg bg-muted/40 border border-border/60 p-3">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                      <MessageSquare size={11} />
                      Overall Feedback
                    </p>
                    <p className="text-sm leading-relaxed">
                      {session.feedback}
                    </p>
                  </div>
                )}
              </div>

              {/* Right: ScoreGauge */}
              {overallScore !== null && (
                <div className="flex justify-center sm:justify-end shrink-0">
                  <ScoreGauge score={overallScore} size="lg" />
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Score Bar Card */}
      {overallScore !== null && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">
              Score Summary
            </CardTitle>
            <CardDescription>
              {answeredCount} of {totalCount} questions answered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Score</span>
                <span
                  className={`font-bold ${overallScore >= 80 ? "text-success" : overallScore >= 60 ? "text-warning" : overallScore >= 40 ? "text-orange-400" : "text-destructive"}`}
                >
                  {overallScore}/100
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${getScoreBarColor(overallScore)}`}
                  style={{ width: `${overallScore}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                {
                  label: "Needs Work",
                  range: "0–39",
                  active: overallScore < 40,
                  color: "text-destructive",
                  bg: "bg-destructive/10",
                  border: "border-destructive/30",
                },
                {
                  label: "Decent",
                  range: "40–59",
                  active: overallScore >= 40 && overallScore < 60,
                  color: "text-orange-400",
                  bg: "bg-orange-400/10",
                  border: "border-orange-400/30",
                },
                {
                  label: "Good",
                  range: "60–79",
                  active: overallScore >= 60 && overallScore < 80,
                  color: "text-warning",
                  bg: "bg-warning/10",
                  border: "border-warning/30",
                },
                {
                  label: "Outstanding",
                  range: "80–100",
                  active: overallScore >= 80,
                  color: "text-success",
                  bg: "bg-success/10",
                  border: "border-success/30",
                },
              ].map(({ label, range, active, color, bg, border }) => (
                <div
                  key={label}
                  className={`rounded-lg p-2.5 text-center border transition-all ${active ? `${border} ${bg}` : "border-border/40"}`}
                >
                  <p
                    className={`text-xs font-semibold ${active ? color : "text-muted-foreground"}`}
                  >
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {range}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-Question Breakdown */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <BrainCircuit size={16} className="text-primary" />
            Question Breakdown
          </CardTitle>
          <CardDescription>
            Your answers and per-question scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionQuestions.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10 text-center"
              data-ocid="assessment-results.questions.empty_state"
            >
              <BrainCircuit className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Question data unavailable.
              </p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-border/60">
              {sessionQuestions.map((q, idx) => {
                const qKey = q
                  ? q.id.toString()
                  : `missing-${String(session.questionIds[idx])}`;
                const answer = q ? answerMap.get(q.id.toString()) : undefined;
                const answerScore =
                  answer?.score !== undefined ? Number(answer.score) : null;

                return (
                  <div
                    key={qKey}
                    className="py-5 first:pt-0 last:pb-0 space-y-3"
                    data-ocid={`assessment-results.question.item.${idx + 1}`}
                  >
                    {/* Question header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          {q ? (
                            <>
                              <h3 className="font-semibold text-sm leading-snug">
                                {q.title}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <DifficultyBadge difficulty={q.difficulty} />
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
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Question data unavailable
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Per-answer score badge */}
                      {answerScore !== null && (
                        <Badge
                          variant="outline"
                          className={`text-xs font-bold shrink-0 ${
                            answerScore >= 80
                              ? "text-success bg-success/10 border-success/30"
                              : answerScore >= 60
                                ? "text-warning bg-warning/10 border-warning/30"
                                : answerScore >= 40
                                  ? "text-orange-400 bg-orange-400/10 border-orange-400/30"
                                  : "text-destructive bg-destructive/10 border-destructive/30"
                          }`}
                        >
                          {answerScore}/100
                        </Badge>
                      )}
                    </div>

                    {/* Question description */}
                    {q && (
                      <p className="text-xs text-muted-foreground leading-relaxed pl-10 line-clamp-2">
                        {q.description}
                      </p>
                    )}

                    {/* Answer section */}
                    {answer ? (
                      <div className="pl-10 space-y-2">
                        <div className="rounded-lg bg-muted/30 border border-border/40 p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                            <MessageSquare size={10} />
                            Your Answer
                          </p>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {answer.answerText}
                          </p>
                        </div>

                        {/* Time taken */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Timer size={11} />
                          Time taken: {formatTimeTaken(answer.timeTakenSeconds)}
                        </div>

                        {/* Per-answer feedback */}
                        {answer.feedback && (
                          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                            <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                              <FileText size={10} />
                              Feedback
                            </p>
                            <p className="text-xs leading-relaxed text-foreground/80">
                              {answer.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="pl-10">
                        <p className="text-xs text-muted-foreground italic">
                          Not answered
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Separator />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
        <Button
          variant="outline"
          asChild
          className="gap-2 border-border/60 w-full sm:w-auto"
          data-ocid="assessment-results.dashboard_button"
        >
          <Link to="/candidate">
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </Button>
        <Button
          asChild
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
          data-ocid="assessment-results.retake_button"
        >
          <Link to="/assessment">
            <RefreshCw size={14} />
            Take New Assessment
          </Link>
        </Button>
      </div>
    </div>
  );
}
