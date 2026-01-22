import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studySetService } from "../../services/studySetService";
import { useState } from "react";
import type { StudySet, StudySetFormData } from "../../types";
import { HiTrash, HiPencil, HiEye, HiX } from "react-icons/hi";

export default function AdminStudySetsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StudySetFormData>({
    title: "",
    description: "",
    isPublic: false,
    tags: [],
  });
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminStudySets", page, limit],
    queryFn: async () => {
      return await studySetService.getLatest(page, limit);
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: StudySetFormData) => {
      if (editingId) {
        return studySetService.update(editingId, data);
      }
      return studySetService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminStudySets"] });
      handleFormClose();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => studySetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminStudySets"] });
    },
  });

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      isPublic: false,
      tags: [],
    });
  };

  const handleEdit = (studySet: StudySet) => {
    setEditingId(studySet.id || studySet._id || null);
    setFormData({
      title: studySet.title,
      description: studySet.description,
      isPublic: studySet.isPublic,
      tags: studySet.tags || [],
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading)
    return (
      <div className="p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  if (error)
    return (
      <div className="p-4 text-red-500">Lỗi: {(error as Error).message}</div>
    );

  const studySets = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản Lý Bộ Học Tập</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
        >
          + Tạo Mới
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Tiêu Đề</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Tác Giả</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Thẻ</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Lần Học</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Công Khai</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {studySets.map((studySet: StudySet) => (
              <tr key={studySet.id || studySet._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">
                  <div className="font-medium text-gray-900">
                    {studySet.title}
                  </div>
                  <div className="text-gray-500 text-xs line-clamp-1">
                    {studySet.description}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {studySet.user?.name || "Ẩn danh"}
                </td>
                <td className="px-6 py-4 text-sm">
                  {studySet.flashcardCount || 0}
                </td>
                <td className="px-6 py-4 text-sm">
                  {studySet.studyCount || 0}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      studySet.isPublic
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {studySet.isPublic ? "Có" : "Không"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button
                    onClick={() =>
                      navigate(`/admin/study-sets/${studySet.id || studySet._id}`)
                    }
                    title="Xem chi tiết"
                    className="text-blue-500 hover:text-blue-700 transition"
                  >
                    <HiEye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(studySet)}
                    title="Chỉnh sửa"
                    className="text-yellow-500 hover:text-yellow-700 transition"
                  >
                    <HiPencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Bạn có chắc muốn xóa bộ học tập này?"
                        )
                      ) {
                        deleteMutation.mutate(studySet.id || studySet._id || "");
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="mt-6 flex justify-center gap-2">
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

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingId ? "Chỉnh Sửa Bộ Học Tập" : "Tạo Bộ Học Tập Mới"}
              </h2>
              <button
                onClick={handleFormClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu Đề
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô Tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (cách nhau bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter((t) => t),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: English, Vocabulary, Beginner"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label
                  htmlFor="isPublic"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Công Khai
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleFormClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
                >
                  {saveMutation.isPending ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
