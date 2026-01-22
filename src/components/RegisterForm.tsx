import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"Admin" | "Assistant">("Assistant");
  const { registerAsync, registerLoading, registerError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerAsync({ email, password, name, role });
      navigate({ to: "/", replace: true });
    } catch (error) {
      // Error already handled by hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Đăng Ký
        </h2>

        {registerError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {registerError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={registerLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Họ Tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              disabled={registerLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Mật Khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={registerLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Vai Trò
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "Admin" | "Assistant")}
              disabled={registerLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Assistant">Trợ Lý</option>
              <option value="Admin">Quản Trị Viên</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={registerLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            {registerLoading ? "Đang đăng ký..." : "Đăng Ký"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-blue-500 hover:underline font-medium">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};
