// import { useState, useMemo } from "react";
// import { HiArrowLeft } from "react-icons/hi";
// import ReflexCard from "./ReflexCard";
// import type { Flashcard } from "../types";

// interface ReflexModeProps {
//   flashcards: Flashcard[]; // từ useLearnCards
//   title: string;
//   studySetId: string;
//   onBack: () => void;
// }

// export const ReflexMode = ({
//   flashcards,
//   title,
//   onBack,
// }: ReflexModeProps) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [stats, setStats] = useState({ correct: 0, wrong: 0 });

//   // Shuffle flashcards cho reflex mode
//   const cards = useMemo(() => {
//     if (!flashcards || flashcards.length === 0) return [];
//     return flashcards.sort(() => Math.random() - 0.5);
//   }, [flashcards]);

//   const currentCard = cards[currentIndex];
//   const progress = ((currentIndex + 1) / cards.length) * 100;
//   const isComplete = currentIndex >= cards.length;

//   // Handle grade (Easy = Correct / Hard = Wrong)
//   const handleGrade = (grade: "easy" | "hard") => {
//     if (grade === "easy") {
//       setStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
//     } else {
//       setStats((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
//     }

//     // Move to next card
//     // if (currentIndex < cards.length - 1) {
//     //   setCurrentIndex(currentIndex + 1);
//     // }
//     setCurrentIndex((prev) => prev + 1);
//   };

//   // No cards state
//   if (!cards || cards.length === 0) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
//           <p className="text-gray-600 mb-4">Không có thẻ để học phản xạ</p>
//           <button
//             onClick={onBack}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
//           >
//             Quay Lại
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Complete state
//   if (isComplete) {
//     const total = stats.correct + stats.wrong;
//     const percentage =
//       total > 0 ? Math.round((stats.correct / total) * 100) : 0;

//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center p-4">
//         <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center">
//           <div className="text-6xl mb-4">
//             {percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "💪"}
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">
//             {percentage >= 80
//               ? "Tuyệt Vời!"
//               : percentage >= 60
//                 ? "Khá Tốt!"
//                 : "Cố Gắng Thêm!"}
//           </h2>

//           <div className="bg-blue-50 rounded-lg p-6 mb-6">
//             <p className="text-5xl font-bold text-blue-600 mb-2">
//               {percentage}%
//             </p>
//             <p className="text-gray-600">
//               Phản xạ tốt: {stats.correct}/{total}
//             </p>
//           </div>

//           <button
//             onClick={onBack}
//             className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
//           >
//             Quay Lại
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm sticky top-0 z-10">
//         <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
//           <button
//             onClick={onBack}
//             className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition"
//           >
//             <HiArrowLeft className="w-5 h-5" />
//             <span className="hidden sm:inline">Quay Lại</span>
//           </button>

//           <div className="text-center flex-1">
//             <h1 className="text-lg font-bold text-gray-800 line-clamp-1">
//               {title} - Chế độ Phản Xạ
//             </h1>
//             <p className="text-xs text-gray-500">
//               {currentIndex + 1} / {cards.length}
//             </p>
//           </div>

//           <div className="text-sm font-medium text-gray-600">
//             ✓ {stats.correct}/{stats.correct + stats.wrong}
//           </div>
//         </div>

//         {/* Progress Bar */}
//         <div className="w-full h-1 bg-gray-200">
//           <div
//             className="h-full bg-blue-500 transition-all duration-300"
//             style={{ width: `${progress}%` }}
//           />
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
//         <div className="w-full max-w-2xl mx-auto px-4">
//           {!isComplete && currentCard && (
//             <ReflexCard
//               key={currentCard._id || currentIndex}
//               card={currentCard}
//               onGrade={handleGrade}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

import { useState, useMemo } from "react";
import { HiArrowLeft } from "react-icons/hi";
import ReflexCard from "./ReflexCard";
import type { Flashcard } from "../types";
import { useReviewFlashcard } from "../hooks/useProgress"; // Đảm bảo đúng đường dẫn hook của bạn

interface ReflexModeProps {
  flashcards: Flashcard[];
  title: string;
  studySetId: string;
  onBack: () => void;
}

export const ReflexMode = ({
  flashcards,
  studySetId,
  onBack,
}: ReflexModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });

  // 1. Tích hợp Mutation để lưu vào Database theo thuật toán SM-2
  const { mutate: submitReview } = useReviewFlashcard();

  const cards = useMemo(() => {
    if (!flashcards || flashcards.length === 0) return [];
    // Shuffle cards
    return [...flashcards].sort(() => Math.random() - 0.5);
  }, [flashcards]);

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;
  const isComplete = currentIndex >= cards.length;

  const handleGrade = (grade: "easy" | "hard") => {
    if (!currentCard) return;

    // 2. Gửi kết quả về Backend ngay khi bấm nút
    const flashcardId = currentCard.id || currentCard._id || "";
    if (!flashcardId) {
      console.error("❌ Flashcard ID không hợp lệ:", currentCard);
      return;
    }

    console.log("📤 Submitting review:", {
      flashcardId,
      studySetId,
      grade,
      card: { term: currentCard.term, _id: currentCard._id, id: currentCard.id },
    });

    submitReview({
      flashcardId,
      studySetId: studySetId,
      isCorrect: grade === "easy",
      difficulty: grade, // SM-2 sẽ dùng difficulty này để tính NextReview
    });

    // 3. Cập nhật stats hiển thị
    if (grade === "easy") {
      setStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setStats((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
    }

    // 4. Chuyển card tiếp theo
    setCurrentIndex((prev) => prev + 1);
  };

  // No cards state
  if (!cards || cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 mb-6">Không có dữ liệu thẻ để học phản xạ.</p>
          <button
            onClick={onBack}
            className="text-blue-500 font-medium hover:text-blue-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Complete state
  if (isComplete) {
    const total = stats.correct + stats.wrong;
    const percentage = total > 0 ? Math.round((stats.correct / total) * 100) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">{percentage >= 80 ? "🏆" : "🔥"}</div>
          <h2 className="text-2xl font-bold mb-2">Hoàn thành luyện tập!</h2>
          <p className="text-gray-500 mb-8">
            Dữ liệu đã được đồng bộ với lộ trình SRS của bạn.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 p-4 rounded-xl">
              <p className="text-green-600 font-bold text-2xl">{stats.correct}</p>
              <p className="text-green-700 text-xs uppercase tracking-wider">
                Phản xạ tốt
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl">
              <p className="text-red-600 font-bold text-2xl">{stats.wrong}</p>
              <p className="text-red-700 text-xs uppercase tracking-wider">
                Cần cải thiện
              </p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
          >
            TIẾP TỤC LỘ TRÌNH
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-500"
          >
            <HiArrowLeft className="w-5 h-5" /> Quay Lại
          </button>
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500">
              {currentIndex + 1} / {cards.length}
            </p>
          </div>
          <div className="text-sm font-medium text-green-600">
            ✓ {stats.correct}
          </div>
        </div>
        <div className="w-full h-1 bg-gray-200">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto px-4">
          {/* <ReflexCard
            key={currentCard._id}
            card={currentCard}
            onGrade={handleGrade}
          /> */}
          {!isComplete && currentCard && (
            <ReflexCard
              key={`${currentCard._id}-${currentIndex}`}
              card={currentCard}
              onGrade={handleGrade}
            />
          )}
        </div>
      </div>
    </div>
  );
};
