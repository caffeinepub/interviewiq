import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  BrainCircuit,
  Chrome,
  Clock,
  Eye,
  EyeOff,
  HelpCircle,
  Info,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function AuthPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = async () => {
    try {
      await login();
      void navigate({ to: "/onboarding" });
    } catch {
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20">
              <BrainCircuit className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Interview<span className="text-primary">IQ</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-powered interview assessment platform
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 border-success/40 bg-success/5 text-success text-xs px-3 py-1"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Secured by Internet Identity
          </Badge>
          <Badge
            variant="outline"
            className="gap-1.5 border-muted-foreground/30 text-muted-foreground text-xs px-3 py-1"
          >
            <Clock className="h-3.5 w-3.5" />
            Auto-logout: 15 min
          </Badge>
        </div>

        {showForgot ? (
          <Card className="glass-card gradient-border-blue">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Forgot Password?</CardTitle>
              </div>
              <CardDescription>
                InterviewIQ uses cryptographic login — there is no traditional
                password to reset.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-primary/20 bg-primary/5">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  Your identity is managed by <strong>Internet Identity</strong>{" "}
                  — a secure, password-free authentication system on the
                  Internet Computer blockchain. If you lose access, you can
                  recover your identity using your registered recovery phrase or
                  hardware key from the Internet Identity portal.
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  window.open("https://identity.ic0.app", "_blank")
                }
                data-ocid="auth.ii_recovery_button"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Open Internet Identity Portal
              </Button>
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => setShowForgot(false)}
                data-ocid="auth.back_button"
              >
                ← Back to Sign In
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card gradient-border-blue">
            <CardContent className="pt-6">
              <Tabs defaultValue="signin">
                <TabsList className="w-full mb-6" data-ocid="auth.tab">
                  <TabsTrigger
                    value="signin"
                    className="flex-1"
                    data-ocid="auth.signin_tab"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="flex-1"
                    data-ocid="auth.signup_tab"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-9"
                        data-ocid="auth.email_input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-10"
                        data-ocid="auth.password_input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPass ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-primary hover:underline"
                    data-ocid="auth.forgot_link"
                  >
                    Forgot password?
                  </button>
                  <Button
                    className="w-full"
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    data-ocid="auth.signin_button"
                  >
                    {isLoggingIn
                      ? "Connecting to Internet Identity..."
                      : "Sign In"}
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-9"
                        data-ocid="auth.signup_email_input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Create password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-10"
                        data-ocid="auth.signup_password_input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPass ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Alert className="border-primary/20 bg-primary/5">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-xs">
                      An OTP verification email will be sent to confirm your
                      address. Actual authentication is handled by Internet
                      Identity.
                    </AlertDescription>
                  </Alert>
                  <Button
                    className="w-full"
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    data-ocid="auth.signup_button"
                  >
                    {isLoggingIn ? "Connecting..." : "Create Account"}
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="relative my-5">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  or continue with
                </span>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleLogin}
                disabled={isLoggingIn}
                data-ocid="auth.google_button"
              >
                <Chrome className="h-4 w-4" />
                Google Login
              </Button>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground">
          <ShieldCheck className="inline h-3 w-3 mr-1 text-success" />
          Cryptographic login via Internet Identity — no passwords stored
        </p>
      </div>
    </div>
  );
}
