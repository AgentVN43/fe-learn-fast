import type { StudySet, StudySetFormData, StudySetsResponse } from "../types";
import { apiCall } from "../utils/apiClient";

export const studySetService = {
  // Get popular study sets
  getPopular: async (page = 1, limit = 10) => {
    return apiCall<StudySetsResponse>(
      `/study-sets/popular?page=${page}&limit=${limit}`,
      { method: "GET" }
    );
  },

  // Get latest study sets
  getLatest: async (page = 1, limit = 10) => {
    return apiCall<StudySetsResponse>(
      `/study-sets/latest?page=${page}&limit=${limit}`,
      { method: "GET" }
    );
  },

  // Get study set by ID
  getById: async (id: string): Promise<{ success: boolean; data: StudySet }> => {
    return apiCall(`/study-sets/${id}`, { method: "GET" });
  },

  // Create study set
  create: async (data: StudySetFormData): Promise<{ success: boolean; data: StudySet }> => {
    return apiCall("/study-sets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update study set
  update: async (
    id: string,
    data: Partial<StudySetFormData>
  ): Promise<{ success: boolean; data: StudySet }> => {
    return apiCall(`/study-sets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete study set
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiCall(`/study-sets/${id}`, { method: "DELETE" });
  },

  // Get user study sets
  getUserStudySets: async (userId: string, includeArchived = false) => {
    const response = await apiCall<{ success: boolean; data: StudySet[] }>(
      `/study-sets/user/${userId}?includeArchived=${includeArchived}`,
      { method: "GET" }
    );
    return response.data || [];
  },

  // Archive study set
  archive: async (id: string): Promise<{ success: boolean; data: StudySet }> => {
    return apiCall(`/study-sets/${id}/archive`, { method: "POST" });
  },

  // Restore study set
  restore: async (id: string): Promise<{ success: boolean; data: StudySet }> => {
    return apiCall(`/study-sets/${id}/restore`, { method: "POST" });
  },

  // Like study set
  like: async (id: string): Promise<{ success: boolean; data: StudySet }> => {
    return apiCall(`/study-sets/${id}/like`, { method: "POST" });
  },

  // Search study sets
  search: async (query: string, page = 1, limit = 20) => {
    return apiCall<StudySetsResponse>(
      `/study-sets/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
      { method: "GET" }
    );
  },

  // Get learn cards
  getLearnCards: async (id: string) => {
    return apiCall(`/study-sets/${id}/learn`, { method: "GET" });
  },

  // Get test cards
  getTestCards: async (id: string) => {
    return apiCall(`/study-sets/${id}/test`, { method: "GET" });
  },
};
