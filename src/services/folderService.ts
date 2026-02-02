import type { Folder } from "../types";
import { apiCall } from "../utils/apiClient";

export const folderService = {
  // Get user folders
  getUserFolders: async (userId: string) => {
    return apiCall<{ success: boolean; data: Folder[] }>(
      `/folders/user/${userId}`,
      { method: "GET" }
    );
  },

  // Get folder by ID
  getById: async (id: string) => {
    return apiCall<{ success: boolean; data: Folder }>(
      `/folders/${id}`,
      { method: "GET" }
    );
  },

  // Create folder
  create: async (data: { name: string; description?: string }) => {
    return apiCall<{ success: boolean; data: Folder }>("/folders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update folder
  update: async (
    id: string,
    data: Partial<{ name: string; description: string }>
  ) => {
    return apiCall<{ success: boolean; data: Folder }>(`/folders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete folder
  delete: async (id: string) => {
    return apiCall<{ success: boolean; message: string }>(
      `/folders/${id}`,
      { method: "DELETE" }
    );
  },

  // Add study set to folder
  addStudySet: async (folderId: string, studySetId: string) => {
    return apiCall<{ success: boolean; message: string; data: any }>(
      `/folders/${folderId}/study-sets`,
      {
        method: "POST",
        body: JSON.stringify({ studySetId }),
      }
    );
  },
};
