// layouts/MainLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { StudySetForm } from "../components/StudySetForm";
import { NavBar } from "../components/NavBar";

export default function MainLayout() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreateClick = () => {
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <NavBar onCreateClick={handleCreateClick} />

      {/* Main content */}
      <main className="flex-1 bg-slate-50">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-4 bg-white border-t">
        Language Learning Platform © 2024
      </footer>

      {/* Create Form Modal */}
      <StudySetForm isOpen={isFormOpen} onClose={handleFormClose} />
    </div>
  );
}
