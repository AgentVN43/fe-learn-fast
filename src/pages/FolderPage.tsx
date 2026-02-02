import { useAuth } from "../hooks/useAuth";
import { useFolders } from "../hooks/useFolders";
import { useNavigate } from "react-router-dom";
import { HiArrowLeft, HiFolder, HiPlus } from "react-icons/hi";

export default function FolderPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { folders, isLoading, error } = useFolders();

  console.log("🔍 FolderPage - user:", user?.id);
  console.log("🔍 FolderPage - folders:", folders);
  console.log("🔍 FolderPage - isLoading:", isLoading);
  console.log("🔍 FolderPage - error:", error);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span>Quay Lại</span>
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Thư Mục Của Tôi
              </h1>
              <p className="text-gray-600">
                Quản lý các thư mục học tập của bạn
              </p>
            </div>
            {/* <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
              <HiPlus className="w-5 h-5" />
              <span>Tạo Thư Mục</span>
            </button> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-600">Đang tải thư mục...</p>
            </div>
          </div>
        ) : folders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border-2 border-dashed border-gray-300">
            <HiFolder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có thư mục nào
            </h3>
            <p className="text-gray-600 mb-6">
              Tạo thư mục đầu tiên của bạn để tổ chức bộ học tập
            </p>
            <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
              <HiPlus className="w-5 h-5" />
              <span>Tạo Thư Mục Đầu Tiên</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders.map((folder: any) => (
              <div
                key={folder._id || folder.id}
                onClick={() => navigate(`/profile/folders/${folder._id || folder.id}`)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6 cursor-pointer hover:border-blue-300 border border-transparent"
              >
                <div className="flex items-start gap-4">
                  <HiFolder className="w-12 h-12 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {folder.name}
                    </h3>
                    {folder.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {folder.description}
                      </p>
                    )}
                    {folder.createdAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Tạo ngày{" "}
                        {new Date(folder.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
