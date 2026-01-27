import { useQuery } from "@tanstack/react-query";
import { progressService, type ProgressData } from "../services/progressService";

export const useQuickReviewPool = (enabled: boolean = true) => {
  return useQuery<ProgressData[]>({
    queryKey: ["quickReviewPool"],
    queryFn: async () => {
      const response = await progressService.getQuickReviewPool();
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};
