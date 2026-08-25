---
id: decision-tailwind-interop
status: experimental
authority: normative
---

# DS-D-0013 Tailwind 4 interop

- Status: proposed
- Date: 2026-08-15
- Owners: repository owner, package maintainer
- Affects: `@klipse-design/css`, DS-D-0004, 제품 adoption(P5)

## Context

**배포 환경이 Tailwind 4다.** 제품은 `tailwindcss ^4.3.3`을 쓰고, `@theme inline` 블록을 **생성기로**
만들고 있다(`check-tailwind-theme --write`). 그 생성기의 입력은 제품의 `globals.css`다.

그래서 지금은 **제품 CSS가 토큰의 정본**이다. DS가 토큰을 바꿔도 제품의 Tailwind 유틸리티는 따라오지
않는다. 반대로 제품이 색을 바꾸면 DS와 조용히 갈라진다 — 실제로 205축 중 143축이 그렇게 갈라져
있었다([`migration/component-parity.md`](../../../migration/component-parity.md)).

[DS-D-0004](DS-D-0004-css-authoring.md)는 "소비 제품은 Next.js App Router이고 **Tailwind 사용 여부는
고정할 수 없다**"를 근거로 authored plain CSS를 택했다. 그 전제가 이제 바뀌었다 — 소비 제품은
Tailwind 4를 쓴다.

## Decision

**토큰은 Tailwind 4 `@theme inline` 레이어로도 발행하고, 컴포넌트 CSS는 authored plain CSS로
남긴다.** DS-D-0004를 뒤집지 않고 그 전제 변화가 실제로 영향을 주는 범위만 바꾼다.

1. `packages/css/generated/theme.css`를 token manifest에서 생성한다. `@klipse-design/css/theme.css`로
   내보낸다.
2. 값은 리터럴이 아니라 `var(--louis-*)`를 가리킨다. `tokens.css`를 함께 불러야 동작한다.
3. `@theme` 가 아니라 **`@theme inline`** 이다. semantic 색이 `:root`와 `[data-theme="dark"]`에서
   각각 정의되어 런타임에 바뀌므로, inline이 아니면 Tailwind가 빌드 시점 값을 구워 넣어 테마 전환을
   따라가지 않는다.
4. Tailwind에 대응 namespace가 없는 범주(`layer`, `border-width`, `motion`)도 변수로 내보낸다.
   유틸리티는 생기지 않고 `[z-index:var(--louis-layer-modal)]` 같은 임의값으로 쓴다.
5. **매핑되지 않은 토큰 접두사를 만나면 생성이 실패한다.** 새 범주가 생겼는데 매핑을 빠뜨리면
   조용히 사라지기 때문이다.
6. Tailwind의 기본 팔레트를 지우는 `--color-*: initial`은 **내보내지 않는다.** 그것은 소비하는
   쪽의 선택이며 package가 강요할 것이 아니다.

## 왜 컴포넌트까지 가지 않는가

유틸리티를 package로 내보내면 셋이 따라온다.

- 소비하는 쪽이 Tailwind를 **반드시** 갖춰야 한다. plain CSS는 아무 데서나 동작한다.
- 같은 클래스가 소비자의 Tailwind 설정에 따라 다른 결과를 낸다. 제품은 `--spacing: 2px` 격자를
  쓰므로 `p-4`가 8px이다 — DS가 같은 문자열을 내보내면 소비자마다 다른 값이 된다.
- cascade layer가 주는 예측 가능한 override 계약이 사라진다. 제품 자신이 이 함정을 주석으로 적어
  두었다 — 레이어 안의 유틸리티는 레이어 밖 모듈 CSS에 **특이도와 무관하게 진다**.

컴포넌트는 `.louis-*` 클래스와 `data-*` 상태를 유지한다. 제품은 DS React 컴포넌트를 쓰거나, 쓰지 않는
자리에서는 DS 토큰 유틸리티로 직접 짓는다.

## Consequences

- 제품의 `@theme` 생성기가 `globals.css` 대신 이 파일을 입력으로 삼을 수 있다. 토큰 정본이 DS로 넘어온다.
- DS 토큰 하나를 바꾸면 CSS 변수와 Tailwind 유틸리티가 **같은 생성에서 함께** 바뀐다.
- 새 output 파일 하나가 늘고 build/check 체인에 한 단계가 붙는다. 게이트가 drift를 잡는다.
- 런타임 의존성은 늘지 않는다. `@klipse-design/css`는 여전히 정적 CSS만 배포한다.

## Rollback

`packages/css/generated/theme.css`와 `scripts/build-tailwind-theme.mjs`를 지우고 package export와
build/check 체인에서 한 줄씩 뺀다. 컴포넌트 CSS와 토큰 파이프라인은 손대지 않았으므로 나머지는
그대로 동작한다.

## Acceptance tests

1. 생성물이 byte-for-byte 재현된다(`--check`).
2. 매핑되지 않은 토큰 접두사가 생기면 생성이 실패한다.
3. `@theme inline`이며 값이 `var(--louis-*)`를 가리킨다 — 리터럴 색이 들어가지 않는다.
4. semantic token 수와 theme 항목 수가 일치한다(유틸리티 + 변수 전용).
