import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { progressService } from "../services/progressService";

/**
 * Hook để fetch reflex/flash cards từ server
 * Dữ liệu được tối ưu cho chế độ phản xạ (reflex learning)
 */
export const useReflexCards = (studySetId: string | undefined) => {
  return useQuery({
    queryKey: ["reflexCards", studySetId],
    queryFn: async () => {
      if (!studySetId) throw new Error("Study set ID không hợp lệ");
      
      // Gọi API để lấy cards cho reflex mode
      // Có thể là endpoint riêng hoặc dùng getProgress với filter
      const response = await fetch(
        `/api/study-sets/${studySetId}/reflex-cards`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reflex cards: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!studySetId,
  });
};

/**
 * Mutation để ghi lại kết quả phản xạ (reflex grade)
 */
export const useReflexGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      flashcardId,
      studySetId,
      difficulty,
      reactionTime,
    }: {
      flashcardId: string;
      studySetId: string;
      difficulty: "easy" | "hard";
      reactionTime: number; // milliseconds
    }) => {
      const response = await fetch(
        `/api/progress/${flashcardId}/study-set/${studySetId}/reflex-grade`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            difficulty,
            reactionTime,
            isCorrect: difficulty === "easy",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to grade reflex: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (_, { studySetId }) => {
      console.log("✅ Reflex grade recorded");
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["reflexCards", studySetId] });
      queryClient.invalidateQueries({ queryKey: ["progress", studySetId] });
      queryClient.invalidateQueries({
        queryKey: ["progressStats", studySetId],
      });
    },
    onError: (error) => {
      console.error("❌ Failed to grade reflex:", error);
    },
  });
};
