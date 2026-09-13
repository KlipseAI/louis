---
id: decision-test-stack
status: experimental
authority: normative
---

# DS-D-0005 Test stack

- Status: proposed
- Date: 2026-08-14
- Owners: repository owner, package maintainer
- Affects: `@klipse-design/css`, `@klipse-design/react`, `component-button`, `component-dialog`,
  `component-menu-popover`, `governance-execution-playbook`

## Context

이 저장소에는 테스트 러너가 없다. 유일한 실행 검사는 토큰 consumer fixture와 생성기 canary다. P3
컴포넌트를 만들기 전에 무엇으로 검증할지 정해야 한다.

규범이 요구하는 acceptance criteria 중 상당수는 **레이아웃과 hit-test가 있어야만** 검증된다. Menu의
"Panel이 덮는 좌표에 더 높은 투명 레이어가 없다", Dialog의 "modal 동안 뒤 앱이 pointer·keyboard·
accessibility tree에서 상호작용되지 않는다", Button의 "44px 타깃" 같은 항목이다.

## Decision

**1단계 — 실브라우저 러너를 처음부터 쓴다.** Vitest browser mode(Playwright Chromium, headless)와
`axe-core` 직접 호출을 도입하고, node 프로젝트(순수 로직)와 browser 프로젝트로 나눈다. 테스트 명령
하나를 root `verify`에 연결한다. **jsdom과 happy-dom은 도입하지 않는다.**

**2단계 — 시각 회귀·다중 브라우저·Storybook은 hosted CI 확보 후로 이연한다.**

### jsdom·happy-dom을 배제하는 이유

두 환경 모두 Dialog 규범을 **거짓 통과**시킨다.

| 환경 | 실측 |
| --- | --- |
| jsdom | `HTMLDialogElement` 구현이 사실상 빈 클래스라 `showModal()`/`show()`/`close()`가 없다. `getBoundingClientRect()`는 전 필드 0, `getClientRects()`는 빈 배열. `elementFromPoint`와 `inert` 미구현. 포인터 이벤트는 생성자만 있고 발화하지 않는다 |
| happy-dom | `showModal()`과 `show()`가 **완전히 동일**하다. top-layer, Escape 취소, focus trap, 바깥 inert, backdrop이 전무하고 `getBoundingClientRect()`는 빈 사각형, `elementFromPoint()`는 항상 null |

즉 **dialog.md의 modal/non-modal mode 구분 테스트가 구현이 실제로 둘을 구분하든 안 하든 양쪽 다
통과한다.** 초록 테스트가 규범 위반을 은폐하는 것은 이 저장소가 금지하는 fake completion과 같은
결과다. 색 대비 검사도 jsdom에서는 원리적으로 비활성이다.

### 검증 수단 매트릭스

| 규범 acceptance criterion | 검출 수단 | jsdom/happy-dom |
| --- | --- | --- |
| Menu: action item 클릭 시 callback이 정확히 한 번 | 실제 입력 + 호출 횟수 | 합성 이벤트라 순서 로직만 |
| Menu: panel이 덮는 좌표에 더 높은 투명 레이어가 없다 | 브라우저 hit-test | **불가** |
| Dialog: modal 동안 뒤 앱이 pointer·keyboard·a11y tree에서 차단 | 실제 순차 포커스 + actionability | **불가** |
| Dialog: 두 개를 쌓아도 topmost만 Escape 처리 | 실제 키 입력 × N | **거짓 통과** |
| Dialog: scroll owner 잠금과 복원 | 실제 스크롤 위치·computed style | **불가** |
| reduced-motion 대체 동작 | 브라우저 컨텍스트 옵션 | 목킹 필요 |
| Button: 44px 타깃 | `getBoundingClientRect()` | rect가 0이라 무의미 |
| Button: focus-visible이 보인다 | `:focus-visible` 매칭 + computed style | 휴리스틱 없음 |
| 토큰 light/dark 색 대비 | axe `color-contrast` | **비활성** |
| id 중복 없음 + SSR/hydration | 문자열 렌더 후 hydrate + 복구 오류 관찰 | 문자열 비교로는 못 잡음 |
| branch registry, reducer 등 순수 로직 | 일반 unit | node 프로젝트로 충분 |

11개 중 7개가 실브라우저 전용이다. 플레이북 3절의 증거 2단 모델은 Web `partial`에 "DOM keyboard/focus
interaction test + automated accessibility check"를 요구하는데, jsdom으로 그 요구를 형식적으로만
만족시키면 위 7항목이 검증되지 않은 채 초록이 된다. 플레이북 서문("절차가 이 문서와 달라도 인계서의
완료 증거를 더 잘 충족한다면 그 방식이 옳다")에 근거해, "browser는 후속 게이트로 미룬다"를 **"시각
회귀와 다중 브라우저를 미룬다"로 재해석**하고 실브라우저 러너 자체는 1단계에 둔다. **게이트 수는
늘지 않는다** — 테스트 명령 하나를 `verify`에 연결한다.

### 자동 접근성 검사의 한계를 명시한다

`axe`는 린터다. 다음은 잡지 못하므로 **직접 작성한 행위 테스트**가 소유한다 — 키보드 순서의 논리성,
Escape 스택 순서, focus 복귀 대상의 적절성, danger action의 Enter 금지, activation exactly-once,
reduced-motion 언마운트. 자동 검출률은 절반 남짓이다.

**타깃 크기 근거 표기:** WCAG 2.2 AA는 24×24 CSS px(SC 2.5.8)이고 44×44는 AAA(SC 2.5.5)다. Klipse의
44px는 **내부 상향 기준**이다. axe의 target-size 규칙은 기본 비활성이고 24px만 검증하므로, 명시적으로
켜되 44px는 별도 assertion으로 담보한다.

## Alternatives

### Jest + jsdom

Vite 기반 저장소에서 2026년 신규 채택 근거가 없고, jsdom 자체의 결함은 위와 같다.

### Testing Library의 interactability 체크로 충분한가

아니다. 실제 검사는 "요소가 `pointer-events: none`을 갖거나 상속하는가"의 CSS 속성 검사뿐이고 기하학적
겹침은 보지 않는다. Menu의 "덮는 좌표에 투명 레이어가 없다"는 원리적으로 검증 불가다.

### axe 래퍼 패키지

Vitest용 래퍼는 최신 stable이 수년 전이고 현행 axe·Vitest 조합 대응이 없다. Jest용 매처는 Vitest
호환이 미확인이다. **`axe-core`를 직접 호출**하면 의존성 하나에 코드 열 줄이다.

### Playwright Component Testing

패키지가 아직 experimental 이름이고 semver를 지키지 않으며, 최근 릴리스에서 일부 프레임워크 지원이
경고 없이 제거된 전례가 있다.

### Storybook + 시각 회귀 SaaS

문서 사이트 착수 시 기존 browser 설정을 재사용하므로 러너 중복이 없다. SaaS는 외부 계정과 토큰이
필요한 **새 권한**이라 지금은 `not-ready`다.

## Consequences

- 1단계 devDependency는 테스트 러너, 브라우저 provider, Playwright, React 렌더 어댑터, `axe-core`
  다섯 개다. `axe-core`는 규칙 식별자 변동을 막기 위해 버전을 고정한다. **고정은 lockfile 이 한다**
  (2026-09-13 정정) — 루트 `package.json` 의 specifier 는 `^4.13.0` 이고 `pnpm-lock.yaml` 이 `4.13.0` 으로
  해석하며, CI 는 `pnpm install --frozen-lockfile` 로 설치한다. 규칙 식별자가 바뀔 수 있는 새 버전은
  lockfile 을 갱신하는 의도적 변경으로만 들어온다. specifier 를 exact 로 좁히지는 않았다.
- **선행 조건:** Playwright Chromium 바이너리 다운로드가 필요하다. 네트워크 접근과 사용자 승인이
  필요한 항목이므로 [플레이북](../execution-playbook.md)의 사용자 차단 해제 목록에 추가한다.
- **주의 계약:** browser mode는 파일당 단일 페이지를 재사용한다. Menu와 Dialog처럼 전역 상태(top-layer,
  scroll lock, body 클래스, 포인터 위치)를 건드리는 컴포넌트는 각 테스트 뒤 정리를 **규범으로**
  요구한다. 빠뜨리면 테스트 간 누수가 규범 위반을 은폐한다.
- 게이트 수 변화는 0이다.
- 2단계 시각 회귀는 스냅샷이 OS·GPU·폰트 렌더링에 의존하고 파일명에 플랫폼이 들어간다. hosted CI 없이
  로컬 baseline을 커밋하면 CI가 생기는 순간 전량 폐기되므로 지금 `not-ready`가 정확한 판정이다.

## Rollback

browser mode가 특정 환경에서 실패하면 jsdom 프로젝트로 전환하는 것은 기술적으로 가능하다. **단, 그
순간 위 표의 7항목을 검증되지 않음으로 재분류하고 해당 컴포넌트의 Web 상태를 `partial` 이하로
되돌린다.** 조용한 다운그레이드를 금지하는 이 규칙을 규범으로 둔다.

React 렌더 어댑터 교체는 테스트 파일 수준의 국지적 변경이다. 2단계 도입은 순수 추가라 rollback 비용이
낮다.

## Rollout and verification

1. node 프로젝트와 browser 프로젝트를 나눈 설정을 추가하고 테스트 명령을 `verify`에 연결한다.
2. 게이트가 실제로 실패를 전파하는지 의도적 failure canary 1건으로 확인한다.
3. reduced-motion 컨텍스트를 별도 instance로 구성해 목킹 없이 검증한다.
4. Menu·Dialog 회귀 테스트 3건(activation exactly-once, nested Escape 순서, closing 레이어의 hit-test
   차단)을 **컴포넌트 구현 착수 전에** 작성한다.
5. SSR 문자열 렌더와 hydration 복구 오류 관찰 경로를 확인한다. — **절반만 섰다(2026-09-13 대조).**
   문자열 렌더는 `scripts/verify-consumer.mjs` 가 공개 이름으로 import 해 Node 에서
   `renderToStaticMarkup` 으로 돈다. hydration 복구 오류를 관찰하는 경로(`hydrateRoot` 후 콘솔·
   `onRecoverableError` 관찰)는 저장소에 없다.

## 재검토 조건

- hosted CI가 생기면 즉시 2단계를 도입한다. 시각 회귀 baseline은 CI에서만 생성하고 로컬 커밋을
  금지한다. 다중 브라우저 instance 추가도 이때 판정한다.
  **발동됨(2026-08-18) — 2단계는 도입하지 않았다.** 사유는 둘이고 둘 다 기록에 있다. ① 발동 직후
  러너는 `verify:ci` 갈래를 초록으로 만드는 데 쓰였다 — 2026-08-18T04:12 부터 08-22T06:55 까지 46회
  연속 빨강(`scripts/verify-gate-split.mjs` 머리말). ② 2026-08-22 부터 러너가 GitHub 결제 문제로
  멈춰 있다([인계서](../execution-handoff.md) DS-GOV-000). 이 조건은 baseline 을 **CI 에서만** 만들라고
  정했으므로 멈춘 러너 앞에서 로컬 baseline 을 대신 커밋하는 것은 이 결정 위반이다. 따라서 2단계는
  「러너 재개」를 새 선행 조건으로 미룬다 — 그동안 시각 회귀·Firefox·Safari 는 검증되지 않은 상태이고,
  브라우저 하한([DS-D-0002](DS-D-0002-web-support-scope.md))의 Firefox·Safari 는 테스트가 뒷받침하지
  않는다.
- ~~문서 사이트 착수 시 Storybook과 접근성 애드온을 기존 browser 설정 위에 얹는다.~~
  **발동됨(2026-08-14).** 문서 사이트가 아니라 P3 컴포넌트 개발이 먼저 필요로 해서 앞당겼다.
  [DS-D-0012](DS-D-0012-component-workshop.md)가 소유한다. 단 **2단계 시각 회귀 판단은 그대로다**
  — Storybook은 사람이 보는 워크샵이고 스냅샷 baseline을 만들지 않는다.
- 시각 회귀 API가 stable로 승격되면 실험적 표기 관련 위험을 재평가한다.

## 미확인

Klipse 규모에서의 실행 시간, 서버 렌더 API가 브라우저 번들에서 동작하는지(실패 시 node 프로젝트에서
fixture를 만들고 browser에서 주입 후 hydrate), instance별 컨텍스트 옵션의 상속 규칙.
