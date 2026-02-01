import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiLogout, HiMenu, HiX } from "react-icons/hi";
import { useAuth } from "../hooks/useAuth";

interface HamburgerMenuProps {
  onCreateClick?: () => void;
}

export const HamburgerMenu = ({ onCreateClick }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Check if a path is active
  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    // For /study-sets, also match /study-sets/:id
    if (path === "/study-sets") {
      return location.pathname === path || location.pathname.startsWith("/study-sets/");
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg hover:bg-gray-700 transition"
        aria-label="Menu"
      >
        {isOpen ? (
          <HiX className="w-6 h-6" />
        ) : (
          <HiMenu className="w-6 h-6" />
        )}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-gray-800 text-white transform transition-transform duration-300 z-50 md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">LearnFast</h2>
          <button
            onClick={closeMenu}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Content */}
        <nav className="p-4 space-y-2">
          <Link
            to="/"
            onClick={closeMenu}
            className={`block px-4 py-2 rounded transition ${
              isActive("/", true)
                ? "bg-gray-700 text-blue-400 font-semibold"
                : "hover:bg-gray-700"
            }`}
          >
            Trang Chủ
          </Link>

          {user ? (
            <>
              <Link
                to="/study-sets"
                onClick={closeMenu}
                className={`block px-4 py-2 rounded transition ${
                  isActive("/study-sets")
                    ? "bg-gray-700 text-blue-400 font-semibold"
                    : "hover:bg-gray-700"
                }`}
              >
                Bộ Học Tập
              </Link>
              {onCreateClick && (
                <button
                  onClick={() => {
                    onCreateClick();
                    closeMenu();
                  }}
                  className="block w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition"
                >
                  Tạo Mới
                </button>
              )}
              <Link
                to="/profile"
                onClick={closeMenu}
                className={`block px-4 py-2 rounded transition ${
                  isActive("/profile", true)
                    ? "bg-gray-700 text-blue-400 font-semibold"
                    : "hover:bg-gray-700"
                }`}
              >
                Hồ Sơ
              </Link>

              {user.role === "Admin" && (
                <>
                  {/* <hr className="my-2 border-gray-700" />
                  <Link
                    to="/admin/users"
                    onClick={closeMenu}
                    className="block px-4 py-2 rounded hover:bg-gray-700 transition text-blue-400"
                  >
                    Quản Lý Người Dùng
                  </Link> */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-600 transition text-red-400"
                  >
                    <HiLogout className="w-5 h-5" />
                    <span>Đăng Xuất</span>
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMenu}
                className="block px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="block px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Đăng Ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
};
