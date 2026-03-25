import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfileUpdateInput {
    name?: string;
}
export interface CandidateProfileUpdateInput {
    experienceLevel?: string;
    name?: string;
    email?: string;
    resumeText?: string;
    extractedSkills?: Array<string>;
    targetRole?: string;
}
export type Time = bigint;
export interface SkillsAndResume {
    resumeText: string;
    skills: Array<string>;
}
export interface AnswerSubmission {
    feedback?: string;
    score?: bigint;
    timeTakenSeconds: bigint;
    questionId: bigint;
    answerText: string;
}
export interface QuestionInput {
    title: string;
    difficulty: Difficulty;
    tags: Array<string>;
    description: string;
    category: string;
}
export interface InterviewSession {
    id: bigint;
    startTime?: Time;
    status: InterviewStatus;
    evaluator: Principal;
    overallScore?: bigint;
    endTime?: Time;
    feedback?: string;
    timeLimitMinutes: bigint;
    flagNote?: string;
    questionIds: Array<bigint>;
    candidate: Principal;
    flagged: boolean;
}
export interface Question {
    id: bigint;
    title: string;
    difficulty: Difficulty;
    tags: Array<string>;
    description: string;
    category: string;
}
export interface CandidateProfile {
    experienceLevel: string;
    name: string;
    email: string;
    resumeText: string;
    extractedSkills: Array<string>;
    targetRole: string;
}
export interface UserProfile {
    name: string;
}
export interface CheatingLog {
    id: bigint;
    sessionId: bigint;
    principal: Principal;
    eventType: string;
    description: string;
    timestamp: Time;
}
export interface BannedUser {
    principal: Principal;
    reason: string;
    bannedAt: Time;
}
export interface PlatformStats {
    totalUsers: bigint;
    totalSessions: bigint;
    flaggedSessions: bigint;
    totalQuestions: bigint;
    bannedUsersCount: bigint;
}
export type RoleRequestStatus = "pending" | "approved" | "denied";
export type RequestedRole = "evaluator" | "recruiter";
export interface RoleRequest {
    requester: Principal;
    name: string;
    requestedRole: RequestedRole;
    reason: string;
    timestamp: Time;
    status: RoleRequestStatus;
}
export enum Difficulty {
    easy = "easy",
    hard = "hard",
    medium = "medium"
}
export enum InterviewStatus {
    scheduled = "scheduled",
    evaluated = "evaluated",
    inProgress = "inProgress",
    completed = "completed"
}
export interface _SERVICE {
    submitRoleRequest: (requestedRole: RequestedRole, reason: string) => Promise<void>;
    getMyRoleRequest: () => Promise<Option<RoleRequest>>;
    getAllRoleRequests: () => Promise<Array<RoleRequest>>;
    approveRoleRequest: (requester: Principal) => Promise<void>;
    denyRoleRequest: (requester: Principal) => Promise<void>;
    claimFirstAdmin: () => Promise<void>;
    selfRegisterAsUser: () => Promise<void>;
    getAdminAssigned: () => Promise<boolean>;
    promoteToRecruiter: (target: Principal) => Promise<void>;
    demoteToUser: (target: Principal) => Promise<void>;
    promoteToAdminRole: (target: Principal) => Promise<void>;
    getEffectiveRole: (target: Principal) => Promise<string>;
    getAllUserProfiles: () => Promise<Array<[Principal, UserProfile]>>;
    getAllCandidateProfiles: () => Promise<Array<[Principal, CandidateProfile]>>;
    getAllUserRoles: () => Promise<Array<[Principal, string]>>;
    banUser: (target: Principal, reason: string) => Promise<void>;
    unbanUser: (target: Principal) => Promise<void>;
    isBanned: (target: Principal) => Promise<boolean>;
    suspendUser: (target: Principal, reason: string) => Promise<void>;
    unsuspendUser: (target: Principal) => Promise<void>;
    isSuspended: (target: Principal) => Promise<boolean>;
    getBannedUsers: () => Promise<Array<BannedUser>>;
    logCheatingEvent: (sessionId: bigint, eventType: string, description: string) => Promise<bigint>;
    getCheatingLogs: () => Promise<Array<CheatingLog>>;
    getCheatingLogsBySession: (sessionId: bigint) => Promise<Array<CheatingLog>>;
    getFlaggedSessions: () => Promise<Array<InterviewSession>>;
    setGlobalDifficulty: (diff: Difficulty) => Promise<void>;
    getGlobalDifficulty: () => Promise<Difficulty>;
    getPlatformStats: () => Promise<PlatformStats>;
    getAllSessions: () => Promise<Array<InterviewSession>>;
    getCallerUserProfile: () => Promise<Option<UserProfile>>;
    getUserProfile: (user: Principal) => Promise<Option<UserProfile>>;
    updateCallerUserProfile: (input: UserProfileUpdateInput) => Promise<void>;
    deleteMyAccount: () => Promise<void>;
    addQuestion: (input: QuestionInput) => Promise<bigint>;
    updateQuestion: (id: bigint, input: QuestionInput) => Promise<void>;
    deleteQuestion: (id: bigint) => Promise<void>;
    getAllQuestions: () => Promise<Array<Question>>;
    getQuestionsByIds: (ids: Array<bigint>) => Promise<Array<Question>>;
    getQuestionsByCategory: (category: string) => Promise<Array<Question>>;
    getFilteredQuestions: (category: Option<string>, difficulty: Option<Difficulty>, search: Option<string>) => Promise<Array<Question>>;
    seedQuestions: () => Promise<void>;
    updateCandidateProfile: (input: CandidateProfileUpdateInput) => Promise<void>;
    updateResumeSkills: (skills: Array<string>, resumeText: string) => Promise<void>;
    getResumeSkills: (candidate: Principal) => Promise<Option<SkillsAndResume>>;
    getResumeSkillsDeprecated: (candidate: Principal) => Promise<[Array<string>, string]>;
    getCandidateProfile: (candidate: Principal) => Promise<Option<CandidateProfile>>;
    createInterviewSession: (candidate: Principal, questionIds: Array<bigint>, timeLimitMinutes: bigint) => Promise<bigint>;
    createMockInterview: (questionIds: Array<bigint>, timeLimitMinutes: bigint) => Promise<bigint>;
    startSession: (sessionId: bigint) => Promise<void>;
    submitSession: (sessionId: bigint) => Promise<void>;
    submitAnswer: (sessionId: bigint, questionId: bigint, answerText: string, timeTakenSeconds: bigint) => Promise<void>;
    scoreAnswer: (sessionId: bigint, questionId: bigint, score: bigint, feedback: string) => Promise<void>;
    scoreMockAnswer: (sessionId: bigint, questionId: bigint, score: bigint, feedback: string) => Promise<void>;
    addOverallAssessment: (sessionId: bigint, overallScore: bigint, feedback: string) => Promise<void>;
    flagSession: (sessionId: bigint, note: string) => Promise<void>;
    getSession: (sessionId: bigint) => Promise<Option<InterviewSession>>;
    getSessionAnswers: (sessionId: bigint) => Promise<Array<AnswerSubmission>>;
    getMySessions: () => Promise<Array<InterviewSession>>;
}
