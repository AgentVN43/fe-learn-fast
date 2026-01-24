import { createBrowserRouter, Navigate } from "react-router-dom";

// Components
import { ProtectedRoute } from "./components/ProtectedRoute";

// Page Components
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import MyStudySetsPage from "./pages/MyStudySetsPage";
import DebugPage from "./pages/DebugPage";

// Study Sets
import StudySetsIndexPage from "./pages/study-sets/StudySetsIndexPage";
import StudySetDetailPage from "./pages/study-sets/StudySetDetailPage";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminStudySetsPage from "./pages/admin/AdminStudySetsPage";
import AdminStudySetDetailPage from "./pages/admin/AdminStudySetDetailPage";
import AdminFlashcardsPage from "./pages/admin/AdminFlashcardsPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/register",
        element: <RegisterPage />,
    },
    {
        path: "/profile",
        element: (
            <ProtectedRoute>
                <ProfilePage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/my-study-sets",
        element: (
            <ProtectedRoute>
                <MyStudySetsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/debug",
        element: <DebugPage />,
    },

    // Study Sets Routes
    {
        path: "/study-sets",
        element: <StudySetsIndexPage />,
    },
    {
      path: "/study-sets/:studySetId",
      element: (
        <ProtectedRoute>
          <StudySetDetailPage />
        </ProtectedRoute>
      ),
    },

    // Admin Routes
    {
      path: "/admin",
      element: (
        <ProtectedRoute requiredRole="Admin">
          <AdminDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/users",
      element: (
        <ProtectedRoute requiredRole="Admin">
          <AdminUsersPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/study-sets",
      element: (
        <ProtectedRoute requiredRole="Admin">
          <AdminStudySetsPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/study-sets/:studySetId",
      element: (
        <ProtectedRoute requiredRole="Admin">
          <AdminStudySetDetailPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/flashcards",
      element: (
        <ProtectedRoute requiredRole="Admin">
          <AdminFlashcardsPage />
        </ProtectedRoute>
      ),
    },

    // Fallback
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);
