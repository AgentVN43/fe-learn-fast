import { useNavigate } from "react-router-dom";
import { HiUsers, HiBookOpen, HiSquares2X2 } from "react-icons/hi2";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const adminMenus = [
    {
      title: "Quản Lý Người Dùng",
      description: "Xem, chỉnh sửa, xóa người dùng",
      icon: HiUsers,
      color: "bg-blue-500",
      to: "/admin/users",
    },
    {
      title: "Quản Lý Bộ Học Tập",
      description: "Quản lý tất cả bộ học tập trong hệ thống",
      icon: HiBookOpen,
      color: "bg-green-500",
      to: "/admin/study-sets",
    },
    {
      title: "Quản Lý Thẻ Học",
      description: "Quản lý tất cả thẻ học (flashcards)",
      icon: HiSquares2X2,
      color: "bg-purple-500",
      to: "/admin/flashcards",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Bảng Điều Khiển Admin
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý toàn bộ nội dung hệ thống
          </p>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenus.map((menu) => {
            const IconComponent = menu.icon;
            return (
              <div
                key={menu.to}
                onClick={() => navigate(menu.to)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden group"
              >
                <div className={`${menu.color} h-24 flex items-center justify-center`}>
                  <IconComponent className="w-12 h-12 text-white" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                    {menu.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-2">
                    {menu.description}
                  </p>
                  <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm transition">
                    Truy Cập →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
