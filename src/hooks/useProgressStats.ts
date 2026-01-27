import { useQuery } from "@tanstack/react-query";
import {
  progressService,
  type ProgressData,
} from "../services/progressService";

export const useProgressStats = (userId?: string) => {
  return useQuery<ProgressData[]>({
    queryKey: ["userProgress", userId],
    queryFn: async () => {
      const response = await progressService.getUserProgress(userId);
      return Array.isArray(response.data) ? response.data : [];
    },
  });
};
