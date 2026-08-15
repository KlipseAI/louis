---
id: decision-component-workshop
status: experimental
authority: normative
---

# DS-D-0012 Component workshop

- Status: proposed
- Date: 2026-08-14
- Owners: repository owner, package maintainer
- Affects: `apps/storybook`(신규), `decision-test-stack`, `@klipse-design/react`, 모든 카탈로그
  component와 pattern

## Context

이 저장소에는 **코드로 만든 컴포넌트를 사람이 눈으로 볼 수 있는 곳이 없다.**

- 실브라우저 회귀 테스트 164건은 전부 headless다. `getComputedStyle`로 계산값을 대조하고 이벤트
  순서를 검증하지만 화면을 띄우지 않는다.
- `apps/docs`는 `README.md`와 `package.json`만 있는 껍데기다. DS-P4는 미착수다.
- Figma 드래프트에 변수·style·Button component가 있지만 그것은 디자인 쪽 표현이고, parity 게이트가
  대조하는 것은 변수 값과 variant 이름이지 **실제 외형이 아니다.**

[DS-D-0005](DS-D-0005-test-stack.md)는 시각 회귀(자동 스냅샷 비교)를 hosted CI 확보 후 2단계로
이연했고 그 판단은 지금도 유효하다. 스냅샷이 OS·GPU·폰트 렌더링에 의존해 로컬 baseline은 CI가 생기는
순간 폐기되기 때문이다.

그러나 **"자동 시각 회귀를 미룬다"와 "사람이 눈으로 볼 곳조차 없다"는 다른 문제다.** 후자는 결정된
적이 없고, 단지 P4가 미착수라 비어 있었다.

DS-D-0005의 재검토 조건은 "문서 사이트 착수 시 Storybook과 접근성 애드온을 기존 browser 설정 위에
얹는다"고 예고했다. 이 결정은 그 조건을 앞당겨 발동시킨다. 문서 사이트가 아니라 **P3 컴포넌트 개발**이
먼저 필요로 하기 때문이다 — 남은 component 7개와 pattern 4개를 눈으로 확인하지 못한 채 만들면
되돌리기 비싼 오차가 누적된다.

## Decision

Storybook 10을 **`apps/storybook`** 에 도입하고 공개 package를 workspace 의존으로 소비한다.

| 항목 | 선택 |
| --- | --- |
| 위치 | `apps/storybook` — 공개 문서 사이트(`apps/docs`)와 분리 |
| 소비 경로 | `@klipse-design/react`·`@klipse-design/css`의 **public export만** |
| 빌더 | `@storybook/react-vite` (Vite 8은 이미 vitest가 들고 있다) |
| 애드온 | `@storybook/addon-a11y`, `@storybook/addon-docs` |
| 테마 | globalType 툴바가 `data-theme`를 전환한다. `:root`가 light이고 `[data-theme="dark"]`가 override다 |
| 게이트 | `pnpm build`·`check`·`verify` **어디에도 넣지 않는다** |

### src가 아니라 public export를 소비하는 이유

인계서 5절의 package 경계 표는 `apps/*`가 "공개 package만 소비"한다고 규정한다. 그 규칙을 Storybook에
그대로 적용하면 부수 효과가 하나 생긴다 — **Storybook이 두 번째 consumer가 된다.** export 누락,
`exports` 서브패스 오타, `sideEffects` 오설정, `.d.ts` 생성 실패가 스토리를 여는 순간 드러난다.
`packages/react/.storybook`에서 `src`를 직접 import하면 그 검출력을 전부 잃는다.

대가는 개발 루프다. `dist`를 읽으므로 소스를 고치면 다시 빌드해야 한다. 이 저장소에서 그 명령은
`tsc` 한 번이라 1초 남짓이고 `--watch`로 상시화할 수 있다. **검출력과 1초를 맞바꾼다.**

### 이것은 시각 회귀가 아니다

Storybook 도입은 DS-D-0005의 2단계 판단을 바꾸지 않는다. 스냅샷 baseline을 만들지도 커밋하지도 않고,
어떤 게이트도 Storybook의 렌더 결과를 검사하지 않는다.

**"Storybook이 있으니 시각 검증이 됐다"를 승격 근거로 쓸 수 없다.** 컴포넌트 `Web` 상태의 승격
조건에서 visual regression 항목은 그대로 남는다. 이 구분을 명시하는 이유는, 워크샵의 존재가 자동
검증의 부재를 가리기 쉽기 때문이다.

### 게이트에 넣지 않는 이유

`pnpm build`에 Storybook 빌드를 넣으면 모든 세션의 표준 검증이 수십 초 느려지는데 얻는 것은
"스토리가 빌드된다" 하나다. 그 실패는 스토리를 여는 순간 드러난다.

`verify-gates.mjs`의 `declaredPackageSurfaces`는 `packages/*`만 검사하고 `apps/storybook`은
`private: true`라 배포 표면이 없다. **게이트 수 변화는 0이다.**

## Alternatives

### 최소 정적 프리뷰 페이지

새 의존성이 0이라 가장 싸다. 그러나 variant 매트릭스, 테마 전환, 상태 조작, 접근성 검사를 전부 손으로
만들게 되고 결국 Storybook의 열등한 재구현이 된다. 컴포넌트가 1개일 때는 맞는 선택이었지만 남은 것이
11개다.

### `packages/react/.storybook`에서 `src` 직접 소비

개발 루프가 가장 빠르다. 위의 "두 번째 consumer" 검출력을 잃고, package 경계 표의 의존 방향 규칙과도
어긋난다.

### Ladle / Histoire

의존성이 가볍다. 그러나 접근성 애드온 생태계와 유지 이력이 짧고, DS-D-0005가 이미 Storybook을
예고했다. "가볍다"만으로 예고된 경로를 바꾸지 않는다.

### `@storybook/addon-vitest` 동시 도입

스토리를 vitest 테스트로 자동 승격시킨다. 매력적이지만 **지금은 도입하지 않는다.** 우리 vitest 설정은
project 3개에 project별 `define` 주입까지 있고 `verify-test-harness.mjs`가 각 project의 실패 전파를
canary로 고정한다. addon이 project를 추가로 밀어 넣으면 그 canary와 충돌할 위험이 실재한다. 우리 회귀
테스트는 이미 실브라우저이므로 급하지 않다.

### `apps/docs`를 Storybook으로 대체

docs site는 spec·API·example·search·update 문서를 소유하는 별도 제품 계약이고 DS-P4-001이 그 계약을
쓸 예정이다. 워크샵과 공개 문서를 한 도구에 묶는 결정을 그 계약보다 먼저 내리지 않는다.

## Consequences

- 새 devDependency 3개와 전이 의존이 추가된다. 전부 `apps/storybook`과 루트 devDeps에만 들어가고
  배포 package에는 들어가지 않는다.
- `apps/storybook`이 public export의 **두 번째 consumer**가 된다. Menu·Dialog가 공개되면 그 export
  누락도 여기서 먼저 드러난다.
- 남은 component 7개와 pattern 4개를 만들 때 시각 확인이 가능해진다. Button과 overlay는 사후 확인이 된다.
- 스토리 파일이 새 유지 대상이 된다. 컴포넌트 하나당 스토리 하나를 규범으로 두지는 않되, `Web`을
  `partial` 이상으로 올릴 때 **스토리 존재를 증거 목록에 넣는다.**
- `pnpm build`·`check`·`verify`의 실행 시간과 게이트 수는 변하지 않는다.

## Rollback

`apps/storybook` 디렉터리와 루트 devDependency 3개를 지우면 끝난다. 공개 package, 게이트, 테스트,
생성 파일 어느 것도 Storybook을 참조하지 않으므로 **rollback 비용이 구조적으로 낮다.** 이 낮은 비용이
`proposed` 상태에서 도입을 진행하는 근거다.

Storybook이 유지보수 문제를 일으키면 최소 정적 프리뷰로 후퇴한다. 그 경우 잃는 것은 워크샵이지
공개 계약이 아니다.

## Rollout and verification

1. ~~`apps/storybook` 스캐폴드와 devDependency 추가~~ — **완료(2026-08-14).** Storybook 10.5.8 +
   `@storybook/react-vite` + `addon-a11y` + `addon-docs`. `pnpm build && pnpm check && pnpm verify`가
   **게이트 수 변화 0**으로 통과한다. 텔레메트리는 껐다 — 워크샵은 로컬 검증 도구이고 저장소 내용이
   외부로 나갈 이유가 없다. 스토리는 루트 `typecheck`에 포함해 export 회귀가 컴파일에서 잡히게 했다.
2. Button 스토리 — variant 4 × size 2 매트릭스, loading·disabled, 긴 KO/EN/JA 라벨, icon-only
   accessible name.
3. 테마 툴바로 light/dark를 전환해 semantic 토큰이 실제로 갈리는 것을 확인한다.
4. `@storybook/addon-a11y`가 위반 0을 보고하는지 확인한다. 위반이 나오면 **컴포넌트를 고친다**
   — 스토리를 고쳐서 통과시키지 않는다.
5. DS-P3-006 이후 Menu·Popover 스토리를 같은 방식으로 추가한다.
6. owner가 확인하면 `accepted`로 전환한다.

## 도입 직후 실측 (2026-08-14)

워크샵을 켠 지 몇 분 만에 헤드리스 테스트가 못 보던 결함 셋이 나왔다. 이것이 이 결정의 사후 근거다.

| 발견 | 성격 |
| --- | --- |
| 좁은 flex 컨테이너에서 Button 라벨이 글자 단위로 쪼개졌다("primary" → "pri/ma/ry"). `overflow-wrap: anywhere`가 min-content를 74px → 38px로 낮춰 flex가 버튼을 한 글자 폭까지 줄인 것이다 | 고침 + 회귀 테스트 + canary |
| Menu Trigger가 시각 표현을 소유하지 않아 기본값이 브라우저 네이티브 버튼이다. `asChild`가 의도된 경로임이 스토리에서 드러났다 | 스토리와 규범에 반영 |
| danger item의 톤이 일반 item과 대비 light 1.21 / dark 1.14로 사실상 구분되지 않는다 | 토큰 공백 — DS-P3-014 단위 9로 이관 |
| composite popover에 내용이 다 보이는데 스크롤바가 생겼다. `.kds-hit-target`의 44px 타겟이 28px 컨트롤에서 시각 박스 밖으로 8px씩 나가고, 패널이 스크롤 컨테이너라 그것이 스크롤 가능한 overflow가 된다(실측 157 → 153) | 고침 + 회귀 테스트 + canary |

네 번째 발견의 회귀 테스트는 **두 번 고쳐야 재현됐다.** 처음에는 fixture가 raw `<button>`을 써서
`.kds-hit-target`이 없었고, 그 다음에는 그 Button이 마지막 자식이 아니라 gap이 초과분을 흡수했다.
canary가 없었으면 "통과하지만 아무것도 보지 않는" 테스트가 그대로 남았을 것이다.

셋 다 계산값 단언으로는 통과하던 상태였다. 첫 번째는 `scrollWidth <= clientWidth`를, 세 번째는
"토큰을 쓰고 있다"를 만족하고 있었다.

## 재검토 조건

- hosted CI가 생기면 (a) Storybook 빌드를 별도 job으로 넣을지, (b) DS-D-0005 2단계 시각 회귀를 스토리
  위에 얹을지 함께 판정한다.
- `@storybook/addon-vitest`는 우리 project 구성과 `verify-test-harness.mjs` canary가 충돌하지 않는다는
  확인이 되면 재검토한다.
- DS-P4-001이 docs site 제품 계약을 확정하면 Storybook과 docs site의 역할 분담을 다시 본다.
- 스토리가 컴포넌트 구현과 어긋나기 시작하면(스토리만 통과하는 상태) 스토리를 회귀 테스트로 승격하는
  방안을 재검토한다.
