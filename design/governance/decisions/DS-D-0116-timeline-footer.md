---
id: decision-timeline-footer
status: experimental
authority: normative
---

# DS-D-0116 공개 화면의 타임라인 푸터를 새 부품 `timeline-footer` 로 — 늘 다크는 `data-theme="dark"` 고정, 트랙 색 넷, 흐린 글자 대비를 고친다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Affects: `timeline-footer`, `landing-shell`, `section-shell`, `governance-figma-component-authoring`, `decision-product-parts-become-louis`

## Context

표면 원장의 `components/landing/sections/TimelineFooter.tsx` 의 `TimelineFooter` 가 `needed`(high)로 남았다. 공개 화면 일곱 자리(홈 · 문의 · 가격 · 블로그 ·
블로그 공개 예정 · 모델 · 템플릿)가 그린다 — 홈만 `lead`(윗머리 160 녹임 띠)를 켠다. 소유자가 2026-10-07 「전부 새 푸터로」 지시해 옛 판 푸터 `Footer` 를
걷었고, Figma 의 `Product/Landing Footer` 세트는 걷힌 판(라이트 면 · 워드마크)을 그린다(통합 판 `54b62a8aa`).

모양은 컴포지션 편집기의 타임라인이다 — 머리 줄(워드마크 · 태그라인 · 소셜), 168 / 44 트랙 이름 칸 + 레인 격자, 12 / 60 px 눈금과 시각 라벨, 트랙 넷
(프로덕트 · 리소스 · 소셜 · 신뢰 — primary · green · yellow · pink)의 클립, 재생헤드와 시각, 상태 줄(사업자 정보 · 저작권). 늘 다크라 고정 팔레트
(`palette-gray-950 · 900 · 300 · 500 · 000`)로 칠한다. 흐린 글자 `palette-gray-500` 은 `gray-950` 위에서 약 4.0 이라 사업자 라벨 · 저작권(caption 12)이 4.5:1 에
못 미친다.

## Decision

1. **새 부품 `timeline-footer`**(`.louis-timeline-footer` · `__lead` · `__bar` · `__brand` · `__wordmark` · `__tagline` · `__social` · `__social-link` · `__timeline` ·
   `__ruler-head` · `__ruler` · `__ruler-label` · `__track` · `__track-head` · `__track-icon` · `__track-name` · `__lane` · `__clip` · `__clip-text` · `__clip-note` ·
   `__playhead` · `__timecode` · `__status` · `__biz` · `__biz-label` · `__copyright`). 제품 세트(DS-D-0071)가 아니라 LOUIS 부품이다(DS-D-0084 1항).
2. **늘 다크는 루트의 `data-theme="dark"` 다.** LOUIS 테마 블록이 `[data-theme]` 선택자라 안쪽이 다크 램프로 풀린다 — 고정 팔레트를 시맨틱으로 적는다:
   면 `bg-canvas`(gray-950) · 클립 바탕 `bg-raised`(gray-900) · 글자 `fg-primary`(gray-000) · 보조 `fg-secondary`(gray-300) · 흐린 글자 `fg-tertiary`
   (gray-400 — **제품 gray-500 에서 고쳐 올림**, 5.75) · 선 `stroke-hairline`(7% → 8%) · 레인 바닥 `gray-000-alpha-04`(2% → 4%, 알파 사다리 첫 칸) ·
   소셜 호버 `gray-000-alpha-08`(6% → 8%).
3. **트랙 색은 새 시맨틱 넷** `timeline-footer-track-product · -resources · -social · -trust`(blue · green · yellow · pink 500, 두 테마 같다). 트랙 감싸개
   `__track[data-tone]` 가 색 · 레인 시작 자리 · 클립 최소 폭(제품 TRACKS 의 %)을 고른다. 재생헤드 · 시각은 프로덕트 트랙 색.
4. **재생헤드의 마우스 따라가기와 시각 글자 갱신은 소비처 스크립트다** — 레시피는 쉬는 자리(레인의 40.5%)와 모양(1px 선 · 9 오각형 머리 · 위 22 시각)만 갖는다.
5. **값은 제품 그대로** — 사다리에 없는 값(바깥 48 · 머리 줄 26 / 18 · 이름 칸 168 / 44 · 트랙 48 · 클립 반경 6 · 사이 10 · 사업자 사이 22 · 최대 900)은 출처
   주석을 단 리터럴이다. 경계는 719.
6. Figma 는 `TimelineFooter`(Viewport `≥720` · `≤719`, BOOLEAN Lead)와 `TimelineFooterClip`(Tone × Interactive × State) — Semantic Color 모드를 Dark 로
   고정한다. 새 의존성 · React 표면 없음.

### 소유자 판정 — 초안의 기본값으로 정했다

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 자리 | 새 LOUIS 부품 `timeline-footer` | 원장의 안 — 제품 세트 `Product/Landing Footer` 를 이 판으로 다시 그리기 |
| 2 | 늘 다크 | 루트 `data-theme="dark"` + 시맨틱 | 고정 팔레트용 새 시맨틱 다섯(`timeline-footer-surface` 등) |
| 3 | 흐린 글자 gray-500(약 4.0) | `fg-tertiary`(gray-400, 5.75) — 보이는 변화 | 제품 값 + Known deviation |
| 4 | 선 7% · 레인 2% · 소셜 호버 6% | 알파 사다리 8% · 4% · 8% 로 접는다 | 리터럴 알파 |
| 5 | 트랙 색 | 새 시맨틱 넷 | `accent-primary` · 기존 노드 색을 빌린다 |
| 6 | 클립 Figma 축 이름 | `Tone`(CSS `data-tone` 철자 예외) | 새 축 `Track` |

## Consequences

- 새 시맨틱 넷(원시 0). 제품 (나): `TimelineFooter.tsx` 의 상수를 `louis-timeline-footer*` 로, 트랙 `contents` 감싸개에 `data-tone`, 루트에 `data-theme="dark"`.
  보이는 변화 — 사업자 라벨 · 저작권 · 눈금 글자 · 클립 메모가 한 칸 밝아진다, 선 · 레인 바닥이 조금 진해진다.
- Figma 에 `TimelineFooter` · `TimelineFooterClip` · 변수 `color/timeline-footer-track-*` 가 선다. 화면 보드 열 곳의 옛 푸터 인스턴스를 이 세트로 바꾸는 일은
  보드 쪽 작업이다(조정자).

## Rollback

`timeline-footer.css` · 토큰 넷 · 문서 · manifest 세 자리 · Figma 세트 둘 · 변수 · 기록 · parity 계약을 지운다. 제품은 아직 이 클래스를 물지 않으므로 영향이 없다.
