import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  type OldQuestion = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    difficulty : {
      #easy;
      #medium;
      #hard;
    };
    tags : [Text];
  };

  type OldCandidateProfile = {
    name : Text;
    email : Text;
    targetRole : Text;
    experienceLevel : Text;
  };

  type OldUserProfile = {
    name : Text;
  };

  type OldInterviewStatus = {
    #scheduled;
    #inProgress;
    #completed;
    #evaluated;
  };

  type OldInterviewSession = {
    id : Nat;
    candidate : Principal.Principal;
    evaluator : Principal.Principal;
    questionIds : [Nat];
    timeLimitMinutes : Nat;
    status : OldInterviewStatus;
    startTime : ?Int;
    endTime : ?Int;
    overallScore : ?Nat;
    feedback : ?Text;
    flagged : Bool;
    flagNote : ?Text;
  };

  type OldAnswerSubmission = {
    questionId : Nat;
    answerText : Text;
    timeTakenSeconds : Nat;
    score : ?Nat;
    feedback : ?Text;
  };

  type OldSessionData = {
    session : OldInterviewSession;
    submissions : [OldAnswerSubmission];
  };

  type OldActor = {
    nextQuestionId : Nat;
    nextSessionId : Nat;
    questions : Map.Map<Nat, OldQuestion>;
    candidateProfiles : Map.Map<Principal.Principal, OldCandidateProfile>;
    interviewSessions : Map.Map<Nat, OldSessionData>;
    userProfiles : Map.Map<Principal.Principal, OldUserProfile>;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewActor = {
    nextQuestionId : Nat;
    nextSessionId : Nat;
    questions : Map.Map<Nat, OldQuestion>;
    candidateProfiles : Map.Map<Principal.Principal, OldCandidateProfile>;
    interviewSessions : Map.Map<Nat, OldSessionData>;
    userProfiles : Map.Map<Principal.Principal, OldUserProfile>;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
