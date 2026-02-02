import { useState, useMemo } from "react";
import {
  HiArrowLeft,
  HiCheckCircle,
  HiExclamationCircle,
  HiSpeakerphone,
} from "react-icons/hi";

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
  answer: string; // Definition để user so sánh với term
  metadata: {
    isTrueAnswer: boolean; // Đáp án đúng
    correctDefinition: string;
    questionType: string;
  };
}

interface FillInTheBlankQuestion {
  id: string;
  term: string;
  definition: string;
  question: string;
  correctAnswer: string;
  options: string[];
  type: "fill-in-the-blank";
}

interface MatchingTerm {
  id: string;
  text: string;
  original: string;
}

interface MatchingDefinition {
  id: string;
  text: string;
  isDistractor: boolean;
  original: string;
  correctTermId?: string;
}

interface MatchingCorrectMatch {
  termId: string;
  definitionId: string;
}

interface MatchingQuestion {
  id?: string; // Optional id for consistency
  type: "matching";
  instruction: string;
  terms: MatchingTerm[];
  definitions: MatchingDefinition[];
  correctMatches: MatchingCorrectMatch[];
  settings?: {
    timeLimit?: number;
    showHint?: boolean;
    allowRetry?: boolean;
  };
}

interface TestDataContent {
  multipleChoice?: MultipleChoiceQuestion[];
  written?: WrittenQuestion[];
  trueOrFalse?: TrueOrFalseQuestion[];
  fillInTheBlank?: FillInTheBlankQuestion[];
  matching?: MatchingQuestion;
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

type Question =
  | MultipleChoiceQuestion
  | WrittenQuestion
  | TrueOrFalseQuestion
  | FillInTheBlankQuestion
  | MatchingQuestion;

interface QuestionWithType {
  question: Question;
  type:
    | "multipleChoice"
    | "written"
    | "trueOrFalse"
    | "fillInTheBlank"
    | "matching";
}

// Fisher-Yates shuffle algorithm for proper randomization
const fisherYatesShuffle = <T,>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const handleSpeak = (text: string, lang: string = "en-US") => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Get available voices and random select one for variety
    const voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
      // Filter voices by language
      const langVoices = voices.filter((voice) =>
        voice.lang.startsWith(lang.split("-")[0]),
      );

      // Use filtered voices if available, otherwise use all
      const voicesToUse = langVoices.length > 0 ? langVoices : voices;

      // Random select a voice each time for variety
      const randomVoice =
        voicesToUse[Math.floor(Math.random() * voicesToUse.length)];
      utterance.voice = randomVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
};

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

    testData.fillInTheBlank?.forEach((q) => {
      questions.push({ question: q, type: "fillInTheBlank" });
    });

    // Add matching question if exists
    if (testData.matching) {
      questions.push({ question: testData.matching, type: "matching" });
    }

    // Shuffle questions using Fisher-Yates algorithm
    return fisherYatesShuffle(questions);
  }, [testData]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [matchingAnswers, setMatchingAnswers] = useState<
    Record<string, string>
  >({}); // termId -> definitionId

  const currentQuestionData = allQuestions[currentIndex];
  const progress = ((currentIndex + 1) / allQuestions.length) * 100;
  const currentAnswer = answers.find((a) => {
    if (currentQuestionData?.type === "matching") {
      // For matching, we use the question type as identifier
      return a.questionId.startsWith("matching-");
    }
    return a.questionId === currentQuestionData?.question.id;
  });

  // Guard check
  if (!currentQuestionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
          <p className="text-gray-600 mb-4">Không có câu hỏi nào</p>
          <button
            onClick={onBack}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Quay Lại
          </button>
        </div>
      </div>
    );
  }

  const { question, type } = currentQuestionData;

  const handleSelectAnswer = (answer: string | boolean) => {
    // For matching questions, we use term-based IDs
    const questionId = type === "matching" ? "matching-multiple" : question.id;
    const newAnswers = answers.filter((a) => a.questionId !== questionId);

    let correctAnswer: string | boolean = "";

    if (type === "multipleChoice") {
      // Lấy từ definition (phải là text của đáp án đúng)
      correctAnswer = (question as MultipleChoiceQuestion).definition;
      console.log(
        "✓ MultipleChoice - correctAnswer:",
        correctAnswer,
        "userAnswer:",
        answer,
      );
    } else if (type === "written") {
      // Lấy từ definition (text trả lời đúng) - normalize cho so sánh không phân biệt hoa/thường
      const rawAnswer = (question as WrittenQuestion).term;
      // Trim whitespace và convert lowercase để so sánh linh hoạt
      correctAnswer = rawAnswer.toLowerCase().trim();
      answer =
        typeof answer === "string" ? answer.toLowerCase().trim() : answer;
      console.log(
        "✓ Written - correctAnswer (normalized):",
        correctAnswer,
        "userAnswer (normalized):",
        answer,
      );
    } else if (type === "trueOrFalse") {
      // TrueOrFalse: lấy đáp án đúng từ metadata.isTrueAnswer (boolean)
      const q = question as TrueOrFalseQuestion;
      correctAnswer = q.metadata.isTrueAnswer;
      console.log(
        "✓ TrueOrFalse - term:",
        q.term,
        "answer:",
        q.answer,
        "correctAnswer (from metadata):",
        correctAnswer,
        "userAnswer:",
        answer,
      );
    } else if (type === "fillInTheBlank") {
      // FillInTheBlank: lấy correctAnswer từ question
      const q = question as FillInTheBlankQuestion;
      correctAnswer = q.correctAnswer;
      console.log(
        "✓ FillInTheBlank - correctAnswer:",
        correctAnswer,
        "userAnswer:",
        answer,
      );
    }

    newAnswers.push({
      questionId: questionId ?? "unknown",
      userAnswer: answer,
      correctAnswer,
    });

    setAnswers(newAnswers);
  };

  const handleNext = () => {
    // For matching question, process all matches before moving to next
    if (currentQuestionData?.type === "matching") {
      const matching = currentQuestionData.question as MatchingQuestion;

      // Create answers for each match
      matching.terms.forEach((term) => {
        const selectedDefId = matchingAnswers[term.id];
        const correctMatch = matching.correctMatches.find(
          (m) => m.termId === term.id,
        );

        answers.push({
          questionId: term.id,
          userAnswer: selectedDefId || "not-selected",
          correctAnswer: correctMatch?.definitionId || "no-match",
        });
      });

      setAnswers(answers);
    }

    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // Reset matching answers for next matching question
      if (currentQuestionData?.type === "matching") {
        setMatchingAnswers({});
      }
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
      (a) => a.userAnswer === a.correctAnswer,
    ).length;
    const score = Math.round((correctCount / answers.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white shadow-sm sticky top-0 z-10 p-4 rounded-lg mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition cursor-pointer"
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
              {score >= 80
                ? "Tuyệt Vời!"
                : score >= 60
                  ? "Khá Tốt!"
                  : "Cố Gắng Thêm!"}
            </h2>

            <div className="bg-blue-50 rounded-lg p-6 my-6">
              <p className="text-5xl font-bold text-blue-600 mb-2">{score}%</p>
              <p className="text-gray-600">
                Bạn trả lời đúng {correctCount}/{answers.length} câu
              </p>
            </div>

            {/* Answer Review */}
            <div className="text-left mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Chi tiết câu trả lời:
              </h3>
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
                                Câu trả lời của bạn:{" "}
                                <span className="font-medium">
                                  {answer.userAnswer}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600">
                                Câu trả lời đúng:{" "}
                                <span className="font-medium text-green-600">
                                  {answer.correctAnswer}
                                </span>
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
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition cursor-pointer"
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
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition cursor-pointer"
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
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                type === "multipleChoice"
                  ? "bg-blue-100 text-blue-800"
                  : type === "written"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-green-100 text-green-800"
              }`}
            >
              {type === "multipleChoice"
                ? "Chọn Đáp Án"
                : type === "written"
                  ? "Viết Câu Trả Lời"
                  : "True/False"}
            </span>
          </div>

          {/* <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        {type === "matching"
                            ? (question as MatchingQuestion).instruction
                            : (question as Exclude<Question, MatchingQuestion>).term}
                    </h2> */}

          {/* Question Type: Multiple Choice */}
          {type === "multipleChoice" && (
            <div className="space-y-3">
              <p className="text-2xl font-bold text-gray-900 leading-tight mb-6">
                {(question as MultipleChoiceQuestion).term}
              </p>
              {(question as MultipleChoiceQuestion).answers.map(
                (answer, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(answer)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition cursor-pointer ${
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
                      <span className="font-medium text-gray-800">
                        {answer}
                      </span>
                    </div>
                  </button>
                ),
              )}
            </div>
          )}

          {/* Question Type: Written */}
          {type === "written" && (
            <div>
              <div className="flex gap-3 mb-6 items-center">
                <button
                  onClick={() =>
                    handleSpeak((question as WrittenQuestion).term)
                  }
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition font-medium cursor-pointer"
                >
                  <HiSpeakerphone className="w-5 h-5" />
                  Phát Âm
                </button>
                <p className="text-gray-600 text-sm">
                  Nhấn nút để nghe câu hỏi
                </p>
              </div>
              <input
                type="text"
                defaultValue={
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

          {/* Question Type: Fill in the Blank */}
          {type === "fillInTheBlank" && (
            <div>
              <p className="text-gray-600 text-sm mb-4">Điền vào chỗ trống:</p>
              <p className="text-lg font-semibold text-gray-800 mb-6 leading-relaxed">
                {(question as FillInTheBlankQuestion).question}
              </p>

              <div className="space-y-3">
                {(question as FillInTheBlankQuestion).options.map(
                  (option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(option)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition cursor-pointer ${
                        currentAnswer?.userAnswer === option
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            currentAnswer?.userAnswer === option
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {currentAnswer?.userAnswer === option && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-medium text-gray-800">
                          {option}
                        </span>
                      </div>
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Question Type: Matching */}
          {type === "matching" && (
            <div>
              <p className="text-gray-600 text-sm mb-6">
                {(question as MatchingQuestion).instruction}
              </p>

              <div className="space-y-4">
                {(question as MatchingQuestion).terms.map((term) => (
                  <div key={term.id} className="border rounded-lg p-4">
                    <p className="font-medium text-gray-800 mb-3">
                      {term.text}
                    </p>
                    <select
                      value={matchingAnswers[term.id] || ""}
                      onChange={(e) =>
                        setMatchingAnswers({
                          ...matchingAnswers,
                          [term.id]: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn định nghĩa --</option>
                      {(question as MatchingQuestion).definitions.map((def) => (
                        <option key={def.id} value={def.id}>
                          {def.text}
                          {def.isDistractor ? " (ghi chú)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question Type: True or False */}
          {type === "trueOrFalse" && (
            <div>
              {/* Statement to evaluate - combine term + answer (definition) */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm mb-2">
                  Phát biểu (dịch nghĩa):
                </p>
                <p className="text-lg font-semibold text-gray-800 leading-relaxed">
                  <p className="text-gray-600 text-sm mb-6">
                    {(question as TrueOrFalseQuestion).term}
                  </p>
                  {(question as TrueOrFalseQuestion).answer && (
                    <span className="block text-base font-normal text-gray-700 mt-2">
                      {(question as TrueOrFalseQuestion).answer}
                    </span>
                  )}
                </p>
                <p className="text-gray-500 text-xs mt-3">Chọn Đúng hoặc Sai</p>
              </div>

              {/* True/False buttons */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Đúng", value: true },
                  { label: "Sai", value: false },
                ].map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => handleSelectAnswer(value)}
                    className={`p-4 rounded-lg border-2 font-medium text-lg transition cursor-pointer ${
                      currentAnswer?.userAnswer === value
                        ? label === "Đúng"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-300 hover:border-gray-400 text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            ← Trước
          </button>
          <button
            onClick={handleNext}
            disabled={
              type === "matching"
                ? Object.keys(matchingAnswers).length === 0
                : !currentAnswer ||
                  (type === "written" &&
                    typeof currentAnswer?.userAnswer === "string" &&
                    currentAnswer.userAnswer.trim() === "")
            }
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {currentIndex === allQuestions.length - 1
              ? "Hoàn Thành →"
              : "Tiếp →"}
          </button>
        </div>
      </div>
    </div>
  );
};
