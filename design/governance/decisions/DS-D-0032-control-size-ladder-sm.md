---
id: decision-control-size-ladder-sm
status: experimental
authority: normative
---

# DS-D-0032 컨트롤 크기 사다리에 sm(24)을 더한다

- Status: accepted
- Date: 2026-08-31
- Owners: repository owner
- Affects: `semantic.global.layout.control-height-sm`(신설),
  `Button` · `IconButton` · `TextField` · `SegmentedControl` · `Slider` 의 `size` 축,
  `design/components/switch.md`, Figma `2 · Semantic` 의 `layout/control-height-*`(미반영)

## Context

[DS-D-0027](DS-D-0027-control-size-ladder.md)이 사다리를 두 칸으로 세우면서 24를 **명시적으로
검토하고 기각**했다. 기각 사유는 하나였다.

> **`sm`(24) 을 새로 만든다.** 제품에 24 높이 컨트롤이 없다. 쓰지 않는 계단은 사다리가 아니다.

읽어야 할 것은 그 문장의 뒷부분이 아니라 앞부분이다. 기각된 것은 **24라는 값**이 아니라
**소비처가 없다는 사실**이었다. 같은 기준이 [DS-D-0030](DS-D-0030-no-duplicate-role-tokens.md)에
「쓰지 않는 계단은 스케일이 아니라 재고」로도 적혀 있다.

**그 전제가 바뀌었다.** 소유자가 새 비디오 에디터 화면을 그렸고, 그 화면이 높이 24 컨트롤을
여섯 자리에서 쓴다 — 가져오기 버튼 · 필터 탭 · 70% 줌 칩 · 트랙 레인 토글. 넷 다 편집 표면의
도구 줄에 서는 컨트롤이며, 그 자리에서 md(32)는 콘텐츠보다 도구가 커진다.

그러므로 이것은 DS-D-0027을 뒤집는 결정이 아니다. **DS-D-0027이 세운 기준을 그대로 적용한
결과**다 — 쓰는 계단만 사다리에 놓는다는 기준은 그대로이고, 24가 그 조건을 이제 만족한다.

## Decision

**컨트롤 높이 사다리는 세 칸이다 — `lg`(40) · `md`(32) · `sm`(24).**

| 이름 | 높이 | 쓰는 곳 |
| --- | ---: | --- |
| `lg` | 40 | 화면의 주인공이 되는 제출 CTA — 로그인·회원가입 (DS-D-0027) |
| `md` | 32 | 그 밖의 전부(제품 기본값) (DS-D-0027) |
| `sm` | 24 | **편집 표면의 도구 줄** — 캔버스·타임라인·에셋 패널처럼 한 줄에 컨트롤이 여럿 서고, 화면의 주인공이 컨트롤이 아니라 편집 대상인 자리 |

`sm`의 경계를 한 문장 더 적는다. **폼·대화상자·본문 흐름에는 쓰지 않는다.** 그 자리에서 24는
누르기 어렵고 md가 이미 맞다. 도구 줄이 24를 감당하는 것은 사용자가 그 줄을 **보면서** 쓰기
때문이지 24가 일반적으로 충분해서가 아니다.

그래서 `sm`은 **`.louis-hit-target`을 반드시 함께 붙인다.** 시각 크기와 hit area의 분리는
사다리 전체의 계약이지만(`layout-control-hit-target-minimum` 44), 24에서는 그 둘의 차이가
20px으로 가장 크다. 붙이지 않으면 사다리의 계약이 아니라 그냥 작은 버튼이 된다.

**다만 이 문장은 다섯 중 둘에서만 지킬 수 있었다** — `TextField`·`SegmentedControl`·`Slider`는
그 유틸을 쓸 수 없다. 아래 Consequences의 「`.louis-hit-target`을 붙일 수 있는 것은 다섯 중
둘뿐이다」가 컴포넌트별 사유와 함께 그 사실을 갖는다.

**이 사다리를 쓰는 컴포넌트는 전부 따라간다** — `Button` · `IconButton` · `TextField` ·
`SegmentedControl` · `Slider`. DS-D-0027의 규칙을 그대로 계승한다. 한 컴포넌트만 sm을 열면
`Button size="sm"`은 24인데 `TextField size="sm"`은 존재하지 않는, 이름이 컴포넌트마다 다른
뜻을 갖는 상태가 된다.

`Spinner`와 `Avatar`는 따라가지 않는다. DS-D-0027과 같은 이유로, 이들의 크기 축은 컨트롤
높이가 아니라 각자의 치수다.

### 토큰은 높이 한 칸만 연다

`semantic.global.layout.control-height-sm` = `{primitive.spacing.24}` 하나를 더한다. 그 외에는
아무것도 만들지 않으며, 그 판정의 근거를 각각 적는다.

**`control-minimum-width-sm`은 만들지 않는다.** 최소 폭은 칸마다 갈리는 축이 아니다 —
`lg`와 `md`가 **같은** `control-minimum-width-md`(48)를 읽는다(`packages/css/src/component/button.css:60`
과 `:69`). 칸별 최소 폭이라는 축은 이 시스템에 존재한 적이 없으므로, sm에서 그것을 새로 여는
것은 계단을 잇는 게 아니라 축을 하나 만드는 일이다. 비례로 유도하면 48 × 24/32 = 36인데 36은
primitive 간격 계단(… 24 · 28 · 32 · 40 …)에 없어서 원시 토큰까지 새로 만들어야 한다 — 재지
않은 값을 둘 지어내는 것이 된다.

디자인의 여섯 자리도 그 바닥을 요구하지 않는다. 가져오기는 라벨을 가진 텍스트 버튼이고, 필터
탭은 `flex: 1 1 auto`로 내용 크기를 갖는 SegmentedControl의 세그먼트라 최소 폭 토큰을 읽지
않으며, 줌 칩은 숫자고, 레인 토글은 **정사각이 계약인 IconButton**이라 폭이 곧 높이다 — 48을
바닥으로 깔면 오히려 그 계약이 깨진다.

**이것은 실측이 아니라 판정이다.** 이번 단계는 저장소까지이므로 아트보드를 열어 여섯 자리의
실제 폭을 재지 않았다. 여섯 중 하나라도 48보다 좁은 라벨로 바닥을 요구하면, 그때 **재서**
`control-minimum-width-sm`을 더한다.

**좌우 여백도 만들지 않는다.** `space-control-*`이 이미 16 · 12 · 8 · 4로 있고, 사다리의 비례가
그대로 이어진다 — lg(40) → `control-lg`(16), md(32) → `control-md`(12), sm(24) →
**`control-sm`(8)**. 높이가 8 내려갈 때 여백이 4 내려가는 기존 간격을 잇는 것이며 새 값이
아니다. **이 값은 기존 사다리의 비례로 유도했고 디자인에서 재지 않았다** — CSS가 sm을 구현할
때 확인한다.

**글자 크기는 이 결정이 정하지 않는다.** DS-D-0027 이후 button.css가 「타이포는 size 축이
아니다」로 두 칸을 같은 14/500에 두고 있는데, 24 안에서 그 타이포는 행 높이만 21px이라 위아래
여유가 3px뿐이다. SegmentedControl은 이미 md에서 caption(12)으로 내려가 있다. 두 선택 중 어느
쪽인지는 **재야 알 수 있는 값**이므로, 여기서 유도하지 않고 각 컴포넌트가 sm을 구현하는
자리로 넘긴다. 새 토큰이 필요한 문제가 아니다 — `typography-body-sm-*`과
`typography-caption-*`이 이미 둘 다 있다.

## Alternatives

- **DS-D-0027을 폐기(superseded)하고 사다리를 다시 쓴다.** 그 결정은 lg·md의 값과 쓰임새를
  여전히 옳게 소유하고, 이번에 바뀐 것은 「24를 쓰는 자리가 없다」는 **사실 하나**다. 폐기하면
  아직 참인 문장까지 이력 뒤로 밀려 다음 사람이 lg·md의 근거를 폐기된 문서에서 찾게 된다.
- **컴포넌트마다 리터럴 24를 쓴다.** SegmentedControl의 `xs`가 이미 그 길이며(28을 리터럴
  패딩과 함께 고정했다), 그때는 인스펙터 한 곳의 밀도를 위해 계단을 늘리지 않는 것이 옳았다.
  지금은 여섯 자리, 네 컴포넌트다. 같은 24가 네 파일에 흩어지면 그중 하나가 23이나 26으로
  어긋나도 아무도 모른다 — 계단이 막는 것이 정확히 그 상태다.
- **기존 `inspector-control-height`(28)를 재사용한다.** 디자인이 24이고 28이 아니다. 4px을
  깎는 것은 밀도 판정이고, 그 판정은 이미 디자인에서 내려져 있다. 값이 다른 것을 이름이 있다는
  이유로 끌어다 쓰면 DS-D-0029가 금지한 「참이 아닌 이름」이 된다.
- **`control-minimum-width-sm`을 함께 만든다.** 위 Decision에 적은 이유로 기각한다 — 축이
  없었고, 유도값이 계단 밖이며, 여섯 자리 중 요구하는 것이 없다.

## Consequences

`pnpm check-token-diff`가 **additive 1**(`layout-control-height-sm`)만 낸다. removal·rawValue·
value·aliasTarget 전부 0이다. DS-D-0027은 이름을 옮겨서 breaking을 냈지만 이것은 더하는
것이므로 baseline 승인이 필요 없다. `--louis-layout-control-height-sm: 24px`가
`packages/css/generated/tokens.css`에 생겼다.

**소비하는 CSS는 아직 없다.** 다섯 컴포넌트의 `data-size="sm"` 구현은 이 결정의 다음 단계다.
그때까지 이 토큰은 DS-D-0030이 말한 재고 상태이며, 그 상태를 오래 두지 않는 것이 이 결정을
쓴 이유다.

**Figma도 아직 바뀌지 않았다.** [DS-D-0028](DS-D-0028-three-in-one-change.md) 규칙 1의 세 곳
중 LOUIS 토큰 한 곳만 움직였다. 그래서 Figma 게이트 셋이 지금 빨갛고, **그것이 이 변경의
정확한 상태다.**

```
verify-figma-parity     변수가 snapshot에 없습니다: layout-control-height-sm
                        collection 변수 수 불일치: Klipse Semantic — 기대 141, 실제 140
check-figma-snapshot    drift: figma/snapshot.json가 readback에서 생성한 결과와 다릅니다
verify-figma-variables  적용 코드가 최신이 아닙니다: figma/apply-variables.4.js
```

앞의 둘은 Figma 라이브러리에 변수를 실제로 만들고 readback을 다시 떠야 풀리고, 셋째는
`pnpm build-figma-variables`로 적용 코드를 다시 뽑아야 풀린다. 셋 다 다음 단계이며, 그때까지
이 변경은 **끝난 상태가 아니다.** `pnpm check`(토큰·아이콘·CSS·카탈로그·llms·인용·타입)와
`pnpm check-token-diff`는 초록이다.

### `.louis-hit-target`을 붙일 수 있는 것은 다섯 중 둘뿐이다

위 Decision은 「`sm`은 **`.louis-hit-target`을 반드시 함께 붙인다**」를 사다리 계약으로 적었다.
그 문장은 다섯 컴포넌트가 구현된 지금 **둘에서만 참이다.** 판정을 뒤집지 않고, 어디까지 참인지를
여기 적는다 — 결정문만 읽는 사람이 셋을 초록으로 오해하지 않게 하기 위해서다.

| 컴포넌트 | `.louis-hit-target` | 근거 |
| --- | --- | --- |
| `Button` | 붙는다 | 크기와 무관하게 항상 붙인다 — `packages/react/src/button/button.tsx` |
| `IconButton` | 붙는다 | 같음 — `packages/react/src/icon-button/icon-button.tsx` |
| `TextField` | **못 붙인다** | 그 유틸의 `::after` 오버레이가 필드를 덮어 캐럿 배치와 드래그 선택을 가로챈다 |
| `SegmentedControl` | **못 붙인다** | 44×44 `::after`가 요소 중앙에 놓이는데 세그먼트는 간격 없이 나란히 서서 타깃이 서로를 덮는다 |
| `Slider` | **못 붙인다** | range input의 `::before`/`::after`는 트랙·썸에 이미 배정돼 있다 |

**이것은 `sm`이 만든 문제가 아니다.** 셋은 `lg`·`md`에서도 그 유틸을 쓴 적이 없다. `sm`이 한 일은
시각 크기와 44의 차이를 20px로 **가장 크게 벌려** 그 사실을 보이게 만든 것뿐이다. 셋 다 WCAG 2.2
AA의 24×24는 만족하고 44px(AAA)은 만족하지 않는다.

해결하지 않고 **알려진 편차**로 남긴다. 각 컴포넌트 문서가 그 편차를 사유와 함께 소유한다 —
`design/components/text-field.md`, `design/components/segmented-control.md`,
`design/components/slider.md`. 셋 중 하나라도 44를 실제로 요구하는 자리가 나오면, 그때 그
컴포넌트가 **자기 방식으로** 타깃을 넓히는 판정을 따로 한다. `.louis-hit-target`을 셋에 억지로
붙이는 것은 위 표의 사유 때문에 답이 아니다.

### SegmentedControl의 `xs`(28)가 이제 `sm`(24)보다 크다

그 축은 사다리가 아니라 인스펙터 전용 `layout-inspector-control-height`(28)를 읽는 컴포넌트
지역 예외다(`packages/css/src/component/segmented-control.css`가 사유를 갖고 있다). 값의
문제는 없다. 그러나 이름은 같은 `data-size` 축에 서 있어서, SegmentedControl이 sm을 구현하는
날 `lg`(40) > `md`(32) > `sm`(24) 사이에 `xs`가 28로 끼어 **이름이 순서를 거짓말한다** —
DS-D-0029가 금지한 형태다. 그날 `xs`를 사다리 밖 이름으로 옮기거나 28을 사다리에 들이는
판정을 함께 한다. **이번에는 열지 않고, 열어야 한다는 사실만 여기 적는다.**

### DS-D-0027이 남긴 문서 미전파가 이 변경으로 위험해졌다

DS-D-0027의 개명(구 `md`→`lg`, 구 `sm`→`md`)이 토큰과 React 타입에는 들어갔지만 문서 다섯
벌과 기록 둘에는 들어가지 않았다. 그 문장들은 어제까지 **없는 토큰**을 가리켜 무해했지만,
오늘부터 **있는 토큰을 틀린 값으로** 가리킨다.

| 파일 | 줄 | 지금 적힌 것 | 실제 |
| --- | --- | --- | --- |
| `design/components/icon-button.md` | 68–69 · 121 · 123 · 148 | 한 변이 `layout-control-height-sm` 32 | 그 토큰은 24다. 게다가 `icon-button.css`는 `lg`·`md` 둘 다 32로 낸다 — 문서의 40×40이 CSS에 없다 |
| `design/components/text-field.md` | 67 · 124 · 126 | 축이 `md` \| `sm` | React는 `"lg" \| "md"` |
| `design/components/segmented-control.md` | 70 · 130 · 132 | 축이 `md` \| `sm` | React는 `"lg" \| "md" \| "xs"` |
| `design/components/slider.md` | 62 · 127 · 129 | 축이 `md` \| `sm` | React는 `"lg" \| "md"` |
| `design/components/app-shell-parts.md` | 279 · 353 · 364 · 366 · 416 | `-md`(40) · `-sm`(32) · `IconButton sm` | `-lg`(40) · `-md`(32) · `IconButton md` |
| `figma/components.measured.json` | 1328 · 1344 | `control-height-sm(32)` | 32는 `-md`다 |
| `migration/unverified-value-map.json` | 1361 | 트랙 높이를 `layout-control-height-sm`으로 세운다 | CSS는 `-md`를 쓴다 |

이 정정은 **DS-D-0027의 몫이고 이번 변경에 넣지 않았다.** 이름만 바꿔서는 끝나지 않기
때문이다 — icon-button은 문서가 40×40이라 적은 것을 CSS가 32×32로 내고 있어 크기 절 자체를
다시 써야 한다. `verify-record-citations`는 `layout-` 접두사를 가진 인용만 보고 markdown은
읽지 않으므로 **어느 게이트도 이 일곱 줄을 잡지 않는다.** 미결로 남긴다.

### 이번 변경으로 고친 것

`design/components/switch.md`는 트랙 44×24가 리터럴인 이유로 「24px은 그 계단에 없다」를
두 번 들고 있었다. 그 문장은 이 결정으로 거짓이 되므로 고쳤다. **스위치의 판정 자체는 바뀌지
않는다** — 44×24는 트랙 폭과 높이가 함께 묶인 고유 기하이고, 스위치는 이 사다리를 따라가는
다섯 컴포넌트에 들어 있지 않다. 바뀐 것은 그 판정의 **사유**뿐이다.
