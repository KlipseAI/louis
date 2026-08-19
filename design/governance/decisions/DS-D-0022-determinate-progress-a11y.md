---
id: decision-determinate-progress-a11y
status: experimental
authority: normative
---

# DS-D-0022 determinate 진행률의 접근성 계약을 DS가 정한다

- Status: proposed
- Date: 2026-08-19
- Owners: repository owner, design system maintainer
- Affects: ProgressBar · ProgressRing, Avatar의 링 판정, 인계서 (1c)

## 무엇이 막혀 있었나

인계서 (1c)가 determinate 진행률을 **접근성 계약이 없다**는 이유로 막아 두었다. 근거는 실측이었다 —
배포본 전체에 `role="progressbar"`가 **1곳**, `<progress>`는 **0곳**이다. 진행바 정의는 셋이고
두께·색·전환이 서로 다르다.

즉 제품에는 옮겨 올 접근성 계약이 없다. **없는 것을 기다리면 영원히 막힌다.** DS가 정한다.

## 결정

**1. 값을 갖는 요소가 `role="progressbar"`를 갖는다.** 트랙이 값을 갖고 채움은 장식이다
(`aria-hidden`). 채움에 role을 걸면 폭이 0일 때 요소가 사라지는 구현에서 이름째 사라진다.

**2. determinate는 `aria-valuenow` · `aria-valuemin` · `aria-valuemax`를 전부 적는다.**
`valuemin`/`valuemax`는 기본값이 있지만 생략하면 보조기술마다 다르게 읽는다.

**3. indeterminate는 `aria-valuenow`를 아예 넣지 않는다.** 0을 넣으면 "0% 완료"로 읽히고,
그것은 "얼마나 걸릴지 모른다"와 다른 말이다.

**4. 이름은 컴포넌트가 만들지 않는다.** `aria-label` 또는 `aria-labelledby`를 소비처가 준다.
"진행률"이라는 이름은 무엇의 진행률인지 말하지 않는다. 개발 빌드에서 이름이 없으면 경고한다.

**5. 퍼센트만으로 뜻이 서지 않으면 `aria-valuetext`를 준다.** "3분 남음", "12개 중 7개"처럼
사람이 쓰는 단위가 있을 때 숫자만 읽어 주는 것은 정보를 잃는 것이다.

**6. 색은 유일한 채널이 될 수 없다.** 진행 상태를 색으로만 전달하지 않는다 — 값이 DOM에 있고
스크린 리더가 읽는다는 것이 이 계약의 요지다.

**7. indeterminate의 loop은 `prefers-reduced-motion`에서 멈춘다.** DS-D-0016을 따른다. 멈춘 뒤에도
`role`과 이름이 남으므로 "작업 중"이라는 뜻은 유지된다.

## 무엇을 하지 않기로 했나

`<progress>` 요소를 쓰지 않는다. 브라우저마다 그리는 방식이 달라 트랙·채움을 토큰으로 물릴 수
없고, Safari에서는 `appearance: none` 뒤에도 채움의 곡률을 제어할 수 없다. 제품도 0곳이다.

## 이 결정이 여는 것

- `ProgressBar` — 선형 determinate·indeterminate
- `ProgressRing` — 원형. 아바타를 감싸는 사용량 링이며 [Avatar 판정](../../components/avatar.md)이
  "링은 Avatar가 소유하지 않는다"로 미뤄 둔 자리다

## Rollback

이 계약을 되돌리려면 두 컴포넌트의 `role`·`aria-*` 계약을 규범 문서에서 지우고 acceptance test를
함께 지운다. 그 경우 진행률은 **시각 전용**이 되므로 컴포넌트를 내리는 것이 맞다 — 값을 전달하지
못하는 진행률은 장식이고, 장식은 컴포넌트가 아니다.
