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
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart2,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Loader2,
  PlusCircle,
  ShieldOff,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Difficulty } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddQuestion,
  useGetAllCandidateProfiles,
  useGetAllQuestions,
  useGetAllSessions,
} from "../hooks/useQueries";

export function RecruiterDashboard() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const [role, setRole] = useState<string | null>(null);
  const [roleChecked, setRoleChecked] = useState(false);

  // Check effective role
  useState(() => {
    if (!actor || !identity) return;
    void (async () => {
      try {
        // @ts-ignore -- new backend method not yet in generated wrapper
        const r = await actor.getEffectiveRole(
          identity.getPrincipal() as never,
        );
        setRole(r);
      } catch {
        setRole("guest");
      } finally {
        setRoleChecked(true);
      }
    })();
  });

  const { data: questions, isLoading: qLoading } = useGetAllQuestions();
  const { data: sessions, isLoading: sessLoading } = useGetAllSessions(
    role === "recruiter" || role === "admin",
  );
  const { data: candidateProfiles } = useGetAllCandidateProfiles(
    role === "recruiter" || role === "admin",
  );
  const addQuestion = useAddQuestion();

  // Form state
  const [qType, setQType] = useState<"mcq" | "open">("open");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.medium);
  const [tags, setTags] = useState("");
  const [options, setOptions] = useState([
    "Option A",
    "Option B",
    "Option C",
    "Option D",
  ]);
  const [correctOption, setCorrectOption] = useState(0);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required.");
      return;
    }
    try {
      const fullDescription =
        qType === "mcq"
          ? `${description}\n\nOptions:\nA) ${options[0]}\nB) ${options[1]}\nC) ${options[2]}\nD) ${options[3]}\n\nCorrect: ${["A", "B", "C", "D"][correctOption]})`
          : description;

      await addQuestion.mutateAsync({
        title,
        description: fullDescription,
        category: category || "General",
        difficulty,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      toast.success("Question added to the bank!");
      setTitle("");
      setDescription("");
      setCategory("");
      setTags("");
    } catch {
      toast.error(
        "Failed to add question. Make sure you have recruiter access.",
      );
    }
  };

  // Analytics
  const analytics = (() => {
    if (!sessions || !candidateProfiles) return null;
    const total = sessions.length;
    const scored = sessions.filter((s) => s.overallScore != null);
    const avgScore =
      scored.length > 0
        ? scored.reduce((sum, s) => sum + Number(s.overallScore ?? 0), 0) /
          scored.length
        : 0;
    const passRate =
      scored.length > 0
        ? (scored.filter((s) => Number(s.overallScore ?? 0) >= 60).length /
            scored.length) *
          100
        : 0;
    return {
      total,
      avgScore: Math.round(avgScore),
      passRate: Math.round(passRate),
    };
  })();

  if (!roleChecked) {
    return (
      <div
        className="container flex min-h-[60vh] items-center justify-center"
        data-ocid="recruiter.loading_state"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role !== "recruiter" && role !== "admin") {
    return (
      <div
        className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center"
        data-ocid="recruiter.error_state"
      >
        <ShieldOff className="h-12 w-12 text-muted-foreground/40" />
        <h2 className="font-display text-xl font-bold">Access Denied</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          This portal is for Recruiters only. Contact an admin to request
          recruiter access.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
          <Briefcase className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Recruiter Portal
            </h1>
            <Badge
              variant="outline"
              className="border-primary/30 text-primary bg-primary/5 text-xs"
              data-ocid="recruiter.role_badge"
            >
              {role === "admin" ? "Admin" : "Recruiter"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Create questions, review candidates, and track performance
          </p>
        </div>
      </div>

      <Tabs defaultValue="questions">
        <TabsList className="w-full max-w-md" data-ocid="recruiter.tab">
          <TabsTrigger
            value="questions"
            className="flex-1"
            data-ocid="recruiter.questions_tab"
          >
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            Create Questions
          </TabsTrigger>
          <TabsTrigger
            value="responses"
            className="flex-1"
            data-ocid="recruiter.responses_tab"
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Responses
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex-1"
            data-ocid="recruiter.analytics_tab"
          >
            <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Create Questions Tab */}
        <TabsContent value="questions" className="mt-6 space-y-6">
          <Card
            className="border-border/60"
            data-ocid="recruiter.create_question_card"
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Add New Question</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={qType === "open" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setQType("open")}
                    data-ocid="recruiter.open_type_button"
                  >
                    Open-Ended
                  </Button>
                  <Button
                    type="button"
                    variant={qType === "mcq" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setQType("mcq")}
                    data-ocid="recruiter.mcq_type_button"
                  >
                    MCQ
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="q-title">Question Title</Label>
                  <Input
                    id="q-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Explain the difference between REST and GraphQL"
                    data-ocid="recruiter.title_input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="q-desc">Description / Question Body</Label>
                  <Textarea
                    id="q-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Full question text..."
                    className="min-h-[100px]"
                    data-ocid="recruiter.description_textarea"
                  />
                </div>

                {qType === "mcq" && (
                  <div className="space-y-3">
                    <Label>Options</Label>
                    <RadioGroup
                      value={String(correctOption)}
                      onValueChange={(v) => setCorrectOption(Number(v))}
                      className="space-y-2"
                      data-ocid="recruiter.correct_radio"
                    >
                      {options.map((opt, i) => (
                        <div key={opt} className="flex items-center gap-2">
                          <RadioGroupItem value={String(i)} id={`opt-${i}`} />
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...options];
                              newOpts[i] = e.target.value;
                              setOptions(newOpts);
                            }}
                            placeholder={`Option ${["A", "B", "C", "D"][i]}`}
                            className="flex-1 h-8 text-sm"
                            data-ocid={`recruiter.option_input.${i + 1}`}
                          />
                          {i === correctOption && (
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">
                      Select the radio button next to the correct answer.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="q-category">Category</Label>
                    <Input
                      id="q-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. System Design"
                      data-ocid="recruiter.category_input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Difficulty</Label>
                    <Select
                      value={difficulty}
                      onValueChange={(v) => setDifficulty(v as Difficulty)}
                    >
                      <SelectTrigger data-ocid="recruiter.difficulty_select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Difficulty.easy}>Easy</SelectItem>
                        <SelectItem value={Difficulty.medium}>
                          Medium
                        </SelectItem>
                        <SelectItem value={Difficulty.hard}>Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="q-tags">Tags (comma-separated)</Label>
                  <Input
                    id="q-tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. api, backend, architecture"
                    data-ocid="recruiter.tags_input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={addQuestion.isPending}
                  className="w-full"
                  data-ocid="recruiter.submit_button"
                >
                  {addQuestion.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Question
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Questions */}
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Question Bank</CardTitle>
                {questions && (
                  <Badge variant="outline" className="text-xs">
                    {questions.length} questions
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {qLoading ? (
                <div
                  className="flex justify-center py-8"
                  data-ocid="recruiter.loading_state"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !questions?.length ? (
                <p
                  className="text-sm text-muted-foreground text-center py-6"
                  data-ocid="recruiter.empty_state"
                >
                  No questions yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {questions.map((q, idx) => (
                    <div
                      key={String(q.id)}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border/40 px-3 py-2"
                      data-ocid={`recruiter.item.${idx + 1}`}
                    >
                      <p className="text-sm font-medium truncate flex-1">
                        {q.title}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="outline" className="text-xs capitalize">
                          {q.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {q.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Candidate Responses Tab */}
        <TabsContent value="responses" className="mt-6">
          <Card
            className="border-border/60"
            data-ocid="recruiter.responses_card"
          >
            <CardHeader>
              <CardTitle className="text-base">
                Candidate Interview Responses
              </CardTitle>
              <CardDescription>
                All submitted interview sessions and their scores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessLoading ? (
                <div
                  className="flex justify-center py-8"
                  data-ocid="recruiter.loading_state"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !sessions?.length ? (
                <div
                  className="text-center py-12"
                  data-ocid="recruiter.empty_state"
                >
                  <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No sessions found.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <Table data-ocid="recruiter.table">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs">#</TableHead>
                        <TableHead className="text-xs">Candidate</TableHead>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Score</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Flagged</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((s, idx) => {
                        const profileEntry = candidateProfiles?.find(
                          ([p]) => p === s.candidate.toString(),
                        );
                        return (
                          <TableRow
                            key={String(s.id)}
                            data-ocid={`recruiter.row.${idx + 1}`}
                          >
                            <TableCell className="text-xs text-muted-foreground">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {profileEntry?.[1].name ||
                                `${s.candidate.toString().slice(0, 10)}…`}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {s.startTime
                                ? new Date(
                                    Number(s.startTime) / 1_000_000,
                                  ).toLocaleDateString()
                                : "—"}
                            </TableCell>
                            <TableCell>
                              {s.overallScore != null ? (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    Number(s.overallScore) >= 60
                                      ? "border-success/40 text-success bg-success/5"
                                      : "border-destructive/40 text-destructive bg-destructive/5"
                                  }`}
                                >
                                  {String(s.overallScore)}%
                                </Badge>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {s.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {s.flagged ? (
                                <Badge className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                                  Flagged
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Total Sessions",
                  value: analytics?.total ?? 0,
                  color: "text-primary",
                },
                {
                  label: "Avg Score",
                  value: `${analytics?.avgScore ?? 0}%`,
                  color: "text-chart-2",
                },
                {
                  label: "Pass Rate (≥60%)",
                  value: `${analytics?.passRate ?? 0}%`,
                  color: "text-success",
                },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className="border-border/60"
                  data-ocid="recruiter.card"
                >
                  <CardContent className="pt-6 pb-5">
                    <p
                      className={`font-display text-3xl font-bold ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Score Distribution</CardTitle>
                <CardDescription>
                  Breakdown of candidate scores across all sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessLoading ? (
                  <div
                    className="flex justify-center py-4"
                    data-ocid="recruiter.loading_state"
                  >
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : !sessions?.length ? (
                  <p
                    className="text-sm text-muted-foreground text-center py-4"
                    data-ocid="recruiter.empty_state"
                  >
                    No data yet.
                  </p>
                ) : (
                  [
                    {
                      label: "0–40% (Fail)",
                      min: 0,
                      max: 40,
                      color: "bg-destructive",
                    },
                    {
                      label: "41–60% (Average)",
                      min: 41,
                      max: 60,
                      color: "bg-warning",
                    },
                    {
                      label: "61–80% (Good)",
                      min: 61,
                      max: 80,
                      color: "bg-primary",
                    },
                    {
                      label: "81–100% (Excellent)",
                      min: 81,
                      max: 100,
                      color: "bg-success",
                    },
                  ].map((band) => {
                    const count = sessions.filter(
                      (s) =>
                        s.overallScore != null &&
                        Number(s.overallScore) >= band.min &&
                        Number(s.overallScore) <= band.max,
                    ).length;
                    const pct =
                      sessions.length > 0 ? (count / sessions.length) * 100 : 0;
                    return (
                      <div key={band.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {band.label}
                          </span>
                          <span className="font-medium">
                            {count} ({Math.round(pct)}%)
                          </span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Separator />
            <div className="text-xs text-muted-foreground text-center">
              Analytics based on {sessions?.length ?? 0} total sessions
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
