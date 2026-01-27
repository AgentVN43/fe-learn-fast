import { useQuery } from "@tanstack/react-query";
import { progressService, type ProgressData } from "../services/progressService";

/**
 * Hook để lấy danh sách thẻ cần ôn tập ngay lập tức
 * 
 * Thẻ được chọn:
 * - Đã quá hạn ôn lại (nextReviewAt <= now)
 * - Chưa được thành thạo (isMastered = false)
 * - Được shuffle và limit số lượng (default 20)
 * 
 * Được gọi khi user click "Ôn tập" để learning ngay
 */
export const useQuickReviewPool = (enabled: boolean = true) => {
  return useQuery<ProgressData[]>({
    queryKey: ["quickReviewPool"],
    queryFn: async () => {
      try {
        const response = await progressService.getQuickReviewPool();
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error("❌ Error fetching quick review pool:", error);
        return [];
      }
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
