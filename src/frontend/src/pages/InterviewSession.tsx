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
  Loader2,
  MinimizeIcon,
  Monitor,
  MonitorOff,
  PlayCircle,
  Send,
  ShieldAlert,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { InterviewStatus } from "../backend.d";
import { useCamera } from "../camera/useCamera";
import { useScreenShare } from "../camera/useScreenShare";
import { DifficultyBadge, StatusBadge } from "../components/StatusBadge";
import {
  useGetAllQuestions,
  useGetSession,
  useSelfRegisterAsUser,
  useStartSession,
  useSubmitAnswer,
  useSubmitSession,
} from "../hooks/useQueries";

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

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Camera Proctoring Panel ──────────────────────────────────────────────────

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
          title="Show camera preview"
          aria-label="Expand camera panel"
        >
          <Camera
            size={16}
            className={isActive ? "text-success" : "text-muted-foreground"}
          />
        </button>
      ) : (
        <>
          {/* Header */}
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

          {/* Video area */}
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
                  data-ocid="session.camera_enable_button"
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

            {/* Active indicator */}
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

// ─── Screen Share Panel ───────────────────────────────────────────────────────

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
      data-ocid="session.screen_share_panel"
    >
      {collapsed ? (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full h-full flex items-center justify-center hover:bg-accent/20 transition-colors"
          title="Show screen share preview"
          aria-label="Expand screen share panel"
        >
          <Monitor
            size={16}
            className={isActive ? "text-success" : "text-muted-foreground"}
          />
        </button>
      ) : (
        <>
          {/* Header */}
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
              aria-label="Collapse screen share panel"
            >
              <MinimizeIcon size={10} />
            </button>
          </div>

          {/* Video area */}
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
                    data-ocid="session.screen_share_enable_button"
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

            {/* Active indicator */}
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

// ─── Proctoring Status Bar ────────────────────────────────────────────────────

interface ProctoringStatusBarProps {
  cameraActive: boolean;
  cameraPermissionDenied: boolean;
  screenShareActive: boolean;
  violations: number;
}

function ProctoringStatusBar({
  cameraActive,
  cameraPermissionDenied,
  screenShareActive,
  violations,
}: ProctoringStatusBarProps) {
  return (
    <div
      className="flex items-center gap-3 flex-wrap bg-muted/30 border border-border/40 rounded-lg px-4 py-2"
      data-ocid="session.proctoring_status_bar"
    >
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        Monitoring
      </span>

      {/* Camera pill */}
      <div
        className={cn(
          "flex items-center gap-1 rounded-full px-2 py-1 text-xs border",
          cameraActive
            ? "bg-success/10 text-success border-success/30"
            : cameraPermissionDenied
              ? "bg-warning/10 text-warning border-warning/30"
              : "bg-muted text-muted-foreground border-border/40",
        )}
      >
        {cameraActive ? (
          <CheckCircle2 size={10} />
        ) : (
          <AlertTriangle size={10} />
        )}
        Camera
      </div>

      {/* Screen Share pill */}
      <div
        className={cn(
          "flex items-center gap-1 rounded-full px-2 py-1 text-xs border",
          screenShareActive
            ? "bg-success/10 text-success border-success/30"
            : "bg-warning/10 text-warning border-warning/30",
        )}
      >
        {screenShareActive ? (
          <CheckCircle2 size={10} />
        ) : (
          <AlertTriangle size={10} />
        )}
        Screen
      </div>

      {/* Violations pill */}
      <div
        className={cn(
          "flex items-center gap-1 rounded-full px-2 py-1 text-xs border",
          violations === 0
            ? "bg-success/10 text-success border-success/30"
            : violations <= 2
              ? "bg-warning/10 text-warning border-warning/30"
              : "bg-destructive/10 text-destructive border-destructive/30",
        )}
        data-ocid="session.violations_status_pill"
      >
        <ShieldAlert size={10} />
        Violations: {violations}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function InterviewSession() {
  const { id } = useParams({ from: "/session/$id" });
  const sessionId = BigInt(id);
  const navigate = useNavigate();

  const { data: session } = useGetSession(sessionId);
  const { data: allQuestions } = useGetAllQuestions();
  const selfRegister = useSelfRegisterAsUser();
  const startSession = useStartSession();
  const submitAnswer = useSubmitAnswer();
  const submitSession = useSubmitSession();

  // ── Core session state ──
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Set<string>>(
    new Set(),
  );
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [_questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now(),
  );
  const questionStartRef = useRef<number>(Date.now());

  // ── "Grace period" before showing session-not-found error ──
  const [graceExpired, setGraceExpired] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGraceExpired(true), 8000);
    return () => clearTimeout(t);
  }, []);

  // ── Code editor state ──
  const [showCodeMode, setShowCodeMode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>("javascript");

  // ── Camera proctoring state ──
  const camera = useCamera({ facingMode: "user", width: 320, height: 240 });
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraCollapsed, setCameraCollapsed] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // ── Screen share state ──
  const screenShare = useScreenShare();
  const [screenShareCollapsed, setScreenShareCollapsed] = useState(false);

  // ── Anti-cheat state ──
  const [violations, setViolations] = useState(0);
  const violationsRef = useRef(0);
  const autoSubmittedRef = useRef(false);

  // ── Proctoring event log ──
  const [proctoringEvents, setProctoringEvents] = useState<ProctoringEvent[]>(
    [],
  );
  const addProctoringEvent = useCallback(
    (type: ProctoringEvent["type"], message: string) => {
      setProctoringEvents((prev) => [
        ...prev,
        { type, timestamp: Date.now(), message },
      ]);
    },
    [],
  );

  // ── Snapshots (up to 5) ──
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const snapshotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const sessionQuestions = (session?.questionIds ?? []).map((qId) =>
    (allQuestions ?? []).find((q) => q.id === qId),
  );

  const isInProgress = session?.status === InterviewStatus.inProgress;

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

  // ── Countdown timer ──
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

  // ── Auto-submit when time runs out ──
  useEffect(() => {
    if (timeLeft === 0 && session?.status === InterviewStatus.inProgress) {
      toast.warning("Time's up! Submitting your interview.");
      void handleSubmitSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, session?.status]);

  // ── Camera: start/stop based on session status ──
  const cameraStartRef = useRef(camera.startCamera);
  cameraStartRef.current = camera.startCamera;
  useEffect(() => {
    if (isInProgress && cameraEnabled) {
      void cameraStartRef.current();
    }
  }, [isInProgress, cameraEnabled]);

  // ── Anti-cheat: register listeners when in progress ──
  useEffect(() => {
    if (!isInProgress) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        violationsRef.current += 1;
        setViolations(violationsRef.current);
        addProctoringEvent(
          "tab_switch",
          `Tab switch detected (violation #${violationsRef.current})`,
        );
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
        addProctoringEvent(
          "window_blur",
          `Window focus lost (violation #${violationsRef.current})`,
        );
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
  }, [isInProgress, addProctoringEvent]);

  // ── Auto-submit at 5 violations ──
  useEffect(() => {
    if (
      violations >= 5 &&
      session?.status === InterviewStatus.inProgress &&
      !autoSubmittedRef.current
    ) {
      autoSubmittedRef.current = true;
      toast.error(
        "Too many violations detected. Session is being auto-submitted.",
        { duration: 6000 },
      );
      void handleSubmitSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [violations, session?.status]);

  // ── Keep refs stable for snapshot interval ──
  const cameraVideoRef = camera.videoRef;
  const cameraCanvasRef = camera.canvasRef;

  // ── Periodic snapshots every 60s ──
  useEffect(() => {
    if (!isInProgress) {
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current);
        snapshotIntervalRef.current = null;
      }
      return;
    }

    snapshotIntervalRef.current = setInterval(() => {
      if (
        camera.isActive &&
        cameraVideoRef.current &&
        cameraCanvasRef.current
      ) {
        const video = cameraVideoRef.current;
        const canvas = cameraCanvasRef.current;
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
          setSnapshots((prev) => {
            const next = [...prev, dataUrl];
            return next.slice(-5); // keep only last 5
          });
        }
      }
    }, 60000);

    return () => {
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current);
        snapshotIntervalRef.current = null;
      }
    };
  }, [isInProgress, camera.isActive, cameraVideoRef, cameraCanvasRef]);

  // ── Track camera on/off events ──
  const prevCameraActive = useRef(false);
  useEffect(() => {
    if (camera.isActive && !prevCameraActive.current) {
      addProctoringEvent("camera_on", "Camera monitoring started");
    } else if (!camera.isActive && prevCameraActive.current) {
      addProctoringEvent("camera_off", "Camera monitoring stopped");
    }
    prevCameraActive.current = camera.isActive;
  }, [camera.isActive, addProctoringEvent]);

  // ── Track screen share on/off events ──
  const prevScreenShareActive = useRef(false);
  useEffect(() => {
    if (screenShare.isActive && !prevScreenShareActive.current) {
      addProctoringEvent("screen_share_on", "Screen sharing started");
    } else if (!screenShare.isActive && prevScreenShareActive.current) {
      addProctoringEvent("screen_share_off", "Screen sharing stopped");
    }
    prevScreenShareActive.current = screenShare.isActive;
  }, [screenShare.isActive, addProctoringEvent]);

  // ── Enable camera before start ──
  const handleRequestCamera = async () => {
    setCameraEnabled(true);
    const ok = await camera.startCamera();
    if (!ok) {
      if (camera.error?.type === "permission") {
        setPermissionDenied(true);
        toast.warning(
          "Camera permission denied. Session will continue without proctoring.",
        );
      }
    }
  };

  const handleStart = async () => {
    try {
      try {
        await selfRegister.mutateAsync();
      } catch (_regErr) {
        // Already registered — continue
      }
      await startSession.mutateAsync(sessionId);
      setQuestionStartTime(Date.now());
      questionStartRef.current = Date.now();
      toast.success("Interview started! Good luck.");
      if (cameraEnabled && !camera.isActive) {
        void camera.startCamera();
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(
        msg.toLowerCase().includes("unauthorized") ||
          msg.toLowerCase().includes("candidate")
          ? "You are not authorized to start this session. Make sure you created this assessment."
          : "Failed to start session. Please try again.",
      );
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
      console.error(err);
      toast.error("Failed to submit answer. Please try again.");
    }
  };

  const handleSubmitSession = useCallback(async () => {
    // Stop camera and screen share on submit
    if (camera.isActive) {
      void camera.stopCamera();
    }
    if (screenShare.isActive) {
      void screenShare.stopScreenShare();
    }

    // Save proctoring summary to sessionStorage
    const summary: ProctoringSessionSummary = {
      cameraActive: camera.isActive,
      screenShareActive: screenShare.isActive,
      violations: violationsRef.current,
      snapshots,
      events: proctoringEvents,
      sessionId: id,
    };
    try {
      sessionStorage.setItem(`proctoring_${id}`, JSON.stringify(summary));
    } catch (_e) {
      // sessionStorage may not be available
    }

    try {
      await submitSession.mutateAsync(sessionId);
      toast.success("Assessment submitted! Viewing your results...");
      void navigate({ to: "/assessment/results/$id", params: { id } });
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit assessment. Please try again.");
    }
  }, [
    sessionId,
    submitSession,
    navigate,
    id,
    camera,
    screenShare,
    snapshots,
    proctoringEvents,
  ]);

  // ── Tab key handler for code editor ──
  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const currentQId = sessionQuestions[currentQuestionIdx]?.id.toString();
      if (!currentQId) return;
      const currentValue = answers[currentQId] ?? "";
      const newValue = `${currentValue.substring(0, start)}  ${currentValue.substring(end)}`;
      setAnswers((prev) => ({ ...prev, [currentQId]: newValue }));
      requestAnimationFrame(() => {
        target.selectionStart = start + 2;
        target.selectionEnd = start + 2;
      });
    }
  };

  if (!session) {
    if (!graceExpired) {
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
    return (
      <div className="container py-8" data-ocid="session.error_state">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Session not found. It may have been deleted, or the ID is invalid.
            Please go back and start a new assessment.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/assessment">
              <ArrowLeft size={13} className="mr-1" />
              Back to Assessment
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Completed / Evaluated ──
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

  // ── Scheduled (not yet started) ──
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

            {/* Rules */}
            <div className="mb-5 rounded-lg bg-warning/5 border border-warning/20 p-4 text-sm text-left space-y-1.5">
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
              <p className="text-muted-foreground">
                • Tab switching and window changes are monitored
              </p>
              <p className="text-muted-foreground">
                • 5 or more violations will auto-submit your session
              </p>
            </div>

            {/* Camera proctoring opt-in */}
            <div className="mb-4 rounded-lg bg-muted/30 border border-border/40 p-4 text-sm text-left">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Camera size={15} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">Camera Proctoring</p>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Enable your webcam to mark this session as proctored. Your
                    camera preview stays visible during the test.
                  </p>
                  {camera.isActive ? (
                    <Badge className="bg-success/10 text-success border-success/30 gap-1.5 text-xs">
                      <ShieldCheck size={11} />
                      Camera Active — Proctored
                    </Badge>
                  ) : permissionDenied ? (
                    <Badge
                      variant="outline"
                      className="border-warning/40 text-warning gap-1.5 text-xs"
                    >
                      <ShieldAlert size={11} />
                      Camera denied — Unproctored session
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRequestCamera}
                      disabled={camera.isLoading}
                      className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5 text-xs h-7"
                      data-ocid="session.enable_camera_button"
                    >
                      {camera.isLoading ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Camera size={11} />
                      )}
                      Enable Camera for Proctoring
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Screen share opt-in */}
            <div className="mb-6 rounded-lg bg-muted/30 border border-border/40 p-4 text-sm text-left">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Monitor size={15} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">
                    Screen Share Proctoring
                  </p>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Share your screen to enable full computer monitoring. Your
                    screen is previewed in a floating panel during the test.
                  </p>
                  {screenShare.isActive ? (
                    <Badge className="bg-success/10 text-success border-success/30 gap-1.5 text-xs">
                      <ShieldCheck size={11} />
                      Screen Sharing Active — Monitored
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void screenShare.startScreenShare()}
                      disabled={screenShare.isLoading}
                      className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5 text-xs h-7"
                      data-ocid="session.enable_screen_share_button"
                    >
                      {screenShare.isLoading ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Monitor size={11} />
                      )}
                      Enable Screen Share for Proctoring
                    </Button>
                  )}
                </div>
              </div>
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

  // ── In Progress ──
  const currentQ = sessionQuestions[currentQuestionIdx];
  const currentQId = currentQ?.id.toString();
  const progressPct = (submittedAnswers.size / sessionQuestions.length) * 100;
  const allAnswered = submittedAnswers.size >= sessionQuestions.length;
  const isTimeCritical = timeLeft !== null && timeLeft < 120;
  const selectedLang = CODE_LANGUAGES.find((l) => l.value === codeLanguage);

  return (
    <div className="container py-6 space-y-4">
      {/* Camera Proctoring Panel (floating) */}
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

      {/* Screen Share Proctoring Panel (floating) */}
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

      {/* Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="border-primary/30 text-primary bg-primary/5"
          >
            Session #{id}
          </Badge>
          <StatusBadge status={session.status} />

          {/* Proctoring badge */}
          {camera.isActive ? (
            <Badge className="bg-success/10 text-success border-success/30 gap-1 text-xs">
              <ShieldCheck size={10} />
              Proctored
            </Badge>
          ) : permissionDenied ? (
            <Badge
              variant="outline"
              className="border-warning/40 text-warning gap-1 text-xs"
            >
              <ShieldAlert size={10} />
              Unproctored
            </Badge>
          ) : null}

          {/* Screen share badge */}
          {screenShare.isActive && (
            <Badge className="bg-success/10 text-success border-success/30 gap-1 text-xs">
              <Monitor size={10} />
              Screen Monitored
            </Badge>
          )}

          {/* Violations badge */}
          {violations > 0 && (
            <Badge
              className={cn(
                "gap-1 text-xs",
                violations >= 5
                  ? "bg-destructive/10 text-destructive border-destructive/30"
                  : violations >= 3
                    ? "bg-destructive/10 text-destructive border-destructive/30"
                    : "bg-warning/10 text-warning border-warning/30",
              )}
              data-ocid="session.violations_badge"
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

      {/* Proctoring Status Bar */}
      <ProctoringStatusBar
        cameraActive={camera.isActive}
        cameraPermissionDenied={permissionDenied}
        screenShareActive={screenShare.isActive}
        violations={violations}
      />

      {/* Anti-cheat persistent alert for 3+ violations */}
      {violations >= 3 && violations < 5 && (
        <Alert
          variant="destructive"
          className="border-destructive/50"
          data-ocid="session.anticheat_alert"
        >
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            <strong>Excessive tab switching detected.</strong> This session may
            be flagged for review.{" "}
            {violations >= 3
              ? `${5 - violations} more violation${5 - violations === 1 ? "" : "s"} will auto-submit your session.`
              : "Please keep this window focused."}
          </AlertDescription>
        </Alert>
      )}

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
                        <SelectTrigger
                          className="h-7 text-xs w-[120px] border-border/60"
                          data-ocid="session.language_select"
                        >
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
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 gap-1"
                      onClick={() => setShowCodeMode((p) => !p)}
                      data-ocid="session.mode_toggle"
                    >
                      {showCodeMode ? (
                        <>
                          <FileText size={12} />
                          Text Mode
                        </>
                      ) : (
                        <>
                          <Code size={12} />
                          Code Mode
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {showCodeMode ? (
                  <div className="relative rounded-lg overflow-hidden border border-border/60">
                    <div className="absolute top-2 right-3 z-10 pointer-events-none">
                      <span className="text-[10px] font-mono text-zinc-500 select-none">
                        {selectedLang?.label}
                      </span>
                    </div>
                    <textarea
                      placeholder={CODE_PLACEHOLDERS[codeLanguage]}
                      value={currentQId ? (answers[currentQId] ?? "") : ""}
                      onChange={(e) => {
                        if (!currentQId) return;
                        setAnswers((prev) => ({
                          ...prev,
                          [currentQId]: e.target.value,
                        }));
                      }}
                      onKeyDown={handleCodeKeyDown}
                      disabled={
                        currentQId ? submittedAnswers.has(currentQId) : false
                      }
                      spellCheck={false}
                      className={cn(
                        "w-full min-h-[280px] resize-y bg-zinc-900 text-zinc-100 px-4 pt-4 pb-4 pr-16 outline-none border-none",
                        "placeholder:text-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed",
                      )}
                      style={{
                        fontFamily:
                          "ui-monospace, 'JetBrains Mono', 'Geist Mono', monospace",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        tabSize: 2,
                      }}
                      data-ocid="session.code_editor"
                    />
                  </div>
                ) : (
                  <Textarea
                    placeholder="Describe your approach, explain your reasoning, and provide examples..."
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
                    className="min-h-[200px] resize-y"
                    data-ocid="session.answer_textarea"
                  />
                )}

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
