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
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateCandidateProfile,
  useGetCallerUserProfile,
  useIsCallerAdmin,
  useSaveCallerUserProfile,
  useSelfRegisterAsUser,
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

export function OnboardingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsCallerAdmin();
  const { data: existingProfile, isLoading: checkingProfile } =
    useGetCallerUserProfile();

  const selfRegister = useSelfRegisterAsUser();
  const createCandidate = useCreateCandidateProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [form, setForm] = useState({
    name: "",
    email: "",
    targetRole: "",
    experienceLevel: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    try {
      // Step 1: Ensure the caller is registered as a user before saving any profile data.
      // Without this, createCandidateProfile and saveCallerUserProfile will trap ("Unauthorized").
      try {
        await selfRegister.mutateAsync();
      } catch {
        // already registered — safe to continue
      }

      // Step 2: Wait briefly for canister state to settle
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Step 3: Save both profiles in parallel
      await Promise.all([
        createCandidate.mutateAsync(form),
        saveProfile.mutateAsync({ name: form.name }),
      ]);
      toast.success("Profile created! Welcome to InterviewIQ.");
      await navigate({ to: "/candidate" });
    } catch (err) {
      toast.error("Failed to create profile. Please try again.");
      console.error(err);
    }
  };

  const isLoading = checkingAdmin || checkingProfile;
  const isPending =
    selfRegister.isPending ||
    createCandidate.isPending ||
    saveProfile.isPending;

  if (!identity) {
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

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            >
              Go to Admin Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

              {(createCandidate.isError || saveProfile.isError) && (
                <Alert variant="destructive" data-ocid="onboarding.error_state">
                  <AlertDescription>
                    Failed to save profile. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isPending}
                data-ocid="onboarding.submit_button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating profile…
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
