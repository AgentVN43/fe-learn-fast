import { useState } from "react";
import { folderService } from "../services/folderService";
import { HiXMark } from "react-icons/hi2";

interface ImportFlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studySetId: string;
  onSuccess?: () => void;
}

export const ImportFlashcardsModal = ({
  isOpen,
  onClose,
  studySetId,
  onSuccess,
}: ImportFlashcardsModalProps) => {
  const [textContent, setTextContent] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFlashcards = (text: string) => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const flashcards = lines.map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length !== 2) {
        throw new Error(
          `Dòng không hợp lệ: "${line}". Định dạng: "thuật ngữ | định nghĩa"`
        );
      }
      return {
        term: parts[0],
        definition: parts[1],
      };
    });

    return flashcards;
  };

  const handleImport = async () => {
    if (!textContent.trim()) {
      setError("Vui lòng nhập nội dung");
      return;
    }

    try {
      const flashcards = parseFlashcards(textContent);

      if (flashcards.length === 0) {
        setError("Không tìm thấy flashcard hợp lệ");
        return;
      }

      setIsImporting(true);
      setError(null);

      await folderService.importFlashcards(studySetId, flashcards);
      console.log("✅ Flashcards imported successfully");

      setTextContent("");
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi import flashcards");
      console.error("❌ Failed to import flashcards:", err);
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Import Thẻ Học</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội Dung (mỗi dòng: thuật ngữ - định nghĩa)
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder={`Ví dụ:
爸爸 - /bàba/ | bố
八 - /bā/ | tám
好 - /hǎo/ | tốt`}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
              disabled={isImporting}
            />
          </div>

          <div className="text-sm text-gray-600 mb-6 p-3 bg-blue-50 rounded-lg">
            <p className="font-semibold mb-2">Hướng dẫn định dạng:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Mỗi dòng là 1 flashcard</li>
              <li>Định dạng: <code className="bg-gray-200 px-1 rounded">thuật ngữ | định nghĩa</code></li>
              <li>Dấu <code className="bg-gray-200 px-1 rounded">|</code> (pipe) phân tách term và definition</li>
              <li>Dấu <code className="bg-gray-200 px-1 rounded">-</code> có thể dùng trong term hoặc definition</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            disabled={isImporting}
          >
            Hủy
          </button>
          <button
            onClick={handleImport}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:bg-gray-400"
            disabled={isImporting}
          >
            {isImporting ? "Đang import..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
};
