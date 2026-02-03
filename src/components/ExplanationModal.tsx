import { HiInformationCircle } from "react-icons/hi";
import { HiXMark } from "react-icons/hi2";

interface Explanation {
  grammar?: string;
  context?: string;
  example_expand?: string;
  analysis?: Array<{ key: string; note: string }>;
}

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  term: string;
  definition: string;
  explanation?: Explanation;
}

export const ExplanationModal = ({
  isOpen,
  onClose,
  term,
  definition,
  explanation,
}: ExplanationModalProps) => {
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
             {/* Grammar */}
             {explanation && explanation.grammar && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <HiInformationCircle className="w-4 h-4 text-blue-600" />
                  Ngữ Pháp
                </h3>
                <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3">
                  {explanation.grammar}
                </p>
              </div>
            )}

            {/* Context */}
            {explanation && explanation.context && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <HiInformationCircle className="w-4 h-4 text-purple-600" />
                  Ngữ Cảnh
                </h3>
                <p className="text-sm text-gray-700 bg-purple-50 rounded-lg p-3">
                  {explanation.context}
                </p>
              </div>
            )}

            {/* Example Expand */}
            {explanation && explanation.example_expand && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <HiInformationCircle className="w-4 h-4 text-green-600" />
                  Ví Dụ Mở Rộng
                </h3>
                <p className="text-sm text-gray-700 bg-green-50 rounded-lg p-3">
                  {explanation.example_expand}
                </p>
              </div>
            )}

            {/* Analysis */}
            {explanation && explanation.analysis && explanation.analysis.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <HiInformationCircle className="w-4 h-4 text-orange-600" />
                  Phân Tích
                </h3>
                <div className="space-y-2">
                  {explanation.analysis.map((item, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-orange-500 bg-orange-50 rounded-lg p-3"
                    >
                      <h4 className="text-sm font-semibold text-gray-900">
                        {item.key}
                      </h4>
                      <p className="text-sm text-gray-700 mt-1">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!explanation ||
              !explanation.grammar &&
              !explanation.context &&
              !explanation.example_expand &&
              (!explanation.analysis || explanation.analysis.length === 0)) && (
                <p className="text-center text-gray-500 py-8">
                  Chưa có giải thích chi tiết
                </p>
              )}
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
