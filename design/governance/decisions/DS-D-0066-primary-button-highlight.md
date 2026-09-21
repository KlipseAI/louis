---
id: decision-primary-button-highlight
status: experimental
authority: normative
---

# DS-D-0066 primary 버튼은 위아래 가장자리에 빛을 갖는다 — 활성 상태에만, ::before 에

- Status: accepted (LOUIS · Figma 2026-09-21, 제품 핀 상향은 제품 브랜치에서)
- Date: 2026-09-21
- Owners: repository owner (스펙 제공), design system maintainer
- Affects: `button`, `decision-three-in-one-change`, `decision-state-is-a-variant-axis`

## Context

소유자가 Figma 효과 설정 두 장을 주고 **「우리 블루 버튼들에 이 효과를 적용해줘. 두 그림자 모두 블렌딩
오버레이 적용이야」**라고 했다. 두 장의 값은 다음과 같다.

| 겹 | 종류 | X | Y | 흐림 | 퍼짐 | 색 | 블렌드 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 위 | Inner shadow | 0 | 1 | 1 | −0.5 | #FFFFFF 100% | Overlay |
| 아래 | Inner shadow | 0 | −1 | 1 | −0.5 | #FFFFFF 100% | Overlay |

Button set(`672:552`)의 primary 60 칸을 라이브로 세니 **효과가 하나도 없었다.** secondary 60 칸만
`INNER_SHADOW 0,0 spread 0.5`(헤어라인)를 갖는다. 이 값들은 LOUIS 파일 밖에서 왔고, 코드 · Figma 둘 다
처음 받는 스펙이다.

## Decision

1. **primary 버튼은 위아래 가장자리에 흰 안쪽 빛 두 겹을 오버레이로 섞는다.** 값은 위 표 그대로다.
2. **활성 상태에만 둔다** — Default · Hover · Active. Disabled · Loading 에는 두지 않는다.
3. **코드는 `::before` 에 싣는다.** `::after` 는 이미 주인이 있다(아래).
4. **흰색은 `color-palette-gray-000`(250)이다.** 테마에 따라 뒤집히는 `color-gray-000` 이 아니다.
5. **Figma 는 primary 활성 36 칸에 같은 두 겹을 넣고 색을 `color/palette-gray/000` 에 묶는다.** 그 변수의
   proposal scopes 에 `EFFECT_COLOR` 를 더한다(`FIGMA_EFFECT_COLOR_TOKEN_IDS`).

## 왜 활성 상태에만인가

disabled 와 loading 은 면이 `bg-inset`(회색)으로 바뀐다(`button.css` 의 disabled 규칙). loading 도
`aria-disabled="true"` 를 붙이므로 같은 면을 쓴다. 그 순간 더 이상 「블루 버튼」이 아니다. 회색 면에 흰
빛을 남기면 누를 수 있는 것처럼 도드라지고, 「실행되지 않으며 그렇게 보인다」는 disabled 계약과 어긋난다.
소유자 지시도 「블루 버튼들에」였다.

선택자는 기존 hover · active 규칙과 같은 모양을 쓴다 —
`.louis-button[data-variant="primary"]:where(:not([aria-disabled="true"]):not(:disabled))`.

## 왜 가상 요소이고, 왜 `::before` 인가

**box-shadow 는 그림자마다 블렌드 모드를 줄 수 없다.** 두 겹을 한 가상 요소에 싣고 그 요소에
`mix-blend-mode: overlay` 를 걸면 둘 다 오버레이가 된다. 버튼에는 `isolation: isolate` 를 걸어 섞임을 버튼
면 안에서 끝낸다 — 없으면 버튼 뒤의 페이지와도 섞인다.

**처음에는 `::after` 에 실었고, 브라우저 테스트가 두 건을 잡았다.** `::after` 는 `.louis-hit-target`
(`base.css`) 이 이미 쓴다 — 버튼 가운데에 최소 44px 투명 상자를 세워 터치 영역을 넓히는 장치다. 거기에
빛 규칙을 얹으면 두 가지가 동시에 깨진다.

- `pointer-events: none` 이 넓힌 터치 영역을 지운다.
- `inset: 0` 이 hit-target 의 `top/left: 50%` 를 덮고 `translate: -50% -50%` 는 남아서, 빛이 버튼
  가장자리가 아니라 44px 상자 기준으로 어긋난 자리에 그려진다.

비활성 버튼의 `::after` 가 빛 규칙과 **매치되지 않는데도** `content: ""` 를 갖고 있던 것이 단서였다.
`::before` 는 `.louis-button` · `.louis-focus-ring`(outline 으로 그린다) · `.louis-hit-target` 어디서도
쓰지 않는다. 브라우저 테스트는 이제 「활성 primary 의 `::after` 는 여전히 터치 영역이다 — pointer-events
가 none 이 아니고 높이가 44 이상이다」를 함께 단언한다. 누가 빛을 `::after` 로 되돌리면 바로 잡힌다.

## 값 — 실측

**코드.** `packages/react/test/button.browser.test.tsx` 가 Chromium 계산 스타일로 잰다.

| 대상 | 속성 | 값 |
| --- | --- | --- |
| 활성 primary `::before` | `box-shadow` | `color(srgb 0.980392 0.980392 0.980392) 0px 1px 1px -0.5px inset, … 0px -1px 1px -0.5px inset` |
| | `mix-blend-mode` | `overlay` |
| | `border-radius` | 버튼과 같다 |
| | `pointer-events` | `none` |
| 활성 primary | `isolation` | `isolate` |
| 활성 primary `::after` | `pointer-events` · 높이 | none 아님 · 44 이상 (터치 영역 그대로) |
| disabled · loading primary `::before` | `content` | `none` |
| secondary `::before` | `content` | `none` |

퍼짐 0.5 는 `--louis-border-width-hairline` 과 같은 값이라 그 토큰을 `calc(0px - …)` 로 뒤집어 쓴다.
부호를 뒤집는 데 `*` 를 쓰지 않는 이유는 `build-css` 가 `*` 를 전역 선택자로 보고 막기 때문이다 —
LOUIS 는 이미 `calc(0px - var(--louis-border-width-hairline))` 로 부호를 뒤집는다.

**Figma.** `figma-readback-emit --components --only Button` 로 다시 떴다.

| 칸 | 효과 |
| --- | --- |
| primary Default · Hover · Active 36 | `INNER_SHADOW:1:1:-0.5 + INNER_SHADOW:-1:1:-0.5`, blendMode `OVERLAY`, 색 → `color/palette-gray/000` |
| primary Disabled · Loading 24 | 없음 |

**되읽기 문자열은 블렌드 모드를 적지 않는다** — `{TYPE}:{offsetY}:{radius}:{spread}` 형식이다. 그래서
오버레이 여부는 되읽기 · parity 게이트가 아니라 브라우저 테스트(`mix-blend-mode: overlay`)와 이 문서가
남긴 라이브 확인으로 보장한다.

**parity 계약이 효과 하나만 받던 것을 넓혔다.** `verify-figma-parity` 의 `compareComponentEffects` 는 역할마다
문자열 하나를 받아 「모든 변형이 이 효과다」로 봤다. Button `self` 에는 이제 secondary 헤어라인과 primary
빛 두 가지가 선다. 계약을 **배열**로 줄 수 있게 했다 — 「변형마다 이 중 하나이고, 목록의 효과는 전부
어딘가에 선다」. 뒤 조건이 없으면 Figma 에서 빛이 통째로 사라져도 남은 헤어라인이 허용 값이라 초록이
된다. 되읽기에서 빛 줄을 지우고 스냅숏을 다시 만들면 `Button: self에 계약한 effect가 Figma 에 없습니다`
로 막히는 것을 확인했다. 문자열 계약은 그대로 동작한다. **어느 변형이 어느 효과인지는 가르지 못한다** —
되읽기가 역할별로 변형을 모아 적기 때문이다. 그 대응은 브라우저 테스트가 맡는다.

**흰색이 250 인 이유.** LOUIS 에는 #FFFFFF 토큰이 없고 가장 밝은 고정 흰색이 `palette-gray-000`
(0.980392)이다. 흰색 오버레이는 바탕 채널이 0.5 이상이면 `1 − 2(1−a)(1−b)` 로 계산되는데, b 가 1 과 0.98
일 때의 차이는 `2(1−a)·0.02` 이고 파란 면(G 0.53 · B 1.0)에서 G 채널 기준 0.019(8비트 약 5단계) · B 채널
0 이다. R 채널(0)은 두 경우 모두 0 이다. 게다가 이 빛은 가장자리 한두 픽셀에만 선다.

## 오버레이가 흰색이 아니라 하늘색으로 보이는 이유

흰색을 오버레이로 섞으면 바탕 채널이 0.5 미만인 쪽은 `2ab` 로 거의 그대로, 0.5 이상인 쪽은 1 로 치솟는다.
`accent-primary` 의 R 은 0 이라 0 에 머물고 G · B 는 1 가까이 오르므로 빛은 **하늘색 테두리**가 된다.
Figma 라이브 화면에서도 같다. 스펙이 의도한 모습이다 — 흰 선을 원했다면 블렌드를 Normal 로 줬을 것이다.

## Alternatives

- **`background-blend-mode` 와 그라디언트 두 줄.** 가상 요소가 필요 없다. 그러나 inset 그림자의 흐림 ·
  퍼짐 모양을 그라디언트로 흉내 내야 하고 모서리 곡률을 따라가지 못한다. 기각.
- **disabled · loading 에도 빛을 둔다.** 소유자 스펙(「블루 버튼들」)과 disabled 계약에 어긋난다. 기각.
  원하면 `:where(...)` 한 줄을 빼면 된다.
- **`color-gray-000` 에 묶는다.** 그 토큰은 테마에 따라 뒤집혀 다크에서 어두운 색이 된다. 빛은 두 테마
  모두 흰색이어야 한다. 기각.

## Consequences

- primary 활성 버튼 모든 곳에 빛이 선다. 소비처는 제품 핀을 올리는 순간 받는다.
- `::before` 가 이제 primary 버튼에서 쓰인다. 다른 규칙이 버튼 `::before` 를 쓰려면 이 결정과 겹치지
  않는지 먼저 본다.
- 강제 색 모드에서는 빛을 끈다(`.louis-button::before { box-shadow: none }`) — 면이 시스템 색이라 섞을
  대상이 없다.
- 제품 쪽에 같은 효과를 먼저 넣어 둔 로컬 사본이 있다면, 핀을 올리는 커밋에서 함께 지운다. 둘이 겹치면
  빛이 두 번 선다.

## Rollout and verification

- LOUIS: `packages/css/src/component/button.css` · `scripts/lib/token-model.mjs` ·
  `scripts/verify-figma-parity.mjs`(효과 계약을 배열로) · 생성물 재빌드 ·
  `packages/react/test/button.browser.test.tsx` 한 건(Acceptance). `pnpm test` 104 파일 · 1098 통과.
- Figma(`OlYKERKOkgbxBEEoXGZW2c`): primary 활성 36 칸 효과 · `color/palette-gray/000` scopes 에
  `EFFECT_COLOR`. 되읽기는 Button 컴포넌트를 `--merge`, 변수 행은 `--remove-variables` 뒤
  `--merge-variables` 로 넣어 scopes 열이 새 proposal 값을 받게 했다(Updates (143) 과 같은 절차).
  스냅숏 재생성, baseline manifest 해시를 같은 값으로 잠갔다.
- 제품: 핀 상향은 제품 브랜치의 일이다.
