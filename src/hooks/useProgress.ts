import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { progressService } from "../services/progressService";

export const useInitProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studySetId: string) => progressService.initProgress(studySetId),
    onSuccess: (_, studySetId) => {
      // Invalidate progress queries after init
      queryClient.invalidateQueries({ queryKey: ["progress", studySetId] });
      queryClient.invalidateQueries({ queryKey: ["progressStats", studySetId] });
    },
  });
};

export const useProgress = (studySetId: string | undefined) => {
  return useQuery({
    queryKey: ["progress", studySetId],
    queryFn: () => {
      if (!studySetId) throw new Error("Study set ID không hợp lệ");
      return progressService.getProgress(studySetId);
    },
    enabled: !!studySetId,
  });
};

export const useProgressStats = (studySetId: string | undefined) => {
  return useQuery({
    queryKey: ["progressStats", studySetId],
    queryFn: () => {
      if (!studySetId) throw new Error("Study set ID không hợp lệ");
      return progressService.getStats(studySetId);
    },
    enabled: !!studySetId,
  });
};

export const useNeedReview = (studySetId: string | undefined) => {
  return useQuery({
    queryKey: ["progressNeedReview", studySetId],
    queryFn: () => {
      if (!studySetId) throw new Error("Study set ID không hợp lệ");
      return progressService.getNeedReview(studySetId);
    },
    enabled: !!studySetId,
  });
};

export const useMastered = (studySetId: string | undefined) => {
  return useQuery({
    queryKey: ["progressMastered", studySetId],
    queryFn: () => {
      if (!studySetId) throw new Error("Study set ID không hợp lệ");
      return progressService.getMastered(studySetId);
    },
    enabled: !!studySetId,
  });
};

export const useReviewFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      flashcardId,
      studySetId,
      isCorrect,
      difficulty,
    }: {
      flashcardId: string;
      studySetId: string;
      isCorrect: boolean;
      difficulty: "easy" | "medium" | "hard";
    }) =>
      progressService.submitReview(flashcardId, studySetId, isCorrect, difficulty),
    onSuccess: (_, { studySetId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["progress", studySetId] });
      queryClient.invalidateQueries({ queryKey: ["progressStats", studySetId] });
    },
  });
};

export const useUpdateDifficulty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      flashcardId,
      studySetId,
      difficulty,
    }: {
      flashcardId: string;
      studySetId: string;
      difficulty: "easy" | "medium" | "hard";
    }) => progressService.updateDifficulty(flashcardId, studySetId, difficulty),
    onSuccess: (_, { studySetId }) => {
      queryClient.invalidateQueries({ queryKey: ["progress", studySetId] });
      queryClient.invalidateQueries({ queryKey: ["progressStats", studySetId] });
    },
  });
};

export const useMasterFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      flashcardId,
      studySetId,
    }: {
      flashcardId: string;
      studySetId: string;
    }) => progressService.markAsMastered(flashcardId, studySetId),
    onSuccess: (_, { studySetId }) => {
      queryClient.invalidateQueries({ queryKey: ["progress", studySetId] });
      queryClient.invalidateQueries({ queryKey: ["progressStats", studySetId] });
    },
  });
};

export const useResetProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studySetId: string) => progressService.resetProgress(studySetId),
    onSuccess: (_, studySetId) => {
      queryClient.invalidateQueries({ queryKey: ["progress", studySetId] });
      queryClient.invalidateQueries({ queryKey: ["progressStats", studySetId] });
    },
  });
};
