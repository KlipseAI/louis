---
id: decision-figma-done-without-publish
status: experimental
authority: normative
---

# DS-D-0035 `figma: done` 은 게시가 아니라 대조로 정의한다

- Status: accepted
- Date: 2026-09-01
- Owners: repository owner
- Affects: `design/manifest.json` 의 `figma` 상태, `governance-contributing`,
  `governance-execution-handoff`, `governance-execution-playbook`, `governance-figma-sync`,
  `governance-operating-model`, [DS-D-0025](DS-D-0025-figma-as-projection.md) 항목 1

## Context

세 곳이 같은 문장을 갖고 있었다 — `figma: done` 은 **published library** key/version 이 있을 때만
쓴다([contributing](../contributing.md) 「완료 정의」 · [execution-handoff](../execution-handoff.md)
「상태 승격 규칙」 표 · [execution-playbook](../execution-playbook.md) DS-F-008 5항). 그리고
[DS-D-0025](DS-D-0025-figma-as-projection.md) 가 「발행하지 않는다」를 정하면서 그 정의를 근거로
**`done` 승격을 추구하지 않는다**로 닫았다.

2026-09-01 세 축 감사가 그 상태를 blocker 로 올렸다 — `manifest` 의 컴포넌트 40 · 패턴 8 중
`figma: "done"` 이 **0** 이고, 그 0 은 48개의 독립 결손이 아니라 **미게시라는 단일 차단점**에
막혀 있다. 감사의 해법은 「소유자가 Figma UI 에서 라이브러리를 publish 한다」였다.

소유자의 답이 그 해법을 뒤집었다.

> **「왜 게시해야 해 지금 나만 쓰는데」**

이 지적이 맞다. Figma 에서 publish 가 사는 곳은 **파일 경계**다. 같은 파일 안에서는 미게시
컴포넌트도 Assets 의 로컬 목록에서 그대로 인스턴스가 된다. 게시가 필요해지는 것은 **다른 파일이
소비할 때**다. DS-D-0025 가 그 사실을 이미 정확히 적어 두었다 — 「Figma 에서 미발행 파일의
컴포넌트·변수·스타일은 **다른 파일이** 소비할 수 없다」. 그 문장의 「다른 파일이」를 정의가
받아 적지 않았을 뿐이다.

지금 LOUIS 파일 `OlYKERKOkgbxBEEoXGZW2c` 하나에 DS 컴포넌트와 제품 화면 보드가 함께 있다.
소비자가 그 파일 안에 있으므로 게시의 기능적 이득은 0 이고, 대가는 DS-D-0025 가 적은 그대로다 —
이름이 계약이 되어 이후 rename·삭제가 구독 파일의 바인딩을 깬다.

**그래서 0 은 미달이 아니라 「재지 않는 축으로 재고 있었다」였다.** 실제 상태는 `partial` 39 +
`not-planned` 1 이고, `partial` 의 정의(reviewable library draft + stable key + parity report)를
39 개가 이미 만족한다. 그 위에 남은 것이 형식 요건 한 칸이었다.

## Decision

**`figma: done` 을 게시가 아니라 두 방향 대조로 정의한다.** 아래 셋을 **전부** 만족할 때만 쓴다.

| 조건 | 무엇을 요구하나 | 무엇이 그것을 지키나 |
| --- | --- | --- |
| (a) 소비 가능 | component set 이 LOUIS 파일 안에 서 있고, `figma/readback.json` 의 `components` 에 등재되며 description 을 갖는다 | `verify-figma-parity` 의 「component set 이 snapshot 에 없습니다」·「description 이 없습니다」 |
| (b) parity 가 게이트로 지켜진다 | `scripts/verify-figma-parity.mjs` 의 `COMPONENT_CONTRACTS` 에 그 이름이 있고, Figma 의 **모든** property 가 계약에 선언돼 있다 | 같은 게이트. variant 축은 코드 타입 union 과, Figma 전용 축은 사유가 붙은 선언과 대조하고, **선언되지 않은 property 는 실패**다 |
| (c) evidence 가 두 방향이고 **좁혀지지 않았다** | 계약에 `geometry` 가 붙어 `figma/components.measured.json` 의 실측값을 가리키고, **그 실측값을 코드가 여전히 만드는지 재는 브라우저 테스트가 있으며**, 계약의 대조 범위가 되읽기의 기하 키를 전부 덮는다 | 앞쪽은 `verify-figma-parity`, 뒤쪽은 `packages/react/test/*.browser.test.tsx`, 범위는 `scripts/verify-figma-done.mjs` |

**(c) 의 뒷절이 이 정의의 무게다.** `figma/components.measured.json` 은 머리말이 스스로
「두 방향이 다 걸려야 코드-Figma 격차가 조용히 벌어지지 않는다」고 적는 파일이다. 한 방향만
걸려 있으면 코드가 움직였을 때 그 기록과 Figma 를 같이 옮겨 초록을 유지할 수 있고, 그렇게 유지된
초록은 아무것도 말하지 않는다. 게시 여부는 이 위험에 대해 아무 말도 하지 않으므로, `done` 의
조건으로서 자리를 잘못 잡고 있었다.

`partial` 의 정의는 그대로다 — reviewable draft + stable key + parity report. `done` 은 그 위에
(b)(c) 를 더한 것이고, 세 상태의 차이는 이제 **누가 무엇을 자동으로 재는가**로만 갈린다.

### 게시는 지우지 않는다 — 조건이 바뀌는 시점으로 옮긴다

다음 둘 중 **하나라도 실제로 일어나면** published library key/version 이 `done` 의 조건으로
되살아난다.

1. **파일이 갈라질 때.** Foundations/Components/Templates 3-파일 분리(execution-playbook DS-F-009).
   그 순간 소비자가 파일 밖으로 나가고, 미게시 파일의 컴포넌트는 건너가지 못한다.
2. **외부 소비자가 생길 때.** LOUIS 파일이 아닌 Figma 파일, 또는 소유자 아닌 사람이 컴포넌트를
   인스턴스로 소비해야 할 때.

그 전까지 publish 는 남은 과제가 아니다. 둘 중 하나가 오면 이 결정을 superseded 로 바꾸고
DS-F-008(Publish 운영 절차)을 다시 연다. **DS-F-008 은 삭제하지 않는다** — 그날 필요한 절차가
거기 이미 적혀 있다.

### DS-D-0025 와의 관계

DS-D-0025 의 본체(A 모델 — 코드가 정본, Figma 는 projection, 발행하지 않는다)는 **그대로 선다.**
이 결정은 그 결론이 아니라 **거기 붙어 있던 부작용 한 줄**을 뒤집는다. DS-D-0025 항목 1 은
「`figma: done` 승격을 추구하지 않는다 … 상태는 의도적으로 `not-ready` 에 머문다」였는데, 그
문장의 근거가 「승격 조건이 published library 를 요구하므로」다. 조건이 바뀌면 그 추론이 서지
않는다. 발행하지 않겠다는 선택과 「무엇이 되면 다 된 것인가」는 별개의 질문이고, DS-D-0025 는
둘을 한 문장에 묶고 있었다.

부수적으로 그 항목의 「`not-ready` 에 머문다」는 이미 사실이 아니었다 — 지금 39 개가 `partial`
이다. 이 결정이 그 표현도 함께 정정한다.

## Alternatives

- **게시한다(감사의 해법).** 컴포넌트를 다른 파일에서 쓸 수 있고 변수 수동 복사가 사라진다.
  대가는 DS-D-0025 가 이미 잰 그대로 — 이름이 계약이 되어 아키텍처가 `experimental` 인 지금
  rename 이 비싸진다. **그리고 소비자가 0 이므로 지금은 이득 쪽이 0 이다.** 얻는 것이 없는 대가는
  치르지 않는다.
- **정의를 그대로 두고 `done` 0 을 유지한다(DS-D-0025 현행).** 정직해 보이지만 **틀린 축을
  잰다.** 「published 인가」는 파일 경계에 대한 질문이고 「Figma 가 코드와 맞는가」는 대조에 대한
  질문인데, 카탈로그의 상태 칸은 후자를 말하는 자리다. 전자로 후자를 대신하면 실제로 대조가
  깨져도 상태는 움직이지 않는다 — 이미 `partial` 39 가 그 무감각을 보여 준다.
- **정의에서 게시를 통째로 지운다.** 지금 결과는 같지만, 파일이 갈라지는 날 아무도 그 요건을
  다시 요구하지 않는다. 조건은 사라진 것이 아니라 **적용 시점이 다른 것**이므로 시점과 함께
  남긴다.
- **`done` 대신 새 상태 이름을 만든다**(예: `verified`). 상태 4단계는 manifest schema · progress
  board · llms 출력이 함께 쓰는 어휘라 한 칸을 늘리면 그 셋이 전부 움직인다. 정의를 고치는 쪽이
  작다.

## Consequences

### 39 개를 다시 판정했다 — `done` 17 · `partial` 22

일괄 승격하지 않았다. 컴포넌트마다 (a)(b)(c) 를 각각 확인했고, 서지 않으면 무엇이 없어서
`partial` 인지 manifest 의 `note` 에 적었다.

`done` 17: Avatar · Badge · Button · Checkbox · Dialog · EmptyState · IconButton · TextField(input) ·
Menu/Popover · Progress · ProjectCard · SelectableListRow · Skeleton · Slider · Spinner · Toast ·
Tooltip.

`partial` 로 남은 22 는 전부 **(c) 에서 걸린다.** (a)(b) 는 51 개 계약 전부가 이미 만족한다 —
description 이 없는 set 0, raw fill/stroke 를 가진 set 0, 미선언 property 0.

| 왜 아직 `partial` 인가 | 수 | 누가 |
| --- | ---: | --- |
| 계약에 `geometry` 가 없다 — Figma 치수가 코드 실측과 **한 번도 만나지 않는다** | 11 | alert · breadcrumb · form-message · keycap · node-chip · pane-divider · segmented-control · switch · table · tabs · video-player |
| `geometry` 는 있으나 **역방향 브라우저 테스트가 없다** — 기록과 Figma 만 맞으면 초록이다 | 10 | app-shell-parts(SidebarBrand·SidebarCta) · banner-carousel · carousel-arrow · faq-row · gnb-menu-item · inline-loading-label · media-card · news-card · segmented-code-input · step-tile |
| 둘 다 있으나 **대조 범위가 좁혀져 있다** | 1 | segmented-control-item |

두 번째 줄의 열 중 여덟(carousel-arrow · faq-row · gnb-menu-item · inline-loading-label ·
media-card · news-card · segmented-code-input · step-tile)은 LOUIS 에 코드가 아직 없는
`figmaAhead` 계약이다. 그쪽의 (c) 는 **LOUIS 레시피가 서야 열린다** — Figma 를 더 그려서 닫히는
결손이 아니다.

### 셋째 줄은 손으로 읽다가 나왔고, 그래서 게이트를 넓혔다

`segmented-control-item` 은 (a)(b)(c) 를 형식적으로 전부 만족한다 — 계약에 `geometry` 가 붙었고
그 실측을 `segmented-control.browser.test.tsx` 가 되잰다. **그런데 계약이 `sizeKeys: ["lg", "md"]`
로 대조 범위를 좁혀 놓았고, Figma set 은 `xs` 를 함께 그린다.** 그 `xs` 는 제품 정본·CSS·Figma
세 곳이 서로 다른 값을 갖는 미결 축이라(계약 주석이 그 셋을 나란히 적어 두었다) 대조 밖에 있는
것이 의도된 상태다. **붙어 있음과 덮고 있음은 다르다.**

첫 판정에서 이것을 `done` 으로 셌다가 계약을 읽고 되돌렸고, 같은 변경에서 `verify-figma-done` 에
「되읽기의 기하 키를 계약이 전부 덮는가」를 더했다. 손으로만 잡히는 축을 그대로 두면 다음 승격에서
같은 실수가 난다. 나머지 16 개는 이 축에서도 빈틈이 없다.

`segmented-control` 과 `segmented-control-item` 이 둘 다 `partial` 인 사유는 서로 다르다 — 부모는
`geometry` 자체가 비어 있고, 자식은 있으나 좁다. manifest 의 `note` 가 그 차이를 갖는다.

### 패턴 8 은 전부 `partial` 로 남는다

패턴의 대조 상대는 `figma/templates.measured.json` 이고, 그 파일은 컴포넌트 쪽과 달리 **제품
저장소를 고정 커밋에서 잰 값**이다(`migration/product-evidence.lock.json` 의 `productRef`).
그 앵커가 제품보다 낙후돼 있어 (c) 의 「지금 코드가 그 값을 만든다」가 서지 않는다. 앵커
재고정은 별건이고, 그때 패턴을 다시 판정한다.

### 하류

- 각 컴포넌트 문서의 Availability `Figma` 행과 근거를 같은 변경에서 고쳤다. `build-design-docs`
  가 manifest 와 그 행의 일치를 강제하므로 한쪽만 고치면 `pnpm check` 가 빨개진다.
- 「완성」 쪽에서도 publish 를 전제로 적던 자리 셋을 같은 기준으로 고쳤다 — execution-playbook
  의 목표 B 와 최종 판정표 5 항, operating-model 의 소유권 표. 셋 다 「published library 의
  … 가 코드와 parity 검증됨」이라 (b)(c) 를 게시로 대신 부르고 있었다.
- `design/llms/*.txt` 는 생성물이라 손대지 않는다. 원천이 바뀌면 `pnpm build:docs` 가 낸다.

### 남은 위험

이 정의는 **역방향 테스트의 존재**에 매달려 있다. 누가 `*.browser.test.tsx` 에서 `sizes` 단언을
지우면 (c) 가 조용히 무너진다. 그래서 정의와 같은 변경에서 `scripts/verify-figma-done.mjs` 를
세웠다 — manifest 가 `done` 이라고 적은 항목마다 (a)(b)(c) 를 다시 계산하고, 서지 않으면
실패한다. 정의를 문서에만 두면 이 결정은 「게시」와 똑같은 종류의 미검사 요건이 된다.

## Rollout and verification

- `pnpm check` — `build-design-docs` 가 manifest ↔ 문서 Availability 일치를, `build-llms-docs` 가
  생성물 최신을 본다.
- `node ./scripts/verify-doc-paths.mjs` · `node ./scripts/verify-record-citations.mjs`
- `node ./scripts/verify-figma-done.mjs` — 이 결정의 (a)(b)(c) 를 manifest 에 대고 다시 계산한다.
- `pnpm verify:ci` — 위 게이트를 포함해 전량.
