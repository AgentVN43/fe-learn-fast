import { useState } from "react";
import { Link } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { useAuth } from "../hooks/useAuth";

export const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
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
        className={`fixed left-0 top-0 h-full w-64 bg-gray-800 text-white transform transition-transform duration-300 z-50 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
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
            className="block px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            Trang Chủ
          </Link>

          {user ? (
            <>
              <Link
                to="/study-sets"
                onClick={closeMenu}
                className="block px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Bộ Học Tập
              </Link>
              <Link
                to="/profile"
                onClick={closeMenu}
                className="block px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Hồ Sơ
              </Link>

              {user.role === "Admin" && (
                <>
                  <hr className="my-2 border-gray-700" />
                  <Link
                    to="/admin/users"
                    onClick={closeMenu}
                    className="block px-4 py-2 rounded hover:bg-gray-700 transition text-blue-400"
                  >
                    Quản Lý Người Dùng
                  </Link>
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
