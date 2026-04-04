import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Camera,
  CameraOff,
  MessageCircle,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Volume2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type InterviewState = "greeting" | "waiting" | "thinking" | "ended";

interface Message {
  id: string;
  role: "interviewer" | "candidate";
  text: string;
}

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-primary/60"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

function readConfig() {
  try {
    return JSON.parse(
      localStorage.getItem("ai-interviewer-config") ?? "{}",
    ) as {
      role: string;
      voiceMode: boolean;
      cameraEnabled: boolean;
    };
  } catch {
    return { role: "", voiceMode: false, cameraEnabled: false };
  }
}

export function AIInterviewerSession() {
  const navigate = useNavigate();

  const apiKey = localStorage.getItem("gemini-api-key") ?? "";
  const config = readConfig();

  const [messages, setMessages] = useState<Message[]>([]);
  const [answer, setAnswer] = useState("");
  const [state, setState] = useState<InterviewState>("greeting");
  const [questionCount, setQuestionCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const [started, setStarted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // Redirect if no key
  useEffect(() => {
    if (!apiKey || !config.role) {
      void navigate({ to: "/ai-interviewer" });
    }
  }, [apiKey, config.role, navigate]);

  // Camera setup
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      let retries = 0;
      const attach = () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          setCameraActive(true);
        } else if (retries < 10) {
          retries++;
          setTimeout(attach, 200);
        }
      };
      attach();
    } catch {
      toast.error("Camera access denied. Proctoring disabled.");
    }
  }, []);

  useEffect(() => {
    if (config.cameraEnabled) {
      void startCamera();
    }
    return () => {
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
      }
      window.speechSynthesis?.cancel();
    };
  }, [config.cameraEnabled, startCamera]);

  // Scroll to bottom whenever messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages.length is intentional
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // TTS
  const speak = useCallback(
    (text: string) => {
      if (!config.voiceMode || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.pitch = 1;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [config.voiceMode],
  );

  // Greet on mount — run once
  useEffect(() => {
    if (started || !apiKey || !config.role) return;
    setStarted(true);

    const greet = async () => {
      setState("greeting");
      try {
        const prompt = `You are a professional HR interviewer conducting a realistic job interview for a ${config.role} position.

Start with a brief, professional greeting (1 sentence max), then ask your FIRST interview question.
This should be a general HR question (e.g. "Tell me about yourself", "What are your strengths?").

Rules:
- Keep your response SHORT (2-3 sentences max total)
- Ask only ONE question
- Sound like a real interviewer
- Be slightly strict but encouraging

Return ONLY plain text. No JSON. No markdown.`;
        const text = await callGemini(apiKey, prompt);
        const msg: Message = {
          id: Date.now().toString(),
          role: "interviewer",
          text,
        };
        setMessages([msg]);
        setLastQuestion(text);
        setQuestionCount(1);
        setState("waiting");
        speak(text);
      } catch {
        toast.error("Failed to connect to Gemini. Check your API key.");
        const fallbackText = `Hello! Welcome to your interview for the ${config.role} position. Let's begin. Tell me about yourself and what brought you to apply for this role.`;
        const fallback: Message = {
          id: Date.now().toString(),
          role: "interviewer",
          text: fallbackText,
        };
        setMessages([fallback]);
        setLastQuestion(fallbackText);
        setQuestionCount(1);
        setState("waiting");
        speak(fallbackText);
      }
    };
    void greet();
  }, [started, apiKey, config.role, speak]);

  const handleSubmit = async () => {
    const trimmed = answer.trim();
    if (!trimmed || state !== "waiting") return;

    const candidateMsg: Message = {
      id: Date.now().toString(),
      role: "candidate",
      text: trimmed,
    };
    setMessages((prev) => [...prev, candidateMsg]);
    setAnswer("");
    setState("thinking");

    const newCount = questionCount + 1;
    const isFinal = questionCount >= 5;

    try {
      let prompt: string;
      if (isFinal) {
        prompt = `You are a professional interviewer. The interview is now complete.

The candidate interviewed for: ${config.role}
Number of questions answered: ${questionCount}

Say: "This concludes the interview. Here is your overall feedback:"
Then give a summary of 3-4 lines covering:
- Overall performance
- Key strengths observed
- Main areas to improve
- One encouragement line

Keep it under 6 sentences total. Sound professional.

Return ONLY plain text. No JSON. No markdown.`;
      } else {
        prompt = `You are a professional interviewer. The candidate just answered a question.

Previous question: ${lastQuestion}
Candidate's answer: ${trimmed}
Questions asked so far: ${questionCount}

Your job:
1. Give SHORT feedback on their answer (1-2 lines): evaluate clarity, confidence, and relevance. Examples: "Good clarity, but improve structure." / "Confident answer, add more examples."
2. Ask the NEXT interview question. Start with HR questions, then gradually move to role-specific (${config.role}) and situational questions.
3. If their answer was strong (detailed, specific, uses examples) → ask a harder/deeper question.
4. If their answer was weak (vague, short, off-topic) → ask an easier or guiding question.

Rules:
- Keep total response under 4 sentences
- Ask only ONE question
- Never repeat a previous question
- Sound like a real interviewer

Return ONLY plain text. No JSON. No markdown. Format: [feedback line]. [Next question]`;
      }

      const text = await callGemini(apiKey, prompt);
      const interviewerMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "interviewer",
        text,
      };
      setMessages((prev) => [...prev, interviewerMsg]);
      setLastQuestion(text);
      setQuestionCount(newCount);
      speak(text);
      setState(isFinal ? "ended" : "waiting");
    } catch {
      toast.error("Failed to get response from Gemini. Please retry.");
      setState("waiting");
    }
  };

  const toggleListening = () => {
    if (!config.voiceMode) return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setAnswer(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Microphone error. Please try again.");
    };
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const replayQuestion = () => {
    if (lastQuestion) speak(lastQuestion);
  };

  const progressPct = Math.min((questionCount / 7) * 100, 100);

  return (
    <div className="console-bg" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div
        className="container max-w-3xl py-6 flex flex-col gap-4"
        style={{ minHeight: "calc(100vh - 140px)" }}
      >
        {/* Header */}
        <div className="glass-card gradient-border-blue rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-glow text-white">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm">AI Interviewer</p>
              <p className="text-xs text-muted-foreground">
                {config.role} • Question {Math.min(questionCount, 7)}/7
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.min(questionCount, 7)}/7
              </span>
            </div>
            {isSpeaking && (
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <div className="flex gap-0.5 items-end h-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="waveform-bar"
                      style={{ height: "8px" }}
                    />
                  ))}
                </div>
                Speaking
              </span>
            )}
            {cameraActive ? (
              <span className="flex items-center gap-1 text-xs text-success">
                <Camera className="h-3.5 w-3.5" /> Live
              </span>
            ) : config.cameraEnabled ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CameraOff className="h-3.5 w-3.5" />
              </span>
            ) : null}
          </div>
        </div>

        {/* Camera panel */}
        {config.cameraEnabled && (
          <div className="fixed top-20 right-4 z-40 rounded-xl overflow-hidden glass-card gradient-border-blue shadow-glow">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ width: 160, height: 120, objectFit: "cover" }}
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <CameraOff className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
        )}

        {/* Chat messages */}
        <div
          className="flex-1 overflow-y-auto flex flex-col gap-3 glass-card gradient-border-blue rounded-2xl p-5"
          style={{ minHeight: 380, maxHeight: 480 }}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  msg.role === "interviewer" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "interviewer"
                      ? "bg-primary/10 text-foreground rounded-tl-sm border border-primary/25 backdrop-blur-sm"
                      : "bg-white/5 text-foreground rounded-tr-sm border border-white/10 backdrop-blur-sm"
                  }`}
                >
                  {msg.role === "interviewer" && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <MessageCircle className="h-2.5 w-2.5 text-white" />
                      </div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        AI Interviewer
                      </p>
                    </div>
                  )}
                  {msg.role === "candidate" && (
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                      You
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </motion.div>
            ))}

            {state === "greeting" && (
              <motion.div
                key="greeting-loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="bg-primary/10 border border-primary/25 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <MessageCircle className="h-2.5 w-2.5 text-white" />
                    </div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      AI Interviewer
                    </p>
                  </div>
                  <TypingDots />
                </div>
              </motion.div>
            )}

            {state === "thinking" && (
              <motion.div
                key="thinking-loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="bg-primary/10 border border-primary/25 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <MessageCircle className="h-2.5 w-2.5 text-white" />
                    </div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      AI Interviewer
                    </p>
                  </div>
                  <TypingDots />
                </div>
              </motion.div>
            )}

            {state === "ended" && (
              <motion.div
                key="ended-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center mt-4"
              >
                <div className="rounded-2xl glass-card gradient-border-emerald p-6 text-center max-w-sm shadow-glow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success mx-auto mb-3">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-success mb-4">
                    Interview Complete ✔
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void navigate({ to: "/ai-interviewer" })}
                      className="gap-1 border-white/20 bg-white/5 hover:bg-white/10"
                      data-ocid="ai_interviewer_session.secondary_button"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      New Interview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => void navigate({ to: "/candidate" })}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white btn-glow"
                      data-ocid="ai_interviewer_session.primary_button"
                    >
                      Dashboard
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        {state !== "ended" && (
          <div className="flex flex-col gap-2">
            {state === "waiting" && config.voiceMode && (
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>Speak or type your answer</span>
                <button
                  type="button"
                  onClick={replayQuestion}
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Volume2 className="h-3.5 w-3.5" /> Replay question
                </button>
              </div>
            )}
            <div className="flex gap-2 items-end">
              <Textarea
                placeholder={
                  state === "waiting"
                    ? "Type your answer here..."
                    : "Waiting for AI..."
                }
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={state !== "waiting"}
                className="min-h-[80px] resize-none flex-1 glass-card border-white/10 bg-background/30 focus:border-primary/50 focus:shadow-glow"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    void handleSubmit();
                  }
                }}
                data-ocid="ai_interviewer_session.textarea"
              />
              <div className="flex flex-col gap-2">
                {config.voiceMode && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={state !== "waiting"}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${
                      isListening
                        ? "border-red-500 bg-red-500/20 text-red-400 ring-2 ring-red-500/50 animate-pulse"
                        : "glass-card border-white/10 text-muted-foreground hover:text-foreground hover:border-primary/40"
                    } disabled:opacity-40`}
                    data-ocid="ai_interviewer_session.toggle"
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </button>
                )}
                <Button
                  size="icon"
                  onClick={() => void handleSubmit()}
                  disabled={state !== "waiting" || !answer.trim()}
                  className="h-11 w-11 bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:opacity-90 btn-glow"
                  data-ocid="ai_interviewer_session.submit_button"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-right">
              Ctrl+Enter to submit
            </p>
          </div>
        )}

        {/* Error state if no config */}
        {!config.role && (
          <div className="flex items-center gap-2 rounded-xl glass-card gradient-border-blue p-3 text-sm">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p>No interview configuration found.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void navigate({ to: "/ai-interviewer" })}
              className="ml-auto border-white/20 bg-white/5"
            >
              Go to Setup
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
