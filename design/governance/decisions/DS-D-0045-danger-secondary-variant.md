---
id: decision-danger-secondary-variant
status: experimental
authority: normative
---

# DS-D-0045 연한 danger 는 Button 의 여섯 번째 variant 다 — 이 축만 Figma 가 정본이다

- Status: accepted (rollout 완료 2026-09-02)
- Date: 2026-09-02
- Owners: repository owner (스펙 제공), design system maintainer
- Affects: `button`, `governance-figma-component-authoring`,
  `decision-figma-as-projection`, `decision-token-names-must-be-true`,
  `decision-three-in-one-change`

## Context

`verify-figma-parity` 가 빨갛게 서 있었다.

```
[figma-parity] variant 옵션 불일치: Button.Variant —
  코드 ButtonVariant=[primary, secondary, ghost, danger, inverse],
  Figma=[primary, secondary, ghost, danger, inverse, danger-secondary]
```

Figma Button set(`672:552`)에 `danger-secondary` 60칸이 서 있는데 코드에 그 값이 없었다. 직전
작업이 되읽기를 정직하게 재채취하면서 드러났다 — 낡은 캡처(300칸)가 그 60칸을 가리고 있었다.
**게이트가 뒤늦게 본 것이지 그날 생긴 것이 아니다.**

소유자에게 물었고 답이 왔다: **「꽉찬 danger말고 세컨더리도 존재함」.** 실수로 남은 칸이 아니라
의도된 스펙이라는 뜻이다.

## Decision

1. **`ButtonVariant` 에 `danger-secondary` 를 더한다.** 이름은 Figma 의 variant 값과 글자 그대로
   같게 쓴다.
2. **이 축의 값은 Figma 에서 읽는다.** 면·글자·hover 사다리·disabled 처리 전부 60칸 실측이 정본이다.
3. **semantic 토큰 두 개를 연다** — `color-accent-danger-secondary`(red-alpha 12%) ·
   `color-accent-danger-secondary-hover`(24%). 프리미티브는 이미 있으므로 더하지 않는다.
4. **제품에는 채택 자리를 만들지 않는다.** 대응하는 자리가 없다는 것이 이번 「세 곳 동시」의
   제품 항 결론이다.

## 왜 이 건만 Figma 가 정본인가

이 저장소의 기본 규칙은 반대다 — [DS-D-0025](DS-D-0025-figma-as-projection.md)가 코드를 정본으로,
Figma 를 projection 으로 정하고, 값이 갈리면 LOUIS 가 제품 외관에 맞춘다.

**그 규칙이 여기서 답을 줄 수 없다.** 제품에 연한 danger 버튼이 **없기 때문이다.** 앵커
`ae8fd627` 에서 `variant="danger"` 는 열여섯 자리이고 전부 꽉 찬 danger 다. 제품 `Button.tsx:3`
의 타입에 그 값 자체가 없다. 가장 가까운 알파 빨강 면은 `Gnb.tsx:1174-1176` 의
`profileMenuItemDanger` 인데 **버튼이 아니라 메뉴 항목**이고 8% 라 사다리도 다르며, LOUIS 는 이미
`accent-menu-danger-hover` 로 그 자리를 덮고 있다. 나머지 red-alpha 면은 전부 배지·상태칩·배너로
클릭 대상이 아니다.

제품이 아무 말도 하지 않는 자리에서 「제품에 맞춘다」는 값을 만들어 내지 못한다. 그때 남는 정본은
**소유자가 직접 그린 것**이고, 그것이 명시적 새 스펙이다. 선례가 있다 — 버튼 사다리에서도 소유자가
새 스펙을 주어 제품이 LOUIS 를 따라간 적이 있다(DS-D-0032).

**이 예외의 범위는 좁다.** 「Figma 에 그려져 있으면 정본」이 아니라 **「소유자가 새 스펙으로
그린 것이면 정본」**이다. 그렸다는 사실만으로는 부족하다 — 직전 작업들이 고친 Figma 결함(카드 밖
닫기 버튼, 뒤에 선 spinner, 어긋난 곡률)은 전부 그려져 있었고 전부 Figma 쪽이 틀렸다.

## 값 — 60칸 전수 실측

`use_figma` 읽기 전용으로 `672:552` 의 `Variant=danger-secondary` 60칸(Size 3 × State 5 × Icon 4)을
순회했다. 누락 0 · 중복 0.

| 축 | `danger` | `danger-secondary` | 다른가 |
| --- | --- | --- | --- |
| 면 Default·Active·Loading | `accent-danger` #ff4b59 @1 | `accent-danger-secondary` #ff4b59 @0.12 | 예 |
| 면 Hover | `accent-danger` (Default 와 동일) | `accent-danger-secondary-hover` @0.24 | 예 |
| 면 Disabled | `bg-inset` #e3e4e8 | `bg-inset` #e3e4e8 | 아니오 |
| 글자 non-disabled | `fg-on-danger` #fafafa | `accent-danger` #ff4b59 | 예 |
| 글자 Disabled | `fg-disabled` #9aa0ab | 같음 | 아니오 |
| stroke · effects | 없음 | 없음 | 아니오 |
| 기하(높이·padding·gap·radius·minWidth) | — | 60 조합 전부 동일, 차이 0건 | 아니오 |

**갈리는 것은 면과 글자 두 축뿐이다.** 그래서 `figma/components.measured.json` 의 `sizes` 표에
새 칸이 없고 `states` 표에만 행이 하나 붙는다.

**아이콘·스피너 색은 가져오지 않았다.** Figma 에서 glyph 의 Vector stroke 와 Spinner fill 이 둘 다
`fg-primary` 인데 **`danger` 에서도 같다** — variant 를 따르지 않는 것이고, 그 값을 구현에 옮기면
꽉 찬 danger 의 흰 글자 옆에 검은 아이콘이 선다. 정본이 아니므로 코드는 지금대로 `currentColor`
상속을 유지한다.

**Loading 은 Figma 를 따르지 않는다.** Figma 의 Loading 칸은 Default 와 바이트 동일한데 코드는
`loading` 에 `aria-disabled` 를 걸어 Disabled 와 같은 중성 면을 준다. **같은 어긋남이 `primary`·
`danger` 에도 있다** — 이 축이 만든 것이 아니라 State 문법의 기존 계약이고, 여기서 다시 열지 않는다.

## 토큰 — 값이 같은 이름이 이미 있는데 왜 새로 여는가

12% 와 24% 는 `color-alert-danger-surface` · `color-alert-danger-stroke` 와 **값이 완전히 같다.**
그래도 재사용하지 않는다 — [DS-D-0029](DS-D-0029-token-names-must-be-true.md)가 이름이 참이어야
한다고 정하고, alert 소유의 이름을 버튼 면으로 물면 alert 의 값을 조정하는 날 버튼이 함께 움직인다.
반대로 [DS-D-0030](DS-D-0030-no-duplicate-role-tokens.md)의 「같은 역할에 이름을 둘 두지 않는다」는
걸리지 않는다 — 역할이 다르기 때문이다(경고 배너의 면 vs 컨트롤의 면).

프리미티브는 **더하지 않았다.** `--louis-color-red-alpha-12` · `-24` 가 이미 서 있다.
두 신규 토큰은 Light·Dark 가 같은 alias 다 — 알파라 바닥이 뒤집혀도 같은 정도로 물든다.
`accent-menu-danger-hover` 가 8%/12% 로 갈리는 것과 다른데, 그쪽은 라이브 값이 그렇게 서 있었기
때문이고 이쪽은 Figma 가 두 모드에 같은 alias 를 물려 두었다.

## 기억이 틀렸다 — badge · toast · icon-button 은 「이미 연한 면」이 아니었다

이 저장소의 기억에 「LOUIS Button 만 꽉 찬 danger 를 갖는다. badge · toast · icon-button 은 이미
연한 면이니 Button 을 나머지에 맞추면 된다」는 숙제가 열려 있었다. **실측이 그것을 반박한다.**
그 셋은 `--louis-color-bg-danger`(라이트 red/100 · 다크 red/900)를 쓴다 — **불투명 컨테이너
토큰**이지 알파 면이 아니다. Figma 60칸은 그 셋의 답이 아니라 Button 에 없던 **별도의 alpha
사다리**를 새로 세운 것이다.

그래서 `icon-button.css` 의 「`color-accent-danger*` 가 생기면 함께 갱신한다」는 약속도 **이번에
발동하지 않는다.** 그 주석이 기다리는 것은 solid action 토큰이고 이번에 생긴 것은 secondary alpha
토큰이다. 다른 건이므로 같은 변경에 끌어들이지 않았다.

같은 기억에 「버튼 면은 accent 알파다 — `bg-danger` 같은 컨테이너 불투명 토큰을 버튼 면으로 집지
마라」는 경고도 있었고, **그쪽은 실측으로 정확했다.**

## Alternatives

- **Figma 의 60칸을 지운다.** 게이트는 그것으로도 초록이 되고 변형이 300으로 돌아간다. 소유자가
  의도해 그린 스펙을 게이트를 닫기 위해 지우는 것이므로 버린다 — 이 저장소가 세 번 겪은 거짓
  초록과 같은 모양이다.
- **`figmaOnlyProperties` 로 선언해 우회한다.** 그 자리는 **코드에 대응이 없는 축**에 쓰는 것이고
  (`State` · `Icon` 이 그렇다), 여기서는 코드가 표현할 수 있는 값이라 선언이 사실을 왜곡한다.
  DS-D-0041 이 `Tone` 에서 같은 우회를 이미 금했다.
- **`Destructive` 나 `Tone` 같은 새 boolean/축을 연다.** Figma 가 이미 `Variant` 값으로 그려
  두었고, 축을 옮기면 60칸을 다시 그려야 한다. 그리고 §10 이 옵션 집합을 **글자 그대로** 대조하므로
  이름이 갈리는 순간 게이트가 다시 빨개진다.
- **제품에 채택 자리를 하나 만들어 「세 곳 동시」를 형식적으로 채운다.** 최소 변경이 아니고, 없는
  요구를 만들어 내는 것이다. [DS-D-0028](DS-D-0028-three-in-one-change.md)이 요구하는 것은 세 곳이
  **어긋나지 않는 것**이지 세 곳을 다 건드리는 것이 아니다.

## Consequences

- Button 변형이 300 → **360**(6 × 3 × 5 × 4)이 된다. `figma-component-authoring.md` §5 의 예산
  문단과 라이브 분포 표가 같은 변경에서 갱신됐고, 이제 **세는 명령**을 함께 적는다.
- semantic 토큰이 둘 늘어난다. `check-token-diff` 판정은 **additive 4**(두 토큰 × 두 모드)이고
  removal · value · aliasTarget 변화는 0 이다.
- 새 variant 는 **WCAG AA 에 미달한다** — axe 실측 2.82:1(#ff4b59 글자, 12% 면이 흰 바닥에 합성된
  #ffe9eb, 14px normal 이라 기준 4.5). 네 variant 가 이미 미달인 그 판정의 연장이며, 4.5 를
  넘기려면 `red.500` 자체를 내려야 한다 — 이 variant 가 아니라 팔레트의 결정이다.
  `button.browser.test.tsx` 의 허용 목록에 사유와 함께 적었다.
- 제품은 이번에 움직이지 않는다. 채택 자리가 생기는 날 제품 `ButtonVariant` 에 같은 값을 더하는
  것이 남은 일이고, 그때 이 문서가 값의 출처가 된다.

## Rollout and verification

여섯 곳이 같은 변경에 들어갔다.

1. **타입** — `packages/react/src/button/button.tsx` 의 `ButtonVariant`. 게이트가 읽는 것은
   `packages/react/dist/button/button.d.ts` 라 `pnpm build` 가 필수다.
2. **CSS** — `packages/css/src/component/button.css` 세 자리(면 · hover · disabled 목록).
3. **토큰** — `packages/tokens/src/klipse.tokens.json` 의 light·dark semantic 각 두 개.
4. **되읽기** — Figma 라이브에서 신규 변수 두 행을 읽어
   `figma-readback-emit.mjs --merge-variables` 로 넣었다. **손으로 쓰지 않았다.**
   component 쪽 360칸은 직전 커밋의 캡처에 이미 담겨 있어 재채취가 필요 없었다.
5. **기록** — `figma/components.measured.json` 의 `states` 에 행 하나와 `$` 사유.
   `sizes` 는 손대지 않았다(기하 차이 0건).
6. **문서** — 이 결정 · `design/components/button.md`(언제 갈라 쓰는가 포함) ·
   `figma-component-authoring.md` §5.

**Figma 는 쓰지 않았다.** 이미 서 있고, 게시는 요건이 아니다(DS-D-0035).

검증: `pnpm build` · `pnpm check` · `pnpm test`(834) · `pnpm run verify:ci` 전부 exit 0.
`verify-figma-parity` 는 위 실패 문구가 사라지고 `parity OK (변수 508개 …)` 를 낸다.

**음성 시험 — 명령과 출력.** 새 면 값을 흔들면 잡히는지 실제로 확인했다. `button.css` 의
`danger-secondary` 면을 `--louis-color-accent-danger-secondary` → `--louis-color-accent-danger`
(같은 빨강의 불투명판)로 바꾸고 `node ./scripts/build-css.mjs` 뒤에

```sh
npx vitest run packages/react/test/component-states.browser.test.tsx \
                packages/react/test/button.browser.test.tsx
```

두 project(`browser` · `browser-reduced-motion`)에서 **여섯 개가 실패한다.**

```
FAIL  packages/react/test/component-states.browser.test.tsx
  > Button danger-secondary의 상태별 토큰이 states 표와 같다
  AssertionError: danger-secondary/Default background:
    expected 'color(srgb 1 0.294118 0.34902)' to be 'color(srgb 1 0.294118 0.34902 / 0.12)'

FAIL  packages/react/test/button.browser.test.tsx
  > danger-secondary는 danger와 다른 면을 쓰고 hover에서 더 진해진다
  AssertionError: expected 'color(srgb 1 0.294118 0.34902)' to be 'color(srgb 1 0.294118 0.34902 / 0.12)'

FAIL  packages/react/test/button.browser.test.tsx
  > variant마다 접근성 위반이 없다 (알려진 것 제외)
  AssertionError: danger-secondary에서 새 접근성 위반이 있습니다:
    expected [] to deeply equal [ 'color-contrast' ]
```

**세 번째가 특히 중요하다** — 허용 목록이 「미달을 눈감아 주는 칸」이 아니라 **양방향 계약**임을
보여 준다. 불투명 빨강으로 바뀌면 대비가 올라가 위반이 사라지고, 그래도 실패한다. 되돌리면
50건 전부 초록이다(`Tests 50 passed`). 게이트가 값이 아니라 **속성의 존재**만 보고 있었다면
셋 다 통과했을 자리다.
