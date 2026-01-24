import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import StudySetsIndexPage from "./study-sets/StudySetsIndexPage";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If not logged in, show public study sets
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-5xl font-bold mb-4">Learn Fast</h1>
            <p className="text-xl text-blue-100 mb-8">
              Nền tảng học tập hiệu quả với thẻ ghi nhớ tương tác
            </p>
            <div className="flex gap-4">
              <a
                href="/login"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Đăng Nhập
              </a>
              <a
                href="/register"
                className="bg-blue-500 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Đăng Ký
              </a>
            </div>
          </div>
        </div>

        {/* Study Sets Section */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Khám Phá Các Bộ Học Tập
          </h2>
          <p className="text-gray-600 mb-8">
            Chọn từ hàng chục bộ học tập hoặc tạo bộ của riêng bạn
          </p>
          <StudySetsIndexPage />
        </div>
      </div>
    );
  }

  // If logged in, show dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Xin chào, {user.name || user.email}! 👋
          </h1>
          <p className="text-gray-600">Tiếp tục hành trình học tập của bạn</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Quick Stats */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Thống Kê Của Bạn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
                <div className="text-3xl font-bold text-blue-600">0</div>
                <p className="text-gray-600 mt-2">Bộ Học Hiện Tại</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
                <div className="text-3xl font-bold text-green-600">0</div>
                <p className="text-gray-600 mt-2">Thẻ Thành Thạo</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
                <div className="text-3xl font-bold text-purple-600">0</div>
                <p className="text-gray-600 mt-2">Chuỗi Học Liên Tục</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Study Sets Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Các Bộ Học Của Tôi
            </h2>
            <button
              onClick={() => navigate("/my-study-sets")}
              className="text-blue-600 hover:text-blue-700 font-medium transition"
            >
              Xem Tất Cả →
            </button>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa Có Bộ Học
            </h3>
            <p className="text-gray-600 mb-6">
              Tạo bộ học đầu tiên của bạn để bắt đầu học tập
            </p>
            <button
              onClick={() => navigate("/study-sets")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Khám Phá Bộ Học
            </button>
          </div>
        </div>

        {/* Study Sets Browse */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Khám Phá Thêm
          </h2>
          <StudySetsIndexPage />
        </div>
      </div>
    </div>
  );
}
