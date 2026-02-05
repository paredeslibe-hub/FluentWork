export enum AppView {
  LOGIN = 'login',
  ONBOARDING = 'onboarding',
  DASHBOARD = 'dashboard',
  VOCABULARY = 'vocabulary',
  FLASHCARDS = 'flashcards',
  PRACTICE = 'practice',
  CALENDAR = 'calendar'
}

export interface UserProfile {
  level: string;
  context: string;
  goal: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  spanish: string;
  example: string;
  category: 'general' | 'professional';
  masteryLevel: number;
  nextReviewDate: string;
  commonError?: string;
}

export interface FlashcardState {
  currentCardIndex: number;
  showBack: boolean;
  userInput: string;
}

export interface PracticeAttempt {
  date: string;
  scenarioTitle: string;
  userInput: string;
  correctedEn: string;
  feedbackEs: string;
  isCorrect: boolean;
}

export interface HistoryEntry {
  date: string;
  type: string;
  description: string;
  details?: PracticeAttempt;
}

export interface UserProgress {
  history: HistoryEntry[];
  mistakes: string[];
  totalDaysPracticed: number;
}

export interface PracticeScenario {
  title: string;
  prompt: string;
  context: string;
  theory?: string;
}

export interface DailyGoal {
  day: string;
  goal: string;
  time: string;
  completed: boolean;
  practiceScenario: PracticeScenario;
}

export interface WeeklyPlan {
  weekNumber: number;
  mainFocus: string;
  grammarFocus: string;
  dailyGoals: DailyGoal[];
  newVocabulary: VocabularyItem[];
}
