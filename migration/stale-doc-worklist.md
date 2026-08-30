# 낡은 지시 정리 목록 (2026-08-22 감사)

인계·절차 문서 10종을 현재 사실과 대조해 **86건**을 확인했다(각 항목은 별도 검증자가
반박을 시도해 살아남은 것만이다). 그중 **기록 성격 문서 6종은 경고 배너로 처리했다** —
`migration/figma-transfer/{NEXT-SESSION,RESUME,FIGMA-FEEDBACK}.md` 와
`bundle-2026-08-07/{TRANSPLANT,BUNDLE-README}.md`.

**이 문서에 남은 것은 살아 있는 규범 문서 4종의 43건이다.** 배너로 덮을 수 없다 —
지금도 작업 계약으로 읽히는 문서라 항목별로 고쳐야 한다.

> **2026-08-23 처리 상태 — 43건은 대부분 처리됐다.**
>
> 커밋 여섯(`4044552` · `b27de7e` · `755eee8` · `b586af1` · `bac2e40` · `df0c024`)이 이 목록을
> 소진했고, 그 결과를 **별도 레인이 적대적으로 감사**해 61건을 더 찾았다(고침이 불완전했다 —
> 「목록에 적힌 줄은 고치고 같은 사실을 말하는 다른 자리는 안 고쳤다」).
>
> **아래 항목을 근거로 되돌리기 전에 대상 파일을 먼저 열어라.** 낡은 문장이 이미 사라진 것이
> 대부분이다. 처리 여부의 판정은 이 문서가 아니라 **대상 파일의 현재 내용**이다.
>
> 그리고 이 감사 자체가 2026-08-22 기준이라 **여기 인용된 수도 이미 낡았다** — 예컨대
> 「게이트 26개」는 그 뒤로 두 번 더 움직였다. **게이트 수의 정본은 `package.json`의
> `verify:ci`·`verify:product` 두 스크립트이며, 산문에 다시 박지 않는다**(2026-08-30 기준
> `verify:ci` 15 + `verify:product` 25 = 40).
>
> **재발 방지로 게이트가 하나 섰다** — `verify-doc-paths` 가 문서의 저장소 경로 인용을 매
> `verify:ci` 마다 확인한다. 이 목록이 잡았던 부류 중 「없는 파일을 가리킨다」는 이제 기계가 잡는다.

## 먼저 알아야 할 것

- 감사가 판정 근거로 쓴 「지금의 사실」은 [계정 이전 인계서](../design/governance/handoff-2026-08-22-account-transfer.md)에 있다.
- **감사도 틀린다.** 같은 감사가 「Figma 파일 키가 낡았다」고 본 항목은 실제로는
  *파일이 둘이고 역할이 다른* 것이었다(`figma-sync.md` 「운영 파일」 참조). 고치기 전에
  해당 줄을 직접 열고 근거를 확인한다.
- `harm` 은 `wrong-work`(따라 하면 틀린 결과물) · `dead-path`(경로/파일 없음) ·
  `wrong-number`(수치만) · `confusing`(혼동) 순으로 정렬돼 있다.



## wrong-work

### `design/governance/execution-handoff.md:163`

**낡음** — §6 「세션 종료」 검증 블록이 `pnpm build` → `pnpm check` → `pnpm verify` → `build-design-docs --check --require-tracked` → `git diff --check` 다섯 줄이고, 173행이 「P3 test commands가 추가되면 root `check` 또는 `verify`에 연결해 위 명령만으로 누락을 찾을 수 있게 한다」고 약속한다.

**근거** — 셋 다 확인했다. (1) `KLIPSE_PRODUCT_REPO` 없이 `pnpm verify` 는 `verify:product` 첫 게이트에서 죽는다 — handoff-2026-08-22 §3 표가 「제품을 읽는 게이트 13개 중 6개가 그렇게 죽고 …」로 적어 두었고, 이 문서 9~11행 배너도 같은 말을 한다. 정작 §6 블록만 고쳐지지 않았다. (2) root `package.json` 확인: `test` 는 `vitest run` 독립 스크립트이고 `check`(check:tokens·icons·css·catalog·llms·typecheck)와 `verify`(verify:ci + verify:product) 어디에도 없다. `.github/workflows/ci.yml` 이 「Run browser regression suite」를 별도 단계로 돌린다. 이 문서 367행 스스로 「verify의 test-harness는 러너가 실패를 전파하는지만 증명하고 suite를 돌리지 않는다」고 적었다. 직접 세니 `npx vitest list` → browser(chromium) 378 + browser-reduced-motion(chromium) 378 = 브라우저 회귀 756건, node 18건, 합 774건 · 80파일. 조사자의 「756건」이 정확하다. (3) `pnpm clean-room` 이 `package.json` 에 실

**고침** — 블록을 `export KLIPSE_PRODUCT_REPO=…` → `pnpm build` → `pnpm check` → `pnpm verify` → `pnpm test` → `pnpm clean-room` → `node scripts/build-design-docs.mjs --check --require-tracked` → `git diff --check` 로 고치고, 173행의 「위 명령만으로」 약속을 지워라.

### `design/governance/execution-handoff.md:294`

**낡음** — (1c) 「determinate 진행률 — … 접근성 계약부터 정해야 한다」. 528행 「`layout-change` motion 토큰이 없다 … 넷째 lifecycle을 세우는 것은 DS-D-0016과 같은 크기」, 487행이 남은 owner 판정 셋에 「`layout-change` motion lifecycle」을 싣는다.

**근거** — 둘 다 닫혔다. `design/governance/decisions/DS-D-0022-determinate-progress-a11y.md` 가 존재하고 첫 절이 「인계서 (1c)가 determinate 진행률을 접근성 계약이 없다는 이유로 막아 두었다 … DS가 정한다」로 바로 이 문장을 지목해 해소한다. manifest 의 `progress` 는 web `partial` · figma `partial` · docs `done` 이고 snapshot 에 `ProgressBar` · `ProgressRing` 이 있다. `layout-change` 는 `DS-D-0019-layout-change-motion.md` 가 소유하며 `motion-layout-change` 토큰이 `klipse.tokens.json`(5622행 부근) · `figma/snapshot.json` · 생성 CSS(`packages/css/src/component/progress.css:28`, banner-carousel.css:250(제품 파일명)) 모두에 실재한다. 487행의 남은 판정 셋 중 (1c) Skeleton 면 색도 같은 문서 300~305행이 이미 「해소됨(2026-08-18)」으로 적었으므로 셋 중 둘이 낡았다.

**고침** — (1c)의 진행률 항목과 528행의 「`layout-change` 토큰이 없다」 문단을 삭제하고 DS-D-0019 · DS-D-0022 링크로 대체하라. 487행의 남은 판정 목록은 (2b) 컨트롤 테두리 하나만 남긴다.

### `design/governance/execution-handoff.md:448`

**낡음** — 「Avatar가 섰다(2026-08-18) — 남은 것은 `BannerCarousel` 하나이고 그것은 지금 착수할 수 없다.」 + 「막는 것 넷이 전부 이 컴포넌트 바깥의 미결이다」(톤 런타임 샘플링 · progressive blur · stagger · 점 폭 전환).

**근거** — 이미 섰다. `design/manifest.json` 의 `banner-carousel` 이 web `partial` · figma `partial` · docs `done` 이고, `figma/snapshot.json` component 목록에 `BannerCarousel` 이 있으며 `packages/react/src/banner-carousel/` 이 실재한다. 막는 것으로 든 넷 중 「점의 폭 전환(`layout-change` 토큰 부재)」은 특히 반증된다 — `packages/css/src/component/banner-carousel.css:250` 이 `var(--louis-motion-layout-change-duration)` 을 쓰고 있다.

**고침** — 448~456행을 「BannerCarousel `partial` (근거: manifest · snapshot)」로 줄이고 「지금 착수할 수 없다」와 막는 것 넷 목록을 삭제하라. 그대로 읽으면 존재하는 컴포넌트를 처음부터 다시 설계한다.

### `design/governance/execution-handoff.md:565`

**낡음** — 「셸 composition은 아직 없다. 부품 둘은 섰지만 rail·drawer·scroll root·safe area는 [패턴](../design/patterns/app-shell.md)이 기술만 하고 구현이 없다.」 489행 「남은 둘은 `Loading`(Skeleton에 막힘 — (1c) 면 색 판정)과 `App Shell`」.

**근거** — 구현이 있다. `packages/css/src/component/app-shell.css` 에 `.louis-app-shell`·`.louis-app-shell__rail`·`.louis-app-shell__scrim`·`[data-drawer="open"]`·「유일한 primary scroll root」 주석·`env(safe-area-inset-bottom, 0)` 이 전부 들어 있고, `packages/react/src/index.ts:36` 이 `AppShell` 과 `AppShellProps`·`AppShellVariant` 를 export 한다. manifest patterns: `app-shell` web `partial`, `loading` web `partial`, `project-grid` web `partial` — 「남은 둘」이 둘 다 서 있다. 489행이 근거로 든 「(1c) 면 색 판정」도 같은 문서 300~305행이 「해소됨(2026-08-18) — 고를 면이 없으므로 죽을 조합도 없다」로 닫았고 manifest 의 skeleton note 가 같은 말을 한다. 덧붙여 manifest 에는 이 문서가 언급하지 않는 패턴 넷(`landing-shell`·`auth-two-panel`·`status-result`·`route-boundary`, 전부 docs `done`)이 더 있다.

**고침** — 565행과 489행을 manifest 기준으로 고쳐라. 「아직 없다」를 읽고 App Shell 을 새로 지으면 `.louis-app-shell` 계열을 두 번 만들게 된다.

### `design/governance/execution-handoff.md:1240`

**낡음** — 「단위 3 — 코드 쪽은 준비됐고 Figma 쓰기에 막힌다」 — accent 램프 39개를 「확인한 뒤 되돌렸다」, parity 가 `변수가 snapshot에 없습니다: color-yellow-600` 로 하드 실패한다. 1099행은 「남은 8개는 전부 토큰을 더하는 단위」로 확대한다.

**근거** — 되돌리지 않았다. `packages/tokens/src/klipse.tokens.json` 의 `primitive.color` 에 mint·yellow·pink·violet·red 가 각각 9단(100~900)씩 들어 있고 ink-alpha 16 · paper-alpha 19 · red-alpha 9 도 있다. `figma/snapshot.json` 변수에 `color-yellow-600` 을 포함해 mint/pink/violet/yellow 36개가 실재하고, `node scripts/verify-figma-parity.mjs` 는 변수 345개로 통과한다 — 문서가 적어 둔 하드 실패는 재현되지 않는다. 같은 절 위의 DS-P3-014 표는 이미 단위 2·3 을 고쳤는데 아래 산문만 낡은 채 남았다.

**고침** — 1099~1130행의 「모든 토큰 확장 단위가 같은 곳에 막혀 있다」와 1240~1265행의 단위 2·3 산문을 삭제하라. 그대로 두면 이미 들어 있는 토큰 39개를 다시 넣고 additive diff 로 재확인하는 데 하루를 쓴다.

### `design/governance/execution-handoff.md:1266`

**낡음** — 「그리고 그 「적용 스크립트」가 저장소에 없다 … `scripts/`에 Figma 쓰기 스크립트는 존재하지 않는다 — 지금까지 MCP로 매번 즉석 코드를 실행해 왔다 … 단위 3을 실행하기 전에 적용 경로를 스크립트로 세우는 편이 낫다.」

**근거** — 존재한다. `ls figma/` → `apply-variables.1.js` ~ `apply-variables.7.js` 와 `apply-styles.js` 가 커밋돼 있다. 생성기 `scripts/build-figma-variables.mjs` · `scripts/build-figma-styles.mjs` 가 있고 드리프트 게이트 `verify-figma-variables`(= `build-figma-variables.mjs --check`) · `verify-figma-styles` 가 root `package.json` 의 `verify:ci` 체인에 실제로 들어 있다. `figma-sync.md` 쓰기 정책 4항이 「변수 적용은 `figma/apply-variables.js`가 유일한 경로다 … 즉석 코드를 쓰지 않는 이유는 `inventory-draw.*.js`와 같다」로 규범화했다. 문서의 「`scripts/` 에 없다」는 디렉터리만 놓고 보면 문자적으로 맞지만, 그 위에 세운 결론(재현 절차 없음 · 즉석 코드로 해 왔다 · 경로를 새로 세워라)이 전부 뒤집혔다.

**고침** — 이 문단을 삭제하고 「적용 경로는 `figma/apply-variables.*.js` 이며 figma-sync.md 쓰기 정책 4항이 소유한다」로 대체하라. 남겨 두면 있는 경로를 다시 만들거나, 더 나쁘게 「즉석 코드를 써도 된다」로 읽혀 figma-sync.md 의 규범을 깬다.

### `design/governance/execution-handoff.md:1332`

**낡음** — 제품 정본을 「배포본 `origin/main`」으로 부른다 — 「배포본 `origin/main`에 그 9개가 존재하지 않는다」(1332행) · 「구 저장소의 `globals.css` HEAD는 배포본 `origin/main`과 바이트 단위로 동일하다」(1337행). 1175·1201·1242·1275행의 실측도 「배포본에서 셌다」로 적는다.

**근거** — 측정 기준은 `design` 이다. `scripts/lib/product-ref.mjs` 가 「우선순위: `KLIPSE_PRODUCT_REF` > lock의 `productCommit` > `design`」으로 고정했고 주석이 「그전까지 측정 스크립트는 `origin/main`을 봤고 … 둘이 갈리면 같은 명령이 어제와 다른 값을 낸다」고 이유까지 적어 두었다. `migration/product.measured.json` 의 `productBranch` 는 `design`, `migration/product-evidence.lock.json` 의 `productRef` 는 `design` · `productCommit` `a3ed8e03…` 이며 `git branch --contains a3ed8e03…` 은 `design` 만 낸다. 두 브랜치는 실제로 갈렸다 — `git show origin/main:apps/web/app/globals.css | grep -c glass-` → **30**, 같은 파일의 `design` → **0**(폐지된 글래스 섀도우가 origin/main 에만 살아 있다). 즉 1337행의 「바이트 단위로 동일」은 지금 성립하지 않는다.

**고침** — 「배포본 `origin/main`」을 전부 「제품 정본 `design` 브랜치(측정 기준 커밋은 `migration/product-evidence.lock.json` 의 `productCommit`)」로 바꿔라. 이 표현을 믿고 `git show origin/main:…` 로 재실측하면 폐지된 글래스 섀도우 CSS를 재고 그 값을 DS로 올리게 된다.

### `design/governance/execution-handoff.md:1500`

**낡음** — DS-F-006 절이 「나머지 다섯은 `ready`이며 이것이 현재 다음 포인터다」(2026-08-15)라 적고, 표에 tooltip·toast·menu-popover·dialog 의 Figma 를 `not-ready` 로 싣는다. 1516행은 「여섯 중 다섯이 코드만 서 있고 Figma에 없다 … 목표 B의 병목은 여기다」.

**근거** — 실행으로 반증했다. `figma/snapshot.json` component 26개에 Tooltip · Toast · Menu · MenuPanel · Dialog 가 전부 있고, `design/manifest.json` 은 tooltip·toast·menu-popover·dialog 를 모두 `figma: partial` 로 싣는다. `node scripts/verify-figma-parity.mjs` → `parity OK (변수 345개, collection 3개, style 23개, component 26개, 변조 canary 34종)`. 같은 문서 442행 부근이 이미 「넷이 전부 섰다(2026-08-18). `DS-F-006`이 닫혔다」로 적고 있어 앞뒤가 서로를 반박한다. 상태표를 손으로 적어 둔 탓에 닫힌 작업이 「현재 다음 포인터」로 남았다.

**고침** — 1500행의 「다음 포인터」 선언과 1503~1516행의 상태표·병목 문장을 삭제하고 DS-F-006 을 `done` 으로 표시하라. Figma 상태는 manifest·snapshot 을 인용하고 문서에 수치를 박아 넣지 마라.

### `design/governance/execution-handoff.md:1752`

**낡음** — §12 「다음 작업자가 즉시 시작할 일」이 DS-P3-001·DS-F-000·DS-GOV-001·DS-P3-009a 넷을 `ready` 라며 하나를 고르라고 지시한다.

**근거** — 같은 문서 안에서 직접 확인했다 — DS-GOV-001 `done`(2026-08-14, 647행 부근), DS-P3-009a `done`(2026-08-14, 960행 부근, 산출물 `migration/screen-inventory.md` 80KB 실재), DS-F-000 `done`(2026-08-14, 1396행 부근). `in-progress` 는 DS-P3-001(670행) 하나뿐이다. `design/governance/releases.md:39` 에 「의도적 breaking과 baseline 갱신」 절도 서 있다. 문서 9~15행 배너가 이미 handoff-2026-08-22 → handoff-2026-08-19 순서를 지시하는데 §12 만 2026-08-14 상태로 얼어 있다. 1,783행 문서의 맨 끝 목록이 「즉시 시작할 일」로 남아 있는 것이 가장 나쁘다.

**고침** — §12 를 「지금 무엇을 할지는 handoff-2026-08-22-account-transfer.md → handoff-2026-08-19-product-parity.md 순서로 읽는다」한 줄로 대체하라. 작업 상태는 §8 큐가 소유하므로 §12 에서 중복해 적지 마라.

### `design/governance/execution-playbook.md:36`

**낡음** — 최종 판정표 3번 「카탈로그 8 component + 4 pattern의 Web 상태」, 6번 「Home, Highlight, Editor 3개 배포 화면」 — 이 표가 「완성」의 정의다

**근거** — `node scripts/build-design-docs.mjs --check` 를 직접 실행해 「91 documents, **21 components, 8 patterns**」을 확인했고 `design/manifest.json` 도 component 21 · pattern 8 이다. 판정표 3번의 증거란이 「manifest + 테스트 결과」라서 manifest 수를 따라야 하는데 8+4 로 고정돼 있다. 6번의 3개 화면도 46 인스코프 라우트 대비 미달이다. 이 표가 「완성」의 정의이므로 실제보다 훨씬 좁은 범위로 완료 선언을 유도한다. 다만 harm 은 표 자체가 「부분 충족은 각 surface의 `partial`로만 표현한다」를 앞세우고 있어 즉시 오작동보다는 조기 완료 선언 쪽이다.

**고침** — 판정표 3번을 「manifest 의 모든 non-`not-planned` component/pattern」처럼 재계수가 필요 없는 표현으로 바꾼다(현재 실측 component 21 · pattern 8, `select` 만 `not-planned`). 6번은 46 라우트 기준으로 갱신한다.

### `design/governance/execution-playbook.md:48`

**낡음** — 세션 시작 환경 게이트가 `node --version` · `pnpm --version` · `git status` 세 줄뿐이고 53행이 「Node 22 이상과 pnpm이 있으면 표준 명령을 그대로 쓴다」로 끝난다

**근거** — 세 줄을 통과해도 `pnpm verify` 는 돌지 않는다. (1) `.github/workflows/ci.yml:30-32` 가 `pnpm install --frozen-lockfile` 을 별도 단계로 두고 devDependencies 14종이 실재한다. (2) 같은 파일 34-39행이 `pnpm exec playwright install --with-deps chromium` 과 함께 「브라우저 바이너리는 lockfile에 없다 … 2026-08-18의 첫 hosted CI 실행이 정확히 그렇게 실패했다("Executable doesn't exist at .../chrome-headless-shell")」를 기록한다. (3) `grep -l KLIPSE_PRODUCT_REPO scripts/*.mjs` = **17개**(검사자가 8개라 한 것은 과소계수다) 이고 기본값이 `process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web"` 로 하드코딩돼 있어 원저자 맥 밖에서는 `verify:product` 첫 게이트에서 exit 1 한다. 53행 결론이 이 셋을 모두 건너뛰게 만든다.

**고침** — 환경 게이트를 SKILL 0- 절(`.claude/skills/klipse-figma-transplant/SKILL.md:14-30`)과 같은 5줄로 교체하고, 「pnpm 있으면 표준 명령 그대로」를 「install · 브라우저 바이너리 · `KLIPSE_PRODUCT_REPO` 가 갖춰져야 표준 명령이 성립한다」로 바꾼다.

### `design/governance/execution-playbook.md:54`

**낡음** — 「pnpm만 없으면 아래 등가 체인으로 검증한다. 루트 package.json의 모든 스크립트는 Node 표준 라이브러리만 사용하는 `node ./scripts/*.mjs` 호출이므로 pnpm은 순서 실행기일 뿐이다」 + 57~61행 등가 체인

**근거** — 세 주장 모두 반증됐다. ① 루트 `package.json` 의 devDependencies 14종이 실재하고(vitest 4.1.10 · playwright 1.62.1 · typescript 5.9.3 · esbuild · axe-core · react/react-dom · @vitest/browser-playwright · vitest-browser-react), `packages/react` 는 `@radix-ui/react-dismissable-layer` 등에 의존한다. 스크립트도 `test`=`vitest run`, `typecheck`=`tsc -p tsconfig.json`, `build-react`=`pnpm --filter @klipse-design/react run build` 로 Node 표준 라이브러리 밖이다. `node_modules/` 도 실재한다. ② `build` 는 tokens→icons→css→react→docs **5단계**인데 등가 체인은 tokens·design-docs·llms-docs **3개**뿐이라 icons·css·tailwind-theme·react·figma-summaries 산출물이 재생성되지 않는다. ③ 등가 체인의 verify 3개에 대해 `verify` 는 `verify:ci` 13 + `verify:product` 13 = **26** 이다(`&&` 로 직접 셈, `scr

**고침** — 54~61행 등가 체인 절을 통째로 삭제한다. pnpm 없이 검증하는 경로는 존재하지 않는다. 대신 `handoff-2026-08-22-account-transfer.md:150-156` 의 계약(`corepack enable` → `pnpm install --frozen-lockfile` → `pnpm exec playwright install --with-deps chromium` → `export KLIPSE_PRODUCT_REPO=~/klipse-web` → `pnpm build && pnpm check && pnpm verify` → `pnpm clean-room`)을 그대로 옮긴다.

### `design/governance/execution-playbook.md:70`

**낡음** — 「P3에서 devDependencies가 생기기 전까지 `pnpm install`은 필요 없다. 의존성이 생긴 뒤에는 DS-P3-002a가 CI와 로컬 절차를 함께 갱신한다.」

**근거** — 전제가 이미 깨졌다. 루트 `package.json` 에 devDependencies 14종이 있고 `node_modules/` 가 실재한다. `.github/workflows/ci.yml:30-32` 에 「P3부터 devDependencies가 생긴다」는 주석과 함께 `pnpm install --frozen-lockfile` 단계가 들어가 있다. DS-P3-002a 는 `execution-handoff.md:237` 에서 `done` 이다. 「필요 없다」를 읽고 install 을 건너뛰면 `pnpm check` 의 typecheck(`tsc`)와 `pnpm test`(`vitest`)가 즉시 죽는다.

**고침** — 이 줄을 삭제하고 「install 은 항상 필요하다 · `--frozen-lockfile` 로 lockfile 을 고정한다」로 대체한다.

### `design/governance/execution-playbook.md:189`

**낡음** — 사용자 차단 해제 목록 3번 「~~제품 저장소 절대 경로~~ — 해소됨 (2026-08-14, `/Users/sejunki/klipse`, branch `louis`)」

**근거** — 직접 확인했다. `cd /Users/sejunki/klipse && git log -1` = `0d188651 (HEAD -> louis, origin/louis, develop) 2026-08-04` — 경로가 실재하므로 다음 세션이 열어도 오류가 나지 않고 18일 낡은 다른 조직의 저장소를 제품으로 읽는다. 정본은 `migration/product-baseline.md:4-8` 의 `KlipseAI/klipse-web` `design` `086f4a62`(2026-08-14)이고, 같은 파일 10-16행이 2026-08-15 에 바로 이 오류를 「저장소도 조직도 다르고 열흘 오래된 것」이라 정정해 두었다. 최신 인계서 `handoff-2026-08-22-account-transfer.md:38` 과 `.claude/skills/klipse-figma-transplant/SKILL.md:16` 은 `klipse-web` + `design` + `export KLIPSE_PRODUCT_REPO` 를 지시한다. 「과거 기록이라 낡아도 정상」 방어는 성립하지 않는다 — 취소선 항목의 목적이 다음 세션이 쓸 값을 남기는 것이고, 취소선은 「다시 확인하지 마라」는 신호다.

**고침** — 189행을 `KlipseAI/klipse-web` `design` 브랜치로 고치고 「해소됨」 대신 「구 저장소 `~/klipse` 는 열지 마라 — 경로가 아직 살아 있어 조용히 틀린다」를 명시한다. `migration/product-baseline.md:10-16` 의 2026-08-15 정정 문단을 링크한다.

### `design/governance/execution-playbook.md:428`

**낡음** — DS-F-000 절이 라이브러리 파일 `bxGEp0km5zluMJGulaTvFW` 를 Foundations / Components / Templates 3개 페이지로 못박고, DS-F-003(502행)·DS-F-005(551행)·DS-F-006(571행)·DS-F-007(589행)이 전부 「지정 파일의 그 페이지들」에 쓰라고 지시한다

**근거** — 부분 반박이 있으니 그대로 지우면 안 된다. DS-F-000 은 머리말이 「(2026-08-14 완료)」인 완료 기록이고 소유권을 `figma-sync.md` 로 넘기는데, 그 문서(18-29행)는 지금도 `bxGEp0km5zluMJGulaTvFW` 를 운영 파일 표에 싣고 「이전 중이다(2026-08-21) … `readback.json`·`snapshot.json` 은 이전 파일을 계속 가리킨다 … 이전이 끝나야 운영 파일을 바꾼다」고 스스로 밝힌다. `figma/readback.json` 을 직접 열어 `"figmaFileKey": "bxGEp0km5zluMJGulaTvFW"`, `"capturedAt": "2026-08-21"` 를 확인했다. 즉 파일 키는 parity 기준선으로 아직 살아 있다. 그럼에도 확정한다 — 낡은 것은 하류의 **지시문**이다. 지금 쓰기 대상 보드는 `OlYKERKOkgbxBEEoXGZW2c` 이고(handoff-2026-08-22:39,121, SKILL:17) 그 보드는 8페이지 · 21섹션 · 95프레임 · 컴포넌트 319개에 페이지가 사용자 여정 순이라 **「Templates 페이지」가 아예 없다**. 플레이북은 이 이전을 단 한 번도 언급하지 않는다.

**고침** — 검사자 fix 를 수정해서 적용한다 — DS-F-000 의 완료 기록 문장은 그대로 두고, ① `figma-sync.md` 운영 파일 표를 먼저 갱신한 뒤 ② DS-F-003·005·006·007 의 「지정 파일의 Foundations/Components/Templates 페이지」를 실제 보드 구조로 바꾸거나, Figma 실행 절차 전체를 `figma-screen-assembly.md` + `klipse-figma-transplant` SKILL 로 위임하고 이 절들을 폐기한다.

### `design/governance/execution-playbook.md:589`

**낡음** — DS-F-007 이 「지정 파일의 Templates 페이지에서 component instance, 변수, style만으로 화면을 재조립한다」로 조립 절차를 끝내고 기준을 「Home, Highlight, Editor 3개 화면」(598행)으로 둔다

**근거** — 목록에서 가장 위험한 항목이다 — DS-F-007 은 완료된 과거가 아니라 **지금 열려 있는 다음 작업**이다(`execution-handoff.md:468` 「남은 Figma 작업은 `DS-F-007` 화면 재조립(Avatar·Banner 선행)과 `DS-F-008` 수동 publish다」). 그런데 이 절차는 (a) 현재 보드에 없는 「Templates 페이지」를 가리키고, (b) 2026-08-21 조립 실패에서 나온 규칙 23조를 전혀 참조하지 않는다. `design/governance/figma-screen-assembly.md` 는 423줄 · `authority: normative` · `## 1~23` 을 직접 세어 확인했고 37행에 「이 규칙을 어겨 묶인 페인트 7,665개의 반투명이 한 번에 사라졌다」가 있다. `grep -c 'figma-screen-assembly\|klipse-figma-transplant'` 를 직접 돌려 playbook 0 · roadmap 0 을 확인했다. 대상 화면도 `migration/product-screens/README.md:3-4` 의 「46개 인스코프 라우트, 22,522줄」(`wc -l 10.*.md` = 22522 확인)이지 3개가 아니다.

**고침** — DS-F-007 절차를 삭제하고 `figma-screen-assembly.md`(조립 규칙)와 `klipse-figma-transplant` SKILL(실행 절차)로 포워딩한다. 3개 화면 기준은 46 라우트 · 등급 체계로 갱신한다.

### `design/governance/handoff-2026-08-19-product-parity.md:155`

**낡음** — 「제품이 움직였다 (2026-08-20) — 다음 세션의 첫 번째 일」 절 전체(L155-185): 「지금 `pnpm verify` 는 빨갛다」 · 「측정 스크립트는 `KLIPSE_PRODUCT_REF ?? "origin/main"` 을 따라간다」 · 「다음 세션이 정할 것 — 1. `6337ad54` 로 재기준선 / 2. 기본 ref 를 lock 의 productCommit 으로. 2를 먼저 하고 1을 하는 것을 권한다」

**근거** — 권고한 2번이 이미 구현됐다. `scripts/lib/product-ref.mjs:27-44` 의 `resolveProductRef()` 는 ①`KLIPSE_PRODUCT_REF` ②lock 의 `productCommit`(40자 SHA) ③fallback `"design"` 순으로 고르며 `origin/main` 경로 자체가 없다. `measure-product-{render,components,variants}.mjs`·`verify-tailwind-interop.mjs`·`build-figma-inventory.mjs` 가 전부 이 함수를 쓴다. `scripts/build-product-evidence.mjs:17` = `process.env.KLIPSE_PRODUCT_REF ?? "design"`. 1번(재기준선)도 `design`@`a3ed8e03` 으로 끝났다 — 실행 확인: `KLIPSE_PRODUCT_REPO=~/klipse-web node ./scripts/verify-product-evidence.mjs` → `OK (근거 파일 83개가 배포본 a3ed8e03와 일치, 변조 canary 2종)` exit 0. 「지금 빨갛다」도 거짓이다. 단, 원 지적의 「이미 존재하지 않는 6337ad54」는 틀렸다 — `git cat-file -t 6337ad54` → `commit`, 커밋은 실재한다. 위험은 「없는 커밋을 찾는

**고침** — 절 전체(L155-185)를 「2026-08-21~22 에 정본을 `design` 브랜치로 옮기고 측정 ref 를 lock 의 productCommit 에 묶어 해소했다 — `scripts/lib/product-ref.mjs`」 한두 줄 기록으로 축약한다. 「다음 세션의 첫 번째 일」이라는 제목을 반드시 걷어낸다.

### `design/governance/handoff-2026-08-19-product-parity.md:262`

**낡음** — 「`figma/inventory-plan.json`(계획)과 `figma/inventory-draw.1~3.js`(실행 코드)를 생성 … 다시 그릴 때는 draw 파일을 use_figma에 그대로 넘긴다 — 1번(RESET) → 2번 → 3번 순서다」

**근거** — `ls figma/` → inventory-draw.1.js(파일명) ~ `inventory-draw.8.js` 로 8개다. `KLIPSE_PRODUCT_REPO=~/klipse-web node ./scripts/build-figma-inventory.mjs --check` → `checked @ a3ed8e03: 종류 26 · 표본 95 · 노드 416 · 폭 선언고정 122 · 폭 부모지정 83 · 그리기 코드 8개` exit 0. 각 파일의 RESET 플래그를 전수 확인: `.1.js`=true, `.2~8.js`=false. 지시대로 1→2→3 만 넘기면 RESET 이 보드를 비운 뒤 8분의 3만 복구된다.

**고침** — 「`inventory-draw.1~8.js` 를 1번(RESET)부터 8번까지 순서대로 전부 넘긴다」로 고치되, 개수를 본문에 박지 말고 `pnpm check-figma-inventory` 출력을 인용하도록 바꾼다 — 표본이 늘면 파일 수가 또 늘어난다.

### `design/governance/handoff-2026-08-19-product-parity.md:415`

**낡음** — 「환경」 절이 배포본을 `origin/main` `7e9c3b69` 로 못박고, L157·L170·L174·L326 도 `origin/main` 을 제품 정본으로 쓴다.

**근거** — 직접 확인. `cd ~/klipse-web && git rev-parse --short origin/main` → `e52dab79` (7e9c3b69 아님, 6337ad54 도 아님). `git rev-parse --short design` → `a3ed8e03`. `migration/product-evidence.lock.json` 은 `productRef:"design"` · `productCommit:"a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4"`, `migration/product.variants.json` 도 같은 SHA. `git show origin/main:apps/web/app/globals.css` 에는 폐지된 `--glass-dropdown-frame` 5겹이 63행부터 살아 있고, `git show design:...` 에는 없고 `:57` 의 `--dropdown-frame` 0.5px 한 겹뿐이다. 낡음 확정.

**고침** — 「환경」 절과 L157·L170·L174·L326 의 `origin/main` 을 `design` 브랜치로 바꾸고 커밋을 `a3ed8e03`(lock 의 productCommit)로 적는다. 「제품은 `git show design:<경로>` 로만 읽는다」를 명시한다. 다만 커밋 SHA 를 본문에 박으면 또 낡으므로, SHA 대신 「lock 의 productCommit 이 정본」이라고 쓰는 편이 낫다.

### `design/governance/handoff-2026-08-19-product-parity.md:421`

**낡음** — 「인계 전 검증: `pnpm build && pnpm check && pnpm verify && pnpm test && git diff --check`」

**근거** — 실측으로 확인. `KLIPSE_PRODUCT_REPO=/nonexistent-path pnpm run verify-gates`(= `verify:product` 의 첫 게이트) → `fatal: cannot change to '/nonexistent-path': No such file or directory` · `ELIFECYCLE Command failed with exit code 1`. 제품 저장소가 없는 컴퓨터에서 이 목록은 첫 줄부터 죽는다. `handoff-2026-08-22-account-transfer.md:80-91` 의 계약은 `export KLIPSE_PRODUCT_REPO=~/klipse-web` → `pnpm build` → `pnpm check` → `pnpm verify` → `pnpm clean-room` 이고 `.claude/skills/klipse-figma-transplant/SKILL.md:30-33` 도 같다. `clean-room`(= `node ./scripts/verify-clean-room.mjs`, 러너 재현)이 08-19 목록에 없다. 다만 원저자 맥에서는 기본값 `/Users/sejunki/klipse-web` 이 실재해 이 목록도 돌긴 했다 — 「어디서나 죽는다」가 아니라 「그 맥에서만 돈다」가 정확하다.

**고침** — 이 줄을 지우고 `handoff-2026-08-22-account-transfer.md` 3절로 링크만 남긴다 — 검증 절차의 정본을 둘로 두지 않는 편이 낫다. 남긴다면 `export KLIPSE_PRODUCT_REPO=<경로>` 를 앞에 넣고 `pnpm clean-room` 을 더한다.

### `design/governance/roadmap.md:75`

**낡음** — 「P3 — Components and Figma library · **상태:** `planned`」

**근거** — 실측으로 반증된다. `design/manifest.json` 에서 component 21개 중 **20개**가 `web: partial`(`select` 만 `not-planned`, `not-ready` 0), pattern 8개 중 3개가 `partial` 이다. `packages/react/src` 에 컴포넌트 디렉터리 **23개**(anchored·app-shell·avatar·badge·banner-carousel·button·checkbox·dialog·empty-state·icon-button·menu·overlay·popover·progress·project-card·segmented-control·selectable-list-row·skeleton·slider·spinner·text-field·toast·tooltip), `apps/storybook/stories` 12개. `execution-handoff.md:236-237` 은 `DS-F-000`~`DS-F-005` · `DS-P3-002a`·`002`(1단계)·`003`·`009a`·`013` 을 `done` 으로 적는다. 인계서 65-66행이 「작업 시작 때마다 manifest와 Roadmap을 다시 확인한다」고 지시하므로 이 `planned` 는 매 세션이 읽는 자리에 있다.

**고침** — 검사자 fix 를 수정해서 적용한다 — P3 상태를 `in-progress` 로 갱신하되, 상태 정본을 `execution-handoff.md` 의 「지금 어디에 있는가」 표로 지정하면 안 된다. 그 표 자체가 2026-08-18 기준이라 「Decision **18종**」·「manifest component **18개**」로 이미 낡았다(실측 22종 · 21개). 정본은 `design/manifest.json` 과 `grep 'Status:' design/governance/decisions/*.md` 같은 기계 산출물로 지정한다.

### `design/governance/roadmap.md:79`

**낡음** — P3 범위 「이후 Input, **Select**, Tooltip, Toast, Empty State와 공용 pattern fixture를 독립적으로 확장」

**근거** — `design/manifest.json` 의 `select` 항목을 직접 읽었다 — `{"id":"select","figma":"not-planned","web":"not-planned","docs":"not-planned"}` 이고 note 가 「**고르기는 Menu가 소유한다**(2026-08-18 판정). 제품 실측에서 네이티브 `<select>` 12벌이 전부 /admin 아래이고 배포 화면(Home·Highlight·Editor)에는 0벌 … 수요가 생기면 Decision으로 이 판정을 뒤집고 다시 연다」이다. 나머지 넷도 이미 구현돼 있다 — `packages/react/src` 에 `text-field` · `tooltip` · `toast` · `empty-state` 디렉터리가 있고 manifest 에서 `partial` 이다. 로드맵만 보고 다음 일을 고르면 폐기 판정된 컴포넌트를 만들게 된다.

**고침** — Select 를 목록에서 빼고 「고르기는 Menu 가 소유한다 — 재개하려면 Decision 이 필요하다(2026-08-18 판정)」를 각주로 남긴다. Input·Tooltip·Toast·Empty State 는 이미 `partial` 임을 반영한다.


## dead-path

### `design/governance/execution-handoff.md:253`

**낡음** — 「정확한 상태는 이렇다」 표: 「규범 문서만 있고 구현 없음 | `editor-workspace` · `app-shell` | 2」 · 「규범·구현 있고 Figma만 없음 | Skeleton | 1」. 259행이 「바로 다음에 할 일은 아래 「미등록 부품」 목록의 재계수와 그 다음 순서다」로 지시한다.

**근거** — (a) 죽은 포인터를 확인했다 — `grep -n 미등록 design/governance/execution-handoff.md` 는 255행(「아래 미등록 목록 참조」) · 259행(이 지시문) · 850행(overlay 테스트의 「보류 member 미등록」, 무관)만 낸다. 「미등록 부품」이라는 목록은 문서에 없다. 「바로 다음에 할 일」이 존재하지 않는 절을 가리킨다. (b) manifest 실측: `app-shell` 패턴 web `partial`(`packages/css/src/component/app-shell.css` 에 `.louis-app-shell__rail` · drawer · scroll root · `env(safe-area-inset-bottom)` 이 실재하고 `packages/react/src/index.ts:36` 이 `AppShell` 을 export 한다), `skeleton` 컴포넌트 figma `partial` 이며 `Skeleton` 은 snapshot component 목록에 있다. 다만 `editor-workspace` 는 지금도 web `not-ready` 라 그 반쪽은 여전히 맞다 — 「세 행이 전부 낡았다」는 조사자의 요약이 조금 넘쳤다.

**고침** — 255·259행의 「미등록 목록」 포인터를 지우고, 표는 manifest 에서 생성하거나 삭제하라. 남긴다면 `app-shell`·Skeleton 행만 manifest 값으로 고치고 `editor-workspace` 는 그대로 둔다.

### `design/governance/handoff-2026-08-19-product-parity.md:195`

**낡음** — 「(A2) 반증 — 일시정지, 결과 98건 캐시됨 … 처음부터 다시 돌리지 않는다」면서 `Workflow({ scriptPath: "~/.claude/projects/-Users-sejunki-klipse-design-system/<세션>/workflows/scripts/a2-refute-quoted-wf_af8ccc6c-5d1.js", resumeFromRunId: "wf_af8ccc6c-5d1" })` 를 지시한다.

**근거** — `find ~/.claude -name "a2-refute*"` → 세 파일 전부 `~/.claude/projects/-Users-sejunki-klipse-design-system/ade517a7-7c85-4b1b-905c-5d910fdf1390/workflows/scripts/` 아래에만 있다. `git ls-files | grep a2-refute` → 0건이라 저장소에 없고 `git clone` 으로 따라오지 않는다. `handoff-2026-08-22-account-transfer.md` 1절 「저장소를 따라오지 않는 것 넷」이 정확히 이 부류를 다룬다. 다른 계정·컴퓨터에서 `resumeFromRunId` 는 성립하지 않는다.

**고침** — 「이 재개 경로는 원저자 맥에서만 성립한다. 다른 계정·컴퓨터에서는 저널도 98건 캐시도 없으므로 `migration/unverified-value-map.json` 의 285축(`decision==="product-has" || route==="제품-주장" || route==="DS-내부만"`)에서 갈래를 새로 만들어 처음부터 돌린다」를 명시한다. 스크립트 경로는 지우거나 「원저자 맥 전용, 재현 불가」 표기를 단다.

### `design/governance/handoff-2026-08-19-product-parity.md:224`

**낡음** — 「뼈대는 이미 서 있다. 페이지 `Product inventory`, 루트 노드 `254:2`, `x=1445 y=0` … 종류별 빈 섹션 7개가 `placeholder = true` 로 있다」 + 섹션 노드 id 14개(`254:6`~`254:26`)

**근거** — `figma/inventory-plan.json` 을 파싱해 확인: top keys 는 `$comment/$whyThisExists/$rules/productRef/productCommit/sections`, `sections` 는 **26개**, 문자열 `placeholder` 는 파일 전체에 0회, `254:` 도 0회. `productRef`·`productCommit` 은 `a3ed8e03…`. `--check` 출력도 `종류 26 · 표본 95`. `migration/consolidation-choices.json` 의 `figmaComponent` 는 `{"name":"Product/Dialog","nodeId":"302:375","page":"Product inventory"}` · `{"name":"Product/IconButton","nodeId":"302:377",...}` 로 `254:*` 계열과 어긋난다. 생성된 draw 코드는 노드 id 가 아니라 페이지 이름 + `"sec:"+sec.k` 로 찾는다(inventory-draw.1.js:6,96(스크립트 파일명)). 문서의 좌표는 어느 것도 재현되지 않는다.

**고침** — L222-231 의 노드 id 목록과 「빈 섹션 7개 · placeholder=true」를 통째로 지운다. 좌표는 문서가 아니라 생성물(`inventory-plan.json`)이 소유하게 하고 문서에는 대상 페이지 이름만 남긴다. `consolidation-choices.json` 의 `page:"Product inventory"` 도 새 보드 기준으로 다시 정해야 함을 같이 적는다.

### `design/governance/handoff-2026-08-19-product-parity.md:325`

**낡음** — 「충돌-기록됨 7건」의 제품 근거 좌표 — `overlayDeleteBtn`(`apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:1806-1832`, `klipse-web` `origin/main`), `projectImportBackBtn`(같은 파일 `:2844-2853`), `alignButton`:284, `assetRailBtnActive`:425.

**근거** — `git show design:.../VideoEditModal.tsx | wc -l` → 14,170줄이고 `grep -n overlayDeleteBtn` → 0건(제품이 `videoEditParts/` 로 쪼갰다). 실제 위치는 `apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/vemClass.ts` — `alignButton:4` · `assetRailBtnActive:143` · `overlayDeleteBtn:1519` · `projectImportBackBtn:2556`. `vemClass.ts:1519-1546` 을 열어 값도 확인했다: `[background:transparent]` · `[color:rgb(var(--gray-400-rgb)_/_92%)]` · `[&:hover]:[background:rgb(var(--accent-red-600-rgb)_/_88%)]` · `[&:hover]:[color:rgb(var(--palette-gray-000-rgb)_/_95%)]` — 문서가 적은 값 그대로다. **값은 맞고 좌표만 죽었다.** `backButton`(`highlightSceneStyles.ts:9`)은 지금도 맞다.

**고침** — 네 좌표를 `videoEditParts/vemClass.ts` 의 현재 줄(`alignButton:4` · `assetRailBtnActive:143` · `overlayDeleteBtn:1519` · `projectImportBackBtn:2556`)로 갱신하고 「`klipse-web` `origin/main`」을 `design` 으로 바꾼다. 이 절은 (A3) 에서 브라우저 탐침을 붙일 주소로 쓰이므로, 죽은 좌표를 따라가면 「제품에 없다」로 잘못 기각된다. 값은 손대지 않는다.

### `design/governance/handoff-2026-08-19-product-parity.md:393`

**낡음** — 「(C) 이미 끝난 감사에서 나온 확인된 어긋남 … 출력은 세션 tasks 디렉터리의 `wg8ze6ct7.output` 이다 … 나머지 여섯 종류의 결과는 아직 읽지 않았다.」

**근거** — `find ~/.claude -name "wg8ze6ct7*"` → 0건. 해당 세션 디렉터리 `~/.claude/projects/-Users-sejunki-klipse-design-system/ade517a7-7c85-4b1b-905c-5d910fdf1390/tool-results/` 에 남은 파일은 `bbfnkdwck.txt` · `bn4wcagzs.txt` 둘뿐이다. `git ls-files | grep wg8ze6ct7` 도 0건. 101 에이전트 감사 결과 중 저장소에 남은 것은 본문에 요약된 토스트 3건뿐이고 나머지 여섯 종류는 되찾을 경로가 없다.

**고침** — 「출력은 소실됐다. 남은 것은 아래 요약 3건뿐이며 나머지 여섯 종류는 다시 감사해야 한다」로 고친다. 지금처럼 두면 다음 세션이 존재하지 않는 출력을 근거로 「이미 확인됨」 처리하거나, 없는 파일을 찾느라 시간을 버린다.

### `design/governance/handoff-2026-08-19-product-parity.md:418`

**낡음** — 「Figma draft: `bxGEp0km5zluMJGulaTvFW`. 페이지 6개 — Cover · Foundations · Components · Patterns · Templates · Product inventory」 + 본문 L121·L222·L224·L258·L380 이 그 파일의 `Product inventory` 페이지에 그리라고 지시.

**근거** — 두 갈래로 낡았다. (1) 페이지 목록이 틀렸다 — 그 파일에서 2026-08-21 에 되읽은 `figma/readback.json` 의 `pages` 는 `["Foundations","Components","Templates"]` 3개이고, 정본 `design/governance/figma-sync.md:18` 도 「Foundations / Components / Templates 3개 페이지」라고 적는다. Cover·Patterns·Product inventory 는 어느 쪽에도 없다. (2) 계정이 넘어가면 그 파일을 못 연다 — `handoff-2026-08-22-account-transfer.md:39` 과 `.claude/skills/klipse-figma-transplant/SKILL.md:19` 이 새 계정이 받는 파일로 `OlYKERKOkgbxBEEoXGZW2c` 하나만 적고, `figma-screen-assembly.md:250-258` 기준 그 보드의 페이지는 `00 · START HERE` ~ `99 · 보류` 8개라 `Product inventory` 가 없다. 생성된 `figma/inventory-draw.1.js:6` 은 `figma.root.children.find(p=>p.name==="Product inventory")` 로 페이지를 찾으므로 새 보드에서는 undefined 로 죽는다. **다만 원 지

**고침** — 「환경」의 Figma 항목을 「라이브러리 정본은 `OlYKERKOkgbxBEEoXGZW2c`(8페이지). parity 게이트의 `readback/snapshot` 은 이전이 끝날 때까지 `bxGEp0km5zluMJGulaTvFW` 를 가리킨다 — `figma-sync.md` 「운영 파일」 절이 소유한다」로 고친다. 「페이지 6개」 목록은 readback 과 어긋나므로 지운다. 인벤토리 대상 페이지를 새 보드 어디에 둘지(`90 · ASSETS` 인지 신설인지) 정하기 전에는 「이 절의 Figma 좌표는 이전 파일 기준이라 그대로 쓸 수 없다」를 명시한다.


## wrong-number

### `design/governance/execution-handoff.md:214`

**낡음** — 「205축을 실측했고 격차 143건을 전부 판정했다 — 채택 45, 의도적 편차 46, 제품에 공용 정본이 없어 대조 대상이 아닌 것 52.」 223행 「제품에 공용 정본이 있는 컴포넌트는 셋뿐이다 — Button · Tooltip · Menu.」

**근거** — `node scripts/verify-product-parity.mjs` → `[product-parity] OK (채택 49건 중 기계 대조 12건, 의도적 편차 77건, 제품 정본 없음 61건, 변조 canary 7종)` — 합 187, 문서의 143·45·46·52 와 전부 다르다. `migration/product.measured.json` 을 파싱해 컴포넌트별로 세니 12종이 실려 있고 `adopted` 축을 가진 것은 button(20) · menu-popover(10) · tooltip(12) · segmented-control(4) · checkbox(1) · selectable-list-row(1) · avatar(1) **7종**이다(합 49). 「셋뿐이다」는 사실이 아니다.

**고침** — 수치와 「셋뿐이다」를 지우고 「최신 판정은 `node scripts/verify-product-parity.mjs` 출력과 `migration/product.measured.json` 이 낸다」로 바꿔라. 「셋뿐」은 제품 정본이 있는데도 DS가 임의로 값을 정하게 만드는 지시로 읽힌다.

### `design/governance/execution-handoff.md:239`

**낡음** — 「지금 어디에 있는가」 표: Decision 18종(`DS-D-0001`~`DS-D-0018`) · manifest component 18개(17 partial, select not-planned) · Figma component 19개 · 아이콘 29개 · 변수 210개 · style 22개 · 브라우저 632건.

**근거** — 전부 실측으로 반증됐다. `ls design/governance/decisions/DS-D-*.md | wc -l` → **22**(0019 layout-change · 0020 tailwind-load-order · 0021 icon-size-axis · 0022 determinate-progress 추가). `design/manifest.json` components → **21**. `figma/snapshot.json` → component **26** · icon **31** · 변수 **345** · style **23**(text 15 + effect 8). `npx vitest list` → 브라우저 **756**건(378 × 두 motion context). 조사자 말대로 같은 표의 canary 수만 맞다 — `verify-token-gates` → `42 canaries`, `verify-css-gates` → `canary 12종`, `verify-figma-parity` → `변조 canary 34종` 을 실행해 확인했다.

**고침** — 표를 삭제하거나 manifest·snapshot·게이트 출력에서 생성하도록 바꿔라. 손으로 적은 수는 이 문서에서 이미 여러 번 낡았고, 낡은 수는 「무엇이 남았는가」의 판단을 직접 틀리게 한다.

### `design/governance/execution-handoff.md:587`

**낡음** — 「`packages/react/api-surface.json`이 심볼 56 · 타입 89를 고정해 사라짐은 breaking, 새로 생김은 additive로 각각 잡는다.」

**근거** — `packages/react/api-surface.json` 을 파싱했다 — `values` **66**개, `types` **104**개다. 이 수는 컴포넌트가 하나 늘 때마다 낡고 실제로 낡았다. 게이트 자체는 정상 작동하므로 위험은 낮지만 문서가 파일과 어긋나 있다.

**고침** — 수치를 지우고 파일을 가리키기만 하라 — 「고정 대상은 `packages/react/api-surface.json` 이다」.

### `design/governance/execution-handoff.md:1038`

**낡음** — DS-P3-013: 「글리프 26개가 React·Figma 양쪽에 서 있으며」 · 「정본 `packages/react/src/icons/svg/*.svg` 26개 … Figma component 26개」 · 1043행 「게이트는 positive 6 + 변조 canary 20종이다」.

**근거** — `ls packages/react/src/icons/svg/*.svg | wc -l` → **31**. `figma/snapshot.json` 의 icons → **31**. `node scripts/verify-icon-gates.mjs` → `Icon gates OK (positive 6, 변조 canary 22종)`. 문서 자신이 같은 절에서 「`figma/snapshot.json`의 icon 수가 그 증거다」라 적어 두었는데 그 증거가 26 이 아니라 31 을 낸다. (같은 문서 445행 부근이 「글리프 26 → 29개」로 올려 적은 대목도 이미 그 값을 지나쳤다.)

**고침** — 26 → 31, canary 20 → 22 로 고치거나 「수는 `verify-icon-gates` 출력과 snapshot 이 낸다」로 바꿔라.

### `design/governance/execution-playbook.md:194`

**낡음** — 「현재 DS-D-0002~0007, 0009, 0010이 owner 확인 대기다」

**근거** — `ls design/governance/decisions/*.md` = 23개(README 포함)로 `DS-D-0001` ~ **`DS-D-0022`** 가 있다. 본문 `Status:` 를 세면 `accepted` 1건 · `proposed` **21건**(나머지 1행은 README 의 `Status: proposed | accepted | superseded | rejected` 템플릿). 손으로 유지되는 8건 목록이 13건을 누락하고 있다.

**고침** — ID 목록을 지우고 「대기 목록의 정본은 `grep -l 'Status: proposed' design/governance/decisions/*.md`」로 바꾼다. 손으로 유지되는 ID 목록은 반드시 낡는다.

### `design/governance/execution-playbook.md:452`

**낡음** — DS-F-001 이 「토큰 200개(고유 ID 174)」를 전제로 collection 을 가르고 `Klipse Primitive` 약 92개(COLOR 38, FLOAT 52, STRING 2) · `Klipse Semantic` 약 23개 · `Klipse Semantic Color` 26개라 적는다. DS-F-003 4항(511행)도 「토큰 200개 각각이 … 정확히 하나로 매핑」을 완료 조건으로 쓴다

**근거** — 직접 셌다. `packages/tokens/generated/manifest.json` 의 `tokens` 배열 = **504**. `packages/tokens/generated/figma.tokens.json` 의 collection 별 변수 = `Klipse Primitive` **242**(mode: Base) · `Klipse Semantic` **96**(Global) · `Klipse Semantic Color` **83**(Light/Dark) = **421**. 200/174 · 92(38/52/2) · 23 · 26 은 어느 것과도 맞지 않는다. 「완료된 절차의 과거 기록」 방어는 약하다 — DS-F-000 과 달리 DS-F-001·DS-F-003 절 머리말에 완료 표시가 없어 살아 있는 지시로 읽히고, 511행이 그 200이라는 수를 **완료 조건**으로 재사용한다.

**고침** — 수를 지우고 「수의 정본은 `packages/tokens/generated/figma.tokens.json` 이며 분류 완전성은 `verify-figma-parity` 가 기계로 판정한다」로 넘긴다. 문서가 수를 중복 보유할 이유가 없다.

### `design/governance/handoff-2026-08-19-product-parity.md:41`

**낡음** — 「기본·hover·의사요소 2,089건 전부 분류」(L41, 「지금 서 있는 장치」 표) 와 「선언 열거(2,089건 전부 분류, 탐침 47종)」(L354).

**근거** — `KLIPSE_PRODUCT_REPO=~/klipse-web node ./scripts/measure-product-components.mjs --check` → `탐침 68종 @ a3ed8e03 · DS bf62eba · 브라우저가 잰 제품 값과 DS를 210축 대조 (일치 181 · 기록된 편차 29) · 컴포넌트 23/23 대조 · 제품 선언 2093건이 빠짐없이 분류됨 · DS 기록 359건이 아직 제품 미대조` exit 0. 210·181·29·359 는 지금도 맞고 **2,089→2093 · 탐침 47종→68종** 만 낡았다. L41 은 「지금 서 있는 장치」, L354 는 「지금 상태」 열이 붙은 현재형 표라 과거 기록이 아니다. L118(「전부 그대로다」 근거 절)·L428(「오늘 커밋 29개」)의 2,089 는 그날의 기록이라 고칠 대상이 아니다 — 원 지적이 그 둘을 제외한 것은 옳다.

**고침** — L41 과 L354 의 수만 2093 · 68종으로 고친다. 더 나은 방법은 수를 본문에서 빼고 `pnpm measure-product-components --check` 출력 인용으로 대체하는 것이다 — 제품이 움직일 때마다 조용히 낡는 수다.

### `design/governance/handoff-2026-08-19-product-parity.md:46`

**낡음** — 「`pnpm verify` 는 14단계다. 현재 전부 초록, 테스트 774.」

**근거** — `package.json` 실측: `verify` = `verify:ci && verify:product`, `verify:ci` 는 13개(`verify-gate-split`·`verify-gates:ci`·`verify-token-gates`·`verify-css-gates`·`verify-icon-gates`·`check-token-diff`·`check-figma-snapshot`·`verify-figma-parity`·`verify-figma-variables`·`verify-figma-styles`·`verify-consumer`·`verify-test-harness`·`verify-product-parity`), `verify:product` 도 13개. 합 26. `scripts/verify-gate-split.mjs` 가 배분을 강제한다. 테스트는 맞다 — `pnpm test` 실행 결과 `Test Files 80 passed (80) · Tests 774 passed (774)`.

**고침** — 「27단계(= `verify:ci` 13 + `verify:product` 14). hosted CI 는 `verify:ci` 13개만 돈다」로 고친다. 「전부 초록」은 제품 저장소·`KLIPSE_PRODUCT_REPO` 유무에 따라 뜻이 달라지므로 조건을 붙인다. 774 는 그대로 둔다.


## confusing

### `design/governance/execution-handoff.md:196`

**낡음** — §7 「P3 catalog coverage: manifest의 Input, Select, Tooltip, Toast, Empty State와 Loading까지 …」가 Select 를 카탈로그 완료의 필수 항목으로 싣는다. 985행 DS-P3-009 표도 「| — | Select | `pending`. gap registry 상위 15에 들지 않았다 |」.

**근거** — manifest 의 `select` 는 figma·web·docs 가 전부 **`not-planned`** 이고 note 에 「**고르기는 Menu가 소유한다**(2026-08-18 판정) … 수요가 생기면 Decision으로 이 판정을 뒤집고 다시 연다」가 적혀 있다. 같은 문서 (1d)(330행 부근)가 그 판정을 「판정이 끝났다(2026-08-18)」로 기록하고도 196행과 985행은 고치지 않았다. 596행의 「남은 것은 Input·Select·Empty State」도 같은 낡음을 반복한다.

**고침** — 196행에서 Select 를 빼고 985행 표의 `pending` 을 `not-planned`(+ (1d) 링크)로 고쳐라. 596행도 같이 본다. 지금 상태로는 명시적으로 범위 밖이라고 판정한 컴포넌트를 다음 사람이 만들 수 있다.

### `design/governance/execution-handoff.md:628`

**낡음** — DS-GOV-000 이 「넷 중 둘이 done」이며 「~~clean-checkout hosted CI~~ — done (2026-08-18). 초록 실행: runs/32094705359 … build → check → verify → `--require-tracked` → 실브라우저 632건이 전부 통과했다」. 235행 요약표도 「원격·hosted CI done」.

**근거** — `.github/workflows/ci.yml` 을 직접 열었다. 게이트 단계는 `run: pnpm verify:ci` 이고 바로 위 주석이 「**`verify` 가 아니라 `verify:ci` 다.** 게이트 26개 중 13개는 제품 저장소(`klipse-web`)를 읽는다 … **이 CI 가 초록인 것은 게이트 13개가 통과했다는 뜻이다.** 26개가 아니다」로 못 박고, 「2026-08-18T04:12~08-22T06:55 에 46회 연속 빨갰다」까지 적는다. handoff-2026-08-22 §3 는 지금 GitHub 결제 문제로 러너가 멈춰 있다고 기록한다. 즉 「hosted CI done」과 「verify … 전부 통과」는 둘 다 현재 상태를 잘못 요약한다. 실브라우저 수 632 도 지금 756 이다.

**고침** — 「hosted CI done」을 「hosted CI 는 `verify:ci` 13게이트 + `pnpm test` 만 돈다 · 나머지 13개(`verify:product`)는 로컬 전용 · 2026-08-22 기준 결제로 정지」로 고쳐라. 235행 요약표의 「원격·hosted CI done」도 같이 손본다.

### `design/governance/execution-playbook.md:190`

**낡음** — 사용자 차단 해제 목록 4번 「원격 Git/hosted CI/npm 배포 권한 — DS-GOV-000, DS-P3-012 시점에 필요. 미해소.」 + 세션 보고에서 반복 요청하라는 지시

**근거** — 원격과 hosted CI 는 해소됐다. `git remote -v` = `git@github.com:KlipseAI/louis.git`, `git rev-list --count HEAD` = 204. `gh run view 32561034169 --repo KlipseAI/louis --json headSha,conclusion` = `{"conclusion":"success","headSha":"bc6a8b47de1dfd19396147183cb5b5637fc8526c"}`, 5m34s, 2026-08-22T07:58Z — 검사자가 든 근거가 맞다. `execution-handoff.md:235` 도 「`DS-GOV-000`이 `partial` — **원격·hosted CI done**, owner 승인과 publish 권한 남음」이다. 다만 검사자가 놓친 것이 있다: `gh run list` 최신 3회(32562547740 · 32563995919 · 32564245670)는 4~5초 만에 `failure` 인데 게이트 실패가 아니라 GitHub 결제 거부다(handoff-2026-08-22 3절이 annotation 원문과 `gh api .../jobs -q '.total_count'` 구별법을 기록). 이 구별이 없으면 다음 세션이 빨간 CI 를 게이트 실패로 오진해 코드를 고치려 든다.

**고침** — 4번을 「npm 배포 권한과 owner 승인만 미해소」로 좁힌다. 그리고 「hosted CI 가 빨갛다면 먼저 결제를 의심하라 — 판별법은 `handoff-2026-08-22-account-transfer.md` 3절」을 별도 항목으로 넣는다.

### `design/governance/execution-playbook.md:303`

**낡음** — DS-P3-002a 2항이 「`tokenPackage.packageRelease`의 `const: "not-ready"` 고정도 이때 … 완화한다」, DS-F-002 6항(492행)이 「`tokenPackage.figmaLibrary`가 `const: "not-ready"`로 고정되어 있어 이후 상태 승격이 불가능하다」고 현재형으로 적는다

**근거** — `design/manifest.schema.json` 을 직접 열었다. 359-370행에서 `figmaLibrary` 와 `packageRelease` 는 둘 다 `{"$ref": "#/$defs/implementationStatus"}` 이고 `figmaLibraryEvidence`·`packageReleaseEvidence`(`nonEmptyString`)가 붙어 있다. 537-541행의 package 쪽도 동일하다. 두 필드 어디에도 `const: "not-ready"` 는 남아 있지 않다. DS-P3-002a·DS-F-002 도 인계서에서 `done` 이다. 다만 harm 은 낮다 — 플레이북 머리말 8-10행이 「상태의 정본은 인계서가 소유하며 두 문서가 충돌하면 인계서가 우선한다」고 이미 밝혀 두었기 때문이다. 그래도 현재형 서술이 남아 있어 이미 한 일을 다시 하게 만든다.

**고침** — DS-P3-002a·DS-F-002 절을 「done — 결과는 `design/manifest.schema.json` 이 소유한다」 한 줄로 접거나, 「현재 이렇게 고정되어 있다」류 현재형 서술을 과거형 기록으로 바꾼다.

### `design/governance/handoff-2026-08-19-product-parity.md:1`

**낡음** — 프론트매터가 `status: beta` / `authority: reference` 뿐이고 낡음 표시가 없다. 08-22 인계서 L11·L138·L157 과 `execution-handoff.md:13` 이 이 문서를 「본류」로 지목하고 `design/manifest.json` 에도 무표시로 실려 있다.

**근거** — 프론트매터 4줄을 직접 확인 — `id/status/authority` 뿐이고 배너가 없다. 교차 참조도 확인: `handoff-2026-08-22-account-transfer.md:11` 「본류 작업은 [제품 실측 대조 인계서]가 소유한다」, 같은 파일 L138 표의 「**본류**」, L157 「그다음 읽는 순서 … [08-19 인계서]」, `design/governance/execution-handoff.md:13-15` 「이어받는 사람은 [제품 실측 대조 인계서]를 먼저 읽는다. 아래 큐보다 그것이 앞선다」, `design/manifest.json:592-599` 는 `authority: reference · maturity: beta` 만 싣는다. 위에서 확인한 13건 중 최소 4건(L155-185 절 · L262 draw 파일 · L418 Figma 좌표 · L415 origin/main)은 그대로 따르면 틀린 결과물이 나온다.

**고침** — 문서를 폐기하지 않는다 — (A1)~(A5) 절차와 (A2')·(A2") 함정 분석은 다른 어디에도 없는 자산이다. 다만 **여기 「지금도 맞다」고 적었던 359·210·181·29·774 는 전부 움직이는 수이고, 최소한 빚과 대조 축·일치는 그 뒤로 실제로 움직였다**(빚은 0이 됐고, 축과 일치는 08-19 인계서 (A) 첫 배치가 올렸다). 수를 다시 적지 말고 정본을 가리킨다: 빚은 `figma/unverified-values.json` 의 `$count`, 대조 축·일치·편차는 `pnpm verify-product-components` 출력, 테스트 건수는 `pnpm test` 출력이다. 게이트 수도 같다 — `package.json` 의 `verify:ci`·`verify:product` 가 소유한다. 최상단에 「2026-08-22 검증: 제품 정본이 `design`@lock-productCommit 으로 바뀌었고 Figma 보드가 이전 중이다. 아래 『제품이 움직였다』 절 · 인벤토리 Figma 좌표 · (A2) 재개 경로 · 「인계 전 검증」 줄은 무효다」 배너를 붙이되 **배너에도 수는 넣지 않는다.**

### `design/governance/handoff-2026-08-19-product-parity.md:217`

**낡음** — 표본 개수가 문서 안에서 세 번 서로 다르게 나온다. L217 「표본 8종 20노드 → 54종 224노드」, L258 「Figma Product inventory 페이지에 17종 54표본이 전부 그려져 있다」, L380 「Figma Product inventory 페이지는 지금 표본 8종(모달 2 · 토스트 2 · 배지 4)만 그린다」.

**근거** — L258 과 L380 은 같은 페이지의 같은 시점 상태를 현재형으로 말하면서 정면으로 모순된다(「17종 54표본이 전부 그려져 있다」 vs 「지금 8종만 그린다」) — 어느 쪽을 믿어도 틀린다. 현재 계획은 `build-figma-inventory.mjs --check` → `종류 26 · 표본 95 · 노드 416` 이고 `inventory-plan.json` 의 `sections` 도 26개라 L217 의 「54종 224노드」도 낡았다. 다만 원 지적의 「세 수 전부 틀렸다」는 단위를 섞었다 — `--check` 는 **계획**의 수이고 L258·L380 은 **Figma 에 실제로 그려진** 수라 직접 비교 대상이 아니다. 그래도 「종/표본」을 서로 다른 뜻으로 쓰는 세 자리가 한 문서 안에 있는 것은 그 자체로 결함이다.

**고침** — 세 자리 모두에서 수를 빼고 「계획의 현재 수는 `pnpm check-figma-inventory` 출력이 정본이고, Figma 에 실제로 그려진 것은 새 보드 이전이 끝나기 전까지 미정이다」로 통일한다. 최소한 L258 과 L380 중 하나는 지워 자기모순을 없앤다.

### `design/governance/roadmap.md:84`

**낡음** — 「Figma 작업은 … **Figma 트랙(DS-F-000~008)**이 소유한다: 운영 전제와 구조 Decision → multi-collection proposal → variables/styles 구축 → snapshot parity gate → component library → 배포 화면 재조립 검증 → 수동 publish 운영」

**근거** — DS-F-000~005 는 `done`(`execution-handoff.md:236`)이고 DS-F-006 도 2026-08-18 에 닫혔다(`:443` 「넷이 전부 섰다(2026-08-18). `DS-F-006`이 닫혔다」). 살아 있는 것은 DS-F-007 화면 재조립이며 그 정본은 `design/governance/figma-screen-assembly.md`(423줄, `authority: normative`, 조립 규칙 23조)와 `.claude/skills/klipse-figma-transplant/SKILL.md` 다. 두 파일 모두 로드맵·플레이북에서 `grep -c` = 0 을 직접 확인했다. 다만 89-91행이 세부를 인계서·플레이북에 위임하고 있어 이 문단 자체가 직접 틀린 일을 시키지는 않는다 — 12번(P3 `planned`)과 같은 줄기의 파생 결함이다.

**고침** — P3 Figma 문단을 「DS-F-000~006 done · 현재는 보드 `OlYKERKOkgbxBEEoXGZW2c` 이식/조립 트랙 — 조립 규칙은 `figma-screen-assembly.md`, 실행 절차는 `klipse-figma-transplant` SKILL」로 다시 쓴다.

