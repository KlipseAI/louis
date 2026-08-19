---
id: decision-icon-size-axis
status: experimental
authority: normative
---

# DS-D-0021 아이콘은 크기 variant 없이 rescale로 놓는다

- Status: proposed
- Date: 2026-08-18
- Owners: repository owner, design system maintainer
- Affects: Figma 아이콘 31개와 인스턴스 146개, `icon-size-*` 토큰 4종, iconography.md

## Context

코드의 아이콘은 `viewBox="0 0 24 24"`에 `stroke-width="1.5"`를 담은 SVG다. 크기는 CSS가 정하므로
**획이 크기를 따라 함께 줄어든다** — 20px에서 `1.5 × 20/24 = 1.25`, 16px에서 `1.0`, 64px에서 `4`다.
Phosphor와 Lucide를 비롯한 표준 세트가 같게 동작한다.

Figma에서는 인스턴스를 **어떻게 줄이느냐**에 따라 결과가 갈린다. 실측했다.

| 방법 | 20px에서의 stroke |
| --- | --- |
| `resize(20, 20)` | **1.5** — 크기만 바뀌고 획이 남는다 |
| `rescale(20 / 24)` | **1.25** — 기하와 획이 함께 줄어든다 |
| 코드(SVG viewBox) | **1.25** |

`constraints: SCALE`을 걸어도 `resize`의 결과는 바뀌지 않는다. 이것도 실측했다.

**파일의 아이콘 인스턴스 146개가 전부 `resize`로 놓여 있었다.** 그래서 20px 자리의 아이콘이
Figma에서는 1.5, 코드에서는 1.25로 그려지고 있었다 — 같은 아이콘이 두 도구에서 다른 굵기였다.

## Decision

**크기 variant를 만들지 않는다. 대신 인스턴스를 `rescale`로 놓는다.**

1. 아이콘 컴포넌트는 24×24 하나다. 31개 × 크기 4종 = 124 variant는 유지 비용이 이득보다 크고,
   아이콘 하나를 고칠 때마다 네 곳을 고쳐야 한다.
2. 인스턴스는 **`rescale(target / 24)`**로 놓는다. Figma UI에서는 Scale 도구(⌘K)가 같은 동작이며,
   일반 크기 조절 핸들은 **쓰지 않는다.**
3. `icon-size-*` 토큰 4종(16 · 20 · 24 · 64)이 허용 크기의 정본이다. 그 밖의 크기는 쓰지 않는다.
4. **게이트가 실제 획 두께를 본다.** 크기별 기대값은 `1.5 × size / 24`이며, 어긋나면 누군가
   `resize`로 놓은 것이다.

## Consequences

- 디자이너가 크기 조절 핸들로 아이콘을 줄이면 게이트가 잡는다. 불편해 보이지만, 그것이 코드와
  다른 그림이 파일에 남는 유일한 경로다.
- 64px 자리(EmptyState의 그래픽 슬롯)에서 획이 4px가 된다. 그것이 코드의 값이므로 그대로 둔다 —
  일러스트레이션이 필요하다면 아이콘이 아니라 별도 축이며 그 판정은 여기 없다.
- 아이콘을 추가할 때 크기 작업이 없다. 24 하나만 그리면 모든 자리가 따라온다.

## Rollback

크기 variant를 만들기로 하면 아이콘 31개에 `Size` 축을 열고 각 variant의 stroke를
`1.5 × size / 24`로 굳힌다. 그때 아래 stroke 게이트를 지운다. 되돌리면 아이콘 하나를 고칠 때
고칠 자리가 네 곳이 된다.
