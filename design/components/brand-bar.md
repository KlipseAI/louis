---
id: brand-bar
status: experimental
authority: normative
summary: 앱 셸 없는 독립 화면의 머리에 브랜드 락업과 링크 묶음을 양끝으로 놓습니다.
---

# Brand Bar

앱 셸 없는 독립 화면의 머리 막대다 — 왼쪽 브랜드 락업, 오른쪽 링크 묶음(`.louis-brand-bar`,
[DS-D-0112](../governance/decisions/DS-D-0112-brand-bar.md)). 제품 정본은 덱 화면군의 `app/deck/DeckParts.tsx` 의 `DeckTopBar`
(통합 판 `54b62a8aa`)이고 네 라우트가 그린다. 앱 셸 안의 머리는 [App Shell Parts](app-shell-parts.md) 의 `AppTopBar` 다.
링크는 [Text Link](text-link.md) 다.

```html
<header class="louis-brand-bar">
  <a class="louis-brand-bar__brand" href="/deck" aria-label="Klipse Deck">
    <!-- 락업 그림(소비처) — 워드마크 + Deck -->
  </a>
  <nav class="louis-brand-bar__links" aria-label="덱 메뉴">
    <a class="louis-text-link louis-brand-bar__link" data-underline="none" href="/deck/manage">교안 관리</a>
    <a class="louis-text-link louis-brand-bar__link" data-underline="none" href="/archive">Klipse로 돌아가기</a>
  </nav>
</header>
```

| 부분 | 값 |
| --- | --- |
| 막대 | 양끝 · 가운데 맞춤 · 사이 16(`space-control-lg`) |
| 브랜드 | 높이 28(`layout-app-shell-brand-mark-height`) · 줄지 않음 · 링크면 반경 8(`radius-control-sm`) |
| 링크 묶음 | 오른쪽 정렬 · 줄바꿈 · 세로 8(`space-control-sm`) · 가로 24(`space-layout-section`) |
| 링크 | Text Link `underline=none` — `fg-secondary` → 호버 `fg-primary`, body-sm medium(14/21) · 줄바꿈 없음 |

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/brand-bar.css`. React 표면은 없다 — 소비처가 클래스를 물면 된다 |
| Figma         | `done`        | 2026-10-15 — `BrandBar` — BOOLEAN ExtraLink, 링크는 `TextLink`(Underline=none) 인스턴스, 락업은 워드마크 + Deck 벡터(`brand/logo-ink`). 기하 계약 · 실측 기록 · 브라우저 되재기가 섰다(DS-D-0035) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| `__brand` | `<a>` · `<span role="img">` | 락업의 자리. 홈으로 가면 링크, 아니면 그림 |
| `__links` | `<nav>` | 링크 묶음 — 마지막이 「돌아가기」다 |
| `__link` | Text Link | 링크 하나 |

## States

| 상태 | 그림 |
| --- | --- |
| 쉼 | 링크 `fg-secondary` |
| 호버(링크) | `fg-primary` — 밑줄 없음(Text Link 가 갖는다) |
| 좁은 폭 | 링크가 다음 줄로 넘어가고 오른쪽에 붙는다. 락업은 줄지 않는다 |

## Content

- 링크는 둘까지. 마지막은 앱으로 돌아가는 길이다.
- 링크 문구는 이동할 곳의 이름(「교안 관리」), 동사로 끝내지 않아도 된다.

## Accessibility

- 막대는 `<header>`, 링크 묶음은 `<nav aria-label>` 이다. 락업은 접근 이름(`aria-label`)을 갖고 안의 그림은 `alt=""` 다.
- 포커스 링은 전역 규칙이 소유한다(DS-D-0074) — `__brand` 의 반경 8 이 그 모양을 정한다.
- 대비(실브라우저 실측, `bg-canvas` 위): 링크 쉼 라이트 8.67 · 다크 7.93, 호버 라이트 15.55 · 다크 18.12.

## Acceptance tests

`packages/react/test/brand-bar.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다 — 막대 사이 16 · 양끝, 락업 높이 28 · 반경 8 · 줄지 않음,
링크 묶음 세로 8 · 가로 24 · 오른쪽 정렬 · 좁은 폭 줄바꿈, 링크 14 medium · 줄바꿈 없음, 두 테마에서 링크 대비 4.5:1 이상.
`packages/react/test/brand-bar-geometry.browser.test.tsx` 가 기록 `brand-bar` 를 레시피의 계산값으로 되잰다.

## Known deviations

없음 — 값과 경계가 제품과 같다.

## 제품에서 발견한 것

- 링크의 호버가 `hover:` 유틸리티라 `@media (hover: hover)` 가드가 Tailwind 기본 설정에 달려 있다 — Text Link 레시피는 가드를 직접 건다.
