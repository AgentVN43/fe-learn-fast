import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useFolder } from "../hooks/useFolder";
import { useNavigate, useParams } from "react-router-dom";
import { HiArrowLeft, HiFolder, HiTrash, HiPencil, HiPlus } from "react-icons/hi";
import { StudySetForm } from "../components/StudySetForm";
import { AddStudySetToFolderModal } from "../components/AddStudySetToFolderModal";

export default function FolderDetailPage() {
  const navigate = useNavigate();
  const { folderId } = useParams<{ folderId: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const { folder, isLoading, error, refetch } = useFolder(folderId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddStudySetModalOpen, setIsAddStudySetModalOpen] = useState(false);

  console.log("🔍 FolderDetailPage - folderId:", folderId);
  console.log("🔍 FolderDetailPage - folder:", folder);
  console.log("🔍 FolderDetailPage - isLoading:", isLoading);
  console.log("🔍 FolderDetailPage - error:", error);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Đăng Nhập
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">Đang tải thư mục...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow p-6 max-w-md text-center">
          <p className="text-red-600 mb-4">Lỗi khi tải thư mục: {error}</p>
          <button
            onClick={() => navigate("/profile/folder")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Quay Lại
          </button>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow p-6 max-w-md text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy thư mục</p>
          <button
            onClick={() => navigate("/profile/folder")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Quay Lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/profile/folder")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span>Quay Lại</span>
          </button>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <HiFolder className="w-12 h-12 text-blue-500 flex-shrink-0" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {folder.name}
                </h1>
                {folder.description && (
                  <p className="text-gray-600 mt-2">{folder.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-4">
                  Tạo ngày{" "}
                  {new Date(folder.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddStudySetModalOpen(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                <HiPlus className="w-5 h-5" />
                <span>Thêm Bộ Học</span>
              </button>
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                <HiPencil className="w-5 h-5" />
                <span>Sửa</span>
              </button>
              <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                <HiTrash className="w-5 h-5" />
                <span>Xóa</span>
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Study Sets Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Các Bộ Học ({folder.studySetCount || 0})
          </h2>

          {folder.studySetCount === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-600 mb-4">
                Chưa có bộ học nào trong thư mục
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
                Thêm Bộ Học
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Tên Bộ Học
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Thẻ
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Ngày Tạo
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {folder.studySets?.map((set: any) => (
                    <tr
                      key={set.id || set._id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{set.title}</p>
                        <p className="text-sm text-gray-600">
                          {set.description}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {set.flashcardCount || set.cardCount || 0}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {set.createdAt
                          ? new Date(set.createdAt).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            navigate(`/profile/study-sets/${set.id || set._id}`)
                          }
                          className="text-blue-600 hover:text-blue-700 font-medium transition"
                        >
                          Xem Chi Tiết
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

      {/* Create Study Set Modal */}
      <StudySetForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

      {/* Add Study Set to Folder Modal */}
      {folderId && (
        <AddStudySetToFolderModal
          isOpen={isAddStudySetModalOpen}
          onClose={() => setIsAddStudySetModalOpen(false)}
          folderId={folderId}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
