import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogIn,
  Shield,
  UserCog,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAssignUserRole,
  useGetCallerRole,
  useIsCallerAdmin,
} from "../hooks/useQueries";

export function AdminPage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: checkingAdmin } = useIsCallerAdmin();
  const { data: callerRole, isLoading: checkingRole } = useGetCallerRole();
  const assignRole = useAssignUserRole();

  // If already admin, redirect to dashboard
  useEffect(() => {
    if (isAdmin) {
      void navigate({ to: "/admin/dashboard" });
    }
  }, [isAdmin, navigate]);

  const handleBecomeAdmin = async () => {
    if (!identity) return;
    const principal = identity.getPrincipal();
    try {
      await assignRole.mutateAsync({
        user: principal as never,
        role: UserRole.admin,
      });
      toast.success("You are now an admin! Redirecting to dashboard...");
      await navigate({ to: "/admin/dashboard" });
    } catch (err) {
      toast.error("Failed to assign admin role. Please try again.");
      console.error(err);
    }
  };

  const isLoading = isInitializing || checkingAdmin || checkingRole;

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-16">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20"
            data-ocid="admin.panel"
          >
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
            Admin Portal
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage roles, question banks, and platform settings
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <Card className="border-border/60" data-ocid="admin.loading_state">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        )}

        {/* Not authenticated */}
        {!isLoading && !isAuthenticated && (
          <Card className="border-border/60 shadow-sm" data-ocid="admin.card">
            <CardHeader className="text-center pb-4">
              <CardTitle className="font-display text-lg">
                Authentication Required
              </CardTitle>
              <CardDescription>
                Sign in with Internet Identity to access the admin portal and
                manage platform settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 border border-border/60 p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Admin access is granted to principals who self-promote or
                    are assigned the admin role. Sign in to check your current
                    role.
                  </p>
                </div>
              </div>

              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="admin.login_button"
              >
                {isLoggingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isLoggingIn
                  ? "Connecting..."
                  : "Sign In with Internet Identity"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Authenticated but not admin */}
        {!isLoading && isAuthenticated && !isAdmin && (
          <Card className="border-border/60 shadow-sm" data-ocid="admin.card">
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" />
                Your Access Level
              </CardTitle>
              <CardDescription>
                Your account is authenticated but does not have admin privileges
                yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Current role info */}
              <div className="flex items-center justify-between rounded-lg bg-muted/40 border border-border/60 px-4 py-3">
                <span className="text-sm text-muted-foreground font-medium">
                  Current Role
                </span>
                <Badge
                  variant="outline"
                  className="text-xs capitalize border-border/60"
                  data-ocid="admin.role_badge"
                >
                  {callerRole ?? "guest"}
                </Badge>
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-1">
                <p className="text-sm font-medium text-primary">
                  Promote yourself to Admin
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click the button below to grant yourself admin access. This
                  unlocks the Admin Dashboard, role management, and full
                  Question Bank control.
                </p>
              </div>

              <Button
                onClick={handleBecomeAdmin}
                disabled={assignRole.isPending}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="admin.become_admin_button"
              >
                {assignRole.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
                {assignRole.isPending ? "Promoting..." : "Become Admin"}
              </Button>

              {assignRole.isError && (
                <div
                  className="flex items-center gap-2 text-xs text-destructive"
                  data-ocid="admin.error_state"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Failed to promote. Please try again.
                </div>
              )}

              {assignRole.isSuccess && (
                <div
                  className="flex items-center gap-2 text-xs text-success"
                  data-ocid="admin.success_state"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Role promoted! Redirecting...
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
