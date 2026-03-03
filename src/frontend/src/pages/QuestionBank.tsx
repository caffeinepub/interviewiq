import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Database,
  Edit2,
  Filter,
  Loader2,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Difficulty } from "../backend.d";
import type { Question } from "../backend.d";
import { DifficultyBadge } from "../components/StatusBadge";
import {
  useAddQuestion,
  useDeleteQuestion,
  useGetAllQuestions,
  useIsCallerAdmin,
  useUpdateQuestion,
} from "../hooks/useQueries";

interface SeedQuestion {
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  tags: string[];
}

const SEED_QUESTIONS: SeedQuestion[] = [
  // Algorithms
  {
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    category: "Algorithms",
    difficulty: Difficulty.easy,
    tags: ["arrays", "hash-map", "easy"],
  },
  {
    title: "Merge Intervals",
    description:
      "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    category: "Algorithms",
    difficulty: Difficulty.medium,
    tags: ["arrays", "sorting", "intervals"],
  },
  {
    title: "Longest Increasing Subsequence",
    description:
      "Given an integer array nums, return the length of the longest strictly increasing subsequence. A subsequence is a sequence that can be derived from an array by deleting some or no elements without changing the order of the remaining elements.",
    category: "Algorithms",
    difficulty: Difficulty.hard,
    tags: ["dynamic-programming", "binary-search"],
  },
  // Data Structures
  {
    title: "Implement a Stack using Queues",
    description:
      "Implement a last-in-first-out (LIFO) stack using only two queues. The implemented stack should support all the functions of a normal stack (push, top, pop, and empty).",
    category: "Data Structures",
    difficulty: Difficulty.easy,
    tags: ["stack", "queue", "design"],
  },
  {
    title: "LRU Cache",
    description:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put operations, both running in O(1) average time complexity.",
    category: "Data Structures",
    difficulty: Difficulty.medium,
    tags: ["hash-map", "doubly-linked-list", "design"],
  },
  {
    title: "Serialize and Deserialize Binary Tree",
    description:
      "Design an algorithm to serialize and deserialize a binary tree. Serialization is the process of converting a data structure into a sequence of bits so that it can be stored in a file or memory buffer, and deserialized back into the original structure.",
    category: "Data Structures",
    difficulty: Difficulty.hard,
    tags: ["binary-tree", "BFS", "DFS"],
  },
  // System Design
  {
    title: "Design a URL Shortener",
    description:
      "Design a system like bit.ly that converts long URLs into short ones and redirects users. Consider scalability, database schema, hashing strategy, and how to handle high read/write throughput.",
    category: "System Design",
    difficulty: Difficulty.medium,
    tags: ["system-design", "scalability", "hashing"],
  },
  {
    title: "Design Twitter Feed",
    description:
      "Design a simplified version of Twitter where users can post tweets and follow other users to see a news feed. Address fan-out strategies, caching layers, and how to handle celebrity accounts with millions of followers.",
    category: "System Design",
    difficulty: Difficulty.hard,
    tags: ["system-design", "distributed", "caching"],
  },
  // Behavioral
  {
    title: "Tell Me About Yourself",
    description:
      "Give a brief introduction of your professional background, key skills, and what you are looking for in your next role. Keep it concise, relevant, and tailored to the position you are applying for.",
    category: "Behavioral",
    difficulty: Difficulty.easy,
    tags: ["behavioral", "introduction"],
  },
  {
    title: "Describe a Challenging Project",
    description:
      "Tell me about a time you worked on a particularly challenging project. What was your role, what obstacles did you face, and how did you overcome them? Use the STAR method: Situation, Task, Action, Result.",
    category: "Behavioral",
    difficulty: Difficulty.medium,
    tags: ["behavioral", "problem-solving", "STAR"],
  },
  {
    title: "Conflict Resolution with a Team Member",
    description:
      "Describe a time when you had a conflict with a team member. How did you handle it and what was the outcome? Focus on your communication approach, empathy, and the steps you took to reach a resolution.",
    category: "Behavioral",
    difficulty: Difficulty.medium,
    tags: ["behavioral", "teamwork", "communication"],
  },
  // Frontend
  {
    title: "Virtual DOM Explanation",
    description:
      "Explain what the Virtual DOM is in React, how it works under the hood, and why it improves performance compared to direct DOM manipulation. Discuss reconciliation and the diffing algorithm.",
    category: "Frontend",
    difficulty: Difficulty.medium,
    tags: ["react", "virtual-dom", "performance"],
  },
  {
    title: "Implement Infinite Scroll",
    description:
      "Implement an infinite scroll component in React that loads more items as the user scrolls to the bottom of the page using the Intersection Observer API. Handle loading states, errors, and cleanup properly.",
    category: "Frontend",
    difficulty: Difficulty.hard,
    tags: ["react", "performance", "intersection-observer"],
  },
  // Backend
  {
    title: "Design a REST API for a Blog",
    description:
      "Design RESTful API endpoints for a blog platform supporting posts, comments, and user authentication. Include HTTP methods, routes, request/response formats, status codes, and pagination strategy.",
    category: "Backend",
    difficulty: Difficulty.medium,
    tags: ["REST", "API-design", "HTTP"],
  },
  {
    title: "Database Indexing Strategies",
    description:
      "Explain database indexing strategies, when to use composite indexes vs single-column indexes, and the trade-offs involved in over-indexing. Discuss B-tree vs hash indexes and query execution plan analysis.",
    category: "Backend",
    difficulty: Difficulty.hard,
    tags: ["database", "indexing", "performance", "SQL"],
  },
  // Interview Questions
  {
    title: "Tell Me About Yourself",
    description:
      "Opening question used to set the tone and break the ice. They want a concise, professional pitch covering your present role, past relevant experience, and why you are excited about the future. Not a full life story — keep it under 2 minutes.",
    category: "Interview",
    difficulty: Difficulty.easy,
    tags: ["behavioral", "introduction", "pitch"],
  },
  {
    title: "Why Do You Want to Work for This Company?",
    description:
      "Tests your research and genuine interest in the organization. They want to see that you understand their mission, values, and product, and that you fit their culture. Show you want this specific job, not just any job.",
    category: "Interview",
    difficulty: Difficulty.easy,
    tags: ["behavioral", "research", "motivation"],
  },
  {
    title: "What Are Your Strengths?",
    description:
      "An opportunity to boast professionally, but it must be tailored to the job. They are looking for skills listed in the job description that you can prove you possess. Share 2-3 specific, relevant strengths with concrete examples.",
    category: "Interview",
    difficulty: Difficulty.easy,
    tags: ["behavioral", "strengths", "self-awareness"],
  },
  {
    title: "What Is Your Greatest Weakness?",
    description:
      "Evaluates self-awareness and honesty. They want to know if you can identify areas for improvement and if you are proactively working on them. Avoid disguised strengths like 'I work too hard' — share a genuine, manageable weakness.",
    category: "Interview",
    difficulty: Difficulty.medium,
    tags: ["behavioral", "weakness", "self-awareness", "growth"],
  },
  {
    title: "Why Should We Hire You?",
    description:
      "A chance to sell yourself directly. All candidates are likely qualified — this is your opportunity to differentiate yourself by highlighting your unique skills, experience, and the specific value you will bring to the team.",
    category: "Interview",
    difficulty: Difficulty.medium,
    tags: ["behavioral", "value-proposition", "differentiation"],
  },
  {
    title: "Tell Me About a Time You Faced a Challenge or Conflict at Work",
    description:
      "A behavioral question to assess problem-solving and interpersonal skills. They are evaluating your emotional intelligence, ability to handle pressure, and conflict resolution style. Use the STAR method: Situation, Task, Action, Result.",
    category: "Interview",
    difficulty: Difficulty.medium,
    tags: ["behavioral", "STAR", "conflict-resolution", "problem-solving"],
  },
  {
    title: "Why Are You Leaving Your Current Job?",
    description:
      "Evaluates your professionalism and motivations. They want to ensure you are not leaving due to a major, repetitive negative issue. Focus on seeking new opportunities, growth, or a better fit — never bad-mouth your previous employer.",
    category: "Interview",
    difficulty: Difficulty.easy,
    tags: ["behavioral", "professionalism", "motivation", "career"],
  },
  {
    title: "Where Do You See Yourself in Five Years?",
    description:
      "Assesses your career goals and potential loyalty. They are looking for realistic career ambitions that align with the company's trajectory, checking if this role is a good stepping stone for you — indicating longevity.",
    category: "Interview",
    difficulty: Difficulty.easy,
    tags: ["behavioral", "career-goals", "ambition", "loyalty"],
  },
  {
    title: "How Do You Prioritize Your Work?",
    description:
      "Evaluates organizational skills and productivity. They want to know your methods for handling multiple tasks, deadlines, and stress. Include specific tools (calendars, task lists) and techniques to maintain high quality under pressure.",
    category: "Interview",
    difficulty: Difficulty.easy,
    tags: ["behavioral", "organization", "productivity", "time-management"],
  },
  {
    title: "Do You Have Any Questions for Us?",
    description:
      "The final opportunity to show engagement. Asking thoughtful questions about the team, culture, or future projects shows you are serious, curious, and prepared. Saying 'no' can make you look uninterested — always prepare 2-3 questions.",
    category: "Interview",
    difficulty: Difficulty.easy,
    tags: ["behavioral", "engagement", "curiosity", "preparation"],
  },
];

interface QuestionFormData {
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  tags: string;
}

const defaultForm: QuestionFormData = {
  title: "",
  description: "",
  category: "",
  difficulty: Difficulty.medium,
  tags: "",
};

const sampleCategories = [
  "Algorithms",
  "Data Structures",
  "System Design",
  "Behavioral",
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Security",
  "Interview",
];

function QuestionForm({
  initial,
  onSubmit,
  isPending,
  error,
}: {
  initial?: QuestionFormData;
  onSubmit: (data: QuestionFormData) => void;
  isPending: boolean;
  error?: string;
}) {
  const [form, setForm] = useState<QuestionFormData>(initial ?? defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title required";
    if (!form.description.trim()) errs.description = "Description required";
    if (!form.category.trim()) errs.category = "Category required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Question Title</Label>
        <Input
          id="title"
          placeholder="e.g. Implement a binary search algorithm"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Detailed description of the question, requirements, and constraints..."
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          className={`min-h-[100px] ${errors.description ? "border-destructive" : ""}`}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={form.category}
            onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
          >
            <SelectTrigger
              id="category"
              className={errors.category ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {sampleCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={form.difficulty}
            onValueChange={(v) =>
              setForm((p) => ({ ...p, difficulty: v as Difficulty }))
            }
          >
            <SelectTrigger id="difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Difficulty.easy}>Easy</SelectItem>
              <SelectItem value={Difficulty.medium}>Medium</SelectItem>
              <SelectItem value={Difficulty.hard}>Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          placeholder="e.g. arrays, sorting, time-complexity"
          value={form.tags}
          onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
        />
        <p className="text-xs text-muted-foreground">
          Separate tags with commas
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DialogFooter>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Question"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function QuestionBank() {
  const { data: questions, isLoading } = useGetAllQuestions();
  const { data: isAdmin } = useIsCallerAdmin();
  const addQuestion = useAddQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [addOpen, setAddOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedQuestions = async () => {
    setIsSeeding(true);
    let seeded = 0;
    try {
      for (const q of SEED_QUESTIONS) {
        await addQuestion.mutateAsync({
          title: q.title,
          description: q.description,
          category: q.category,
          difficulty: q.difficulty,
          tags: q.tags,
        });
        seeded++;
      }
      toast.success(`Question bank seeded with ${seeded} questions!`);
    } catch (err) {
      toast.error(
        `Seeding stopped after ${seeded} questions — please try again.`,
      );
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const categories = [
    ...new Set((questions ?? []).map((q) => q.category)),
  ].sort();

  const filtered = (questions ?? []).filter((q) => {
    const matchSearch =
      !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchDiff =
      filterDifficulty === "all" || q.difficulty === filterDifficulty;
    const matchCat = filterCategory === "all" || q.category === filterCategory;
    return matchSearch && matchDiff && matchCat;
  });

  const handleAdd = async (data: QuestionFormData) => {
    const tags = data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await addQuestion.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        tags,
      });
      setAddOpen(false);
      toast.success("Question added!");
    } catch (err) {
      toast.error("Failed to add question.");
      console.error(err);
    }
  };

  const handleUpdate = async (data: QuestionFormData) => {
    if (!editQuestion) return;
    const tags = data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await updateQuestion.mutateAsync({
        id: editQuestion.id,
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        tags,
      });
      setEditQuestion(null);
      toast.success("Question updated!");
    } catch (err) {
      toast.error("Failed to update question.");
      console.error(err);
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteQuestion.mutateAsync(id);
      toast.success("Question deleted.");
    } catch (err) {
      toast.error("Failed to delete question.");
      console.error(err);
    }
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading
              ? "Loading..."
              : `${questions?.length ?? 0} questions in the bank`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(isAdmin || questions?.length === 0) && !isLoading && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleSeedQuestions}
              disabled={isSeeding}
              data-ocid="questions.seed_button"
            >
              {isSeeding ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Database size={16} />
              )}
              {isSeeding ? "Seeding…" : "Seed Questions"}
            </Button>
          )}

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="questions.add_button"
              >
                <Plus size={16} />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-xl"
              data-ocid="questions.add_dialog"
            >
              <DialogHeader>
                <DialogTitle className="font-display">Add Question</DialogTitle>
                <DialogDescription>
                  Add a new question to the interview question bank.
                </DialogDescription>
              </DialogHeader>
              <QuestionForm
                onSubmit={handleAdd}
                isPending={addQuestion.isPending}
                error={
                  addQuestion.isError ? "Failed to add question." : undefined
                }
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-ocid="questions.search_input"
              />
            </div>
            <Select
              value={filterDifficulty}
              onValueChange={setFilterDifficulty}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter size={13} className="mr-1.5" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value={Difficulty.easy}>Easy</SelectItem>
                <SelectItem value={Difficulty.medium}>Medium</SelectItem>
                <SelectItem value={Difficulty.hard}>Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[160px]">
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
          </div>
        </CardContent>
      </Card>

      {/* Questions Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
            <Skeleton key={k} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="questions.empty_state"
        >
          <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="font-medium text-muted-foreground">
            {search || filterDifficulty !== "all" || filterCategory !== "all"
              ? "No questions match your filters."
              : "No questions in the bank yet."}
          </p>
          {!search &&
            filterDifficulty === "all" &&
            filterCategory === "all" && (
              <Button
                size="sm"
                className="mt-4 bg-primary text-primary-foreground"
                onClick={() => setAddOpen(true)}
              >
                <Plus size={13} className="mr-1.5" />
                Add first question
              </Button>
            )}
        </div>
      ) : (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-ocid="questions.list"
        >
          {filtered.map((question, idx) => (
            <Card
              key={question.id.toString()}
              className="border-border/60 hover:border-primary/30 transition-colors group"
              data-ocid={`questions.item.${idx + 1}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-display text-sm leading-snug flex-1">
                    {question.title}
                  </CardTitle>
                  <div className="flex gap-1.5 shrink-0">
                    {/* Edit */}
                    <Dialog
                      open={editQuestion?.id === question.id}
                      onOpenChange={(open) => {
                        if (!open) setEditQuestion(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setEditQuestion(question)}
                          data-ocid={`questions.edit_button.${idx + 1}`}
                        >
                          <Edit2 size={12} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className="max-w-xl"
                        data-ocid="questions.edit_dialog"
                      >
                        <DialogHeader>
                          <DialogTitle className="font-display">
                            Edit Question
                          </DialogTitle>
                          <DialogDescription>
                            Update question details.
                          </DialogDescription>
                        </DialogHeader>
                        {editQuestion && (
                          <QuestionForm
                            initial={{
                              title: editQuestion.title,
                              description: editQuestion.description,
                              category: editQuestion.category,
                              difficulty: editQuestion.difficulty,
                              tags: editQuestion.tags.join(", "),
                            }}
                            onSubmit={handleUpdate}
                            isPending={updateQuestion.isPending}
                            error={
                              updateQuestion.isError
                                ? "Failed to update."
                                : undefined
                            }
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Delete */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          data-ocid={`questions.delete_button.${idx + 1}`}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent data-ocid="questions.delete_dialog">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{question.title}".
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="questions.delete_cancel_button">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(question.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-ocid="questions.delete_confirm_button"
                          >
                            {deleteQuestion.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <DifficultyBadge difficulty={question.difficulty} />
                  <Badge variant="outline" className="text-xs border-border/60">
                    {question.category}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pb-4">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {question.description}
                </p>

                {question.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    <Tag size={11} className="text-muted-foreground shrink-0" />
                    {question.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                    {question.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{question.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
