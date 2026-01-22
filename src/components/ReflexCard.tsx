import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

// const ReflexCard = ({ card, onGrade }) => {
//   const [isRevealed, setIsRevealed] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(3); // 3 giây phản xạ

//   // Logic đếm ngược
//   useEffect(() => {
//     let timer;
//     if (!isRevealed && timeLeft > 0) {
//       timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
//     } else if (timeLeft === 0) {
//       setIsRevealed(true);
//     }
//     return () => clearInterval(timer);
//   }, [timeLeft, isRevealed]);

//   // Hàm highlight các placeholder [[...]]
//   const formatTemplate = (text) => {
//     const parts = text.split(/(\[\[.*?\]\])/g);
//     return parts.map((part, i) =>
//       part.startsWith("[[") ? (
//         <span key={i} className="text-blue-500 font-bold">
//           {part}
//         </span>
//       ) : (
//         part
//       ),
//     );
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-xl mx-auto p-6">
//       {/* Thanh Progress đếm ngược */}
//       <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
//         <motion.div
//           initial={{ width: "100%" }}
//           animate={{ width: isRevealed ? "100%" : "0%" }}
//           transition={{ duration: 3, ease: "linear" }}
//           className={`h-full ${timeLeft === 0 ? "bg-green-500" : "bg-red-500"}`}
//         />
//       </div>

//       <AnimatePresence mode="wait">
//         {!isRevealed ? (
//           <motion.div
//             key="question"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             className="text-center"
//           >
//             <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-4">
//               Dịch sang Tiếng Anh trong 3s:
//             </h2>
//             <p className="text-3xl font-medium text-gray-800 italic">
//               "{card.definition}"
//             </p>
//             <p className="mt-8 text-6xl font-bold text-red-500">{timeLeft}</p>
//           </motion.div>
//         ) : (
//           <motion.div
//             key="answer"
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="text-center w-full"
//           >
//             <h2 className="text-sm uppercase tracking-widest text-green-600 mb-4">
//               Kết quả:
//             </h2>
//             <p className="text-4xl font-bold text-gray-900 leading-tight mb-8">
//               {formatTemplate(card.term)}
//             </p>

//             {/* Nút đánh giá SRS */}
//             <div className="flex gap-4 justify-center mt-10">
//               <button
//                 onClick={() => onGrade("hard")}
//                 className="px-6 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
//               >
//                 Quên / Chậm (Hard)
//               </button>
//               <button
//                 onClick={() => onGrade("easy")}
//                 className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg"
//               >
//                 Phản xạ tốt (Easy)
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <p className="mt-12 text-gray-400 text-sm">Bấm Space để lật thẻ nhanh</p>
//     </div>
//   );
// };

// ReflexCard.tsx

// const ReflexCard = ({ card, onGrade }) => {
//   const [isRevealed, setIsRevealed] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(3);

//   useEffect(() => {
//     if (isRevealed) return; // Nếu đã lật thì không chạy timer nữa

//     if (timeLeft === 0) {
//       setIsRevealed(true);
//       return;
//     }

//     const timer = setInterval(() => {
//       setTimeLeft((prev) => prev - 1);
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [timeLeft, isRevealed]);

//   return (
//     <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto">
//       {/* Thanh Progress chạy lùi */}
//       <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
//         <motion.div
//           initial={{ width: "100%" }}
//           animate={{ width: isRevealed ? "100%" : "0%" }}
//           transition={{ duration: isRevealed ? 0.5 : 3, ease: "linear" }}
//           className={`h-full ${isRevealed ? "bg-green-500" : "bg-red-500"}`}
//         />
//       </div>

//       <AnimatePresence mode="wait">
//         {!isRevealed ? (
//           <motion.div
//             key="q"
//             exit={{ opacity: 0, scale: 0.8 }}
//             className="text-center"
//           >
//             <h2 className="text-gray-500 mb-4">Dịch trong 3s:</h2>
//             <p className="text-3xl font-bold">"{card.definition}"</p>
//             <div className="mt-8 text-6xl font-black text-red-500">
//               {timeLeft}
//             </div>
//           </motion.div>
//         ) : (
//           <motion.div
//             key="a"
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center"
//           >
//             <h2 className="text-green-600 mb-4">Kết quả:</h2>
//             <p className="text-4xl font-bold">{card.term}</p>

//             {/* Nút đánh giá */}
//             <div className="flex gap-4 mt-10 justify-center">
//               <button
//                 onClick={() => onGrade("hard")}
//                 className="px-6 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium"
//               >
//                 Quên (Hard)
//               </button>
//               <button
//                 onClick={() => onGrade("easy")}
//                 className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
//               >
//                 Thuộc (Easy)
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };
// export default ReflexCard;

const ReflexCard = ({ card, onGrade }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3); // 3 giây phản xạ

  // Logic đếm ngược
  useEffect(() => {
    let timer;
    if (!isRevealed && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRevealed(true);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isRevealed]);

  // Hàm highlight các placeholder [[...]]
  const formatTemplate = (text) => {
    const parts = text.split(/(\[\[.*?\]\])/g);
    return parts.map((part, i) =>
      part.startsWith("[[") ? (
        <span key={i} className="text-blue-500 font-bold">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-xl mx-auto p-6">
      {/* Thanh Progress đếm ngược */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: isRevealed ? "100%" : "0%" }}
          transition={{ duration: 3, ease: "linear" }}
          className={`h-full ${timeLeft === 0 ? "bg-green-500" : "bg-red-500"}`}
        />
      </div>

      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-4">
              Dịch sang Tiếng Anh trong 3s:
            </h2>
            <p className="text-3xl font-medium text-gray-800 italic">
              "{card.definition}"
            </p>
            <p className="mt-8 text-6xl font-bold text-red-500">{timeLeft}</p>
          </motion.div>
        ) : (
          <motion.div
            key="answer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center w-full"
          >
            <h2 className="text-sm uppercase tracking-widest text-green-600 mb-4">
              Kết quả:
            </h2>
            <p className="text-4xl font-bold text-gray-900 leading-tight mb-8">
              {formatTemplate(card.term)}
            </p>

            {/* Nút đánh giá SRS */}
            <div className="flex gap-4 justify-center mt-10">
              <button
                onClick={() => onGrade("hard")}
                className="px-6 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
              >
                Quên / Chậm (Hard)
              </button>
              <button
                onClick={() => onGrade("easy")}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg"
              >
                Phản xạ tốt (Easy)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-12 text-gray-400 text-sm">Bấm Space để lật thẻ nhanh</p>
    </div>
  );
};

export default ReflexCard;
