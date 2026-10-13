---
id: logo-tile
status: experimental
authority: normative
summary: 회사 · 서비스의 로고를 페이지 잉크로 칠해 담는 정사각 칸입니다.
---

# Logo Tile

모델 · 서비스를 만든 회사의 로고 칸이다(`.louis-logo-tile`, [DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md)).
로고 그림의 모양만 빌리고 색은 페이지 잉크로 칠해서, 어떤 로고 파일이든 두 테마에서 같은 무게로 읽힌다.
사람은 [Avatar](avatar.md)다. 사진 · 영상 썸네일은 [Media Slot](media-slot.md)이다.
제품 정본은 `ModelLogo.tsx:8-22`(통합 판 `54b62a8aa`)이고 모델 비교 표 · 폰 목록 · 추천 결과가 쓴다
(`ModelCompare.tsx:124` · `:168` · `ModelRecommender.tsx:118`).

```html
<span class="louis-logo-tile" aria-hidden="true" style='--louis-logo-tile-image: url("https://…/logo.png")'>
  <span class="louis-logo-tile__glyph"></span>
</span>

<!-- 로고가 없을 때 -->
<span class="louis-logo-tile" data-size="lg" aria-hidden="true">
  <span class="louis-logo-tile__fallback">K</span>
</span>
```

| 부분 | 값 |
| --- | --- |
| 칸 | 정사각 · 반경 12(`radius-card`) · 면 `gray-000-alpha-04` · 글자색 `fg-primary` |
| 크기 | sm 48 · md 56(기본, 719 이하에서 48) · lg 72 |
| 글리프 | 칸의 절반 · 가운데. 로고 알파를 마스크로(`--louis-logo-tile-image`), 칠은 `currentcolor` |
| 대체 글자 | body-md semibold · 이름 첫 글자 |

**로고는 마스크로만 쓴다.** 어드민이 올리는 로고는 어두운 영상 위에 얹으려고 만든 흰 실루엣 PNG 라 밝은 면에서 사라진다
(`ModelLogo.tsx:3-7`). 마스크 그림은 CORS 가 열려 있어야 한다.
**글리프는 칸의 절반이다.** 제품의 세 크기(56/28 · 48/24 · 72/36)가 모두 그 비율이라 숫자가 아니라 규칙으로 둔다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/logo-tile.css`. React 표면은 없다 — 소비처가 클래스를 물면 된다 |
| Figma         | `partial`      | 2026-10-13 — `LogoTile` — Size(sm 48 · md 56 · lg 72) × Content(glyph · fallback), TEXT Initial. 글리프는 SCALE 제약으로 칸의 절반. 기하 계약 · 기록은 아직 없다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| `data-size` | 없음 · `md`(기본) · `sm` · `lg` | 48 · 56(719 이하 48) · 72 |
| `--louis-logo-tile-image` | `url("…")` | 로고 그림 주소 — 행마다 달라 소비처가 준다 |
| `__glyph` · `__fallback` | 둘 중 하나 | 로고가 있으면 글리프, 없으면 이름 첫 글자 |

## States

상태가 없다 — 장식 칸이다.

## Content

- 대체 글자는 이름의 첫 글자 하나다. 두 글자 이상을 넣지 않는다.
- 로고 그림은 단색 실루엣을 전제한다 — 색이 여럿인 로고도 알파만 읽혀 한 색이 된다.

## Accessibility

- 칸 전체가 장식이다(`aria-hidden`) — 옆에 이름 글자가 늘 있다. 이름이 없는 자리에 홀로 쓰려면 `role="img"` + `aria-label` 을 단다.
- 강제 색 모드에서 글리프를 `CanvasText` 로 칠한다(마스크 칠은 배경색이라 시스템 면에 지워진다).
- 대비(실브라우저 실측, `bg-surface` 위 칸 면): 글리프 · 대체 글자 라이트 15.15 · 다크 14.93.

## Acceptance tests

`packages/react/test/logo-tile.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다 — 크기 셋 48 · 56 · 72 · 반경 12, 글리프가
칸의 절반 · 가운데, 719 이하에서 md 가 48 로(lg 는 그대로), 마스크 그림 · 크기 · 반복과 글자색 칠, 면 `gray-000-alpha-04`,
대체 글자 body-md semibold, 두 테마의 글리프 · 대체 글자 대비 4.5:1.

## Known deviations

1. **제품 md 반경 10 · 잉크 5% 를 12 · 4% 로 접었다**(`ModelLogo.tsx:9` · `:12`). 10 은 반경 사다리에 이름이 없고 5% 는 알파 계단 밖이다.
   칸은 장식이라 대비 판정이 없다(DS-D-0084 「작은 새 부품」 판단 8).
2. **폰 판 48 을 `data-size="sm"` 으로도 연다.** 제품은 화면 폭(`max-[719px]`)으로만 내려간다. 레시피도 719 이하에서 md 를 48 로 내리고,
   폭과 무관하게 작게 쓸 자리를 위해 칸을 하나 더 둔다.

## 제품에서 발견한 것

- 메뉴 행이 같은 마스크 칠을 따로 쓴다(`VideoModelMenu.tsx:228-235`). 그 행이 Menu 부품으로 올라갈 때 `__glyph` 규칙을 공유한다.
