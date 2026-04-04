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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  FileText,
  GraduationCap,
  MessageSquare,
  Monitor,
  Printer,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Timer,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { AnswerSubmission } from "../backend.d";
import { ScoreGauge } from "../components/ScoreGauge";
import { DifficultyBadge, StatusBadge } from "../components/StatusBadge";
import {
  useGetAllQuestions,
  useGetSession,
  useGetSessionAnswers,
} from "../hooks/useQueries";

// ─── Proctoring types (mirrors InterviewSession / AssessmentResults) ──────────

interface ProctoringEvent {
  type:
    | "tab_switch"
    | "window_blur"
    | "camera_on"
    | "camera_off"
    | "screen_share_on"
    | "screen_share_off";
  timestamp: number;
  message: string;
}

interface ProctoringSessionSummary {
  cameraActive: boolean;
  screenShareActive: boolean;
  violations: number;
  snapshots: string[];
  events: ProctoringEvent[];
  sessionId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatEventTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getPerformanceTier(score: number): {
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  icon: React.ReactNode;
} {
  if (score >= 80)
    return {
      label: "Outstanding",
      colorClass: "text-success",
      bgClass: "bg-success/10",
      borderClass: "border-success/30",
      icon: <Trophy size={18} className="text-success" />,
    };
  if (score >= 60)
    return {
      label: "Good",
      colorClass: "text-warning",
      bgClass: "bg-warning/10",
      borderClass: "border-warning/30",
      icon: <Star size={18} className="text-warning" />,
    };
  if (score >= 40)
    return {
      label: "Decent",
      colorClass: "text-orange-400",
      bgClass: "bg-orange-400/10",
      borderClass: "border-orange-400/30",
      icon: <CheckCircle2 size={18} className="text-orange-400" />,
    };
  return {
    label: "Needs Work",
    colorClass: "text-destructive",
    bgClass: "bg-destructive/10",
    borderClass: "border-destructive/30",
    icon: <RefreshCw size={18} className="text-destructive" />,
  };
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  if (score >= 40) return "text-orange-400";
  return "text-destructive";
}

function getBarFill(score: number): string {
  if (score >= 80) return "oklch(var(--success))";
  if (score >= 60) return "oklch(var(--warning))";
  if (score >= 40) return "#fb923c"; // orange-400
  return "oklch(var(--destructive))";
}

function getEventIcon(type: ProctoringEvent["type"]) {
  switch (type) {
    case "tab_switch":
    case "window_blur":
      return <ShieldAlert size={12} className="text-warning shrink-0" />;
    case "camera_on":
      return <Camera size={12} className="text-success shrink-0" />;
    case "camera_off":
      return <Camera size={12} className="text-muted-foreground shrink-0" />;
    case "screen_share_on":
      return <Monitor size={12} className="text-success shrink-0" />;
    case "screen_share_off":
      return <Monitor size={12} className="text-muted-foreground shrink-0" />;
    default:
      return <Shield size={12} className="text-muted-foreground shrink-0" />;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CandidateReport() {
  const { id } = useParams({ from: "/candidate/report/$id" });
  const sessionId = BigInt(id);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Read proctoring from sessionStorage
  let proctoring: ProctoringSessionSummary | null = null;
  try {
    const raw = sessionStorage.getItem(`proctoring_${id}`);
    if (raw) proctoring = JSON.parse(raw) as ProctoringSessionSummary;
  } catch (_e) {
    proctoring = null;
  }

  const { data: session, isLoading: loadingSession } = useGetSession(sessionId);
  const { data: allQuestions, isLoading: loadingQuestions } =
    useGetAllQuestions();
  const { data: sessionAnswers, isLoading: loadingAnswers } =
    useGetSessionAnswers(sessionId);

  const isLoading = loadingSession || loadingQuestions || loadingAnswers;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Report link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (isLoading) {
    return (
      <div
        className="container py-8 space-y-6 max-w-5xl mx-auto"
        data-ocid="candidate-report.loading_state"
      >
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (!session) {
    return (
      <div
        className="container py-8 max-w-5xl mx-auto"
        data-ocid="candidate-report.error_state"
      >
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-1.5 -ml-2 text-muted-foreground mb-6"
          data-ocid="candidate-report.back_button"
        >
          <Link to="/assessment/results/$id" params={{ id }}>
            <ArrowLeft size={14} />
            Back to Results
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Session not found. The session may have been deleted or the ID is
            invalid.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Build answer map
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

  // Proctoring integrity score
  const integrityScore = proctoring
    ? Math.max(0, 100 - proctoring.violations * 20)
    : null;

  // Chart data
  const chartData = sessionQuestions.map((q, idx) => {
    const answer = q ? answerMap.get(q.id.toString()) : undefined;
    const score = answer?.score !== undefined ? Number(answer.score) : 0;
    return {
      name: q
        ? q.title.length > 30
          ? `${q.title.slice(0, 30)}…`
          : q.title
        : `Q${idx + 1}`,
      score,
    };
  });

  const chartHeight = Math.max(200, chartData.length * 40);

  return (
    <div
      className="container py-8 max-w-5xl mx-auto space-y-6"
      data-ocid="candidate-report.page"
    >
      {/* Print / Back Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-1.5 text-muted-foreground print:hidden"
          data-ocid="candidate-report.back_button"
        >
          <Link to="/assessment/results/$id" params={{ id }}>
            <ArrowLeft size={14} />
            Back to Results
          </Link>
        </Button>

        <h1 className="font-display text-lg font-semibold text-foreground hidden sm:block">
          Candidate Assessment Report
        </h1>

        <div className="flex items-center gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-1.5 border-border/60 text-muted-foreground hover:text-foreground"
            data-ocid="candidate-report.copy_link_button"
          >
            <Copy size={13} />
            Copy Link
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="candidate-report.print_button"
          >
            <Printer size={13} />
            Print Report
          </Button>
        </div>
      </div>

      <Separator />

      {/* Candidate Header Card */}
      <Card
        className="border-border/60 overflow-hidden"
        data-ocid="candidate-report.header_card"
      >
        <div className="bg-gradient-to-br from-primary/10 via-background to-accent/5 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText size={14} />
                <span>Assessment Report</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Interview Assessment
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary bg-primary/5 font-mono text-xs"
                >
                  Session #{id}
                </Badge>
                <StatusBadge status={session.status} />
                {session.flagged && (
                  <Badge
                    variant="outline"
                    className="border-destructive/40 text-destructive bg-destructive/5 gap-1 text-xs"
                  >
                    <ShieldAlert size={10} />
                    Flagged
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                {session.startTime && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar size={13} />
                    <span>{formatDate(session.startTime)}</span>
                  </div>
                )}
                {duration && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock size={13} />
                    <span>Duration: {duration}</span>
                  </div>
                )}
              </div>
            </div>

            {overallScore !== null && (
              <div className="shrink-0">
                <ScoreGauge score={overallScore} size="lg" />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Score Summary Row */}
      {overallScore !== null && tier && (
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          data-ocid="candidate-report.score_summary_section"
        >
          {/* Card 1: Score Gauge */}
          <Card className="glass-card gradient-border-blue">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm text-muted-foreground">
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-4">
              <ScoreGauge score={overallScore} size="md" />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Out of 100 points
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Performance tier */}
          <Card
            className={`border-border/60 ${tier.borderClass}`}
            data-ocid="candidate-report.tier_card"
          >
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm text-muted-foreground">
                Performance Tier
              </CardTitle>
            </CardHeader>
            <CardContent
              className={`flex flex-col items-center justify-center py-6 gap-3 rounded-b-xl ${tier.bgClass}`}
            >
              {tier.icon}
              <span
                className={`font-display text-2xl font-bold ${tier.colorClass}`}
              >
                {tier.label}
              </span>
              <p className="text-xs text-muted-foreground">
                Score: {overallScore}/100
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Completion stats */}
          <Card
            className="glass-card gradient-border-blue"
            data-ocid="candidate-report.stats_card"
          >
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm text-muted-foreground">
                Completion Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Questions</span>
                <span className="font-semibold">
                  {answeredCount}/{totalCount} answered
                </span>
              </div>
              {duration && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-semibold font-mono">{duration}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time limit</span>
                <span className="font-semibold">
                  {Number(session.timeLimitMinutes)}m
                </span>
              </div>
              {session.feedback && (
                <div className="mt-2 rounded-lg bg-muted/30 border border-border/40 p-2.5">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <MessageSquare size={10} />
                    Feedback
                  </p>
                  <p className="text-xs leading-relaxed">{session.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Skill Assessment Results */}
      {(() => {
        let mcqResults: {
          subject: string;
          score: number;
          total: number;
          completedAt: number;
        }[] = [];
        try {
          mcqResults = JSON.parse(
            localStorage.getItem("interviewiq_mcq_results") || "[]",
          );
        } catch {
          mcqResults = [];
        }
        return (
          <Card
            className="glass-card gradient-border-blue"
            data-ocid="candidate-report.skill_assessment_card"
          >
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <GraduationCap size={16} className="text-primary" />
                Skill Assessment Results
              </CardTitle>
              <CardDescription>
                MCQ scores from resume-based skill assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mcqResults.length === 0 ? (
                <p
                  className="text-sm text-muted-foreground"
                  data-ocid="candidate-report.skill_assessment_card.empty_state"
                >
                  No skill assessment completed. Visit the Student Dashboard to
                  take subject-specific MCQ assessments.
                </p>
              ) : (
                <div
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  data-ocid="candidate-report.skill_assessment_card.list"
                >
                  {mcqResults.map((result, idx) => {
                    const pct = Math.round((result.score / result.total) * 100);
                    const color =
                      pct >= 80
                        ? "text-success"
                        : pct >= 60
                          ? "text-warning"
                          : "text-destructive";
                    const barColor =
                      pct >= 80
                        ? "bg-success"
                        : pct >= 60
                          ? "bg-warning"
                          : "bg-destructive";
                    return (
                      <div
                        key={result.subject}
                        className="rounded-lg border border-border/60 p-4 space-y-2"
                        data-ocid={`candidate-report.skill_assessment_card.item.${idx + 1}`}
                      >
                        <p className="font-semibold text-sm">
                          {result.subject}
                        </p>
                        <p
                          className={`text-xl font-bold font-display ${color}`}
                        >
                          {result.score} / {result.total} correct
                        </p>
                        <Progress
                          value={pct}
                          className={`h-2 [&>div]:${barColor}`}
                        />
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${color}`}>
                            {pct}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(result.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Camera Integrity Section */}
      {proctoring && (
        <Card
          className="glass-card gradient-border-blue"
          data-ocid="candidate-report.integrity_card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              Camera Integrity Report
            </CardTitle>
            <CardDescription>
              Proctoring and monitoring summary for this session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Integrity score */}
            <div className="flex items-center justify-between rounded-lg bg-muted/30 border border-border/40 px-4 py-3">
              <span className="text-sm font-medium">Integrity Score</span>
              <span
                className={`text-xl font-bold font-display ${
                  integrityScore !== null && integrityScore >= 80
                    ? "text-success"
                    : integrityScore !== null && integrityScore >= 60
                      ? "text-warning"
                      : "text-destructive"
                }`}
              >
                {integrityScore ?? "—"}/100
              </span>
            </div>

            {/* Status rows */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Camera */}
              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Camera size={13} className="text-muted-foreground" />
                  <span>Camera</span>
                </div>
                {proctoring.cameraActive ? (
                  <Badge className="bg-success/10 text-success border-success/30 gap-1 text-xs">
                    <ShieldCheck size={10} />
                    Monitored
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-muted text-muted-foreground gap-1 text-xs"
                  >
                    Inactive
                  </Badge>
                )}
              </div>

              {/* Screen */}
              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Monitor size={13} className="text-muted-foreground" />
                  <span>Screen</span>
                </div>
                {proctoring.screenShareActive ? (
                  <Badge className="bg-success/10 text-success border-success/30 gap-1 text-xs">
                    <ShieldCheck size={10} />
                    Monitored
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-muted text-muted-foreground gap-1 text-xs"
                  >
                    Inactive
                  </Badge>
                )}
              </div>

              {/* Violations */}
              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <ShieldAlert size={13} className="text-muted-foreground" />
                  <span>Violations</span>
                </div>
                <Badge
                  className={`gap-1 text-xs ${
                    proctoring.violations === 0
                      ? "bg-success/10 text-success border-success/30"
                      : proctoring.violations <= 2
                        ? "bg-warning/10 text-warning border-warning/30"
                        : "bg-destructive/10 text-destructive border-destructive/30"
                  }`}
                >
                  {proctoring.violations}
                </Badge>
              </div>
            </div>

            {/* Snapshot thumbnails */}
            {proctoring.snapshots.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Camera size={11} />
                  {proctoring.snapshots.length} snapshot
                  {proctoring.snapshots.length === 1 ? "" : "s"} captured
                </p>
                <div className="flex gap-2 flex-wrap">
                  {proctoring.snapshots.slice(0, 5).map((src, i) => (
                    <img
                      // biome-ignore lint/suspicious/noArrayIndexKey: snapshots are indexed by capture order
                      key={i}
                      src={src}
                      alt={`Snapshot ${i + 1}`}
                      className="w-20 h-16 object-cover rounded border border-border/40"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Score Breakdown Table */}
      {sessionQuestions.length > 0 && (
        <Card
          className="glass-card gradient-border-blue"
          data-ocid="candidate-report.score_table"
        >
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <BrainCircuit size={16} className="text-primary" />
              Score Breakdown
            </CardTitle>
            <CardDescription>Per-question scores and timing</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground w-8">
                    #
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">
                    Question
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                    Difficulty
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">
                    Score
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {sessionQuestions.map((q, idx) => {
                  const answer = q ? answerMap.get(q.id.toString()) : undefined;
                  const score =
                    answer?.score !== undefined ? Number(answer.score) : null;
                  return (
                    <tr
                      key={
                        q
                          ? q.id.toString()
                          : `missing-${String(session.questionIds[idx])}`
                      }
                      className="hover:bg-muted/20 transition-colors"
                      data-ocid={`candidate-report.score_table.row.${idx + 1}`}
                    >
                      <td className="py-3 px-3 text-muted-foreground font-mono text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium leading-snug">
                          {q ? q.title : "Question unavailable"}
                        </span>
                      </td>
                      <td className="py-3 px-3 hidden sm:table-cell">
                        {q && (
                          <Badge
                            variant="outline"
                            className="text-xs border-border/60"
                          >
                            {q.category}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        {q && <DifficultyBadge difficulty={q.difficulty} />}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {score !== null ? (
                          <span
                            className={`font-bold font-mono ${getScoreColor(score)}`}
                          >
                            {score}/100
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right hidden sm:table-cell">
                        {answer ? (
                          <span className="text-xs text-muted-foreground font-mono flex items-center justify-end gap-1">
                            <Timer size={10} />
                            {formatTimeTaken(answer.timeTakenSeconds)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Answer Quality Chart */}
      {chartData.length > 0 && (
        <Card
          className="glass-card gradient-border-blue"
          data-ocid="candidate-report.chart_card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <BrainCircuit size={16} className="text-primary" />
              Answer Quality Chart
            </CardTitle>
            <CardDescription>
              Score distribution across questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 20, bottom: 4, left: 0 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={160}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}/100`, "Score"]}
                  contentStyle={{
                    fontSize: "12px",
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                  }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      // biome-ignore lint/suspicious/noArrayIndexKey: chart cells are indexed by position
                      key={`cell-${i}`}
                      fill={getBarFill(entry.score)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Full Answer Breakdown */}
      <Card
        className="glass-card gradient-border-blue"
        data-ocid="candidate-report.answer_breakdown_card"
      >
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <MessageSquare size={16} className="text-primary" />
            Full Answer Breakdown
          </CardTitle>
          <CardDescription>
            Detailed view of each question, your answer, and feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessionQuestions.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10 text-center"
              data-ocid="candidate-report.answers.empty_state"
            >
              <BrainCircuit className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No questions available.
              </p>
            </div>
          ) : (
            sessionQuestions.map((q, idx) => {
              const qKey = q
                ? q.id.toString()
                : `missing-${String(session.questionIds[idx])}`;
              const answer = q ? answerMap.get(q.id.toString()) : undefined;
              const answerScore =
                answer?.score !== undefined ? Number(answer.score) : null;
              const isOpen = openSections[qKey] ?? false;

              return (
                <Collapsible
                  key={qKey}
                  open={isOpen}
                  onOpenChange={(open) =>
                    setOpenSections((prev) => ({ ...prev, [qKey]: open }))
                  }
                >
                  <CollapsibleTrigger
                    className="w-full flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 px-4 py-3 transition-colors text-left"
                    data-ocid={`candidate-report.answer.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-sm truncate">
                        {q ? q.title : "Question unavailable"}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {q && <DifficultyBadge difficulty={q.difficulty} />}
                        {answerScore !== null && (
                          <Badge
                            variant="outline"
                            className={`text-xs font-bold ${
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
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-muted-foreground ml-2 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="mt-1 rounded-lg border border-border/40 bg-background p-4 space-y-3">
                      {/* Question description */}
                      {q && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Question
                          </p>
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {q.description}
                          </p>
                          {q.tags.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap mt-2">
                              {q.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {answer ? (
                        <>
                          {/* Answer text */}
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
                            Time taken:{" "}
                            {formatTimeTaken(answer.timeTakenSeconds)}
                          </div>

                          {/* Feedback */}
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
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Not answered
                        </p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Proctoring Event Timeline */}
      {proctoring && proctoring.events.length > 0 && (
        <Card
          className="glass-card gradient-border-blue"
          data-ocid="candidate-report.proctoring_timeline_card"
        >
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              Proctoring Event Timeline
            </CardTitle>
            <CardDescription>
              All monitoring events recorded during the session (
              {proctoring.events.length} events)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {proctoring.events.map((event, idx) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: events are append-only; index is stable
                  key={`evt-${idx}`}
                  className="flex items-start gap-2.5 text-xs py-1.5 border-b border-border/30 last:border-0"
                  data-ocid={`candidate-report.proctoring_event.item.${idx + 1}`}
                >
                  {getEventIcon(event.type)}
                  <span className="text-muted-foreground font-mono shrink-0 tabular-nums">
                    {formatEventTime(event.timestamp)}
                  </span>
                  <span className="text-foreground/80">{event.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
          .bg-background { background: white !important; }
        }
      `}</style>
    </div>
  );
}
