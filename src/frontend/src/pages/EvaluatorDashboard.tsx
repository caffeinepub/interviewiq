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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Flag,
  Loader2,
  Plus,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InterviewStatus } from "../backend.d";
import { DifficultyBadge, StatusBadge } from "../components/StatusBadge";
import {
  useAddOverallAssessment,
  useCreateInterviewSession,
  useFlagSession,
  useGetAllQuestions,
  useGetSession,
  useScoreAnswer,
} from "../hooks/useQueries";

// Local storage key for demo session IDs
const SESSIONS_STORAGE_KEY = "evaluator_session_ids";

function useLocalSessions() {
  const [sessionIds, setSessionIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });

  const addSession = (id: string) => {
    setSessionIds((prev) => {
      const updated = [id, ...prev];
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { sessionIds, addSession };
}

export function EvaluatorDashboard() {
  const navigate = useNavigate();
  const { sessionIds, addSession } = useLocalSessions();
  const { data: questions, isLoading: loadingQuestions } = useGetAllQuestions();
  const createSession = useCreateInterviewSession();

  const [createOpen, setCreateOpen] = useState(false);
  const [candidatePrincipal, setCandidatePrincipal] = useState("");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(
    new Set(),
  );
  const [timeLimit, setTimeLimit] = useState("60");
  const [createError, setCreateError] = useState("");

  const toggleQuestion = (id: string) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateSession = async () => {
    setCreateError("");
    if (!candidatePrincipal.trim()) {
      setCreateError("Candidate principal is required.");
      return;
    }
    if (selectedQuestionIds.size === 0) {
      setCreateError("Select at least one question.");
      return;
    }
    const limit = Number.parseInt(timeLimit, 10);
    if (Number.isNaN(limit) || limit < 5) {
      setCreateError("Enter a valid time limit.");
      return;
    }

    try {
      const sessionId = await createSession.mutateAsync({
        candidate: candidatePrincipal.trim(),
        questionIds: [...selectedQuestionIds].map((id) => BigInt(id)),
        timeLimitMinutes: BigInt(limit),
      });
      addSession(sessionId.toString());
      setCreateOpen(false);
      setCandidatePrincipal("");
      setSelectedQuestionIds(new Set());
      setTimeLimit("60");
      toast.success(`Session #${sessionId} created!`);
      await navigate({
        to: "/session/$id",
        params: { id: sessionId.toString() },
      });
    } catch (err) {
      setCreateError("Failed to create session.");
      console.error(err);
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Evaluator Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Create interview sessions, score candidates, and manage evaluations.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="evaluator.create_session_button"
            >
              <Plus size={16} />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-2xl"
            data-ocid="evaluator.create_session_dialog"
          >
            <DialogHeader>
              <DialogTitle className="font-display">
                Create Interview Session
              </DialogTitle>
              <DialogDescription>
                Set up a new interview session for a candidate.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="candidatePrincipal">
                  Candidate Principal ID
                </Label>
                <Input
                  id="candidatePrincipal"
                  placeholder="e.g. 2vxsx-fae..."
                  value={candidatePrincipal}
                  onChange={(e) => setCandidatePrincipal(e.target.value)}
                  data-ocid="evaluator.candidate_principal_input"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The Internet Identity principal of the candidate.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="evalTimeLimit">Time Limit (minutes)</Label>
                <Input
                  id="evalTimeLimit"
                  type="number"
                  min="5"
                  max="180"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Questions ({selectedQuestionIds.size} selected)</Label>
                <ScrollArea className="h-64 rounded-lg border border-border/60">
                  {loadingQuestions ? (
                    <div className="p-3 space-y-2">
                      {["sk1", "sk2", "sk3", "sk4"].map((k) => (
                        <Skeleton key={k} className="h-12" />
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {(questions ?? []).map((q, idx) => {
                        const qId = q.id.toString();
                        return (
                          <label
                            key={qId}
                            htmlFor={`eq-${qId}`}
                            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/30"
                            data-ocid={`evaluator.question.item.${idx + 1}`}
                          >
                            <Checkbox
                              id={`eq-${qId}`}
                              checked={selectedQuestionIds.has(qId)}
                              onCheckedChange={() => toggleQuestion(qId)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {q.title}
                              </p>
                              <div className="flex gap-1.5 mt-0.5">
                                <DifficultyBadge difficulty={q.difficulty} />
                                <Badge
                                  variant="outline"
                                  className="text-xs border-border/60"
                                >
                                  {q.category}
                                </Badge>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {createError && (
                <Alert
                  variant="destructive"
                  data-ocid="evaluator.create_error_state"
                >
                  <AlertDescription>{createError}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
                data-ocid="evaluator.create_cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSession}
                disabled={createSession.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="evaluator.create_confirm_button"
              >
                {createSession.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Session"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardList size={18} />
            </div>
            <div>
              <div className="font-display text-2xl font-bold">
                {sessionIds.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Sessions
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="font-display text-2xl font-bold">
                {sessionIds.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Pending Review
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Flag size={18} />
            </div>
            <div>
              <div className="font-display text-2xl font-bold">0</div>
              <div className="text-xs text-muted-foreground">Flagged</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-lg">
            Interview Sessions
          </CardTitle>
          <CardDescription>
            Sessions you've created. Click to review and score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionIds.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              data-ocid="evaluator.sessions_empty_state"
            >
              <Users className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="font-medium text-muted-foreground">
                No sessions yet
              </p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Create your first interview session to get started.
              </p>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground"
                onClick={() => setCreateOpen(true)}
              >
                <Plus size={14} className="mr-1.5" />
                Create Session
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {sessionIds.map((sid, idx) => (
                <SessionRow key={sid} sessionId={BigInt(sid)} index={idx} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SessionRow({
  sessionId,
  index,
}: {
  sessionId: bigint;
  index: number;
}) {
  const navigate = useNavigate();
  const { data: session, isLoading } = useGetSession(sessionId);
  const _scoreAnswer = useScoreAnswer();
  const addOverall = useAddOverallAssessment();
  const flagSession = useFlagSession();

  const [scoreOpen, setScoreOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagNote, setFlagNote] = useState("");
  const [overallScore, setOverallScore] = useState("75");
  const [overallFeedback, setOverallFeedback] = useState("");

  const handleAddOverall = async () => {
    const score = Number.parseInt(overallScore, 10);
    if (Number.isNaN(score) || score < 0 || score > 100) {
      toast.error("Score must be 0–100.");
      return;
    }
    if (!overallFeedback.trim()) {
      toast.error("Please provide feedback.");
      return;
    }
    try {
      await addOverall.mutateAsync({
        sessionId,
        overallScore: BigInt(score),
        feedback: overallFeedback,
      });
      setScoreOpen(false);
      toast.success("Assessment submitted!");
    } catch (err) {
      toast.error("Failed to submit assessment.");
      console.error(err);
    }
  };

  const handleFlag = async () => {
    if (!flagNote.trim()) {
      toast.error("Please provide a flag reason.");
      return;
    }
    try {
      await flagSession.mutateAsync({ sessionId, note: flagNote });
      setFlagOpen(false);
      toast.success("Session flagged.");
    } catch (err) {
      toast.error("Failed to flag session.");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-4" data-ocid={`evaluator.session.item.${index + 1}`}>
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div
        className="py-4 flex items-center gap-3 text-sm text-muted-foreground"
        data-ocid={`evaluator.session.item.${index + 1}`}
      >
        <AlertTriangle size={14} />
        Session #{sessionId.toString()} — not found
      </div>
    );
  }

  return (
    <div
      className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between first:pt-0 last:pb-0"
      data-ocid={`evaluator.session.item.${index + 1}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BrainCircuit size={18} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">
              Session #{sessionId.toString()}
            </p>
            {session.flagged && (
              <Badge
                variant="outline"
                className="text-xs border-destructive/30 text-destructive bg-destructive/5"
              >
                <Flag size={10} className="mr-1" />
                Flagged
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono truncate">
            Candidate: {session.candidate.toString().slice(0, 20)}…
          </p>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={session.status} />
            <span className="text-xs text-muted-foreground">
              {session.questionIds.length} questions ·{" "}
              {Number(session.timeLimitMinutes)}min
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {session.overallScore !== undefined && (
          <Badge className="bg-primary/10 text-primary border-primary/30">
            <Star size={10} className="mr-1" />
            {Number(session.overallScore)}/100
          </Badge>
        )}

        {/* Score Dialog */}
        {(session.status === InterviewStatus.completed ||
          session.status === InterviewStatus.inProgress) && (
          <Dialog open={scoreOpen} onOpenChange={setScoreOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-border/60"
                data-ocid="evaluator.score_submit_button"
              >
                <Star size={12} className="mr-1" />
                Score
              </Button>
            </DialogTrigger>
            <DialogContent data-ocid="evaluator.score_dialog">
              <DialogHeader>
                <DialogTitle className="font-display">
                  Add Overall Assessment
                </DialogTitle>
                <DialogDescription>
                  Provide an overall score and feedback for this session.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="overallScore">Overall Score (0–100)</Label>
                  <Input
                    id="overallScore"
                    type="number"
                    min="0"
                    max="100"
                    value={overallScore}
                    onChange={(e) => setOverallScore(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overallFeedback">Feedback</Label>
                  <Textarea
                    id="overallFeedback"
                    placeholder="Provide detailed feedback on the candidate's performance..."
                    value={overallFeedback}
                    onChange={(e) => setOverallFeedback(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setScoreOpen(false)}
                  data-ocid="evaluator.score_cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddOverall}
                  disabled={addOverall.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-ocid="evaluator.score_confirm_button"
                >
                  {addOverall.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Submit Assessment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Flag Dialog */}
        <AlertDialog open={flagOpen} onOpenChange={setFlagOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs h-8",
                session.flagged
                  ? "text-destructive"
                  : "text-muted-foreground hover:text-destructive",
              )}
              data-ocid="evaluator.flag_button"
            >
              <Flag size={12} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-ocid="evaluator.flag_dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Flag This Session</AlertDialogTitle>
              <AlertDialogDescription>
                Flag sessions for unusual behavior or potential policy
                violations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea
              placeholder="Describe the reason for flagging this session..."
              value={flagNote}
              onChange={(e) => setFlagNote(e.target.value)}
              className="min-h-[100px]"
            />
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="evaluator.flag_cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleFlag}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-ocid="evaluator.flag_confirm_button"
              >
                {flagSession.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Flag Session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() =>
            navigate({
              to: "/session/$id",
              params: { id: sessionId.toString() },
            })
          }
          data-ocid={`evaluator.session.button.${index + 1}`}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
