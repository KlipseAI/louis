---
id: node-handle-tile
status: experimental
authority: normative
summary: 노드 채널을 24 타일 그림으로 보여 줍니다 — 누르는 단추가 아닙니다.
---

# Node Handle Tile

노드 채널(이미지 · 글 · 편집 · 오디오 · YouTube · Instagram)을 24 타일 그림으로 보인다. 캔버스 도움말 패널에서 입력 목록 앞에 붙어 「이 입력은 캔버스의 이
버튼이다」를 말한다. 캔버스의 [Node Side Handle](node-side-handle.md)(28 단추)과 면 토큰 · 채널 판정을 함께 쓰지만 **누르지 않는 그림**이다
([DS-D-0108](../governance/decisions/DS-D-0108-node-handle-tile.md)).

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS 레시피 `.louis-node-handle-tile` 만 있다(`packages/css/src/component/node-handle-tile.css`). React 표면은 없다 |
| Figma         | `done`         | `NodeHandleTile`(Channel 6). 계약 · 기하 · 되재기 시험이 선다 — 2026-10-15 되재기 `node-handle-tile.browser.test.tsx` 로 done(DS-D-0035) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품 도움말 패널이 이 레시피를 물면 승격 후보 |

## When to use

- 설명 글 옆에서 캔버스의 채널 버튼을 **가리킬** 때 — 도움말 · 온보딩 · 문서.
- 쓰지 말아야 할 때: 캔버스에서 누르는 채널 버튼. 그것은 [Node Side Handle](node-side-handle.md) 이다.
- 쓰지 말아야 할 때: 채널이 없는 입력(`default`). 그리지 않는다 — 제품도 그리지 않는다.

## Anatomy

1. **Tile** — `.louis-node-handle-tile[data-channel]`. 24 정사각 · 반경 6 · 채널 면.
2. **Glyph** — 안의 `<svg>` 14. 잉크 `fg-on-danger`(흰색).
3. **Group**(선택) — `.louis-node-handle-tile-group`. 타일 여럿을 간격 2 로 한 줄에.

## Properties

| 속성 | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `data-channel` | `image` · `text` · `edit` · `audio` · `youtube` · `instagram` | 없음(`accent-primary` 면) | 채널 면 |

## Variants, sizes, and states

축은 채널 하나다. 크기 축이 없다 — 그림은 24 하나다. Node Side Handle 의 크기 축으로 넣지 않은 이유는 DS-D-0108 판정 1 이다.

## States

상태가 없다. 누르지 않는 그림이라 호버 · 포커스 · 비활성 그림이 없다.

| 상태 | 무엇이 바뀌나 |
| --- | --- |
| 채널 | 면만 `color-node-handle-icon-*` 로 바뀐다 |
| 강제 색 | 면을 시스템 바탕 + 실선 경계로, 글리프를 시스템 글자색으로 |

## Interaction and responsive behavior

포인터 · 키보드를 받지 않는다. 줄 맨 앞에 서고 글은 그 옆에서 감긴다 — 제품은 첫 줄과 맞추려 타일 묶음을 1 내린다(`pt-[1px]`, 소비처 배치).

## Content

글이 없다. 뜻은 옆 줄의 이름 · 설명이 싣는다.

## Accessibility

- 타일은 `aria-hidden="true"` 다 — 옆 글이 같은 뜻을 이미 말한다.
- 글리프 대비는 장식이라 3:1 을 요구하지 않는다. 재서 적는다 — 흰 글리프가 image 2.12 · text 1.73 · edit 4.74 · audio 3.02 · youtube · instagram 3.14 (두 테마
  같다, 면이 테마를 타지 않는다). 시험은 1.5 아래로 떨어지지 않는 것만 잠근다.

## Specification

| Part/state | Token or recipe | 구현 근거 |
| --- | --- | --- |
| 타일 | 24 · 반경 6(리터럴) | 제품 `w-12 h-12 rounded-6`(`CanvasHelpPanel.tsx:224`) |
| 면 | `color-node-handle-icon-{channel}` | 제품 `HANDLE_TILE_TONE`(`:218-225`) |
| 글리프 | 14 · `color-fg-on-danger` | 제품 `NodeGlyphSvg size={14}` · 팔레트 흰색(`:217` · `:234`) |
| 묶음 | 간격 `space-overlay-item-gap`(2) | 제품 `flex gap-1`(`:252`) |

## Implementation

- Web source: packages/css/src/component/node-handle-tile.css
- Public import: `@klipse-design/css` (레시피 클래스). React 표면 없음
- Figma component: `NodeHandleTile` — DS · Components 의 「R1 · 캔버스 · 편집기 부품 (2026-10-15)」 섹션
- Tests/visual evidence: packages/react/test/node-handle-tile.browser.test.tsx 가 figma/components.measured.json 의 node-handle-tile 을 되잰다

### Usage

```html
<span class="louis-node-handle-tile-group">
  <span class="louis-node-handle-tile" data-channel="image" aria-hidden="true"><svg viewBox="0 0 16 16">…</svg></span>
  <span class="louis-node-handle-tile" data-channel="text" aria-hidden="true"><svg viewBox="0 0 16 16">…</svg></span>
</span>
```

## Acceptance tests

1. 채널 여섯 각각에서 타일 24 × 24 · 반경 6 · 글리프 14 가 `figma/components.measured.json` 의 `node-handle-tile.<channel>` 과 같고, 묶음 간격이 2 다.
2. 두 테마에서 면이 그 채널 토큰 · 잉크가 `fg-on-danger` 이고 글리프 대비가 1.5 이상이다.
3. Figma 되읽기에서 `NodeHandleTile` 의 `rawFills` 가 0 이다(parity 게이트).

1~2 는 `packages/react/test/node-handle-tile.browser.test.tsx` 가 실브라우저에서 잰다.

## Known deviations

1. **제품이 아직 이 레시피를 물지 않는다.**
2. **image · text 채널의 흰 글리프 대비가 3 아래다**(2.12 · 1.73). 장식이라 두었다 — 면 토큰을 캔버스 단추와 공유한다(DS-D-0108 판정 5).
3. **Figma 글리프는 자리표시(`icon/image`)다.** 채널 글리프 표(`HANDLE_GLYPH`)는 제품 글리프 세트 쪽 과제다 — `Glyph` 로 바꿔 끼운다.

## Migration and changelog

2026-10-15 — 새 부품([DS-D-0108](../governance/decisions/DS-D-0108-node-handle-tile.md)).
