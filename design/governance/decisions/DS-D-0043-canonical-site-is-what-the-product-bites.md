---
id: decision-canonical-site-is-what-the-product-bites
status: experimental
authority: normative
---

# DS-D-0043 보드에 인스턴스를 놓는 자리는 «제품이 무는 클래스»가 정한다 — 기하가 아니다

- Status: accepted (생성기 rollout 완료 2026-09-02)
- Date: 2026-09-02
- Owners: repository owner, design system maintainer
- Affects: `decision-board-composition-denominator`, `decision-product-surface-denominator`,
  `decision-three-in-one-change`, `decision-figma-as-projection`, `governance-figma-screen-assembly`

## Context

DS-D-0042 가 화면 보드의 분모를 세우고 실측했다 — 인스턴스 43 · 대체 가능 97 · 인스턴스 비율
30.7%. 그 원장이 다음 사람에게 남긴 첫 번째 일이 「대체 가능 97 을 인스턴스로 바꾼다」였다.

그 일을 **보드에서 손으로** 하면 다음 측정에서 되돌아온다. 보드는 생성물이기 때문이다 —
`scripts/build-figma-app-screens.mjs` 가 제품 측정 트리에서 런너 36조각을 낸다. 손으로 바꾼
인스턴스는 다음 생성 때 도형으로 덮인다. **그래서 고칠 곳은 보드가 아니라 생성기다.**

생성기에는 이미 치환 장치가 있었다(`scripts/lib/figma-component-substitution.mjs`). 다만 그것이
아는 것은 셸과 본문 블록 4종뿐이었다 — 사이드바 · 상단 바 두 벌 · 결제 본문 · 요금제 카드.
낱개 컨트롤(버튼 · 아바타 …)은 전부 도형으로 그려졌다.

**여기서 손쉬운 길은 DS-D-0042 의 대응 규칙을 그대로 생성기에 옮기는 것이다. 그러면 틀린다.**
그 규칙은 「높이 32 + 반경 12 면 LOUIS Button」처럼 **기하만** 본다. 실측으로 두 번 틀렸다:

- `/settings` 의 테마·언어 세그먼트 12칸은 높이 28 · 반경 8 로 `SegmentedControlItem` 과 기하가
  같다. 그런데 제품은 그 자리에서 `.louis-segmented-control` 을 물지 않는다 —
  `migration/product.rendered-components.json` 의 probe `segmented-segment` 가 출처를
  `myPageSceneStyles.ts settingsToggleBtn` 으로 적고 있다. 제품 지역 스타일이다.
- 같은 화면의 「Delete account」는 높이 32 · 반경 12 로 `Button` 과 기하가 같다. 그런데
  padding-inline 이 14 이고 column-gap 이 0 이다 — `.louis-button[data-size="md"]` 는 12 / 4 다.

두 자리를 인스턴스로 바꾸면 **Figma 가 제품보다 «더 정본»이 된다.** 그러면 두 축이 어긋나고,
보드는 제품이 하지 않는 말을 하기 시작한다. DS-D-0037 이 표면 축에서 세운 원칙이 그대로 적용된다 —
**제품이 기준이다.** 그 자리들이 정본이 되어야 하는가는 Figma 축의 질문이 아니라 제품 축의
질문이고, 표면 원장의 `needed` 가 이미 세고 있다.

## Decision

**보드의 한 자리에 인스턴스를 놓는 조건은 「제품이 그 자리에서 정본 클래스를 무는가」다.**
판정은 양쪽에서 읽고, **어느 값도 생성기에 베끼지 않는다.**

| 쪽 | 파일 | 무엇을 준다 |
| --- | --- | --- |
| 제품 | `migration/product.rendered-components.json` | probe 하나가 「제품 소스의 클래스 문자열을 제품 Tailwind 로 컴파일해 실브라우저에서 잰 상자」다. `rendered[probe]` 의 **모든** 축(높이 · padding · gap · 반경 · 최소폭)이 측정 노드의 계산 스타일과 문자열까지 같을 때만 그 자리는 그 레시피다 |
| Figma | `figma/readback.json` | 그 컴포넌트의 그 size 가 실재하는지, 기하가 맞는지, variant 이름을 무슨 축으로 적어야 하는지 |

**probe 의 `source` 가 대응 여부를 정한다.** `.louis-*` 를 가리키는 probe 만 자리가 된다
(`button-md`·`button-lg` → `Button.tsx`, `avatar` → `avatar.css .louis-avatar`). 제품 지역
스타일을 가리키는 probe 는 자리가 아니며, **목록에서 빠진 것 자체가 판정이므로 사유와 함께
남긴다**(`LOUIS_PRIMITIVE_EXCLUSIONS`, 생성물 `figma/app-screens.plan.json` 에도 실린다).
목록에 없는 것이 「누락」인지 「결정」인지 읽는 사람이 구분할 수 없으면 다음 사람은 둘 중
아무 쪽으로나 간다.

**variant 문자열을 손으로 적지 않는다.** 되읽기의 `properties` 에서 VARIANT 축만 정의 순서대로
뽑아 조립하고, 값이 그 축의 `options` 에 없으면 던진다. 축 하나라도 측정에서 판정하지 못하면
**치환하지 않고 도형으로 남긴다** — 「없는 variant 는 만들지 않는다」의 연장이다.

축을 채우는 근거도 측정이다.

- `Size` — 맞은 probe 가 곧 size 다(`button-md` → `Size=md`).
- `Variant`(Button) — 제품 원장이 실제로 잰 두 벌에만 답한다. primary 는 면 색을 문자열까지
  대조하고(accent 는 테마를 따라가지 않는다), secondary 는 면이 투명이고 헤어라인 inset
  그림자를 갖되 **그 색은 테마를 따라가므로 기하만** 대조한다. ghost·danger·inverse 는 원장에
  probe 가 없어 비교할 값이 없다 — null 을 돌려 치환을 포기한다.
- `State` — `Default`. 이 fixture 는 포인터가 없는 정지 측정이라 다른 상태를 잴 방법이 없다.
- `Icon` — 자손에 벡터가 있으면 판정을 포기한다. 아이콘이 붙은 레시피는 padding 이 2px 좁아
  **다른 상자**이고(probe `button-md-icon` 이 그 델타만 잰다), 같은 상자로 취급하면 없는
  기하를 그리게 된다.

**Figma 기하가 제품 상자와 어긋나면 치환하지 않는다.** 어긋난 채로 인스턴스를 심는 것이 가장
나쁘다 — 보드는 조용히 시스템과 다른 값을 그리고, 그것을 아무 게이트도 보지 않는다.
이 조항이 DS-D-0028(세 곳 동시)의 자동 감시자다.

**계산 스타일은 spec 이 아니라 fixture 에서 되찾는다.** `toFigmaTreeSpec` 는 색·기하를 파싱해
담지만 그 과정에서 판정 축이 사라진다 — `min-width`·`column-gap` 은 애초에 담기지 않고,
`parseBoxShadow` 는 `color(srgb …)` 표기를 읽지 못해 헤어라인이 통째로 없어진다(그래서 보드
36장의 그림자 수가 0 이다). spec 이 들고 있는 `path` 로 원래 계산 스타일을 다시 본다.

## Alternatives

- **DS-D-0042 의 기하 규칙을 그대로 생성기에 옮긴다.** 위의 두 실측이 이 길을 닫았다 — 세그먼트
  12칸과 「Delete account」가 제품에 없는 정본으로 바뀐다. 게이트 수는 예뻐지고 보드는 틀려진다.
- **제품 DOM 에서 `className`·`data-*` 를 읽는다.** 브리프가 가리킨 길이고 가장 곧다. 그런데
  `measure-product-auth-fixture.mjs` 의 트리 walker 는 `className` 을 담지 않는다(`measure-dom.mjs`
  는 담는다 — 두 walker 가 다르다). 담게 하려면 제품 fixture 클론을 세워 46화면을 다시 재야 하고,
  그것은 이 걸음과 같은 걸음에 할 수 없다. 계산된 상자는 **그 클래스가 실제로 만든 값**이므로
  대리로 충분하고, 오히려 「클래스는 붙었는데 호출부 utility 가 덮어썼다」를 잡아낸다.
- **LOUIS CSS(`packages/css/src/component/*.css`)를 파싱해 레시피를 얻는다.** 시스템 쪽 값이라
  제품이 실제로 무는지를 말해 주지 않는다. 제품이 클래스를 물지 않는 자리도 통과한다.
- **레시피 값을 생성기에 상수로 적는다.** LOUIS 나 제품이 움직인 날 조용히 낡는다. DS-D-0042 가
  기준값을 되읽기에서 읽기로 한 것과 같은 이유로 버린다.

## Consequences

앵커 `ae8fd627` 의 보드 36장, 같은 열거기로 다시 잰 값:

| | 전 | 후 |
| --- | ---: | ---: |
| 인스턴스 | 43 | **78** |
| 대체 가능 | 97 | **62** |
| 후보 | 214 | 214 |
| 인스턴스 비율(분모 = 인스턴스 + 대체 가능) | 30.7% | **55.7%** |
| 후보 전체 대비 | 20.1% | **36.4%** |
| 원시 전수 | 933 | 848 |

옮겨 간 35자리는 `.louis-button` 20(secondary 16 · primary 4) 와 `.louis-avatar` 15 다.
**후보 214 가 그대로인 것이 이 변화가 정직하다는 증거다** — 판정 규칙을 풀어 분모를 줄인 것이
아니라 같은 후보가 다른 칸으로 옮겨 갔다.

`/settings` desktop 한 장으로 보면: 인스턴스 2 → **9**, 원시 컨트롤 14 → **7**. 남은 7 은
바로 위에서 「제품이 물지 않는다」고 판정한 그 자리들이다 — 세그먼트 6칸과 「Delete account」.

**남은 대체 가능 62 는 이 결정의 눈으로 보면 상한이 아니라 혼합이다.** `IconButton/md` 27 ·
`SegmentedControlItem/xs` 12 는 제품 지역 스타일 자리이고(probe 출처가 `Gnb.tsx iconButton` ·
`myPageSceneStyles.ts settingsToggleBtn`), `Button/md` 21 의 대부분은 `<a>` 로 그린 결제 CTA 다
(column-gap 0 — `.louis-button` 이 아니다). 즉 그 62 중 상당수는 「지금 바꿀 수 있는 것」이
아니라 「제품이 정본을 물게 되면 바뀌는 것」이다. 열거기의 판정 어휘에는 그 칸이 아직 없다 —
DS-D-0042 가 `svg` 때문에 `blocked` 를 연 것과 **같은 모양의 빈자리**이고, 다음 걸음의 결정이다.

## Rollout and verification

- `scripts/lib/figma-component-substitution.mjs` 에 `LOUIS_PRIMITIVE_SITES` ·
  `LOUIS_PRIMITIVE_EXCLUSIONS` · `matchLouisPrimitive` 를 세웠다. 셸·본문 치환보다 **뒤에**
  본다 — 셸 안의 버튼은 셸 컴포넌트가 이미 소유하므로 먼저 보면 같은 픽셀이 두 겹이 된다.
- `scripts/build-figma-app-screens.mjs` 가 두 증거를 읽어 넘긴다. 제품 원장의 `productCommit`
  이 측정 fixture 와 다르면 던진다 — 어제의 제품에서 읽은 클래스를 오늘의 화면에 심는 것을 막는다.
  증거가 없으면 **조용히 꺼지지 않고 던진다**(치환이 소리 없이 꺼지면 보드 36장이 도형으로
  되돌아가는데 `check-figma-app-screens` 는 그 교환을 한 글자도 보지 못한다).
- 렌더러 `scripts/templates/figma-app-screens-renderer.js` 의 `findVariant` 가 이름이 어긋날 때
  **축=값 집합**으로 한 번 더 찾는다. 생성기는 variant 이름의 축 «순서»를 알 수 없다 —
  없는 variant 와 못 찾은 variant 를 같은 실패로 만들면 다음 사람이 없는 축을 만들러 간다.
- `check-figma-board-composition` 의 `REPLACEABLE_BASELINE` 97 → 62,
  `INSTANCE_FLOOR` 43 → 78 로 이득을 잠갔다. `CANDIDATE_FLOOR` 214 는 건드리지 않았다.
- `pnpm run verify-gates` 카나리아 55개 그대로 통과. `build` · `check` · `test` · `verify:ci`
  전부 초록.
