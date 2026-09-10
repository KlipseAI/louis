---
id: decision-color-architecture
status: experimental
authority: normative
---

# DS-D-0024 색 토큰을 SEED/Toss식 scale·semantic로 재구성한다

- Status: proposed
- Date: 2026-08-25
- Owners: repository owner, design system maintainer
- Affects: 전 color primitive/semantic 토큰, `packages/tokens/src/klipse.tokens.json`, 생성물 전체,
  컴포넌트 CSS·테스트, 제품 소비처(후속), Figma 컬렉션(후속). DS-D-0023의 헤어라인 토큰 이름을 갱신한다.

## Context

색 시스템이 실무 관점에서 과복잡했다 — primitive 14계열/~120단계, 그중 **알파 5계열**
(`ink-alpha`#171b22 · `paper-alpha`#fafafa · `black-alpha`#000 · `red-alpha` · `inverse-alpha`), semantic
81역할, 그리고 light/dark가 세 메커니즘(LOUIS `[data-theme]` 모드 + 제품 `palette-gray↔gray` 반전 +
`ink/paper-alpha` 수동 분리)으로 갈렸다. SEED(scale→semantic, static-black/white-alpha)와 Toss TDS를
기준으로 단순화한다.

## Decision

**2-tier(scale→semantic), 단일 소스(LOUIS)를 제품·Figma가 그대로 소비한다.**

1. **Primitive rename/collapse.**
   - `neutral` → `gray` (0–1000, 값 동일).
   - 알파 5계열 → 2(+danger): `ink-alpha`+`black-alpha` → **`static-black-alpha`**(순수 #000),
     `paper-alpha`+`inverse-alpha` → **`static-white-alpha`**(순수 #fff), `red-alpha` 유지.
   - `blue`/`red`/`green`/`amber` + 노드 accent hue(`mint`/`yellow`/`violet`/`pink`) 유지.
2. **Semantic prefix를 SEED식으로.** `background-*`→`bg-*`, `foreground-*`→`fg-*`, `border-*`→`stroke-*`,
   `action-*`→`accent-*`, `scrim-*`→`dim-*`. 제품/컴포넌트 전용(`node-*`·`media-*`·`progress-*`)은
   네임스페이스 유지. 값·의미는 보존한다.
3. **Light/dark = 단일 메커니즘.** `Klipse Semantic Color`의 Light/Dark 모드가 유일한 소스다. 제품은
   자기 `palette-gray↔gray` 반전을 버리고 LOUIS 세만틱을 직접 소비한다(후속 Phase).
4. **DS-D-0023 갱신.** 헤어라인 색 `color-border-hairline` → `color-stroke-hairline`,
   `black-alpha.10` → `static-black-alpha.10`. 계약(inset 헤어라인)은 그대로다.

## 무엇을 하지 않기로 했나

- **알파 틴트 보존을 택하지 않았다.** `static-black/white-alpha`를 순수 흑/백으로 두어(이전 #171b22/
  #fafafa 틴트 제거) 오버레이·호버·헤어라인의 알파가 순수 흑/백이 된다 — 저알파라 거의 안 보이지만
  전 표면에 걸린다. owner가 "SEED식 순수 알파"를 택했다.
- **hue 계열을 지우지 않았다.** `mint/yellow/violet/pink`는 캔버스 7종 accent identity라 유지한다.

## Consequences

- LOUIS `check` + `test`(776)가 새 이름으로 통과한다. `verify`(figma-parity·product-parity 등)와 Figma
  라이브 컬렉션은 후속 Phase에서 재정합한다.
- 오버레이/호버/헤어라인 색이 순수 흑/백 알파로 미세하게 바뀐다(의도).
- 제품 183파일 소비처 rename + 제품 게이트 9종, Figma 3컬렉션 재구성이 후속 Phase다.

## Rollback

`packages/tokens/src/klipse.tokens.json`의 primitive/semantic 이름을 되돌리고(그리고 알파 계열 복원),
컴포넌트·테스트·문서의 참조를 원복한 뒤 재생성한다. diff baseline을 이전 스냅샷으로 되돌린다.
