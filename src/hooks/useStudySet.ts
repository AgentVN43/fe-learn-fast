import { useQuery } from "@tanstack/react-query";
import { studySetService } from "../services/studySetService";

export const useStudySet = (id: string | undefined) => {
  return useQuery({
    queryKey: ["studySet", id],
    queryFn: () => {
      if (!id) throw new Error("ID không hợp lệ");
      return studySetService.getById(id);
    },
    enabled: !!id,
  });
};

export const useLearnCards = (id: string | undefined) => {
  return useQuery({
    queryKey: ["studySetLearn", id],
    queryFn: () => {
      if (!id) throw new Error("ID không hợp lệ");
      return studySetService.getLearnCards(id);
    },
    enabled: !!id,
  });
};

export const useTestCards = (id: string | undefined, enabled = false) => {
  return useQuery({
    queryKey: ["studySetTest", id],
    queryFn: () => {
      if (!id) throw new Error("ID không hợp lệ");
      return studySetService.getTestCards(id);
    },
    enabled: !!id && enabled,
  });
};
