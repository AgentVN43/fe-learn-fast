import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useUserStudySets } from "../hooks/useUserStudySets";
import { folderService } from "../services/folderService";
import {  HiCheck } from "react-icons/hi";
import { HiXMark } from "react-icons/hi2";

interface AddStudySetToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  onSuccess?: () => void;
}

export const AddStudySetToFolderModal = ({
  isOpen,
  onClose,
  folderId,
  onSuccess,
}: AddStudySetToFolderModalProps) => {
  const { user } = useAuth();
  const { data: userStudySets = [], isLoading } = useUserStudySets(user?.id);
  const [selectedStudySetId, setSelectedStudySetId] = useState<string | null>(
    null
  );
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddStudySet = async () => {
    if (!selectedStudySetId) {
      setError("Vui lòng chọn một bộ học");
      return;
    }

    setIsAdding(true);
    setError(null);
    try {
      await folderService.addStudySet(folderId, selectedStudySetId);
      console.log("✅ Study set added to folder successfully");
      setSelectedStudySetId(null);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi thêm bộ học vào thư mục"
      );
      console.error("❌ Failed to add study set to folder:", err);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Thêm Bộ Học</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Đang tải danh sách bộ học...</p>
            </div>
          ) : userStudySets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Bạn chưa có bộ học nào</p>
              <p className="text-sm text-gray-500 mt-2">
                Hãy tạo bộ học đầu tiên để thêm vào thư mục
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {userStudySets.map((studySet) => (
                <div
                  key={studySet.id || studySet._id}
                  onClick={() =>
                    setSelectedStudySetId(studySet.id || studySet._id!)
                  }
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedStudySetId === (studySet.id || studySet._id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {studySet.title}
                      </h3>
                      {studySet.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {studySet.description}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>📚 {studySet.cardCount || 0} thẻ</span>
                        <span>📊 {studySet.studyCount || 0} lần học</span>
                      </div>
                    </div>
                    {selectedStudySetId === (studySet.id || studySet._id) && (
                      <HiCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            disabled={isAdding}
          >
            Hủy
          </button>
          <button
            onClick={handleAddStudySet}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:bg-gray-400"
            disabled={isAdding || !selectedStudySetId}
          >
            {isAdding ? "Đang thêm..." : "Thêm"}
          </button>
        </div>
      </div>
    </div>
  );
};
