import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Hồ Sơ Người Dùng</h1>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-gray-600 text-sm">Tên</p>
            <p className="text-xl font-semibold text-gray-800">{user.name}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="text-xl font-semibold text-gray-800">{user.email}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Vai Trò</p>
            <p className="text-xl font-semibold text-gray-800">
              {user.role === "Admin" ? "Quản Trị Viên" : "Trợ Lý"}
            </p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Trạng Thái</p>
            <p className="text-xl font-semibold text-green-600">
              {user.isActive ? "Hoạt Động" : "Không Hoạt Động"}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              /* TODO: Navigate to edit profile */
            }}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Chỉnh Sửa Hồ Sơ
          </button>

          <button
            onClick={handleLogout}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Đăng Xuất
          </button>
        </div>
      </div>
    </div>
  );
};
