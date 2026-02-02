import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { StudySetList } from "../StudySetList";
import { StudySetForm } from "../StudySetForm";
import type { StudySet, StudySetFormData } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { studySetService } from "../../services/studySetService";

export default function StudySetsIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<
    (StudySetFormData & { id?: string }) | undefined
  >();
  const [activeTab, setActiveTab] = useState<"popular" | "latest">("latest");
  const [searchPage, setSearchPage] = useState(1);

  // Search query
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["studySets", "search", searchQuery, searchPage],
    queryFn: async () => {
      if (!searchQuery.trim()) return null;
      return await studySetService.search(searchQuery, searchPage, 10);
    },
    enabled: !!searchQuery.trim(),
  });

  // Reset search page when search query changes
  useEffect(() => {
    if (searchQuery) {
      setSearchPage(1);
    }
  }, [searchQuery]);

  // Clear search when component unmounts or tab changes
  useEffect(() => {
    if (!searchQuery && searchParams.has("search")) {
      setSearchParams({});
    }
  }, [searchQuery, searchParams, setSearchParams]);

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

  const studySets = searchQuery
    ? (searchResults as any)?.data || []
    : null;
  const pagination = searchQuery
    ? (searchResults as any)?.pagination
    : null;

  return (
    <div className="bg-gray-100 p-3 px-4 mt-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` : "Bộ Học Tập"}
          </h1>
        </div>

        {/* Tabs - Only show when not searching */}
        {!searchQuery && (
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
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {searchQuery ? (
            isSearching ? (
              <div className="flex justify-center items-center py-8">
                <p className="text-gray-500">Đang tìm kiếm...</p>
              </div>
            ) : studySets && studySets.length > 0 ? (
              <StudySetList
                variant="latest"
                onEditClick={handleEditClick}
                customData={studySets}
                customPagination={pagination}
                onPageChange={setSearchPage}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Không tìm thấy kết quả cho "{searchQuery}"
                </p>
              </div>
            )
          ) : (
            <StudySetList variant={activeTab} onEditClick={handleEditClick} />
          )}
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
