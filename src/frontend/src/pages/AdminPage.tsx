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
  CheckCircle2,
  Copy,
  Loader2,
  LogIn,
  Shield,
  UserCog,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useClaimFirstAdmin,
  useIsCallerAdmin,
  useSelfRegisterAsUser,
} from "../hooks/useQueries";

export function AdminPage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: isAdmin,
    isLoading: checkingAdmin,
    refetch: refetchAdmin,
  } = useIsCallerAdmin();
  const claimAdmin = useClaimFirstAdmin();
  const selfRegister = useSelfRegisterAsUser();
  const { actor } = useActor();

  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // If already admin, redirect to dashboard immediately
  useEffect(() => {
    if (isAdmin) {
      void navigate({ to: "/admin/dashboard" });
    }
  }, [isAdmin, navigate]);

  // Auto-register as user in the background when authenticated
  const selfRegisterMutate = selfRegister.mutate;
  useEffect(() => {
    if (isAuthenticated && actor) {
      selfRegisterMutate(undefined, {
        onError: () => {
          // Silently ignore — user may already be registered
        },
      });
    }
  }, [isAuthenticated, actor, selfRegisterMutate]);

  const isLoading = isInitializing || checkingAdmin;
  const principalFull = identity ? identity.getPrincipal().toString() : "";

  const handleCopyPrincipal = () => {
    if (!principalFull) return;
    void navigator.clipboard.writeText(principalFull);
    setCopied(true);
    toast.success("Principal ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimAdmin = async () => {
    setClaiming(true);
    try {
      // Step 1: ensure registered first (await this explicitly)
      try {
        await selfRegister.mutateAsync(undefined);
      } catch {
        // already registered — ignore
      }
      // Step 2: claim admin
      await claimAdmin.mutateAsync();
      toast.success("Admin role activated! Redirecting to dashboard...");
      await refetchAdmin();
      void navigate({ to: "/admin/dashboard" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.includes("Admin already claimed") ||
        message.includes("already been claimed")
      ) {
        toast.error(
          "Admin role is already taken. Share your Principal ID with the existing admin to get your role assigned.",
        );
      } else {
        toast.error(`Could not activate admin role: ${message}`);
      }
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-16">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
            Admin Portal
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage roles, question banks, and platform settings
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <Card className="border-border/60" data-ocid="admin.loading_state">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        )}

        {/* Not authenticated */}
        {!isLoading && !isAuthenticated && (
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="font-display text-lg">
                Sign In to Continue
              </CardTitle>
              <CardDescription className="leading-relaxed">
                Sign in with Internet Identity to access the Admin Portal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold"
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

        {/* Authenticated — show one-click Become Admin */}
        {!isLoading && isAuthenticated && !isAdmin && (
          <>
            {/* Identity info */}
            <div className="flex items-center justify-between rounded-lg bg-muted/40 border border-border/60 px-4 py-3 gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-mono text-xs text-muted-foreground truncate">
                  {principalFull}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className="text-xs capitalize border-border/60"
                  data-ocid="admin.role_badge"
                >
                  user
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={handleCopyPrincipal}
                  title="Copy Principal ID"
                  data-ocid="admin.copy_principal_button"
                >
                  {copied ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* One-click Become Admin Card */}
            <Card className="border-primary/30 shadow-md bg-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-xl flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Become Admin
                </CardTitle>
                <CardDescription className="leading-relaxed">
                  One click — instantly activate admin access for your account
                  and get redirected to the Admin Dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-bold shadow-glow"
                  onClick={handleClaimAdmin}
                  disabled={claiming}
                  data-ocid="admin.become_admin_button"
                >
                  {claiming ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Shield className="h-5 w-5" />
                  )}
                  {claiming ? "Activating Admin Role…" : "Become Admin"}
                </Button>

                <div className="rounded-lg bg-muted/50 border border-border/60 p-3">
                  <p className="text-xs font-medium mb-1">Your Principal ID</p>
                  <p className="font-mono text-xs text-muted-foreground break-all select-all">
                    {principalFull}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2 h-9 text-xs border-border/60"
                  onClick={handleCopyPrincipal}
                  data-ocid="admin.copy_id_button"
                >
                  {copied ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy Principal ID"}
                </Button>
              </CardContent>
            </Card>

            {/* Note for users needing role from existing admin */}
            <Card className="border-border/60">
              <CardContent className="py-4 px-5">
                <div className="flex items-start gap-3">
                  <UserCog className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    If an admin already exists and you need a role assigned,
                    share your Principal ID with them. They can promote your
                    account from the Admin Dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Redirecting to dashboard */}
        {!isLoading && isAuthenticated && isAdmin === true && (
          <Card className="border-border/60" data-ocid="admin.success_state">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <p className="text-sm font-medium">
                Admin verified. Redirecting to dashboard...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
