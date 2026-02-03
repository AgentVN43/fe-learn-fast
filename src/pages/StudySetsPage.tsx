import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studySetService } from "../services/studySetService";
import { StudySetForm } from "../components/StudySetForm";
import { authService } from "../services/authService";
import type { StudySet, StudySetFormData } from "../types";
import { HiTrash, HiPencil, HiPlus, HiX, HiClipboardList } from "react-icons/hi";

interface Flashcard {
  id?: string;
  _id?: string;
  term: string;
  definition: string;
  studySetId?: string;
}

export default function StudySetsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<
    (StudySetFormData & { id?: string }) | undefined
  >();
  const [page, setPage] = useState(1);
  const limit = 20;
  const queryClient = useQueryClient();

  // Flashcard management state
  const [selectedStudySetId, setSelectedStudySetId] = useState<string | null>(null);
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardFormData, setCardFormData] = useState({
    term: "",
    definition: "",
  });

  // Fetch study sets
  const { data, isLoading, error } = useQuery({
    queryKey: ["studySets", "all", page, limit],
    queryFn: async () => {
      return await studySetService.getLatest(page, limit);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => studySetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studySets"] });
    },
  });

  const handleAdd = () => {
    setEditingSet(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (studySet: StudySet) => {
    setEditingSet({
      title: studySet.title,
      description: studySet.description,
      isPublic: studySet.isPublic,
      tags: studySet.tags || [],
      id: studySet.id || studySet._id,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bộ học tập này?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSet(undefined);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["studySets"] });
    handleFormClose();
  };

  // Fetch flashcards for selected study set
  const { data: studySetDetail, refetch: refetchStudySet } = useQuery({
    queryKey: ["studySetDetail", selectedStudySetId],
    queryFn: async () => {
      if (!selectedStudySetId) return null;
      const token = authService.getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/study-sets/${selectedStudySetId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch study set");
      return response.json();
    },
    enabled: !!selectedStudySetId,
  });

  const flashcards = (studySetDetail?.data?.flashcards || []) as Flashcard[];

  // Create/Update flashcard mutation
  const saveCardMutation = useMutation({
    mutationFn: async (data: { term: string; definition: string }) => {
      const token = authService.getToken();
      const url = editingCardId
        ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/flashcards/${editingCardId}`
        : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/flashcards`;

      const response = await fetch(url, {
        method: editingCardId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          ...data,
          studySetId: selectedStudySetId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${editingCardId ? "update" : "create"} flashcard`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studySetDetail"] });
      refetchStudySet();
      handleCardFormClose();
    },
    onError: (error) => {
      alert(`Error: ${(error as Error).message}`);
    },
  });

  // Delete flashcard mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = authService.getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/flashcards/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studySetDetail"] });
      refetchStudySet();
    },
  });

  const handleManageCards = (studySet: StudySet) => {
    setSelectedStudySetId(studySet.id || studySet._id || null);
  };

  const handleCardFormClose = () => {
    setIsCardFormOpen(false);
    setEditingCardId(null);
    setCardFormData({
      term: "",
      definition: "",
    });
  };

  const handleEditCard = (flashcard: Flashcard) => {
    setEditingCardId(flashcard.id || flashcard._id || null);
    setCardFormData({
      term: flashcard.term,
      definition: flashcard.definition,
    });
    setIsCardFormOpen(true);
  };

  const handleAddCard = () => {
    setEditingCardId(null);
    setCardFormData({
      term: "",
      definition: "",
    });
    setIsCardFormOpen(true);
  };

  const handleSubmitCard = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardFormData.term.trim()) {
      alert("Vui lòng nhập thuật ngữ");
      return;
    }
    if (!cardFormData.definition.trim()) {
      alert("Vui lòng nhập định nghĩa");
      return;
    }

    saveCardMutation.mutate(cardFormData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Lỗi: {(error as Error).message}
        </div>
      </div>
    );
  }

  const studySets = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Bộ Học Tập</h1>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition cursor-pointer"
          >
            <HiPlus className="w-5 h-5" />
            Thêm Mới
          </button>
        </div>

        {/* Study Sets List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {studySets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Chưa có bộ học tập nào</p>
              <button
                onClick={handleAdd}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition cursor-pointer"
              >
                Tạo Bộ Học Tập Đầu Tiên
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Tiêu Đề
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Mô Tả
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Thẻ
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Công Khai
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Hành Động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studySets.map((studySet: StudySet) => (
                      <tr
                        key={studySet.id || studySet._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {studySet.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 line-clamp-2 max-w-md">
                            {studySet.description || "Không có mô tả"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {studySet.flashcardCount || studySet.cardCount || 0}
                        </td>
                        <td className="px-6 py-4">
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
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleManageCards(studySet)}
                              className="text-green-500 hover:text-green-700 transition cursor-pointer p-2 hover:bg-green-50 rounded"
                              title="Quản lý thẻ"
                            >
                              <HiClipboardList className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(studySet)}
                              className="text-blue-500 hover:text-blue-700 transition cursor-pointer p-2 hover:bg-blue-50 rounded"
                              title="Chỉnh sửa"
                            >
                              <HiPencil className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(studySet.id || studySet._id || "")
                              }
                              disabled={deleteMutation.isPending}
                              className="text-red-500 hover:text-red-700 transition cursor-pointer p-2 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Xóa"
                            >
                              <HiTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 px-6 py-4 border-t">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">
                    Trang {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                    disabled={page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer"
                  >
                    Tiếp
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <StudySetForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        initialData={editingSet}
        onSuccess={handleFormSuccess}
      />

      {/* Flashcard Management Modal */}
      {selectedStudySetId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Quản Lý Thẻ Học
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {studySetDetail?.data?.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedStudySetId(null);
                  handleCardFormClose();
                }}
                className="text-gray-500 hover:text-gray-700 transition cursor-pointer p-2 hover:bg-gray-100 rounded"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Flashcards List */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Danh Sách Thẻ ({flashcards.length})
                  </h3>
                  <button
                    onClick={handleAddCard}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition cursor-pointer"
                  >
                    <HiPlus className="w-5 h-5" />
                    Thêm Thẻ
                  </button>
                </div>

                {flashcards.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có thẻ học nào. Hãy thêm thẻ mới.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Thuật Ngữ
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Định Nghĩa
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Hành Động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {flashcards.map((card) => (
                          <tr
                            key={card.id || card._id}
                            className="hover:bg-gray-50 transition"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {card.term}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 line-clamp-2 max-w-md">
                              {card.definition}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditCard(card)}
                                  className="text-blue-500 hover:text-blue-700 transition cursor-pointer p-2 hover:bg-blue-50 rounded"
                                  title="Chỉnh sửa"
                                >
                                  <HiPencil className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Bạn có chắc muốn xóa thẻ này?"
                                      )
                                    ) {
                                      deleteCardMutation.mutate(
                                        card.id || card._id || ""
                                      );
                                    }
                                  }}
                                  disabled={deleteCardMutation.isPending}
                                  className="text-red-500 hover:text-red-700 transition cursor-pointer p-2 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Xóa"
                                >
                                  <HiTrash className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Form Modal */}
      {isCardFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingCardId ? "Chỉnh Sửa Thẻ" : "Tạo Thẻ Mới"}
              </h2>
              <button
                onClick={handleCardFormClose}
                className="text-gray-500 hover:text-gray-700 transition cursor-pointer p-2 hover:bg-gray-100 rounded"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thuật Ngữ
                </label>
                <input
                  type="text"
                  value={cardFormData.term}
                  onChange={(e) =>
                    setCardFormData({ ...cardFormData, term: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Định Nghĩa
                </label>
                <textarea
                  value={cardFormData.definition}
                  onChange={(e) =>
                    setCardFormData({
                      ...cardFormData,
                      definition: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCardFormClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saveCardMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saveCardMutation.isPending ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

