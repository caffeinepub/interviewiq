import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Difficulty = {
    #easy;
    #medium;
    #hard;
  };

  module Difficulty {
    public func compare(left : Difficulty, right : Difficulty) : Order.Order {
      switch (left, right) {
        case (#easy, #easy) { #equal };
        case (#easy, _) { #less };
        case (#medium, #easy) { #greater };
        case (#medium, #medium) { #equal };
        case (#medium, #hard) { #less };
        case (#hard, #hard) { #equal };
        case (#hard, _) { #greater };
      };
    };
  };

  type Question = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    difficulty : Difficulty;
    tags : [Text];
  };

  type CandidateProfile = {
    name : Text;
    email : Text;
    targetRole : Text;
    experienceLevel : Text;
  };

  type UserProfile = {
    name : Text;
  };

  type InterviewStatus = {
    #scheduled;
    #inProgress;
    #completed;
    #evaluated;
  };

  type InterviewSession = {
    id : Nat;
    candidate : Principal;
    evaluator : Principal;
    questionIds : [Nat];
    timeLimitMinutes : Nat;
    status : InterviewStatus;
    startTime : ?Time.Time;
    endTime : ?Time.Time;
    overallScore : ?Nat;
    feedback : ?Text;
    flagged : Bool;
    flagNote : ?Text;
  };

  type AnswerSubmission = {
    questionId : Nat;
    answerText : Text;
    timeTakenSeconds : Nat;
    score : ?Nat;
    feedback : ?Text;
  };

  type SessionData = {
    session : InterviewSession;
    submissions : [AnswerSubmission];
  };

  var nextQuestionId = 1;
  var nextSessionId = 1;
  let questions = Map.empty<Nat, Question>();
  let candidateProfiles = Map.empty<Principal, CandidateProfile>();
  let interviewSessions = Map.empty<Nat, SessionData>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Question Bank Management (Admin/Evaluator only)
  public shared ({ caller }) func addQuestion(title : Text, description : Text, category : Text, difficulty : Difficulty, tags : [Text]) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add questions");
    };
    let id = nextQuestionId;
    let question : Question = {
      id;
      title;
      description;
      category;
      difficulty;
      tags;
    };
    questions.add(id, question);
    nextQuestionId += 1;
    id;
  };

  public shared ({ caller }) func updateQuestion(id : Nat, title : Text, description : Text, category : Text, difficulty : Difficulty, tags : [Text]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update questions");
    };
    switch (questions.get(id)) {
      case (null) { Runtime.trap("Question not found") };
      case (?_) {
        let question : Question = {
          id;
          title;
          description;
          category;
          difficulty;
          tags;
        };
        questions.add(id, question);
      };
    };
  };

  public shared ({ caller }) func deleteQuestion(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete questions");
    };
    questions.remove(id);
  };

  public query ({ caller }) func getAllQuestions() : async [Question] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view questions");
    };
    questions.values().toArray();
  };

  // Candidate Profile Management
  public shared ({ caller }) func createCandidateProfile(name : Text, email : Text, targetRole : Text, experienceLevel : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create candidate profiles");
    };

    let profile : CandidateProfile = {
      name;
      email;
      targetRole;
      experienceLevel;
    };
    candidateProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCandidateProfile(candidate : Principal) : async ?CandidateProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view candidate profiles");
    };
    // Users can view their own profile, admins can view any profile
    if (caller != candidate and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own candidate profile");
    };
    candidateProfiles.get(candidate);
  };

  // Interview Session Management
  public shared ({ caller }) func createInterviewSession(candidate : Principal, questionIds : [Nat], timeLimitMinutes : Nat) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only evaluators can create interview sessions");
    };

    let id = nextSessionId;
    let session : InterviewSession = {
      id;
      candidate;
      evaluator = caller;
      questionIds;
      timeLimitMinutes;
      status = #scheduled;
      startTime = null;
      endTime = null;
      overallScore = null;
      feedback = null;
      flagged = false;
      flagNote = null;
    };
    let sessionData : SessionData = {
      session;
      submissions = [];
    };
    interviewSessions.add(id, sessionData);
    nextSessionId += 1;
    id;
  };

  public query ({ caller }) func getSession(sessionId : Nat) : async ?InterviewSession {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sessions");
    };
    
    switch (interviewSessions.get(sessionId)) {
      case (null) { null };
      case (?data) {
        // Candidates can view their own sessions, evaluators can view sessions they created, admins can view all
        if (caller != data.session.candidate and caller != data.session.evaluator and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own sessions");
        };
        ?data.session;
      };
    };
  };

  public shared ({ caller }) func startSession(sessionId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start sessions");
    };

    let sessionData = switch (interviewSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?data) { data };
    };

    // Only the candidate can start their session
    if (caller != sessionData.session.candidate) {
      Runtime.trap("Unauthorized: Only the assigned candidate can start this session");
    };

    let updatedSession : InterviewSession = {
      id = sessionData.session.id;
      candidate = sessionData.session.candidate;
      evaluator = sessionData.session.evaluator;
      questionIds = sessionData.session.questionIds;
      timeLimitMinutes = sessionData.session.timeLimitMinutes;
      status = #inProgress;
      startTime = ?Time.now();
      endTime = sessionData.session.endTime;
      overallScore = sessionData.session.overallScore;
      feedback = sessionData.session.feedback;
      flagged = sessionData.session.flagged;
      flagNote = sessionData.session.flagNote;
    };

    let updatedData : SessionData = {
      session = updatedSession;
      submissions = sessionData.submissions;
    };
    interviewSessions.add(sessionId, updatedData);
  };

  public shared ({ caller }) func submitSession(sessionId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit sessions");
    };

    let sessionData = switch (interviewSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?data) { data };
    };

    // Only the candidate can submit their session
    if (caller != sessionData.session.candidate) {
      Runtime.trap("Unauthorized: Only the assigned candidate can submit this session");
    };

    let updatedSession : InterviewSession = {
      id = sessionData.session.id;
      candidate = sessionData.session.candidate;
      evaluator = sessionData.session.evaluator;
      questionIds = sessionData.session.questionIds;
      timeLimitMinutes = sessionData.session.timeLimitMinutes;
      status = #completed;
      startTime = sessionData.session.startTime;
      endTime = ?Time.now();
      overallScore = sessionData.session.overallScore;
      feedback = sessionData.session.feedback;
      flagged = sessionData.session.flagged;
      flagNote = sessionData.session.flagNote;
    };

    let updatedData : SessionData = {
      session = updatedSession;
      submissions = sessionData.submissions;
    };
    interviewSessions.add(sessionId, updatedData);
  };

  // Answer Submission
  public shared ({ caller }) func submitAnswer(sessionId : Nat, questionId : Nat, answerText : Text, timeTakenSeconds : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit answers");
    };

    let sessionData = switch (interviewSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?data) { data };
    };

    // Only the candidate assigned to this session can submit answers
    if (caller != sessionData.session.candidate) {
      Runtime.trap("Unauthorized: Only the assigned candidate can submit answers to this session");
    };

    let answer : AnswerSubmission = {
      questionId;
      answerText;
      timeTakenSeconds;
      score = null;
      feedback = null;
    };

    let submissions = List.empty<AnswerSubmission>();
    for (submission in sessionData.submissions.values()) {
      submissions.add(submission);
    };
    submissions.add(answer);

    let updatedData : SessionData = {
      session = sessionData.session;
      submissions = submissions.toArray();
    };
    interviewSessions.add(sessionId, updatedData);
  };

  // Scoring (Evaluator only)
  public shared ({ caller }) func scoreAnswer(sessionId : Nat, questionId : Nat, score : Nat, feedback : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only evaluators can score answers");
    };

    let sessionData = switch (interviewSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?data) { data };
    };

    // Evaluators can only score sessions they created (or admins can score any)
    if (caller != sessionData.session.evaluator and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the assigned evaluator can score this session");
    };

    let updatedSubmissions = sessionData.submissions.map(
      func(submission : AnswerSubmission) : AnswerSubmission {
        if (submission.questionId == questionId) {
          {
            questionId = submission.questionId;
            answerText = submission.answerText;
            timeTakenSeconds = submission.timeTakenSeconds;
            score = ?score;
            feedback = ?feedback;
          };
        } else {
          submission;
        };
      }
    );

    let updatedData : SessionData = {
      session = sessionData.session;
      submissions = updatedSubmissions;
    };
    interviewSessions.add(sessionId, updatedData);
  };

  public shared ({ caller }) func addOverallAssessment(sessionId : Nat, overallScore : Nat, feedback : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only evaluators can add overall assessments");
    };

    let sessionData = switch (interviewSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?data) { data };
    };

    // Evaluators can only assess sessions they created (or admins can assess any)
    if (caller != sessionData.session.evaluator and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the assigned evaluator can assess this session");
    };

    let updatedSession : InterviewSession = {
      id = sessionData.session.id;
      candidate = sessionData.session.candidate;
      evaluator = sessionData.session.evaluator;
      questionIds = sessionData.session.questionIds;
      timeLimitMinutes = sessionData.session.timeLimitMinutes;
      status = #evaluated;
      startTime = sessionData.session.startTime;
      endTime = sessionData.session.endTime;
      overallScore = ?overallScore;
      feedback = ?feedback;
      flagged = sessionData.session.flagged;
      flagNote = sessionData.session.flagNote;
    };

    let updatedData : SessionData = {
      session = updatedSession;
      submissions = sessionData.submissions;
    };
    interviewSessions.add(sessionId, updatedData);
  };

  // Flagging (Evaluator only)
  public shared ({ caller }) func flagSession(sessionId : Nat, note : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only evaluators can flag sessions");
    };

    let sessionData = switch (interviewSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?data) { data };
    };

    // Evaluators can only flag sessions they created (or admins can flag any)
    if (caller != sessionData.session.evaluator and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the assigned evaluator can flag this session");
    };

    let updatedSession : InterviewSession = {
      id = sessionData.session.id;
      candidate = sessionData.session.candidate;
      evaluator = sessionData.session.evaluator;
      questionIds = sessionData.session.questionIds;
      timeLimitMinutes = sessionData.session.timeLimitMinutes;
      status = sessionData.session.status;
      startTime = sessionData.session.startTime;
      endTime = sessionData.session.endTime;
      overallScore = sessionData.session.overallScore;
      feedback = sessionData.session.feedback;
      flagged = true;
      flagNote = ?note;
    };

    let updatedData : SessionData = {
      session = updatedSession;
      submissions = sessionData.submissions;
    };
    interviewSessions.add(sessionId, updatedData);
  };

  // Mock Interviews (Candidate self-practice)
  public shared ({ caller }) func createMockInterview(questionIds : [Nat], timeLimitMinutes : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create mock interviews");
    };

    let id = nextSessionId;
    let session : InterviewSession = {
      id;
      candidate = caller;
      evaluator = caller;
      questionIds;
      timeLimitMinutes;
      status = #scheduled;
      startTime = null;
      endTime = null;
      overallScore = null;
      feedback = null;
      flagged = false;
      flagNote = null;
    };
    let sessionData : SessionData = {
      session;
      submissions = [];
    };
    interviewSessions.add(id, sessionData);
    nextSessionId += 1;
    id;
  };

  public shared ({ caller }) func scoreMockAnswer(sessionId : Nat, questionId : Nat, score : Nat, feedback : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can score mock interviews");
    };

    let sessionData = switch (interviewSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?data) { data };
    };

    // Only the candidate who created the mock interview can score it
    if (caller != sessionData.session.candidate or caller != sessionData.session.evaluator) {
      Runtime.trap("Unauthorized: Only the creator can score their own mock interview");
    };

    let updatedSubmissions = sessionData.submissions.map(
      func(submission : AnswerSubmission) : AnswerSubmission {
        if (submission.questionId == questionId) {
          {
            questionId = submission.questionId;
            answerText = submission.answerText;
            timeTakenSeconds = submission.timeTakenSeconds;
            score = ?score;
            feedback = ?feedback;
          };
        } else {
          submission;
        };
      }
    );

    let updatedData : SessionData = {
      session = sessionData.session;
      submissions = updatedSubmissions;
    };
    interviewSessions.add(sessionId, updatedData);
  };
};
