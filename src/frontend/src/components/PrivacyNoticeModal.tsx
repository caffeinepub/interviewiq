import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link } from "@tanstack/react-router";
import { Lock, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { useState } from "react";

interface PrivacyNoticeModalProps {
  open: boolean;
  onAccept: () => void;
}

export function PrivacyNoticeModal({
  open,
  onAccept,
}: PrivacyNoticeModalProps) {
  const [videoEnabled, setVideoEnabled] = useState(
    () => localStorage.getItem("privacy_video_enabled") !== "false",
  );
  const [audioEnabled, setAudioEnabled] = useState(
    () => localStorage.getItem("privacy_audio_enabled") !== "false",
  );

  const handleAccept = () => {
    localStorage.setItem("privacy_video_enabled", String(videoEnabled));
    localStorage.setItem("privacy_audio_enabled", String(audioEnabled));
    localStorage.setItem("privacy_notice_accepted", Date.now().toString());
    onAccept();
  };

  const notices = [
    {
      icon: <Video className="h-4 w-4 text-primary" />,
      text: "Your session may be recorded (video/audio optional)",
    },
    {
      icon: <ShieldAlert className="h-4 w-4 text-destructive" />,
      text: "Anti-cheat monitoring is active — tab switching and copy-paste are tracked",
    },
    {
      icon: <Lock className="h-4 w-4 text-success" />,
      text: "All data is encrypted and stored on the ICP blockchain",
    },
    {
      icon: <ShieldCheck className="h-4 w-4 text-muted-foreground" />,
      text: "You may disable video/audio recording in Privacy Settings",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        data-ocid="privacy.modal"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-lg font-bold">
              Before You Begin
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="rounded-xl bg-muted/50 border border-border/60 p-4 space-y-2.5">
            {notices.map((n) => (
              <div key={n.text} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0">{n.icon}</span>
                <p className="text-sm text-muted-foreground leading-snug">
                  {n.text}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border/60 p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Recording Preferences
            </p>
            <div className="flex items-center justify-between">
              <Label htmlFor="video-toggle" className="text-sm cursor-pointer">
                Enable video recording
              </Label>
              <Switch
                id="video-toggle"
                checked={videoEnabled}
                onCheckedChange={setVideoEnabled}
                data-ocid="privacy.video_switch"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="audio-toggle" className="text-sm cursor-pointer">
                Enable audio recording
              </Label>
              <Switch
                id="audio-toggle"
                checked={audioEnabled}
                onCheckedChange={setAudioEnabled}
                data-ocid="privacy.audio_switch"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={handleAccept}
            className="w-full"
            data-ocid="privacy.confirm_button"
          >
            I Agree &amp; Continue
          </Button>
          <Link
            to="/privacy-settings"
            className="text-xs text-center text-muted-foreground hover:text-primary transition-colors"
            data-ocid="privacy.settings_link"
          >
            Go to Privacy Settings
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function usePrivacyNotice() {
  const accepted = localStorage.getItem("privacy_notice_accepted");
  if (!accepted) return false;
  // Re-show if last acceptance was more than 24h ago
  const ts = Number(accepted);
  return Date.now() - ts < 24 * 60 * 60 * 1000;
}
