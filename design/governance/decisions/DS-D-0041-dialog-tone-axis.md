---
id: decision-dialog-tone-axis
status: experimental
authority: normative
---

# DS-D-0041 확인 대화상자는 Dialog 의 톤이다 — ConfirmDialog 를 세우지 않는다

- Status: accepted
- Date: 2026-09-01
- Owners: repository owner (판단 위임), design system maintainer
- Affects: `decision-product-surface-denominator`, `governance-figma-component-authoring`,
  `decision-figma-done-without-publish`

## Context

원장의 `unclear` 하나가 이 갈림길에 있다 — `ConfirmModal`. 사유가 「이 도메인 모달 대부분이 같은
갈림길을 공유한다」고 적는다. 셸은 이미 `.louis-dialog` 정본 그대로라 Dialog 대응으로 볼 수도
있는데, 파괴적 확인과 본문의 비용 줄이 Figma Dialog 의 축(`Size` · `HasClose` · `Title` ·
`Description`)에 없다.

**제품 실측이 답의 절반을 이미 갖고 있었다.**

```sh
git -C <제품 저장소> grep -n confirmVariant ae8fd627
```

`ConfirmModal` 과 `GlassConfirmModal` 이 **둘 다** `confirmVariant?: "primary" | "danger"` 를
갖는다. 그 prop 이 하는 일은 확인 버튼의 `variant` 하나이고, 그 밖에 갈리는 선언이 없다. 즉
**제품이 이미 「같은 Dialog 의 톤 차이」로 모델링했다.** 그리고 이 저장소의 정본 판정은
[DS-D-0025](DS-D-0025-figma-as-projection.md) 그대로 코드가 정본이고 Figma 가 projection 이다 —
제품이 한 벌로 쓰는 것을 Figma 가 두 벌로 세우면 projection 이 원본보다 갈라진다.

둘 다 셸은 `data-size="compact"` 이고, **둘 다 닫기 버튼이 없다.**

**소유자가 판단을 위임했다** — 「실무적으로 추천해 달라」. 그 위임의 답이 「Dialog 에 `Tone` 축과
`dismissible` 축을 연다. ConfirmDialog 를 새로 세우지 않는다」였다.

## Decision

1. **ConfirmDialog 를 새 컴포넌트로 세우지 않는다.** 확인 대화상자는 Dialog 의 한 톤이다.
2. **Dialog 에 `Tone` 축을 연다. 값은 `neutral` · `danger` 둘뿐이다.**
3. **「닫기 버튼이 없다」에는 새 축을 만들지 않는다 — 이미 `HasClose` 가 그 계약이다.**

### 3은 위임받은 판정문과 이름이 다르다 — 이유를 적는다

위임받은 문장은 「`dismissible` 축을 함께 연다」였다. **그 자리에 축이 이미 서 있다.**
`figma/readback.json` 의 Dialog 는 `HasClose` BOOLEAN 을 갖고, `scripts/verify-figma-parity.mjs` 의
계약이 그 축의 사유까지 적어 두었다 — 「닫기 버튼이 없는 대화상자가 있다 — 결정을 강제하는
확인 창이다. 코드에서는 onClose의 유무다.」 위임받은 판정이 요구한 계약이 **낱말 그대로** 거기
있다.

새 이름을 열면 같은 뜻에 이름이 둘이 된다. `figma-component-authoring` §2 가 그것을 금하고
(`Current` 는 `Selected` 의 두 번째 어휘이므로 쓰지 않는다),
[DS-D-0030](DS-D-0030-no-duplicate-role-tokens.md)이 토큰 축에서 같은 규범을 갖는다.
**판정의 내용은 그대로 채택하고 이름만 이미 있는 것을 쓴다.**

실측이 그 판정의 뒷절도 좁힌다. 위임문은 「닫기 버튼 없음 **+ 액션 고정**」을 계약으로 들었는데,
두 확인 모달의 backdrop 클릭은 **닫는다** — 겉면의 클릭 처리가 취소를 부른다. 잠기는 것은
`cancelDisabled`/`confirmDisabled` 가 켜져 있는 동안뿐이고 그것은 축이 아니라 버튼의 disabled 다.
그래서 지금 계약이 다른 것은 「닫기 버튼의 유무」 하나이고, `HasClose` 가 이미 그것이다.
나중에 backdrop 이 실제로 잠기는 확인 창이 생기면 그때 그것이 새 축이고, 그 근거는 실측이지
이 결정이 아니다.

### 왜 축이어야 하는가 — 중첩 인스턴스로 두지 않는 이유

Figma 는 중첩 인스턴스의 property 를 부모에서 노출할 수 있다. 그러니 Dialog 에 축을 열지 않고
푸터의 Button 인스턴스에서 `Variant` 를 `danger` 로 고르게 하는 길이 있다. 실제로 그쪽이
컴포넌트 하나의 변형 수를 늘리지 않는다.

**버리는 이유는 게이트다.** `verify-figma-parity` 가 읽는 것은 component set 의 property 목록이고,
중첩 노출은 그 목록에 없다 — **게이트가 그 톤 차이를 아예 재지 않는다.** 계약이 되지 못하는
표현은 이 저장소에서 대조되지 않는 표현이고, DS-D-0035 가 그 자리를 이미 막았다: 한 방향만
걸린 채로 유지된 초록은 아무것도 말하지 않는다.

### 왜 두 값뿐인가 — 조합을 전수로 채우지 않는다

`Tone` 어휘는 다섯이지만(`neutral` · `info` · `success` · `warning` · `danger`) 제품이 쓰는 것은
둘이다. 그리고 교차도 채우지 않는다 — 두 확인 모달이 **둘 다 `compact`** 이므로 `Tone=danger` 는
그 칸에만 그린다. Dialog 의 현재 변형은 넷이고, 전수 교차(넷 × 둘 = 여덟)가 아니라 **다섯**이 된다.

**선례가 둘이다.** 이 저장소 쪽은 「쓰지 않는 계단은 사다리가 아니다」
([DS-D-0027](DS-D-0027-control-size-ladder.md) · [DS-D-0030](DS-D-0030-no-duplicate-role-tokens.md))
이고, 밖은 참고 파일 `IWohxdWtibbqKNKayhhkLN`("Linear Design System (Community)")의 Button 이다.

Linear 의 Button variant 이름은 이렇게 생겼다.

    Hierarchy=Primary, State=Default, Size=Large, Icon=None, Destructive=False

**파괴적 동작이 별 컴포넌트가 아니라 boolean 축이다.** 그리고 그 5축의 전수는
4 × 4 × 4 × 2 × 2 = 256인데 **실제 variant 는 28**이다 — `Destructive=True` 는 Primary/Medium 에만
있고, 격자에 빈 칸이 눈에 띄게 많다. 축을 여는 것과 조합을 채우는 것은 별개다.

수는 2026-09-01 에 그 파일을 `get_metadata` 로 읽어 얻었다. **읽기 전용 참고이며 이 저장소의
게이트가 재지 않는다.**

우리가 boolean 대신 `Tone` 을 쓰는 이유는 어휘 표다 — §2 의 `Tone` 이 이미 의미 톤을 담는 축이고,
`Destructive` 라는 새 이름을 열면 그 표에 뜻이 겹치는 칸이 하나 더 생긴다.

### Radix · Material 이 AlertDialog 를 따로 두는 것과 다른 축이다

Radix 와 Material 이 AlertDialog 를 별 컴포넌트로 두는 이유는 **시각이 아니라 역할**이다 —
`role="alertdialog"` 는 보조기술에 「사용자의 응답을 기다리는 중요한 메시지」임을 알리고, 그에 따라
포커스와 알림 처리가 달라진다. 색·톤과는 무관하고, 빨간 버튼이 있는지 없는지와도 무관하다.

이 결정은 **Figma 컴포넌트를 몇 개로 세우는가**를 정한다. 두 축을 한 판정으로 묶으면
「빨간 버튼이 있으니 alertdialog」 같은 잘못된 대응이 생기고, 반대로 「alertdialog 가 필요하니
컴포넌트를 나눠야 한다」는 잘못된 요구가 생긴다. **둘은 서로를 함의하지 않는다.**

접근성 역할이 필요해지면 **prop 으로** 연다. Figma 에는 그것을 그릴 자리가 없고, 억지로 축을
만들면 되읽기에 담기지 않는 축이 된다 — 그런 축의 처리는 PaneDivider 의 `compact` 판정이 이미
정했다(축으로 만들지 않고 규범 문서가 값을 소유한다). 제품의 현재 마크업은 확인 모달에서도
`role="dialog"` 이며, 그것을 `alertdialog` 로 옮길지는 접근성 축의 별건이고 이 결정은 정하지 않는다.

## Alternatives

- **ConfirmDialog 를 별 컴포넌트로 세운다.** 확인 창의 계약(액션 둘 · 닫기 없음 · 제목+설명)을
  한 곳에 고정할 수 있는 것이 이득이다. 대가가 셋이다. 제품이 한 벌로 쓰는 것을 둘로 갈라
  projection 이 원본보다 갈라진다. 셸이 문자 그대로 같은 레시피라 값이 갈리는 날 어느 쪽이
  정본인지 판정할 자가 없다. 그리고 51 계약이 52가 되면서 두 세트의 기하 계약이 같은 값을
  중복으로 갖는다 — DS-D-0030 이 토큰 축에서 금한 모양이다.
- **`Tone` 대신 `Destructive` boolean 을 연다**(Linear 와 같은 이름). 뜻이 정확하고 값이 둘이다.
  그런데 §2 의 축 어휘 표에 `Tone` 이 이미 있고, 새 이름을 열면 「의미 톤」을 부르는 축이 둘이
  된다. 그리고 나중에 `warning` 확인 창이 생기면 boolean 으로는 그릴 수 없어 결국 `Tone` 으로
  옮겨야 한다.
- **아무것도 하지 않고 `ConfirmModal` 을 `needed` 로 둔다.** 정직해 보이지만 틀렸다 — 셸은 이미
  대응이 있고, 없는 것은 축 하나다. `needed` 로 적으면 「이 화면을 통째로 그려야 한다」로 읽힌다.

## Consequences

- `ConfirmModal` 은 Dialog 대응으로 확정될 수 있고, 같은 셸을 쓰는 create 도메인 모달들이 같은
  경로를 탄다. **이 문서가 원장을 옮기지는 않는다** — 아래 참조.
- Dialog 의 변형이 넷에서 다섯이 된다. 조합 예산(§5)에 걸리지 않는다 — 라이브 분포의 중앙값이
  셋이고 최대가 Button 300 이다.
- `Tone` 을 Figma 에 여는 것은 **코드 타입을 먼저 늘리는 일**이다. §10 이 그 순서를 정한다 —
  variant 축의 옵션 집합을 코드에서 읽어 대조하므로, 코드에 없는 값을 Figma 에 늘리면 게이트가
  잡는다. `figmaOnlyProperties` 로 선언해 우회할 수는 있지만 그것은 **코드에 대응이 없는 축**에
  쓰는 자리이고, 여기서는 제품에 `confirmVariant` 가 실재하므로 그 우회가 사실을 왜곡한다.

## Rollout and verification

**이 변경에서 한 것은 결정을 문서로 세운 것뿐이다.** 요구되지만 아직 하지 않은 일을 적는다.
규칙 1(세 곳을 같이 바꾼다, [DS-D-0028](DS-D-0028-three-in-one-change.md))이 걸리는 작업이다.

1. LOUIS Dialog 의 코드 타입에 톤 축을 연다(값 둘). §10 의 순서상 이것이 먼저다.
2. Figma Dialog set 에 `Tone` 축을 더한다 — `danger` 는 `compact` 칸에만 그린다. 같은 작업에서
   `figma:fetch` 로 되읽기를 다시 뜬다. 미루면 게이트가 낡은 캡처를 보고 거짓 초록을 낸다.
3. `verify-figma-parity` 의 dialog 계약에 그 축을 선언한다. 선언하지 않은 property 는 실패다.
4. 원장에서 `ConfirmModal` 을 `unclear` 에서 내리고, 같은 셸을 쓰는 create 도메인 모달을 함께
   재판정한다. `MAPPED_BASELINE` 이 따라 움직인다.

검증은 그때 `pnpm run verify-figma-parity` · `pnpm check` ·
`node ./scripts/verify-doc-paths.mjs` · `node ./scripts/verify-record-citations.mjs` ·
`pnpm verify:ci` 로 돈다. 이 문서만 들어간 지금은 뒤의 넷이 문서 축에서만 돈다.
