---
id: decision-copy-panel
status: experimental
authority: normative
---

# DS-D-0110 제목 · 복사 동작 · 원문 한 덩이를 담는 새 부품 `copy-panel` — 템플릿 상세의 프롬프트 상자, 머리는 Section Header `article`

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Affects: `copy-panel`, `button`, `section-header`, `decision-product-parts-become-louis`

## Context

표면 원장의 `app/templates/[slug]/page.tsx` 의 `TemplateDetailPage` 가 `needed` 로 남았다. 그 화면이 자기만 갖는 조판은 둘이다 —
아티클 헤더와 프롬프트 상자. 아티클 헤더는 [Section Header](../../components/section-header.md) 의 `data-level="article"` 이 이미 갖는다
(그 문서의 단 표가 이 파일을 근거로 든다). 미리보기 배너는 이미 `louis-alert` 를 문다. **남는 것은 프롬프트 상자다** — 4% 면 · 8% 선 ·
반경 16 · 안쪽 20 에 제목 줄(body-20 semibold + 복사 버튼)과 줄바꿈을 그대로 보이는 원문(body-16 · `--text-soft`)이 선다
(`app/templates/[slug]/page.tsx` 의 `PROMPT_SECTION_CLASS` · `PROMPT_HEAD_CLASS` · `PROMPT_TITLE_CLASS` · `PROMPT_BOX_CLASS`, 통합 판 `54b62a8aa`).
복사 버튼은 `components/templates/CopyPromptButton.tsx` 의 Button secondary md 이고 「복사됨」은 글리프 · 라벨 교체다.

[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 1항은 제품에 보이는 부품을 LOUIS 부품으로 올리라고 한다. 소비처가 하나여도 지금
올린다(같은 결정의 「작은 새 부품」 판단 2).

## Decision

1. **새 부품 `copy-panel` 한 벌**(`.louis-copy-panel` · `__head` · `__title` · `__action` · `__body`). 이름은 쓰임(프롬프트)이 아니라 모양
   (복사할 원문을 담는 면)으로 짓는다 — 같은 모양의 다음 소비처(예: 코드 조각 · 공유 문구)가 이름을 바꾸지 않고 쓴다.
2. **면은 랜딩 면 사다리** — `landing-panel`(4%) · `color-gray-000-alpha-08` 선 1 · 반경 `radius-overlay`(16) · 안쪽 `space-media-inset`(20) ·
   머리와 원문 사이 `space-stack-md`(12). 원문 잉크 `landing-text-soft`(72%), 제목 `fg-primary` body-lg semibold.
3. **동작은 [Button](../../components/button.md) 그대로**(secondary · md, 앞 글리프 `copy` → `copy-check`). 레시피는 `__action` 이 줄지 않게만 한다.
4. **글 머리는 Section Header `article` 이다** — 이 부품에 머리를 넣지 않는다.
5. 새 토큰 · 새 의존성 · React 표면 없음.

### 소유자 판정 — 초안의 기본값으로 정했다

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 자리 | 새 부품 `copy-panel` | Alert 중립 톤(Alert 에는 중립 톤이 없고 제목 · 동작 줄이 없다) · 화면 조립(면 · 글자 · 버튼) |
| 2 | 반경 16 | `radius-overlay`(같은 값) | `radius-card-lg` 20 · `radius-card` 12 로 접기 |
| 3 | 머리 쌓임 경계 | 제품 640 을 LOUIS compact 경계 719 로 접는다 | 640 을 레시피에(새 경계) |
| 4 | 「복사됨」 | 글리프 · 라벨 교체(Figma 축 없음) — 노드 캔버스 묶음 판단과 같다 | 조건 축 `Copied` |
| 5 | 긴 낱말 끊기 | `overflow-wrap: anywhere`(칸 안에서 끊는다) | 제품 `word-break: break-word`(비표준 값) |

## Consequences

- 제품 (나): `PROMPT_*` 상수 넷을 `louis-copy-panel*` 로, `CopyPromptButton` 에 `louis-copy-panel__action` 을 붙인다. 보이는 변화 —
  640 ~ 719 폭에서 머리가 쌓인다.
- Figma 에 `CopyPanel`(Layout base · compact) 세트가 선다.

## Rollback

`copy-panel.css` · 문서 · manifest 세 자리 · Figma 세트 · 기록 · parity 계약을 지운다. 제품은 아직 이 클래스를 물지 않으므로 영향이 없다.
