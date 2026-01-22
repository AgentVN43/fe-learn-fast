# QC Checklist - Flashcard Shuffle Logic

## Test Scenario: 5 Thẻ Học

### Test 1: Lần Đầu Vào Learn
**Steps:**
1. Tạo bộ học 5 thẻ (hoặc dùng bộ cũ nếu chưa delete)
2. Click "Bắt Đầu Học"
3. Ghi nhận **thứ tự các thẻ** (VD: Thẻ A, B, C, D, E)

**Expected:**
- ✅ Console log: "🔄 Entering learn mode, shuffling 5 cards that need review"
- ✅ Console log: "✅ Cards shuffled: [term1, term2, ...]"
- ✅ Thẻ hiển thị theo thứ tự shuffle

**Kết quả:** _______

---

### Test 2: Quay Lại Detail, Vào Learn Lần 2
**Steps:**
1. Đang ở learn mode
2. Click "Quay Lại" (back)
3. Click "Bắt Đầu Học" lần nữa
4. Ghi nhận **thứ tự mới của thẻ**

**Expected:**
- ✅ Thứ tự mới KHÁC với lần 1 (random shuffle)
- ✅ Console log lại: "🔄 Entering learn mode, shuffling 5 cards..."
- ✅ hasShuffledRef được reset, cho phép shuffle lại

**Kết quả:** _______

---

### Test 3: Kiểm Tra Không Shuffle Lại Trong Session
**Steps:**
1. Ở learn mode
2. Click Hard → thẻ 2
3. Click Medium → thẻ 3
4. Quan sát console

**Expected:**
- ✅ KHÔNG có log "🔄 Entering learn mode" lần 2, 3
- ✅ Chỉ có: "✅ Review submitted successfully"
- ✅ Thẻ tiếp tục theo thứ tự shuffle từ lần đầu

**Kết quả:** _______

---

### Test 4: Verify hasShuffledRef Logic
**Steps:**
1. Open DevTools → Console
2. Enter learn mode
3. Kiểm tra window state (nếu có log)

**Expected:**
- ✅ hasShuffledRef.current = true (sau khi shuffle lần 1)
- ✅ hasShuffledRef.current = false (khi thoát learn mode)
- ✅ hasShuffledRef.current = true (khi vào learn mode lần 2)

**Kết quả:** _______

---

### Test 5: Admin-Created Cards (Null flashcardId)
**Steps:**
1. Dùng API admin tạo bộ học 5 thẻ
2. Vào learn mode

**Expected:**
- ✅ Không crash lỗi "Cannot read properties of null"
- ✅ ⚠️ Console warning: "Progress record có flashcardId null, bỏ qua"
- ✅ Shuffle thành công (các thẻ chưa học = needReview)
- ✅ Stats hiển thị đúng

**Kết quả:** _______

---

## Summary

| Test | Status | Note |
|------|--------|------|
| Test 1 | ⬜ |  |
| Test 2 | ⬜ |  |
| Test 3 | ⬜ |  |
| Test 4 | ⬜ |  |
| Test 5 | ⬜ |  |

**Overall:** ⬜ PASS / 🔴 FAIL

**Notes:**
_______________________________________
