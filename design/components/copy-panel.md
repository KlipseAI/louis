---
id: copy-panel
status: experimental
authority: normative
summary: 제목과 복사 동작, 그대로 보여 줄 원문 한 덩이를 옅은 면에 담습니다.
---

# Copy Panel

복사할 원문 한 덩이를 제목 · 복사 동작과 함께 옅은 면에 담는다(`.louis-copy-panel`,
[DS-D-0110](../governance/decisions/DS-D-0110-copy-panel.md)). 제품 정본은 템플릿 상세의 프롬프트 상자다 —
`app/templates/[slug]/page.tsx` 의 `PROMPT_SECTION_CLASS` · `PROMPT_HEAD_CLASS` · `PROMPT_TITLE_CLASS` · `PROMPT_BOX_CLASS`(통합 판 `54b62a8aa`),
복사 버튼은 `components/templates/CopyPromptButton.tsx` 다. 그 화면의 글 머리는 [Section Header](section-header.md) `data-level="article"` 이고,
미리보기 배너는 [Alert](alert.md) 다.

```html
<section class="louis-copy-panel" aria-labelledby="prompt-title">
  <div class="louis-copy-panel__head">
    <h2 class="louis-copy-panel__title" id="prompt-title">프롬프트</h2>
    <button class="louis-button louis-copy-panel__action" data-variant="secondary" data-size="md" type="button" aria-live="polite">
      <svg class="louis-icon" aria-hidden="true"><!-- copy --></svg>
      프롬프트 복사
    </button>
  </div>
  <p class="louis-copy-panel__body">…원문…</p>
</section>
```

| 부분 | 값 |
| --- | --- |
| 면 | `landing-panel`(4%) · 선 1 `color-gray-000-alpha-08` · 반경 16(`radius-overlay`) · 안쪽 20(`space-media-inset`) |
| 세로 흐름 | 머리 → 원문, 사이 12(`space-stack-md`) |
| 머리 | 제목과 동작이 양끝 · 사이 12 · 가운데 맞춤. 719 이하에서 위아래로 쌓이고 왼쪽에 붙는다 |
| 제목 | body-lg semibold(20/30) · `fg-primary` |
| 동작 | [Button](button.md) secondary · md(높이 32), 앞 글리프 `copy` → 복사 뒤 `copy-check` |
| 원문 | body-md regular(16/24) · `landing-text-soft`(72%) · 줄바꿈과 공백을 그대로(`pre-wrap`) · 긴 낱말은 칸 안에서 끊는다 |

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/copy-panel.css`. React 표면은 없다 — 소비처가 클래스를 물면 된다 |
| Figma         | `done`      | 2026-10-15 — `CopyPanel` — Layout(base · compact), TEXT Title · Body, 동작은 Button 인스턴스. 면 · 선 · 반경 · 여백은 변수에 묶였다. 기하 계약 · 실측 기록 · 브라우저 되재기가 섰다(DS-D-0035) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| `__head` | 늘 있다 | 제목 · 동작 줄 |
| `__title` | `<h2>` 등 제목 요소 | 원문이 무엇인지. 면의 접근 이름(`aria-labelledby`)이 된다 |
| `__action` | Button | 복사. 동작이 없으면 요소를 뺀다 |
| `__body` | `<p>` · `<pre>` | 원문 |

## States

| 상태 | 그림 |
| --- | --- |
| 쉼 | 4% 면 · 8% 선 |
| 복사됨 | 동작의 글리프가 `copy-check`, 라벨이 「복사됨」으로 2초 바뀐다(소비처). 면은 그대로다 |
| 좁은 폭(≤719) | 머리가 위아래로 쌓인다 |

## Content

- 제목은 원문의 이름 하나(「프롬프트」). 문장으로 쓰지 않는다.
- 동작 라벨은 「○○ 복사」, 완료 라벨은 「복사됨」.
- 원문은 손대지 않는다 — 줄바꿈 · 공백이 그대로 보인다.

## Accessibility

- 면은 `<section aria-labelledby>` 로 제목을 이름으로 갖는다.
- 복사 결과는 버튼의 `aria-live="polite"` 가 읽는다(제품 그대로). 색만으로 완료를 말하지 않는다.
- 대비(실브라우저 실측, 랜딩 바닥 위 4% 면): 원문 라이트 6.43 · 다크 9.85, 제목 라이트 15.30 · 다크 18.97. 선 8% 는 장식이다(면 경계는 글자가 말한다) —
  강제 색에서는 선이 `CanvasText` 로 선다.

## Acceptance tests

`packages/react/test/copy-panel.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다 — 안쪽 20 · 반경 16 · 선 1 · 머리와 원문 사이 12,
제목 20/30 semibold · 원문 16/24 · `pre-wrap`, 머리 가로(1280) · 세로 쌓임(375), 동작이 줄지 않는 것, 두 테마에서 원문 · 제목 대비 4.5:1 이상.
`packages/react/test/copy-panel-geometry.browser.test.tsx` 가 기록 `copy-panel` 의 base · compact 를 레시피의 계산값으로 되잰다.

## Known deviations

1. **머리 쌓임 경계 640 → 719.** 제품 경계를 LOUIS compact 경계로 접었다 — 640 ~ 719 폭에서 머리가 쌓이는 보이는 변화(DS-D-0110 판정 3).
2. **긴 낱말 끊기를 `overflow-wrap: anywhere` 로 적었다** — 제품의 `word-break: break-word` 는 비표준 값이다. 렌더는 같다.

## 제품에서 발견한 것

- 제품 원문은 `<p>` 에 `[font-family:inherit]!` 를 걸어 전역 타입 클래스의 서체를 되돌렸다 — 레시피는 서체를 직접 적어 그 다툼이 없다.
