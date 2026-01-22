import { useState } from "react";
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
        <Sheet.Header className="bg-gray-100" />
        <Sheet.Content className="px-4 pb-8">
          <div className="py-4">
            <h2 className="text-2xl font-bold mb-6">
              {isEditing ? "Chỉnh Sửa Bộ Học Tập" : "Tạo Bộ Học Tập Mới"}
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {(error as Error).message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Tiêu Đề *
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/200
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/1000
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={isLoading || !tagInput.trim()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition"
                  >
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Public Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  disabled={isLoading}
                  className="w-4 h-4"
                />
                <label htmlFor="isPublic" className="text-gray-700 font-medium">
                  Công Khai
                </label>
                <p className="text-xs text-gray-500">
                  Cho phép người khác xem bộ học tập này
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition"
                >
                  {isLoading
                    ? "Đang lưu..."
                    : isEditing
                      ? "Cập Nhật"
                      : "Tạo Mới"}
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
