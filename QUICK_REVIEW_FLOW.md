# Quick Review Flow

## Overview
**Quick Review** là mode để ôn tập các thẻ **cần review ngay lập tức** (đã quá hạn lịch ôn tập).

Khác với:
- **Learn** (học tất cả thẻ trong bộ)
- **Test** (kiểm tra kiến thức)
- **Reflex** (phản xạ nhanh 3s)

---

## User Flow

### Step 1: Click "Ôn tập" Button
- Location: `StudySetDetail.tsx` (dòng 140-146)
- Props: `onReviewClick` callback
- Trigger: User click nút "Ôn tập"

```jsx
<button
  onClick={onReviewClick}
  className="flex items-center justify-center gap-2 bg-blue-500..."
>
  <HiPlay className="w-5 h-5" />
  <span>Ôn tập</span>
</button>
```

---

### Step 2: Fetch Quick Review Pool
**Parent Component** (StudySetDetailPage.tsx hoặc similar):
```typescript
const handleReviewClick = async () => {
  const { data } = await useQuickReviewPool(true);
  setViewMode("review");
  // data = thẻ cần ôn tập
};
```

**Hook**: `useQuickReviewPool()` (src/hooks/useQuickReviewPool.ts)
```typescript
const { data: reviewCards } = useQuickReviewPool(enabled);
```

---

### Step 3: Backend API Endpoint
**GET** `/progress/quick-review-pool`

**Query Params**: None (lấy từ auth token/user context)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "flashcard-progress-id",
      "userId": "user-id",
      "flashcardId": {
        "_id": "flashcard-id",
        "term": "Học",
        "definition": "To study",
        "image": null
      },
      "studySetId": "study-set-id",
      "isMastered": false,
      "nextReviewAt": "2025-01-25T10:00:00Z",  // <- Past = needs review
      "interval": 3,
      "efactor": 2.5,
      "repetition": 2,
      "correctCount": 1,
      "incorrectCount": 0,
      "confidenceLevel": 70
    },
    ...
  ]
}
```

---

### Step 4: Backend Filter Logic (Pseudo-code)
```javascript
// Backend: GET /progress/quick-review-pool
exports.getQuickReviewPool = async (req, res) => {
  const userId = req.user.id;
  
  // 1. Lấy tất cả progress của user
  const allProgress = await Progress.find({ userId });
  
  // 2. Filter thẻ cần review
  const needReview = allProgress.filter(p => {
    // Bỏ qua thẻ đã thành thạo
    if (p.isMastered) return false;
    
    // Lấy thẻ chưa có lịch ôn
    if (!p.nextReviewAt) return true;
    
    // Lấy thẻ đã quá hạn ôn (nextReviewAt <= now)
    const now = new Date();
    return new Date(p.nextReviewAt) <= now;
  });
  
  // 3. Shuffle & limit
  const shuffled = needReview
    .sort(() => Math.random() - 0.5)
    .slice(0, 20);  // Max 20 thẻ
  
  // 4. Populate flashcard info
  const populated = await Progress.populate(shuffled, {
    path: "flashcardId",
    select: "term definition image"
  });
  
  res.json({ success: true, data: populated });
};
```

---

### Step 5: Render Review Component
**Component**: Any learning component (FlashcardLearner, ReflexMode, etc.)

```typescript
interface QuickReviewProps {
  cards: ProgressData[];  // từ quick-review-pool API
  onBack: () => void;
}
```

**Hiển thị**:
- Flashcard term & definition
- Learning options (Learn, Test, hoặc Reflex mode)

---

### Step 6: Submit Review
Khi user submit review từ quick review mode:

**API Call**:
```
POST /progress/:flashcardId/study-set/:studySetId/review
Body: { isCorrect, difficulty }
```

**Backend**:
- Áp dụng SM-2 algorithm
- Cập nhật `nextReviewAt`, `efactor`, `interval`
- Nếu `efactor` cao → `isMastered = true`

---

### Step 7: Auto-update Quick Pool
**React Query Cache Invalidation**:
```typescript
// useReviewFlashcard() hook
onSuccess: () => {
  queryClient.invalidateQueries({ 
    queryKey: ["quickReviewPool"] 
  });
}
```

**Effect**: Quick pool tự động re-fetch sau submit

---

## Key Differences vs Learn Mode

| Aspect | Learn | Quick Review |
|--------|-------|--------------|
| **Cards** | Tất cả thẻ trong bộ | Chỉ thẻ quá hạn |
| **API** | GET /study-sets/:id | GET /progress/quick-review-pool |
| **Order** | Shuffle hoặc tuần tự | Shuffle từ quick pool |
| **Use Case** | Học bộ mới từ đầu | Ôn tập hàng ngày |
| **SM-2 Apply** | Nếu review được tracking | Luôn tracking |

---

## Files Involved

**Frontend**:
- `src/components/StudySetDetail.tsx` - Button "Ôn tập" (line 140-146)
- `src/hooks/useQuickReviewPool.ts` - Custom hook
- `src/services/progressService.ts` - API call `getQuickReviewPool()`

**Backend** (not included):
- `GET /progress/quick-review-pool` - Endpoint
- Filter + sort logic
- SM-2 after submit

---

## Testing Checklist

### ✅ Frontend
- [ ] Button "Ôn tập" click → trigger callback
- [ ] `useQuickReviewPool` fetch data
- [ ] Display review cards
- [ ] Submit review → invalidate cache

### ✅ Backend
- [ ] GET endpoint returns cards with nextReviewAt <= now
- [ ] Only include isMastered = false
- [ ] Populate flashcard info (term, definition, image)
- [ ] SM-2 apply on POST review
- [ ] nextReviewAt updated correctly

### ✅ Edge Cases
- [ ] No review needed → Show "Hoàn thành" message
- [ ] Network error → Retry logic
- [ ] Submit while offline → Queue & sync later (PWA)

