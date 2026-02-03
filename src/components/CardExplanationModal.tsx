import { HiXMark } from "react-icons/hi2";

interface CardExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  term: string;
  definition: string;
}

export const CardExplanationModal = ({
  isOpen,
  onClose,
  term,
  definition,
}: CardExplanationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{term}</h2>
            <p className="text-sm text-gray-600 mt-1">{definition}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-6">
            <p className="text-center text-gray-500 py-8">
              Không có giải thích chi tiết
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
