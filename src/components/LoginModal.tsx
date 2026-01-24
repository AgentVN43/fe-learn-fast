import { useNavigate } from "react-router-dom";
import { HiX } from "react-icons/hi";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

export const LoginModal = ({
    isOpen,
    onClose,
    message = "Vui lòng đăng nhập để tiếp tục",
}: LoginModalProps) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogin = () => {
        navigate("/login");
    };

    const handleRegister = () => {
        navigate("/register");
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="float-right text-gray-400 hover:text-gray-600 transition"
                >
                    <HiX className="w-6 h-6" />
                </button>

                {/* Content */}
                <div className="mt-4">
                    <div className="text-5xl text-center mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                        Yêu Cầu Đăng Nhập
                    </h2>
                    <p className="text-gray-600 text-center mb-6">{message}</p>

                    {/* Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleLogin}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                        >
                            Đăng Nhập
                        </button>
                        <button
                            onClick={handleRegister}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition"
                        >
                            Tạo Tài Khoản Mới
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="w-full text-gray-600 hover:text-gray-900 font-medium py-2 transition"
                        >
                            Tiếp Tục Duyệt Mà Không Đăng Nhập
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
