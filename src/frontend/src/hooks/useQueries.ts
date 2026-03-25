import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserRole } from "../backend";
import type {
  AnswerSubmission,
  BannedUser,
  CandidateProfile,
  CheatingLog,
  Difficulty,
  InterviewSession,
  PlatformStats,
  Question,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

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
      try {
        return await actor.getSession(sessionId);
      } catch (err) {
        console.warn("getSession failed:", err);
        return null;
      }
    },
    enabled: !!actor && !isFetching && sessionId !== null,
    refetchInterval: 3000,
    retry: 6,
    retryDelay: 1000,
    staleTime: 0,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
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
      try {
        return await actor.getCallerUserRole();
      } catch {
        return "guest" as UserRole;
      }
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
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
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
      try {
        // @ts-ignore – principal string coercion handled by SDK
        return await actor.getCandidateProfile(principal as never);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useGetCallerCandidateProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<CandidateProfile | null>({
    queryKey: ["callerCandidateProfile"],
    queryFn: async () => {
      if (!actor || !identity) return null;
      try {
        // @ts-ignore
        return await actor.getCandidateProfile(
          identity.getPrincipal() as never,
        );
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetAllCandidateProfiles(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, CandidateProfile]>>({
    queryKey: ["allCandidateProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getAllCandidateProfiles();
        return result.map(([principal, profile]) => [
          principal.toString(),
          profile,
        ]);
      } catch (err) {
        console.warn("getAllCandidateProfiles failed:", err);
        return [];
      }
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useGetAllUserProfiles(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, UserProfile]>>({
    queryKey: ["allUserProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getAllUserProfiles();
        return result.map(([principal, profile]) => [
          principal.toString(),
          profile,
        ]);
      } catch (err) {
        console.warn("getAllUserProfiles failed:", err);
        return [];
      }
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useGetAllSessions(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<InterviewSession[]>({
    queryKey: ["allSessions"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // @ts-ignore -- new backend method not yet in generated wrapper
        return await actor.getAllSessions();
      } catch (err) {
        console.warn("getAllSessions failed:", err);
        return [];
      }
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useGetMySessions() {
  const { actor, isFetching } = useActor();
  return useQuery<InterviewSession[]>({
    queryKey: ["mySessions"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // @ts-ignore -- new backend method not yet in generated wrapper
        return await actor.getMySessions();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPlatformStats(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<PlatformStats | null>({
    queryKey: ["platformStats"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        // @ts-ignore -- new backend method not yet in generated wrapper
        return await actor.getPlatformStats();
      } catch (err) {
        console.warn("getPlatformStats failed:", err);
        return null;
      }
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useGetAllUserRoles(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, string]>>({
    queryKey: ["allUserRoles"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // @ts-ignore -- new backend method not yet in generated wrapper
        const result = await actor.getAllUserRoles();
        return result.map(([p, r]) => [p.toString(), r]);
      } catch (err) {
        console.warn("getAllUserRoles failed:", err);
        return [];
      }
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useGetBannedUsers(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<BannedUser[]>({
    queryKey: ["bannedUsers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // @ts-ignore -- new backend method not yet in generated wrapper
        return await actor.getBannedUsers();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useGetCheatingLogs(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<CheatingLog[]>({
    queryKey: ["cheatingLogs"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // @ts-ignore -- new backend method not yet in generated wrapper
        return await actor.getCheatingLogs();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useGetFlaggedSessions(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<InterviewSession[]>({
    queryKey: ["flaggedSessions"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // @ts-ignore -- new backend method not yet in generated wrapper
        return await actor.getFlaggedSessions();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useGetAllRoleRequests(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<import("../backend.d").RoleRequest[]>({
    queryKey: ["allRoleRequests"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as any).getAllRoleRequests();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useGetGlobalDifficulty(enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["globalDifficulty"],
    queryFn: async () => {
      if (!actor) return "medium";
      try {
        // @ts-ignore -- new backend method not yet in generated wrapper
        return await actor.getGlobalDifficulty();
      } catch {
        return "medium";
      }
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Mutations
// ────────────────────────────────────────────────────────────────────────────

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: { name?: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCallerUserProfile(profile);
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
      return actor.updateCandidateProfile({
        name: data.name,
        email: data.email,
        targetRole: data.targetRole,
        experienceLevel: data.experienceLevel,
      });
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
      return actor.addQuestion({
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        tags: data.tags,
      });
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
      return actor.updateQuestion(data.id, {
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        tags: data.tags,
      });
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
      try {
        return await actor.getSessionAnswers(sessionId);
      } catch (err) {
        console.warn("getSessionAnswers failed:", err);
        return [];
      }
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

export function useSelfRegisterAsUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.selfRegisterAsUser();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["callerRole"] });
      void qc.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useLogCheatingEvent() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      sessionId: bigint;
      eventType: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      // @ts-ignore -- new backend method not yet in generated wrapper
      return actor.logCheatingEvent(
        data.sessionId,
        data.eventType,
        data.description,
      );
    },
  });
}

export function useDeleteMyAccount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      // @ts-ignore -- new backend method not yet in generated wrapper
      return actor.deleteMyAccount();
    },
    onSuccess: () => {
      void qc.invalidateQueries();
    },
  });
}

export function useSetGlobalDifficulty() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (diff: string) => {
      if (!actor) throw new Error("Not connected");
      // @ts-ignore -- new backend method not yet in generated wrapper
      return actor.setGlobalDifficulty(diff as never);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["globalDifficulty"] });
    },
  });
}

export function useBanUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { principal: string; reason: string }) => {
      if (!actor) throw new Error("Not connected");
      // @ts-ignore -- new backend method not yet in generated wrapper
      return actor.banUser(data.principal as never, data.reason);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["bannedUsers"] });
      void qc.invalidateQueries({ queryKey: ["allUserRoles"] });
      void qc.invalidateQueries({ queryKey: ["platformStats"] });
    },
  });
}

export function useUnbanUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principal: string) => {
      if (!actor) throw new Error("Not connected");
      // @ts-ignore -- new backend method not yet in generated wrapper
      return actor.unbanUser(principal as never);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["bannedUsers"] });
      void qc.invalidateQueries({ queryKey: ["platformStats"] });
    },
  });
}

export function useSuspendUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { principal: string; reason: string }) => {
      if (!actor) throw new Error("Not connected");
      // @ts-ignore -- new backend method not yet in generated wrapper
      return actor.suspendUser(data.principal as never, data.reason);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["allUserRoles"] });
    },
  });
}

export function useUnsuspendUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principal: string) => {
      if (!actor) throw new Error("Not connected");
      // @ts-ignore -- new backend method not yet in generated wrapper
      return actor.unsuspendUser(principal as never);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["allUserRoles"] });
    },
  });
}

export function usePromoteToRecruiter() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principal: string) => {
      if (!actor) throw new Error("Not connected");
      // @ts-ignore -- new backend method not yet in generated wrapper
      return actor.promoteToRecruiter(principal as never);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["allUserRoles"] });
    },
  });
}

export function useDemoteToUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principal: string) => {
      if (!actor) throw new Error("Not connected");
      // @ts-ignore -- new backend method not yet in generated wrapper
      return actor.demoteToUser(principal as never);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["allUserRoles"] });
    },
  });
}

export function usePromoteToAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principal: string) => {
      if (!actor) throw new Error("Not connected");
      // @ts-ignore -- new backend method not yet in generated wrapper
      return actor.promoteToAdminRole(principal as never);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["allUserRoles"] });
      void qc.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}
