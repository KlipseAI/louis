---
id: prompt-variant
status: experimental
authority: normative
summary: AI 프롬프트 후보 하나 — 스타일 이름 + 프롬프트 본문. 노드 안 후보 카드와 비교 모달의 열이 같이 쓴다.
---

# Prompt Variant

텍스트 노드가 AI 로 만든 프롬프트 후보 하나다 — 노란 스타일 이름과 프롬프트 본문(`.louis-prompt-variant`,
[DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md), [DS-D-0083](../governance/decisions/DS-D-0083-deck-feedback-triage.md) 2c).
같은 어휘가 두 자리에 선다.

- **후보 카드**(`data-layout="card"`, 기본) — 노드의 응답 칸([Node Shell](node-shell.md) `__response[data-state="filled"]`) 안에 둘이
  쌓인다. 누르면 비교 모달이 열린다. 선택이 아니라 여는 버튼이라 [Choice Card](choice-card.md)가 아니다.
- **비교 열**(`data-layout="column"`) — 비교 모달의 본문 한 칸. 두 열이 `.louis-prompt-variant-grid` 로 나란히 서고 각 열 맨 아래에
  「이 프롬프트 사용」 버튼(`__action`)이 선다. 모달 셸은 [Dialog](dialog.md) `data-size="compare"`(880, 발 없는 대화)가 갖는다.

```html
<!-- 노드 응답 칸 안 — 누르면 비교 모달이 열린다 -->
<button type="button" class="louis-prompt-variant" aria-haspopup="dialog">
  <span class="louis-prompt-variant__head">
    <span class="louis-prompt-variant__style">시네마틱</span>
    <svg class="louis-prompt-variant__expand" viewBox="0 0 16 16" aria-hidden="true">…</svg>
  </span>
  <span class="louis-prompt-variant__text">해 질 녘 옥상, 역광 속 실루엣…</span>
</button>

<!-- 비교 모달 본문 — dialog[data-size="compare"] 의 __body 안 -->
<div class="louis-prompt-variant-grid">
  <div class="louis-prompt-variant" data-layout="column" role="group" aria-labelledby="pv-1-style">
    <div class="louis-prompt-variant__head">
      <span class="louis-prompt-variant__style" id="pv-1-style">시네마틱</span>
    </div>
    <div class="louis-prompt-variant__body">
      <span class="louis-prompt-variant__label">프롬프트</span>
      <p class="louis-prompt-variant__text">해 질 녘 옥상, 역광 속 실루엣…</p>
    </div>
    <button type="button" class="louis-prompt-variant__action">이 프롬프트 사용</button>
  </div>
  <!-- 둘째 열 -->
</div>
```

| 부분 | 값 |
| --- | --- |
| 카드 | 여백 10 · 간격 6 · 반경 10 · 테두리 1 `gray-000-alpha-12` · 면 `gray-000-alpha-04`. 호버(호버 기기만) 테두리 `-28` · 면 `-08`. 카드끼리 8 |
| 머리 | 양끝 정렬 · 간격 6 |
| 스타일 이름 | caption medium · `node-text-response-foreground`(라이트 yellow-800 · 다크 yellow-600) |
| 펼침 글리프 | 16(`icon-size-sm`) · `gray-000-alpha-48` · 장식 |
| 본문(카드) | body-sm regular · `gray-000-alpha-80` · 줄바꿈 보존 · 세 줄에서 자름 |
| 열 | 여백 16(`space-control-lg`) · 반경 16(`radius-overlay`) · 같은 테두리 · 면. 머리 아래 12 |
| 이름 알약(열) | 위아래 4 · 좌우 10 · 알약 반경 · 면 `node-text-response-foreground` 16% |
| 본문 묶음(열) | 라벨 ↔ 본문 4 · 높이 상한 `min(52vh, 440px)` 넘치면 스크롤. 라벨 caption medium `gray-000-alpha-56`, 본문 body-sm regular `gray-000-alpha-88` |
| 사용 버튼 | 위 16 · 높이 40(`control-height-lg`) · 열 폭 · 반경 12(`radius-control`) · 면 `node-text-accent` · 글 body-sm medium `static-pure-black-alpha-88` · 호버 밝기 1.06 |
| 비교 격자 | 1fr 1fr · 간격 16. 719 이하에서 한 열 |

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/prompt-variant.css`. React 표면은 없다 — 소비처(텍스트 노드 · 비교 모달)가 클래스를 물면 된다 |
| Figma         | `done`      | PromptVariant — Layout(card · column) × State(Default · Hover), BOOLEAN Expand, TEXT Style · Prompt · Label · Action(2026-10-13). 펼침 글리프는 아이콘 세트에 대각 양방향 화살표가 없어 `icon/frame-corners` 로 대신했다. 기하 계약 · 실측 기록 · 브라우저 되재기가 섰다(DS-D-0035, 2026-10-14 done) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| `data-layout` | 없음 · `card`(기본) · `column` | 노드 안 후보 카드와 비교 모달의 열 |
| `__expand` | 있음 · 없음 | 카드의 펼침 글리프. 열에는 두지 않는다 |
| `__action` | 열에만 | 「이 프롬프트 사용」 버튼 |
| `.louis-prompt-variant-grid` | — | 두 열을 나란히 세우는 격자 |

## States

| 상태 | 그림 |
| --- | --- |
| 쉼(카드) | 회색 12% 테두리 · 4% 면 |
| 호버(카드) | 테두리 28% · 면 8% — 호버 기기에서만 |
| 긴 본문(카드) | 세 줄에서 잘린다. 전체는 비교 모달에서 본다 |
| 긴 본문(열) | 본문 묶음만 스크롤한다 — 머리와 사용 버튼은 제자리 |
| 호버(사용 버튼) | 밝기 1.06 — 호버 기기에서만 |

## Content

- 스타일 이름은 후보의 성격을 말하는 짧은 말이다(「시네마틱」 · 「미니멀」). 없으면 소비처가 순번(「1」)을 쓴다 — 제품과 같다.
- 본문은 프롬프트 그대로다. 줄바꿈을 지우지 않는다.
- 열의 라벨은 무엇을 보이는지(「프롬프트」), 버튼은 할 일(「이 프롬프트 사용」)이다.
- 카드 위 안내 글(「마음에 드는 스타일을 고르세요」 류)은 이 부품이 아니다 — 응답 칸의 내용이다.

## Accessibility

- 카드는 `button` 이고 비교 모달을 열므로 `aria-haspopup="dialog"` 를 단다. 이름은 내용(스타일 이름 + 본문)이 나른다.
- 펼침 글리프는 장식이다(`aria-hidden`).
- 열은 `role="group"` 과 `aria-labelledby`(스타일 이름)로 묶는다 — 두 열의 사용 버튼이 같은 글이라, 묶음 이름이 없으면 어느 후보를 쓰는지
  들리지 않는다.
- 포커스 링은 그리지 않는다([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)). 강제 색에서는 `base.css` 가 링을 그리고,
  사용 버튼은 면이 사라지므로 실선 윤곽을 되살린다.
- 대비(면 위, 두 테마): 스타일 이름 5.79 · 5.64, 이름 알약 4.82 · 5.01, 카드 본문 11.22 · 8.74, 열 라벨 4.77 · 5.65, 열 본문 14.82 · 11.84,
  펼침 글리프(그래픽) 3.59 · 4.20, 사용 버튼 글 9.96. 실브라우저 시험이 다시 잰다.

## Acceptance tests

`packages/react/test/prompt-variant.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다 —
카드의 여백 · 간격 · 반경 · 테두리, 카드끼리 8, 세 줄 자름, 열의 여백 · 반경 · 머리 아래 12 · 알약, 사용 버튼 높이 40 · 열 폭,
비교 격자 두 열, 그리고 두 테마에서 글 · 글리프의 대비(본문 글 4.5:1 · 글리프 3:1 이상). 레시피 선언은 빌드의 저작 게이트가 지킨다.

## Known deviations

1. **스타일 이름 잉크를 고쳤다.** 제품 `accent-yellow-600` 은 라이트 응답 면 위 1.97:1, 비교 알약 위 1.84:1 이다
   (`node-canvas-v2/nodes/TextNode.tsx:391` · `node-canvas-v2/components/PromptVariantCompareModal.tsx@54b62a8a:61`). 같은 노드 결과 글의
   `node-text-response-foreground`(라이트 yellow-800)로 옮겼다. 다크는 제품 그대로다.
2. **라이트 펼침 글리프 40% 와 열 라벨 48% 를 올렸다.** 각각 2.78:1(그래픽 3:1 미달, `TextNode.tsx:396`) · 3.62:1(글 4.5:1 미달,
   `PromptVariantCompareModal.tsx@54b62a8a:71`)이다. 48% · 56% 로 올렸고, 한 시맨틱 이름이 두 테마를 가져서 다크도 같은 수다(라벨 다크 48 → 56).
3. **라이트 카드 호버를 다크와 같게 접었다.** 제품 라이트는 테두리 24% · 면 4%(호버해도 면이 그대로)다(`TextNode.tsx:386`). 28% · 8% 하나로 둔다.
4. **사용 버튼의 면 · 반경 · 높이를 접었다.** 제품 면 yellow-600 · 반경 10 · 위아래 10(`PromptVariantCompareModal.tsx@54b62a8a:82-84`)을 텍스트 노드 액센트
   `node-text-accent`(yellow-500) · 버튼 반경 12 · 컨트롤 높이 40 으로 읽는다.
5. **펼침 글리프 13 을 16 으로**(`TextNode.tsx:693`, 아이콘 사다리 sm). 글리프 자체(대각 양방향 화살표)는 아이콘 세트에 아직 없다 —
   소비처가 제품 글리프를 넣는다.
6. **사다리 밖 값.** 카드 여백 10 · 간격 6 · 반경 10, 알약 좌우 10 은 제품 값 그대로다 — 반경 10 의 기존 이름(`radius-overlay-item` ·
   `radius-inspector-control`)은 다른 쓰임새라 빌리지 않았다. 열 라벨 ↔ 본문 5 는 4 로 접었다(`PromptVariantCompareModal.tsx@54b62a8a:69`).
7. **한 열로 접히는 폭 640 을 719 로**(`PromptVariantCompareModal.tsx@54b62a8a:48`) — LOUIS 의 모바일 경계와 같은 수다.
8. **모달 셸의 반경 24 는 이 부품이 아니다** — Dialog `compare` 가 유도값 20 으로 접었다([Dialog](dialog.md) 「넓은 판」).
