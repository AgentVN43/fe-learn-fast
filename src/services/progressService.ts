import { apiCall } from "../utils/apiClient";

export interface ProgressData {
  _id: string;
  userId: string;
  flashcardId: {
    _id?: string;
    term?: string;
    definition?: string;
    image?: string | null;
    id?: string;
  } | string | null;
  studySetId: string;
  difficulty: "easy" | "medium" | "hard";
  reviewCount: number;
  lastReviewed: string | null;
  isMastered: boolean;
  nextReviewAt: string | null;
  correctCount: number;
  incorrectCount: number;
  confidenceLevel: number;
}

export interface ProgressStats {
  total: number;
  mastered: number;
  totalReviewed: number;
  needReview: number;
  averageConfidence: string;
  totalCorrect: number;
  totalIncorrect: number;
  totalReviews: number;
  accuracyRate: number;
}

export const progressService = {
  // Initialize progress for study set
  initProgress: async (studySetId: string) => {
    return apiCall(`/progress/study-set/${studySetId}/init`, {
      method: "POST",
    });
  },

  // Get all progress records for a study set
  getProgress: async (studySetId: string) => {
    return apiCall<{ success: boolean; data: ProgressData[] }>(
      `/progress/study-set/${studySetId}`,
      { method: "GET" }
    );
  },

  // Get progress stats for a study set
  getStats: async (studySetId: string) => {
    return apiCall<{ success: boolean; stats: ProgressStats }>(
      `/progress/study-set/${studySetId}/stats`,
      { method: "GET" }
    );
  },

  // Get flashcards that need review
  getNeedReview: async (studySetId: string) => {
    return apiCall<{ success: boolean; data: ProgressData[] }>(
      `/progress/study-set/${studySetId}/need-review`,
      { method: "GET" }
    );
  },

  // Get mastered flashcards
  getMastered: async (studySetId: string) => {
    return apiCall<{ success: boolean; data: ProgressData[] }>(
      `/progress/study-set/${studySetId}/mastered`,
      { method: "GET" }
    );
  },

  // Submit review for a flashcard
  submitReview: async (
    flashcardId: string,
    studySetId: string,
    isCorrect: boolean,
    difficulty: "easy" | "medium" | "hard"
  ) => {
    return apiCall<{ success: boolean; data: ProgressData }>(
      `/progress/${flashcardId}/study-set/${studySetId}/review`,
      {
        method: "POST",
        body: JSON.stringify({ isCorrect, difficulty }),
      }
    );
  },

  // Update flashcard difficulty
  updateDifficulty: async (
    flashcardId: string,
    studySetId: string,
    difficulty: "easy" | "medium" | "hard"
  ) => {
    return apiCall<{ success: boolean; data: ProgressData }>(
      `/progress/${flashcardId}/study-set/${studySetId}/difficulty`,
      {
        method: "PUT",
        body: JSON.stringify({ difficulty }),
      }
    );
  },

  // Mark flashcard as mastered
  markAsMastered: async (
    flashcardId: string,
    studySetId: string
  ) => {
    return apiCall<{ success: boolean; data: ProgressData }>(
      `/progress/${flashcardId}/study-set/${studySetId}/mastered`,
      {
        method: "PUT",
        body: JSON.stringify({ isMastered: true }),
      }
    );
  },

  // Reset progress for a study set
  resetProgress: async (studySetId: string) => {
    return apiCall(`/progress/study-set/${studySetId}/reset`, {
      method: "DELETE",
    });
  },

  // Get user progress (all study sets aggregated)
  getUserProgress: async (userId: string) => {
    return apiCall<{ data: ProgressData[]; stats?: Record<string, any> }>(
      `/progress/user-progress/${userId}`,
      { method: "GET" }
    );
  },

  // Get progress stats by userId (deprecated, use getUserProgress)
  getStatsByUserId: async (userId: string) => {
    return apiCall<ProgressData[]>(`/progress/stats?userId=${userId}`, {
      method: "GET",
    });
  },

  // Submit reflex grade for a flashcard
  submitReflexGrade: async (
    flashcardId: string,
    studySetId: string,
    difficulty: "easy" | "hard",
    reactionTime: number
  ) => {
    return apiCall<{ success: boolean; data: ProgressData }>(
      `/progress/${flashcardId}/study-set/${studySetId}/reflex-grade`,
      {
        method: "POST",
        body: JSON.stringify({
          difficulty,
          reactionTime,
          isCorrect: difficulty === "easy",
        }),
      }
    );
  },

  // Get quick review pool - thẻ cần ôn tập ngay
  getQuickReviewPool: async (userId: string) => {
    return apiCall<{ success: boolean; data: any[] }>(
      `/progress/quick-review-pool/${userId}`,
      { method: "GET" }
    );
  },
};
