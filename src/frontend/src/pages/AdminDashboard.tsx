import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Copy,
  Database,
  Lightbulb,
  Loader2,
  Shield,
  UserCog,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAssignUserRole,
  useGetAllQuestions,
  useIsCallerAdmin,
} from "../hooks/useQueries";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsCallerAdmin();
  const { data: questions, isLoading: questionsLoading } = useGetAllQuestions();
  const assignRole = useAssignUserRole();

  const [principalId, setPrincipalId] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.user);
  const [formError, setFormError] = useState("");

  // Redirect to admin portal if not admin
  useEffect(() => {
    if (!checkingAdmin && isAdmin === false) {
      void navigate({ to: "/admin" });
    }
  }, [isAdmin, checkingAdmin, navigate]);

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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container py-10 space-y-8 max-w-5xl">
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
              Platform management and role control
            </p>
          </div>
        </div>
      </div>

      {/* Admin Info */}
      <Card className="border-border/60 bg-primary/5" data-ocid="admin.panel">
        <CardContent className="py-4 px-5">
          <div className="flex items-center gap-3 flex-wrap">
            <Shield className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-foreground">
              Logged in as Admin
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span className="font-mono text-xs text-muted-foreground break-all flex-1">
              {principalFull}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0"
              onClick={handleCopyPrincipal}
              title="Copy your Principal ID"
              data-ocid="admin.copy_principal_button"
            >
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          className="border-border/60 group hover:border-primary/30 transition-colors"
          data-ocid="admin.card"
        >
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

        <Card
          className="border-border/60 group hover:border-primary/30 transition-colors"
          data-ocid="admin.card"
        >
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-display text-3xl font-bold text-chart-4">
                ∞
              </span>
            </div>
            <p className="text-sm font-medium">Evaluator Dashboard</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create and score interview sessions
            </p>
            <Link
              to="/evaluator"
              className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              data-ocid="admin.evaluator_link"
            >
              Open Evaluator <ArrowRight size={11} />
            </Link>
          </CardContent>
        </Card>

        <Card
          className="border-border/60 group hover:border-primary/30 transition-colors"
          data-ocid="admin.card"
        >
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center justify-between mb-2">
              <Lightbulb className="h-5 w-5 text-muted-foreground" />
              <span className="font-display text-3xl font-bold text-success">
                10
              </span>
            </div>
            <p className="text-sm font-medium">Answer Guide</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Classic interview question strategies
            </p>
            <Link
              to="/interview-answers"
              className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              data-ocid="admin.answers_link"
            >
              View Guide <ArrowRight size={11} />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Role Management */}
      <Card className="border-border/60" data-ocid="admin.role_section">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <CardTitle className="font-display text-lg">
              Role Management
            </CardTitle>
          </div>
          <CardDescription>
            Assign roles to any user by their Principal ID. Admins can grant
            admin or user roles. Ask the user to copy their Principal ID from
            their profile or the Admin Panel info bar above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAssignRole} className="space-y-5">
            {/* Quick self-assign shortcut */}
            {identity && (
              <div className="rounded-lg bg-muted/40 border border-border/60 p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-foreground">
                    Your Principal ID
                  </p>
                  <p className="font-mono text-xs text-muted-foreground truncate max-w-xs">
                    {principalFull}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 text-xs"
                  onClick={() => {
                    setPrincipalId(principalFull);
                    setFormError("");
                  }}
                  data-ocid="admin.use_own_principal_button"
                >
                  <UserCog className="h-3.5 w-3.5" />
                  Use Mine
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="principalId">Target Principal ID</Label>
              <Input
                id="principalId"
                placeholder="e.g. rrkah-fqaaa-aaaaa-aaaaq-cai"
                value={principalId}
                onChange={(e) => {
                  setPrincipalId(e.target.value);
                  setFormError("");
                }}
                className={formError ? "border-destructive" : ""}
                data-ocid="admin.role_input"
              />
              {formError && (
                <div
                  className="flex items-center gap-1.5 text-xs text-destructive"
                  data-ocid="admin.role_error"
                >
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {formError}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Enter the full Principal ID of the user you want to update, or
                click "Use Mine" above to assign a role to yourself.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleSelect">Role to Assign</Label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as UserRole)}
              >
                <SelectTrigger
                  id="roleSelect"
                  className="w-full sm:w-[200px]"
                  data-ocid="admin.role_select"
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.admin}>
                    <div className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value={UserRole.user}>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      User
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button
                type="submit"
                disabled={assignRole.isPending}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="admin.assign_role_button"
              >
                {assignRole.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCog className="h-4 w-4" />
                )}
                {assignRole.isPending ? "Assigning..." : "Assign Role"}
              </Button>

              {assignRole.isSuccess && (
                <div
                  className="flex items-center gap-1.5 text-xs text-success"
                  data-ocid="admin.assign_success_state"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Role assigned successfully
                </div>
              )}

              {assignRole.isError && (
                <div
                  className="flex items-center gap-1.5 text-xs text-destructive"
                  data-ocid="admin.assign_error_state"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  Assignment failed
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="font-display text-base">Quick Links</CardTitle>
          <CardDescription>Navigate to key platform areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3">
            <Link to="/questions" data-ocid="admin.questions_link">
              <div className="flex items-center gap-2.5 rounded-lg border border-border/60 px-4 py-3 text-sm hover:border-primary/30 hover:bg-primary/5 transition-colors group cursor-pointer">
                <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium">Question Bank</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
              </div>
            </Link>
            <Link to="/evaluator" data-ocid="admin.evaluator_link">
              <div className="flex items-center gap-2.5 rounded-lg border border-border/60 px-4 py-3 text-sm hover:border-primary/30 hover:bg-primary/5 transition-colors group cursor-pointer">
                <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium">Evaluator Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
              </div>
            </Link>
            <Link to="/interview-answers" data-ocid="admin.answers_link">
              <div className="flex items-center gap-2.5 rounded-lg border border-border/60 px-4 py-3 text-sm hover:border-primary/30 hover:bg-primary/5 transition-colors group cursor-pointer">
                <Lightbulb className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium">Answer Guide</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
