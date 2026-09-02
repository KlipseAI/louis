---
id: decision-board-composition-denominator
status: experimental
authority: normative
---

# DS-D-0042 화면 보드의 분모는 «컴포넌트 후보»다 — 도형 전수가 아니다

- Status: accepted (측정기·게이트 rollout 완료 2026-09-02)
- Date: 2026-09-02
- Owners: repository owner (분모 판단 위임), design system maintainer
- Affects: `decision-product-surface-denominator`, `decision-icons-are-an-asset-axis`,
  `governance-figma-sync`, `decision-figma-as-projection`

## Context

화면 보드의 커버리지는 지금까지 「보드가 있는가」였다. `check-figma-app-screens` 는 런너 36개가
생성물과 byte-for-byte 같은지를 보고, `check-figma-surface-coverage` 는 제품 표면 400종이
분류돼 있는지를 본다. **어느 쪽도 보드 «안»이 무엇으로 그려졌는지는 보지 않는다.** 그래서
「화면 보드가 라우트 43/46 에 있다」가 커버리지처럼 읽혔다. 실제로는 그림이 43장 있다는 뜻이었다.

2026-09-02 에 `figma/app-screens.plan.json` 이 내는 런너 36조각의 `P` payload 를 훑어 실측했다.
인스턴스로 붙인 것 **43(4.4%)**, 원시 도형으로 그린 것 **933(95.6%)**. 인스턴스로 쓰는 컴포넌트는
넷뿐이다 — `Product/Gnb Desktop Shell` 18 · `Product/Mobile App Top Bar` 11 ·
`Product/Desktop App Top Bar` 10 · `Product/Upgrade Plan Card` 4. 원시 도형 중 `<button>` 이
98개인데 LOUIS 에 `Button` 이 있고, `/settings` 보드의 테마·언어 세그먼트는 `SegmentedControl` 이
있는데도 raw 다.

소유자가 참고로 지정한 Linear Design System 파일의 「화면」 section 은 정반대다 — `Issue Page` 는
symbol 78 + frame 21 이고 직속 자식이 `State=Default`/`State=Hover` 같은 variant 다. 화면은
«부품의 집»이고, 우리 보드는 «그림»이다.

**그런데 raw 933 전부가 컴포넌트가 되어야 하는 것은 아니다.** 레이아웃 컨테이너까지 컴포넌트로
만들면 Linear 도 하지 않는 일을 하게 된다 — Linear 도 `Issue Page` 안에 frame 21 개를 그대로
둔다. 그래서 세기 전에 분모를 정해야 한다. DS-D-0037 이 표면 축에서 배운 것과 같다: **규칙 없이
센 수는 비율이 아니다.**

## Decision

**원시 노드가 컴포넌트 후보인 것은 넷 중 하나일 때다.**

| 조항 | 무엇 | 왜 |
| --- | --- | --- |
| (a) | 상호작용 요소 — `button`·`a`·`input`·`select`·`textarea`·`summary` | 누르는 것은 반드시 상태 축(hover/pressed/disabled)을 갖는다. 도형에는 상태를 담을 자리가 없다 — variant 를 나르는 것은 컴포넌트뿐이다 |
| (b) | 벡터 마크 — `svg` | LOUIS 에 아이콘 31종이 이미 컴포넌트로 서 있다 |
| (c) | 칠해진 마크 — 칠해져 있고 «자식이 없거나» 자손에 글자도 다른 칠도 없는 노드 | 감쌀 내용이 없는데 칠해진 것은 프레임이 아니라 그려진 원자다(트랙·점·칩·원형 아바타 자리) |
| (d) | 칠해진 컨트롤 묶음 — 칠해져 있고 상호작용 자식이 2개 이상 | 묶음의 패딩·간격·선택 표시를 나르는 것은 묶음 컴포넌트다. 자식만 인스턴스로 바꾸면 묶음은 손으로 그린 도형으로 남는다 |

**그 밖의 모든 것은 구조이며 분모 밖이다** — 칠 없는 auto-layout 프레임 · 자기가 감싸는 것을
칠하는 프레임 · TEXT 잎 · 이미지. Figma 의 FRAME·TEXT·IMAGE 가 그것들의 정본이고, 컴포넌트로
만들면 재사용 계약이 없는 껍데기가 된다.

**판정은 넷이다.** `replaceable`(대응이 있고 지금 인스턴스로 놓을 수 있다) ·
`blocked`(대응은 있는데 측정이 그것을 고를 정보를 잃었다) · `missing`(컴포넌트여야 하는데 LOUIS 에
그 축이 없다) · `structural`(컴포넌트가 아닌 것이 맞다). 어느 판정도 사유 없이 넘어가지 못한다.

셋이 아니라 넷인 이유는 **`svg` 를 적을 자리가 없었기 때문**이다. LOUIS 에는 아이콘 31종이
«있다». 그런데 런너 payload 의 축약이 아이콘의 정체(path·이름)를 버려서 어느 것인지 기계가 고를
수 없다. `replaceable` 로 세면 「지금 바꾸면 된다」가 거짓말이 되고(무엇으로 바꿀지 모른다),
`missing` 으로 세면 「LOUIS 에 없다」가 거짓말이 된다. 어느 쪽으로 접든 읽는 사람이 틀린 일을
한다. `blocked` 가 고칠 곳은 Figma 가 아니라 **생성기**다.

**비율의 분모는 인스턴스 + 대체 가능이다.** 구조를 분모에 넣으면 컴포넌트가 될 생각이 없는
프레임을 못 된 것으로 세어 비율이 영원히 낮게 나온다. 다만 그 수만 찍으면 `blocked`·`missing` 을
분모 밖에 두어 예쁘게 만들 수 있으므로 **후보 전체 대비**를 대조군으로 나란히 찍는다.

**대체 가능으로 판정된 노드의 자손은 세지 않는다.** 인스턴스로 바뀌면 자손은 컴포넌트 안으로
사라지고, 따로 세면 같은 픽셀을 두 번 센다. `missing` 은 반대로 자손을 센다 — 무엇이 안으로
들어갈지 아직 정해지지 않았으므로 미리 지우면 분모가 근거 없이 줄어든다.

**대응 판정의 기준값은 `figma/readback.json` 에서 실행 시점에 읽는다.** 규칙은 어느 컴포넌트의
어느 size 인가만 적는다. 여기 상수로 베끼면 LOUIS 를 재조정한 순간 원장이 근거 없이 「대응이
있다」를 말한다.

### `needed` 161 과 겹치는가 — 겹치지 않는다

`migration/product.surfaces.json` 의 식별자는 「제품 트리 경로 + `#` + 컴포넌트 이름」(제품
«소스» 축)이고 이 원장의 식별자는 `<route>@<문맥>#<자식 인덱스 체인>`(보드 «도형» 축)이다. 런너 payload 에는
제품 소스 경로가 한 글자도 없다 — 두 원장을 조인할 키가 아예 없다. 한 제품 컴포넌트가 화면에
0번 그려질 수도 36번 그려질 수도 있고, 반대로 컴포넌트 «안»의 `<button>` 은 제품 표면 축에
자기 줄이 없다. **같은 것을 두 번 세는 것이 아니라 다른 축을 각각 한 번씩 센다.**
`check-figma-board-composition` 이 두 식별자 공간이 겹치지 않는 것을 확인해, 나중에 둘을 한 수로
합치는 것을 막는다.

## Alternatives

- **raw 933 전부를 분모로.** 목표가 「전부 컴포넌트」가 되어 Linear 도 하지 않는 일을 요구한다.
  달성 불가능한 분모는 아무도 줄이지 않으므로 게이트가 장식이 된다.
- **`<button>` 98개만 분모로.** 세기는 쉽지만 원형 아바타 자리 15개, 진행 막대 트랙, 세그먼트
  묶음이 분모 밖에 남는다. LOUIS 에 대응이 «있는데» 커버리지에 보이지 않는 자리가 생긴다.
- **반복되는 도형(같은 서명 2회 이상)을 분모로.** 반복은 컴포넌트의 결과이지 정의가 아니다.
  36장 전부에 있는 페이지 카드(구조)가 최다 반복이 되고, 화면에 한 번뿐인 업로드 드롭존은
  분모 밖으로 빠진다.
- **판정 셋(`blocked` 없이).** `svg` 54개가 `replaceable` 이나 `missing` 중 하나로 «둔갑»한다.
  DS-D-0037 이 `needed` 축을 연 것과 같은 실패 — 적을 자리가 없는 판정은 다른 판정으로 새고,
  샌 수는 커버리지를 올라간 것처럼 보이게 한다.

## Consequences

앵커 `ae8fd627` 의 보드 36장 실측(2026-09-02):

| | 수 |
| --- | ---: |
| 원시 전수 | 933 |
| 분류(대체 가능 가지치기 후 원시 838 + 인스턴스 43) | 881 |
| 인스턴스 | 43 |
| 대체 가능 | 97 — `Button/md` 41 · `IconButton/md` 27 · `Avatar/md` 15 · `SegmentedControlItem/xs` 12 · `ProgressBar/base` 2 |
| 막힘 | 6 |
| 미보유 | 68 |
| 구조 | 667 |
| 사유 없음 | **0** |

인스턴스 비율 **30.7%**(목표 100%, 분모 140 = 인스턴스 + 대체 가능), 후보 전체 대비 **20.1%**
(분모 214). 처음 손으로 센 4.4% 는 구조까지 분모에 넣은 수였다 — 같은 보드를 두 규칙으로 재면
수가 일곱 배 달라진다는 것이 이 결정이 필요했던 이유 그 자체다.

이 수는 **하한**이다. 대응 규칙 6개가 보는 것은 LOUIS 51종 중 6종뿐이라, 나머지 45종의 대응은
아직 `missing` 이나 `structural` 로 앉아 있을 수 있다. 규칙을 더하면 대체 가능이 오르고, 그때
게이트가 baseline 을 올리라고 요구한다.

**다음 사람이 할 일은 셋이다.** ① 대체 가능 97 을 인스턴스로 바꾼다(보드 쪽 작업) ·
② 생성기가 아이콘 정체를 실어 막힘 6 을 대체 가능으로 옮긴다 · ③ 미보유 68 을 보고 LOUIS 에
축을 세운다(가장 큰 덩어리는 36×36 아이콘 버튼 15개와 높이 36 세그먼트 묶음 4개 — 둘 다 기존
컴포넌트의 **새 size 축**이지 새 컴포넌트가 아니다).

## Rollout and verification

- 열거기 `scripts/measure-figma-board-composition.mjs` 가 원장
  `migration/figma-board-composition.json` 을 낸다. `--check` 는 원장이 런너의 현재 내용과
  같은지를 본다(`verify-figma-board-composition`).
- 래칫 `scripts/check-figma-board-composition.mjs` (`check-figma-board-composition`) —
  대체 가능은 **양방향**(늘면 후퇴, 줄면 이득을 잠근다) · 사유 없음은 양방향 목표 0 ·
  인스턴스는 바닥 · 후보 수도 바닥(후보를 구조로 재분류해 분모를 줄이는 길을 막는다) ·
  막힘·미보유는 세기만 한다(발견은 후퇴가 아니다).
- 둘 다 `verify:ci` 다. 재료가 전부 이 저장소 안에 있어 러너에서 실제로 돈다 —
  `verify-gate-split` 5번이 그 자립성을 확인한다.
- 음성 시험 여섯을 `scripts/verify-gates.mjs` 의 카나리아로 심었다: 대체 가능 증가 ·
  **인스턴스를 도형으로 바꿔치기** · 후보를 구조로 재분류 · 사유 없는 모양 등장 ·
  `$candidateRule` 삭제 · 되읽기에 없는 컴포넌트 이름. 여섯 다 게이트가 빨개지는 것을 확인했다
  (`pnpm run verify-gates`: 카나리아 49 → 55).
- 손으로 한 음성 시험: `figma/app-screens.settings.desktop.00.draw.js` 의
  `Product/Desktop App Top Bar` 인스턴스 하나를 raw 아이콘 버튼으로 바꿔치기하자 대체 가능이
  97 → 98, 인스턴스가 43 → 42 가 되어 게이트가 두 진단으로 실패했다. 되돌리자 조용해졌다.
