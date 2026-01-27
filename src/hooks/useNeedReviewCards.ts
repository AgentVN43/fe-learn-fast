import { useMemo } from "react";
import type { Flashcard } from "../types";
import type { ProgressData } from "../services/progressService";

/**
 * Hook để lấy danh sách thẻ cần học
 * 
 * Lọc dựa vào:
 * - Thẻ chưa được học (không có progress)
 * - Thẻ chưa được thành thạo
 * - Thẻ đã quá hạn ôn lại (nextReviewAt đã qua)
 * 
 * Chỉ shuffle nhóm này, không shuffle toàn bộ set
 */
export const useNeedReviewCards = (
  allCards: Flashcard[] | undefined,
  progressList: ProgressData[] | undefined
) => {
  return useMemo(() => {
    if (!allCards || allCards.length === 0) {
      return [];
    }

    // Tạo map {flashcardId -> progress} để tìm kiếm nhanh
    const progressMap = new Map<string, ProgressData>();
    if (progressList && Array.isArray(progressList)) {
      progressList.forEach((p) => {
        // Lấy ID từ flashcardId object (có thể là {_id, id} hoặc string hoặc null)
        let flashcardId: string | undefined;

        if (!p.flashcardId) {
          console.warn("⚠️ Progress record có flashcardId null, bỏ qua:", p);
          return; // Skip record này
        }

        if (typeof p.flashcardId === "string") {
          flashcardId = p.flashcardId;
        } else if (typeof p.flashcardId === "object") {
          flashcardId = (p.flashcardId as any)._id || (p.flashcardId as any).id;
        }

        if (flashcardId) {
          progressMap.set(flashcardId, p);
        }
      });
    }

    const now = new Date();

    // Lọc thẻ cần học
    const needReviewCards = allCards.filter((card) => {
      const cardId = card.id || card._id || "";
      const progress = progressMap.get(cardId);

      // Nếu không có progress → chưa học, cần ưu tiên
      if (!progress) {
        return true;
      }

      // Nếu đã thành thạo → bỏ qua
      if (progress.isMastered) {
        return false;
      }

      // Nếu chưa có lịch ôn → cần ôn
      if (!progress.nextReviewAt) {
        return true;
      }

      // Nếu đã đến hạn ôn → cần ôn
      const nextReviewDate = new Date(progress.nextReviewAt);
      return nextReviewDate <= now;
    });

    return needReviewCards;
  }, [allCards, progressList]);
};

/**
 * Xáo trộn mảng theo Fisher-Yates algorithm
 */
export const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
