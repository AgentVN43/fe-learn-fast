import { useQuery } from "@tanstack/react-query";
import { folderService } from "../services/folderService";
import { useAuth } from "./useAuth";

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
