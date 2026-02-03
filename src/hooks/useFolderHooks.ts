import { useQuery } from "@tanstack/react-query";
import { folderService } from "../services/folderService";
import { useAuth } from "./useAuth";

// Hook: Get single folder by ID
export const useFolder = (folderId?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["folder", folderId],
    queryFn: async () => {
      if (!folderId) {
        return null;
      }

      try {
        const response = await folderService.getById(folderId);
        console.log("📁 Folder response:", response);
        console.log("📁 Folder data:", response.data);
        return response.data || null;
      } catch (error) {
        console.error("❌ Failed to fetch folder:", error);
        throw error;
      }
    },
    enabled: !!folderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    folder: data || null,
    isLoading,
    error: error?.message,
    refetch,
  };
};

// Hook: Get all folders of current user
export const useFolders = () => {
  const { user } = useAuth();

  const { data: folders, isLoading, error, refetch } = useQuery({
    queryKey: ["folders", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      try {
        const response = await folderService.getUserFolders(user.id);
        console.log("📁 Folders response:", response);
        console.log("📁 Folders data:", response.data);
        return response.data || [];
      } catch (error) {
        console.error("❌ Failed to fetch folders:", error);
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    folders: folders || [],
    isLoading,
    error: error?.message,
    refetch,
  };
};
