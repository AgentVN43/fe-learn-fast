import { useState, useMemo } from "react";
import { HiArrowLeft, HiCheckCircle, HiExclamationCircle } from "react-icons/hi";

interface MultipleChoiceQuestion {
  id: string;
  term: string;
  definition: string;
  answers: string[];
}

interface WrittenQuestion {
  id: string;
  term: string;
  definition: string;
}

interface TrueOrFalseQuestion {
  id: string;
  term: string;
  definition: string;
  answer: string;
}

interface TestDataContent {
  multipleChoice?: MultipleChoiceQuestion[];
  written?: WrittenQuestion[];
  trueOrFalse?: TrueOrFalseQuestion[];
}

interface TestModeProps {
  testData: TestDataContent;
  title: string;
  onBack: () => void;
}

interface Answer {
  questionId: string;
  userAnswer: string | boolean;
  correctAnswer: string | boolean;
}

type Question = MultipleChoiceQuestion | WrittenQuestion | TrueOrFalseQuestion;

interface QuestionWithType {
  question: Question;
  type: "multipleChoice" | "written" | "trueOrFalse";
}

export const TestMode = ({ testData, title, onBack }: TestModeProps) => {
  // Combine all questions
  const allQuestions: QuestionWithType[] = useMemo(() => {
    const questions: QuestionWithType[] = [];

    testData.multipleChoice?.forEach((q) => {
      questions.push({ question: q, type: "multipleChoice" });
    });

    testData.written?.forEach((q) => {
      questions.push({ question: q, type: "written" });
    });

    testData.trueOrFalse?.forEach((q) => {
      questions.push({ question: q, type: "trueOrFalse" });
    });

    // Shuffle questions
    return questions.sort(() => Math.random() - 0.5);
  }, [testData]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestionData = allQuestions[currentIndex];
  const progress = ((currentIndex + 1) / allQuestions.length) * 100;
  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestionData?.question.id
  );

  // Guard check
  if (!currentQuestionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
          <p className="text-gray-600 mb-4">Không có câu hỏi nào</p>
          <button
            onClick={onBack}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            Quay Lại
          </button>
        </div>
      </div>
    );
  }

  const { question, type } = currentQuestionData;

  const handleSelectAnswer = (answer: string | boolean) => {
    const newAnswers = answers.filter((a) => a.questionId !== question.id);

    let correctAnswer: string | boolean = "";
    if (type === "multipleChoice") {
      correctAnswer = (question as MultipleChoiceQuestion).definition;
    } else if (type === "written") {
      correctAnswer = (question as WrittenQuestion).definition;
    } else if (type === "trueOrFalse") {
      correctAnswer = (question as TrueOrFalseQuestion).answer;
    }

    newAnswers.push({
      questionId: question.id,
      userAnswer: answer,
      correctAnswer,
    });

    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Results screen
  if (isComplete) {
    const correctCount = answers.filter(
      (a) => a.userAnswer === a.correctAnswer
    ).length;
    const score = Math.round((correctCount / answers.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white shadow-sm sticky top-0 z-10 p-4 rounded-lg mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition"
            >
              <HiArrowLeft className="w-5 h-5" />
              <span>Quay Lại</span>
            </button>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">
              {score >= 80 ? "🎉" : score >= 60 ? "👍" : "💪"}
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {score >= 80 ? "Tuyệt Vời!" : score >= 60 ? "Khá Tốt!" : "Cố Gắng Thêm!"}
            </h2>

            <div className="bg-blue-50 rounded-lg p-6 my-6">
              <p className="text-5xl font-bold text-blue-600 mb-2">{score}%</p>
              <p className="text-gray-600">
                Bạn trả lời đúng {correctCount}/{answers.length} câu
              </p>
            </div>

            {/* Answer Review */}
            <div className="text-left mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Chi tiết câu trả lời:</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {answers.map((answer, idx) => {
                  const isCorrect = answer.userAnswer === answer.correctAnswer;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect
                          ? "bg-green-50 border-green-300"
                          : "bg-red-50 border-red-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                        ) : (
                          <HiExclamationCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            Câu {idx + 1}
                          </p>
                          {!isCorrect && (
                            <>
                              <p className="text-sm text-gray-600 mt-1">
                                Câu trả lời của bạn: <span className="font-medium">{answer.userAnswer}</span>
                              </p>
                              <p className="text-sm text-gray-600">
                                Câu trả lời đúng: <span className="font-medium text-green-600">{answer.correctAnswer}</span>
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Về Trang Chi Tiết
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test UI
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
              {currentIndex + 1} / {allQuestions.length}
            </p>
          </div>
          <div className="text-sm font-medium text-gray-600">
            {(() => {
              const answeredCount = answers.length;
              return `${answeredCount}/${allQuestions.length}`;
            })()}
          </div>
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
        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              type === "multipleChoice"
                ? "bg-blue-100 text-blue-800"
                : type === "written"
                ? "bg-purple-100 text-purple-800"
                : "bg-green-100 text-green-800"
            }`}>
              {type === "multipleChoice"
                ? "Chọn Đáp Án"
                : type === "written"
                ? "Viết Câu Trả Lời"
                : "Đúng/Sai"}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {question.term}
          </h2>

          {/* Question Type: Multiple Choice */}
          {type === "multipleChoice" && (
            <div className="space-y-3">
              {(question as MultipleChoiceQuestion).answers.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(answer)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition ${
                    currentAnswer?.userAnswer === answer
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        currentAnswer?.userAnswer === answer
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {currentAnswer?.userAnswer === answer && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="font-medium text-gray-800">{answer}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Question Type: Written */}
          {type === "written" && (
            <div>
              <input
                type="text"
                value={
                  typeof currentAnswer?.userAnswer === "string"
                    ? currentAnswer.userAnswer
                    : ""
                }
                onChange={(e) => handleSelectAnswer(e.target.value)}
                placeholder="Nhập câu trả lời của bạn"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}

          {/* Question Type: True or False */}
          {type === "trueOrFalse" && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Đúng", value: true },
                { label: "Sai", value: false },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => handleSelectAnswer(value)}
                  className={`p-4 rounded-lg border-2 font-medium transition ${
                    currentAnswer?.userAnswer === value
                      ? label === "Đúng"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ← Trước
          </button>
          <button
            onClick={handleNext}
            disabled={
              !currentAnswer ||
              (type === "written" &&
                typeof currentAnswer?.userAnswer === "string" &&
                currentAnswer.userAnswer.trim() === "")
            }
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {currentIndex === allQuestions.length - 1 ? "Kết Thúc →" : "Tiếp →"}
          </button>
        </div>
      </div>
    </div>
  );
};
