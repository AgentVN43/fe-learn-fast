import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { HamburgerMenu } from "./HamburgerMenu";

export const NavBar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-gray-800 text-white p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-gray-300">
          LearnFast
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          {user ? (
            <>
              <span className="text-sm">{user.name}</span>
              <Link to="/study-sets" className="hover:text-gray-300 transition">
                Bộ Học Tập
              </Link>
              {user.role === "Admin" && (
                <Link
                  to="/admin/users"
                  className="hover:text-gray-300 transition"
                >
                  Quản Lý Người Dùng
                </Link>
              )}
              <Link to="/profile" className="hover:text-gray-300 transition">
                Hồ Sơ
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
              >
                Đăng Xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300 transition">
                Đăng Nhập
              </Link>
              <Link to="/register" className="hover:text-gray-300 transition">
                Đăng Ký
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <HamburgerMenu />
      </div>
    </nav>
  );
};
