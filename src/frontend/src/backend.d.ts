import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface AnswerSubmission {
    feedback?: string;
    score?: bigint;
    timeTakenSeconds: bigint;
    questionId: bigint;
    answerText: string;
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
export interface CandidateProfile {
    experienceLevel: string;
    name: string;
    email: string;
    targetRole: string;
}
export interface Question {
    id: bigint;
    title: string;
    difficulty: Difficulty;
    tags: Array<string>;
    description: string;
    category: string;
}
export interface UserProfile {
    name: string;
}
export enum Difficulty {
    easy = "easy",
    hard = "hard",
    medium = "medium"
}
export enum InterviewStatus {
    scheduled = "scheduled",
    evaluated = "evaluated",
    completed = "completed",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addOverallAssessment(sessionId: bigint, overallScore: bigint, feedback: string): Promise<void>;
    addQuestion(title: string, description: string, category: string, difficulty: Difficulty, tags: Array<string>): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCandidateProfile(name: string, email: string, targetRole: string, experienceLevel: string): Promise<void>;
    createInterviewSession(candidate: Principal, questionIds: Array<bigint>, timeLimitMinutes: bigint): Promise<bigint>;
    createMockInterview(questionIds: Array<bigint>, timeLimitMinutes: bigint): Promise<bigint>;
    deleteQuestion(id: bigint): Promise<void>;
    flagSession(sessionId: bigint, note: string): Promise<void>;
    getAllQuestions(): Promise<Array<Question>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCandidateProfile(candidate: Principal): Promise<CandidateProfile | null>;
    getSession(sessionId: bigint): Promise<InterviewSession | null>;
    getSessionAnswers(sessionId: bigint): Promise<Array<AnswerSubmission>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    scoreAnswer(sessionId: bigint, questionId: bigint, score: bigint, feedback: string): Promise<void>;
    scoreMockAnswer(sessionId: bigint, questionId: bigint, score: bigint, feedback: string): Promise<void>;
    startSession(sessionId: bigint): Promise<void>;
    submitAnswer(sessionId: bigint, questionId: bigint, answerText: string, timeTakenSeconds: bigint): Promise<void>;
    submitSession(sessionId: bigint): Promise<void>;
    updateQuestion(id: bigint, title: string, description: string, category: string, difficulty: Difficulty, tags: Array<string>): Promise<void>;
}
