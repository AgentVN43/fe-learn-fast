import { LoginForm } from "../components/LoginForm";

/**
 * LoginPage - GET /login
 * 
 * Page for user authentication.
 * Uses LoginForm component to handle login submission.
 */
export default function LoginPage() {
  return (
    <div className="w-full min-h-screen">
      <LoginForm />
    </div>
  );
}
