export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  stats: {
    questionsAsked: number;
    accuracyRate: number;
    topicsMastered: number;
    learningStreak: number;
  };
  subjects: {
    [key: string]: number; // subject name: score
  };
  activities: {
    practice: number;
    quizzes: number;
    challenges: number;
  };
  dailyActivity: {
    [key: string]: number; // date: number of questions
  };
  assignments: Array<{
    name: string;
    due: string;
  }>;
  lastLogin: Date;
  createdAt: Date;
}
