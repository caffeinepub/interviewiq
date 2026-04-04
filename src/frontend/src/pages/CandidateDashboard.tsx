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
import { motion } from "motion/react";
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
        <Card className="glass-card gradient-border-blue max-w-md w-full text-center">
          <CardContent className="pt-10">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Please sign in to access your dashboard.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
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
    <div className="container py-10 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl glass-card gradient-border-blue p-8 mesh-bg"
      >
        <div className="orb orb-blue w-64 h-64 -top-16 -right-16 opacity-50" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative">
          <div>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <h1 className="font-display text-3xl font-black tracking-tight">
                  Welcome back,{" "}
                  <span className="text-gradient">{displayName}</span>!
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="text-xs border-primary/40 text-primary bg-primary/10 backdrop-blur-sm"
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
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 btn-glow"
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
              className="gap-2 border-white/20 bg-white/5 hover:bg-white/10"
              data-ocid="candidate.mock_interview_button"
            >
              <Link to="/mock-interview/new">
                <PlayCircle size={16} />
                Mock Interview
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Total Interviews"
          value={String(demoSessions.length)}
          iconBg="bg-info/10 text-info"
          gradientClass="gradient-border-blue"
          loading={isLoading}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Average Score"
          value={`${avgScore}%`}
          iconBg="bg-success/10 text-success"
          gradientClass="gradient-border-emerald"
          loading={isLoading}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Completed"
          value={String(completedSessions.length)}
          iconBg="bg-primary/10 text-primary"
          gradientClass="gradient-border-blue"
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
          gradientClass="gradient-border-violet"
          loading={isLoading}
        />
      </div>

      {/* Gemini AI Interview Feature Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="glass-card gradient-border-blue overflow-hidden relative">
          <div className="orb orb-blue w-40 h-40 -top-8 -right-8" />
          <div
            className="orb orb-cyan w-24 h-24 -bottom-4 left-1/3"
            style={{ animationDelay: "2s" }}
          />
          <CardHeader className="pb-3 relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-glow text-white">
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
              <Badge className="ml-auto bg-primary/20 text-primary border-primary/30 text-xs backdrop-blur-sm">
                AI Powered
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
                  color: "text-primary",
                  bg: "bg-primary/10",
                },
                {
                  icon: <Zap className="h-4 w-4" />,
                  label: "Adaptive Difficulty",
                  desc: "Adjusts based on your answers",
                  color: "text-cyan-400",
                  bg: "bg-cyan-500/10",
                },
                {
                  icon: <Target className="h-4 w-4" />,
                  label: "AI Evaluation",
                  desc: "Score + tips after each answer",
                  color: "text-success",
                  bg: "bg-success/10",
                },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-start gap-2 rounded-xl bg-background/40 border border-white/10 p-3 backdrop-blur-sm"
                >
                  <div className={`${f.color} ${f.bg} p-1.5 rounded-lg mt-0.5`}>
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              asChild
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 btn-glow"
              data-ocid="candidate.gemini_interview_button"
            >
              <Link to="/gemini-interview">
                <Sparkles size={16} />
                Start AI Interview
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Interviewer Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="glass-card gradient-border-cyan overflow-hidden relative">
          <div className="orb orb-cyan w-32 h-32 -top-8 -right-8" />
          <CardHeader className="pb-3 relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-glow-cyan text-white">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-display text-lg">
                  AI Interviewer
                </CardTitle>
                <CardDescription className="text-xs">
                  Conversational interview — one question at a time, real
                  feedback after every answer
                </CardDescription>
              </div>
              <Badge className="ml-auto bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 shadow-glow-cyan"
              data-ocid="candidate.ai_interviewer_button"
            >
              <Link to="/ai-interviewer">
                <MessageCircle size={16} />
                Start Conversation
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Overall Progress */}
      <Card className="glass-card gradient-border-blue">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-lg">
            Overall Progress
          </CardTitle>
          <CardDescription>Your interview readiness score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground">Readiness Score</span>
                <span className="font-bold text-gradient">{avgScore}%</span>
              </div>
              <div className="relative h-3 w-full rounded-full overflow-hidden bg-muted/40">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000"
                  style={{ width: `${avgScore}%` }}
                />
              </div>
            </div>
            <div className="font-display text-4xl font-black text-gradient min-w-[4rem] text-right">
              {avgScore}%
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Based on {completedSessions.length} completed interviews
          </p>
        </CardContent>
      </Card>

      {/* Session List */}
      <Card className="glass-card gradient-border-blue">
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
            className="gap-1 text-xs border-white/20 bg-white/5 hover:bg-white/10"
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
              className="flex flex-col items-center justify-center py-14 text-center"
              data-ocid="candidate.sessions_empty_state"
            >
              <div className="relative mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
                  <Brain className="h-8 w-8" />
                </div>
                <div className="absolute -inset-2 rounded-2xl bg-primary/5 animate-pulse" />
              </div>
              <p className="text-foreground font-semibold text-lg">
                No sessions yet
              </p>
              <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-xs">
                Take an auto-generated assessment or start a custom mock
                interview to track your progress.
              </p>
              <div className="flex gap-3 flex-wrap justify-center">
                <Button
                  asChild
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white btn-glow"
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
                  className="border-white/20 bg-white/5 hover:bg-white/10"
                  data-ocid="candidate.sessions_mock_button"
                >
                  <Link to="/mock-interview/new">Mock Interview</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="divide-y divide-white/5"
              data-ocid="candidate.sessions_list"
            >
              {demoSessions.map((session, idx) => (
                <div
                  key={session.id.toString()}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  data-ocid={`candidate.sessions.item.${idx + 1}`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
                      <span className="text-sm font-bold text-gradient">
                        {session.score}%
                      </span>
                    )}
                    <StatusBadge status={session.status} />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-white/10"
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
        className="glass-card gradient-border-violet"
        data-ocid="candidate.role_request_card"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
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
                  className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4"
                  style={{ boxShadow: "0 0 20px oklch(0.78 0.18 70 / 0.15)" }}
                  data-ocid="candidate.role_request_pending"
                >
                  <Clock className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-400">
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
                    className="ml-auto shrink-0 border-yellow-500/40 text-yellow-400 bg-yellow-500/10 capitalize"
                  >
                    {myRoleRequest.status}
                  </Badge>
                </div>
              )}
              {myRoleRequest.status === "approved" && (
                <div
                  className="flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4"
                  style={{ boxShadow: "0 0 20px oklch(0.65 0.18 145 / 0.2)" }}
                  data-ocid="candidate.role_request_approved"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-400">
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
                    className="ml-auto shrink-0 border-green-500/40 text-green-400 bg-green-500/10 capitalize"
                  >
                    Approved
                  </Badge>
                </div>
              )}
              {myRoleRequest.status === "denied" && (
                <div className="space-y-3">
                  <div
                    className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4"
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
                        className="bg-background/40 border-white/10"
                        data-ocid="candidate.role_request_textarea"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submittingRole || !roleForm.reason.trim()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white btn-glow"
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
                        Evaluator — review &amp; score candidates
                      </div>
                    </SelectItem>
                    <SelectItem value="recruiter">
                      <div className="flex items-center gap-2">
                        <UserCog className="h-3.5 w-3.5 text-primary" />
                        Recruiter — manage interviews &amp; analytics
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
                  className="bg-background/40 border-white/10"
                  data-ocid="candidate.role_request_textarea"
                />
              </div>
              <Button
                type="submit"
                disabled={submittingRole || !roleForm.reason.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white btn-glow"
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
        {[
          {
            to: "/assessment",
            icon: <Brain size={20} />,
            title: "Take Assessment",
            desc: "Auto-generated · 5 questions · 30 min",
            iconBg: "bg-primary/10 text-primary",
            border: "gradient-border-blue",
            ocid: "candidate.assessment_card",
          },
          {
            to: "/student-dashboard",
            icon: <GraduationCap size={20} />,
            title: "Resume & Learning",
            desc: "Upload resume · Study notes · MCQ quiz",
            iconBg: "bg-success/10 text-success",
            border: "gradient-border-emerald",
            ocid: "candidate.student_dashboard_card",
          },
          {
            to: "/mock-interview/new",
            icon: <PlayCircle size={20} />,
            title: "Mock Interview",
            desc: "Select questions and set your own pace",
            iconBg: "bg-primary/10 text-primary",
            border: "gradient-border-blue",
            ocid: "candidate.mock_card",
          },
          {
            to: "/onboarding",
            icon: <Target size={20} />,
            title: "Update Profile",
            desc: "Edit your target role and experience",
            iconBg: "bg-info/10 text-info",
            border: "gradient-border-cyan",
            ocid: "candidate.profile_card",
          },
        ].map((card) => (
          <motion.div
            key={card.to}
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={`glass-card ${card.border} hover:shadow-glow transition-all duration-300 cursor-pointer`}
              data-ocid={card.ocid}
            >
              <CardContent className="p-5">
                <Link to={card.to} className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
                  >
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm">
                      {card.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {card.desc}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  iconBg,
  gradientClass,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg: string;
  gradientClass: string;
  loading?: boolean;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className={`glass-card ${gradientClass} stat-card-glow`}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ring-1 ring-current/20`}
            >
              {icon}
            </div>
            <div>
              {loading ? (
                <>
                  <Skeleton className="h-6 w-16 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <div className="font-display text-2xl font-black text-gradient">
                    {value}
                  </div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
