import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { authService } from "../../services/authService";
import { HiTrash, HiPencil, HiX } from "react-icons/hi";
import type { UserRole } from "../../types";

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Assistant" as UserRole,
  });
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminUsers", page, limit],
    queryFn: async () => {
      console.log("Fetching users...");
      const token = authService.getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/users?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const token = authService.getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/users/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      handleFormClose();
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = authService.getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/users/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "Assistant",
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate({
        id: editingUser.id || editingUser._id || "",
        data: formData,
      });
    }
  };

  if (isLoading)
    return (
      <div className="p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  if (error)
    return (
      <div className="p-4 text-red-500">Lỗi: {(error as Error).message}</div>
    );

  const users = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản Lý Người Dùng</h1>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Tên</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Vai Trò</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Ngày Tạo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Lần Đăng Nhập Cuối</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user: User) => (
              <tr key={user.id || user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === "Admin"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString("vi-VN")
                    : "Chưa đăng nhập"}
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    title="Chỉnh sửa"
                    className="text-yellow-500 hover:text-yellow-700 transition"
                  >
                    <HiPencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Bạn có chắc muốn xóa người dùng này?"
                        )
                      ) {
                        deleteMutation.mutate(user.id || user._id || "");
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Tiếp
          </button>
        </div>
      )}

      {/* Edit Form Modal */}
      {isFormOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Chỉnh Sửa Người Dùng</h2>
              <button
                onClick={handleFormClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai Trò
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as UserRole })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Assistant">Assistant</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleFormClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
