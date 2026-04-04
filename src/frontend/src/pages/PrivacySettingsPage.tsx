import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import {
  Clock,
  Database,
  Download,
  Lock,
  Monitor,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteMyAccount,
  useGetCallerCandidateProfile,
  useGetMySessions,
} from "../hooks/useQueries";

export function PrivacySettingsPage() {
  const { identity, clear } = useInternetIdentity();
  const navigate = useNavigate();

  const [videoEnabled, setVideoEnabled] = useState(
    () => localStorage.getItem("privacy_video_enabled") !== "false",
  );
  const [audioEnabled, setAudioEnabled] = useState(
    () => localStorage.getItem("privacy_audio_enabled") !== "false",
  );
  const [retention, setRetention] = useState(
    () => localStorage.getItem("privacy_retention_days") ?? "30",
  );

  const deleteAccount = useDeleteMyAccount();
  const { data: profile } = useGetCallerCandidateProfile();
  const { data: sessions } = useGetMySessions();

  const sessionInfo = useMemo(() => {
    const start =
      sessionStorage.getItem("session_start_time") ?? Date.now().toString();
    return {
      startTime: new Date(Number(start)).toLocaleString(),
      browser: navigator.userAgent,
    };
  }, []);

  const handleSavePrivacy = () => {
    localStorage.setItem("privacy_video_enabled", String(videoEnabled));
    localStorage.setItem("privacy_audio_enabled", String(audioEnabled));
    localStorage.setItem("privacy_retention_days", retention);
    toast.success("Privacy settings saved.");
  };

  const handleDownloadData = () => {
    const data = {
      profile: profile ?? null,
      sessions: sessions ?? [],
      privacySettings: { videoEnabled, audioEnabled, retentionDays: retention },
      exportedAt: new Date().toISOString(),
      principal: identity?.getPrincipal().toString() ?? "unknown",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "interviewiq-my-data.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Your data has been downloaded.");
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync();
      toast.success("Account deleted successfully.");
      clear();
      void navigate({ to: "/" });
    } catch {
      toast.error("Failed to delete account. Please try again.");
    }
  };

  if (!identity) {
    return (
      <div className="container py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <p className="text-muted-foreground">
          Please sign in to manage your privacy settings.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-2xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl glass-card gradient-border-blue p-8 text-center"
      >
        <div className="orb orb-blue w-48 h-48 -top-12 -right-12" />
        <div className="relative">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-glow text-white">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight">
            Data Protection Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Control how your data is collected and stored
          </p>
        </div>
      </motion.div>

      {/* E2E Encryption Badge */}
      <Card
        className="glass-card gradient-border-emerald"
        data-ocid="privacy.encryption_card"
      >
        <CardContent className="py-4 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                End-to-End Encrypted
              </p>
              <p className="text-xs text-muted-foreground">
                Your data is encrypted and stored on the ICP blockchain —
                immutable, decentralized, and tamper-proof.
              </p>
            </div>
            <Badge className="ml-auto bg-success/10 text-success border-success/30 text-xs shrink-0 backdrop-blur-sm">
              E2E Encrypted
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recording Settings */}
      <Card
        className="glass-card gradient-border-blue"
        data-ocid="privacy.recording_card"
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Video className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Recording Preferences</CardTitle>
          </div>
          <CardDescription>
            Control whether video and audio are recorded during interviews.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-background/30 border border-white/10 p-4">
            <div>
              <Label className="text-sm font-medium">Video Recording</Label>
              <p className="text-xs text-muted-foreground">
                Camera feed during interviews
              </p>
            </div>
            <Switch
              checked={videoEnabled}
              onCheckedChange={setVideoEnabled}
              data-ocid="privacy.video_switch"
            />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-background/30 border border-white/10 p-4">
            <div>
              <Label className="text-sm font-medium">Audio Recording</Label>
              <p className="text-xs text-muted-foreground">
                Microphone during verbal mode
              </p>
            </div>
            <Switch
              checked={audioEnabled}
              onCheckedChange={setAudioEnabled}
              data-ocid="privacy.audio_switch"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card
        className="glass-card gradient-border-violet"
        data-ocid="privacy.retention_card"
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <Clock className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Auto-Delete Settings</CardTitle>
          </div>
          <CardDescription>
            Automatically delete your interview data after a period of time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Data retention period</Label>
            <Select value={retention} onValueChange={setRetention}>
              <SelectTrigger
                className="w-36 glass-card border-white/10"
                data-ocid="privacy.retention_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSavePrivacy}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white btn-glow font-semibold"
        data-ocid="privacy.save_button"
      >
        Save Privacy Settings
      </Button>

      <Separator className="bg-white/5" />

      {/* Session Info */}
      <Card
        className="glass-card gradient-border-cyan"
        data-ocid="privacy.session_card"
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Monitor className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Current Session</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl bg-background/30 border border-white/10 p-4 space-y-3 font-mono text-xs">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-sans font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Principal ID
                </p>
                <p className="text-primary break-all">
                  {identity.getPrincipal().toString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-sans font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Session Started
                </p>
                <p className="text-foreground">{sessionInfo.startTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Monitor className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-sans font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Device / Browser
                </p>
                <p className="text-foreground/70 break-all leading-relaxed">
                  {sessionInfo.browser}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Actions */}
      <Card
        className="glass-card gradient-border-blue"
        data-ocid="privacy.data_card"
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Database className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Your Data</CardTitle>
          </div>
          <CardDescription>
            Download or permanently delete all your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full gap-2 justify-start glass-card border-success/30 text-success hover:bg-success/10 hover:border-success/50"
            onClick={handleDownloadData}
            data-ocid="privacy.download_button"
          >
            <Download className="h-4 w-4" />
            Download My Data (JSON)
          </Button>

          {/* Delete account danger zone */}
          <div className="danger-zone rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-destructive/80 flex items-center gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Danger Zone
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full gap-2 justify-start"
                  data-ocid="privacy.delete_account_button"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete My Account &amp; All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent
                className="glass-card gradient-border-blue"
                data-ocid="privacy.delete_dialog"
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Your Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your profile, interview
                    history, and all associated data from the ICP blockchain.
                    This action <strong>cannot be undone</strong>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className="border-white/20 bg-white/5"
                    data-ocid="privacy.cancel_button"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-ocid="privacy.confirm_button"
                  >
                    {deleteAccount.isPending
                      ? "Deleting..."
                      : "Yes, Delete Everything"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
