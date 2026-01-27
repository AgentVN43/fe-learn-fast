import { useAuth } from "../hooks/useAuth";
import { useProgressStats } from "../hooks/useProgressStats";
import { useUserStudySets } from "../hooks/useUserStudySets";
import { HiArrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

interface UserStats {
  totalStudySets: number;
  totalFlashcards: number;
  totalProgress: number;
  masteredCards: number;
  learningCards: number;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  // Fetch user's study sets
  const {
    data: userStudySets = [],
    isLoading: setsLoading,
    error: setsError,
  } = useUserStudySets(user?.id);

  // Fetch progress stats for user
  const {
    data: progressStats,
    isLoading: statsLoading,
    error: statsError,
  } = useProgressStats(user?.id);

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

  console.log(userStudySets)

  const statsData = calculateStats();
  const isLoading = authLoading || setsLoading || statsLoading;
  const error = setsError || statsError;

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow p-6 max-w-md text-center">
          <p className="text-red-600 mb-4">
            Lỗi khi tải dữ liệu:
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span>Quay Lại</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông Tin</h1>
            <p className="text-gray-600">
              Quản lý tài khoản và dữ liệu học tập
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Thông Tin Tài Khoản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600 font-medium">
                Tên Người Dùng
              </label>
              <p className="text-lg text-gray-900 mt-1">
                {user.name || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600 font-medium">Email</label>
              <p className="text-lg text-gray-900 mt-1">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600 font-medium">
                Vai Trò
              </label>
              <p className="text-lg text-gray-900 mt-1 capitalize">
                {user.role}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600 font-medium">ID</label>
              <p className="text-sm text-gray-500 mt-1 font-mono">{user.id}</p>
            </div>
          </div>
        </div>

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
                color: "blue",
              },
              {
                label: "Thẻ Học",
                value: statsData.totalFlashcards,
                color: "purple",
              },
              {
                label: "Tiến Độ",
                value: statsData.totalProgress,
                color: "indigo",
              },
              {
                label: "Thành Thạo",
                value: statsData.masteredCards,
                color: "green",
              },
              {
                label: "Đang Học",
                value: statsData.learningCards,
                color: "orange",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`bg-white rounded-lg p-4 border-l-4 border-${stat.color}-500 shadow-sm`}
              >
                <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-600`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Study Sets List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
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
      </div>
    </div>
  );
}
