import { useState } from "react";
import { HiArrowLeft, HiHeart, HiPlay, HiClipboardList } from "react-icons/hi";
import type { StudySet, Flashcard } from "../types";
import type { ProgressStats } from "../services/progressService";

interface StudySetDetailProps {
  studySet: StudySet;
  flashcards?: Flashcard[];
  stats?: ProgressStats;
  onBack: () => void;
  onLearnClick: () => void;
  onTestClick: () => void;
}

export const StudySetDetail = ({
  studySet,
  flashcards = [],
  stats,
  onBack,
  onLearnClick,
  onTestClick,
}: StudySetDetailProps) => {
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "cards">("overview");

  const handleLike = () => {
    setLiked(!liked);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Quay Lại</span>
          </button>
          <button
            onClick={handleLike}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition"
          >
            <HiHeart className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
            <span className="text-sm">{studySet.likes + (liked ? 1 : 0)}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title & Description */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-3">{studySet.title}</h1>

          {studySet.description && (
            <p className="text-gray-600 text-lg mb-4">{studySet.description}</p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            <span>👤 {studySet.user?.name || "Anonymous"}</span>
            <span>📚 {studySet.flashcardCount} thẻ</span>
            <span>📊 {studySet.studyCount} lần học</span>
            {studySet.isPublic && <span className="text-green-600">🔓 Công khai</span>}
          </div>

          {/* Tags */}
          {studySet.tags && studySet.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {studySet.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Progress Stats */}
          {stats ? (
            <div className="grid grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-500">Đã Học</p>
                <p className="text-lg font-bold text-green-600">{stats.totalReviewed}/{stats.total}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Thành Thạo</p>
                <p className="text-lg font-bold text-blue-600">{stats.mastered}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Cần Luyện</p>
                <p className="text-lg font-bold text-yellow-600">{stats.needReview}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Độ Chính Xác</p>
                <p className="text-lg font-bold text-purple-600">
                  {typeof stats.accuracyRate === 'number'
                    ? stats.accuracyRate.toFixed(0)
                    : typeof stats.accuracyRate === 'string'
                      ? parseInt(stats.accuracyRate, 10)
                      : 0}
                  %
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
              Đang tải tiến trình học...
            </div>
          )}
          </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={onLearnClick}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition"
          >
            <HiPlay className="w-5 h-5" />
            <span>Bắt Đầu Học</span>
          </button>
          <button
            onClick={onTestClick}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition"
          >
            <HiClipboardList className="w-5 h-5" />
            <span>Bài Kiểm Tra</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-4 py-3 font-medium transition ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Tổng Quan
            </button>
            <button
              onClick={() => setActiveTab("cards")}
              className={`flex-1 px-4 py-3 font-medium transition ${
                activeTab === "cards"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Thẻ ({flashcards.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" ? (
              // Overview Tab
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Về Bộ Học Tập</h3>
                  <p className="text-gray-600">
                    {studySet.description || "Không có mô tả"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Thông Tin</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tổng Thẻ</p>
                      <p className="text-lg font-bold">{studySet.flashcardCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Lần Học</p>
                      <p className="text-lg font-bold">{studySet.studyCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Lượt Thích</p>
                      <p className="text-lg font-bold">
                        {studySet.likes + (liked ? 1 : 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tạo</p>
                      <p className="text-lg font-bold">
                        {new Date(studySet.createdAt || "").toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {studySet.user && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Tác Giả</h3>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                        {studySet.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {studySet.user.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {studySet.user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Cards Tab
              <div className="space-y-3">
                {flashcards.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Chưa có thẻ nào
                  </p>
                ) : (
                  flashcards.map((card, index) => (
                    <div
                      key={card.id || card._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex gap-4">
                        {/* Card Image */}
                        {card.image && (
                          <div className="flex-shrink-0">
                            <img
                              src={card.image}
                              alt={card.term}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {/* Card Content */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              Thẻ {index + 1}
                            </span>
                            {card.difficulty && (
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  card.difficulty === "easy"
                                    ? "bg-green-100 text-green-700"
                                    : card.difficulty === "medium"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                }`}
                              >
                                {card.difficulty === "easy"
                                  ? "Dễ"
                                  : card.difficulty === "medium"
                                    ? "Trung Bình"
                                    : "Khó"}
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-gray-800 mb-1">
                            {card.term}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {card.definition}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
