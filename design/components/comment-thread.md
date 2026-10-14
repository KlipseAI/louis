---
id: comment-thread
status: experimental
authority: normative
summary: 글 아래에 댓글 제목, 쓰기 폼, 댓글 목록을 한 묶음으로 놓습니다.
---

# Comment Thread

글 아래 댓글 묶음이다 — 제목, 쓰기 폼, 댓글 목록 · 빈 줄(`.louis-comment-thread`,
[DS-D-0113](../governance/decisions/DS-D-0113-comment-thread.md)). 제품 정본은 블로그 글의 `components/blog/BlogComments.tsx`(통합 판 `54b62a8aa`)다.
**짓기가 아니라 수렴이다** — 입력은 [Text Field](text-field.md), 오류는 [Form Message](form-message.md), 제출은 [Button](button.md), 삭제는
[Bare Button](bare-button.md) 이다. 레시피는 묶음의 흐름과 댓글 한 줄의 조판만 갖는다. 폼 면은 [Copy Panel](copy-panel.md) 과 같은 면 사다리다.

```html
<section class="louis-comment-thread" aria-labelledby="comments-title">
  <h2 class="louis-comment-thread__title" id="comments-title">댓글 2</h2>
  <form class="louis-comment-thread__form">
    <div class="louis-text-field louis-comment-thread__name">
      <label class="louis-text-field__label louis-visually-hidden" for="c-name">이름</label>
      <div class="louis-text-field__box"><input class="louis-text-field__control" id="c-name" placeholder="이름 (비우면 익명)"></div>
    </div>
    <div class="louis-text-field louis-comment-thread__body" data-multiline="true">
      <label class="louis-text-field__label louis-visually-hidden" for="c-body">댓글</label>
      <div class="louis-text-field__box"><textarea class="louis-text-field__control" id="c-body" rows="3"></textarea></div>
    </div>
    <p class="louis-form-message" data-tone="error" role="alert">댓글 내용을 입력해 주세요.</p>
    <div class="louis-comment-thread__form-foot">
      <button class="louis-button" data-variant="primary" type="submit">댓글 등록</button>
    </div>
  </form>
  <ul class="louis-comment-thread__list">
    <li class="louis-comment-thread__item">
      <div class="louis-comment-thread__item-head">
        <span class="louis-comment-thread__author">익명</span>
        <time class="louis-comment-thread__date" datetime="2026-10-14">2026.10.14</time>
        <button class="louis-bare-button louis-comment-thread__delete" type="button">삭제</button>
      </div>
      <p class="louis-comment-thread__content">본문</p>
    </li>
    <!-- 댓글이 없으면: <li class="louis-comment-thread__empty">첫 댓글을 남겨보세요.</li> -->
  </ul>
</section>
```

| 부분 | 값 |
| --- | --- |
| 제목 | body-lg semibold · `fg-primary` · 아래 20 |
| 폼 | 4% 면(`landing-panel`) · 선 1 `gray-000-alpha-08` · 반경 16 · 안쪽 20 · 사이 12 · 아래 24 |
| 이름 | Text Field lg · 폭 `min(240px, 100%)` |
| 본문 | Text Field lg 여러 줄 판(첨부 · 툴바 없음) · 최소 높이 96 · 세로로만 늘림 |
| 제출 줄 | 오른쪽 정렬, Button primary |
| 댓글 줄 | 위 헤어라인 · 위아래 16 |
| 머리 | 사이 8 · 아래 4 — 작성자 body-sm medium `fg-primary`, 날짜 caption `fg-tertiary`(고정폭 숫자), 삭제 caption `fg-danger-on-surface` · 누름 자리 24 · 오른쪽 끝 |
| 본문 | body-md · `landing-text-soft` · 줄바꿈 그대로 |
| 빈 줄 | 위 헤어라인 · 위아래 24 · 가운데 · body-sm `fg-tertiary` |

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/comment-thread.css`. React 표면은 없다 — 소비처가 클래스를 물면 된다 |
| Figma         | `done`        | 2026-10-15 — `CommentThread`(제목 + 폼 + 목록) · `CommentForm`(BOOLEAN Error) · `CommentItem`(BOOLEAN Deletable) · `CommentEmpty`. 입력은 TextField · 오류 FormMessage · 제출 Button 인스턴스. 기하 계약 · 실측 기록 · 브라우저 되재기가 섰다(DS-D-0035) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| `__form` | `<form>` | 쓰기 폼 면 |
| `__name` · `__body` | Text Field 루트에 얹는다 | 이름 폭 · 본문 높이 |
| `__item` · `__empty` | `<li>` | 댓글 한 줄 · 빈 줄. 둘은 함께 서지 않는다 |
| `__delete` | Bare Button | 관리자에게만 |

## States

| 상태 | 그림 |
| --- | --- |
| 쓰는 중 | Text Field 의 상태 그대로 |
| 오류 | 폼 안에 Form Message error 한 줄(본문 아래) |
| 등록 중 | Button 이 disabled · 라벨 「등록 중…」(소비처) |
| 삭제 중 | 삭제 버튼 disabled(불투명도 0.4) |
| 빈 목록 | 빈 줄 하나 |

## Content

- 제목은 「댓글」 + 개수. 빈 줄은 첫 댓글을 부르는 한 문장.
- 날짜는 `YYYY.MM.DD`. 시각은 적지 않는다.

## Accessibility

- 입력 둘은 시각적으로 감춘 `<label>` 을 갖는다 — placeholder 는 이름이 아니다(제품은 이름이 없었다).
- 오류는 `role="alert"` 로 읽힌다. 허니팟 입력은 `aria-hidden` · `tabindex="-1"` 로 소비처가 숨긴다.
- 대비(실브라우저 실측, 랜딩 바닥 위): 날짜 라이트 6.44 · 다크 6.39, 삭제 라이트 6.08 · 다크 7.82, 빈 줄 라이트 6.44 · 다크 6.39, 본문 라이트 6.69 · 다크 10.13.

## Acceptance tests

`packages/react/test/comment-thread.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다 — 폼 면 안쪽 20 · 반경 16 · 사이 12 · 선 1,
이름 폭 240 · 입력 높이 40, 본문 최소 96, 제출 줄 오른쪽, 댓글 줄 위아래 16 · 머리 사이 8 · 아래 4, 삭제 누름 자리 24 이상 · 오른쪽 끝,
빈 줄 위아래 24 · 가운데, 두 테마에서 날짜 · 삭제 · 빈 줄 · 본문 대비 4.5:1 이상. `packages/react/test/comment-thread-geometry.browser.test.tsx` 가
기록 `comment-thread-form` · `comment-thread-item` · `comment-thread-empty` 를 되잰다.

## Known deviations

1. **값 여럿을 사다리로 접었다** — 입력 38 → 40, 폼 반경 14 → 16 · 안쪽 18 → 20 · 사이 10 → 12 · 아래 28 → 24, 댓글 줄 18 → 16 · 머리 10 → 8 ·
   6 → 4(DS-D-0113 판정 2 ~ 4).
2. **본문은 Text Field 여러 줄 판에서 첨부 · 툴바를 뺀 것이다** — 맨 Textarea 정본은 아직 없다(text-field.md Known deviations).

## 제품에서 발견한 것

- 입력 둘에 이름이 없다(placeholder 만) — 화면 읽기 프로그램이 빈 편집 칸으로 읽는다.
- 날짜 · 빈 줄 40% 잉크와 빨강 삭제 · 오류가 라이트 랜딩 면에서 4.5:1 에 못 미친다.
