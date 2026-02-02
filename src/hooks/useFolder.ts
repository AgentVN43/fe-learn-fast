import { useQuery } from "@tanstack/react-query";
import { folderService } from "../services/folderService";

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
