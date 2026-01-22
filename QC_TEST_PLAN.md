# QC Test Plan - FlashcardLearner

## Setup
- Bộ học tập có **4 thẻ**
- Trạng thái: **Chưa học** (not mastered)

## Test Case 1: Học lần 1 - Đi qua 4 thẻ
| Thẻ | Nút Click | Kỳ Vọng | Kết Quả |
|-----|-----------|--------|--------|
| 1   | Hard      | → Thẻ 2 | ✅ PASS   |
| 2   | Medium    | → Thẻ 3 | ✅ PASS   |
| 3   | Easy      | → Thẻ 4, Mark mastered | ✅ PASS |
| 4   | Hard      | → Click next → Hoàn Thành | ✅ PASS |

## Test Case 2: Stats Update
- ✅ PASS - Stats cập nhật đúng:
  - "Đã Học" tăng lên
  - "Thành Thạo" tăng (khi click Easy)
  - "Độ Chính Xác" cập nhật đúng

## Test Case 3: Complete Screen
| Sự Kiện | Kỳ Vọng | Kết Quả |
|---------|--------|--------|
| Sau click next ở thẻ 4 | Hiển thị screen "Bạn đã học hết" | ✅ PASS |
| Bấm "Học Lại" | Reset về thẻ 1, clear mastered | (Pending) |
| Bấm "Quay Lại" | Về trang StudySetDetail | (Pending) |

## Test Case 4: Learn Mode Re-entry
- Quay lại Detail page
- Bấm "Bắt Đầu Học" lần 2:
  - Nếu 1 thẻ đã mastered → chỉ show 3 thẻ cần học
  - Nếu tất cả mastered → show "Bạn đã học hết" (Pending)

## Fixes Applied
✓ Line 91: Pass `cardId` vào mutation thay vì dùng `currentCard.id` từ closure
✓ Line 200: mutation.mutateAsync nhận `{ cardId, difficulty, isCorrect }`
✓ Line 99-107: reviewMutation.onSuccess gọi `handleNext()` để increment currentIndex
✓ Line 107: handleNext() thay đổi `currentIndex` ngay lập tức, `currentCard` được recalculate

## Console Logs để Monitor
- `🔄 Gửi review thẻ {id} - {difficulty} ({isCorrect})`
- `✅ Review submitted successfully`
- `✅ Thẻ được đánh dấu là đã thành thạo` (nếu click Easy)
