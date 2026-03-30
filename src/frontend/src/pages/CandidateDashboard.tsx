import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  Loader2,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserCog,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { RequestedRole } from "../backend.d";
import { InterviewStatus } from "../backend.d";
import { StatusBadge } from "../components/StatusBadge";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetCandidateProfile,
} from "../hooks/useQueries";

// No demo sessions — candidates start fresh and build their own history
const demoSessions: {
  id: bigint;
  status: InterviewStatus;
  score: number | null;
  role: string;
  date: string;
  questions: number;
  timeLimit: number;
}[] = [];

export function CandidateDashboard() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: userProfile, isLoading: loadingProfile } =
    useGetCallerUserProfile();
  const principalStr = identity?.getPrincipal().toString() ?? null;
  const { data: candidateProfile, isLoading: loadingCandidate } =
    useGetCandidateProfile(principalStr);

  const completedSessions = demoSessions.filter(
    (s) =>
      s.status === InterviewStatus.completed ||
      s.status === InterviewStatus.evaluated,
  );
  const avgScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions
            .filter((s) => s.score !== null)
            .reduce((sum, s) => sum + (s.score ?? 0), 0) /
            completedSessions.filter((s) => s.score !== null).length,
        )
      : 0;

  const isLoading = loadingProfile || loadingCandidate;

  const { actor } = useActor();
  const queryClient = useQueryClient();

  const { data: myRoleRequest, isLoading: roleRequestLoading } = useQuery({
    queryKey: ["myRoleRequest"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await (actor as any).getMyRoleRequest();
        return result.length > 0 ? result[0] : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !!identity,
  });

  const [roleForm, setRoleForm] = useState<{
    role: RequestedRole;
    reason: string;
  }>({
    role: "evaluator",
    reason: "",
  });
  const [submittingRole, setSubmittingRole] = useState(false);

  const handleSubmitRoleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !roleForm.reason.trim()) {
      toast.error("Please provide a reason for your role request.");
      return;
    }
    setSubmittingRole(true);
    try {
      await (actor as any).submitRoleRequest(
        roleForm.role,
        roleForm.reason.trim(),
      );
      toast.success("Role request submitted! An admin will review it shortly.");
      void queryClient.invalidateQueries({ queryKey: ["myRoleRequest"] });
    } catch {
      toast.error("Failed to submit role request. Please try again.");
    } finally {
      setSubmittingRole(false);
    }
  };

  if (!identity) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-16">
        <Card className="border-border/60 max-w-md w-full text-center">
          <CardContent className="pt-10">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Please sign in to access your dashboard.
            </p>
            <Button asChild>
              <Link to="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName =
    userProfile?.name ?? candidateProfile?.name ?? "Candidate";
  const targetRole = candidateProfile?.targetRole ?? "Not set";
  const experienceLevel = candidateProfile?.experienceLevel ?? "Not set";

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold">
                Welcome back, {displayName}!
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-xs border-primary/30 text-primary bg-primary/5"
                >
                  {targetRole}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  · {experienceLevel}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            asChild
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
            data-ocid="candidate.assessment_button"
          >
            <Link to="/assessment">
              <Zap size={16} />
              Take Assessment
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="gap-2 border-border/60"
            data-ocid="candidate.mock_interview_button"
          >
            <Link to="/mock-interview/new">
              <PlayCircle size={16} />
              Mock Interview
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Total Interviews"
          value={String(demoSessions.length)}
          iconBg="bg-info/10 text-info"
          loading={isLoading}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Average Score"
          value={`${avgScore}%`}
          iconBg="bg-success/10 text-success"
          loading={isLoading}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Completed"
          value={String(completedSessions.length)}
          iconBg="bg-primary/10 text-primary"
          loading={isLoading}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="In Progress"
          value={String(
            demoSessions.filter((s) => s.status === InterviewStatus.inProgress)
              .length,
          )}
          iconBg="bg-warning/10 text-warning"
          loading={isLoading}
        />
      </div>

      {/* Gemini AI Interview Feature Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-4 left-1/3 h-20 w-20 rounded-full bg-cyan-500/10 blur-xl" />
        </div>
        <CardHeader className="pb-3 relative">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display text-lg">
                Gemini AI Interview
              </CardTitle>
              <CardDescription className="text-xs">
                Powered by Google Gemini — questions adapt to your answers in
                real-time
              </CardDescription>
            </div>
            <Badge className="ml-auto bg-primary/20 text-primary border-primary/30 text-xs">
              New
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {[
              {
                icon: <Brain className="h-4 w-4" />,
                label: "Dynamic Questions",
                desc: "Role-specific, never repeated",
              },
              {
                icon: <Zap className="h-4 w-4" />,
                label: "Adaptive Difficulty",
                desc: "Adjusts based on your answers",
              },
              {
                icon: <Target className="h-4 w-4" />,
                label: "AI Evaluation",
                desc: "Score + tips after each answer",
              },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-start gap-2 rounded-lg bg-background/40 border border-border/40 p-3"
              >
                <div className="text-primary mt-0.5">{f.icon}</div>
                <div>
                  <p className="text-xs font-semibold">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Button
            asChild
            className="gap-2 shadow-glow"
            data-ocid="candidate.gemini_interview_button"
          >
            <Link to="/gemini-interview">
              <Sparkles size={16} />
              Start AI Interview
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* AI Interviewer Card */}
      <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />
        </div>
        <CardHeader className="pb-3 relative">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display text-lg">
                AI Interviewer
              </CardTitle>
              <CardDescription className="text-xs">
                Conversational interview — one question at a time, real feedback
                after every answer
              </CardDescription>
            </div>
            <Badge className="ml-auto bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
              New
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            asChild
            className="gap-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
            variant="outline"
            data-ocid="candidate.ai_interviewer_button"
          >
            <Link to="/ai-interviewer">
              <MessageCircle size={16} />
              Start Conversation
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Overall Progress */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-lg">
            Overall Progress
          </CardTitle>
          <CardDescription>Your interview readiness score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Score</span>
                <span className="font-medium text-primary">{avgScore}%</span>
              </div>
              <Progress
                value={avgScore}
                className="h-3"
                data-ocid="candidate.progress_bar"
              />
            </div>
            <div className="font-display text-3xl font-bold text-primary min-w-[4rem] text-right">
              {avgScore}%
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Based on {completedSessions.length} completed interviews
          </p>
        </CardContent>
      </Card>

      {/* Session List */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="font-display text-lg">
              Interview Sessions
            </CardTitle>
            <CardDescription>
              Your recent and upcoming interviews
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs border-border/60"
            asChild
          >
            <Link to="/mock-interview/new">
              <BrainCircuit size={12} />
              New Mock
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {demoSessions.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              data-ocid="candidate.sessions_empty_state"
            >
              <Brain className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">
                No sessions yet
              </p>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Take an auto-generated assessment or start a custom mock
                interview to track your progress.
              </p>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  asChild
                  size="sm"
                  data-ocid="candidate.sessions_assessment_button"
                >
                  <Link to="/assessment">
                    <Zap size={14} className="mr-1.5" />
                    Take Assessment
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-border/60"
                  data-ocid="candidate.sessions_mock_button"
                >
                  <Link to="/mock-interview/new">Mock Interview</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="divide-y divide-border/60"
              data-ocid="candidate.sessions_list"
            >
              {demoSessions.map((session, idx) => (
                <div
                  key={session.id.toString()}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  data-ocid={`candidate.sessions.item.${idx + 1}`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BrainCircuit size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {session.role}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.date} · {session.questions} questions ·{" "}
                        {session.timeLimit}min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {session.score !== null && (
                      <span className="text-sm font-semibold text-primary">
                        {session.score}%
                      </span>
                    )}
                    <StatusBadge status={session.status} />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        navigate({
                          to: "/session/$id",
                          params: { id: session.id.toString() },
                        })
                      }
                      data-ocid={`candidate.session.button.${idx + 1}`}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Upgrade Request */}
      <Card
        className="border-border/60"
        data-ocid="candidate.role_request_card"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <CardTitle className="font-display text-base">
              Request Role Upgrade
            </CardTitle>
          </div>
          <CardDescription className="text-sm">
            Apply to become an Evaluator or Recruiter. An admin will review your
            request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roleRequestLoading ? (
            <div
              className="flex items-center gap-2 py-3"
              data-ocid="candidate.role_request_loading_state"
            >
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Checking request status…
              </span>
            </div>
          ) : myRoleRequest ? (
            <div className="space-y-3">
              {myRoleRequest.status === "pending" && (
                <div
                  className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4"
                  data-ocid="candidate.role_request_pending"
                >
                  <Clock className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                      Pending Admin Review
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your{" "}
                      <span className="font-medium capitalize">
                        {myRoleRequest.requestedRole}
                      </span>{" "}
                      request is waiting for approval.
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="ml-auto shrink-0 border-yellow-500/40 text-yellow-600 bg-yellow-500/10 capitalize"
                  >
                    {myRoleRequest.status}
                  </Badge>
                </div>
              )}
              {myRoleRequest.status === "approved" && (
                <div
                  className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4"
                  data-ocid="candidate.role_request_approved"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                      Role Request Approved!
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      You now have{" "}
                      <span className="font-medium capitalize">
                        {myRoleRequest.requestedRole}
                      </span>{" "}
                      access.
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="ml-auto shrink-0 border-green-500/40 text-green-600 bg-green-500/10 capitalize"
                  >
                    Approved
                  </Badge>
                </div>
              )}
              {myRoleRequest.status === "denied" && (
                <div className="space-y-3">
                  <div
                    className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
                    data-ocid="candidate.role_request_denied"
                  >
                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">
                        Request Denied
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Your{" "}
                        <span className="font-medium capitalize">
                          {myRoleRequest.requestedRole}
                        </span>{" "}
                        request was not approved.
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="ml-auto shrink-0 border-destructive/40 text-destructive bg-destructive/10 capitalize"
                    >
                      Denied
                    </Badge>
                  </div>
                  <form
                    onSubmit={handleSubmitRoleRequest}
                    className="space-y-3 pt-1"
                    data-ocid="candidate.role_resubmit_form"
                  >
                    <p className="text-xs text-muted-foreground">
                      You can resubmit with a stronger reason:
                    </p>
                    <div className="space-y-1.5">
                      <Label htmlFor="role-resubmit">Role</Label>
                      <Select
                        value={roleForm.role}
                        onValueChange={(v) =>
                          setRoleForm((p) => ({
                            ...p,
                            role: v as RequestedRole,
                          }))
                        }
                      >
                        <SelectTrigger
                          id="role-resubmit"
                          data-ocid="candidate.role_request_select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="evaluator">Evaluator</SelectItem>
                          <SelectItem value="recruiter">Recruiter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reason-resubmit">Reason</Label>
                      <Textarea
                        id="reason-resubmit"
                        placeholder="Why do you need this role?"
                        rows={2}
                        value={roleForm.reason}
                        onChange={(e) =>
                          setRoleForm((p) => ({ ...p, reason: e.target.value }))
                        }
                        data-ocid="candidate.role_request_textarea"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submittingRole || !roleForm.reason.trim()}
                      data-ocid="candidate.role_request_submit_button"
                    >
                      {submittingRole ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      ) : (
                        <UserCog className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Resubmit Request
                    </Button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleSubmitRoleRequest}
              className="space-y-4"
              data-ocid="candidate.role_request_form"
            >
              <div className="space-y-1.5">
                <Label htmlFor="role-select">Requested Role</Label>
                <Select
                  value={roleForm.role}
                  onValueChange={(v) =>
                    setRoleForm((p) => ({ ...p, role: v as RequestedRole }))
                  }
                >
                  <SelectTrigger
                    id="role-select"
                    data-ocid="candidate.role_request_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="evaluator">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        Evaluator — review & score candidates
                      </div>
                    </SelectItem>
                    <SelectItem value="recruiter">
                      <div className="flex items-center gap-2">
                        <UserCog className="h-3.5 w-3.5 text-primary" />
                        Recruiter — manage interviews & analytics
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason for Request</Label>
                <Textarea
                  id="reason"
                  placeholder="Briefly explain why you need this role (e.g., I am an HR professional who needs to evaluate candidates for our company)."
                  rows={3}
                  value={roleForm.reason}
                  onChange={(e) =>
                    setRoleForm((p) => ({ ...p, reason: e.target.value }))
                  }
                  data-ocid="candidate.role_request_textarea"
                />
              </div>
              <Button
                type="submit"
                disabled={submittingRole || !roleForm.reason.trim()}
                className="w-full"
                data-ocid="candidate.role_request_submit_button"
              >
                {submittingRole ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <UserCog className="h-4 w-4 mr-2" />
                    Submit Role Request
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          className="border-border/60 hover:border-primary/30 transition-colors group cursor-pointer border-primary/20 bg-primary/5"
          data-ocid="candidate.assessment_card"
        >
          <CardContent className="p-6">
            <Link to="/assessment" className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Brain size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm">
                  Take Assessment
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Auto-generated · 5 questions · 30 min
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-muted-foreground group-hover:text-primary transition-colors"
              />
            </Link>
          </CardContent>
        </Card>

        <Card
          className="border-border/60 hover:border-primary/30 transition-colors group cursor-pointer"
          data-ocid="candidate.student_dashboard_card"
        >
          <CardContent className="p-6">
            <Link to="/student-dashboard" className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                <GraduationCap size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm">
                  Resume & Learning
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload resume · Study notes · MCQ quiz
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-muted-foreground group-hover:text-primary transition-colors"
              />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-primary/30 transition-colors group cursor-pointer">
          <CardContent className="p-6">
            <Link to="/mock-interview/new" className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PlayCircle size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm">
                  Mock Interview
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select questions and set your own pace
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-muted-foreground group-hover:text-primary transition-colors"
              />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/60 hover:border-primary/30 transition-colors group cursor-pointer">
          <CardContent className="p-6">
            <Link to="/onboarding" className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
                <Target size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm">
                  Update Profile
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Edit your target role and experience
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-muted-foreground group-hover:text-primary transition-colors"
              />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  iconBg,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg: string;
  loading?: boolean;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}
          >
            {icon}
          </div>
          <div>
            {loading ? (
              <>
                <Skeleton className="h-5 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="font-display text-xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
