import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AnswerSubmission,
  CandidateProfile,
  Difficulty,
  InterviewSession,
  Question,
  UserProfile,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

// ────────────────────────────────────────────────────────────────────────────
// Queries
// ────────────────────────────────────────────────────────────────────────────

export function useGetAllQuestions() {
  const { actor, isFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ["questions"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllQuestions();
      } catch (err) {
        // Backend traps if user is not registered (e.g. anonymous actor or unregistered user).
        // Return empty array instead of crashing the UI.
        console.warn(
          "getAllQuestions failed (user may not be registered):",
          err,
        );
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSession(sessionId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<InterviewSession | null>({
    queryKey: ["session", sessionId?.toString()],
    queryFn: async () => {
      if (!actor || sessionId === null) return null;
      return actor.getSession(sessionId);
    },
    enabled: !!actor && !isFetching && sessionId !== null,
    refetchInterval: 5000,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCandidateProfile(principal: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<CandidateProfile | null>({
    queryKey: ["candidateProfile", principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      // @ts-ignore – principal string coercion handled by SDK
      return actor.getCandidateProfile(principal as never);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Mutations
// ────────────────────────────────────────────────────────────────────────────

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useCreateCandidateProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      targetRole: string;
      experienceLevel: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCandidateProfile(
        data.name,
        data.email,
        data.targetRole,
        data.experienceLevel,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["candidateProfile"] });
    },
  });
}

export function useCreateMockInterview() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      questionIds: bigint[];
      timeLimitMinutes: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createMockInterview(data.questionIds, data.timeLimitMinutes);
    },
  });
}

export function useCreateInterviewSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      candidate: string;
      questionIds: bigint[];
      timeLimitMinutes: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      // @ts-ignore
      return actor.createInterviewSession(
        data.candidate as never,
        data.questionIds,
        data.timeLimitMinutes,
      );
    },
  });
}

export function useStartSession() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.startSession(sessionId);
    },
    onSuccess: (_data, sessionId) => {
      void qc.invalidateQueries({
        queryKey: ["session", sessionId.toString()],
      });
    },
  });
}

export function useSubmitAnswer() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      sessionId: bigint;
      questionId: bigint;
      answerText: string;
      timeTakenSeconds: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitAnswer(
        data.sessionId,
        data.questionId,
        data.answerText,
        data.timeTakenSeconds,
      );
    },
  });
}

export function useSubmitSession() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitSession(sessionId);
    },
    onSuccess: (_data, sessionId) => {
      void qc.invalidateQueries({
        queryKey: ["session", sessionId.toString()],
      });
    },
  });
}

export function useScoreAnswer() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      sessionId: bigint;
      questionId: bigint;
      score: bigint;
      feedback: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.scoreAnswer(
        data.sessionId,
        data.questionId,
        data.score,
        data.feedback,
      );
    },
  });
}

export function useAddOverallAssessment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      sessionId: bigint;
      overallScore: bigint;
      feedback: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addOverallAssessment(
        data.sessionId,
        data.overallScore,
        data.feedback,
      );
    },
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({
        queryKey: ["session", vars.sessionId.toString()],
      });
    },
  });
}

export function useFlagSession() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { sessionId: bigint; note: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.flagSession(data.sessionId, data.note);
    },
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({
        queryKey: ["session", vars.sessionId.toString()],
      });
    },
  });
}

export function useAddQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      category: string;
      difficulty: Difficulty;
      tags: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addQuestion(
        data.title,
        data.description,
        data.category,
        data.difficulty,
        data.tags,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}

export function useUpdateQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      category: string;
      difficulty: Difficulty;
      tags: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateQuestion(
        data.id,
        data.title,
        data.description,
        data.category,
        data.difficulty,
        data.tags,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}

export function useDeleteQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteQuestion(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}

export function useGetSessionAnswers(sessionId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<AnswerSubmission[]>({
    queryKey: ["sessionAnswers", sessionId?.toString()],
    queryFn: async () => {
      if (!actor || sessionId === null) return [];
      return actor.getSessionAnswers(sessionId);
    },
    enabled: !!actor && !isFetching && sessionId !== null,
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { user: never; role: UserRole }) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignCallerUserRole(data.user, data.role);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["callerRole"] });
      void qc.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useGetAdminAssigned() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["adminAssigned"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getAdminAssigned();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClaimFirstAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.claimFirstAdmin();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["isAdmin"] });
      void qc.invalidateQueries({ queryKey: ["callerRole"] });
      void qc.invalidateQueries({ queryKey: ["adminAssigned"] });
    },
  });
}
