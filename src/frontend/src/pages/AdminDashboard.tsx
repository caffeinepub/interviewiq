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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Ban,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Copy,
  Database,
  Flag,
  Info,
  Loader2,
  RefreshCw,
  Shield,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import type { RoleRequest } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddQuestion,
  useAssignUserRole,
  useBanUser,
  useDemoteToUser,
  useGetAllCandidateProfiles,
  useGetAllQuestions,
  useGetAllRoleRequests,
  useGetAllSessions,
  useGetAllUserRoles,
  useGetBannedUsers,
  useGetCheatingLogs,
  useGetFlaggedSessions,
  useGetGlobalDifficulty,
  useGetPlatformStats,
  usePromoteToAdmin,
  usePromoteToRecruiter,
  useSetGlobalDifficulty,
  useUnbanUser,
} from "../hooks/useQueries";
import { SEED_QUESTIONS } from "./QuestionBank";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!actor || registered) return;
    void (async () => {
      try {
        await actor.selfRegisterAsUser();
      } catch {
        // already registered
      }
      setRegistered(true);
    })();
  }, [actor, registered]);

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && registered,
  });

  // Existing data
  const { data: questions, isLoading: questionsLoading } = useGetAllQuestions();
  const {
    data: candidateProfiles,
    isLoading: profilesLoading,
    refetch: refetchProfiles,
  } = useGetAllCandidateProfiles(!!isAdmin);

  // New data
  const { data: platformStats, isLoading: statsLoading } = useGetPlatformStats(
    !!isAdmin,
  );
  const { data: allSessions, isLoading: sessionsLoading } = useGetAllSessions(
    !!isAdmin,
  );
  const {
    data: allUserRoles,
    isLoading: rolesLoading,
    refetch: refetchRoles,
  } = useGetAllUserRoles(!!isAdmin);
  const {
    data: bannedUsers,
    isLoading: bannedLoading,
    refetch: refetchBanned,
  } = useGetBannedUsers(!!isAdmin);
  const { data: cheatingLogs, isLoading: logsLoading } = useGetCheatingLogs(
    !!isAdmin,
  );
  const { data: flaggedSessions } = useGetFlaggedSessions(!!isAdmin);
  const {
    data: roleRequests,
    isLoading: roleRequestsLoading,
    refetch: refetchRoleRequests,
  } = useGetAllRoleRequests(!!isAdmin);
  const { data: globalDifficulty } = useGetGlobalDifficulty(!!isAdmin);

  const assignRole = useAssignUserRole();
  const addQuestion = useAddQuestion();
  const promoteToRecruiter = usePromoteToRecruiter();
  const demoteToUser = useDemoteToUser();
  const promoteToAdmin = usePromoteToAdmin();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const setDifficulty = useSetGlobalDifficulty();

  const [principalId, setPrincipalId] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.user);
  const [formError, setFormError] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState(0);
  const [seedTotal] = useState(SEED_QUESTIONS.length);

  // Ban/Suspend dialog state
  const [banDialog, setBanDialog] = useState<{
    open: boolean;
    principal: string;
    reason: string;
  }>({ open: false, principal: "", reason: "" });

  const handleSeedQuestions = async () => {
    setIsSeeding(true);
    setSeedProgress(0);
    let seeded = 0;
    try {
      for (const q of SEED_QUESTIONS) {
        await addQuestion.mutateAsync({
          title: q.title,
          description: q.description,
          category: q.category,
          difficulty: q.difficulty,
          tags: q.tags,
        });
        seeded++;
        setSeedProgress(seeded);
      }
      toast.success(`Question bank seeded with ${seeded} questions!`);
    } catch (err) {
      toast.error(
        seeded > 0
          ? `Seeding stopped at ${seeded}/${seedTotal} — some questions may have been skipped.`
          : "Failed to seed questions. Make sure you are signed in as admin.",
      );
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    if (!checkingAdmin && isAdmin === false) {
      void navigate({ to: "/admin" });
    }
  }, [checkingAdmin, isAdmin, navigate]);

  const principalFull = identity
    ? identity.getPrincipal().toString()
    : "Not connected";

  const handleCopyPrincipal = () => {
    if (!identity) return;
    void navigator.clipboard.writeText(identity.getPrincipal().toString());
    toast.success("Principal ID copied to clipboard!");
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!principalId.trim()) {
      setFormError("Principal ID is required");
      return;
    }
    try {
      await assignRole.mutateAsync({
        user: principalId.trim() as never,
        role: selectedRole,
      });
      toast.success(
        `Role "${selectedRole}" assigned to ${principalId.slice(0, 12)}...`,
      );
      setPrincipalId("");
    } catch (err) {
      toast.error(
        "Failed to assign role. Check the principal ID and try again.",
      );
      console.error(err);
    }
  };

  const handleBanUser = async () => {
    if (!banDialog.reason.trim()) {
      toast.error("Please provide a reason.");
      return;
    }
    try {
      await banUser.mutateAsync({
        principal: banDialog.principal,
        reason: banDialog.reason,
      });
      toast.success("User banned.");
      setBanDialog({ open: false, principal: "", reason: "" });
      void refetchBanned();
    } catch {
      toast.error("Failed to ban user.");
    }
  };

  if (checkingAdmin) {
    return (
      <div
        className="container flex min-h-[60vh] items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const difficultyColors: Record<string, string> = {
    easy: "border-success/40 bg-success/10 text-success",
    medium: "border-warning/40 bg-warning/10 text-warning",
    hard: "border-destructive/40 bg-destructive/10 text-destructive",
  };

  const cheatingTypeColors: Record<string, string> = {
    tabSwitch: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    copyPaste: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  };

  return (
    <div className="container py-10 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                Admin Dashboard
              </h1>
              <Badge
                className="bg-primary/10 text-primary border-primary/30 text-xs"
                variant="outline"
                data-ocid="admin.role_badge"
              >
                Admin
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Full platform control and analytics
            </p>
          </div>
        </div>
      </div>

      {/* Admin Principal */}
      <Card className="border-border/60 bg-primary/5" data-ocid="admin.panel">
        <CardContent className="py-4 px-5">
          <div className="flex items-center gap-3 flex-wrap">
            <Shield className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium">Logged in as Admin</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="font-mono text-xs text-muted-foreground break-all flex-1">
              {principalFull}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0"
              onClick={handleCopyPrincipal}
              data-ocid="admin.copy_principal_button"
            >
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="analytics">
        <TabsList
          className="w-full flex-wrap h-auto gap-1"
          data-ocid="admin.tab"
        >
          <TabsTrigger value="analytics" data-ocid="admin.analytics_tab">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
            Platform Analytics
          </TabsTrigger>
          <TabsTrigger value="users" data-ocid="admin.users_tab">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="cheating" data-ocid="admin.cheating_tab">
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            Cheating Logs
          </TabsTrigger>
          <TabsTrigger value="questions" data-ocid="admin.questions_tab">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            Question Bank
          </TabsTrigger>
          <TabsTrigger value="profiles" data-ocid="admin.profiles_tab">
            <UserCog className="h-3.5 w-3.5 mr-1.5" />
            Candidate Profiles
          </TabsTrigger>
          <TabsTrigger
            value="role-requests"
            data-ocid="admin.role_requests_tab"
          >
            <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
            Role Requests
            {roleRequests &&
              roleRequests.filter((r: RoleRequest) => r.status === "pending")
                .length > 0 && (
                <Badge className="ml-1.5 h-4 min-w-[1rem] px-1 text-[10px] bg-yellow-500 text-white border-0">
                  {
                    roleRequests.filter(
                      (r: RoleRequest) => r.status === "pending",
                    ).length
                  }
                </Badge>
              )}
          </TabsTrigger>
        </TabsList>

        {/* ─── PLATFORM ANALYTICS ─── */}
        <TabsContent value="analytics" className="mt-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                label: "Total Users",
                value: platformStats?.totalUsers,
                icon: <Users className="h-4 w-4" />,
                color: "text-primary",
              },
              {
                label: "Total Sessions",
                value: platformStats?.totalSessions,
                icon: <Database className="h-4 w-4" />,
                color: "text-chart-2",
              },
              {
                label: "Flagged Sessions",
                value: platformStats?.flaggedSessions,
                icon: <Flag className="h-4 w-4" />,
                color: "text-destructive",
              },
              {
                label: "Total Questions",
                value: platformStats?.totalQuestions,
                icon: <BookOpen className="h-4 w-4" />,
                color: "text-success",
              },
              {
                label: "Banned Users",
                value: platformStats?.bannedUsersCount,
                icon: <Ban className="h-4 w-4" />,
                color: "text-warning",
              },
            ].map((s) => (
              <Card
                key={s.label}
                className="border-border/60"
                data-ocid="admin.card"
              >
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">{s.icon}</span>
                    {statsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <span
                        className={`font-display text-2xl font-bold ${s.color}`}
                      >
                        {s.value != null ? String(s.value) : "—"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Difficulty Control */}
          <Card className="border-border/60" data-ocid="admin.difficulty_card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">
                  AI Difficulty Control
                </CardTitle>
              </div>
              <CardDescription>
                Set the global difficulty level for all AI-generated
                assessments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  Current:{" "}
                  <span className="font-semibold text-foreground capitalize">
                    {globalDifficulty ?? "medium"}
                  </span>
                </p>
                <div className="flex gap-2 ml-4">
                  {(["easy", "medium", "hard"] as const).map((d) => (
                    <Button
                      key={d}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "capitalize",
                        globalDifficulty === d
                          ? `${difficultyColors[d]} font-bold`
                          : "",
                      )}
                      onClick={() => {
                        void setDifficulty
                          .mutateAsync(d)
                          .then(() =>
                            toast.success(`AI difficulty set to ${d}`),
                          );
                      }}
                      disabled={setDifficulty.isPending}
                      data-ocid={`admin.difficulty_${d}_button`}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Sessions</CardTitle>
                {allSessions && (
                  <Badge variant="outline" className="text-xs">
                    {allSessions.length} total
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div
                  className="flex justify-center py-6"
                  data-ocid="admin.loading_state"
                >
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : !allSessions?.length ? (
                <p
                  className="text-sm text-muted-foreground text-center py-6"
                  data-ocid="admin.empty_state"
                >
                  No sessions yet.
                </p>
              ) : (
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <Table data-ocid="admin.sessions_table">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs">ID</TableHead>
                        <TableHead className="text-xs">Candidate</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Score</TableHead>
                        <TableHead className="text-xs">Flagged</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allSessions.slice(0, 10).map((s, idx) => (
                        <TableRow
                          key={String(s.id)}
                          data-ocid={`admin.sessions_table.row.${idx + 1}`}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{String(s.id)}
                          </TableCell>
                          <TableCell className="text-xs">
                            {s.candidate.toString().slice(0, 12)}…
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {s.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {s.overallScore != null
                              ? `${String(s.overallScore)}%`
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {s.flagged ? (
                              <Badge className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                                Flagged
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── USER MANAGEMENT ─── */}
        <TabsContent value="users" className="mt-6 space-y-6">
          <Card className="border-border/60" data-ocid="admin.users_card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">All Users</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => void refetchRoles()}
                  data-ocid="admin.refresh_users_button"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${rolesLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
              <CardDescription>
                Manage roles, ban, or suspend users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rolesLoading ? (
                <div
                  className="flex justify-center py-6"
                  data-ocid="admin.loading_state"
                >
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : !allUserRoles?.length ? (
                <p
                  className="text-sm text-muted-foreground text-center py-6"
                  data-ocid="admin.empty_state"
                >
                  No users found.
                </p>
              ) : (
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <Table data-ocid="admin.users_table">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs">#</TableHead>
                        <TableHead className="text-xs">Principal</TableHead>
                        <TableHead className="text-xs">Role</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUserRoles.map(([principal, role], idx) => (
                        <TableRow
                          key={principal}
                          data-ocid={`admin.users_table.row.${idx + 1}`}
                        >
                          <TableCell className="text-xs text-muted-foreground">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs">
                                {principal.slice(0, 14)}…
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  void navigator.clipboard.writeText(principal);
                                  toast.success("Copied!");
                                }}
                                className="p-0.5 rounded hover:bg-muted"
                                data-ocid={`admin.copy_user_button.${idx + 1}`}
                              >
                                <Copy className="h-3 w-3 text-muted-foreground" />
                              </button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={async () => {
                                  try {
                                    await promoteToRecruiter.mutateAsync(
                                      principal,
                                    );
                                    toast.success("Promoted to Recruiter");
                                    void refetchRoles();
                                  } catch {
                                    toast.error("Failed");
                                  }
                                }}
                                data-ocid={`admin.promote_recruiter_button.${idx + 1}`}
                              >
                                ↑ Recruiter
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={async () => {
                                  try {
                                    await demoteToUser.mutateAsync(principal);
                                    toast.success("Demoted to User");
                                    void refetchRoles();
                                  } catch {
                                    toast.error("Failed");
                                  }
                                }}
                                data-ocid={`admin.demote_user_button.${idx + 1}`}
                              >
                                ↓ User
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={async () => {
                                  try {
                                    await promoteToAdmin.mutateAsync(principal);
                                    toast.success("Promoted to Admin");
                                    void refetchRoles();
                                  } catch {
                                    toast.error("Failed");
                                  }
                                }}
                                data-ocid={`admin.promote_admin_button.${idx + 1}`}
                              >
                                ↑ Admin
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={() =>
                                  setBanDialog({
                                    open: true,
                                    principal,
                                    reason: "",
                                  })
                                }
                                data-ocid={`admin.ban_button.${idx + 1}`}
                              >
                                Ban
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Banned Users */}
          <Card className="border-destructive/30" data-ocid="admin.banned_card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ban className="h-4 w-4 text-destructive" />
                  <CardTitle className="text-base">Banned Users</CardTitle>
                  {bannedUsers && (
                    <Badge variant="destructive" className="text-xs">
                      {bannedUsers.length}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => void refetchBanned()}
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${bannedLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {bannedLoading ? (
                <div
                  className="flex justify-center py-4"
                  data-ocid="admin.loading_state"
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : !bannedUsers?.length ? (
                <p
                  className="text-sm text-muted-foreground text-center py-4"
                  data-ocid="admin.empty_state"
                >
                  No banned users.
                </p>
              ) : (
                <Table data-ocid="admin.banned_table">
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs">Principal</TableHead>
                      <TableHead className="text-xs">Reason</TableHead>
                      <TableHead className="text-xs">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bannedUsers.map((u, idx) => (
                      <TableRow
                        key={u.principal.toString()}
                        data-ocid={`admin.banned_table.row.${idx + 1}`}
                      >
                        <TableCell className="font-mono text-xs">
                          {u.principal.toString().slice(0, 14)}…
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.reason}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={async () => {
                              try {
                                await unbanUser.mutateAsync(
                                  u.principal.toString(),
                                );
                                toast.success("User unbanned.");
                                void refetchBanned();
                              } catch {
                                toast.error("Failed to unban.");
                              }
                            }}
                            data-ocid={`admin.unban_button.${idx + 1}`}
                          >
                            Unban
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Role assignment hint */}
          <Card
            className="border-border/60 border-primary/20 bg-primary/5"
            data-ocid="admin.role_hint_card"
          >
            <CardContent className="py-4 px-5">
              <div className="flex items-start gap-3">
                <ClipboardList className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    Role Assignment via Requests
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Users can now request role upgrades directly from their
                    Candidate Dashboard. Review and approve them in the{" "}
                    <span className="font-semibold text-primary">
                      Role Requests
                    </span>{" "}
                    tab — no Principal ID copy-paste required.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── CHEATING LOGS ─── */}
        <TabsContent value="cheating" className="mt-6 space-y-6">
          {/* Count badges */}
          <div className="flex gap-3 flex-wrap">
            {[
              {
                type: "tabSwitch",
                label: "Tab Switches",
                color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-700",
              },
              {
                type: "copyPaste",
                label: "Copy-Paste",
                color: "bg-orange-500/10 border-orange-500/30 text-orange-700",
              },
            ].map((t) => {
              const count =
                cheatingLogs?.filter((l) => l.eventType === t.type).length ?? 0;
              return (
                <Badge
                  key={t.type}
                  variant="outline"
                  className={`text-sm px-3 py-1 ${t.color}`}
                >
                  {t.label}: {count}
                </Badge>
              );
            })}
            <Badge variant="outline" className="text-sm px-3 py-1">
              Total: {cheatingLogs?.length ?? 0}
            </Badge>
          </div>

          <Card
            className="border-border/60"
            data-ocid="admin.cheating_logs_card"
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <CardTitle className="text-base">Cheating Event Log</CardTitle>
              </div>
              <CardDescription>
                All detected suspicious activities across sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div
                  className="flex justify-center py-6"
                  data-ocid="admin.loading_state"
                >
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : !cheatingLogs?.length ? (
                <div
                  className="text-center py-10"
                  data-ocid="admin.cheating_logs_empty_state"
                >
                  <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No cheating events detected.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <Table data-ocid="admin.cheating_logs_table">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs">ID</TableHead>
                        <TableHead className="text-xs">Session</TableHead>
                        <TableHead className="text-xs">Principal</TableHead>
                        <TableHead className="text-xs">Event</TableHead>
                        <TableHead className="text-xs">Description</TableHead>
                        <TableHead className="text-xs">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cheatingLogs.map((log, idx) => (
                        <TableRow
                          key={String(log.id)}
                          data-ocid={`admin.cheating_logs_table.row.${idx + 1}`}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{String(log.id)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            #{String(log.sessionId)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.principal.toString().slice(0, 10)}…
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs ${cheatingTypeColors[log.eventType] ?? "bg-destructive/10 text-destructive border-destructive/30"}`}
                            >
                              {log.eventType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {log.description}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(
                              Number(log.timestamp) / 1_000_000,
                            ).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Flagged Sessions */}
          <Card
            className="border-destructive/20"
            data-ocid="admin.flagged_sessions_card"
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-destructive" />
                <CardTitle className="text-base">Flagged Sessions</CardTitle>
                {flaggedSessions && (
                  <Badge variant="destructive" className="text-xs">
                    {flaggedSessions.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!flaggedSessions?.length ? (
                <p
                  className="text-sm text-muted-foreground text-center py-4"
                  data-ocid="admin.flagged_sessions_empty_state"
                >
                  No flagged sessions.
                </p>
              ) : (
                <div className="space-y-2">
                  {flaggedSessions.map((s, idx) => (
                    <div
                      key={String(s.id)}
                      className="flex items-center justify-between gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2"
                      data-ocid={`admin.flagged_sessions_table.row.${idx + 1}`}
                    >
                      <div>
                        <p className="text-sm font-medium">
                          Session #{String(s.id)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.flagNote || "No note provided"}
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-xs shrink-0">
                        Flagged
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── QUESTION BANK ─── */}
        <TabsContent value="questions" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/60" data-ocid="admin.card">
              <CardContent className="pt-6 pb-5">
                <div className="flex items-center justify-between mb-2">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  {questionsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <span className="font-display text-3xl font-bold text-primary">
                      {questions?.length ?? 0}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium">Question Bank</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Total questions available
                </p>
                <Link
                  to="/questions"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  data-ocid="admin.questions_link"
                >
                  Manage Questions <ArrowRight size={11} />
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Seed Question Bank</CardTitle>
              </div>
              <CardDescription>
                Populate the bank with {seedTotal} pre-built questions across
                Behavioral, DSA, DBMS, OS, and System Design.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSeeding && (
                <div className="space-y-2">
                  <Progress
                    value={(seedProgress / seedTotal) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {seedProgress}/{seedTotal} questions seeded
                  </p>
                </div>
              )}
              <Button
                onClick={handleSeedQuestions}
                disabled={isSeeding}
                className="w-full sm:w-auto"
                data-ocid="admin.seed_questions_button"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Seed {seedTotal} Questions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── CANDIDATE PROFILES ─── */}
        <TabsContent value="profiles" className="mt-6">
          <Card className="border-border/60" data-ocid="admin.profiles_section">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="font-display text-lg">
                    User Profiles
                  </CardTitle>
                  {candidateProfiles && (
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/5 text-primary text-xs ml-1"
                    >
                      {candidateProfiles.length} total
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => void refetchProfiles()}
                  disabled={profilesLoading}
                  data-ocid="admin.refresh_profiles_button"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${profilesLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
              <CardDescription>
                All candidate profiles saved on-chain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profilesLoading ? (
                <div
                  className="flex items-center justify-center py-10"
                  data-ocid="admin.profiles_loading_state"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !candidateProfiles?.length ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  data-ocid="admin.profiles_empty_state"
                >
                  <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No profiles yet
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <Table data-ocid="admin.profiles_table">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs font-semibold">
                          #
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Name
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Email
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Target Role
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Experience
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Skills
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Principal ID
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidateProfiles.map(([principal, profile], idx) => (
                        <TableRow
                          key={principal}
                          className="hover:bg-muted/20"
                          data-ocid={`admin.profiles_table.row.${idx + 1}`}
                        >
                          <TableCell className="text-xs text-muted-foreground">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {profile.name || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {profile.email || "—"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {profile.targetRole || "—"}
                          </TableCell>
                          <TableCell className="text-sm">
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {profile.experienceLevel || "—"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                            {profile.extractedSkills?.length > 0 ? (
                              <span
                                className="truncate block"
                                title={profile.extractedSkills.join(", ")}
                              >
                                {profile.extractedSkills.slice(0, 4).join(", ")}
                                {profile.extractedSkills.length > 4 &&
                                  ` +${profile.extractedSkills.length - 4} more`}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/50">
                                None
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-muted-foreground">
                                {principal.slice(0, 12)}…
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  void navigator.clipboard.writeText(principal);
                                  toast.success("Principal ID copied!");
                                }}
                                className="shrink-0 p-0.5 rounded hover:bg-muted transition-colors"
                                data-ocid={`admin.copy_profile_principal_button.${idx + 1}`}
                              >
                                <Copy className="h-3 w-3 text-muted-foreground" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ROLE REQUESTS ─── */}
        <TabsContent value="role-requests" className="mt-6 space-y-6">
          <Card
            className="border-border/60"
            data-ocid="admin.role_requests_card"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Role Requests</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => void refetchRoleRequests()}
                  data-ocid="admin.refresh_role_requests_button"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${roleRequestsLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
              <CardDescription>
                Review and act on user role upgrade requests. No Principal ID
                copy-paste needed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {roleRequestsLoading ? (
                <div
                  className="flex justify-center py-8"
                  data-ocid="admin.role_requests_loading_state"
                >
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : !roleRequests?.length ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  data-ocid="admin.role_requests_empty_state"
                >
                  <ClipboardList className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No role requests yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    When candidates request a role upgrade, they will appear
                    here.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <Table data-ocid="admin.role_requests_table">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs">#</TableHead>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">
                          Requested Role
                        </TableHead>
                        <TableHead className="text-xs">Reason</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(roleRequests as RoleRequest[]).map((req, idx) => (
                        <RoleRequestRow
                          key={req.requester.toString()}
                          req={req}
                          idx={idx}
                          actor={actor}
                          refetch={refetchRoleRequests}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced: Principal ID role assignment */}
          <details className="group" data-ocid="admin.advanced_role_section">
            <summary className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors list-none">
              <UserCog className="h-4 w-4 text-muted-foreground" />
              <span>Advanced: Assign Role by Principal ID</span>
              <span className="ml-auto text-xs text-muted-foreground group-open:hidden">
                Show
              </span>
              <span className="ml-auto text-xs text-muted-foreground hidden group-open:inline">
                Hide
              </span>
            </summary>
            <div className="mt-3 rounded-lg border border-border/60 p-5">
              <form onSubmit={handleAssignRole} className="space-y-4">
                {identity && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium">Your Principal ID</p>
                      <p className="font-mono text-xs text-muted-foreground truncate max-w-xs">
                        {principalFull}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs shrink-0"
                      onClick={() => setPrincipalId(principalFull)}
                      data-ocid="admin.use_own_principal_button"
                    >
                      <Copy className="h-3 w-3" /> Use Mine
                    </Button>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="pid-adv">Target Principal ID</Label>
                  <Input
                    id="pid-adv"
                    value={principalId}
                    onChange={(e) => setPrincipalId(e.target.value)}
                    placeholder="aaaaa-bbbbb-..."
                    className="font-mono text-xs"
                    data-ocid="admin.principal_input"
                  />
                  {formError && (
                    <p className="text-xs text-destructive">{formError}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(v) => setSelectedRole(v as UserRole)}
                  >
                    <SelectTrigger data-ocid="admin.role_select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.user}>
                        User / Candidate
                      </SelectItem>
                      <SelectItem value="evaluator">Evaluator</SelectItem>
                      <SelectItem value={UserRole.admin}>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={assignRole.isPending}
                  className="w-full"
                  data-ocid="admin.assign_role_button"
                >
                  {assignRole.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Assign Role"
                  )}
                </Button>
              </form>
            </div>
          </details>
        </TabsContent>
      </Tabs>

      {/* Ban Dialog */}
      <Dialog
        open={banDialog.open}
        onOpenChange={(o) => setBanDialog((p) => ({ ...p, open: o }))}
      >
        <DialogContent data-ocid="admin.ban_dialog">
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs font-medium">Principal</p>
              <p className="font-mono text-xs text-muted-foreground break-all">
                {banDialog.principal}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ban-reason">Reason for ban</Label>
              <Input
                id="ban-reason"
                value={banDialog.reason}
                onChange={(e) =>
                  setBanDialog((p) => ({ ...p, reason: e.target.value }))
                }
                placeholder="e.g. Repeated cheating violations"
                data-ocid="admin.ban_reason_input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setBanDialog({ open: false, principal: "", reason: "" })
              }
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanUser}
              disabled={banUser.isPending}
              data-ocid="admin.confirm_ban_button"
            >
              {banUser.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm Ban"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// cn helper inline since we can't import from utils here (already done via @/lib/utils)
function RoleRequestRow({
  req,
  idx,
  actor,
  refetch,
}: {
  req: import("../backend.d").RoleRequest;
  idx: number;
  actor: ReturnType<typeof import("../hooks/useActor").useActor>["actor"];
  refetch: () => void;
}) {
  const [acting, setActing] = useState<"approve" | "deny" | null>(null);

  const handleApprove = async () => {
    if (!actor) return;
    setActing("approve");
    try {
      await (actor as any).approveRoleRequest(req.requester);
      toast.success(`Approved ${req.name}'s ${req.requestedRole} request.`);
      refetch();
    } catch {
      toast.error("Failed to approve request.");
    } finally {
      setActing(null);
    }
  };

  const handleDeny = async () => {
    if (!actor) return;
    setActing("deny");
    try {
      await (actor as any).denyRoleRequest(req.requester);
      toast.success(`Denied ${req.name}'s role request.`);
      refetch();
    } catch {
      toast.error("Failed to deny request.");
    } finally {
      setActing(null);
    }
  };

  const statusStyles: Record<string, string> = {
    pending: "border-yellow-500/40 bg-yellow-500/10 text-yellow-600",
    approved: "border-green-500/40 bg-green-500/10 text-green-700",
    denied: "border-destructive/40 bg-destructive/10 text-destructive",
  };

  return (
    <TableRow data-ocid={`admin.role_requests_table.row.${idx + 1}`}>
      <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
      <TableCell>
        <div>
          <p className="text-sm font-medium">{req.name || "—"}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {req.requester.toString().slice(0, 14)}…
          </p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize text-xs">
          {req.requestedRole}
        </Badge>
      </TableCell>
      <TableCell className="max-w-[200px]">
        <p
          className="text-xs text-muted-foreground truncate"
          title={req.reason}
        >
          {req.reason}
        </p>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn("text-xs capitalize", statusStyles[req.status])}
        >
          {req.status}
        </Badge>
      </TableCell>
      <TableCell>
        {req.status === "pending" ? (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
              onClick={handleApprove}
              disabled={!!acting}
              data-ocid={`admin.role_requests_approve_button.${idx + 1}`}
            >
              {acting === "approve" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 text-xs"
              onClick={handleDeny}
              disabled={!!acting}
              data-ocid={`admin.role_requests_deny_button.${idx + 1}`}
            >
              {acting === "deny" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              Deny
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground capitalize">
            {req.status}
          </span>
        )}
      </TableCell>
    </TableRow>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
