---
id: timeline-footer
status: experimental
authority: normative
summary: 공개 화면의 푸터를 편집기 타임라인 모양으로 그립니다. 링크 묶음이 트랙, 링크가 클립입니다.
---

# Timeline Footer

공개 화면(홈 · 모델 · 가격 · 문의 · 블로그 · 템플릿)의 푸터다 — 컴포지션 편집기의 타임라인 모양이고, 링크 묶음 넷이 트랙 · 링크 하나하나가 클립이다
(`.louis-timeline-footer`, [DS-D-0116](../governance/decisions/DS-D-0116-timeline-footer.md)). 제품 정본은 `components/landing/sections/TimelineFooter.tsx`
(통합 판 `54b62a8aa`)다. 페이지 전체는 [landing-shell](../patterns/landing-shell.md) 패턴, 섹션 하나는 [Section Shell](section-shell.md) 이다.

**늘 다크다** — 루트가 `data-theme="dark"` 를 단다. 문서 테마가 라이트여도 같은 그림이다.

```html
<footer class="louis-timeline-footer" data-theme="dark">
  <div class="louis-timeline-footer__lead" aria-hidden="true"></div>  <!-- 홈만 -->
  <div class="louis-timeline-footer__bar">
    <div class="louis-timeline-footer__brand">
      <svg class="louis-timeline-footer__wordmark" role="img" aria-label="Klipse">…</svg>
      <p class="louis-timeline-footer__tagline">AI 영상 제작의 모든 순간을 하나의 워크스페이스로.</p>
    </div>
    <div class="louis-timeline-footer__social">
      <a class="louis-timeline-footer__social-link" href="…" aria-label="인스타그램">…</a>
    </div>
  </div>
  <nav class="louis-timeline-footer__timeline" aria-label="사이트 링크">
    <div class="louis-timeline-footer__ruler-head" aria-hidden="true"><span>00:00:08</span></div>
    <div class="louis-timeline-footer__ruler" aria-hidden="true">
      <span class="louis-timeline-footer__ruler-label" style="left: 0px">00:00</span> …
    </div>
    <div class="louis-timeline-footer__track" data-tone="product">
      <h2 class="louis-timeline-footer__track-head">
        <svg class="louis-timeline-footer__track-icon" aria-hidden="true">…nodes-linked…</svg>
        <span class="louis-timeline-footer__track-name">프로덕트</span>
      </h2>
      <ul class="louis-timeline-footer__lane">
        <li style="display: contents"><a class="louis-timeline-footer__clip" href="/models"><span class="louis-timeline-footer__clip-text">모델</span></a></li>
        <li style="display: contents"><span class="louis-timeline-footer__clip" aria-disabled="true"><span class="louis-timeline-footer__clip-text">뉴스룸</span><span class="louis-timeline-footer__clip-note">공개 예정</span></span></li>
      </ul>
    </div>
    <!-- resources · social · trust 도 같다 -->
    <div class="louis-timeline-footer__playhead" aria-hidden="true"><span class="louis-timeline-footer__timecode">00:08</span></div>
  </nav>
  <div class="louis-timeline-footer__status">
    <ul class="louis-timeline-footer__biz"><li><span class="louis-timeline-footer__biz-label">상호명</span>(주)스팩스페이스</li> …</ul>
    <p class="louis-timeline-footer__copyright">© SFACSPACE 2026. All rights reserved</p>
  </div>
</footer>
```

| 부분 | 값(≥720 · ≤719) |
| --- | --- |
| 면 | `bg-canvas`(다크 gray-950) · 글자 `fg-primary`. 아래 안전 영역 `--louis-timeline-footer-safe-bottom` |
| 녹임 띠 | 푸터 위 160, 투명 → `bg-canvas` |
| 머리 줄 | 위 26 · 20 · 좌우 48 · 20 · 아래 18 · 사이 20. 워드마크 24 · 태그라인 body-sm `fg-secondary`(≤719 숨김) · 사이 16, 소셜 32 · 반경 8 · 사이 2(호버 `gray-000-alpha-08`) |
| 타임라인 | 이름 칸 168 · 44 + 레인, 위 헤어라인 `stroke-hairline` |
| 눈금 | 높이 28 · 12 마다 5 · 60 마다 10 틱(`gray-000-alpha-12`) · 글자 caption `fg-tertiary`(위 2 · 왼쪽 4, ≤719 짝수 칸 숨김) |
| 트랙 이름 | 높이 48 · 아이콘 20(트랙 색) · 사이 10 · 왼쪽 48 · 오른쪽 16 — ≤719 아이콘만 가운데(이름은 보조기기에만) |
| 레인 | 높이 48 · 사이 12 · 오른쪽 16 · 바닥 `gray-000-alpha-04`, 시작 자리 % — ≤719 줄바꿈 · 사이 6 · 안쪽 8 |
| 클립 | 32 · 반경 6 · 좌우 12(≤719 10) · 사이 10, 바닥 트랙 14% + `bg-raised`, 안쪽 선 트랙 34%(호버 100%), body-sm medium. 최소 폭 % |
| 준비중 클립 | 바닥 없음 · 선 `gray-000-alpha-12` · `fg-tertiary` · `aria-disabled` |
| 클립 메모 | caption `fg-tertiary`(↗ · 공개 예정) — ≤719 숨김 |
| 재생헤드 | 1px 프로덕트 트랙 색 · 레인 40.5% · 머리 9 오각형 · 위 22 시각 |
| 상태 줄 | 위 18 · 아래 22 · 좌우 48 · 20 · 사이 24, caption `fg-secondary`. 사업자 정보 최대 900 · 가로 22 · 라벨 `fg-tertiary` 뒤 6, 저작권 `fg-tertiary` — ≤719 세로 · 사이 10 |

트랙 넷(`__track[data-tone]`): `product`(blue · 시작 2% · 최소 13%) · `resources`(green · 9% · 12%) · `social`(yellow · 30% · 12%) · `trust`(pink · 4% · 22%,
클립에 옅은 세로 파형).

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/timeline-footer.css` 와 시맨틱 넷. React 표면은 없다 — 소비처가 클래스를 물고 재생헤드 스크립트를 붙이면 된다 |
| Figma         | `done`        | 2026-10-15 — `TimelineFooter`(Viewport `≥720` · `≤719`, BOOLEAN Lead) · `TimelineFooterClip`(Tone × Interactive × State, TEXT Label · Note, BOOLEAN HasNote). Semantic Color 모드 Dark 고정, 원시 칠 · 획 0. 기하 계약 · 실측 기록 · 브라우저 되재기가 섰다(DS-D-0035) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| `data-theme` | `dark` | 늘 다크 — 필수 |
| `__lead` | 있음 · 없음 | 윗머리 녹임 띠(끝 장면 아래, 홈만) |
| `__track[data-tone]` | `product` · `resources` · `social` · `trust` | 트랙 색 · 레인 시작 자리 · 클립 최소 폭 |
| `__clip` | `a[href]` · `span[aria-disabled="true"]` | 링크 · 준비중 |
| `--louis-timeline-footer-safe-bottom` | 길이 | 아래 안전 영역 |

## States

| 상태 | 그림 |
| --- | --- |
| 클립 쉼 | 트랙 14% 바닥 · 34% 안쪽 선 |
| 클립 호버 | 안쪽 선이 트랙 색 100%(호버 기기만) |
| 준비중 | 바닥 없음 · 흰 12% 선 · 흐린 글자 · 누르지 못함 |
| 소셜 호버 | 흰 8% 면 · 글자 `fg-primary` |
| 재생헤드 | 쉬는 자리 40.5% — 마우스를 따라가는 것은 소비처 스크립트 |

## Content

- 트랙 이름은 묶음의 성격 한 낱말(「프로덕트 · 리소스 · 소셜 · 신뢰」), 클립은 목적지 이름.
- 바깥 링크는 메모 「↗」, 목적지가 없으면 「공개 예정」.

## Accessibility

- 타임라인은 `<nav aria-label>`, 트랙 이름은 `<h2>`, 링크 묶음은 `<ul>`. 눈금 · 재생헤드 · 시각은 장식이라 `aria-hidden`.
- 폰에서 트랙 이름은 시각적으로 숨기고 보조기기에 남긴다. 준비중 클립은 `aria-disabled="true"`.
- 대비(실브라우저 실측, 두 문서 테마 같음): 태그라인 · 사업자 값 · 트랙 이름 7.93, 사업자 라벨 · 저작권 5.75(제품 gray-500 약 4.0 에서 고침), 클립 13.97 · 14.00,
  준비중 클립 5.29, 시각 5.37.

## Acceptance tests

`packages/react/test/timeline-footer.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다 — 1440 머리 줄 · 워드마크 · 소셜, 이름 칸 168 · 눈금 28 · 트랙 48 ·
레인 사이 12 · 클립 32 · 반경 6 · 좌우 12 · 레인 시작 % · 클립 최소 % · 재생헤드 40.5%, 375 이름 칸 44 · 이름 숨김 · 줄바꿈 · 안쪽 8 · 메모 · 태그라인 숨김 · 상태 줄 세로,
문서 테마와 무관한 다크와 글자 대비, lead 160. `packages/react/test/timeline-footer-geometry.browser.test.tsx` 가 기록 `timeline-footer` · `timeline-footer-clip` 을 되잰다.

## Known deviations

1. **흐린 글자 gray-500 → `fg-tertiary`(gray-400)** — 사업자 라벨 · 저작권 · 눈금 · 메모가 한 칸 밝아진다(DS-D-0116 판정 3).
2. **알파 7% · 2% · 6% → 8% · 4% · 8%** — 알파 사다리로 접었다(판정 4).

## 제품에서 발견한 것

- 흐린 글자 gray-500 이 gray-950 위에서 약 4.0 이다 — caption 12 사업자 라벨 · 저작권이 4.5:1 에 못 미친다.
- 클립 호버가 `[&:hover]:` 라 터치 기기에서 눌린 뒤 선이 남는다 — 레시피는 호버 기기에서만 그린다.
