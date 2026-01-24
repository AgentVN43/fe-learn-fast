import { useQuery } from "@tanstack/react-query";
import { studySetService } from "../services/studySetService";
import type { StudySet } from "../types";

export const useUserStudySets = (userId?: string) => {
  return useQuery<StudySet[]>({
    queryKey: ["userStudySets", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not available");
      const studySets = await studySetService.getUserStudySets(userId);
      // Map flashcardCount to cardCount for component compatibility
      return studySets.map((set) => ({
        ...set,
        cardCount: set.cardCount || set.flashcardCount,
      }));
    },
    enabled: !!userId,
  });
};
