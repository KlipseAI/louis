---
id: media-slot
status: experimental
authority: normative
summary: 첨부 · 참조 미디어의 작은 썸네일 칸과 그 줄 — 노드 입력판 · 편집 노드 소스 · 만들기 화면 참조 칸이 같이 쓴다.
---

# Media Slot

입력에 붙은 그림 · 영상을 보여 주는 작은 칸이다(`.louis-media-slot`). 노드 입력판의 연결 이미지 줄, 편집 노드의 소스 줄,
영상 노드의 참조 영상, 만들기 화면의 참조 칸 셋이 같은 조형 — 테두리 1 · 반투명 면 · 덮어 그린 지우기 버튼 — 을 각자 들고
있던 것을 한 부품으로 모았다([DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md)).

```html
<div class="louis-media-slot-strip" data-layout="wrap">
  <div class="louis-media-slot">
    <img class="louis-media-slot__media" src="…" alt="참조 이미지 1">
    <button type="button" class="louis-media-slot__remove" aria-label="참조 이미지 1 빼기">
      <svg aria-hidden="true">…x…</svg>
    </button>
  </div>
  <div class="louis-media-slot" data-size="video">
    <video class="louis-media-slot__media" src="…#t=0.1" muted playsinline preload="metadata"></video>
  </div>
</div>

<div class="louis-media-slot-strip" data-layout="grid">
  <button type="button" class="louis-media-slot" data-size="fill" data-empty="true" aria-label="참조 더하기">
    <svg aria-hidden="true">…plus…</svg>
  </button>
</div>
```

| 부분 | 값 |
| --- | --- |
| 칸 `md`(기본) | 32 × 32 · 반경 `radius-card`(12) · 테두리 1 `media-slot-stroke` · 면 `media-slot-surface` |
| 칸 `video` | 76 × 52 · 반경 `radius-control-sm`(8) |
| 칸 `fill` | 열 폭 정사각 · 반경 12 |
| 지우기 | `media-scrim-dark` 56%(호버 80%, 호버 기기만) · 잉크 `media-foreground-dark` · 글리프 `icon/x` 10. 크기 — md 16 모서리 탭(왼쪽 아래 4) · video 18 원 위 · 오른쪽 3 · fill 22 원 5, 글리프 16 |
| 빈 칸 | `data-empty="true"` — 점선 `media-slot-empty-stroke`(호버 `-hover`) · 면 `-empty-surface` · `icon/plus` 16 `-empty-foreground`(호버 `-hover`) |
| 줄 | 기본 한 줄 가로 스크롤 · 막대 없음 · 간격 4. `data-layout="wrap"` 줄바꿈 · 간격 4, `"grid"` 3열(`--louis-media-slot-strip-columns`) · 간격 8 |

**지우기는 미디어 위에 서므로 media 색이고, 칸 면은 테마 면 위에 서므로 테마 색이다.** 같은 부품 안에서 두 규칙이 갈리는 것이 계약이다.
**장식 줄은 `aria-hidden` 이다** — 노드 입력판의 연결 이미지 줄은 연결선이 이미 말하는 것을 되풀이할 뿐이라 읽지 않는다. 지우기가 있는 칸은
`alt` 에 무엇인지, 지우기 `aria-label` 에 무엇을 빼는지 적는다. 누르면 무언가 열리는 칸은 `button` 이다.

노드 입력판 면 첫 줄로 서면 셸이 아래 8 을 준다([Node Shell](node-shell.md) `__field > .louis-media-slot-strip`).

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/media-slot.css`. React 표면은 없다 — 소비처가 클래스를 물면 된다 |
| Figma         | `not-ready`    | 부품이 아직 없다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| `data-size` | `md`(기본) · `video` · `fill` | 칸 크기 — 32 정사각 · 76×52 · 열 폭 정사각 |
| `data-empty` | `true` | 미디어 없이 더하기 글리프만 선 빈 칸 |
| 줄 `data-layout` | 없음(가로 스크롤) · `wrap` · `grid` | 칸들이 서는 방식 |

## States

| 상태 | 그림 |
| --- | --- |
| 미디어 있음 | 면 · 테두리 위에 미디어가 칸을 채운다(cover) |
| 지우기 호버 | 지우기 면 56% → 80% — 호버 기기에서만 |
| 빈 칸 | 점선 테두리 · 더하기 글리프. 호버에서 점선 · 글리프가 한 단 진해진다 |

## Content

칸 자체에는 글자가 없다. 그림의 뜻은 `alt` 가, 지우기의 뜻은 `aria-label`(「참조 이미지 1 빼기」처럼 무엇을 빼는지)이 나른다.

## Accessibility

- 장식 줄(연결선이 이미 말하는 것을 되풀이하는 노드 입력판 줄)은 `aria-hidden` 이다.
- 누르면 무언가 열리는 칸과 빈 칸은 `button` 이다. 지우기 버튼은 칸 안의 별도 `button` 이다.
- 지우기 글리프는 media 색이라 그림 밝기와 무관하게 대비가 고정이다.

## Acceptance tests

레시피 선언은 빌드의 저작 게이트가 지킨다. 실브라우저 시험(크기 셋 · 반경 · 지우기 자리 · 빈 칸 점선)은 Figma 부품과 함께 세운다.

## Known deviations

1. **28 칸을 접었다.** 편집 노드 소스 줄은 28 · 반경 4 인데(`EditNode.tsx:470-471`) 같은 파일 머리 주석이 「연결 이미지 줄과 동일(32px)」이라
   적고 안의 그림도 32 다(:477). md 32 로 옮긴다.
2. **영상 참조 칸의 색을 칸 면 쌍으로 옮겼다.** 제품은 라이트 덮개가 없어 흰 입력판 위에 흰 12% 테두리를 그린다(`VideoNode.tsx:819-820`).
3. **만들기 화면 참조 칸의 색과 반경을 접었다.** 제품 면이 다크 검정 12% · 라이트 `#fafafa` 12%, 테두리 8%, 반경 14 다(`PhotoGrid.tsx:86-89`).
4. **지우기 버튼 셋을 하나로 모았다.** 라이트 40%(EditNode) · 라이트 뒤집힘(PhotoGrid) · 붉은 호버(EditNode) · 글자 `×`(VideoNode)를 접었다.
5. **줄 간격 6 · 9 를 4 · 8 로 모았다**(`VideoNode.tsx:800` · `PhotoGrid.tsx:71`).
