import { createBrowserRouter, Navigate } from "react-router-dom";

// Layout
import MainLayout from "./layout/MainLayout";

// Components

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import MyStudySetsPage from "./pages/MyStudySetsPage";
import DebugPage from "./pages/DebugPage";

// Study Sets
import StudySetDetailPage from "./components/study-sets/StudySetDetailPage";
import StudySetsPage from "./pages/StudySetsPage";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminStudySetsPage from "./pages/admin/AdminStudySetsPage";
import AdminStudySetDetailPage from "./pages/admin/AdminStudySetDetailPage";
import AdminFlashcardsPage from "./pages/admin/AdminFlashcardsPage";
import FolderPage from "./pages/FolderPage";
import FolderDetailPage from "./pages/FolderDetailPage";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
export const router = createBrowserRouter([
  // 🌍 Public (no layout)
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  // 🌍 App layout
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/study-sets",
        element: <StudySetsPage />,
      },
      {
        path: "/debug",
        element: <DebugPage />,
      },

      // 🔒 Logged-in users
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/profile",
            element: <ProfilePage />,
          },
          {
            path: "/profile/folder",
            element: <FolderPage />,
          },
          {
            path: "/profile/folders/:folderId",
            element: <FolderDetailPage />,
          },
            {
            path: "/profile/study-sets/:studySetId",
            element: <AdminStudySetDetailPage />,
          },
          {
            path: "/my-study-sets",
            element: <MyStudySetsPage />,
          },
          {
            path: "/study-sets/:studySetId",
            element: <StudySetDetailPage />,
          },
        ],
      },

      // 🔒 Admin only
      {
        element: <ProtectedRoute requiredRole="Admin" />,
        children: [
          { path: "/admin", element: <AdminDashboard /> },
          { path: "/admin/users", element: <AdminUsersPage /> },
          { path: "/admin/study-sets", element: <AdminStudySetsPage /> },
          {
            path: "/admin/study-sets/:studySetId",
            element: <AdminStudySetDetailPage />,
          },
          { path: "/admin/flashcards", element: <AdminFlashcardsPage /> },
        ],
      },
    ],
  },

  // ❌ Fallback
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
