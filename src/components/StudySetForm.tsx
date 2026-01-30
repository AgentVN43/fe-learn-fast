import { useState, useEffect } from "react";
import { Sheet } from "react-modal-sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studySetService } from "../services/studySetService";
import type { StudySetFormData } from "../types";

interface StudySetFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: StudySetFormData & { id?: string };
}

export const StudySetForm = ({
  isOpen,
  onClose,
  initialData,
}: StudySetFormProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<StudySetFormData>(
    initialData || {
      title: "",
      description: "",
      isPublic: true,
      tags: [],
      flashcards: [],
    }
  );
  const [tagInput, setTagInput] = useState("");

  const isEditing = !!initialData?.id;

  // Reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          title: "",
          description: "",
          isPublic: true,
          tags: [],
          flashcards: [],
        });
      }
      setTagInput("");
    }
  }, [isOpen, initialData]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: StudySetFormData) => studySetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studySets"] });
      handleClose();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: StudySetFormData) =>
      studySetService.update(initialData?.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studySets"] });
      handleClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Vui lòng nhập tiêu đề");
      return;
    }

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      isPublic: true,
      tags: [],
      flashcards: [],
    });
    setTagInput("");
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <Sheet isOpen={isOpen} onClose={handleClose}>
      <Sheet.Container>
        <Sheet.Header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>
          <div className="px-6 pb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? "Chỉnh Sửa Bộ Học Tập" : "Tạo Bộ Học Tập Mới"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEditing ? "Cập nhật thông tin bộ học tập của bạn" : "Tạo bộ học tập mới để bắt đầu học"}
            </p>
          </div>
        </Sheet.Header>
        <Sheet.Content className="px-6 pb-8 bg-white">
          <div className="py-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg mb-6 shadow-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{(error as Error).message}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2 text-sm">
                  Tiêu Đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ví dụ: Từ Vựng Tiếng Anh Cơ Bản"
                  disabled={isLoading}
                  maxLength={200}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-800 placeholder-gray-400"
                />
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-xs text-gray-400">
                    Tên bộ học tập của bạn
                  </p>
                  <p className={`text-xs font-medium ${
                    formData.title.length > 180 ? 'text-red-500' : 
                    formData.title.length > 150 ? 'text-yellow-500' : 
                    'text-gray-400'
                  }`}>
                    {formData.title.length}/200
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2 text-sm">
                  Mô Tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Mô tả bộ học tập của bạn..."
                  disabled={isLoading}
                  maxLength={1000}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-800 placeholder-gray-400 resize-none"
                />
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-xs text-gray-400">
                    Mô tả chi tiết về nội dung bộ học tập
                  </p>
                  <p className={`text-xs font-medium ${
                    formData.description.length > 900 ? 'text-red-500' : 
                    formData.description.length > 750 ? 'text-yellow-500' : 
                    'text-gray-400'
                  }`}>
                    {formData.description.length}/1000
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2 text-sm">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Nhập tag và nhấn Enter"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-800 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={isLoading || !tagInput.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    Thêm
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          disabled={isLoading}
                          className="text-white hover:text-red-200 disabled:opacity-50 transition-colors font-bold text-base leading-none"
                          title="Xóa tag"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Public Toggle */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-200 transition-colors">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  disabled={isLoading}
                  className="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex-1">
                  <label htmlFor="isPublic" className="text-gray-800 font-semibold text-sm cursor-pointer block mb-1">
                    Công Khai
                  </label>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Cho phép người khác xem và sử dụng bộ học tập này
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-semibold transition-all shadow-sm hover:shadow"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Đang lưu...</span>
                    </>
                  ) : isEditing ? (
                    "Cập Nhật"
                  ) : (
                    "Tạo Mới"
                  )}
                </button>
              </div>
            </form>
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop onClick={handleClose} />
    </Sheet>
  );
};
