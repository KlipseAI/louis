---
id: asset-tile
status: experimental
authority: normative
summary: 눌러서 그림 하나를 넣는 칸입니다. 테두리 칸 안에 정사각 우물과 라벨 한 줄이 섭니다.
---

# Asset Tile

팔레트에서 스티커 · 도형 같은 그림 하나를 **넣는** 칸이다(`.louis-asset-tile`,
[DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md)). 누르면 넣고 끝이다 — 선택 상태가 없다.
고른 상태가 남아야 하면 [Choice Card](choice-card.md)이고, 라벨 없는 썸네일이면 [Media Slot](media-slot.md)이다.
제품 정본은 이미지 편집 모달의 스티커 팔레트다(`StickerPalette.tsx:30-56`, 통합 판 `54b62a8aa`).

```html
<div class="louis-asset-tile-grid">
  <button type="button" class="louis-asset-tile" title="격자">
    <span class="louis-asset-tile__well">
      <img class="louis-asset-tile__media" src="…" alt="" draggable="false">
    </span>
    <span class="louis-asset-tile__label">격자</span>
  </button>
  <!-- 에셋 수만큼 -->
</div>
```

| 부분 | 값 |
| --- | --- |
| 칸 | `<button>` · 세로 · 안쪽 4 · 사이 4(`space-control-xs`) · 테두리 1 `gray-000-alpha-12` · 반경 8(`radius-control-sm`) · 면 `gray-000-alpha-04` |
| 우물 | 칸 안쪽 폭의 정사각 · 반경 4 · 면 `asset-tile-well`(두 테마 `palette-gray-600`) 40% |
| 그림 | `contain` · 안쪽 2 · 포인터 받지 않음 · 끌기 막음 |
| 라벨 | caption regular · `fg-secondary` · 한 줄 말줄임 |
| 격자 | 같은 폭 열 2(`--louis-asset-tile-grid-columns`) · 사이 6 |
| 호버 | 면 `gray-000-alpha-08` · 선 `accent-primary` 48% — 호버 기기만 |
| 누름 | `scale: 0.97`. 줄인 동작에서는 없다 |

**우물은 테마를 따르지 않는다.** 흰 선만으로 된 에셋이 다크 면에서 사라지지 않도록 두 테마 모두 중간 회색을 깐다
(`StickerPalette.tsx:32-33` 의 주석이 그 의도다). 라이트에서 흰 에셋이 덜 보이는 것은 아래 Known deviations 1 이다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/asset-tile.css`. React 표면은 없다 — 소비처(스티커 팔레트)가 클래스를 물면 된다 |
| Figma         | `partial`      | 2026-10-13 — `AssetTile` — State(Default · Hover · Active — §2 어휘, 누름 축소 0.97 은 그리지 않았다), TEXT Label, INSTANCE_SWAP Media. 우물 `color/asset-tile-well` 40%, 호버 선 `color/accent-primary` 48%. 기하 계약 · 기록은 아직 없다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| `.louis-asset-tile` | `<button type="button">` | 넣는 칸 하나 |
| `__well` · `__media` · `__label` | — | 우물 · 그림 · 라벨 |
| `.louis-asset-tile-grid` | — | 칸을 같은 폭 열로 세우는 격자 |
| `--louis-asset-tile-grid-columns` | 정수(기본 2) | 열 수. 팔레트 폭이 바뀌면 소비처가 덮는다 |

변형 축은 없다.

## States

| 상태 | 그림 |
| --- | --- |
| 쉼 | 잉크 4% 면 · 잉크 12% 선 |
| 호버 | 면 8% · 선 강조색 48% — 호버 기기에서만 |
| 누름 | 0.97 로 줄어든다 |
| 긴 이름 | 라벨이 한 줄에서 말줄임으로 잘린다. 전체 이름은 `title` |

## Content

- 라벨은 그림의 이름이다(「격자」 · 「화살표」). 동작(「넣기」)을 적지 않는다 — 칸 전체가 넣는 단추다.
- 그림은 에셋 그대로다. 우물이 비율을 정사각으로 맞추고 그림은 `contain` 으로 들어간다.

## Accessibility

- 접근 이름은 라벨 글자다. 그림은 `alt=""` — 같은 이름을 두 번 읽지 않는다.
- 라벨이 잘리면 `title` 에 전체 이름을 둔다.
- 포커스 링은 전역 규칙이 소유한다([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)). 강제 색에서는 칸 경계를 `ButtonText` 로 세운다.
- 대비(실브라우저 실측, `bg-surface` 모달 면 위): 라벨 라이트 8.45 · 다크 6.53. 흰 선 에셋 대 우물 라이트 2.06 · 다크 11.36.

## Acceptance tests

`packages/react/test/asset-tile.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다 — 칸의 안쪽 · 사이 · 테두리 · 반경,
우물 정사각 · 반경 4 · 칸 안쪽 폭, 그림 안쪽 2, 격자 두 열 · 사이 6 과 열 수 덮기, 라벨 말줄임, 호버의 면 08 · 선 48%,
두 테마의 라벨 대비 4.5:1 과 우물 색(두 테마 같은 회색 40%), 다크 흰 에셋 3:1. 같은 파일이 예시 갤러리 칸(Media Slot `fill` 2:3)도 잰다.

## Known deviations

1. **라이트에서 흰 선 에셋이 옅다(2.06:1).** 우물은 두 테마 같은 중간 회색이다 — 제품 의도(다크에서 흰 선을 살린다)를 그대로 따른다.
   그림은 장식이고 이름은 라벨이 말한다(DS-D-0084 「작은 새 부품」 판단 3).
2. **칸 경계(잉크 12%)는 3:1 미만이다.** 라벨과 그림이 칸을 식별하므로 1.4.11 의 「식별에 필요한 경계」가 아니다.
3. **작은 값을 사다리로 접었다.** 호버 면 10% → `gray-000-alpha-08`, 라벨 잉크 72% → `fg-secondary`, 전환 120ms → `motion-control-hover`.
   사다리에 이름이 없는 격자 6 · 우물 반경 4 · 그림 안쪽 2 는 제품 값 그대로다(`StickerPalette.tsx:30` · `:45` · `:50`).

## 제품에서 발견한 것

- 호버가 `@media (hover: hover)` 밖이라 터치에서 탭 뒤 강조가 남는다(`StickerPalette.tsx:39-40`). 레시피는 호버 기기에서만 그린다.
- 예시 갤러리 칸(`ExampleGallery.tsx:43-47`)은 이 부품이 아니다 — 누를 수 없고 그림이 칸을 다 덮는다.
  [Media Slot](media-slot.md) `data-size="fill"` + `data-ratio="2:3"` 이다.
