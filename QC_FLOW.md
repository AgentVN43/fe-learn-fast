# QC Flow - Study Set Learning

## Step 1: Init (Click "Học")

### 1.1 POST /progress/study-set/:studySetId/init
- **Hook**: `useInitProgress()` (src/hooks/useProgress.ts:4)
- **Service**: `progressService.initProgress(studySetId)` (src/services/progressService.ts:38)
- **Called**: StudySetDetailPage.tsx:290
- **Purpose**: Tạo progress record cho tất cả flashcard trong study set
- **Expected Response**: `{ success: boolean, data: [...] }`

**Caching**: Invalidate queries:
- `["progress", studySetId]`
- `["progressStats", studySetId]`

---

### 1.2 GET /progress/study-set/:studySetId
- **Hook**: `useProgress(studySetId)` (src/hooks/useProgress.ts:17)
- **Service**: `progressService.getProgress(studySetId)` (src/services/progressService.ts:45)
- **Purpose**: Lấy danh sách progress của tất cả flashcard
- **Data used in**: 
  - `useNeedReviewCards()` - Filter thẻ cần học (hooks/useNeedReviewCards.ts)
  - `shuffledFlashcards` - Shuffle thẻ cho learn mode

**Schema**:
```typescript
{
  success: boolean;
  data: ProgressData[] // id, flashcardId, isMastered, nextReviewAt, etc.
}
```

---

### 1.3 GET /progress/study-set/:studySetId/stats
- **Hook**: `useProgressStats(studySetId)` (src/hooks/useProgress.ts:28)
- **Service**: `progressService.getStats(studySetId)` (src/services/progressService.ts:53)
- **Purpose**: Lấy stats tổng hợp của study set
- **Displayed in**: StudySetDetail.tsx:92-108

**Schema**:
```typescript
{
  success: boolean;
  stats: {
    total: number;
    mastered: number;
    totalReviewed: number;
    needReview: number;
    averageConfidence: string;
    totalCorrect: number;
    totalIncorrect: number;
    totalReviews: number;
    accuracyRate: number;
  }
}
```

---

## Step 2: Review (Click easy/medium/hard mỗi thẻ)

### 2.1 POST /progress/:flashcardId/study-set/:studySetId/review
- **Hook**: `useReviewFlashcard()` (src/hooks/useProgress.ts:61)
- **Service**: `progressService.submitReview(flashcardId, studySetId, isCorrect, difficulty)` (src/services/progressService.ts:77)
- **Called**: FlashcardLearner.tsx:265
- **Purpose**: Ghi nhận review và áp dụng SM-2 algorithm

**Backend should update**:
- `interval` - Thời gian đến review tiếp theo (tính theo SM-2)
- `efactor` - Easiness factor (SM-2)
- `repetition` - Số lần review
- `nextReviewAt` - Timestamp review tiếp theo
- `isMastered` - true nếu efactor đủ cao
- `confidenceLevel` - Từ request difficulty
- `correctCount` / `incorrectCount`
- `lastReviewed` - Timestamp hiện tại

**Request body**:
```json
{
  "isCorrect": boolean,
  "difficulty": "easy" | "medium" | "hard"
}
```

**Caching**: Invalidate queries:
- `["progress", studySetId]`
- `["progressStats", studySetId]`

---

### 2.2 Automatic Refresh (khi next review)
- **Trigger**: `useNeedReviewCards()` filter cards với `nextReviewAt <= now`
- **Logic**: hooks/useNeedReviewCards.ts:51-83
- **Re-render**: FlashcardLearner automatically shows next card if available

**Filter logic**:
```javascript
const needReviewCards = cards.filter(card => {
  if (!progress) return true; // Chưa học
  if (progress.isMastered) return false; // Đã thành thạo
  if (!progress.nextReviewAt) return true; // Chưa có lịch
  
  const now = new Date();
  const nextReview = new Date(progress.nextReviewAt);
  return nextReview <= now; // Đã qua lịch ôn
});
```

---

## Architecture Overview

```
User clicks "Học"
       ↓
handleLearnClick() [StudySetDetailPage:282]
       ↓
initProgressMutation.mutateAsync(studySetId) [StudySetDetailPage:290]
       ↓
POST /progress/study-set/:studySetId/init
       ↓
Invalidate cache → re-fetch:
  - GET /progress/study-set/:studySetId [useProgress]
  - GET /progress/study-set/:studySetId/stats [useProgressStats]
       ↓
useNeedReviewCards() filter logic
       ↓
Render FlashcardLearner with shuffled cards
       ↓
User clicks easy/medium/hard
       ↓
handleReview() [FlashcardLearner:247]
       ↓
POST /progress/:flashcardId/study-set/:studySetId/review
       ↓
Invalidate cache → re-fetch progress
       ↓
useNeedReviewCards() re-filter → show next card
```

---

## Testing Checklist

### ✅ Init Flow
- [ ] POST init tạo progress cho tất cả flashcard
- [ ] GET progress trả về đúng số lượng records
- [ ] GET stats trả về đúng tổng hợp
- [ ] Cache invalidation hoạt động (query re-fetch)

### ✅ Review Flow
- [ ] POST review cập nhật `interval`, `efactor`, `nextReviewAt`
- [ ] `isMastered = true` khi efactor đủ cao
- [ ] Cache invalidation sau submit
- [ ] Next card load từ `useNeedReviewCards()` filter

### ✅ Edge Cases
- [ ] Flashcard không có progress → treat as "need review"
- [ ] Progress có `nextReviewAt` trong quá khứ → load next card
- [ ] Tất cả card mastered → show completion message
- [ ] Submit review mà flashcard bị xóa → handle error gracefully

---

## Files Involved

**Frontend**:
- `src/pages/study-sets/StudySetDetailPage.tsx` - Main flow
- `src/components/FlashcardLearner.tsx` - Review submission
- `src/hooks/useProgress.ts` - All progress hooks
- `src/hooks/useNeedReviewCards.ts` - Filter logic
- `src/services/progressService.ts` - API calls

**Backend** (not included, but referenced):
- `POST /progress/study-set/:studySetId/init` - Init progress
- `GET /progress/study-set/:studySetId` - List progress
- `GET /progress/study-set/:studySetId/stats` - Aggregated stats
- `POST /progress/:flashcardId/study-set/:studySetId/review` - Submit review + SM-2 algo

