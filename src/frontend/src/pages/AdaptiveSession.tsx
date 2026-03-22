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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  Camera,
  CameraOff,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code,
  FileText,
  Gauge,
  Loader2,
  Mic,
  MicOff,
  MinimizeIcon,
  Monitor,
  MonitorOff,
  PlayCircle,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  Volume2,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Question } from "../backend.d";
import { Difficulty, InterviewStatus } from "../backend.d";
import { useCamera } from "../camera/useCamera";
import { useScreenShare } from "../camera/useScreenShare";
import { DifficultyBadge } from "../components/StatusBadge";
import {
  useGetAllQuestions,
  useGetSession,
  useSelfRegisterAsUser,
  useStartSession,
  useSubmitAnswer,
  useSubmitSession,
} from "../hooks/useQueries";
import { useSpeech } from "../hooks/useSpeech";
import {
  getAdaptiveNextQuestion,
  getIntelligentScore,
} from "../utils/adaptiveEngine";
import { generateFollowUpQuestion } from "../utils/generativeEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

type CodeLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "go";

const CODE_LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
];

const CODE_PLACEHOLDERS: Record<CodeLanguage, string> = {
  javascript:
    "// Write your JavaScript solution here...\nfunction solution() {\n  \n}",
  typescript:
    "// Write your TypeScript solution here...\nfunction solution(): void {\n  \n}",
  python: "# Write your Python solution here\ndef solution():\n    pass",
  java: "// Write your Java solution here\npublic class Solution {\n    public void solve() {\n        \n    }\n}",
  cpp: "// Write your C++ solution here\n#include <iostream>\nusing namespace std;\n\nvoid solution() {\n    \n}",
  go: "// Write your Go solution here\npackage main\n\nfunc solution() {\n\t\n}",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case Difficulty.easy:
      return "bg-success";
    case Difficulty.medium:
      return "bg-warning";
    case Difficulty.hard:
      return "bg-destructive";
    default:
      return "bg-muted";
  }
}

function getDifficultyGlowClass(difficulty: Difficulty): string {
  switch (difficulty) {
    case Difficulty.easy:
      return "ring-success/40 shadow-success/10";
    case Difficulty.medium:
      return "ring-warning/40 shadow-warning/10";
    case Difficulty.hard:
      return "ring-destructive/40 shadow-destructive/10";
    default:
      return "ring-border/40";
  }
}

// ─── Performance Meter ───────────────────────────────────────────────────────

interface PerformanceMeterProps {
  runningScores: number[];
  performanceTrend: Difficulty[];
}

function PerformanceMeter({
  runningScores,
  performanceTrend,
}: PerformanceMeterProps) {
  const avgScore =
    runningScores.length === 0
      ? 0
      : Math.round(
          runningScores.reduce((a, b) => a + b, 0) / runningScores.length,
        );

  const barColor =
    avgScore < 40
      ? "from-destructive to-destructive/80"
      : avgScore <= 70
        ? "from-warning to-warning/80"
        : "from-success to-success/80";

  const levelLabel =
    avgScore < 40
      ? "Needs Improvement"
      : avgScore <= 70
        ? "On Track"
        : "Excellent";
  const levelColor =
    avgScore < 40
      ? "text-destructive"
      : avgScore <= 70
        ? "text-warning"
        : "text-success";

  return (
    <div
      className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
      data-ocid="adaptive-session.performance_meter"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Gauge size={13} className="text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Performance Level
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold ${levelColor}`}>
            {levelLabel}
          </span>
          {runningScores.length > 0 && (
            <span className="text-xs text-muted-foreground font-mono">
              {avgScore}/100
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
          style={{ width: `${avgScore}%` }}
        />
      </div>

      {/* Difficulty trend dots */}
      {performanceTrend.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Difficulty:</span>
          <div className="flex items-center gap-1">
            {performanceTrend.map((diff, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: append-only trend list; index is stable position
                key={`trend-${i}`}
                title={diff}
                className={`h-2.5 w-2.5 rounded-full ${getDifficultyColor(diff)} opacity-80`}
              />
            ))}
          </div>
          {performanceTrend.length > 0 && (
            <span className="text-xs text-muted-foreground ml-1">
              (
              {performanceTrend[performanceTrend.length - 1] === Difficulty.hard
                ? "↑ Getting harder"
                : performanceTrend[performanceTrend.length - 1] ===
                    Difficulty.easy
                  ? "↓ Getting easier"
                  : "→ Balanced"}
              )
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AI Adapting Card ──────────────────────────────────────────────────────────

interface AdaptingCardProps {
  score: number;
  keywords: string[];
  nextDifficulty: Difficulty | null;
}

function AdaptingCard({ score, keywords, nextDifficulty }: AdaptingCardProps) {
  const scoreColor =
    score >= 70
      ? "text-success"
      : score >= 50
        ? "text-warning"
        : "text-destructive";

  return (
    <div
      className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/8 to-background p-8 text-center space-y-5"
      data-ocid="adaptive-session.adapting_state"
    >
      {/* Spinning brain */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20 mx-auto">
            <BrainCircuit
              className="h-10 w-10 text-primary animate-pulse"
              style={{ animationDuration: "1s" }}
            />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary/60 animate-spin" />
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-bold text-foreground mb-1">
          AI is Adapting...
        </h3>
        <p className="text-sm text-muted-foreground">
          Analyzing your response and selecting the next question
        </p>
      </div>

      {/* Score preview */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-left space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            Answer Score
          </span>
          <span className={`text-2xl font-bold font-display ${scoreColor}`}>
            {score}
            <span className="text-sm text-muted-foreground font-normal">
              /100
            </span>
          </span>
        </div>

        {keywords.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">
              Keywords detected ({keywords.length}):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {keywords.slice(0, 6).map((kw) => (
                <Badge
                  key={kw}
                  variant="outline"
                  className="text-xs border-primary/30 text-primary bg-primary/5"
                >
                  {kw}
                </Badge>
              ))}
              {keywords.length > 6 && (
                <Badge
                  variant="outline"
                  className="text-xs border-border/60 text-muted-foreground"
                >
                  +{keywords.length - 6}
                </Badge>
              )}
            </div>
          </div>
        )}

        {nextDifficulty && (
          <div className="flex items-center gap-2 pt-1">
            <TrendingUp size={13} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Next question:
            </span>
            <DifficultyBadge difficulty={nextDifficulty} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Camera Panel ──────────────────────────────────────────────────────────────

interface CameraPanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isActive: boolean;
  isLoading: boolean;
  error: { type: string; message: string } | null;
  onEnable: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function CameraPanel({
  videoRef,
  canvasRef,
  isActive,
  isLoading,
  error,
  onEnable,
  collapsed,
  onToggleCollapse,
}: CameraPanelProps) {
  return (
    <div
      className={cn(
        "fixed top-[5rem] right-4 z-40 rounded-xl overflow-hidden shadow-lg border border-border/60 bg-card transition-all duration-300",
        collapsed ? "w-10 h-10" : "w-[200px]",
      )}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full h-full flex items-center justify-center hover:bg-accent/20 transition-colors"
          aria-label="Expand camera panel"
        >
          <Camera
            size={16}
            className={isActive ? "text-success" : "text-muted-foreground"}
          />
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between px-2 py-1.5 bg-card/90 backdrop-blur-sm border-b border-border/40">
            <div className="flex items-center gap-1">
              <Camera
                size={11}
                className={isActive ? "text-success" : "text-muted-foreground"}
              />
              <span className="text-[10px] font-medium text-muted-foreground">
                {isActive ? "Proctored" : "Camera"}
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Collapse camera panel"
            >
              <MinimizeIcon size={10} />
            </button>
          </div>
          <div
            className="relative bg-zinc-900"
            style={{ width: 200, height: 150 }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{
                transform: "scaleX(-1)",
                display: isActive ? "block" : "none",
              }}
            />
            <canvas ref={canvasRef} className="hidden" />
            {!isActive && !isLoading && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2">
                <CameraOff size={20} className="text-zinc-500" />
                <button
                  type="button"
                  onClick={onEnable}
                  className="text-[10px] text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                >
                  Enable camera
                </button>
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
                <Loader2 size={18} className="animate-spin text-primary" />
              </div>
            )}
            {error && !isActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2">
                <CameraOff size={16} className="text-destructive" />
                <span className="text-[9px] text-destructive text-center leading-tight">
                  {error.type === "permission"
                    ? "Permission denied"
                    : error.message}
                </span>
              </div>
            )}
            {isActive && (
              <div className="absolute top-1 left-1 flex items-center gap-1 bg-black/50 rounded-full px-1.5 py-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[9px] text-white font-medium">LIVE</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Screen Share Panel ────────────────────────────────────────────────────────

interface ScreenSharePanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  onEnable: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function ScreenSharePanel({
  videoRef,
  isActive,
  isLoading,
  error,
  onEnable,
  collapsed,
  onToggleCollapse,
}: ScreenSharePanelProps) {
  return (
    <div
      className={cn(
        "fixed top-[5rem] right-[220px] z-40 rounded-xl overflow-hidden shadow-lg border border-border/60 bg-card transition-all duration-300",
        collapsed ? "w-10 h-10" : "w-[200px]",
      )}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full h-full flex items-center justify-center hover:bg-accent/20 transition-colors"
          aria-label="Expand screen share panel"
        >
          <Monitor
            size={16}
            className={isActive ? "text-success" : "text-muted-foreground"}
          />
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between px-2 py-1.5 bg-card/90 backdrop-blur-sm border-b border-border/40">
            <div className="flex items-center gap-1">
              <Monitor
                size={11}
                className={isActive ? "text-success" : "text-muted-foreground"}
              />
              <span className="text-[10px] font-medium text-muted-foreground">
                Screen
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Collapse screen share"
            >
              <MinimizeIcon size={10} />
            </button>
          </div>
          <div
            className="relative bg-zinc-950"
            style={{ width: 200, height: 150 }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
              style={{ display: isActive ? "block" : "none" }}
            />
            {!isActive && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2">
                <MonitorOff size={20} className="text-zinc-600" />
                {error ? (
                  <span className="text-[9px] text-destructive text-center leading-tight">
                    {error}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onEnable}
                    className="text-[10px] text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                  >
                    Share Screen
                  </button>
                )}
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80">
                <Loader2 size={18} className="animate-spin text-primary" />
              </div>
            )}
            {isActive && (
              <div className="absolute top-1 left-1 flex items-center gap-1 bg-black/50 rounded-full px-1.5 py-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[9px] text-white font-medium">LIVE</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const MAX_QUESTIONS = 10;

export function AdaptiveSession() {
  const { id } = useParams({ from: "/adaptive-session/$id" });
  const sessionId = BigInt(id);
  const navigate = useNavigate();

  const { data: session } = useGetSession(sessionId);
  const { data: allQuestions } = useGetAllQuestions();
  const selfRegister = useSelfRegisterAsUser();
  const startSession = useStartSession();
  const submitAnswer = useSubmitAnswer();
  const submitSession = useSubmitSession();

  // ── Adaptive state ──
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answeredIds, setAnsweredIds] = useState<bigint[]>([]);
  const [runningScores, setRunningScores] = useState<number[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptingFeedback, setAdaptingFeedback] = useState<{
    score: number;
    keywords: string[];
  } | null>(null);
  const [nextDifficulty, setNextDifficulty] = useState<Difficulty | null>(null);
  const [performanceTrend, setPerformanceTrend] = useState<Difficulty[]>([]);

  // Answered questions for sidebar display
  const [answeredQuestionsList, setAnsweredQuestionsList] = useState<
    Array<{ question: Question; score: number }>
  >([]);

  // ── Session state ──
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const questionStartRef = useRef<number>(Date.now());

  // ── Code editor state ──
  const [showCodeMode, setShowCodeMode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>("javascript");
  const [verbalMode] = useState(
    () => sessionStorage.getItem("verbalMode") === "1",
  );
  const [followUpCard, setFollowUpCard] = useState<{
    question: string;
    answer: string;
  } | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const speech = useSpeech();

  // ── Camera/proctoring state ──
  const camera = useCamera({ facingMode: "user", width: 320, height: 240 });
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraCollapsed, setCameraCollapsed] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const screenShare = useScreenShare();
  const [screenShareCollapsed, setScreenShareCollapsed] = useState(false);
  const [violations, setViolations] = useState(0);
  const violationsRef = useRef(0);
  const autoSubmittedRef = useRef(false);

  // ── Grace period ──
  const [graceExpired, setGraceExpired] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGraceExpired(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const isInProgress = session?.status === InterviewStatus.inProgress;

  // ── Pool of session questions for adaptive engine ──
  const sessionQuestions = (session?.questionIds ?? [])
    .map((qId) => (allQuestions ?? []).find((q) => q.id === qId))
    .filter((q): q is Question => !!q);

  // ── Initialize timer ──
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

  // ── Countdown ──
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

  // ── Auto-submit on time out ──
  useEffect(() => {
    if (timeLeft === 0 && session?.status === InterviewStatus.inProgress) {
      toast.warning("Time's up! Submitting your session.");
      void handleSubmitSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, session?.status]);

  // ── Anti-cheat ──
  useEffect(() => {
    if (!isInProgress) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        violationsRef.current += 1;
        setViolations(violationsRef.current);
        toast.warning("⚠️ Warning: Leaving the exam window has been flagged!", {
          id: "anticheat-warning",
          duration: 4000,
        });
      }
    };

    const handleBlur = () => {
      if (document.visibilityState === "visible") {
        violationsRef.current += 1;
        setViolations(violationsRef.current);
        toast.warning("⚠️ Warning: Leaving the exam window has been flagged!", {
          id: "anticheat-warning",
          duration: 4000,
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isInProgress]);

  // ── Auto-submit at 5 violations ──
  useEffect(() => {
    if (
      violations >= 5 &&
      session?.status === InterviewStatus.inProgress &&
      !autoSubmittedRef.current
    ) {
      autoSubmittedRef.current = true;
      toast.error("Too many violations. Session auto-submitting.", {
        duration: 6000,
      });
      void handleSubmitSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [violations, session?.status]);

  const handleRequestCamera = async () => {
    setCameraEnabled(true);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 50));
    const ok = await camera.startCamera();
    if (!ok) {
      const errType = camera.error?.type;
      if (errType === "permission") {
        setPermissionDenied(true);
        toast.warning("Camera permission denied.");
      } else if (errType === "not-found") {
        toast.error("No camera found on this device.");
      } else if (camera.error) {
        toast.error(camera.error.message);
      }
    }
  };

  // ── Start interview ──
  const handleStart = async () => {
    try {
      try {
        await selfRegister.mutateAsync();
      } catch (_) {
        // already registered
      }
      await startSession.mutateAsync(sessionId);
      questionStartRef.current = Date.now();
      toast.success("Adaptive interview started!");

      // Pick the first question (adaptive engine selects based on performance)
      const firstQuestion = getAdaptiveNextQuestion(sessionQuestions, [], []);
      setCurrentQuestion(firstQuestion);

      if (cameraEnabled && !camera.isActive) {
        void camera.startCamera();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to start session. Please try again.");
    }
  };

  // ── Submit individual answer ──
  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;

    const answerText = currentAnswer.trim();
    if (!answerText) {
      toast.warning("Please write an answer before submitting.");
      return;
    }

    const timeTaken = Math.floor(
      (Date.now() - questionStartRef.current) / 1000,
    );

    try {
      // Submit to backend
      await submitAnswer.mutateAsync({
        sessionId,
        questionId: currentQuestion.id,
        answerText,
        timeTakenSeconds: BigInt(timeTaken),
      });

      // Score locally
      const {
        score,
        keywords,
        feedback: _feedback,
      } = getIntelligentScore(answerText, currentQuestion.title);

      const newAnsweredIds = [...answeredIds, currentQuestion.id];
      const newRunningScores = [...runningScores, score];
      const newTrend = [...performanceTrend, currentQuestion.difficulty];

      setAnsweredIds(newAnsweredIds);
      setRunningScores(newRunningScores);
      setPerformanceTrend(newTrend);
      setAnsweredQuestionsList((prev) => [
        ...prev,
        { question: currentQuestion, score },
      ]);

      // Show AI follow-up card before adapting animation
      const followUp = generateFollowUpQuestion(currentQuestion, answerText);
      setFollowUpCard({ question: followUp, answer: "" });
      setFollowUpAnswer("");

      // Show adapting animation
      setAdaptingFeedback({ score, keywords });

      // Preview next difficulty for UI
      const nextQ = getAdaptiveNextQuestion(
        sessionQuestions,
        newAnsweredIds,
        newRunningScores,
      );
      setNextDifficulty(nextQ?.difficulty ?? null);
      setIsAdapting(true);
      setCurrentAnswer("");

      // Wait 1.5s for animation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check if done
      if (
        !nextQ ||
        newAnsweredIds.length >= MAX_QUESTIONS ||
        newAnsweredIds.length >= sessionQuestions.length
      ) {
        setIsAdapting(false);
        toast.success("All questions answered! Submitting...");
        await handleSubmitSession(true);
        return;
      }

      setCurrentQuestion(nextQ);
      setIsAdapting(false);
      setAdaptingFeedback(null);
      setNextDifficulty(null);
      questionStartRef.current = Date.now();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit answer. Please try again.");
      setIsAdapting(false);
    }
  };

  const handleFollowUpDone = () => {
    setFollowUpCard(null);
    setFollowUpAnswer("");
  };

  const handleToggleMic = () => {
    if (speech.isListening) {
      speech.stopListening();
    } else {
      speech.clearTranscript();
      speech.startListening();
    }
  };

  // ── Submit session ──
  const handleSubmitSession = useCallback(
    async (autoSubmit = false) => {
      if (camera.isActive) void camera.stopCamera();
      if (screenShare.isActive) void screenShare.stopScreenShare();

      try {
        await submitSession.mutateAsync(sessionId);
        if (!autoSubmit) toast.success("Session submitted! Viewing results...");
        void navigate({
          to: "/assessment/results/$id",
          params: { id },
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to submit session. Please try again.");
      }
    },
    [sessionId, submitSession, navigate, id, camera, screenShare],
  );

  // ── Auto-speak question when verbalMode is on ──
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (verbalMode && speech.isSupported && currentQuestion) {
      speech.speak(`${currentQuestion.title}. ${currentQuestion.description}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.id]);

  // ── Sync speech transcript to answer ──
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (speech.transcript && speech.isListening) {
      if (followUpCard) {
        setFollowUpAnswer(speech.transcript);
      } else {
        setCurrentAnswer(speech.transcript);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.transcript]);

  // ── Code editor tab handler ──
  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = `${currentAnswer.substring(0, start)}  ${currentAnswer.substring(end)}`;
      setCurrentAnswer(newValue);
      requestAnimationFrame(() => {
        target.selectionStart = start + 2;
        target.selectionEnd = start + 2;
      });
    }
  };

  // ── Loading ──
  if (!session) {
    if (!graceExpired) {
      return (
        <div
          className="container py-8 space-y-4"
          data-ocid="adaptive-session.loading_state"
        >
          <Skeleton className="h-8 w-56" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-80 lg:col-span-1" />
            <Skeleton className="h-80 lg:col-span-2" />
          </div>
        </div>
      );
    }
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Session not found. Please go back and start a new adaptive
            assessment.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/adaptive-assessment">
              <ArrowLeft size={13} className="mr-1" />
              Back to Adaptive Assessment
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Completed ──
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
              Adaptive Session Complete!
            </h2>
            <p className="text-muted-foreground mb-6">
              You answered {answeredQuestionsList.length} adaptive questions.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/assessment/results/$id" params={{ id }}>
                  View Results
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

  // ── Scheduled: Pre-session start screen ──
  if (session.status === InterviewStatus.scheduled) {
    return (
      <div
        className="container py-16 flex justify-center"
        data-ocid="adaptive-session.page"
      >
        <Card className="w-full max-w-lg border-border/60">
          <CardContent className="pt-12 pb-10">
            <div className="text-center mb-8">
              <div className="relative mx-auto mb-5 w-fit">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Sparkles size={10} className="text-primary-foreground" />
                </div>
              </div>
              <Badge
                variant="outline"
                className="mb-3 border-primary/40 bg-primary/5 text-primary text-xs gap-1"
              >
                <Zap size={10} />
                Generative AI Powered
              </Badge>
              <h2 className="font-display text-2xl font-bold mb-2">
                Adaptive AI Interview
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {session.questionIds.length} questions available · Up to{" "}
                {MAX_QUESTIONS} adaptive questions ·{" "}
                {Number(session.timeLimitMinutes)} min limit
              </p>
            </div>

            {/* Rules */}
            <div className="mb-5 rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm space-y-2">
              <p className="font-semibold text-primary text-sm mb-2">
                How adaptive mode works:
              </p>
              {[
                "First question is medium difficulty",
                "Score high → next question gets harder",
                "Score low → easier question to rebuild confidence",
                "Keyword analysis improves accuracy",
                "Up to 10 questions total",
              ].map((rule) => (
                <div key={rule} className="flex items-start gap-2 text-xs">
                  <CheckCircle2
                    size={12}
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span className="text-muted-foreground">{rule}</span>
                </div>
              ))}
            </div>

            {/* Camera opt-in */}
            <div className="mb-4 rounded-xl bg-muted/30 border border-border/40 p-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Camera size={15} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">Camera Proctoring</p>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Optionally enable camera for proctored session.
                  </p>
                  {camera.isActive ? (
                    <Badge className="bg-success/10 text-success border-success/30 gap-1.5 text-xs">
                      <ShieldCheck size={11} />
                      Camera Active
                    </Badge>
                  ) : permissionDenied ? (
                    <Badge
                      variant="outline"
                      className="border-warning/40 text-warning gap-1.5 text-xs"
                    >
                      Camera denied
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRequestCamera}
                      disabled={camera.isLoading}
                      className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5 text-xs h-7"
                    >
                      {camera.isLoading ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Camera size={11} />
                      )}
                      Enable Camera
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Screen Share opt-in */}
            <div className="mb-6 rounded-xl bg-muted/30 border border-border/40 p-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Monitor size={15} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">
                    Screen Share Proctoring
                  </p>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Share your screen for full computer monitoring.
                  </p>
                  {screenShare.isActive ? (
                    <Badge className="bg-success/10 text-success border-success/30 gap-1.5 text-xs">
                      <ShieldCheck size={11} />
                      Screen Sharing Active
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void screenShare.startScreenShare()}
                      disabled={screenShare.isLoading}
                      className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5 text-xs h-7"
                    >
                      {screenShare.isLoading ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Monitor size={11} />
                      )}
                      Enable Screen Share
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleStart}
              disabled={startSession.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              data-ocid="adaptive-session.start_button"
            >
              {startSession.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting…
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  Start Adaptive Interview
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" asChild className="w-full mt-3">
              <Link to="/adaptive-assessment">
                <ArrowLeft size={14} className="mr-1" />
                Back
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── In Progress ──
  const isTimeCritical = timeLeft !== null && timeLeft < 120;
  const questionNumber = answeredIds.length + 1;
  const selectedLang = CODE_LANGUAGES.find((l) => l.value === codeLanguage);

  return (
    <div className="container py-6 space-y-4" data-ocid="adaptive-session.page">
      {/* Camera panel */}
      {(cameraEnabled || camera.isActive) && (
        <CameraPanel
          videoRef={camera.videoRef}
          canvasRef={camera.canvasRef}
          isActive={camera.isActive}
          isLoading={camera.isLoading}
          error={camera.error}
          onEnable={() => void camera.startCamera()}
          collapsed={cameraCollapsed}
          onToggleCollapse={() => setCameraCollapsed((p) => !p)}
        />
      )}

      {/* Screen share panel */}
      {screenShare.isActive && (
        <ScreenSharePanel
          videoRef={screenShare.videoRef}
          isActive={screenShare.isActive}
          isLoading={screenShare.isLoading}
          error={screenShare.error}
          onEnable={() => void screenShare.startScreenShare()}
          collapsed={screenShareCollapsed}
          onToggleCollapse={() => setScreenShareCollapsed((p) => !p)}
        />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="border-primary/30 text-primary bg-primary/5 gap-1"
          >
            <BrainCircuit size={11} />
            Adaptive Session
          </Badge>
          <Badge
            variant="outline"
            className="border-primary/20 text-muted-foreground gap-1 text-xs"
          >
            Q{questionNumber} of up to {MAX_QUESTIONS}
          </Badge>
          {camera.isActive && (
            <Badge className="bg-success/10 text-success border-success/30 gap-1 text-xs">
              <ShieldCheck size={10} />
              Proctored
            </Badge>
          )}
          {violations > 0 && (
            <Badge
              className={cn(
                "gap-1 text-xs",
                violations >= 3
                  ? "bg-destructive/10 text-destructive border-destructive/30"
                  : "bg-warning/10 text-warning border-warning/30",
              )}
              data-ocid="adaptive-session.violations_badge"
            >
              <ShieldAlert size={10} />
              Violations: {violations}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
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
                data-ocid="adaptive-session.finish_button"
              >
                {submitSession.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send size={13} className="mr-1.5" />
                )}
                Finish &amp; Submit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Adaptive Session?</AlertDialogTitle>
                <AlertDialogDescription>
                  You've answered {answeredIds.length} of up to {MAX_QUESTIONS}{" "}
                  questions. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void handleSubmitSession()}>
                  Submit Session
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Performance Meter */}
      <PerformanceMeter
        runningScores={runningScores}
        performanceTrend={performanceTrend}
      />

      {/* Main content */}
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        {/* Sidebar: answered questions */}
        <Card className="border-border/60 self-start">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-sm flex items-center gap-1.5">
              <Sparkles size={13} className="text-primary" />
              Answered ({answeredIds.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {answeredQuestionsList.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                Answer your first question to see progress
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {answeredQuestionsList.map(({ question, score }, idx) => (
                  <div
                    key={question.id.toString()}
                    className="flex items-center gap-3 px-4 py-3"
                    data-ocid={`adaptive-session.question.item.${idx + 1}`}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                      <CheckCircle2 size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {question.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <DifficultyBadge difficulty={question.difficulty} />
                        <span
                          className={cn(
                            "text-xs font-mono font-bold",
                            score >= 70
                              ? "text-success"
                              : score >= 50
                                ? "text-warning"
                                : "text-destructive",
                          )}
                        >
                          {score}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={12}
                      className="text-muted-foreground shrink-0"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming slot */}
            {answeredIds.length < MAX_QUESTIONS &&
              currentQuestion &&
              !isAdapting && (
                <div className="border-t border-border/60 px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Now answering:
                  </p>
                  <p className="text-xs font-medium truncate text-foreground">
                    {currentQuestion.title}
                  </p>
                  <DifficultyBadge difficulty={currentQuestion.difficulty} />
                </div>
              )}
          </CardContent>
        </Card>

        {/* Main panel */}
        <div className="space-y-4">
          {/* Adapting animation */}
          {isAdapting && adaptingFeedback ? (
            <AdaptingCard
              score={adaptingFeedback.score}
              keywords={adaptingFeedback.keywords}
              nextDifficulty={nextDifficulty}
            />
          ) : currentQuestion ? (
            <>
              {/* Question card */}
              <Card
                className={cn(
                  "border-border/60 ring-1 shadow-sm transition-all",
                  getDifficultyGlowClass(currentQuestion.difficulty),
                )}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs text-muted-foreground font-medium">
                          Q{questionNumber} of up to {MAX_QUESTIONS}
                        </span>
                        <DifficultyBadge
                          difficulty={currentQuestion.difficulty}
                        />
                        <Badge
                          variant="outline"
                          className="text-xs border-border/60"
                        >
                          {currentQuestion.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs border-primary/30 text-primary bg-primary/5 gap-1"
                        >
                          <Zap size={9} />
                          Adaptive
                        </Badge>
                      </div>
                      <div className="flex items-start gap-2">
                        <CardTitle className="font-display text-lg leading-snug flex-1">
                          {currentQuestion.title}
                        </CardTitle>
                        {speech.isSupported && (
                          <button
                            type="button"
                            onClick={() =>
                              speech.isSpeaking
                                ? speech.stopSpeaking()
                                : speech.speak(
                                    `${currentQuestion.title}. ${currentQuestion.description}`,
                                  )
                            }
                            className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                            title={
                              speech.isSpeaking
                                ? "Stop reading"
                                : "Read question aloud"
                            }
                            data-ocid="adaptive-session.speak_question_button"
                          >
                            <Volume2 size={12} />
                          </button>
                        )}
                      </div>
                      {/* Adaptive reasoning hint */}
                      {runningScores.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {(() => {
                            const avg = Math.round(
                              runningScores.reduce((a, b) => a + b, 0) /
                                runningScores.length,
                            );
                            if (currentQuestion.difficulty === "hard") {
                              return `AI targeting Hard — your avg score is ${avg}/100 (above 70)`;
                            }
                            if (currentQuestion.difficulty === "easy") {
                              return `AI targeting Easy — your avg score is ${avg}/100 (below 40)`;
                            }
                            return `AI targeting Medium — your avg score is ${avg}/100`;
                          })()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {currentQuestion.description}
                  </p>
                  {currentQuestion.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-4">
                      {currentQuestion.tags.map((tag) => (
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

              {/* Answer panel */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <CardTitle className="font-display text-sm">
                        Your Answer
                      </CardTitle>
                      {showCodeMode && selectedLang && (
                        <Badge
                          variant="outline"
                          className="border-primary/30 text-primary bg-primary/5 gap-1 text-xs"
                        >
                          <Code size={9} />
                          {selectedLang.label}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {showCodeMode && (
                        <Select
                          value={codeLanguage}
                          onValueChange={(v) =>
                            setCodeLanguage(v as CodeLanguage)
                          }
                        >
                          <SelectTrigger className="h-7 w-36 text-xs border-border/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CODE_LANGUAGES.map((lang) => (
                              <SelectItem
                                key={lang.value}
                                value={lang.value}
                                className="text-xs"
                              >
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Button
                        variant={showCodeMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowCodeMode((p) => !p)}
                        className={cn(
                          "gap-1.5 text-xs h-7 px-2.5",
                          showCodeMode
                            ? "bg-primary text-primary-foreground"
                            : "border-border/60",
                        )}
                      >
                        {showCodeMode ? (
                          <FileText size={11} />
                        ) : (
                          <Code size={11} />
                        )}
                        {showCodeMode ? "Text" : "Code"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyDown={showCodeMode ? handleCodeKeyDown : undefined}
                    placeholder={
                      showCodeMode
                        ? CODE_PLACEHOLDERS[codeLanguage]
                        : "Write your answer here. Use specific examples, relevant keywords, and the STAR method for behavioral questions..."
                    }
                    className={cn(
                      "min-h-[160px] resize-none border-border/60 focus:border-primary/40",
                      showCodeMode &&
                        "font-mono text-sm bg-zinc-950 text-zinc-100 border-border/80",
                    )}
                    data-ocid="adaptive-session.answer_textarea"
                  />

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {currentAnswer.length > 0
                          ? `${currentAnswer.length} chars — more detail = higher score`
                          : "Tip: Include examples, outcomes, and relevant keywords"}
                      </p>
                      {speech.isSupported && !isAdapting && (
                        <button
                          type="button"
                          onClick={handleToggleMic}
                          className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-all ${speech.isListening ? "animate-pulse border-red-500 bg-red-500/10 text-red-500" : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary"}`}
                          title={
                            speech.isListening
                              ? "Stop recording"
                              : "Speak your answer"
                          }
                          data-ocid="adaptive-session.mic_button"
                        >
                          {speech.isListening ? (
                            <MicOff size={12} />
                          ) : (
                            <Mic size={12} />
                          )}
                        </button>
                      )}
                    </div>
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={
                        submitAnswer.isPending ||
                        !currentAnswer.trim() ||
                        isAdapting
                      }
                      className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                      data-ocid="adaptive-session.submit_answer_button"
                    >
                      {submitAnswer.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          Submit Answer
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Follow-up Card */}
              {followUpCard && (
                <div
                  className="rounded-xl border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-transparent p-5 relative"
                  data-ocid="adaptive-session.followup_card"
                >
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/30 px-2 py-0.5 text-[10px] font-medium text-violet-400">
                      <Sparkles size={9} />
                      AI Follow-up
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-violet-400 shrink-0" />
                    <p className="text-xs font-semibold text-violet-300 uppercase tracking-wide">
                      AI Follow-up Question
                    </p>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-4">
                    {followUpCard.question}
                  </p>
                  <div className="space-y-3">
                    <div className="relative">
                      <textarea
                        value={followUpAnswer}
                        onChange={(e) => setFollowUpAnswer(e.target.value)}
                        placeholder="Optional: reflect on this follow-up..."
                        className="w-full min-h-[80px] resize-none rounded-lg border border-border/60 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-violet-500/50 focus:outline-none"
                        data-ocid="adaptive-session.followup_textarea"
                      />
                      {speech.isSupported && (
                        <button
                          type="button"
                          onClick={handleToggleMic}
                          className={`absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border text-xs transition-all ${speech.isListening ? "animate-pulse border-red-500 bg-red-500/10 text-red-500" : "border-border/60 text-muted-foreground hover:border-violet-500/40 hover:text-violet-400"}`}
                          title={
                            speech.isListening
                              ? "Stop recording"
                              : "Speak your follow-up"
                          }
                          data-ocid="adaptive-session.followup_mic_button"
                        >
                          {speech.isListening ? (
                            <MicOff size={10} />
                          ) : (
                            <Mic size={10} />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFollowUpDone}
                        className="text-xs border-border/60 h-7"
                        data-ocid="adaptive-session.followup_skip_button"
                      >
                        Skip
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleFollowUpDone}
                        className="text-xs bg-violet-600 hover:bg-violet-700 text-white h-7 gap-1"
                        data-ocid="adaptive-session.followup_submit_button"
                      >
                        <CheckCircle2 size={11} />
                        Submit Follow-up
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // No question yet - this means allQuestions haven't loaded
            <Card className="border-border/60">
              <CardContent className="pt-8 pb-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Loading questions…
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
