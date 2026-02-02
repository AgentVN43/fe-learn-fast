import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

/**
 * LoginForm Component
 * 
 * Handles user login with email and password.
 * - Validates input fields
 * - Submits credentials via useAuth hook
 * - Navigates to home page on success
 * - Displays error messages on failure
 */
export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  
  const { loginAsync, isLoggingIn, loginError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validate inputs
    if (!email || !password) {
      setValidationError("Vui lòng nhập email và mật khẩu");
      return;
    }

    if (!email.includes("@")) {
      setValidationError("Email không hợp lệ");
      return;
    }

    try {
      await loginAsync({ email, password });
      // Navigate to home on successful login
      navigate("/", { replace: true });
    } catch (error) {
      // Error already handled by hook and displayed via loginError
      console.error("Login failed:", error);
    }
  };

  const displayError = validationError || loginError;
  const isLoading = isLoggingIn;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Đăng Nhập
        </h2>

        {displayError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-blue-500 hover:underline font-medium">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
};
