---
id: decision-control-size-ladder
status: experimental
authority: normative
---

# DS-D-0027 컨트롤 크기 사다리는 lg(40) · md(32) 다

- Status: accepted
- Date: 2026-08-26
- Owners: repository owner
- Affects: `semantic.global.layout.control-height-*` · `control-minimum-width-*`,
  `Button` · `IconButton` · `TextField` · `SegmentedControl` · `Slider` 의 `size` 축,
  제품의 해당 호출부, Figma `Button` 컴포넌트셋

## Context

2025-08-25 에 40 높이 버튼을 폐지하고 모든 버튼을 32 로 통일했다. 통일 자체는 옳았지만
**축 이름을 그대로 뒀다** — 그래서 `md` 와 `sm` 두 이름이 똑같이 32 를 가리키는 상태가 됐다.
이름이 둘인데 실물은 하나였고, `button.css` 는 그 사실을 주석으로 사과하고 있었다:
「md는 32로 통일 — sm과 동일 사양」.

이름이 실물보다 많으면 고르는 쪽이 손해를 본다. 디자이너는 둘 중 무엇을 써야 하는지 알 수 없고,
호출부는 아무거나 쓰며, 나중에 크기가 갈라질 때 어느 쪽이 무엇이었는지 아무도 모른다.

동시에 40 은 필요했다. 로그인·회원가입처럼 화면에 버튼이 하나뿐이고 그것이 주인공인 자리에서
32 는 작다. 폐지된 것은 「40 이라는 크기」가 아니라 「40 을 기본으로 쓰던 습관」이었다.

## Decision

**컨트롤 높이 사다리는 두 칸이다 — `lg`(40) · `md`(32).**

| 이름 | 높이 | 쓰는 곳 |
| --- | ---: | --- |
| `lg` | 40 | 화면의 주인공이 되는 제출 CTA — 로그인·회원가입 |
| `md` | 32 | 그 밖의 전부(제품 기본값) |

토큰도 같은 이름으로 옮긴다. `control-height-md`(40) → `control-height-lg`,
`control-height-sm`(32) → `control-height-md`, `control-minimum-width-sm` →
`control-minimum-width-md`.

**이 사다리를 쓰는 컴포넌트는 전부 따라간다** — `Button` · `IconButton` · `TextField` ·
`SegmentedControl` · `Slider`. 한 컴포넌트만 옮기면 `Button size="md"` 는 32 인데
`TextField size="md"` 는 40 인 함정이 생긴다.

`Spinner` 와 `Avatar` 는 따라가지 않는다. 이들의 `md`·`sm` 은 컨트롤 높이가 아니라 각자의
치수(스피너 16/12)이므로 같은 사다리가 아니다.

`Button` 의 기본값은 `md` 다. 40 을 되살리는 것이 40 을 기본으로 되돌리는 뜻은 아니다.
`IconButton` 은 `lg` 와 `md` 가 아직 둘 다 32 다 — 제품에 40 짜리 아이콘 버튼을 쓰는 자리가
없다. 축은 남겨 두고, 크기가 갈라질 때 그 자리에서 나눈다.

## Alternatives

- **Button 만 옮긴다.** 다섯 컴포넌트가 한 토큰을 공유하므로 Button 의 `md` 만 32 가 되고
  나머지의 `md` 는 40 으로 남는다. 같은 이름이 두 높이를 뜻하는, 지금보다 나쁜 상태다.
- **`sm` 을 그대로 두고 `lg` 만 추가한다.** 32 를 가리키는 이름이 `md`·`sm` 둘로 남아 원래
  문제가 그대로다.
- **`sm`(24) 을 새로 만든다.** 제품에 24 높이 컨트롤이 없다. 쓰지 않는 계단은 사다리가 아니다.

## Consequences

토큰 이름이 바뀌므로 `check-token-diff` 가 breaking 을 낸다 — 의도된 것이며 baseline 을
승인해 잠근다. **값은 하나도 바뀌지 않는다**: 40 은 여전히 40 이고 32 는 여전히 32 다.
제품에서 실제로 렌더가 달라지는 곳은 로그인·회원가입 CTA 뿐이며, 그것이 이 결정의 목적이다.
