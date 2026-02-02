import { useAuth } from "../hooks/useAuth";
import { useProgressStats } from "../hooks/useProgressStats";
import { useUserStudySets } from "../hooks/useUserStudySets";
import { Link, useNavigate } from "react-router-dom";
import StudySetsIndexPage from "../components/study-sets/StudySetsIndexPage";
import { Button } from "antd";

interface UserStats {
  totalStudySets: number;
  totalFlashcards: number;
  totalProgress: number;
  masteredCards: number;
  learningCards: number;
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch user's study sets (always call hooks, even if user is null)
  const {
    data: userStudySets = [],
    isLoading: setsLoading,
  } = useUserStudySets(user?.id);

  // Fetch progress stats for user (always call hooks, even if user is null)
  const {
    data: progressStats,
    isLoading: statsLoading,
  } = useProgressStats();

  // If not logged in, show public study sets
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white">
          <div className="mx-auto max-w-7xl px-6 py-24 text-center md:text-left">
            <h1 className="text-5xl font-bold tracking-tight mb-4">
              Learn Fast
            </h1>

            <p className="text-xl text-blue-100 mb-10">
              Nền tảng học tập hiệu quả với thẻ ghi nhớ tương tác
            </p>

            <div className="flex flex-col gap-4 sm:flex-row mt-8">
              <Link to="/login">
                <Button
                  size="large"
                  className="h-12! px-8! rounded-xl! font-semibold! text-blue-600!"
                >
                  Đăng Nhập
                </Button>
              </Link>

              <Link to="/register">
                <Button
                  type="primary"
                  size="large"
                  className="h-12! px-8! rounded-xl! font-semibold! bg-blue-500! hover:bg-blue-600!"
                >
                  Đăng Ký
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Study Sets Section */}
        <div className="max-w-7xl mx-auto px-4 py-12">
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

  // Calculate user stats
  const calculateStats = (): UserStats => {
    if (!progressStats) {
      return {
        totalStudySets: 0,
        totalFlashcards: 0,
        totalProgress: 0,
        masteredCards: 0,
        learningCards: 0,
      };
    }

    const stats = Array.isArray(progressStats) ? progressStats : [];

    const totalFlashcards = userStudySets.reduce(
      (sum, set) => sum + (set.cardCount || 0),
      0,
    );

    const masteredCards = stats.filter((s) => s.isMastered).length;
    const learningCards = stats.filter((s) => !s.isMastered).length;

    return {
      totalStudySets: userStudySets.length,
      totalFlashcards,
      totalProgress: stats.length,
      masteredCards,
      learningCards,
    };
  };

  const statsData = calculateStats();
  const isLoading = setsLoading || statsLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Learn Fast</h1>
          
          <div className="flex items-center gap-4">
            {/* Stats Button */}
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              title="Xem thống kê"
            >
              <HiEye className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Xem Thống Kê</span>
            </button>

            {/* Profile Menu */}
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                title={user?.email}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-900 hidden sm:inline">
                  {user?.name || user?.email?.split("@")[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2 space-y-1">
                  <div className="px-4 py-2 border-b">
                    <p className="text-xs text-gray-500">Tài khoản</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
                  >
                    <HiUser className="w-4 h-4" />
                    <span className="text-sm">Hồ Sơ Của Tôi</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <HiArrowRightOnRectangle className="w-4 h-4" />
                    <span className="text-sm">Đăng Xuất</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Xin chào, {user.name || user.email}! 👋
          </h1>
          <p className="text-gray-600">Tiếp tục hành trình học tập của bạn</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Thống Kê Học Tập
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                label: "Bộ Học",
                value: statsData.totalStudySets,
                borderColor: "border-blue-500",
                textColor: "text-blue-600",
              },
              {
                label: "Thẻ Học",
                value: statsData.totalFlashcards,
                borderColor: "border-purple-500",
                textColor: "text-purple-600",
              },
              {
                label: "Tiến Độ",
                value: statsData.totalProgress,
                borderColor: "border-indigo-500",
                textColor: "text-indigo-600",
              },
              {
                label: "Thành Thạo",
                value: statsData.masteredCards,
                borderColor: "border-green-500",
                textColor: "text-green-600",
              },
              {
                label: "Đang Học",
                value: statsData.learningCards,
                borderColor: "border-orange-500",
                textColor: "text-orange-600",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`bg-white rounded-lg p-4 border-l-4 ${stat.borderColor} shadow-sm`}
              >
                <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Study Sets List */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Các Bộ Học Của Tôi
          </h2>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : userStudySets.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-600 mb-4">Chưa có bộ học nào</p>
              <button
                onClick={() => navigate("/study-sets")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                Tạo Bộ Học
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
                  {userStudySets.map((set) => (
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
                        {set.cardCount || 0}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {set.createdAt
                          ? new Date(set.createdAt).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            navigate(`/study-sets/${set.id || set._id}`)
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
