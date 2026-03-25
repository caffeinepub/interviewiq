import Iter "mo:core/Iter";
import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";


import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserRole = {
    #admin;
    #recruiter;
    #user;
    #guest;
  };

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

  type QuestionInput = {
    title : Text;
    description : Text;
    category : Text;
    difficulty : Difficulty;
    tags : [Text];
  };

  type CandidateProfileUpdateInput = {
    name : ?Text;
    email : ?Text;
    targetRole : ?Text;
    experienceLevel : ?Text;
    extractedSkills : ?[Text];
    resumeText : ?Text;
  };

  type UserProfileUpdateInput = {
    name : ?Text;
  };

  type CandidateProfile = {
    name : Text;
    email : Text;
    targetRole : Text;
    experienceLevel : Text;
    extractedSkills : [Text];
    resumeText : Text;
  };

  type SkillsAndResume = {
    skills : [Text];
    resumeText : Text;
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

  type CheatingLog = {
    id : Nat;
    sessionId : Nat;
    principal : Principal;
    eventType : Text;
    description : Text;
    timestamp : Time.Time;
  };


  type RoleRequestStatus = {
    #pending;
    #approved;
    #denied;
  };

  type RequestedRole = {
    #evaluator;
    #recruiter;
  };

  type RoleRequest = {
    requester : Principal;
    name : Text;
    requestedRole : RequestedRole;
    reason : Text;
    timestamp : Time.Time;
    status : RoleRequestStatus;
  };

  type BannedUser = {
    principal : Principal;
    reason : Text;
    bannedAt : Time.Time;
  };

  var nextQuestionId = 1;
  var nextSessionId = 1;
  var nextCheatingLogId = 1;
  var globalDifficulty : Difficulty = #medium;

  let questions = Map.empty<Nat, Question>();
  let candidateProfiles = Map.empty<Principal, CandidateProfile>();
  let interviewSessions = Map.empty<Nat, SessionData>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let cheatingLogs = Map.empty<Nat, CheatingLog>();
  let bannedUsers = Map.empty<Principal, BannedUser>();
  let suspendedUsers = Map.empty<Principal, Text>();
  let userRoleOverride = Map.empty<Principal, UserRole>();

  let roleRequests = Map.empty<Principal, RoleRequest>();

  // ===== ADMIN CLAIM =====

  public shared ({ caller }) func claimFirstAdmin() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous identities cannot claim the first admin role");
    };
    if (accessControlState.adminAssigned) {
      Runtime.trap("Admin has already been claimed. Contact the existing admin to assign your role.");
    };
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
  };

  public shared ({ caller }) func selfRegisterAsUser() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous identities cannot register as user");
    };
    switch (accessControlState.userRoles.get(caller)) {
      case (?_) { () };
      case (null) {
        accessControlState.userRoles.add(caller, #user);
      };
    };
  };

  public query (_) func getAdminAssigned() : async Bool {
    accessControlState.adminAssigned;
  };

  // ===== ROLE MANAGEMENT =====

  public shared ({ caller }) func promoteToRecruiter(target : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can promote users");
    };
    accessControlState.userRoles.add(target, #user);
    userRoleOverride.add(target, #recruiter);
  };

  public shared ({ caller }) func demoteToUser(target : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can demote users");
    };
    userRoleOverride.remove(target);
    accessControlState.userRoles.add(target, #user);
  };

  public shared ({ caller }) func promoteToAdminRole(target : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can promote to admin");
    };
    accessControlState.userRoles.add(target, #admin);
    userRoleOverride.remove(target);
  };

  public query (_) func getEffectiveRole(target : Principal) : async Text {
    if (AccessControl.isAdmin(accessControlState, target)) {
      return "admin";
    };
    switch (userRoleOverride.get(target)) {
      case (?#recruiter) { return "recruiter" };
      case (_) {};
    };
    switch (accessControlState.userRoles.get(target)) {
      case (?#admin) { "admin" };
      case (?#user) { "user" };
      case (_) { "guest" };
    };
  };


  // ===== ROLE REQUESTS =====

  public shared ({ caller }) func submitRoleRequest(requestedRole : RequestedRole, reason : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous identities cannot submit role requests");
    };
    let name = switch (userProfiles.get(caller)) {
      case (?profile) { profile.name };
      case (null) { "Unknown User" };
    };
    let request : RoleRequest = {
      requester = caller;
      name = name;
      requestedRole = requestedRole;
      reason = reason;
      timestamp = Time.now();
      status = #pending;
    };
    roleRequests.add(caller, request);
  };

  public query ({ caller }) func getMyRoleRequest() : async ?RoleRequest {
    roleRequests.get(caller);
  };

  public query ({ caller }) func getAllRoleRequests() : async [RoleRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view role requests");
    };
    roleRequests.values().toArray();
  };

  public shared ({ caller }) func approveRoleRequest(requester : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can approve role requests");
    };
    switch (roleRequests.get(requester)) {
      case (null) { Runtime.trap("Role request not found") };
      case (?req) {
        let updatedReq : RoleRequest = {
          requester = req.requester;
          name = req.name;
          requestedRole = req.requestedRole;
          reason = req.reason;
          timestamp = req.timestamp;
          status = #approved;
        };
        roleRequests.add(requester, updatedReq);
        switch (req.requestedRole) {
          case (#evaluator) { accessControlState.userRoles.add(requester, #user) };
          case (#recruiter) { userRoleOverride.add(requester, #recruiter) };
        };
      };
    };
  };

  public shared ({ caller }) func denyRoleRequest(requester : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can deny role requests");
    };
    switch (roleRequests.get(requester)) {
      case (null) { Runtime.trap("Role request not found") };
      case (?req) {
        let updatedReq : RoleRequest = {
          requester = req.requester;
          name = req.name;
          requestedRole = req.requestedRole;
          reason = req.reason;
          timestamp = req.timestamp;
          status = #denied;
        };
        roleRequests.add(requester, updatedReq);
      };
    };
  };

  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin are allowed to access this resource");
    };
    userProfiles.toArray();
  };

  public query ({ caller }) func getAllCandidateProfiles() : async [(Principal, CandidateProfile)] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isRecruiter = switch (userRoleOverride.get(caller)) {
      case (?#recruiter) { true };
      case (_) { false };
    };
    if (not isAdmin and not isRecruiter) {
      Runtime.trap("Unauthorized: Only admin or recruiter can access this resource");
    };
    candidateProfiles.toArray();
  };

  public query ({ caller }) func getAllUserRoles() : async [(Principal, Text)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view all roles");
    };
    let result = List.empty<(Principal, Text)>();
    for ((p, role) in accessControlState.userRoles.entries()) {
      let effectiveRole = switch (userRoleOverride.get(p)) {
        case (?#recruiter) { "recruiter" };
        case (_) {
          switch (role) {
            case (#admin) { "admin" };
            case (#user) { "user" };
            case (_) { "guest" };
          };
        };
      };
      result.add((p, effectiveRole));
    };
    result.toArray();
  };

  // ===== BAN / SUSPEND =====

  public shared ({ caller }) func banUser(target : Principal, reason : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can ban users");
    };
    let banned : BannedUser = {
      principal = target;
      reason;
      bannedAt = Time.now();
    };
    bannedUsers.add(target, banned);
  };

  public shared ({ caller }) func unbanUser(target : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can unban users");
    };
    bannedUsers.remove(target);
  };

  public query (_) func isBanned(target : Principal) : async Bool {
    switch (bannedUsers.get(target)) {
      case (?_) { true };
      case (null) { false };
    };
  };

  public shared ({ caller }) func suspendUser(target : Principal, reason : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can suspend users");
    };
    suspendedUsers.add(target, reason);
  };

  public shared ({ caller }) func unsuspendUser(target : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can unsuspend users");
    };
    suspendedUsers.remove(target);
  };

  public query (_) func isSuspended(target : Principal) : async Bool {
    switch (suspendedUsers.get(target)) {
      case (?_) { true };
      case (null) { false };
    };
  };

  public query ({ caller }) func getBannedUsers() : async [BannedUser] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view banned users");
    };
    bannedUsers.values().toArray();
  };

  // ===== CHEATING LOGS =====

  public shared ({ caller }) func logCheatingEvent(sessionId : Nat, eventType : Text, description : Text) : async Nat {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot log cheating events");
    };
    let id = nextCheatingLogId;
    let log : CheatingLog = {
      id;
      sessionId;
      principal = caller;
      eventType;
      description;
      timestamp = Time.now();
    };
    cheatingLogs.add(id, log);
    nextCheatingLogId += 1;

    // Auto-flag the session if enough events
    switch (interviewSessions.get(sessionId)) {
      case (?data) {
        let sessionLogCount = cheatingLogs.values().filter(
          func(l) { l.sessionId == sessionId }
        ).toArray().size();
        if (sessionLogCount >= 3) {
          let updatedSession : InterviewSession = {
            data.session with
            flagged = true;
            flagNote = ?("Auto-flagged: " # sessionLogCount.toText() # " suspicious events detected");
          };
          interviewSessions.add(sessionId, { data with session = updatedSession });
        };
      };
      case (null) {};
    };
    id;
  };

  public query ({ caller }) func getCheatingLogs() : async [CheatingLog] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view cheating logs");
    };
    cheatingLogs.values().toArray();
  };

  public query ({ caller }) func getCheatingLogsBySession(sessionId : Nat) : async [CheatingLog] {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot view cheating logs");
    };
    cheatingLogs.values().filter(func(l) { l.sessionId == sessionId }).toArray();
  };

  public query ({ caller }) func getFlaggedSessions() : async [InterviewSession] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view flagged sessions");
    };
    interviewSessions.values().filter(func(d) { d.session.flagged }).map(func(d) { d.session }).toArray();
  };

  // ===== GLOBAL DIFFICULTY =====

  public shared ({ caller }) func setGlobalDifficulty(diff : Difficulty) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set global difficulty");
    };
    globalDifficulty := diff;
  };

  public query (_) func getGlobalDifficulty() : async Difficulty {
    globalDifficulty;
  };

  // ===== PLATFORM ANALYTICS =====

  type PlatformStats = {
    totalUsers : Nat;
    totalSessions : Nat;
    flaggedSessions : Nat;
    totalQuestions : Nat;
    bannedUsersCount : Nat;
  };

  public query ({ caller }) func getPlatformStats() : async PlatformStats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view platform stats");
    };
    let flagged = interviewSessions.values().filter(func(d) { d.session.flagged }).toArray().size();
    {
      totalUsers = accessControlState.userRoles.size();
      totalSessions = interviewSessions.size();
      flaggedSessions = flagged;
      totalQuestions = questions.size();
      bannedUsersCount = bannedUsers.size();
    };
  };

  public query ({ caller }) func getAllSessions() : async [InterviewSession] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      let isRecruiter = switch (userRoleOverride.get(caller)) {
        case (?#recruiter) { true };
        case (_) { false };
      };
      if (not isRecruiter) {
        Runtime.trap("Unauthorized: Only admin or recruiter can view all sessions");
      };
    };
    interviewSessions.values().map(func(d) { d.session }).toArray();
  };

  // ===== USER PROFILE =====

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func updateCallerUserProfile(profileUpdate : UserProfileUpdateInput) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot save profiles");
    };
    switch (accessControlState.userRoles.get(caller)) {
      case (null) {
        accessControlState.userRoles.add(caller, #user);
      };
      case (?_) { () };
    };
    let existingProfile = switch (userProfiles.get(caller)) {
      case (null) { { name = "New User" } };
      case (?existing) { existing };
    };
    let updatedProfile : UserProfile = {
      name = switch (profileUpdate.name) {
        case (null) { existingProfile.name };
        case (?newName) { newName };
      };
    };
    userProfiles.add(caller, updatedProfile);
  };

  // ===== DELETE ACCOUNT =====

  public shared ({ caller }) func deleteMyAccount() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot delete accounts");
    };
    userProfiles.remove(caller);
    candidateProfiles.remove(caller);
    accessControlState.userRoles.remove(caller);
    userRoleOverride.remove(caller);
  };

  // ===== QUESTIONS =====

  public shared ({ caller }) func addQuestion(input : QuestionInput) : async Nat {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isRecruiter = switch (userRoleOverride.get(caller)) {
      case (?#recruiter) { true };
      case (_) { false };
    };
    if (not isAdmin and not isRecruiter) {
      Runtime.trap("Unauthorized: Only admins or recruiters can add questions");
    };
    let id = nextQuestionId;
    let question : Question = {
      id;
      title = input.title;
      description = input.description;
      category = input.category;
      difficulty = input.difficulty;
      tags = input.tags;
    };
    questions.add(id, question);
    nextQuestionId += 1;
    id;
  };

  public shared ({ caller }) func updateQuestion(id : Nat, input : QuestionInput) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update questions");
    };
    switch (questions.get(id)) {
      case (null) { Runtime.trap("Question not found") };
      case (?_) {
        let question : Question = { id; title = input.title; description = input.description; category = input.category; difficulty = input.difficulty; tags = input.tags };
        questions.add(id, question);
      };
    };
  };

  public shared ({ caller }) func deleteQuestion(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete questions");
    };
    questions.remove(id);
  };

  public query (_) func getAllQuestions() : async [Question] {
    questions.values().toArray();
  };

  public query (_) func getQuestionsByIds(ids : [Nat]) : async [Question] {
    questions.values().filter(func(q) { ids.find(func(id) { id == q.id }) != null }).toArray();
  };

  public query (_) func getQuestionsByCategory(category : Text) : async [Question] {
    questions.values().filter(func(q) { Text.equal(q.category, category) }).toArray();
  };

  public query (_) func getFilteredQuestions(category : ?Text, difficulty : ?Difficulty, search : ?Text) : async [Question] {
    questions.values().filter(func(q) {
      (switch (category) { case (null) { true }; case (?cat) { Text.equal(q.category, cat) } }) and
      (switch (difficulty) { case (null) { true }; case (?diff) { q.difficulty == diff } }) and
      (switch (search) {
        case (null) { true };
        case (?s) {
          let st = s.toLower();
          q.title.toLower().contains(#text st) or q.description.toLower().contains(#text st) or q.category.toLower().contains(#text st);
        };
      });
    }).toArray();
  };

  public shared ({ caller }) func seedQuestions() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can seed questions");
    };
    let seeds : [QuestionInput] = [
      { title = "Tell me about yourself"; description = "Provide a brief professional summary"; category = "Behavioral"; difficulty = #easy; tags = ["intro", "communication"] },
      { title = "Why do you want this role?"; description = "Explain your motivation for applying"; category = "Behavioral"; difficulty = #easy; tags = ["motivation"] },
      { title = "Describe a challenge you overcame"; description = "Give a specific example of overcoming a work challenge"; category = "Behavioral"; difficulty = #medium; tags = ["problem-solving"] },
      { title = "Reverse a linked list"; description = "Given the head of a singly linked list, reverse it and return the reversed list"; category = "DSA"; difficulty = #medium; tags = ["linked-list", "pointers"] },
      { title = "Two Sum"; description = "Find indices of two numbers that add up to a target"; category = "DSA"; difficulty = #easy; tags = ["array", "hash-map"] },
      { title = "Binary Search"; description = "Implement binary search on a sorted array"; category = "DSA"; difficulty = #easy; tags = ["search", "divide-and-conquer"] },
      { title = "LRU Cache"; description = "Design and implement a Least Recently Used cache"; category = "DSA"; difficulty = #hard; tags = ["design", "hash-map", "doubly-linked-list"] },
      { title = "What is normalization?"; description = "Explain database normalization and its normal forms"; category = "DBMS"; difficulty = #medium; tags = ["normalization", "relational"] },
      { title = "ACID properties"; description = "Explain the ACID properties of database transactions"; category = "DBMS"; difficulty = #medium; tags = ["transactions", "consistency"] },
      { title = "SQL vs NoSQL"; description = "Compare SQL and NoSQL databases with use cases"; category = "DBMS"; difficulty = #easy; tags = ["sql", "nosql", "comparison"] },
      { title = "Process vs Thread"; description = "Explain the differences between a process and a thread"; category = "OS"; difficulty = #medium; tags = ["process", "thread", "concurrency"] },
      { title = "Deadlock conditions"; description = "List and explain the four conditions necessary for deadlock"; category = "OS"; difficulty = #medium; tags = ["deadlock", "synchronization"] },
      { title = "Virtual memory"; description = "Explain virtual memory and paging mechanisms"; category = "OS"; difficulty = #hard; tags = ["memory", "paging"] },
      { title = "Design a URL shortener"; description = "Design a scalable URL shortening service like bit.ly"; category = "System Design"; difficulty = #medium; tags = ["scalability", "hashing", "database"] },
      { title = "Design Twitter"; description = "Design the high-level architecture of a Twitter-like social media platform"; category = "System Design"; difficulty = #hard; tags = ["scalability", "feed", "microservices"] },
      { title = "What is REST?"; description = "Explain REST architecture and its principles"; category = "Web"; difficulty = #easy; tags = ["rest", "api", "http"] },
      { title = "Explain closures in JavaScript"; description = "What is a closure and provide a practical example"; category = "Web"; difficulty = #medium; tags = ["javascript", "closures", "scope"] },
      { title = "Merge sort implementation"; description = "Implement merge sort and analyze its time and space complexity"; category = "DSA"; difficulty = #medium; tags = ["sorting", "divide-and-conquer", "recursion"] },
      { title = "What is a mutex?"; description = "Explain mutual exclusion and when to use mutexes"; category = "OS"; difficulty = #medium; tags = ["mutex", "synchronization", "concurrency"] }
    ];
    for (seed in seeds.values()) {
      let id = nextQuestionId;
      questions.add(id, { id; title = seed.title; description = seed.description; category = seed.category; difficulty = seed.difficulty; tags = seed.tags });
      nextQuestionId += 1;
    };
  };

  // ===== CANDIDATE PROFILE =====

  public shared ({ caller }) func updateCandidateProfile(profileUpdate : CandidateProfileUpdateInput) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot create candidate profiles");
    };
    switch (accessControlState.userRoles.get(caller)) {
      case (null) { accessControlState.userRoles.add(caller, #user) };
      case (?_) { () };
    };
    let emptyProfile = { name = "New Candidate"; email = ""; targetRole = ""; experienceLevel = ""; extractedSkills = []; resumeText = "" };
    let existingProfile = switch (candidateProfiles.get(caller)) {
      case (null) { emptyProfile };
      case (?existing) { existing };
    };
    let updatedProfile : CandidateProfile = {
      name = switch (profileUpdate.name) { case (null) { existingProfile.name }; case (?v) { v } };
      email = switch (profileUpdate.email) { case (null) { existingProfile.email }; case (?v) { v } };
      targetRole = switch (profileUpdate.targetRole) { case (null) { existingProfile.targetRole }; case (?v) { v } };
      experienceLevel = switch (profileUpdate.experienceLevel) { case (null) { existingProfile.experienceLevel }; case (?v) { v } };
      extractedSkills = switch (profileUpdate.extractedSkills) { case (null) { existingProfile.extractedSkills }; case (?v) { v } };
      resumeText = switch (profileUpdate.resumeText) { case (null) { existingProfile.resumeText }; case (?v) { v } };
    };
    candidateProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func updateResumeSkills(skills : [Text], resumeText : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot save resume skills");
    };
    let currentProfile = switch (candidateProfiles.get(caller)) {
      case (null) { { name = ""; email = ""; targetRole = ""; experienceLevel = ""; extractedSkills = skills; resumeText } };
      case (?existing) { { existing with extractedSkills = skills; resumeText } };
    };
    candidateProfiles.add(caller, currentProfile);
  };

  public query ({ caller }) func getResumeSkills(candidate : Principal) : async ?SkillsAndResume {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot view resume skills");
    };
    if (caller != candidate and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own resume skills");
    };
    switch (candidateProfiles.get(candidate)) {
      case (null) { null };
      case (?profile) { ?{ skills = profile.extractedSkills; resumeText = profile.resumeText } };
    };
  };

  public shared ({ caller }) func getResumeSkillsDeprecated(candidate : Principal) : async ([Text], Text) {
    if (caller.isAnonymous()) { Runtime.trap("Anonymous users cannot view resume skills") };
    if (caller != candidate and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own resume skills");
    };
    switch (candidateProfiles.get(candidate)) {
      case (null) { Runtime.trap("No skills found in backend") };
      case (?c) { (c.extractedSkills, c.resumeText) };
    };
  };

  public query ({ caller }) func getCandidateProfile(candidate : Principal) : async ?CandidateProfile {
    if (caller.isAnonymous()) { Runtime.trap("Anonymous users cannot view candidate profiles") };
    if (caller != candidate and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own candidate profile");
    };
    candidateProfiles.get(candidate);
  };

  // ===== SESSIONS =====

  func autoRegisterUserIfNeeded(caller : Principal) {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Anonymous users are not allowed") };
    switch (accessControlState.userRoles.get(caller)) {
      case (null) { accessControlState.userRoles.add(caller, #user) };
      case (?_) { () };
    };
  };

  func checkSessionReadAccess(caller : Principal, session : InterviewSession) {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Anonymous users cannot view sessions") };
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      if (caller != session.candidate and caller != session.evaluator) {
        Runtime.trap("Unauthorized: Can only view your own sessions");
      };
    };
  };

  public query ({ caller }) func getSession(sessionId : Nat) : async ?InterviewSession {
    switch (interviewSessions.get(sessionId)) {
      case (null) { null };
      case (?data) {
        checkSessionReadAccess(caller, data.session);
        ?data.session;
      };
    };
  };

  public shared ({ caller }) func startSession(sessionId : Nat) : async () {
    autoRegisterUserIfNeeded(caller);
    let sessionData = switch (interviewSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?data) { data };
    };
    if (caller != sessionData.session.candidate) {
      Runtime.trap("Unauthorized: Only the assigned candidate can start this session");
    };
    let updatedSession : InterviewSession = { sessionData.session with status = #inProgress; startTime = ?Time.now() };
    interviewSessions.add(sessionId, { sessionData with session = updatedSession });
  };

  public shared ({ caller }) func submitSession(sessionId : Nat) : async () {
    autoRegisterUserIfNeeded(caller);
    let sessionData = switch (interviewSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?data) { data };
    };
    if (caller != sessionData.session.candidate) {
      Runtime.trap("Unauthorized: Only the assigned candidate can submit this session");
    };
    let scoredSubmissions = sessionData.submissions.map(func(submission : AnswerSubmission) : AnswerSubmission {
      let answerLength = submission.answerText.size();
      let (score, feedback) = if (answerLength == 0) { (0, "No answer provided.") }
        else if (answerLength <= 49) { (20, "Brief answer — try to elaborate more.") }
        else if (answerLength <= 149) { (50, "Adequate answer — could be more detailed.") }
        else if (answerLength <= 299) { (70, "Good answer — well explained.") }
        else { (90, "Excellent answer — comprehensive and detailed.") };
      { submission with score = ?score; feedback = ?feedback };
    });
    let totalScore = scoredSubmissions.foldLeft(0, func(acc, s) { switch (s.score) { case (null) { acc }; case (?v) { acc + v } } });
    let numSubmissions = scoredSubmissions.foldLeft(0, func(acc, s) { if (s.answerText != "") { acc + 1 } else { acc } });
    let overallScore = if (numSubmissions > 0) { totalScore / numSubmissions } else { 0 };
    let autoFeedback = if (overallScore >= 80) { "Outstanding performance!" }
      else if (overallScore >= 60) { "Good effort! Keep refining your explanations." }
      else if (overallScore >= 40) { "Decent attempt. Focus on more detailed answers." }
      else { "Keep practicing! Elaborate with examples." };
    let updatedSession : InterviewSession = { sessionData.session with status = #evaluated; endTime = ?Time.now(); overallScore = ?overallScore; feedback = ?autoFeedback };
    interviewSessions.add(sessionId, { session = updatedSession; submissions = scoredSubmissions });
  };

  public shared ({ caller }) func scoreAnswer(sessionId : Nat, questionId : Nat, score : Nat, feedback : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can score answers");
    };
    let sessionData = switch (interviewSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?data) { data };
    };
    let updatedSubmissions = sessionData.submissions.map(func(submission : AnswerSubmission) : AnswerSubmission {
      if (submission.questionId == questionId) { { submission with score = ?score; feedback = ?feedback } } else { submission };
    });
    interviewSessions.add(sessionId, { sessionData with submissions = updatedSubmissions });
  };

  public shared ({ caller }) func addOverallAssessment(sessionId : Nat, overallScore : Nat, feedback : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add overall assessments");
    };
    let sessionData = switch (interviewSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?data) { data };
    };
    let updatedSession : InterviewSession = { sessionData.session with status = #evaluated; overallScore = ?overallScore; feedback = ?feedback };
    interviewSessions.add(sessionId, { sessionData with session = updatedSession });
  };

  public shared ({ caller }) func flagSession(sessionId : Nat, note : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can flag sessions");
    };
    let sessionData = switch (interviewSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?data) { data };
    };
    let updatedSession : InterviewSession = { sessionData.session with flagged = true; flagNote = ?note };
    interviewSessions.add(sessionId, { sessionData with session = updatedSession });
  };

  func submitAnswerPrivate(caller : Principal, sessionId : Nat, questionId : Nat, answerText : Text, timeTakenSeconds : Nat) {
    let sessionData = switch (interviewSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?data) { data };
    };
    if (caller != sessionData.session.candidate) {
      Runtime.trap("Unauthorized: Only the assigned candidate can submit answers to this session");
    };
    let submissions = List.empty<AnswerSubmission>();
    for (submission in sessionData.submissions.values()) { submissions.add(submission) };
    let filteredSubmissions = submissions.filter(func(submission) { submission.questionId != questionId });
    let answer : AnswerSubmission = { questionId; answerText; timeTakenSeconds; score = null; feedback = null };
    filteredSubmissions.add(answer);
    interviewSessions.add(sessionId, { sessionData with submissions = filteredSubmissions.toArray() });
  };

  public shared ({ caller }) func submitAnswer(sessionId : Nat, questionId : Nat, answerText : Text, timeTakenSeconds : Nat) : async () {
    autoRegisterUserIfNeeded(caller);
    submitAnswerPrivate(caller, sessionId, questionId, answerText, timeTakenSeconds);
  };

  public shared ({ caller }) func createInterviewSession(candidate : Principal, questionIds : [Nat], timeLimitMinutes : Nat) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create interview sessions");
    };
    let id = nextSessionId;
    let session : InterviewSession = { id; candidate; evaluator = caller; questionIds; timeLimitMinutes; status = #scheduled; startTime = null; endTime = null; overallScore = null; feedback = null; flagged = false; flagNote = null };
    interviewSessions.add(id, { session; submissions = [] });
    nextSessionId += 1;
    id;
  };

  public shared ({ caller }) func createMockInterview(questionIds : [Nat], timeLimitMinutes : Nat) : async Nat {
    autoRegisterUserIfNeeded(caller);
    let id = nextSessionId;
    let session : InterviewSession = { id; candidate = caller; evaluator = caller; questionIds; timeLimitMinutes; status = #scheduled; startTime = null; endTime = null; overallScore = null; feedback = null; flagged = false; flagNote = null };
    interviewSessions.add(id, { session; submissions = [] });
    nextSessionId += 1;
    id;
  };

  public shared ({ caller }) func scoreMockAnswer(sessionId : Nat, questionId : Nat, score : Nat, feedback : Text) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Anonymous users cannot score mock interviews") };
    let sessionData = switch (interviewSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?data) { data };
    };
    if (caller != sessionData.session.candidate and caller != sessionData.session.evaluator) {
      Runtime.trap("Unauthorized: Only the creator can score their own mock interview");
    };
    let updatedSubmissions = sessionData.submissions.map(func(submission : AnswerSubmission) : AnswerSubmission {
      if (submission.questionId == questionId) { { submission with score = ?score; feedback = ?feedback } } else { submission };
    });
    interviewSessions.add(sessionId, { sessionData with submissions = updatedSubmissions });
  };

  public query ({ caller }) func getSessionAnswers(sessionId : Nat) : async [AnswerSubmission] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Anonymous users cannot view session answers") };
    switch (interviewSessions.get(sessionId)) {
      case (null) { [] };
      case (?data) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          if (caller != data.session.candidate and caller != data.session.evaluator) {
            Runtime.trap("Unauthorized: Can only view your own session answers");
          };
        };
        data.submissions;
      };
    };
  };

  public query ({ caller }) func getMySessions() : async [InterviewSession] {
    if (caller.isAnonymous()) { Runtime.trap("Anonymous users cannot view sessions") };
    interviewSessions.values().filter(func(d) { d.session.candidate == caller }).map(func(d) { d.session }).toArray();
  };
};
