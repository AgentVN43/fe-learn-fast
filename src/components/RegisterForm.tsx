import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

/**
 * RegisterForm Component
 * 
 * Handles user registration with email, password, name, and role.
 * - Validates input fields
 * - Submits registration data via useAuth hook
 * - Navigates to home page on success
 * - Displays error messages on failure
 */
export const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"Admin" | "Assistant">("Assistant");
  const [validationError, setValidationError] = useState("");
  
  const { registerAsync, isRegistering, registerError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validate inputs
    if (!email || !password || !name) {
      setValidationError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!email.includes("@")) {
      setValidationError("Email không hợp lệ");
      return;
    }

    if (password.length < 6) {
      setValidationError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      await registerAsync({ email, password, name, role });
      // Navigate to home on successful registration
      navigate("/", { replace: true });
    } catch (error) {
      // Error already handled by hook and displayed via registerError
      console.error("Registration failed:", error);
    }
  };

  const displayError = validationError || registerError;
  const isLoading = isRegistering;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Đăng Ký
        </h2>

        {displayError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Tên
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên của bạn"
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border text-gray-500 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border text-gray-500 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Mật Khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border text-gray-500 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
              Vai Trò
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as "Admin" | "Assistant")}
              disabled={isLoading}
              className="w-full px-4 py-2 border text-gray-500 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="Assistant">Assistant</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            {isLoading ? "Đang đăng ký..." : "Đăng Ký"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-blue-500 hover:underline font-medium">
            Đăng nhập ngay
          </a>
        </p>
      </div>
    </div>
  );
};
