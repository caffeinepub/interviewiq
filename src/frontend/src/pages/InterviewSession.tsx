import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code,
  Loader2,
  PlayCircle,
  Send,
  Trophy,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { InterviewStatus } from "../backend.d";
import { DifficultyBadge, StatusBadge } from "../components/StatusBadge";
import {
  useGetAllQuestions,
  useGetSession,
  useStartSession,
  useSubmitAnswer,
  useSubmitSession,
} from "../hooks/useQueries";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function InterviewSession() {
  const { id } = useParams({ from: "/session/$id" });
  const sessionId = BigInt(id);

  const { data: session, isLoading: loadingSession } = useGetSession(sessionId);
  const { data: allQuestions, isLoading: loadingQuestions } =
    useGetAllQuestions();
  const startSession = useStartSession();
  const submitAnswer = useSubmitAnswer();
  const submitSession = useSubmitSession();

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Set<string>>(
    new Set(),
  );
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [_questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now(),
  );
  const [showCodeMode, setShowCodeMode] = useState(false);
  const questionStartRef = useRef<number>(Date.now());

  const sessionQuestions = (session?.questionIds ?? []).map((qId) =>
    (allQuestions ?? []).find((q) => q.id === qId),
  );

  // Initialize timer
  useEffect(() => {
    if (
      session?.status === InterviewStatus.inProgress &&
      session.timeLimitMinutes
    ) {
      const totalSeconds = Number(session.timeLimitMinutes) * 60;
      if (session.startTime) {
        const elapsed = Math.floor(
          (Date.now() - Number(session.startTime) / 1_000_000) / 1000,
        );
        setTimeLeft(Math.max(0, totalSeconds - elapsed));
      } else {
        setTimeLeft(totalSeconds);
      }
    }
  }, [session?.status, session?.timeLimitMinutes, session?.startTime]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && session?.status === InterviewStatus.inProgress) {
      toast.warning("Time's up! Submitting your interview.");
      void handleSubmitSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, session?.status]);

  const handleStart = async () => {
    try {
      await startSession.mutateAsync(sessionId);
      setQuestionStartTime(Date.now());
      questionStartRef.current = Date.now();
      toast.success("Interview started! Good luck.");
    } catch (err) {
      toast.error("Failed to start session.");
      console.error(err);
    }
  };

  const handleSubmitAnswer = async () => {
    const currentQ = sessionQuestions[currentQuestionIdx];
    if (!currentQ) return;

    const qId = currentQ.id.toString();
    const answerText = answers[qId] ?? "";

    if (!answerText.trim()) {
      toast.warning("Please write an answer before submitting.");
      return;
    }

    const timeTaken = Math.floor(
      (Date.now() - questionStartRef.current) / 1000,
    );

    try {
      await submitAnswer.mutateAsync({
        sessionId,
        questionId: currentQ.id,
        answerText,
        timeTakenSeconds: BigInt(timeTaken),
      });
      setSubmittedAnswers((prev) => new Set([...prev, qId]));
      toast.success("Answer submitted!");

      if (currentQuestionIdx < sessionQuestions.length - 1) {
        setCurrentQuestionIdx((prev) => prev + 1);
        questionStartRef.current = Date.now();
        setQuestionStartTime(Date.now());
      }
    } catch (err) {
      toast.error("Failed to submit answer.");
      console.error(err);
    }
  };

  const handleSubmitSession = useCallback(async () => {
    try {
      await submitSession.mutateAsync(sessionId);
      toast.success("Interview submitted! Awaiting evaluation.");
    } catch (err) {
      toast.error("Failed to submit interview.");
      console.error(err);
    }
  }, [sessionId, submitSession]);

  const isLoading = loadingSession || loadingQuestions;

  if (isLoading) {
    return (
      <div
        className="container py-8 space-y-4"
        data-ocid="session.loading_state"
      >
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-1" />
          <Skeleton className="h-80 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container py-8" data-ocid="session.error_state">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Session not found. It may have been deleted or the ID is invalid.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Completed/Evaluated
  if (
    session.status === InterviewStatus.completed ||
    session.status === InterviewStatus.evaluated
  ) {
    return (
      <div className="container py-16 flex justify-center">
        <Card className="w-full max-w-lg border-border/60 text-center">
          <CardContent className="pt-12 pb-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Trophy className="h-8 w-8 text-success" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              Interview Complete!
            </h2>
            <p className="text-muted-foreground mb-2">
              Your responses have been recorded.
            </p>
            {session.overallScore !== undefined && (
              <div className="mt-4 mb-6">
                <div className="font-display text-5xl font-bold text-primary">
                  {Number(session.overallScore)}
                </div>
                <div className="text-sm text-muted-foreground">
                  / 100 Overall Score
                </div>
              </div>
            )}
            <StatusBadge status={session.status} />
            {session.feedback && (
              <div className="mt-6 rounded-lg bg-muted/40 p-4 text-left">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Evaluator Feedback
                </p>
                <p className="text-sm">{session.feedback}</p>
              </div>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/session/$id/report" params={{ id }}>
                  View Full Report
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/candidate">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Scheduled (not yet started)
  if (session.status === InterviewStatus.scheduled) {
    return (
      <div className="container py-16 flex justify-center">
        <Card className="w-full max-w-lg border-border/60 text-center">
          <CardContent className="pt-12 pb-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <PlayCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              Ready to Start?
            </h2>
            <p className="text-muted-foreground mb-6">
              This interview has{" "}
              <strong>{session.questionIds.length} questions</strong> with a{" "}
              <strong>{Number(session.timeLimitMinutes)} minute</strong> time
              limit.
            </p>
            <div className="mb-8 rounded-lg bg-warning/5 border border-warning/20 p-4 text-sm text-left space-y-1.5">
              <p className="font-medium text-warning">Before you begin:</p>
              <p className="text-muted-foreground">
                • Once started, the timer begins immediately
              </p>
              <p className="text-muted-foreground">
                • Submit each answer before moving to the next
              </p>
              <p className="text-muted-foreground">
                • Your session is auto-submitted when time expires
              </p>
            </div>
            <Button
              onClick={handleStart}
              disabled={startSession.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="session.start_button"
            >
              {startSession.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting…
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Interview
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" asChild className="mt-3">
              <Link to="/candidate">
                <ArrowLeft size={14} className="mr-1" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // In Progress
  const currentQ = sessionQuestions[currentQuestionIdx];
  const currentQId = currentQ?.id.toString();
  const progressPct = (submittedAnswers.size / sessionQuestions.length) * 100;
  const allAnswered = submittedAnswers.size >= sessionQuestions.length;
  const isTimeCritical = timeLeft !== null && timeLeft < 120;

  return (
    <div className="container py-6 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="border-primary/30 text-primary bg-primary/5"
          >
            Session #{id}
          </Badge>
          <StatusBadge status={session.status} />
        </div>

        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <div
              className={cn(
                "flex items-center gap-1.5 font-mono text-sm font-semibold px-3 py-1 rounded-lg",
                isTimeCritical
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-foreground",
              )}
            >
              <Clock size={13} />
              {formatTime(timeLeft)}
            </div>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={submitSession.isPending}
                className="border-border/60"
                data-ocid="session.submit_session_button"
              >
                {submitSession.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send size={13} className="mr-1.5" />
                )}
                Submit Interview
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="session.submit_dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Interview?</AlertDialogTitle>
                <AlertDialogDescription>
                  You've answered {submittedAnswers.size} of{" "}
                  {sessionQuestions.length} questions. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="session.submit_cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSubmitSession}
                  data-ocid="session.submit_confirm_button"
                >
                  Submit Interview
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>
            {submittedAnswers.size} / {sessionQuestions.length} answered
          </span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Question List Sidebar */}
        <Card className="border-border/60 self-start">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-sm">Questions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {sessionQuestions.map((q, idx) => {
                if (!q) return null;
                const qId = q.id.toString();
                const isSubmitted = submittedAnswers.has(qId);
                const isCurrent = idx === currentQuestionIdx;
                return (
                  <button
                    type="button"
                    key={qId}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                      isCurrent ? "bg-primary/8" : "hover:bg-accent/30",
                    )}
                    data-ocid={`session.question.item.${idx + 1}`}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        isSubmitted
                          ? "bg-success/10 text-success"
                          : isCurrent
                            ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isSubmitted ? <CheckCircle2 size={12} /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{q.title}</p>
                      <DifficultyBadge difficulty={q.difficulty} />
                    </div>
                    {isCurrent && (
                      <ChevronRight
                        size={12}
                        className="text-primary shrink-0"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Current Question Panel */}
        {currentQ ? (
          <div className="space-y-4">
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        Q{currentQuestionIdx + 1} of {sessionQuestions.length}
                      </span>
                      <DifficultyBadge difficulty={currentQ.difficulty} />
                      <Badge
                        variant="outline"
                        className="text-xs border-border/60"
                      >
                        {currentQ.category}
                      </Badge>
                    </div>
                    <CardTitle className="font-display text-lg">
                      {currentQ.title}
                    </CardTitle>
                  </div>
                  {currentQId && submittedAnswers.has(currentQId) && (
                    <Badge className="bg-success/10 text-success border-success/30 shrink-0">
                      <CheckCircle2 size={11} className="mr-1" />
                      Submitted
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {currentQ.description}
                  </p>
                </div>

                {currentQ.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-4">
                    {currentQ.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Answer Panel */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-sm">
                    Your Answer
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 gap-1"
                    onClick={() => setShowCodeMode((p) => !p)}
                  >
                    <Code size={12} />
                    {showCodeMode ? "Text Mode" : "Code Mode"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder={
                    showCodeMode
                      ? "// Write your code solution here..."
                      : "Describe your approach, explain your reasoning, and provide examples..."
                  }
                  value={currentQId ? (answers[currentQId] ?? "") : ""}
                  onChange={(e) => {
                    if (!currentQId) return;
                    setAnswers((prev) => ({
                      ...prev,
                      [currentQId]: e.target.value,
                    }));
                  }}
                  disabled={
                    currentQId ? submittedAnswers.has(currentQId) : false
                  }
                  className={cn(
                    "min-h-[200px] resize-y",
                    showCodeMode && "font-mono text-sm",
                  )}
                  data-ocid="session.answer_textarea"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {currentQId && answers[currentQId]
                      ? `${answers[currentQId].length} characters`
                      : "Start typing your answer"}
                  </p>
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={
                      submitAnswer.isPending ||
                      (currentQId ? submittedAnswers.has(currentQId) : false) ||
                      !currentQId ||
                      !(answers[currentQId] ?? "").trim()
                    }
                    size="sm"
                    className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                    data-ocid="session.submit_answer_button"
                  >
                    {submitAnswer.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : currentQId && submittedAnswers.has(currentQId) ? (
                      <>
                        <CheckCircle2 size={13} />
                        Submitted
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        Submit Answer
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                disabled={currentQuestionIdx === 0}
                className="border-border/60"
              >
                <ArrowLeft size={13} className="mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {allAnswered
                  ? "All answered — submit when ready"
                  : `${sessionQuestions.length - submittedAnswers.size} remaining`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentQuestionIdx((p) =>
                    Math.min(sessionQuestions.length - 1, p + 1),
                  )
                }
                disabled={currentQuestionIdx === sessionQuestions.length - 1}
                className="border-border/60"
              >
                Next
                <ChevronRight size={13} className="ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center h-64"
            data-ocid="session.empty_state"
          >
            <BrainCircuit className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No questions in this session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
