import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
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
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;

  const { actor, isFetching: actorFetching } = useActor();

  // Track the full setup sequence: register -> checkAdmin
  const [setupStep, setSetupStep] = useState<
    "idle" | "registering" | "checking" | "done"
  >("idle");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminAssigned, setAdminAssigned] = useState<boolean | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [copied, setCopied] = useState(false);
  const setupStarted = useRef(false);

  // Run the full setup sequence once actor is ready
  useEffect(() => {
    if (!isAuthenticated || !actor || actorFetching || setupStarted.current)
      return;
    setupStarted.current = true;

    void (async () => {
      setSetupStep("registering");

      // Step 1: Register (safe to call multiple times)
      try {
        await actor.selfRegisterAsUser();
      } catch {
        // already registered — ignore
      }

      // Small delay to let state settle
      await new Promise((r) => setTimeout(r, 300));

      setSetupStep("checking");

      // Step 2: Check admin status
      let adminStatus = false;
      try {
        adminStatus = await actor.isCallerAdmin();
      } catch {
        adminStatus = false;
      }

      // Step 3: Check if admin has been claimed globally
      let assigned = false;
      try {
        assigned = await actor.getAdminAssigned();
      } catch {
        assigned = false;
      }

      setIsAdmin(adminStatus);
      setAdminAssigned(assigned);
      setSetupStep("done");

      // If already admin, redirect immediately
      if (adminStatus) {
        void navigate({ to: "/admin/dashboard" });
      }
    })();
  }, [isAuthenticated, actor, actorFetching, navigate]);

  // Also check adminAssigned for unauthenticated users (public query)
  useEffect(() => {
    if (isAuthenticated || !actor || actorFetching || adminAssigned !== null)
      return;
    void actor
      .getAdminAssigned()
      .then(setAdminAssigned)
      .catch(() => setAdminAssigned(false));
  }, [isAuthenticated, actor, actorFetching, adminAssigned]);

  const isLoading =
    isInitializing ||
    actorFetching ||
    (isAuthenticated && setupStep !== "done" && setupStep !== "idle") ||
    (isAuthenticated && setupStep === "idle" && !!actor && !actorFetching);

  const principalFull = identity ? identity.getPrincipal().toString() : "";

  const handleCopyPrincipal = () => {
    if (!principalFull) return;
    void navigator.clipboard.writeText(principalFull);
    setCopied(true);
    toast.success("Principal ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimAdmin = async () => {
    if (!actor) return;
    setClaiming(true);
    try {
      // Ensure registered first
      try {
        await actor.selfRegisterAsUser();
      } catch {
        // already registered
      }
      await new Promise((r) => setTimeout(r, 200));

      await actor.claimFirstAdmin();

      // Verify the claim worked
      await new Promise((r) => setTimeout(r, 500));
      const confirmed = await actor.isCallerAdmin();

      if (confirmed) {
        // Invalidate all cached queries so dashboard loads fresh
        await queryClient.invalidateQueries();
        toast.success("Admin role activated! Redirecting...");
        await new Promise((r) => setTimeout(r, 800));
        void navigate({ to: "/admin/dashboard" });
      } else {
        toast.error(
          "Claim appeared to succeed but admin status was not confirmed. Please try again.",
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.includes("Admin has already been claimed") ||
        message.includes("already been claimed")
      ) {
        toast.error(
          "Admin role is already taken. Share your Principal ID with the existing admin.",
        );
        setAdminAssigned(true);
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
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">
                {setupStep === "registering"
                  ? "Registering account..."
                  : setupStep === "checking"
                    ? "Checking admin status..."
                    : "Connecting..."}
              </p>
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

        {/* Authenticated — setup done — not admin */}
        {!isLoading && isAuthenticated && setupStep === "done" && !isAdmin && (
          <>
            {/* Identity info bar */}
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

            {/* Case A: No admin yet — show Become Admin */}
            {!adminAssigned && (
              <Card className="border-primary/30 shadow-md bg-primary/5">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Become Admin
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    No admin exists yet. Click below to instantly activate admin
                    access and get redirected to the Admin Dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-bold"
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
                    <p className="text-xs font-medium mb-1">
                      Your Principal ID
                    </p>
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
            )}

            {/* Case B: Admin already claimed — show get-role instructions */}
            {adminAssigned && (
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-primary" />
                    Request Role Access
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    An admin already exists on this platform. Share your
                    Principal ID with the admin and ask them to assign you a
                    role from the Admin Dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted/50 border border-border/60 p-3">
                    <p className="text-xs font-medium mb-1">
                      Your Principal ID
                    </p>
                    <p className="font-mono text-xs text-muted-foreground break-all select-all">
                      {principalFull}
                    </p>
                  </div>
                  <Button
                    className="w-full gap-2 h-10 font-semibold"
                    onClick={handleCopyPrincipal}
                    data-ocid="admin.copy_id_button"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy My Principal ID"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Send this ID to the admin so they can assign your role.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Redirecting state */}
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
