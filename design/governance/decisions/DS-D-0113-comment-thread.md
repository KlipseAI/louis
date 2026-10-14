---
id: decision-comment-thread
status: experimental
authority: normative
---

# DS-D-0113 블로그 댓글을 새 부품 `comment-thread` 로 수렴한다 — 입력은 Text Field, 오류는 Form Message, 제출은 Button, 레시피는 묶음과 한 줄만

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Affects: `comment-thread`, `text-field`, `form-message`, `button`, `bare-button`, `copy-panel`, `decision-product-parts-become-louis`

## Context

표면 원장의 `components/blog/BlogComments.tsx` 의 `BlogComments` 가 `needed` 로 남았다. 댓글 폼(이름 입력 · 텍스트에어리어 · 오류 문구 · 제출 버튼),
댓글 목록 줄(작성자 · 날짜 · 관리자 삭제 · 본문)과 빈 줄을 갖는다(통합 판 `54b62a8aa` 의 `COMMENT_*` 상수). 원장의 kindReason 은 「할 일은 짓기가
아니라 수렴」이라고 적었다 — 입력 둘은 Text Field 정본을 쓰지 않고 자기 테두리 · 포커스 색(primary 56%)을 직접 쓰는 별벌이다.

대비 미달이 셋이다(라이트 랜딩 면 위). 날짜 · 빈 줄 잉크 `gray-000` 40%(약 2.4), 삭제 `accent-red-500`(약 3.3). 오류 문구도 같은 빨강이다.
삭제 버튼의 누름 자리는 약 22 다.

## Decision

1. **새 부품 `comment-thread`**(`.louis-comment-thread` · `__title` · `__form` · `__name` · `__body` · `__form-foot` · `__list` · `__item` · `__item-head` ·
   `__author` · `__date` · `__delete` · `__content` · `__empty`). 레시피는 묶음의 흐름과 댓글 한 줄의 조판만 갖는다.
2. **입력은 [Text Field](../../components/text-field.md) lg** — 이름은 한 줄 판(폭 `min(240px, 100%)`), 본문은 여러 줄 판에서 첨부 줄 · 툴바를 뺀 것
   (최소 높이 96 · 세로로만 늘림). 라벨은 시각적으로 감춘 `<label>` 로 단다(제품은 placeholder 뿐이라 이름이 없다).
3. **오류는 [Form Message](../../components/form-message.md) `error`, 제출은 [Button](../../components/button.md) primary.** 삭제는
   [Bare Button](../../components/bare-button.md) 위에 `__delete`(caption · `fg-danger-on-surface` · 누름 자리 24).
4. **폼 면은 [Copy Panel](../../components/copy-panel.md) 과 같은 면 사다리** — 4% 면 · 8% 선 · 반경 16 · 안쪽 20 · 사이 12.
5. 새 토큰 · 새 의존성 · React 표면 없음.

### 소유자 판정 — 초안의 기본값으로 정했다

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 자리 | 새 부품 `comment-thread`(수렴 — 부분은 기존 부품) | 화면 조립(부품 없이 Text Field · Button 만) · EmptyState 로 빈 줄 |
| 2 | 입력 높이 38 | Text Field lg 40 으로 접는다 | 38 칸을 Text Field 에 연다 |
| 3 | 폼 면 값(반경 14 · 안쪽 18 · 사이 10) | Copy Panel 면 사다리(16 · 20 · 12)로 접는다 | 제품 값 리터럴 |
| 4 | 목록 줄 값(위아래 18 · 머리 사이 10 · 머리 아래 6 · 폼 아래 28) | 16 · 8 · 4 · 24 로 접는다 | 제품 값 리터럴 |
| 5 | 날짜 · 빈 줄 잉크 40% | `fg-tertiary` — 보이는 변화 | 제품 값 + Known deviation |
| 6 | 삭제 · 오류 빨강 | `fg-danger-on-surface`(Form Message error 와 같다) — 보이는 변화 | 제품 `accent-red-500` |
| 7 | 입력 라벨 | 시각적으로 감춘 `<label>` | `aria-label` · 보이는 라벨 |

## Consequences

- 제품 (나): `COMMENT_*` 상수를 `louis-comment-thread*` 와 Text Field · Form Message · Button 마크업으로. 보이는 변화 — 입력 높이 38 → 40,
  포커스 색이 Text Field 의 것, 날짜 · 빈 줄 · 삭제 잉크가 진해진다, 폼 반경 · 여백이 2 씩 커진다.
- Figma 에 `CommentThread` · `CommentForm`(BOOLEAN Error) · `CommentItem`(BOOLEAN Deletable) · `CommentEmpty` 가 선다.

## Rollback

`comment-thread.css` · 문서 · manifest 세 자리 · Figma 컴포넌트 넷 · 기록 · parity 계약을 지운다. 제품은 아직 이 클래스를 물지 않으므로 영향이 없다.
