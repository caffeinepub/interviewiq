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

  return (
    <div
      className="container max-w-3xl py-6 flex flex-col gap-4"
      style={{ minHeight: "calc(100vh - 140px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="font-display font-semibold text-sm">AI Interviewer</p>
            <p className="text-xs text-muted-foreground">
              {config.role} • Question {Math.min(questionCount, 7)}/7
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <span className="flex items-center gap-1 text-xs text-primary animate-pulse">
              <Volume2 className="h-3.5 w-3.5" /> AI Speaking...
            </span>
          )}
          {cameraActive ? (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <Camera className="h-3.5 w-3.5" /> Live
            </span>
          ) : config.cameraEnabled ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CameraOff className="h-3.5 w-3.5" /> Camera off
            </span>
          ) : null}
        </div>
      </div>

      {/* Camera panel */}
      {config.cameraEnabled && (
        <div className="fixed top-20 right-4 z-40 rounded-xl overflow-hidden border border-border/60 shadow-lg bg-black">
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
        className="flex-1 overflow-y-auto flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/10 p-4"
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
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "interviewer"
                    ? "bg-primary/10 text-foreground rounded-tl-sm border border-primary/20"
                    : "bg-muted text-foreground rounded-tr-sm border border-border/50"
                }`}
              >
                {msg.role === "interviewer" && (
                  <p className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider mb-1">
                    AI Interviewer
                  </p>
                )}
                {msg.role === "candidate" && (
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
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
              <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm px-4 py-3">
                <p className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider mb-1">
                  AI Interviewer
                </p>
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
              <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm px-4 py-3">
                <p className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider mb-1">
                  AI Interviewer
                </p>
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
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center max-w-sm">
                <p className="text-sm font-semibold text-green-400 mb-3">
                  Interview Complete
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void navigate({ to: "/ai-interviewer" })}
                    className="gap-1"
                    data-ocid="ai_interviewer_session.secondary_button"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    New Interview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => void navigate({ to: "/candidate" })}
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
              className="min-h-[80px] resize-none flex-1"
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
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                    isListening
                      ? "border-red-500 bg-red-500/20 text-red-400 ring-2 ring-red-500/50 animate-pulse"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground hover:border-primary/40"
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
                className="h-10 w-10"
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
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p>No interview configuration found.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void navigate({ to: "/ai-interviewer" })}
            className="ml-auto"
          >
            Go to Setup
          </Button>
        </div>
      )}
    </div>
  );
}
