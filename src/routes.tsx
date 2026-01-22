import { createBrowserRouter, Navigate } from "react-router-dom";

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
    element: <ProfilePage />,
  },
  {
    path: "/my-study-sets",
    element: <MyStudySetsPage />,
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
    element: <StudySetDetailPage />,
  },

  // Admin Routes
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/users",
    element: <AdminUsersPage />,
  },
  {
    path: "/admin/study-sets",
    element: <AdminStudySetsPage />,
  },
  {
    path: "/admin/study-sets/:studySetId",
    element: <AdminStudySetDetailPage />,
  },
  {
    path: "/admin/flashcards",
    element: <AdminFlashcardsPage />,
  },

  // Fallback
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
