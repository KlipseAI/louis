---
id: decision-renaming-is-a-card-state
status: experimental
authority: normative
---

# DS-D-0050 이름 변경은 ProjectCard 의 상태다 — 없던 것은 코드가 아니라 Figma 였다

- Status: accepted (rollout 완료 2026-09-03)
- Date: 2026-09-03
- Owners: design system maintainer
- Affects: `component-project-card`, `governance-figma-component-authoring`,
  `decision-product-surface-denominator`, `decision-label-placement-is-an-axis`

## Context

제품 표면 원장의 작업 목록이 **「ProjectCard 확장(9:16 썸네일 · 제목 오버레이 · 인라인
이름변경 · 더보기)」**을 「화면을 하나씩 그리는 것보다 싼」 두 번째 항목으로 꼽는다. 닫힌다고
적힌 것은 히스토리 카드 그리드 **네 복제**다 — `AppHomeScene`(high) · `HighlightScene`(high) ·
`VideoEditScene`(high) · `NodeCanvasHomeScene`(medium).

**그래서 먼저 쟀다.** 앵커 `ae8fd627` 에서 네 벌을 전부 읽었고, **네 축 중 셋은 이미 열려
있었으며 하나는 전제가 틀렸다.**

### 실측 1 — 「9:16」은 이 카드가 아니다

| 자리 | 선언 |
| --- | --- |
| `AppHomeScene.tsx:1127` | `aspectRatio: "1 / 1"` |
| `HighlightScene.tsx:1294` | `aspectRatio: "1 / 1"` |
| `VideoEditScene.tsx:761` | `aspectRatio: "1 / 1"` |
| `NodeCanvasHomeScene.tsx:1480` | `aspectRatio: "1 / 1"` |

네 벌이 전수 정사각이고, 그 값은 정본의 기본값(`--louis-project-card-aspect-ratio: 1`)과
같다. 9:16 은 이 그리드가 아니라 애널리틱스의 인기 콘텐츠 목록과 `ContentTable` 의 영상 셀에
있다 — 원장의 다른 항목이고 이 카드의 축이 아니다. **비율 축은 이미 `aspectRatio` prop 으로
열려 있고, 열어야 할 이유도 없다.**

### 실측 2 — 정본 채택은 이미 세 벌이다

| 벌 | 프레임 | 제목 띠 | 더보기 | 모서리 슬롯 |
| --- | --- | --- | --- | --- |
| 앱 홈 (`appHomeSceneStyles.ts:18`) | `louis-project-card` | 정본 | 정본 | 앵커라 얹지 않음(사유 기록됨) |
| 노드캔버스 홈 (`NodeCanvasHomeScene.tsx:261`) | `louis-project-card` | 정본 | 정본 | 앵커라 얹지 않음 |
| 하이라이트 허브 (`highlightSceneStyles.ts:721`) | `louis-project-card` | 정본 | 정본 | **정본**(`:946`, top-start 상태 칩) |
| 비디오 에디터 허브 (`VideoEditScene.tsx:224`) | **자체** | 자체 | 자체(`:298`) | 자체(`:271`) |

제목 오버레이와 더보기는 **CSS·React·Figma 셋 다에 이미 서 있다.** 넷째 벌만 정본을 하나도
물지 않는데, 그 반경은 `rounded-12` 로 정본 `radius-card`(12)와 **같다** — 값이 갈린 것이
아니라 채택이 안 된 것이고, 그것은 제품 쪽 작업이다.

### 실측 3 — 남은 하나: 이름 변경은 Figma 에 **부품 자체가 없었다**

`ProjectCardRename` 은 `project-card.tsx` 의 public export 이고 `project-card.css` 가 그 규칙을
갖는다. 그런데 Figma `ProjectCard` 의 자손은 여덟이고(`Media` · `Thumbnail` · `Title overlay` ·
`Eyebrow` · `Title` · `Meta` · `Action` · `Adornment`) **그중 이름 변경 자리는 없다.** 계약도
`moreSize`·`moreRadius` 는 갖는데 rename 은 갖지 않았다.

즉 **[DS-D-0028](DS-D-0028-three-in-one-change.md)(세 곳 동시)이 이 부품에서는 지켜지지 않은
채로 게이트가 초록이었다.** 계약이 선언하지 않은 자손만 실패로 잡고, 코드에 있는데 Figma 에
없는 부품은 아무도 세지 않기 때문이다.

### 실측 4 — 그 상자의 크롬이 제품에서 둘로 갈린다

| 벌 | 정본 채택 | 반경 | 밑줄 |
| --- | --- | ---: | --- |
| 앱 홈 (`appHomeSceneStyles.ts:340`) | `louis-project-card-rename` | **2** | 없음 |
| 노드캔버스 홈 (`NodeCanvasHomeScene.tsx:398`) | `louis-project-card-rename` | **2** | 없음 |
| 하이라이트 허브 (`highlightSceneStyles.ts:1036`) | **얹지 않는다** | 0 | `border-bottom: 1px solid palette-gray-400` (다크 `gray-500`) |
| 비디오 에디터 허브 (`VideoEditScene.tsx:395`) | 얹지 않는다(프레임부터 자체) | 0 | 같은 선언 |

두 쌍이 각각 글자 그대로 같고, **정본의 반경 8(`radius-control-sm`)을 쓰는 벌은 하나도
없다.** 하이라이트의 비채택 사유는 제품 주석에 낱말 그대로 있다 — 「정본의 `border: 0` 과
`border-radius: 8`(밑줄 끝이 말려 올라간다)을 둘 다 되돌려야 한다」.

## Decision

1. **새 컴포넌트를 세우지 않는다.** 이름 변경은 ProjectCard 의 한 상태다.
2. **Figma `ProjectCard` 의 `State` 축에 `Renaming` 을 더하고, 그 변형에 `Rename` 부품을
   세운다.** 변형 2 → 3.
3. **`Rename` 은 제목 텍스트를 감싸는 크롬 없는 상자다.** 테두리도 면도 두지 않는다 — CSS 가
   그렇고, 계약이 대조하는 값은 반경 하나뿐이다.
4. **밑줄 크롬 축(`Chrome: bare | underline`)은 이번에 열지 않는다.** 사유는 아래 §「닫지
   않은 것」에 있다.
5. **반경 8 을 제품 쪽 2 나 0 으로 옮기지 않는다.** [DS-D-0025](DS-D-0025-figma-as-projection.md)
   대로 Figma 는 코드를 비추고, 코드와 제품의 어긋남은 제품 픽셀을 움직일 수 있는 사람의
   판정이다.

### 왜 축이 아니라 상태인가

[DS-D-0040](DS-D-0040-state-is-a-variant-axis.md)의 시험을 그대로 적용한다 — **골격이 다르면
별 표면, 같으면 상태다.** 이름을 바꾸는 동안 카드에서 달라지는 것은 제목 한 줄이 `<span>` 에서
`<input>` 으로 바뀌는 것 하나뿐이다. 미디어 면 · 띠의 높이 비율 · 여백 16 · 줄 간격 4 ·
헤어라인 · 클릭 타깃 · 모서리 슬롯이 전부 그대로이고, **띠의 높이(107.7)와 세 줄의 폭(327)이
실측에서 바뀌지 않았다.** 갈라 세우면 그 계약을 통째로 복제한다.

그리고 그것이 **`State` 인 이유**는 이 축이 이미 그 종류를 담고 있기 때문이다. `Hover` 가
여기 사는 사유가 「Figma 에는 CSS 상태가 없으므로 variant 로 둔다」이고, 이름 변경도 CSS 가
판정하는 상태다 — 호출부가 `ProjectCardTitle` 대신 `ProjectCardRename` 을 그리는 순간이다.
[DS-D-0049](DS-D-0049-label-placement-is-an-axis.md)가 「떠 있는가」에 새 축을 만들지 않고
`State` 에 맡긴 것과 같은 판단이다.

### 왜 `figmaOnly` 인가

코드에 `ProjectCardRename` 이 실재하지만 그것은 **부품이지 variant prop 이 아니다.** 카드의
타입 alias 에서 읽어 낼 축이 없으므로 `variantProperties` 로 등재할 수 없고,
[DS-D-0041](DS-D-0041-dialog-tone-axis.md) Consequences 가 못 박은 「코드에 대응이 없는 축」의
자리에 둔다. DS-D-0049 의 `LabelBehavior` 가 반대 사례다 — 그쪽은 유니온 타입이 실재해서
`variantProperties` 였다.

## Alternatives

- **`RenamingProjectCard` 를 따로 세운다.** 버리는 이유는 위 §「축이 아니라 상태인가」 그대로다.
  51 계약이 52 가 되고 기하가 두 곳에서 정의된다.
- **아무것도 하지 않는다 — 코드에 있으니 됐다고 본다.** 이것이 지금까지의 상태이고, 그 결과가
  「시안에서는 카드에 이름을 바꾸는 자리가 있다는 사실 자체를 볼 수 없다」였다. `Hover` 를
  더한 2026-08-26 소유자 지적과 **같은 형태의 결손**이다.
- **`Rename` 에 초점 링(1px stroke)까지 그린다.** 상태 이름이 `Renaming` 이니 포커스가 든
  모습이 맞아 보인다. 버리는 이유가 둘이다 — CSS 의 링은 `:focus-visible` 에만 뜨는 별개
  조건이고, Figma 에 stroke 를 얹으면 되읽기의 `strokeWeight` 집합이 `[0.5]` 에서 `[0.5, 1]` 로
  늘어 **헤어라인 계약이 깨진다**(`strokes.self` 가 0.5 하나여야 한다).
- **밑줄 크롬을 이번에 함께 연다.** 실측이 2/4 로 뒷받침한다. 버리는 이유는 아래에 있다.

## Consequences

- ProjectCard 변형이 2 → 3. 조합 예산에 걸리지 않는다.
- 계약이 `renameRadius: 8` 을 갖고 되읽기의 `parts.Rename.cornerRadius` 와 대조한다. **부품이 한
  변형에만 있어도 대조된다** — 되읽기가 값을 배열로 모으고 세 변형이 같은 `base` 키에 담기기
  때문이며, 길이 1 이 곧 「세 변형이 합의했다」는 뜻이다.
- `textStyleExempt` 의 셈이 3×2=6 에서 3×3=9 로 는다. `Renaming` 변형이 세 텍스트를 전부
  그대로 갖기 때문이고, 그 가정(`parts.length × variants`)이 이번에는 깨지지 않았다 —
  DS-D-0049 가 남긴 한계는 그대로 열려 있다.
- **원장을 옮기지 않는다.** 네 항목은 카드가 아니라 **화면**이고, 사유가 카드 말고도 배너
  캐러셀 · 그리드 레이아웃 · 섹션 eyebrow · 빈 상태 · 확인 모달 · 토스트 · 업로드 카드 ·
  테마 드롭다운을 함께 든다. 카드 하나로 넷이 닫히지 않는다.

## Rollout and verification

**2026-09-03 에 세 곳이 함께 들어갔다**(DS-D-0028). 이번에는 **LOUIS 코드가 이미 옳았고**
Figma 와 계약이 따라오지 않은 쪽이었다.

1. **LOUIS** — 변경 없음. `ProjectCardRename` 과 `.louis-project-card-rename` 이 이미 계약대로
   있었다. 이 결정이 옮긴 것은 그 사실을 **비추는 쪽**이다.
2. **Figma** — `State=Default` 를 복제해 `State=Renaming` 을 세우고, 제목 띠 안의 `Title`
   텍스트를 크롬 없는 `Rename` 프레임(반경 8 · fill 없음 · stroke 없음)으로 감쌌다.
3. **계약** — `figma/components.measured.json` 에 `renameRadius`, 채취 명세에 `Rename`,
   parity 의 `parts` 와 `State.options` 에 각각 한 줄.

되읽기 실측: `overflowingParts` 비었고 `rawFills` 0 · `rawStrokes` 0 · `strokeWeight` `[0.5]` ·
`childOrder` `["Media","Action","Adornment"]` 그대로. 띠 높이 107.7 · 세 줄 폭 327 · 여백 16 ·
간격 4 가 **바뀌지 않았다** — 상태를 더해도 기하가 움직이지 않았다는 뜻이고, 그것이 이 판정이
「축이 아니라 상태」라고 말한 근거의 사후 확인이다.

### 이 작업이 드러낸 것 — 이 결정이 부른 것이 아니다

1. **`clone()` 이 TEXT 의 component property reference 를 조용히 버린다.** 복제한 변형의
   `Eyebrow`·`Title`·`Meta` 가 `componentPropertyReferences` 를 잃어 세 TEXT prop 이 그 변형에
   닿지 않았다. 되읽기는 **set 의 정의만** 담고 노드별 참조는 담지 않으므로 **어느 게이트도
   잡지 못한다.** 손으로 되돌렸고, 이 문단이 그 사실을 갖는다.
2. **Figma 의 `Adornment` 는 두 뜻을 겸하고 있고 자리도 틀렸다.** 이름은 공개 API 의 모서리
   슬롯(`ProjectCardAdornment`)인데 치수는 더보기 버튼(`moreSize` 32)이고 — 계약 주석이 그
   합침을 2026-08-30 에 적어 두었다 — 세 변형 모두 프레임 좌상단 `(0, 0)` 에 앉아 있다. CSS 는
   `inset-block-start`·`inset-inline-end` 를 `space-control-sm`(8)로 두어 **오른쪽 위**에
   붙인다. 계약이 `width`·`height` 만 보므로 초록이다. 고치지 않았다 — 슬롯과 버튼을 가르는
   일이 함께 걸려 이 결정의 범위 밖이다.

### 이 결정이 닫지 않은 것

- **원장 넷은 그대로 `needed` 다.** 위 Consequences 에 사유가 있다. 카드가 닫혀도 남는 것은
  그리드 여백과 빈 상태뿐이라던 작업 목록의 문장은 **실측과 다르다** — 넷의 사유가 드는 부품이
  그보다 많다.
- **밑줄 크롬 축.** 실측이 2/4 로 뒷받침하고 형태도 상태가 아니라 고르는 것이라 축이 맞는데,
  여는 데 **색 판정이 하나 걸린다.** 제품의 밑줄은 라이트 `palette-gray-400`(139 142 147) ·
  다크 `gray-500`(114 117 123)이고, LOUIS 의 stroke 토큰 중 이 쌍과 맞는 것이 없다 —
  `stroke-default` 는 라이트가 다르고(165 168 173) `stroke-strong` 은 라이트·다크가 같은 값
  하나다. 새 semantic 토큰을 세우는 일은 Figma 변수까지 함께 움직이므로 축 하나를 여는 값보다
  크고, 무엇보다 **어느 쌍이 정본인지를 이 저장소가 고를 수 없다**(위 Decision 5 와 같은 이유).
- **반경 8 의 소비처가 제품에 없다.** 정본이 `radius-control-sm` 을 쓰는데 네 벌이 2 · 2 ·
  0 · 0 이다. 이 컴포넌트의 머리말이 「값은 DS 가 정한 것이 아니라 제품 정본을 옮긴 것」이라고
  적으므로 이것은 그 원칙과 어긋난 자리이고, 옮기려면 2 냐 0 이냐를 먼저 정해야 한다.
- **비디오 에디터 허브의 정본 채택.** 넷째 벌만 프레임부터 자체 구현이고 반경은 이미 같다.
  제품 쪽 작업이라 여기서 하지 않는다.
