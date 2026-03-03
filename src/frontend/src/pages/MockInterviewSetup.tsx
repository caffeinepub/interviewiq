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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { BrainCircuit, Clock, Filter, Loader2, PlayCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Difficulty } from "../backend.d";
import { DifficultyBadge } from "../components/StatusBadge";
import {
  useCreateMockInterview,
  useGetAllQuestions,
} from "../hooks/useQueries";

export function MockInterviewSetup() {
  const navigate = useNavigate();
  const { data: questions, isLoading } = useGetAllQuestions();
  const createMock = useCreateMockInterview();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [timeLimit, setTimeLimit] = useState("45");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categories = [
    ...new Set(questions?.map((q) => q.category) ?? []),
  ].sort();

  const filtered = (questions ?? []).filter((q) => {
    const matchDiff =
      filterDifficulty === "all" || q.difficulty === filterDifficulty;
    const matchCat = filterCategory === "all" || q.category === filterCategory;
    return matchDiff && matchCat;
  });

  const toggleQuestion = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStart = async () => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one question.");
      return;
    }
    const limit = Number.parseInt(timeLimit, 10);
    if (Number.isNaN(limit) || limit < 5 || limit > 180) {
      toast.error("Time limit must be between 5 and 180 minutes.");
      return;
    }

    try {
      const questionIds = [...selectedIds].map((id) => BigInt(id));
      const sessionId = await createMock.mutateAsync({
        questionIds,
        timeLimitMinutes: BigInt(limit),
      });
      toast.success("Mock interview created!");
      await navigate({
        to: "/session/$id",
        params: { id: sessionId.toString() },
      });
    } catch (err) {
      toast.error("Failed to create mock interview. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          Setup Mock Interview
        </h1>
        <p className="text-muted-foreground">
          Select questions, set your time limit, and start practicing.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Question Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                  <Filter size={14} />
                  Filters:
                </div>
                <Select
                  value={filterDifficulty}
                  onValueChange={setFilterDifficulty}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value={Difficulty.easy}>Easy</SelectItem>
                    <SelectItem value={Difficulty.medium}>Medium</SelectItem>
                    <SelectItem value={Difficulty.hard}>Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedIds.size > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => setSelectedIds(new Set())}
                  >
                    Clear ({selectedIds.size})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                Question Bank
              </CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading..."
                  : `${filtered.length} questions available`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[480px]">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
                      <Skeleton key={k} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center h-40 text-center"
                    data-ocid="mock.questions_empty_state"
                  >
                    <BrainCircuit className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No questions match your filters.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {filtered.map((question, idx) => {
                      const qId = question.id.toString();
                      const isChecked = selectedIds.has(qId);
                      return (
                        <label
                          key={qId}
                          htmlFor={`q-${qId}`}
                          className="flex items-start gap-3 p-4 cursor-pointer hover:bg-accent/30 transition-colors"
                          data-ocid={`mock.question.item.${idx + 1}`}
                        >
                          <Checkbox
                            id={`q-${qId}`}
                            checked={isChecked}
                            onCheckedChange={() => toggleQuestion(qId)}
                            className="mt-0.5 shrink-0"
                            data-ocid={`mock.question_checkbox.${idx + 1}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-snug">
                              {question.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {question.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <DifficultyBadge
                                difficulty={question.difficulty}
                              />
                              <Badge
                                variant="outline"
                                className="text-xs border-border/60"
                              >
                                {question.category}
                              </Badge>
                              {question.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs text-muted-foreground"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Config Panel */}
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-base">
                Interview Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="timeLimit"
                  className="flex items-center gap-1.5"
                >
                  <Clock size={13} />
                  Time Limit (minutes)
                </Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="5"
                  max="180"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="45"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 10 min per question
                </p>
              </div>

              <div className="rounded-lg bg-muted/40 p-4 space-y-2">
                <p className="text-sm font-medium">Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Selected</span>
                  <span className="font-medium">
                    {selectedIds.size} questions
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time limit</span>
                  <span className="font-medium">{timeLimit} minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Per question</span>
                  <span className="font-medium">
                    {selectedIds.size > 0
                      ? `~${Math.floor(Number.parseInt(timeLimit) / selectedIds.size)} min`
                      : "–"}
                  </span>
                </div>
              </div>

              {createMock.isError && (
                <Alert variant="destructive" data-ocid="mock.error_state">
                  <AlertDescription>
                    Failed to create mock interview.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleStart}
                disabled={createMock.isPending || selectedIds.size === 0}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="mock.start_button"
              >
                {createMock.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <PlayCircle size={16} />
                    Start Interview
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-border/60 bg-primary/5">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-medium text-primary">
                💡 Tips for best results
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>• Pick 3-6 questions for a focused session</li>
                <li>• Mix difficulty levels for balanced practice</li>
                <li>• Write detailed answers for better feedback</li>
                <li>• Time yourself to build real interview skills</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
