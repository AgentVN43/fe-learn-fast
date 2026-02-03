import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HamburgerMenu } from "./HamburgerMenu";
import { HiSearch, HiChevronDown, HiUser, HiLogout, HiFolder } from "react-icons/hi";

interface NavBarProps {
  onCreateClick?: () => void;
}

export const NavBar = ({ onCreateClick }: NavBarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/study-sets?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
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
    <nav className="bg-gray-800 text-white p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 px-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold hover:text-gray-300 whitespace-nowrap">
          LearnFast
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bộ học tập..."
              className="w-full px-4 py-2 pl-10 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </form>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          {user ? (
            <>
              <Link
                to="/"
                className={`block px-4 py-2 rounded transition ${isActive("/", true)
                    ? "bg-gray-700 text-blue-400 font-semibold"
                    : "hover:bg-gray-700"
                  }`}
              >
                Trang Chủ
              </Link>

              {/* <Link
                to="/study-sets"
                className={`transition whitespace-nowrap ${isActive("/study-sets")
                    ? "text-blue-400 font-semibold"
                    : "hover:text-gray-300"
                  }`}
              >
                Bộ Học Tập
              </Link> */}

              <button
               onClick={() => navigate("/profile/folder")}
               className="flex items-center gap-2 hover:text-gray-300 transition whitespace-nowrap"
              >
               <HiFolder className="w-5 h-5" />
               <span className="text-sm">Courses</span>
              </button>

              {onCreateClick && (
                <button
                  onClick={onCreateClick}
                  className="hover:text-gray-300 transition whitespace-nowrap"
                >
                  Lesson
                </button>
              )}

              {/* User Dropdown Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 hover:text-gray-300 transition"
                >
                  <span className="text-sm">{user.name}</span>
                  <HiChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Content */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-600">
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-600 transition text-white"
                      >
                        <HiUser className="w-5 h-5" />
                        <span>Hồ Sơ</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-600 transition text-red-400"
                      >
                        <HiLogout className="w-5 h-5" />
                        <span>Đăng Xuất</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300 transition whitespace-nowrap">
                Đăng Nhập
              </Link>
              <Link to="/register" className="hover:text-gray-300 transition whitespace-nowrap">
                Đăng Ký
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <HamburgerMenu onCreateClick={onCreateClick} />
      </div>
    </nav>
  );
};
