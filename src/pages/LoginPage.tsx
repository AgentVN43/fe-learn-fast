import { Link } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import { LoginForm } from "../components/LoginForm";

/**
 * LoginPage - GET /login
 * 
 * Page for user authentication.
 * Uses LoginForm component to handle login submission.
 */
export default function LoginPage() {
  return (
    <div className="w-full min-h-screen relative">
      {/* Back to Home Button - Fixed at top left corner */}
      <Link
        to="/"
        className="fixed top-4 left-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 bg-white px-4 py-2 rounded-lg shadow-md transition z-10"
      >
        <HiArrowLeft className="w-5 h-5" />
        <span>Quay lại trang chủ</span>
      </Link>
      <LoginForm />
    </div>
  );
}
