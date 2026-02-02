import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HiArrowLeft, HiVolumeUp, HiStar } from "react-icons/hi";
import type { Flashcard } from "../types";
import { progressService } from "../services/progressService";
import { useMasterFlashcard } from "../hooks/useProgress";

interface FlashcardLearnerProps {
  flashcards: Flashcard[];
  title: string;
  onBack: () => void;
  studySetId?: string;
}

interface CardState extends Flashcard {
  starred: boolean;
  learned: boolean;
}

export const FlashcardLearner = ({
  flashcards,
  title,
  onBack,
  studySetId,
}: FlashcardLearnerProps) => {
  const queryClient = useQueryClient();

  // Guard check - không có thẻ để học
  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Bạn đã học hết!
          </h2>
          <p className="text-gray-600 mb-6">
            Tất cả thẻ trong bộ học tập này đã được thành thạo. Bạn có thể:
          </p>

          <div className="space-y-2 mb-6 text-left">
            <div className="flex items-start gap-3">
              <span className="text-lg">✓</span>
              <p className="text-gray-600">
                Thử <strong>Bài Kiểm Tra</strong> để kiểm tra kiến thức
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">✓</span>
              <p className="text-gray-600">Ôn lại từ các bộ học tập khác</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">✓</span>
              <p className="text-gray-600">
                Tạo bộ học tập mới để phát triển thêm kiến thức
              </p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition font-medium"
          >
            Quay Lại
          </button>
        </div>
      </div>
    );
  }

  const [cards, setCards] = useState<CardState[]>(
    flashcards.map((card) => ({
      ...card,
      starred: false,
      learned: false,
    })),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard" | null>(null);

  // Mutation: Mark flashcard as mastered
  const masterMutation = useMasterFlashcard();

  // Mutation: Submit review for flashcard
  const reviewMutation = useMutation({
    mutationFn: async ({
      cardId,
      difficulty,
      isCorrect,
    }: {
      cardId: string;
      difficulty: "easy" | "medium" | "hard";
      isCorrect: boolean;
    }) => {
      if (!studySetId) throw new Error("Study Set ID không hợp lệ");
      return progressService.submitReview(
        cardId,
        studySetId,
        isCorrect,
        difficulty,
      );
    },
    onSuccess: () => {
      console.log("✅ Review submitted successfully");
      // Vô hiệu hóa cache và tải lại stats (phải khớp với query key trong useProgressStats)
      queryClient.invalidateQueries({ queryKey: ["progress", studySetId] });
      queryClient.invalidateQueries({
        queryKey: ["progressStats", studySetId],
      });
      // Chuyển sang thẻ tiếp theo
      handleNext();
    },
    onError: (error) => {
      console.error("❌ Failed to submit review:", error);
      // Vẫn chuyển sang thẻ tiếp theo cho trải nghiệm mượt
      handleNext();
    },
  });

  // Update cards when flashcards prop changes (e.g., shuffled)
  useEffect(() => {
    if (flashcards.length > 0) {
      // Always update cards when flashcards prop changes (e.g., from learnCards to shuffledFlashcards)
      const newCards = flashcards.map((card) => ({
        ...card,
        starred: false,
        learned: false,
      }));
      
      // Only reset state if truly different (new set of cards)
      if (cards.length === 0 || cards[0]?.term !== newCards[0]?.term) {
        console.log("📝 Updating cards from prop, new first card:", newCards[0]?.term);
        setCards(newCards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsComplete(false);
      }
    }
  }, [flashcards]);

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;
  const starredCount = cards.filter((c) => c.starred).length;

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setSelectedDifficulty(null); // Reset selection cho thẻ tiếp theo
    } else {
      setIsComplete(true);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedDifficulty) {
      console.warn("Vui lòng chọn mức độ nhớ");
      return;
    }

    const isCorrect = selectedDifficulty !== "hard";
    await handleReview(selectedDifficulty, isCorrect);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleStar = () => {
    const newCards = [...cards];
    newCards[currentIndex].starred = !newCards[currentIndex].starred;
    setCards(newCards);
  };

  const handleLearned = () => {
    const newCards = [...cards];
    newCards[currentIndex].learned = !newCards[currentIndex].learned;
    setCards(newCards);
  };

  // const handleSpeak = (text: string) => {
  //   if ("speechSynthesis" in window) {
  //     window.speechSynthesis.cancel();
  //     const utterance = new SpeechSynthesisUtterance(text);
  //     utterance.lang = "en-US";
  //     window.speechSynthesis.speak(utterance);
  //   }
  // };

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";

      // Ưu tiên giọng đọc tự nhiên nhất cho luyện nghe
      const voices = window.speechSynthesis.getVoices();
      const voicePriority = [
        "Google US English", // Giọng Google tự nhiên
        "Microsoft Zira", // Giọng nữ Microsoft
        "Samantha", // Giọng macOS tự nhiên
        "Karen", // Giọng nữ Australia
        "Daniel", // Giọng nam Anh
        "Alex", // Giọng nam macOS
      ];

      for (const voiceName of voicePriority) {
        const voice = voices.find((v) => v.name.includes(voiceName));
        if (voice) {
          utterance.voice = voice;
          break;
        }
      }

      // Tốc độ chậm rõ ràng cho người học
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
    setCards(
      cards.map((card) => ({
        ...card,
        starred: false,
        learned: false,
      })),
    );
  };

  /**
   * Xử lý gửi phản hồi học tập
   * @param difficulty - Mức độ khó: easy (dễ/đã thuộc), medium (bình thường), hard (khó nhớ)
   * @param isCorrect - Có trả lời đúng không (medium và easy = true, hard = false)
   */
  const handleReview = async (
    difficulty: "easy" | "medium" | "hard",
    isCorrect: boolean,
  ) => {
    if (!studySetId || !currentCard) {
      console.warn("Study Set ID hoặc Card không khả dụng");
      handleNext();
      return;
    }

    // Lấy ID thẻ hiện tại
    const cardId = currentCard.id || "";
    console.log(
      `🔄 Gửi review thẻ ${cardId} - ${difficulty} (${isCorrect ? "đúng" : "sai"})`,
    );

    try {
      // Submit review trước
      await reviewMutation.mutateAsync({ cardId, difficulty, isCorrect });

      // Nếu đánh dấu là "easy" (đã thuộc), cũng gọi API để cập nhật mastered status
      if (difficulty === "easy") {
        try {
          await masterMutation.mutateAsync({
            flashcardId: cardId,
            studySetId: studySetId,
          });
          console.log("✅ Thẻ được đánh dấu là đã thành thạo");
        } catch (error) {
          console.error("❌ Lỗi khi cập nhật mastered:", error);
        }
      }
    } catch (error) {
      console.error("❌ Lỗi submit review:", error);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Hoàn Thành!</h2>
          <p className="text-gray-600 mb-6">
            Bạn đã học xong tất cả {cards.length} thẻ
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Thẻ Yêu Thích</p>
              <p className="text-2xl font-bold text-blue-600">{starredCount}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Đã Học</p>
              <p className="text-2xl font-bold text-green-600">
                {cards.filter((c) => c.learned).length}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Học Lại
            </button>
            <button
              onClick={onBack}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
            >
              Quay Lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Quay Lại</span>
          </button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold text-gray-800 line-clamp-1">
              {title}
            </h1>
            <p className="text-xs text-gray-500">
              {currentIndex + 1} / {cards.length}
            </p>
          </div>
          <span className="text-sm font-medium text-gray-600">
            ⭐ {starredCount}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-200">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Card */}
        <div
          className="h-96 bg-white rounded-xl shadow-lg cursor-pointer perspective mb-6 transition-transform duration-300"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`relative w-full h-full transition-transform duration-500 ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front Side (Term) */}
            <div
              className="absolute w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-8 flex flex-col items-center justify-center text-center"
              style={{
                backfaceVisibility: "hidden",
              }}
            >
              <p className="text-white text-sm opacity-75 mb-2">
                Thẻ {currentIndex + 1}
              </p>
              <h2 className="text-4xl font-bold text-white mb-6">
                {currentCard.term}
              </h2>
              <p className="text-white text-sm opacity-75">
                Bấm để xem câu trả lời
              </p>

              {/* Speak Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak(currentCard.term);
                }}
                className="mt-6 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition cursor-pointer"
              >
                <HiVolumeUp className="w-6 h-6" />
              </button>
            </div>

            {/* Back Side (Definition) */}
            <div
              className="absolute w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-8 flex flex-col items-center justify-center text-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <p className="text-white text-sm opacity-75 mb-2">Câu Trả Lời</p>
              <h3 className="text-3xl font-bold text-white mb-8">
                {currentCard.definition}
              </h3>
              <p className="text-white text-sm opacity-75">
                Bấm để xem câu hỏi
              </p>

              {/* Speak Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak(currentCard.definition);
                }}
                className="mt-6 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition"
              >
                <HiVolumeUp className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Card Image */}
        {currentCard.image && (
          <div className="mb-6">
            <img
              src={currentCard.image}
              alt={currentCard.term}
              className="w-full h-48 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleStar}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              currentCard.starred
                ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <HiStar className="w-5 h-5" />
            <span className="hidden sm:inline">
              {currentCard.starred ? "Đã Yêu Thích" : "Yêu Thích"}
            </span>
          </button>

          <button
            onClick={handleLearned}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              currentCard.learned
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {currentCard.learned ? "✓ Đã Học" : "Chưa Học"}
          </button>
        </div>

        {/* Review Level Selection - Radio Style (Horizontal) */}
        <div className="mb-6">
          <p className="text-gray-700 font-medium mb-3">Đánh giá mức độ nhớ:</p>
          <div className="grid grid-cols-3 gap-2">
            {/* Khó Nhớ */}
            <button
              onClick={() => setSelectedDifficulty("hard")}
              className={`flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg border-2 transition ${
                selectedDifficulty === "hard"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-white hover:border-red-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedDifficulty === "hard"
                    ? "border-red-500 bg-red-500"
                    : "border-gray-300"
                }`}
              >
                {selectedDifficulty === "hard" && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <span className="text-center text-sm font-medium text-gray-800">
                🔴 Khó Nhớ
              </span>
            </button>

            {/* Bình Thường */}
            <button
              onClick={() => setSelectedDifficulty("medium")}
              className={`flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg border-2 transition ${
                selectedDifficulty === "medium"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-200 bg-white hover:border-yellow-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedDifficulty === "medium"
                    ? "border-yellow-500 bg-yellow-500"
                    : "border-gray-300"
                }`}
              >
                {selectedDifficulty === "medium" && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <span className="text-center text-sm font-medium text-gray-800">
                🟡 Bình Thường
              </span>
            </button>

            {/* Đã Thuộc */}
            <button
              onClick={() => setSelectedDifficulty("easy")}
              className={`flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg border-2 transition ${
                selectedDifficulty === "easy"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white hover:border-green-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedDifficulty === "easy"
                    ? "border-green-500 bg-green-500"
                    : "border-gray-300"
                }`}
              >
                {selectedDifficulty === "easy" && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <span className="text-center text-sm font-medium text-gray-800">
                🟢 Đã Thuộc
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ← Trước
          </button>
          <button
            onClick={handleSubmitReview}
            disabled={!selectedDifficulty || reviewMutation.isPending || masterMutation.isPending}
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
          >
            {reviewMutation.isPending || masterMutation.isPending
              ? "Đang gửi..."
              : currentIndex === cards.length - 1
                ? "Hoàn Thành →"
                : "Tiếp Theo →"}
          </button>
        </div>
      </div>
    </div>
  );
};
