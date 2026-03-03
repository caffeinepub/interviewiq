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
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  BrainCircuit,
  ChevronRight,
  Clock,
  PlayCircle,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { InterviewStatus } from "../backend.d";
import { StatusBadge } from "../components/StatusBadge";
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

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
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
