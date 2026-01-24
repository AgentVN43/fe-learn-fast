import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { studySetService } from "../services/studySetService";
import type { StudySet } from "../types";
import { HiTrash, HiPencil, HiHeart } from "react-icons/hi";

interface StudySetListProps {
  variant?: "popular" | "latest" | "user";
  userId?: string;
  onEditClick?: (studySet: StudySet) => void;
  showActions?: boolean;
}

export const StudySetList = ({
  variant = "latest",
  userId,
  onEditClick,
  showActions = false,
}: StudySetListProps) => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const limit = 10;

  // Fetch study sets
  const { data, isLoading, error } = useQuery({
    queryKey: ["studySets", variant, page, userId],
    queryFn: async () => {
      let response;
      if (variant === "popular") {
        response = await studySetService.getPopular(page, limit);
      } else if (variant === "user" && userId) {
        response = await studySetService.getUserStudySets(userId);
      } else {
        response = await studySetService.getLatest(page, limit);
      }
      return response;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => studySetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studySets"] });
    },
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: (id: string) => studySetService.like(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studySets"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Lỗi: {(error as Error).message}
      </div>
    );
  }

  const studySets = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  if (studySets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không có bộ học tập nào</p>
      </div>
    );
  }

  return (
    <div>
      {/* Study Sets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {studySets.map((studySet: StudySet) => (
          <div
            key={studySet.id || studySet._id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg flex-1 line-clamp-2">
                {studySet.title}
              </h3>
              {showActions && (
                <div className="flex gap-1">
                  <button
                    onClick={() => onEditClick && onEditClick(studySet)}
                    className="p-1 text-blue-500 hover:bg-blue-100 rounded transition"
                  >
                    <HiPencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      deleteMutation.mutate(studySet.id || studySet._id || "")
                    }
                    disabled={deleteMutation.isPending}
                    className="p-1 text-red-500 hover:bg-red-100 rounded transition disabled:opacity-50"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {studySet.description || "Không có mô tả"}
            </p>

            {/* Tags */}
            {studySet.tags && studySet.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {studySet.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {studySet.tags.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{studySet.tags.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <span>{studySet.flashcardCount} thẻ</span>
              <span>{studySet.studyCount} lần học</span>
              <span>id: {studySet.id}</span>
            </div>

            {/* Author */}
            {studySet.user && (
              <p className="text-xs text-gray-500 mb-3">
                Bởi: {studySet.user.name}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!user) {
                    navigate("/login");
                  } else {
                    navigate(
                      `/study-sets/${studySet.id || studySet._id || ""}`,
                    );
                  }
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition text-sm"
              >
                Xem Chi Tiết
              </button>
              <button
                onClick={() =>
                  likeMutation.mutate(studySet.id || studySet._id || "")
                }
                disabled={likeMutation.isPending}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded transition text-sm flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <HiHeart className="w-4 h-4" />
                {studySet.likes}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Tiếp
          </button>
        </div>
      )}
    </div>
  );
};
