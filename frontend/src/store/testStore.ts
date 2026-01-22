import { create } from 'zustand';
import type { CandidateQuestionResponse, SubmitAnswerRequest } from '@/services/api';

interface TestTakingState {
  questions: CandidateQuestionResponse[];
  currentQuestionIndex: number;
  answers: Map<number, SubmitAnswerRequest>;
  timeRemaining: number; // in seconds
  isSubmitting: boolean;
  hasStarted: boolean;
  
  // Actions
  setQuestions: (questions: CandidateQuestionResponse[]) => void;
  setCurrentQuestion: (index: number) => void;
  setAnswer: (questionId: number, answer: SubmitAnswerRequest) => void;
  setTimeRemaining: (time: number) => void;
  decrementTime: () => void;
  setSubmitting: (submitting: boolean) => void;
  startTest: (durationMinutes: number) => void;
  getAnswersArray: () => SubmitAnswerRequest[];
  isQuestionAnswered: (questionId: number) => boolean;
  getAnsweredCount: () => number;
  reset: () => void;
}

export const useTestStore = create<TestTakingState>((set, get) => ({
  questions: [],
  currentQuestionIndex: 0,
  answers: new Map(),
  timeRemaining: 0,
  isSubmitting: false,
  hasStarted: false,

  setQuestions: (questions) => set({ questions }),

  setCurrentQuestion: (index) => set({ currentQuestionIndex: index }),

  setAnswer: (questionId, answer) =>
    set((state) => {
      const newAnswers = new Map(state.answers);
      newAnswers.set(questionId, answer);
      // Also save to localStorage for recovery
      localStorage.setItem('testAnswers', JSON.stringify(Array.from(newAnswers.entries())));
      return { answers: newAnswers };
    }),

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  decrementTime: () =>
    set((state) => ({
      timeRemaining: Math.max(0, state.timeRemaining - 1),
    })),

  setSubmitting: (submitting) => set({ isSubmitting: submitting }),

  startTest: (durationMinutes) => {
    // Try to recover answers from localStorage
    const savedAnswers = localStorage.getItem('testAnswers');
    let answers = new Map<number, SubmitAnswerRequest>();
    
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers);
        answers = new Map(parsed);
      } catch (e) {
        console.error('Failed to parse saved answers:', e);
      }
    }

    set({
      hasStarted: true,
      timeRemaining: durationMinutes * 60,
      answers,
    });
  },

  getAnswersArray: () => {
    const state = get();
    return Array.from(state.answers.values());
  },

  isQuestionAnswered: (questionId) => {
    const state = get();
    const answer = state.answers.get(questionId);
    if (!answer) return false;
    return answer.selectedAnswerId !== null || (answer.openAnswerText?.trim().length ?? 0) > 0;
  },

  getAnsweredCount: () => {
    const state = get();
    let count = 0;
    state.answers.forEach((answer) => {
      if (answer.selectedAnswerId !== null || (answer.openAnswerText?.trim().length ?? 0) > 0) {
        count++;
      }
    });
    return count;
  },

  reset: () => {
    localStorage.removeItem('testAnswers');
    set({
      questions: [],
      currentQuestionIndex: 0,
      answers: new Map(),
      timeRemaining: 0,
      isSubmitting: false,
      hasStarted: false,
    });
  },
}));
