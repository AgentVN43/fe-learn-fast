import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useStudySet, useLearnCards, useTestCards } from "../../hooks/useStudySet";
import { useInitProgress, useProgress, useProgressStats } from "../../hooks/useProgress";
import { useNeedReviewCards, shuffleArray } from "../../hooks/useNeedReviewCards";
import { StudySetDetail } from "../../components/StudySetDetail";
import { FlashcardLearner } from "../../components/FlashcardLearner";
import { TestMode } from "../../components/TestMode";
import { ReflexMode } from "../../components/ReflexMode";
import type { StudySet } from "../../types";

type ViewMode = "detail" | "learn" | "test" | "reflex";

export default function StudySetDetailPage() {
  console.log("=== StudySetDetailPage RENDER ===");

  const [viewMode, setViewMode] = useState<ViewMode>("detail");
  const [shuffledFlashcards, setShuffledFlashcards] = useState<any[]>([]);
  const hasShuffledRef = useRef(false);
  const { studySetId } = useParams<{ studySetId: string }>();

  // Progress hooks
  const initProgressMutation = useInitProgress();
  const {
    data: progressData,
    isLoading: progressLoading,
    error: progressError,
  } = useProgress(studySetId);
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useProgressStats(studySetId);

  // Reset viewMode when studySetId changes to ensure clean state
  useEffect(() => {
    console.log("=== StudySetDetailPage studySetId changed ===", studySetId);
    setViewMode("detail");
    hasShuffledRef.current = false;
  }, [studySetId]);

  useEffect(() => {
    console.log("=== StudySetDetailPage MOUNTED ===");
    return () => console.log("=== StudySetDetailPage UNMOUNTED ===");
  }, []);

  // Debug logs
  useEffect(() => {
    console.log("🔍 Progress Data:", {
      progressData,
      progressLoading,
      progressError: progressError?.message,
    });
  }, [progressData, progressLoading, progressError]);

  useEffect(() => {
    console.log("🔍 Stats Data:", {
      statsData,
      statsLoading,
      statsError: statsError?.message,
    });
  }, [statsData, statsLoading, statsError]);

  // Fetch StudySet details
  const {
    data: studySetData,
    isLoading: detailLoading,
    error: detailError,
  } = useStudySet(studySetId);

  // Fetch Learn cards (optimized for learning mode)
  const {
    data: learnData,
    isLoading: learnLoading,
    error: learnError,
  } = useLearnCards(studySetId);

  // Extract all flashcards from learnData
  const allFlashcards = Array.isArray((learnData as any)?.data)
    ? (learnData as any).data
    : Array.isArray(learnData)
      ? (learnData as any)
      : [];

  // Get progress data
  const {
    data: progressDataResponse,
  } = useProgress(studySetId);
  const progressList = Array.isArray((progressDataResponse as any)?.data)
    ? (progressDataResponse as any).data
    : [];

  // Hook: Lọc thẻ cần học (chưa học, hoặc đã quá hạn ôn)
  const needReviewCards = useNeedReviewCards(allFlashcards, progressList);

  // Shuffle when ENTERING learn mode (only once per session)
  useEffect(() => {
    console.log("📊 Shuffle Effect - viewMode:", viewMode, "hasShuffled:", hasShuffledRef.current, "needReviewCards:", needReviewCards.length, "allFlashcards:", allFlashcards.length);
    
    if (viewMode === "learn" && !hasShuffledRef.current) {
      console.log("✓ Condition met: entering learn mode for first time");
      
      // Mark as shuffled FIRST to prevent re-running
      hasShuffledRef.current = true;

      // Fallback: nếu needReviewCards rỗng nhưng allFlashcards có data, dùng allFlashcards
      const cardsToShuffle = needReviewCards.length > 0 ? needReviewCards : allFlashcards;

      if (cardsToShuffle.length > 0) {
        console.log(
          "🔄 Entering learn mode, shuffling",
          cardsToShuffle.length,
          "cards (from",
          needReviewCards.length > 0 ? "needReviewCards" : "allFlashcards",
          ")"
        );
        const shuffled = shuffleArray(cardsToShuffle);
        console.log("✅ Shuffled result:", shuffled.map((c: any) => c.term));
        setShuffledFlashcards(shuffled);
      } else {
        console.log("⚠️ No cards to shuffle!");
        setShuffledFlashcards([]);
      }
    }
  }, [viewMode, needReviewCards, allFlashcards]);

  // Clear shuffle when leaving learn mode
  useEffect(() => {
    if (viewMode !== "learn") {
      setShuffledFlashcards([]);
      hasShuffledRef.current = false;
    }
  }, [viewMode]);

  // Fetch Test cards (optimized for test mode)
  const {
    data: testData,
    isLoading: testLoading,
    error: testError,
  } = useTestCards(studySetId, viewMode === "test");

  // Log mutation state (MUST be before any conditional returns)
  useEffect(() => {
    if (initProgressMutation.isLoading) {
      console.log("⏳ Init progress loading...");
    }
    if (initProgressMutation.isError) {
      console.error("❌ Init progress error:", initProgressMutation.error);
    }
  }, [initProgressMutation.isLoading, initProgressMutation.isError, initProgressMutation.error]);

  // Check invalid ID (after all hooks)
  if (!studySetId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
          <p className="text-gray-600 mb-4">ID không hợp lệ</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            Quay Lại
          </button>
        </div>
      </div>
    );
  }

  console.log("✓ Params extracted:", { studySetId });

  const isLoading = detailLoading || learnLoading;
  const error = detailError || learnError;

  console.log("Query state:", {
    detailLoading,
    learnLoading,
    detailError: detailError?.message,
    learnError: learnError?.message,
    hasDetail: !!studySetData,
    hasLearn: !!learnData,
  });

  // Loading state
  if (isLoading) {
    console.log("=== LOADING STATE ===");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.log("=== ERROR STATE ===", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
          <p className="text-red-600 font-medium mb-4">
            {(error as Error).message}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            Quay Lại
          </button>
        </div>
      </div>
    );
  }

  // Extract data
  const studySet = studySetData?.data as StudySet | undefined;
  const learnCards = Array.isArray((learnData as any)?.data)
    ? (learnData as any).data
    : Array.isArray(learnData)
      ? (learnData as any)
      : [];

  console.log("=== DATA STATE ===", {
    studySet,
    learnCardsCount: learnCards.length,
  });

  // Not found state
  if (!studySet) {
    console.log("=== NOT FOUND STATE ===");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy bộ học tập</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            Quay Lại
          </button>
        </div>
      </div>
    );
  }

  const handleBackToDetail = () => {
    setViewMode("detail");
  };

  // Handle learn mode entry - init progress
  const handleLearnClick = async () => {
    try {
      console.log("🚀 Initializing progress for study set:", studySetId);
      const result = await initProgressMutation.mutateAsync(studySetId);
      console.log("✅ Progress initialized:", result);
      setViewMode("learn");
    } catch (error) {
      console.error("❌ Failed to init progress:", error);
      // Still allow learn mode even if init fails
      setViewMode("learn");
    }
  };

  // Render based on view mode
  if (viewMode === "learn") {
    const cardsToUse = shuffledFlashcards.length > 0 ? shuffledFlashcards : learnCards;
    console.log("🎯 Rendering FlashcardLearner with:", {
      shuffledLength: shuffledFlashcards.length,
      learnCardsLength: learnCards.length,
      usingShuffled: shuffledFlashcards.length > 0,
      cardsToUse: cardsToUse.slice(0, 3).map((c: any) => c.term),
    });
    return (
      <FlashcardLearner
        flashcards={cardsToUse}
        title={studySet.title}
        onBack={handleBackToDetail}
        studySetId={studySetId}
      />
    );
  }

  if (viewMode === "test") {
    // Test loading state
    if (testLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang chuẩn bị bài kiểm tra...</p>
          </div>
        </div>
      );
    }

    // Test error state
    if (testError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
            <p className="text-red-600 font-medium mb-4">
              {(testError as Error).message}
            </p>
            <button
              onClick={handleBackToDetail}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              Quay Lại
            </button>
          </div>
        </div>
      );
    }

    // Test data extraction
    const testDataContent = (testData as any)?.data || {};

    return (
      <TestMode
        testData={testDataContent}
        title={studySet.title}
        onBack={handleBackToDetail}
      />
    );
  }

  if (viewMode === "reflex") {
    return (
      <ReflexMode
        flashcards={learnCards}
        title={studySet.title}
        studySetId={studySetId}
        onBack={handleBackToDetail}
      />
    );
  }

  // Detail view
  console.log("=== RENDERING StudySetDetail ===");
  return (
    <StudySetDetail
      studySet={studySet}
      flashcards={learnCards}
      stats={statsData?.stats}
      onBack={() => window.history.back()}
      onLearnClick={handleLearnClick}
      onTestClick={() => setViewMode("test")}
      onReflexClick={() => setViewMode("reflex")}
    />
  );
}
