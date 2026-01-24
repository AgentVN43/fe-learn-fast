import { useQuery } from "@tanstack/react-query";
import { progressService } from "../services/progressService";

interface ProgressStat {
  status: "mastered" | "learning" | "reviewing";
  [key: string]: any;
}

export const useProgressStats = () => {
  return useQuery<ProgressStat[]>({
    queryKey: ["userProgress"],
    queryFn: async () => {
      const response = await progressService.getUserProgress();
      return Array.isArray(response.data) ? response.data : [];
    },
  });
};
