import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { HiArrowLeft, HiTrash, HiPencil, HiX, HiPlus } from "react-icons/hi";
import { authService } from "../../services/authService";
import { ImportFlashcardsModal } from "../../components/ImportFlashcardsModal";

interface Flashcard {
  id: string;
  _id?: string;
  term: string;
  definition: string;
  studySetId: string;
}

interface StudySet {
  id: string;
  _id?: string;
  title: string;
  description: string;
  isPublic: boolean;
  tags: string[];
  flashcardCount: number;
  flashcards: Flashcard[];
}

export default function AdminStudySetDetailPage() {
  console.log("AdminStudySetDetailPage function called");
  const { studySetId } = useParams<{ studySetId: string }>();
  console.log("studySetId:", studySetId);
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardFormData, setCardFormData] = useState({
    term: "",
    definition: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    image: "",
    explanation: {
      grammar: "",
      context: "",
      example_expand: "",
      analysis: [] as Array<{ key: string; note: string }>,
    },
  });
  const [analysisInput, setAnalysisInput] = useState({ key: "", note: "" });

  // Log params
  useEffect(() => {
    console.log("=== AdminStudySetDetailPage mounted ===", { studySetId });
    return () => console.log("=== AdminStudySetDetailPage unmounted ===");
  }, []);

  // Fetch study set with flashcards (endpoint returns study set with flashcards array)
  const { data: studySetData, isLoading, error, refetch } = useQuery({
    queryKey: ["adminStudySet", studySetId],
    queryFn: async () => {
      console.log("Fetching study set with flashcards:", studySetId);
      const token = authService.getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || `http://localhost:5000/api`}/study-sets/${studySetId}`,
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
    enabled: !!studySetId,
  });

  // Refetch data when studySetId changes
  useEffect(() => {
    if (studySetId) {
      console.log("StudySetId changed, refetching data:", studySetId);
      refetch();
    }
  }, [studySetId, refetch]);

  // Create/Update flashcard mutation
  const saveCardMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = authService.getToken();
      const url = editingCardId
        ? `${import.meta.env.VITE_API_BASE_URL || `http://localhost:5000/api`}/flashcards/${editingCardId}`
        : `${import.meta.env.VITE_API_BASE_URL || `http://localhost:5000/api`}/flashcards`;

      console.log("Saving flashcard:", { url, data, studySetId, token: !!token });

      const response = await fetch(url, {
        method: editingCardId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          ...data,
          studySetId,
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(errorData.message || `Failed to ${editingCardId ? `update` : `create`} flashcard`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log("Flashcard saved successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["adminStudySetFlashcards"] });
      handleCardFormClose();
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      alert(`Error: ${(error as Error).message}`);
    },
  });

  // Delete flashcard mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = authService.getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || `http://localhost:5000/api`}/flashcards/${id}`,
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
      queryClient.invalidateQueries({ queryKey: ["adminStudySetFlashcards"] });
    },
  });

  const handleCardFormClose = () => {
    setIsFormOpen(false);
    setEditingCardId(null);
    setCardFormData({
      term: "",
      definition: "",
      difficulty: "medium",
      image: "",
      explanation: {
        grammar: "",
        context: "",
        example_expand: "",
        analysis: [],
      },
    });
    setAnalysisInput({ key: "", note: "" });
  };

  const handleEditCard = (flashcard: Flashcard) => {
    setEditingCardId(flashcard.id || flashcard._id || null);
    setCardFormData({
      term: flashcard.term,
      definition: flashcard.definition,
      difficulty: (flashcard as any).difficulty || "medium",
      image: (flashcard as any).image || "",
      explanation: (flashcard as any).explanation || {
        grammar: "",
        context: "",
        example_expand: "",
        analysis: [],
      },
    });
    setIsFormOpen(true);
  };

  const handleAddAnalysis = () => {
    if (analysisInput.key.trim() && analysisInput.note.trim()) {
      setCardFormData({
        ...cardFormData,
        explanation: {
          ...cardFormData.explanation,
          analysis: [
            ...cardFormData.explanation.analysis,
            { key: analysisInput.key, note: analysisInput.note },
          ],
        },
      });
      setAnalysisInput({ key: "", note: "" });
    }
  };

  const handleRemoveAnalysis = (index: number) => {
    setCardFormData({
      ...cardFormData,
      explanation: {
        ...cardFormData.explanation,
        analysis: cardFormData.explanation.analysis.filter(
          (_, i) => i !== index
        ),
      },
    });
  };

  const handleSubmitCard = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!cardFormData.term.trim()) {
      alert("Vui lòng nhập thuật ngữ");
      return;
    }
    if (!cardFormData.definition.trim()) {
      alert("Vui lòng nhập định nghĩa");
      return;
    }

    const submitData = {
      term: cardFormData.term,
      definition: cardFormData.definition,
      difficulty: cardFormData.difficulty,
      image: cardFormData.image || undefined,
      explanation: {
        grammar: cardFormData.explanation.grammar || undefined,
        context: cardFormData.explanation.context || undefined,
        example_expand: cardFormData.explanation.example_expand || undefined,
        analysis:
          cardFormData.explanation.analysis.length > 0
            ? cardFormData.explanation.analysis
            : undefined,
      },
    };

    console.log("Submitting form with data:", submitData);
    console.log("Full cardFormData:", cardFormData);
    saveCardMutation.mutate(submitData as any);
  };



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
          <p className="text-red-600 font-medium mb-4">
            {(error as Error).message}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            Quay Lại
          </button>
        </div>
      </div>
    );
  }

  console.log("Response data:", studySetData);

  const studySet = studySetData?.data as StudySet;
  const flashcards = (studySet?.flashcards || []) as Flashcard[];
  
  console.log("Extracted flashcards:", flashcards);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span>Quay Lại</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{studySet.title}</h1>
            <p className="text-gray-600 text-sm mt-1">{studySet.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Study Set Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Số Thẻ</p>
              <p className="text-2xl font-bold text-blue-600">{flashcards.length}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Công Khai</p>
              <p className="text-lg font-semibold">
                {studySet.isPublic ? "✓ Có" : "✗ Không"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600 text-sm">Tags</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {studySet.tags?.length > 0 ? (
                  studySet.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Không có tag</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Flashcards Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold">Thẻ Học ({flashcards.length})</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
              >
                <HiPlus className="w-5 h-5" />
                <span>Thêm Thẻ</span>
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="text-blue-600 hover:text-blue-700 underline font-medium transition"
              >
                Import
              </button>
            </div>
          </div>

          {flashcards.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Chưa có thẻ học nào. Hãy thêm thẻ mới.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Thuật Ngữ</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Định Nghĩa</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {Array.isArray(flashcards) && flashcards.map((card) => (
                    <tr key={card.id || card._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {card.term}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 line-clamp-2">
                        {card.definition}
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => handleEditCard(card)}
                          title="Chỉnh sửa"
                          className="text-yellow-500 hover:text-yellow-700 transition"
                        >
                          <HiPencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm("Bạn có chắc muốn xóa thẻ này?")
                            ) {
                              deleteCardMutation.mutate(card.id || card._id || "");
                            }
                          }}
                          disabled={deleteCardMutation.isPending}
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
          )}
        </div>
      </div>

      {/* Card Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingCardId ? "Chỉnh Sửa Thẻ" : "Tạo Thẻ Mới"}
              </h2>
              <button
                onClick={handleCardFormClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitCard} className="space-y-4 max-h-96 overflow-y-auto">
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
                    setCardFormData({ ...cardFormData, definition: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mức Độ
                </label>
                <select
                  value={cardFormData.difficulty}
                  onChange={(e) =>
                    setCardFormData({
                      ...cardFormData,
                      difficulty: e.target.value as "easy" | "medium" | "hard",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung Bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ảnh (URL)
                </label>
                <input
                  type="url"
                  value={cardFormData.image}
                  onChange={(e) =>
                    setCardFormData({ ...cardFormData, image: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Explanation */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Giải Thích
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ngữ Pháp
                    </label>
                    <textarea
                      value={cardFormData.explanation.grammar}
                      onChange={(e) =>
                        setCardFormData({
                          ...cardFormData,
                          explanation: {
                            ...cardFormData.explanation,
                            grammar: e.target.value,
                          },
                        })
                      }
                      placeholder="Giải thích về ngữ pháp..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ngữ Cảnh
                    </label>
                    <textarea
                      value={cardFormData.explanation.context}
                      onChange={(e) =>
                        setCardFormData({
                          ...cardFormData,
                          explanation: {
                            ...cardFormData.explanation,
                            context: e.target.value,
                          },
                        })
                      }
                      placeholder="Ngữ cảnh sử dụng..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ví Dụ Mở Rộng
                    </label>
                    <input
                      type="text"
                      value={cardFormData.explanation.example_expand}
                      onChange={(e) =>
                        setCardFormData({
                          ...cardFormData,
                          explanation: {
                            ...cardFormData.explanation,
                            example_expand: e.target.value,
                          },
                        })
                      }
                      placeholder="Ví dụ mở rộng..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    />
                  </div>

                  {/* Analysis */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Phân Tích
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={analysisInput.key}
                        onChange={(e) =>
                          setAnalysisInput({
                            ...analysisInput,
                            key: e.target.value,
                          })
                        }
                        placeholder="Từ khoá"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                      <input
                        type="text"
                        value={analysisInput.note}
                        onChange={(e) =>
                          setAnalysisInput({
                            ...analysisInput,
                            note: e.target.value,
                          })
                        }
                        placeholder="Ghi chú"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddAnalysis}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                      >
                        Thêm
                      </button>
                    </div>
                    {cardFormData.explanation.analysis.length > 0 && (
                      <div className="space-y-1">
                        {cardFormData.explanation.analysis.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-1 bg-gray-100 rounded text-xs"
                            >
                              <span>
                                <strong>{item.key}</strong>: {item.note}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAnalysis(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCardFormClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saveCardMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
                >
                  {saveCardMutation.isPending ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Flashcards Modal */}
      {studySetId && (
        <ImportFlashcardsModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          studySetId={studySetId}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
