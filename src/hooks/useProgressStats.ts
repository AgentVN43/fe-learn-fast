import { useQuery } from "@tanstack/react-query";
import {
  progressService,
  type ProgressData,
} from "../services/progressService";

export const useProgressStats = () => {
  return useQuery<ProgressData[]>({
    queryKey: ["userProgress"],
    queryFn: async () => {
      const response = await progressService.getUserProgress();
      return Array.isArray(response.data) ? response.data : [];
    },
  });
};
