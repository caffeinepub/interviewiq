import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { BrainCircuit, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateCandidateProfile,
  useGetCallerUserProfile,
  useIsCallerAdmin,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

const roles = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Other",
];

const experienceLevels = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (2-5 years)" },
  { value: "senior", label: "Senior (5-8 years)" },
  { value: "lead", label: "Lead / Principal (8+ years)" },
];

type SaveStep =
  | "idle"
  | "registering"
  | "saving-profile"
  | "creating-candidate"
  | "done";

const stepLabel: Record<SaveStep, string> = {
  idle: "",
  registering: "Step 1/3: Registering account…",
  "saving-profile": "Step 2/3: Saving profile…",
  "creating-candidate": "Step 3/3: Creating candidate profile…",
  done: "All done!",
};

const stepProgress: Record<SaveStep, number> = {
  idle: 0,
  registering: 20,
  "saving-profile": 55,
  "creating-candidate": 80,
  done: 100,
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsCallerAdmin();
  const { data: existingProfile, isLoading: checkingProfile } =
    useGetCallerUserProfile();

  const createCandidate = useCreateCandidateProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [form, setForm] = useState({
    name: "",
    email: "",
    targetRole: "",
    experienceLevel: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");
  const [saveStep, setSaveStep] = useState<SaveStep>("idle");

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim() || !form.email.includes("@"))
      errs.email = "Valid email is required";
    if (!form.targetRole) errs.targetRole = "Target role is required";
    if (!form.experienceLevel)
      errs.experienceLevel = "Experience level is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaveError("");

    // Guard: must be authenticated with a real identity
    if (!identity) {
      setSaveError("Please sign in before saving your profile.");
      toast.error("Please sign in before saving your profile.");
      return;
    }

    // Guard: actor must be ready and not still fetching
    if (!actor || actorFetching) {
      setSaveError("Please wait for authentication to complete before saving.");
      toast.error(
        "Authentication still loading — please wait a moment and try again.",
      );
      return;
    }

    try {
      // Step 1: Register the caller as a user
      setSaveStep("registering");
      try {
        await actor.selfRegisterAsUser();
      } catch {
        // Already registered — safe to continue
      }

      // Wait for canister state to settle after registration
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 2: Save user profile (display name)
      setSaveStep("saving-profile");
      try {
        await saveProfile.mutateAsync({ name: form.name });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Unauthorized") || msg.includes("not registered")) {
          throw new Error(
            "Authorization failed on profile save. Please sign out, sign back in, and try again.",
          );
        }
        throw err;
      }

      // Brief pause so the canister write is visible to the next call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 3: Save full candidate profile
      setSaveStep("creating-candidate");
      try {
        await createCandidate.mutateAsync(form);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Unauthorized") || msg.includes("not registered")) {
          throw new Error(
            "Authorization failed on candidate profile save. Please sign out, sign back in, and try again.",
          );
        }
        throw err;
      }

      setSaveStep("done");
      toast.success("Profile saved! Welcome to InterviewIQ.");
      await new Promise((resolve) => setTimeout(resolve, 600));
      await navigate({ to: "/candidate" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const friendly = message.includes("Authorization failed")
        ? message
        : message.includes("network") || message.includes("fetch")
          ? "Network error. Check your connection and try again."
          : message.includes("Not connected")
            ? "Actor not ready. Please wait a moment and try again."
            : `Failed to save profile: ${message}`;
      setSaveError(friendly);
      setSaveStep("idle");
      toast.error(friendly);
      console.error("OnboardingPage handleSubmit error:", err);
    }
  };

  const isLoading = isInitializing || checkingAdmin || checkingProfile;
  const isSaving = saveStep !== "idle" && saveStep !== "done";

  // ─── Not signed in ───────────────────────────────────────────────────────
  if (!identity && !isInitializing) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md border-border/60">
          <CardContent className="pt-8 text-center">
            <BrainCircuit className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Please sign in to continue with onboarding.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your profile…</p>
        </div>
      </div>
    );
  }

  // ─── Already admin ────────────────────────────────────────────────────────
  if (isAdmin) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-16">
        <Card className="w-full max-w-md border-border/60 text-center">
          <CardContent className="pt-10 pb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              Welcome, Admin!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your admin account is ready. Access the Admin Dashboard to manage
              roles, create interview sessions, and control the question bank.
            </p>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate({ to: "/admin/dashboard" })}
              data-ocid="onboarding.go_dashboard_button"
            >
              Go to Admin Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Profile already exists ───────────────────────────────────────────────
  if (existingProfile) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-16">
        <Card className="w-full max-w-md border-border/60 text-center">
          <CardContent className="pt-10 pb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              Welcome back, {existingProfile.name}!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your profile is already set up. Head to your dashboard to manage
              interviews.
            </p>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate({ to: "/candidate" })}
              data-ocid="onboarding.go_dashboard_button"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Onboarding form ──────────────────────────────────────────────────────
  return (
    <div className="container py-16 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <BrainCircuit className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">
            Set up your profile
          </h1>
          <p className="text-muted-foreground">
            Tell us about yourself to get the most relevant interview
            experience.
          </p>
        </div>

        {/* Save progress indicator */}
        {isSaving && (
          <div
            className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3"
            data-ocid="onboarding.loading_state"
          >
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
              <p className="text-sm font-medium text-primary">
                {stepLabel[saveStep]}
              </p>
            </div>
            <Progress value={stepProgress[saveStep]} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              Please do not close this page while saving.
            </p>
          </div>
        )}

        {saveStep === "done" && (
          <div
            className="mb-6 rounded-lg border border-green-500/30 bg-green-500/5 p-4 flex items-center gap-2"
            data-ocid="onboarding.success_state"
          >
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <p className="text-sm font-medium text-green-400">
              Profile saved! Redirecting to dashboard…
            </p>
          </div>
        )}

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg">
              Candidate Information
            </CardTitle>
            <CardDescription>
              This information is used to personalize your interview sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  disabled={isSaving}
                  data-ocid="onboarding.name_input"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="onboarding.name_error"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  disabled={isSaving}
                  data-ocid="onboarding.email_input"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="onboarding.email_error"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetRole">Target Role</Label>
                <Select
                  value={form.targetRole}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, targetRole: v }))
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger
                    id="targetRole"
                    data-ocid="onboarding.role_input"
                    className={errors.targetRole ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.targetRole && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="onboarding.role_error"
                  >
                    {errors.targetRole}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select
                  value={form.experienceLevel}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, experienceLevel: v }))
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger
                    id="experienceLevel"
                    data-ocid="onboarding.experience_input"
                    className={
                      errors.experienceLevel ? "border-destructive" : ""
                    }
                  >
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.experienceLevel && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="onboarding.experience_error"
                  >
                    {errors.experienceLevel}
                  </p>
                )}
              </div>

              {saveError && (
                <Alert variant="destructive" data-ocid="onboarding.error_state">
                  <AlertDescription>{saveError}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSaving || saveStep === "done"}
                data-ocid="onboarding.submit_button"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {stepLabel[saveStep]}
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Actor readiness hint */}
        {!actorFetching && !actor && identity && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Connecting to ICP network… Please wait before submitting.
          </p>
        )}
        {actorFetching && (
          <p className="mt-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            Initializing secure connection…
          </p>
        )}
      </div>
    </div>
  );
}
