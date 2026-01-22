import { useState } from "react";
import { StudySetList } from "../../components/StudySetList";
import { StudySetForm } from "../../components/StudySetForm";
import type { StudySet, StudySetFormData } from "../../types";
import { HiPlus } from "react-icons/hi";

export default function StudySetsIndexPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<(StudySetFormData & { id?: string }) | undefined>();
  const [activeTab, setActiveTab] = useState<"popular" | "latest">("latest");

  const handleEditClick = (studySet: StudySet) => {
    setEditingSet({
      title: studySet.title,
      description: studySet.description,
      isPublic: studySet.isPublic,
      tags: studySet.tags,
      id: studySet.id || studySet._id,
    });
    setIsFormOpen(true);
    console.log("Handle edit clicked for study set:", studySet);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSet(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Bộ Học Tập</h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition"
          >
            <HiPlus className="w-5 h-5" />
            <span>Tạo Mới</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("latest")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "latest"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Mới Nhất
          </button>
          <button
            onClick={() => setActiveTab("popular")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "popular"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Phổ Biến
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <StudySetList
            variant={activeTab}
            onEditClick={handleEditClick}
          />
        </div>
      </div>

      {/* Form Modal */}
      <StudySetForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        initialData={editingSet}
      />
    </div>
  );
}
