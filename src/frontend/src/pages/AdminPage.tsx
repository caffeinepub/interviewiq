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
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Loader2,
  LogIn,
  Shield,
  UserCog,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useClaimFirstAdmin,
  useGetAdminAssigned,
  useGetCallerRole,
  useIsCallerAdmin,
} from "../hooks/useQueries";

export function AdminPage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;

  const { actor } = useActor();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsCallerAdmin();
  const { data: callerRole, isLoading: checkingRole } = useGetCallerRole();
  const { data: adminAssigned, isLoading: checkingAdminAssigned } =
    useGetAdminAssigned();

  const claimFirstAdmin = useClaimFirstAdmin();

  const [adminToken, setAdminToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activateError, setActivateError] = useState("");
  const [activateSuccess, setActivateSuccess] = useState(false);

  // If already admin, redirect to dashboard
  useEffect(() => {
    if (isAdmin) {
      void navigate({ to: "/admin/dashboard" });
    }
  }, [isAdmin, navigate]);

  const handleClaimAdmin = async () => {
    try {
      await claimFirstAdmin.mutateAsync();
      toast.success("You are now Admin! Redirecting to dashboard...");
      void navigate({ to: "/admin/dashboard" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to claim admin: ${message}`);
    }
  };

  const handleActivateAdmin = async () => {
    if (!actor) return;
    if (!adminToken.trim()) {
      setActivateError("Please enter the admin activation token.");
      return;
    }

    setIsActivating(true);
    setActivateError("");
    setActivateSuccess(false);

    try {
      // Call _initializeAccessControlWithSecret directly on the actor
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any)._initializeAccessControlWithSecret(
        adminToken.trim(),
      );
      setActivateSuccess(true);
      toast.success("Admin role activated! Redirecting to dashboard...");
    } catch (err) {
      console.error("Admin activation failed:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      if (
        message.includes("already initialized") ||
        message.includes("admin")
      ) {
        setActivateError(
          "Admin role is already assigned to another account, or the token is incorrect.",
        );
      } else {
        setActivateError(
          "Activation failed. Check that the token is correct and try again.",
        );
      }
    } finally {
      setIsActivating(false);
    }
  };

  const isLoading =
    isInitializing || checkingAdmin || checkingRole || checkingAdminAssigned;

  // Truncated principal for display
  const principalDisplay = identity
    ? (() => {
        const p = identity.getPrincipal().toString();
        return p.length > 20 ? `${p.slice(0, 10)}…${p.slice(-8)}` : p;
      })()
    : "";

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
          <Card className="border-border/60 shadow-sm">
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
                    Sign in first to access admin setup. If you are the first
                    user, you can claim admin access instantly with one click —
                    no token needed.
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
          <>
            {/* Signed-in identity info */}
            <div className="flex items-center justify-between rounded-lg bg-muted/40 border border-border/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-mono text-xs text-muted-foreground truncate max-w-[180px]">
                  {principalDisplay}
                </span>
              </div>
              <Badge
                variant="outline"
                className="text-xs capitalize border-border/60 shrink-0"
                data-ocid="admin.role_badge"
              >
                {callerRole ?? "guest"}
              </Badge>
            </div>

            {/* Path A: No admin assigned yet — Claim First Admin */}
            {adminAssigned === false && (
              <Card className="border-2 border-primary/40 shadow-md bg-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/40 text-xs">
                      First Setup
                    </Badge>
                  </div>
                  <CardTitle className="font-display text-xl">
                    Claim Admin Access
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    No admin has been assigned yet. You are the first user —
                    click the button below to become admin instantly. No token
                    required.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-primary/80 leading-relaxed">
                        This action can only be performed once — by the very
                        first person to sign in. Once claimed, future admin
                        assignments must go through the token or role management
                        flow.
                      </p>
                    </div>
                  </div>

                  {claimFirstAdmin.isError && (
                    <div
                      className="flex items-center gap-1.5 text-xs text-destructive rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2"
                      data-ocid="admin.error_state"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {claimFirstAdmin.error instanceof Error
                        ? claimFirstAdmin.error.message
                        : "Failed to claim admin. Please try again."}
                    </div>
                  )}

                  <Button
                    onClick={handleClaimAdmin}
                    disabled={claimFirstAdmin.isPending}
                    className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 text-base shadow-lg shadow-primary/20"
                    data-ocid="admin.claim_admin_button"
                  >
                    {claimFirstAdmin.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Shield className="h-5 w-5" />
                    )}
                    {claimFirstAdmin.isPending
                      ? "Claiming Admin..."
                      : "Claim Admin Access"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Path B: Admin already assigned — Token activation fallback */}
            {adminAssigned === true && (
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-primary" />
                    Activate Admin Role
                  </CardTitle>
                  <CardDescription>
                    An admin already exists. Enter your admin activation token
                    to gain admin privileges for this account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* How to get token info */}
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-sm font-medium text-primary">
                        Where to find your admin token
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed ml-6">
                      Your admin token is provided by the Caffeine platform. It
                      may appear in your project's deployment settings or in the
                      Caffeine admin panel. Paste it below to activate admin
                      access for your account.
                    </p>
                  </div>

                  {/* Token input */}
                  <div className="space-y-2">
                    <Label htmlFor="adminToken">Admin Activation Token</Label>
                    <div className="relative">
                      <Input
                        id="adminToken"
                        type={showToken ? "text" : "password"}
                        placeholder="Paste your admin token here..."
                        value={adminToken}
                        onChange={(e) => {
                          setAdminToken(e.target.value);
                          setActivateError("");
                        }}
                        className={`pr-10 ${activateError ? "border-destructive" : ""}`}
                        data-ocid="admin.token_input"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void handleActivateAdmin();
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowToken((v) => !v)}
                      >
                        {showToken ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {activateError && (
                      <div
                        className="flex items-center gap-1.5 text-xs text-destructive"
                        data-ocid="admin.error_state"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {activateError}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleActivateAdmin}
                    disabled={isActivating || !adminToken.trim()}
                    className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    data-ocid="admin.activate_admin_button"
                  >
                    {isActivating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                    {isActivating ? "Activating..." : "Activate Admin Role"}
                  </Button>

                  {activateSuccess && (
                    <div
                      className="flex items-center gap-2 text-xs text-success"
                      data-ocid="admin.success_state"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      Admin role activated! Redirecting to dashboard...
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
