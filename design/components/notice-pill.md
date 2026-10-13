---
id: notice-pill
status: experimental
authority: normative
summary: 영상 위에 한 줄 공지를 띄웁니다. 목적지가 있으면 링크가 됩니다.
---

# Notice Pill

히어로 영상 위의 한 줄 공지다 — 점 · (있으면) 로고 · 문구(`.louis-notice-pill`,
[DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md)). 면은 영상 위 유리라 두 테마에서 같다.
페이지 면 위의 상태 라벨은 [Badge](badge.md)이고, 페이지 위의 알림 문단은 [Alert](alert.md)다.
제품 정본은 `HeroNotice.tsx:41-91`(통합 판 `54b62a8aa`) — 랜딩 히어로(`Hero.tsx:305` · `:309` · `:314`)와 어드민 랜딩 편집의
미리보기(`LandingManagement.tsx:336-337`)가 같은 정의를 쓴다.

```html
<!-- 목적지 없음 -->
<p class="louis-notice-pill">
  <span class="louis-notice-pill__dot" aria-hidden="true"></span>
  <span class="louis-notice-pill__text">새 모델이 열렸습니다</span>
</p>

<!-- 목적지 있음 · 로고 -->
<a class="louis-notice-pill" href="/models">
  <span class="louis-notice-pill__dot" aria-hidden="true"></span>
  <img class="louis-notice-pill__logo" src="…" alt="">
  <span class="louis-notice-pill__text">지금 써 보기</span>
</a>
```

| 부분 | 값 |
| --- | --- |
| 알약 | 높이 32(`layout-control-height-md`) · 좌우 12(`space-control-md`) · 반경 12(`radius-control`) — Button md 기하 |
| 면 | `media-scrim-dark` 56% + 흐림 `blur-glass`(16) · `saturate(130%)`. 두 테마 같다 |
| 글자 | body-sm medium · `media-foreground-dark`(두 테마 `#fafafa`) · 한 줄 말줄임 |
| 점 | 4 원 · `notice-pill-dot`(두 테마 `green-500`) · 뒤 10 |
| 로고 | 높이 16 · 최대 폭 48 · `contain` · 뒤 6 |
| 링크일 때 | 커서 · 호버 스크림 72%(호버 기기만, `motion-control-hover`) |

**간격은 요소마다 오른쪽에 든다**(`gap` 없음) — 로고가 있든 없든 점 뒤 10 · 로고 뒤 6 이 그대로 읽힌다(`HeroNotice.tsx:38-40`).
**Button 을 빌리지 않는다** — 44 히트가 높이 32 를 밀어내고, 누를 수 없는 공지에 누름 신호가 붙는다(`HeroNotice.tsx:14-15` · `:62-65`).

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/notice-pill.css`. React 표면은 없다 — 소비처(히어로 · 어드민 미리보기)가 클래스를 물면 된다 |
| Figma         | `partial`      | 2026-10-13 — `NoticePill` — 조건 축 Interactive(false · true) × State(Default · Hover — true 에만), BOOLEAN Logo, TEXT Text. 면 `color/media-scrim-dark` 56 · 72% + 흐림 16. `saturate(130%)` 는 Figma 에 없다. 기하 계약 · 기록은 아직 없다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| 요소 | `<p>` · `<a href>` · `<button>` | 누를 수 있는지는 요소가 말한다 — 속성 축이 없다 |
| `__dot` | 늘 있다 | 「새 소식」 상태 표시. 로고가 대신하지 않는다 |
| `__logo` | 있음 · 없음 | 어드민이 올린 로고. 장식 |
| `__text` | — | 문구 한 줄 |

## States

| 상태 | 그림 |
| --- | --- |
| 쉼 | 순검정 56% 유리 |
| 호버(링크) | 72% — 호버 기기에서만 |
| 긴 문구 | 한 줄에서 말줄임. 알약 높이 32 를 지킨다 |

## Content

- 문구는 한 문장, 짧게. 마침표를 찍지 않는다.
- 로고는 문구가 말하는 서비스의 것일 때만 둔다.

## Accessibility

- 링크의 이름은 문구다. 로고(`alt=""`) · 점(`aria-hidden`)은 장식이다.
- 바깥 주소는 평범한 `<a>`, 안쪽 주소는 라우터 링크다. 새 창은 열지 않는다.
- 포커스 링은 전역 규칙이 소유한다([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)). 강제 색에서는 경계를 세우고 점을 `CanvasText` 로 칠한다.
- 대비(실브라우저 실측, 흰 영상 프레임 위 — 최악): 글자 쉼 4.73 · 호버 8.85, 두 테마 같다.

## Acceptance tests

`packages/react/test/notice-pill.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다 — 높이 32 · 좌우 12 · 반경 12 · 흐림 16,
점 4 · 뒤 10, 로고 높이 16 · 최대 48 · 뒤 6, 로고 없는 판의 점 뒤 10, 긴 문구 말줄임과 높이 32, `p` 에는 커서 · 호버가 없고 `a` 에만
있는 것과 스크림 56% → 72%, 두 테마에서 흰 프레임 위 글자 대비 4.5:1(쉼 · 호버)과 면 · 점 색이 테마를 따르지 않는 것.

## Known deviations

1. **스크림을 48% → 56%, 호버 64% → 72% 로 올렸다.** 제품 48% 는 흰 영상 프레임 위에서 글자가 4.5:1 에 못 미친다(초안 계산 3.55).
   알약이 한 단 어두워지는 보이는 변화다(DS-D-0084 「작은 새 부품」 판단 10).
2. **32 높이 링크는 AAA 44 에 못 미친다** — AA 24 는 넘는다. Button 의 히트 확장을 쓰면 높이가 밀린다.

## 제품에서 발견한 것

- 호버가 `@media (hover: hover)` 밖이다(`HeroNotice.tsx:72`).
- 문구가 맨 글자라 길면 높이 32 를 넘쳐 줄이 바뀐다. 레시피는 `__text` 로 감싸 한 줄에서 자른다.
