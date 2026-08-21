# Klipse Design System — 구현 관측 자료 (as-built)

> **문서 성격: Observed / as-built.** 이 문서는 현재 모노레포 코드(`apps/web`)를 역공학한
> 구현 관측 자료이며, 결함과 미결정 사항도 그대로 포함한다. 신규 작업의 운영 정본, 문서 권위,
> 성숙도와 변경 절차는 [`design/README.md`](../design/README.md)에서 시작한다.

실제 렌더 값과 화면별 예외를 확인할 때 이 문서를 사용한다. 규범 문서와 현재 구현이 어긋나면 이
관측값을 조용히 복제하지 말고 디자인 시스템 부채로 기록한다.

## 1) 적용 범위

**적용 대상** — `apps/web` 의 랜딩·마케팅, 인증, 제품 앱(노드 캔버스 · 비디오 에디터 · 하이라이트 ·
아카이브 · 애널리틱스 · 계정/결제).

**범위 밖 (2026-08 결정)**

| 대상 | 이유 |
| --- | --- |
| `app/(highlight-standalone)/` 전체 — `/hl` · `/hl/[projectId]` · `/hl/youtube-result` · `/hl-landing` · `/hl-login` · `/hl-signup` · `/hl-signup/check-email` | 삭제 예정 화면. 자체 셸이 `html[data-theme="light"]` 를 강제 고정하고 `#FFDD00` 계열의 **별도 브랜드**(코드 33회, 토큰 없음)를 쓰며 브레이크포인트도 900/768/640 으로 다르다. 이 시스템에 맞추지 않는다. |

범위 밖 화면의 값은 이 문서와 `design/llms/*` 에 싣지 않는다. 그 화면을 만질 일이 생기면
**해당 파일의 기존 값을 그대로 따르고**, 이 시스템의 토큰을 새로 끌어들이지 않는다.
`(highlight-standalone)` 과 이름이 비슷한 `/highlight` 제품 화면은 **범위 안**이다 — 혼동 주의.

## 1.5) 문서화 수준 (라우트별)

**이 문서가 어디까지 답할 수 있는지를 먼저 밝힌다.** 아래 표에서 수준이 3이 아닌 화면은
이 문서만 보고 만들면 배포 환경과 다른 결과가 나온다. 그건 지시의 문제가 아니라 문서의 공백이다.

표는 `app/**/page.tsx` 에서 라우트를 읽어 **생성**된다. 라우트를 추가하면 자동으로 나타나고,
수준을 적지 않으면 `미분류` 로 뜬다 — 빈 곳이 조용히 숨지 않는다.

<!-- GENERATED:route-coverage START -->
_라우트 53개 — 전체 30 · 셸까지 16 · 토큰만 0 · 범위 밖 7 · 미분류 0_

| 수준 | 뜻 |
| --- | --- |
| 0 | 범위 밖 |
| 1 | 토큰만 — 색·타이포·간격은 맞출 수 있으나 화면 구조는 문서에 없다 |
| 2 | 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 |
| 3 | 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 |

**수준 1·2 는 『문서에 없다』는 뜻이다.** 그 화면을 만들 때 문서만 보고 만들면
배포 환경과 다른 결과가 나온다 — 코드를 보거나 사양을 먼저 물어야 한다.

| 라우트 | 수준 | 근거 절 |
| --- | --- | --- |
| `/` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.2 (재구현 검증 3~9차 XXOXOOX, 연속 통과 아님) |
| `/(highlight-standalone)/hl` | 0 — 범위 밖 | §1 적용 범위 — 삭제 예정, 자체 브랜드·브레이크포인트 |
| `/(highlight-standalone)/hl-landing` | 0 — 범위 밖 | §1 적용 범위 — 삭제 예정, 자체 브랜드·브레이크포인트 |
| `/(highlight-standalone)/hl-login` | 0 — 범위 밖 | §1 적용 범위 — 삭제 예정, 자체 브랜드·브레이크포인트 |
| `/(highlight-standalone)/hl-signup` | 0 — 범위 밖 | §1 적용 범위 — 삭제 예정, 자체 브랜드·브레이크포인트 |
| `/(highlight-standalone)/hl-signup/check-email` | 0 — 범위 밖 | §1 적용 범위 — 삭제 예정, 자체 브랜드·브레이크포인트 |
| `/(highlight-standalone)/hl/[projectId]` | 0 — 범위 밖 | §1 적용 범위 — 삭제 예정, 자체 브랜드·브레이크포인트 |
| `/(highlight-standalone)/hl/youtube-result` | 0 — 범위 밖 | §1 적용 범위 — 삭제 예정, 자체 브랜드·브레이크포인트 |
| `/admin` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.12 (재구현 검증 3~9차 XXOXXOO, 연속 통과) |
| `/analytics/instagram` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.12 (재구현 검증 3~9차 XXOXXOO, 연속 통과) |
| `/analytics/youtube` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.12 (재구현 검증 3~9차 XXOXXOO, 연속 통과) |
| `/archive` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.1 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/aws/signup` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.6 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/blog` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.4 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/blog/[slug]` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.4 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/data-deletion-status` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.5 (재구현 검증 3~9차 XXXOOXO, 연속 통과 아님) |
| `/docs` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.4 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/docs/highlight` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.4 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/docs/nodecanvas` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.4 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/docs/videoeditor` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.4 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/explore` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.2 (재구현 검증 3~9차 XXOXOOX, 연속 통과 아님) |
| `/highlight` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.11 (재구현 검증 3~9차 XXOXXXX, 연속 통과 아님) |
| `/highlight/[projectId]` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.11 (재구현 검증 3~9차 XXOXXXX, 연속 통과 아님) |
| `/highlight/[projectId]/shorts/[shortId]` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.11 (재구현 검증 3~9차 XXOXXXX, 연속 통과 아님) |
| `/inquiry` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.5 (재구현 검증 3~9차 XXXOOXO, 연속 통과 아님) |
| `/login` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.6 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/mypage` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.7 (재구현 검증 3~9차 XXXXOXO, 연속 통과 아님) |
| `/mypage/topup/fail` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.8 (재구현 검증 3~9차 OOOXOOO, 연속 통과) |
| `/mypage/topup/success` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.8 (재구현 검증 3~9차 OOOXOOO, 연속 통과) |
| `/mypage/upgrade` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.8 (재구현 검증 3~9차 OOOXOOO, 연속 통과) |
| `/mypage/upgrade/billing-change-fail` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.8 (재구현 검증 3~9차 OOOXOOO, 연속 통과) |
| `/mypage/upgrade/billing-change-success` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.8 (재구현 검증 3~9차 OOOXOOO, 연속 통과) |
| `/mypage/upgrade/billing-fail` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.8 (재구현 검증 3~9차 OOOXOOO, 연속 통과) |
| `/mypage/upgrade/billing-success` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.8 (재구현 검증 3~9차 OOOXOOO, 연속 통과) |
| `/mypage/upgrade/checkout` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.8 (재구현 검증 3~9차 OOOXOOO, 연속 통과) |
| `/mypage/upgrade/fail` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.8 (재구현 검증 3~9차 OOOXOOO, 연속 통과) |
| `/nodecanvas` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.9 (재구현 검증 3~9차 XXXXXXO, 연속 통과 아님) |
| `/pricing` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.2 (재구현 검증 3~9차 XXOXOOX, 연속 통과 아님) |
| `/privacy` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.5 (재구현 검증 3~9차 XXXOOXO, 연속 통과 아님) |
| `/recover` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.6 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/reset-password` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.6 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/reset-password/new` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.6 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/settings` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.7 (재구현 검증 3~9차 XXXXOXO, 연속 통과 아님) |
| `/signup` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.6 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/signup/check-email` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.6 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/signup/expired` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.6 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/signup/verified` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.6 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/subscription` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.7 (재구현 검증 3~9차 XXXXOXO, 연속 통과 아님) |
| `/templates` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.3 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/templates/[slug]` | 3 — 전체 — 구조·컴포넌트·상태까지 문서만으로 구현 가능 | §10.3 (재구현 검증 3~9차 OOOOOOO, 연속 통과) |
| `/terms` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.5 (재구현 검증 3~9차 XXXOOXO, 연속 통과 아님) |
| `/videoeditor` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.10 (재구현 검증 3~9차 XXXXXXX, 연속 통과 아님) |
| `/videoeditor/[projectId]` | 2 — 셸까지 — 페이지 셸·배경·여백은 문서에 있고, 화면 고유 구조는 없다 | §10.10 (재구현 검증 3~9차 XXXXXXX, 연속 통과 아님) |
<!-- GENERATED:route-coverage END -->

## 2) Source of Truth 파일

- 컬러·타이포·글래스 베벨 토큰:
  - `apps/web/app/globals.css`
- 랜딩 GNB:
  - `apps/web/components/landing/navigation/Gnb.tsx`
- 앱 GNB + 프로필/토큰 UI:
  - `apps/web/components/navigation/Gnb.tsx`
- 앱 **드롭다운·컨텍스트 메뉴 표면 + 등장 모션** (`apps/web`):
  - 표면·행: `apps/web/components/scenes/create/node-canvas-v2/nodes/EditNode.tsx` 의
    `SIDE_MENU_SURFACE` / `SIDE_MENU_ITEM` / `SIDE_MENU_ITEM_ICON` / `SIDE_MENU_ITEM_LABEL`
    (Tailwind 전환으로 `NodeSideButtons.module.css` 에서 옮겨 왔다. 같은 문자열을
    `NodeSideButtons.tsx` · `Toolbar.tsx` · `CanvasZoomControl.tsx` ·
    `AnalyticsAccountMoreMenu.tsx` 가 각자 인라인해 쓴다)
  - 모션: `apps/web/components/scenes/create/node-canvas-v2/components/MetaDropdownPanel.tsx` 의
    `MOTION` / `MOTION_OPEN` / `MOTION_ORIGIN_*` 상수 (Tailwind 전환으로 모듈 CSS 에서 옮겨 왔다)
  - 대시보드 계정 “더보기” 재사용: `apps/web/components/scenes/analytics/AnalyticsAccountMoreMenu.tsx`

## 3) 단위/기본 규칙

- **레이아웃·간격·블러·반경 등: `px`만 사용** (`apps/web` CSS/인라인 스타일 기준, `rem` 단위 사용 안 함)
- 글자 크기: `globals.css`의 `--type-*-size`(이미 `px`) 및 `type-*` 유틸 클래스
- letter-spacing 등은 필요 시 `em` 유지 가능
- 기준:
  - `landing`: `html { font-size: 62.5%; }` (레거시; 신규 스타일은 px)
  - `app` (`apps/web`): **`html { font-size: var(--type-caption-12-size) }` = 12px** — 즉
    **`1rem = 12px`** (`globals.css:942-943`, 변수는 `:374`). `4.5rem` = **54px**. 환산은 `×12`.
    > **수치 정정(2026-08-21).** 이 절은 원래 `1rem = 10px` · `4.5rem = 45px`라고 적고, 토큰으로
    > 바뀐 것은 「2026-08-08에 10px로 되돌렸다」고 적었다. **그런 커밋은 어느 저장소에도 없다.**
    > `klipse-web`과 구 `klipse` 양쪽에서 이 줄의 이력을 뽑으면 변경이 둘뿐이다 —
    > `0f47a2cb`가 `10px`를 세우고 `9f2326a8`(2026-07-31)이 토큰으로 바꿨다. **되돌림은 없었다.**
    > 즉 **2026-07-31 이래 루트는 12px다.**
    >
    > 브라우저로 확정했다 — 4개 문맥 전부에서 `root=12px · 1rem=12px · 4.5rem=54px`
    > ([product.rendered.json](product.rendered.json)의 `rootMetrics`, `verify-product-render`가 매번 잰다).
    >
    > **영향 범위는 작다.** 코드에서 `rem` 단위를 실제로 쓰는 곳은 **두 군데**뿐이다 —
    > `Gnb.tsx:1918`(접힘 사이드바 라벨 `max-width:4.5rem`)와
    > `StaticCreateDemo.tsx:151`(워크스루 캡션 `min-height:4.5rem`, 다만 같은 요소의
    > `min-height:3lh !important` 가 이겨서 실질 영향 없음). 나머지 간격·치수는 전부 px 다.
    >
    > **미디어 쿼리는 영향받지 않는다.** `@media (min-width: 48rem)` 의 `rem` 은 루트 선언이 아니라
    > **초기 폰트 크기(16px)** 기준이라 768px 그대로다 — 브라우저에서 실측 확인했다.
    >
    > 글자 크기는 `body` 가 `--type-body-16-size` 로 따로 잡으므로 이 선언에 영향받지 않는다 —
    > 즉 이 값이 바뀌어도 **움직이는 것은 `rem` 뿐이다.**
- 폰트:
  - `Pretendard Variable` (local font)
  - `font-feature-settings: "ss07" 1` (a 대체 글리프)
  - `font-synthesis: none` (가짜 볼드 방지)
  - 폰트 스무딩 적용

## 4) Color Tokens

### 4.0 이 표만 보고 다른 도구로 옮기면 틀린다 — 먼저 읽을 것

아래 표는 **토큰 이름**을 준다. 이름만으로는 화면을 재현할 수 없다는 것이 Figma 이관에서
실제로 확인됐고, 틀린 네 가지가 전부 `design/llms/foundations.txt` 의 생성 절에 들어가 있다.

| 무엇을 놓쳤나 | 실제로 벌어진 일 | 어디를 볼 것 |
| --- | --- | --- |
| 이름만 있고 **해결된 최종값**이 없었다 | `surface-inset` 이 다크에서 `palette-gray-600`(`#777d89`)인 줄 몰라 색을 틀렸다 | `foundations.txt` 의 모든 테마 값이 이제 `별칭 → 최종값` 으로 나온다 |
| **덮인 기본값**을 몰랐다 | 사이드바 업그레이드 버튼을 베이스 정의대로 민트로 그렸다. 배포 기본값은 검정(라이트)/흰색(다크)이다 | `## ⚠ 오버라이드된 기본값` |
| **이름이 종류를 뜻한다**고 봤다 | `--glass-dropdown-frame` 을 드롭섀도우로 그렸다. blur 0 헤어라인 링이다 | `## ⚠ 토큰 이름이 종류를 뜻하지 않는다` |
| **면끼리의 관계**가 없었다 | 라이트에서 페이지 바닥과 카드 면이 같은 색(`#f1f1f3`)이라 카드를 통째로 빠뜨렸다 | `## 화면 레이어 사다리` |

### 4.0.1 ⚠ 라이트에는 회색 램프가 **두 벌** 있다

**같은 토큰 이름이 앱 셸 안에서 다른 색이다.** `Gnb.tsx:1972-2000` 의 사이드바 래퍼가
`html[data-theme=light] body:has(&)` 로 `--palette-gray-*` 를 통째로 다시 선언한다.

| 토큰 | 전역 라이트 | **앱 셸 라이트** |
| --- | --- | --- |
| `--palette-gray-100` | `#f1f1f3` | `#f8f8f9` |
| `--palette-gray-150` | `#eaebee` | `#f1f1f3` |
| `--palette-gray-200` | `#e3e4e8` | `#eeeef1` |
| `--palette-gray-300` | `#d5d7dd` | `#e4e5e9` |
| `--palette-gray-400` | `#bcc0c9` | `#d5d7dd` |
| `--palette-gray-500` | `#9aa0ab` | `#bcc0c9` |
| `--palette-gray-600` | `#777d89` | `#9aa0ab` |

`--gray-400`~`--gray-900` 과 `--dropdown-surface-bg` 도 같은 블록에서 재선언된다
(`--gray-900: var(--palette-gray-100)` → 앱 셸 라이트에서 `#f8f8f9`).

> **`--gray-*` 의 재선언은 새 규칙이 아니다.** 라이트에서 `--gray-400: var(--palette-gray-600)`,
> `--gray-600: var(--palette-gray-400)` 로 400↔600 이 뒤바뀌는 것은 **전역 라이트 테마가 이미
> 하는 일**이고(`globals.css:723`·`725`), 앱 셸 블록은 그것을 되풀이할 뿐이다. 실제로 값을
> 움직이는 것은 `--palette-gray-*` 쪽 재매핑이므로, 해결된 값은 **여전히 한 칸 이동**이다:
>
> | | 전역 라이트 | 앱 셸 라이트 | 다크 |
> | --- | --- | --- | --- |
> | `--gray-400` | `#777d89` | `#9aa0ab` | `#bcc0c9` |
> | `--gray-500` | `#9aa0ab` | `#bcc0c9` | `#9aa0ab` |
> | `--gray-600` | `#bcc0c9` | `#d5d7dd` | `#777d89` |
>
> "앱 셸이 400 과 600 을 바꾼다" 로 읽으면 두 번 뒤집게 된다.

#### ⚠ Figma 변수 바인딩 금지 (앱 화면)

**Figma 변수 컬렉션에는 앱 셸 램프가 없다.** 컬렉션은 `globals.css` 에서 뽑은 **전역 램프 한 벌**뿐이라,
`palette-gray/100` 을 바인딩하면 `#f1f1f3` 이 나온다. 그런데 사이드바가 있는 화면의 실제 값은
`#f8f8f9` 다 — **앱 화면 전체가 한 단계 어긋난다.** 색을 잘 골라도 바인딩하는 순간 틀린다.

| 화면 | Figma 에서 | |
| --- | --- | --- |
| 랜딩 계열 (§10.2~10.5 의 랜딩 브랜치) | 변수 바인딩 **가능** | 전역 램프와 같다 |
| 앱 셸 계열 (§10.1 · §10.5 `?shell=app` · §10.7~10.12) | **변수 바인딩 금지 — 해결값을 직접 입력** | 위 표의 「앱 셸 라이트」 열 |
| 다크 (양쪽) | 변수 바인딩 가능 | 앱 셸이 다크를 재매핑하지 않는다 |

**다크는 안전하다.** 재매핑 블록은 `html[data-theme=light]` 스코프라 다크 값은 전역과 같다.
틀리는 것은 **라이트 앱 화면뿐**이다.

> **이 금지는 임시 조치다.** 근본 해결은 Figma 컬렉션에 `전역`/`앱셸` 두 모드를 두는 것인데,
> 그러면 **코드에 없는 개념이 Figma 에만 생겨 권위가 둘이 된다.** 어느 쪽으로 갈지는
> **§7.5 미결정**에 올려 두었다. 정해지기 전까지는 위 표대로 한다.

**적용 대상은 사이드바가 있는 화면**(`.gnb-wrapperSidebar` 가 body 안에 있을 때)이다 —
§10.1 아카이브 · §10.7 계정 · §10.8 결제 · §10.9 노드 캔버스 · §10.10 비디오 에디터 ·
§10.11 하이라이트 · §10.12 애널리틱스·어드민. 랜딩 계열(§10.2~10.5)은 전역 램프를 쓴다.

> **이걸 모르면 앱 화면 문서의 색이 전부 「한 단계 밀린 오류」로 보인다.** 실제로 그렇게 오판해
> 맞는 값 30여 건을 틀린 값으로 고친 적이 있다. `check-doc-colors` 는 이제 라이트에 대해
> **전역·앱 셸 두 값을 모두 정답으로** 받는다.

**코드 자체의 불일치 1건:** `--palette-gray-200` = `#eeeef1`(238, 238, 241)인데
`--palette-gray-200-rgb` = `238 239 241`(`#eeeff1`)이다. 초록 채널이 1 다르다. 어느 쪽이
의도인지 정해지지 않아 게이트는 양쪽을 모두 받는다.

옮길 수 없는 것(뒤 배경 블러 66파일 · 그라디언트 마스크 23파일 등)은
`## Figma 등 다른 도구로 그대로 옮길 수 없는 것` 에 있다. **근사치를 지어내지 말고 재현 불가로 둔다.**

### 4.1 Grayscale

<!-- GENERATED:color-grayscale START -->
| Token | Hex |
| --- | --- |
| `--palette-gray-000` | `#fafafa` |
| `--palette-gray-50` | `#f8f8f9` |
| `--palette-gray-100` | `#f1f1f3` |
| `--palette-gray-150` | `#eaebee` |
| `--palette-gray-200` | `#e3e4e8` |
| `--palette-gray-300` | `#d5d7dd` |
| `--palette-gray-400` | `#bcc0c9` |
| `--palette-gray-500` | `#9aa0ab` |
| `--palette-gray-600` | `#777d89` |
| `--palette-gray-700` | `#575d68` |
| `--palette-gray-800` | `#313640` |
| `--palette-gray-900` | `#171b22` |
| `--palette-gray-1000` | `#000000` |
<!-- GENERATED:color-grayscale END -->

위 표는 **팔레트(물리적 스케일)** 기준이다. 앱에서는 `html[data-theme="dark"]` / `html[data-theme="light"]` 에 따라 **`--gray-*` / `--gray-*-rgb` 시맨틱 토큰**으로 이 팔레트를 다시 묶어 쓴다. 원천: `apps/web/app/globals.css`.

### 4.1.1 라이트/다크 시맨틱 `--gray-*` (실수 방지 · 필독)

다크·라이트 **둘 다** 같은 클래스/CSS로 쓰려면 시맨틱 토큰만 써야 한다. 여기서 자주 나는 버그를 문서로 고정한다.

매핑은 **완전한 반전**이다 — 라이트에서 `--gray-000` 은 흰 면이 아니라 `#000000` 잉크이고,
`--gray-900` 이 밝은 면(`#f1f1f3`)이 된다. 중간값 `--gray-500` 만 양쪽에서 같다.

<!-- GENERATED:color-semantic-gray START -->
| Token | 라이트 | 다크 |
| --- | --- | --- |
| `--gray-000` | `var(--palette-gray-1000)` → `#000000` | `var(--palette-gray-000)` → `#fafafa` |
| `--gray-100` | `var(--palette-gray-900)` → `#171b22` | `var(--palette-gray-100)` → `#f1f1f3` |
| `--gray-200` | `var(--palette-gray-800)` → `#313640` | `var(--palette-gray-200)` → `#e3e4e8` |
| `--gray-300` | `var(--palette-gray-700)` → `#575d68` | `var(--palette-gray-300)` → `#d5d7dd` |
| `--gray-400` | `var(--palette-gray-600)` → `#777d89` | `var(--palette-gray-400)` → `#bcc0c9` |
| `--gray-500` | `var(--palette-gray-500)` → `#9aa0ab` | `var(--palette-gray-500)` → `#9aa0ab` |
| `--gray-600` | `var(--palette-gray-400)` → `#bcc0c9` | `var(--palette-gray-600)` → `#777d89` |
| `--gray-700` | `var(--palette-gray-300)` → `#d5d7dd` | `var(--palette-gray-700)` → `#575d68` |
| `--gray-800` | `var(--palette-gray-200)` → `#e3e4e8` | `var(--palette-gray-800)` → `#313640` |
| `--gray-900` | `var(--palette-gray-100)` → `#f1f1f3` | `var(--palette-gray-900)` → `#171b22` |
| `--gray-1000` | `var(--palette-gray-000)` → `#fafafa` | `var(--palette-gray-1000)` → `#000000` |
<!-- GENERATED:color-semantic-gray END -->

- **금지 패턴:** 라이트 전용 블록에서 `background: rgb(var(--gray-000-rgb) / …)` 로 “밝은 글래스/화이트 카드”를 표현하려 하지 말 것. 라이트에서는 `--gray-000-rgb` 가 팔레트 상 **짙은 색**으로 매핑되어 **다크 UI처럼 보이는 배경**이 된다 (도킹 툴바 ‘최상단 이동’ 버튼 등에서 발생했던 유형).
- **권장:** 면·글래스 베이스는 다크 기준과 동일하게 `rgb(var(--gray-900-rgb) / …)` 등 **시맨틱 gray**만 사용한다. 라이트에서 토큰이 반전되면서 자연스럽게 밝은 면이 된다. 굳이 `:global(html[data-theme="light"])` 로 배경만 덮어쓸 필요가 없는 경우가 많다.
- **팔레트 고정이 필요할 때만** `var(--palette-gray-*-rgb)` 를 쓰고, “왜 시맨틱이 아닌지”를 주석이나 PR에 남긴다.
- **텍스트/아이콘 색:** 라이트에서만 `palette-gray-900` 을 명시하는 패턴은 유지해도 되지만, **배경**을 `gray-000` 시맨틱으로 맞추는 것과 혼동하지 말 것.

글래스 하이라이트용으로 쓰는 `rgb(var(--gray-000-rgb) / N%)` 얇은 레이어는 다크에서는 밝은 틴트, 라이트에서는 어두운 틴트가 된다. **의도한 대비인지** 항상 양 테마에서 확인한다.

### 4.2 Primary

브랜드 블루. 기본값은 `--primary: var(--primary-500)` (§6.0 인벤토리).
10단위 램프 사이에 `350` / `420` / `450` / `550` / `580` / `620` 중간값이 끼어 있는데,
그라디언트·호버 단계용으로 실제 쓰이는 값들이라 램프에 함께 싣는다.

<!-- GENERATED:color-primary START -->
| Token | Hex |
| --- | --- |
| `--primary-50` | `#f0f7ff` |
| `--primary-100` | `#d6ebff` |
| `--primary-200` | `#a3d5ff` |
| `--primary-300` | `#70bfff` |
| `--primary-350` | `#54b1ff` |
| `--primary-400` | `#38a4ff` |
| `--primary-420` | `#299aff` |
| `--primary-450` | `#1491ff` |
| `--primary-500` | `#0088ff` |
| `--primary-550` | `#007ee8` |
| `--primary-580` | `#0076d9` |
| `--primary-600` | `#0075db` |
| `--primary-620` | `#006ec4` |
| `--primary-700` | `#005fb3` |
| `--primary-800` | `#00498a` |
| `--primary-900` | `#003461` |
<!-- GENERATED:color-primary END -->

### 4.3 Accent

계열별 램프 전량이다. 대부분 `100`–`900` 9단계를 갖추고 있고, 단일 스톱만 있는 계열
(`green` / `instagram` / `ultra` / `youtube`)은 특정 용도 전용이다. 별칭 토큰은 최종 색으로
풀어서 적었다 — `--accent-instagram-500` 은 `var(--accent-red-500)` 이라 YouTube 와 같은
`#ff4b59` 로 표시된다.

<!-- GENERATED:color-accent START -->
**`--accent-amber-*`** (9개)

| Token | Hex |
| --- | --- |
| `--accent-amber-100` | `#fff5d6` |
| `--accent-amber-200` | `#ffe5a3` |
| `--accent-amber-300` | `#ffd66b` |
| `--accent-amber-400` | `#ffc847` |
| `--accent-amber-500` | `#ffbd2e` |
| `--accent-amber-600` | `#e89e00` |
| `--accent-amber-700` | `#b87a00` |
| `--accent-amber-800` | `#885a00` |
| `--accent-amber-900` | `#5c3d00` |

**`--accent-mint-*`** (9개)

| Token | Hex |
| --- | --- |
| `--accent-mint-100` | `#e5fff7` |
| `--accent-mint-200` | `#b8f8e5` |
| `--accent-mint-300` | `#79eccc` |
| `--accent-mint-400` | `#28d9a5` |
| `--accent-mint-500` | `#00c68e` |
| `--accent-mint-600` | `#00b37f` |
| `--accent-mint-700` | `#008f67` |
| `--accent-mint-800` | `#006e51` |
| `--accent-mint-900` | `#004c39` |

**`--accent-pink-*`** (9개)

| Token | Hex |
| --- | --- |
| `--accent-pink-100` | `#ffe5ed` |
| `--accent-pink-200` | `#ffc1d6` |
| `--accent-pink-300` | `#ff9bbe` |
| `--accent-pink-400` | `#ff6d9d` |
| `--accent-pink-500` | `#ff4d88` |
| `--accent-pink-600` | `#e23671` |
| `--accent-pink-700` | `#b72458` |
| `--accent-pink-800` | `#841a3f` |
| `--accent-pink-900` | `#54112a` |

**`--accent-red-*`** (9개)

| Token | Hex |
| --- | --- |
| `--accent-red-100` | `#ffe5e8` |
| `--accent-red-200` | `#ffc4ca` |
| `--accent-red-300` | `#ff9aa4` |
| `--accent-red-400` | `#ff6f7c` |
| `--accent-red-500` | `#ff4b59` |
| `--accent-red-600` | `#e23645` |
| `--accent-red-700` | `#b72431` |
| `--accent-red-800` | `#841a24` |
| `--accent-red-900` | `#541119` |

**`--accent-sky-*`** (9개)

| Token | Hex |
| --- | --- |
| `--accent-sky-100` | `#e0f5ff` |
| `--accent-sky-200` | `#bae8ff` |
| `--accent-sky-300` | `#7dd3fc` |
| `--accent-sky-400` | `#38bdf8` |
| `--accent-sky-500` | `#0ea5e9` |
| `--accent-sky-600` | `#0284c7` |
| `--accent-sky-700` | `#0369a1` |
| `--accent-sky-800` | `#075985` |
| `--accent-sky-900` | `#0c2f4a` |

**`--accent-violet-*`** (9개)

| Token | Hex |
| --- | --- |
| `--accent-violet-100` | `#ebe8ff` |
| `--accent-violet-200` | `#c9c2ff` |
| `--accent-violet-300` | `#9d91ff` |
| `--accent-violet-400` | `#8478ff` |
| `--accent-violet-500` | `#6055ff` |
| `--accent-violet-600` | `#4f45e3` |
| `--accent-violet-700` | `#3528b8` |
| `--accent-violet-800` | `#221a80` |
| `--accent-violet-900` | `#15104d` |

**`--accent-yellow-*`** (9개)

| Token | Hex |
| --- | --- |
| `--accent-yellow-100` | `#fff5d6` |
| `--accent-yellow-200` | `#ffe8a3` |
| `--accent-yellow-300` | `#ffd980` |
| `--accent-yellow-400` | `#ffc233` |
| `--accent-yellow-500` | `#ffb200` |
| `--accent-yellow-600` | `#e49a00` |
| `--accent-yellow-700` | `#b87600` |
| `--accent-yellow-800` | `#7a5200` |
| `--accent-yellow-900` | `#4c3300` |

**`--accent-green-*`** (1개)

| Token | Hex |
| --- | --- |
| `--accent-green-500` | `#28c840` |

**`--accent-instagram-*`** (1개)

| Token | Hex |
| --- | --- |
| `--accent-instagram-500` | `#ff4b59` |

**`--accent-ultra-*`** (1개)

| Token | Hex |
| --- | --- |
| `--accent-ultra-400` | `#b9e1f7` |

**`--accent-youtube-*`** (1개)

| Token | Hex |
| --- | --- |
| `--accent-youtube-500` | `#ff4b59` |
<!-- GENERATED:color-accent END -->

### 4.4 App/Landing/Auth 기본 배경

- `landing`: `--background = --gray-000`
- `app`: 화면 배경은 `--background` 가 아니라 **`--app-page-bg`** 다. 값은 `var(--gray-900)` 이지만
  `--gray-900` 자체가 테마·스코프에 따라 재해석되므로 **"고정"이 아니다** — globals.css 의 네 개
  스코프 블록에서 각각 선언된다. 소비처: `CreateScene` · `NodeCanvasHomeScene` ·
  `YoutubeAnalyticsScene` · `appHomeSceneStyles` · `myPageSceneStyles`.
- `--background` / `--foreground` 는 **법적 고지·에러·404 페이지 전용**이다
  (`LegalDocumentPage` · `app/error.tsx` · `app/not-found-content.tsx`). 앱 화면에 쓰지 않는다.
- 마케팅 트리는 또 다르다 — `[data-page-root]` 스코프가 `--page-bg`(`var(--gray-1000)`)를 비롯해
  `--panel` · `--panel-strong` · `--line` · `--text-soft` · `--text-muted` 를 별도로 정의하고,
  `--gray-*` 램프 전체를 테마 토글과 무관하게 고정한다. 전체 목록은
  `design/llms/foundations.txt` 의 **"Color — 스코프"** 절 참조.
- `auth` (`/login`, `/signup`, `/reset-password*`, `/signup/check-email|verified|expired`, `/recover`): 페이지 배경 `var(--gray-900)`. 라이트 테마에서는 `#F1F1F3`, 다크 테마에서는 `#171B22`로 해석된다. 인풋 박스도 라이트에서 같은 `var(--gray-900)` 면을 사용한다. **6.8절** 2컬럼 브랜드 패널 참조.

## 5) Typography Tokens

### 5.1 Weight

<!-- GENERATED:type-weight START -->
- `--type-weight-regular: 400`
- `--type-weight-medium: 500`
- `--type-weight-semibold: 600`
<!-- GENERATED:type-weight END -->

### 5.2 Scale

<!-- GENERATED:type-scale START -->
| Group | Size | Line-height | Letter-spacing |
| --- | --- | --- | --- |
| Heading | 48px | 1.35 | -0.02em |
| Heading | 36px | 1.35 | -0.02em |
| Heading | 28px | 1.35 | -0.02em |
| Body | 20px | 1.5 | -0.01em |
| Body | 16px | 1.5 | -0.01em |
| Body | 14px | 1.5 | -0.01em |
| Caption | 12px | 1.5 | -0.01em |
<!-- GENERATED:type-scale END -->

행간은 heading 1.35 / body·caption 1.5 로 통일돼 있다. 이 표에 없는 크기는 존재하지 않는다 —
`pnpm check-typography` 가 정의되지 않은 토큰 참조를 실패시킨다.

#### 5.2.1 반응형 크기 램프

<!-- GENERATED:type-scale-responsive START -->
| Token | 기본 | ≤1023px | ≤767px | ≤479px |
| --- | --- | --- | --- | --- |
| `heading-48` | 48px | 36px | 32px | 28px |
| `heading-36` | 36px | 32px | 28px | 20px |
| `heading-28` | 28px | var(--type-body-20-size) | 18px | ↑ |
| `body-20` | 20px | 18px | 16px | ↑ |

`↑` 는 그 브레이크포인트에서 재정의하지 않아 위 단계 값이 이어진다는 뜻이다. 램프는 `[data-page-root]` 스코프에만 적용된다 — 앱/대시보드는 영향받지 않는다.
<!-- GENERATED:type-scale-responsive END -->

### 5.3 Utility Class

<!-- GENERATED:type-utility-class START -->
- `.type-heading-48-{regular|medium|semibold}`
- `.type-heading-36-{regular|medium|semibold}`
- `.type-heading-28-{regular|medium|semibold}`
- `.type-body-20-{regular|medium|semibold}`
- `.type-body-16-{regular|medium|semibold}`
- `.type-body-14-{regular|medium|semibold}`
- `.type-caption-12-{regular|medium|semibold}`
<!-- GENERATED:type-utility-class END -->

원칙: 텍스트는 항상 위 유틸 클래스를 사용하고, 임의 하드코딩 폰트 수치를 피함.

## 6) Component Tokens (실사용 기준)

### 6.0 토큰 인벤토리 (globals.css `:root` 에서 생성)

아래는 `globals.css` 의 `:root` 에 정의된 **컴포넌트 토큰 전량**이다(색·타이포 스케일 제외).
6.1 이하의 설명 절들은 이 토큰들을 골라 쓰는 방법을 서술할 뿐이고, **값의 원천은 이 표다.**

이 표가 생기기 전에는 `--app-gnb-*`(148곳), `--node-chrome-btn-*`(125곳),
`--glass-dropdown-frame`(111곳)처럼 실제로 SSOT 노릇을 하는 계열이 문서에 아예 없어서,
신규 코드가 존재를 모르고 같은 값을 손으로 다시 썼다.

<!-- GENERATED:component-tokens START -->
**`--node-*`** (41개)

| Token | Value |
| --- | --- |
| `--node-handle-bg-youtube` | `var(--accent-red-800)` |
| `--node-handle-icon-youtube` | `var(--accent-red-500)` |
| `--node-handle-bg-instagram` | `var(--accent-red-800)` |
| `--node-handle-icon-instagram` | `var(--accent-red-500)` |
| `--node-handle-bg-edit` | `var(--accent-violet-800)` |
| `--node-handle-icon-edit` | `var(--accent-violet-500)` |
| `--node-handle-bg-image` | `var(--accent-mint-800)` |
| `--node-handle-icon-image` | `var(--accent-mint-500)` |
| `--node-handle-bg-text` | `var(--accent-yellow-800)` |
| `--node-handle-icon-text` | `var(--accent-yellow-500)` |
| `--node-handle-bg-audio` | `var(--accent-pink-800)` |
| `--node-handle-icon-audio` | `var(--accent-pink-500)` |
| `--node-prompt-generate-gradient` | `linear-gradient( 90deg, var(--primary-450) 0%, var(--primary-500) 50%, var(--primary-450) 100% )` |
| `--node-side-handle-size` | `28px` |
| `--node-side-handle-radius` | `8px` |
| `--node-handle-chrome-transition` | `background 0.13s ease, color 0.13s ease, transform 0.1s ease` |
| `--node-side-gap` | `10px` |
| `--node-side-stack-gap` | `8px` |
| `--node-side-ctrl` | `var(--node-side-handle-size, 28px)` |
| `--node-side-leading-offset` | `calc(var(--node-side-gap) + var(--node-side-ctrl))` |
| `--node-handle-outbound-slot` | `calc(100% + var(--node-side-gap))` |
| `--node-handle-bg-disabled-image` | `var(--accent-mint-900)` |
| `--node-handle-bg-disabled-text` | `var(--accent-yellow-900)` |
| `--node-handle-bg-disabled-youtube` | `var(--accent-red-900)` |
| `--node-handle-bg-disabled-instagram` | `var(--accent-red-900)` |
| `--node-handle-bg-disabled-edit` | `var(--accent-violet-900)` |
| `--node-handle-bg-disabled-audio` | `var(--accent-pink-900)` |
| `--node-handle-icon-disabled-image` | `var(--accent-mint-700)` |
| `--node-handle-icon-disabled-text` | `var(--accent-yellow-700)` |
| `--node-handle-icon-disabled-youtube` | `var(--accent-red-700)` |
| `--node-handle-icon-disabled-instagram` | `var(--accent-red-700)` |
| `--node-handle-icon-disabled-edit` | `var(--accent-violet-700)` |
| `--node-handle-icon-disabled-audio` | `var(--accent-pink-700)` |
| `--node-meta-dropdown-shadow` | `var(--dropdown-ambient-shadow), var(--glass-dropdown-frame)` |
| `--node-chrome-btn-h` | `32px` |
| `--node-chrome-btn-padding-x` | `10px` |
| `--node-chrome-btn-radius` | `12px` |
| `--node-chrome-btn-gap` | `4px` |
| `--node-chrome-btn-bg` | `var(--palette-gray-600)` |
| `--node-chrome-btn-border` | `0.5px solid var(--palette-gray-700)` |
| `--node-chrome-btn-bg-hover` | `color-mix( in srgb, var(--palette-gray-000) 8%, var(--node-chrome-btn-bg) )` |

**`--app-*`** (28개)

| Token | Value |
| --- | --- |
| `--app-gnb-safe-top` | `max(12px, env(safe-area-inset-top, 0px))` |
| `--app-gnb-sidebar-align-main-margin-top` | `calc( var(--app-gnb-safe-top) + 40px )` |
| `--app-gnb-rail-below-chrome-gap` | `12px` |
| `--app-gnb-rail-padding-bottom` | `12px` |
| `--app-gnb-main-card-padding-block-start` | `0px` |
| `--app-gnb-sidebar-padding-x` | `12px` |
| `--app-gnb-main-inline-padding` | `16px` |
| `--app-gnb-main-inline-padding-end` | `12px` |
| `--app-gnb-sidebar-menu-hit-w` | `calc( (var(--app-gnb-main-inline-padding) - var(--app-gnb-sidebar-padding-x)) + 20px + 8px )` |
| `--app-gnb-sidebar-logo-h` | `28px` |
| `--app-gnb-sidebar-logo-cube-px` | `calc(var(--app-gnb-sidebar-logo-h) * 72 / 85)` |
| `--app-gnb-sidebar-logo-wordmark-w` | `96px` |
| `--app-gnb-sidebar-logo-symbol-w` | `28px` |
| `--app-gnb-sidebar-width` | `min(280px, calc(100vw - 120px))` |
| `--app-shell-min-width` | `960px` |
| `--app-tooltip-font-size` | `var(--type-caption-12-size)` |
| `--app-tooltip-line-height` | `var(--type-caption-12-line-height)` |
| `--app-tooltip-letter-spacing` | `var(--type-caption-12-letter-spacing)` |
| `--app-tooltip-font-weight` | `var(--type-weight-regular)` |
| `--app-tooltip-padding-block` | `4px` |
| `--app-tooltip-padding-inline` | `8px` |
| `--app-tooltip-padding` | `var(--app-tooltip-padding-block) var(--app-tooltip-padding-inline)` |
| `--app-tooltip-motion-scale-rest` | `0.97` |
| `--app-tooltip-motion-duration-enter` | `140ms` |
| `--app-tooltip-motion-duration-exit` | `120ms` |
| `--app-tooltip-motion-ease-enter` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--app-tooltip-motion-ease-exit` | `cubic-bezier(0.19, 1, 0.22, 1)` |
| `--app-tooltip-kbd-bg` | `rgb(var(--palette-gray-900-rgb) / 8%)` |

**`--glass-*`** (7개)

| Token | Value |
| --- | --- |
| `--glass-inner-shadow-rgb` | `var(--palette-gray-000-rgb)` |
| `--glass-bevel-offset` | `1px` |
| `--glass-bevel-blur` | `1px` |
| `--glass-bevel-highlight` | `inset 0 var(--glass-bevel-offset) var(--glass-bevel-blur)` |
| `--glass-bevel-shade` | `inset 0 calc(-1 * var(--glass-bevel-offset)) var(--glass-bevel-blur)` |
| `--glass-dropdown-frame` | `0 0 0 0.5px var(--palette-gray-700)` |
| `--glass-dropdown-frame-on-dark` | `0 0 0 0.5px var(--palette-gray-700)` |

**`--button-*`** (6개)

| Token | Value |
| --- | --- |
| `--button-radius` | `12px` |
| `--button-padding-inline` | `16px` |
| `--button-height` | `40px` |
| `--button-height-sm` | `32px` |
| `--button-padding-inline-sm` | `12px` |
| `--button-min-width-sm` | `48px` |

**`--dropdown-*`** (5개)

| Token | Value |
| --- | --- |
| `--dropdown-ambient-shadow` | `0px 8px 15px 0px rgba(0, 0, 0, 0.04)` |
| `--dropdown-radius` | `16px` |
| `--dropdown-padding` | `6px` |
| `--dropdown-item-radius` | `10px` |
| `--dropdown-surface-bg` | `rgb(var(--palette-gray-800-rgb))` |

**`--scrollbar-*`** (3개)

| Token | Value |
| --- | --- |
| `--scrollbar-size` | `10px` |
| `--scrollbar-thumb` | `rgb(var(--palette-gray-000-rgb) / 26%)` |
| `--scrollbar-thumb-hover` | `rgb(var(--palette-gray-000-rgb) / 42%)` |

**`--ease-*`** (2개)

| Token | Value |
| --- | --- |
| `--ease-out-strong` | `cubic-bezier(0.32, 0.72, 0, 1)` |
| `--ease-in-out-strong` | `cubic-bezier(0.77, 0, 0.175, 1)` |

**`--project-*`** (2개)

| Token | Value |
| --- | --- |
| `--project-card-overlay-stack-gap` | `4px` |
| `--project-card-overlay-line-height` | `1.2` |

**`--red-*`** (2개)

| Token | Value |
| --- | --- |
| `--red-500-rgb` | `var(--accent-red-500-rgb)` |
| `--red-600-rgb` | `var(--accent-red-600-rgb)` |

**`--primary-*`** (1개)

| Token | Value |
| --- | --- |
| `--primary` | `var(--primary-500)` |
<!-- GENERATED:component-tokens END -->

### 6.0.1 전역 커스텀 스크롤바 (SSOT)

**재구현 검증이 여러 라운드 반복해서 「문서에 없다」고 지적한 자리다.** 토큰만 §6.0 인벤토리에
있고 그 토큰을 **어디에 어떤 기하로 거는지**가 없어서, 문서만 보면 브라우저 기본 스크롤바를
그리게 된다. 앱의 모든 스크롤 영역(카드 안 레일 · 드롭다운 목록 · 커맨드 팔레트)이 이걸 쓴다.

```css
* {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) transparent;
}
*::-webkit-scrollbar { width: var(--scrollbar-size); height: var(--scrollbar-size); }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb {
  border: 2px solid transparent;   /* 트랙 안에서 thumb 을 가늘게 */
  border-radius: 999px;
  background: var(--scrollbar-thumb);
  background-clip: padding-box;    /* 보더 자리를 비워 얇아 보이게 */
}
*::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-thumb-hover); background-clip: padding-box; }
*::-webkit-scrollbar-corner { background: transparent; }
```

근거 `globals.css:929-960`. 토큰은 `:90-92`(다크) · `:704-705`(라이트).

| 토큰 | dark | light |
| --- | --- | --- |
| `--scrollbar-size` | `10px` | 같음 |
| `--scrollbar-thumb` | `rgb(var(--palette-gray-000-rgb) / 26%)` | `rgb(0 0 0 / 22%)` |
| `--scrollbar-thumb-hover` | `rgb(var(--palette-gray-000-rgb) / 42%)` | `rgb(0 0 0 / 36%)` |

**트랙 10px 안에 실제로 보이는 알약은 6px 다** — thumb 이 `border: 2px solid transparent` +
`background-clip: padding-box` 로 좌우 2px 씩을 비우기 때문이다. 10px 솔리드로 그리면 두꺼워진다.

> **`html`·`body` 는 반대로 스크롤바를 숨긴다** — `scrollbar-width: none` + `::-webkit-scrollbar`
> 크기 0 (`globals.css:912-925`). 즉 **페이지 자체는 스크롤바가 안 보이고**, 카드 안쪽 스크롤
> 영역에만 위 알약이 나타난다.
>
> `*` 는 특이도 0 이라 **로컬 선언이 있으면 그쪽이 이긴다.** 실제로 `CustomDropdown.tsx:57-58` 이
> `[scrollbar-width:thin]!` · `[scrollbar-color:…]!` 로 다시 건다.

### 6.0.2 깊이 위계 — 새 그림자를 만들지 않는다

깊이는 **다섯 단계 중 하나를 고르는 것**이지 새로 만드는 것이 아니다. 표에 없는 그림자를
추가하면 그 화면만 다른 시스템이 된다.

| 레벨 | 처리 | 쓰는 곳 |
| --- | --- | --- |
| 0 — 평면 | 그림자 없음, 배경 톤 차이만 | 카드 기본, 노드 카드 |
| 1 — 베벨 | §6.1 의 inset 2줄 (하이라이트+음영 **쌍**) | 글래스 pill, 아이콘 버튼, primary 버튼 |
| 2 — 프레임 | `--glass-dropdown-frame` | 드롭다운, 모달 카드, 메인 카드 |
| 3 — 떠 있음 | 프레임 + `--dropdown-ambient-shadow` | 포털 메뉴, 팝오버 |
| 4 — 스크림 | `rgb(var(--palette-gray-900-rgb) / 50%)` 백드롭 + 레벨 3 | 모달 오버레이 |

**레벨 1 의 베벨은 반드시 쌍이다.** 하이라이트만 넣으면 위에서 빛이 오는 느낌이 안 나고
그냥 흰 줄로 보인다(§6.1).

**글래스 표면에 `border` 를 얹지 않는다.** 가장자리는 프레임 토큰이 만든다 —
`border` 를 더하면 링이 두 겹이 된다.

> 프로필 팝오버 계열만 예외로 `0 12px 24px rgb(var(--palette-gray-500-rgb) / 12%)` 드롭 섀도우 +
> 베벨 2줄 + `blur(40px)` 을 함께 쓴다(§6.4).

### 6.1 Pill / Glass 공통

- Pill radius: `999px` (또는 `9999px` 등 pill 전용)
- Glass 배경 기본: `rgb(var(--gray-000-rgb) / 10%)` (컴포넌트별로 알파 조정). **라이트에서는 `gray-000` 이 잉크 쪽으로 매핑되므로**, 면 전체 색은 **`gray-900` 기반** 등 **4.1.1 라이트/다크 시맨틱** 참고.
- **Glass 표면은 `border` 스트로크로 외곽선을 두지 않는다.** 가장자리 정의는 아래 **inset shadow 2개**로만 한다 (단색 `border` / `box-shadow: inset 0 0 0 1px` 한 줄 스트로크 대체 금지).

#### 글래스 이너 섀도우 (코드 원천: `apps/web/app/globals.css`)

**값은 §6.0 인벤토리가 원천이다.** 여기에는 각 토큰이 무슨 역할인지만 적는다 —
수치를 여기 복제하면 반드시 어긋난다(실제로 offset·blur 이 `0.5px` 로 적혀 있었으나 코드는 `1px` 이었다).

| Token                      | 역할                                                                    |
| -------------------------- | ----------------------------------------------------------------------- |
| `--glass-inner-shadow-rgb` | 하이라이트/쉐이딩 색 (팔레트 화이트 RGB: `var(--palette-gray-000-rgb)`) |
| `--glass-bevel-offset`     | 베벨 오프셋 — 두 inset 레이어의 Y 이동량                                |
| `--glass-bevel-blur`       | 베벨 블러 반경                                                          |
| `--glass-bevel-highlight`  | 첫 번째 inset — 위쪽 하이라이트 (↑ 방향)                                |
| `--glass-bevel-shade`      | 두 번째 inset — 아래쪽 쉐이딩 (↓ 방향, offset 부호 반전)                |

**조합 규칙 (어디서나 동일):** `box-shadow` 안에서 아래 **두 줄을 항상 짝**으로 쓴다. 알파만 화면별로 바꿀 수 있다.

```css
  var(--glass-bevel-highlight) rgb(var(--glass-inner-shadow-rgb) / 25%),
  var(--glass-bevel-shade) rgb(var(--glass-inner-shadow-rgb) / 25%);
```

- `25%` 대신 `15%`, `18%`, `32%` 등 디자인에 맞는 알파 사용 가능.
- **금지:** `inset 1px 1px 1px` / `inset 0px 0px 1px` 등 예전·임의 inset을 직접 쓰지 않는다. 두께·대칭은 `--glass-bevel-offset` / `--glass-bevel-blur`만 조정.

#### 배경 Blur (패널 글래스와 별개)

- small: `blur(10px)`
- panel: `blur(40px)`


#### 6.1.1 `--glass-dropdown-frame` — 0.5px 헤어라인 (테마별 최종값)

페이지 절들이 §6.1 로 위임하는 것의 **대부분이 이 토큰**이다. 값의 원천은
`apps/web/app/globals.css` 이고, 다크가 `:root` 기본이다.

| 테마 | 값 | 해결된 색 |
| --- | --- | --- |
| 다크 (`:root` 기본) | `0 0 0 0.5px var(--palette-gray-700)` | **#575d68** |
| 라이트 | `0 0 0 0.5px var(--palette-gray-300)` | 전역 **#d5d7dd** · 앱 셸 **#e4e5e9** |

- **한 겹이다.** blur 0 · offset 0 · spread 0.5px 뿐이라 사방에 균일한 0.5px 링이 생긴다.
  불투명도 100% 라 아래 면의 색이 비치지 않고, 얹히는 표면이 무엇이든 같은 톤이 나온다.
- **톤 선택 규칙** — 그 요소의 면과 **부모의 면 어느 쪽과도 겹치지 않는** 한 단계를 고른다.
  다크 표면(#313640 · #171b22)에는 한 단계 밝은 700, 라이트 표면(#f8f8f9 · #eeeef1 · #f1f1f3)에는
  한 단계 어두운 300 이 그 조건을 만족한다. 라이트 값이 팔레트 토큰이므로 §4.0.1 의 앱 셸 램프에서
  자동으로 한 칸 이동한다 — 앱 화면과 랜딩에서 각각 맞는 톤이 나온다.
- **`border` 가 아니라 `box-shadow` 로 그린다.** border 는 박스 크기를 바꿔 레이아웃을 밀지만
  spread-only box-shadow 는 밀지 않는다. 소비처가 111곳이라 이 차이가 크다.
- `--glass-dropdown-frame-on-dark` 도 같은 값이다. 이전에는 흰 림이 라이트에서 뒤집히는 문제 때문에
  분리돼 있었는데, 림이 사라져 그 이유가 없어졌다. 호출부 호환을 위해 이름만 남겨 둔다.

> **2026-08 단순화.** 이전에는 「검정 외곽 링 + 좌우 검정 엣지(±1.25px) + 상하 흰 림」 **5겹**이었다.
> Figma 로 옮기는 과정에서 겹 수를 그대로 재현하기 어렵고 값이 표면마다 다르게 보이는 문제가 있어
> 0.5px 헤어라인 한 겹으로 바꿨다. **이전 5겹 값을 참조하는 문서나 시안이 있으면 낡은 것이다.**

**라이트 오버라이드의 선택자 함정.** 라이트 값은 `html[data-theme="light"]` 블록(`globals.css:715`)
안이 **아니라** 별도 규칙에 있다:

```css
html[data-theme="light"]:not(:has([data-landing-walkthrough-dark])),
[data-landing-walkthrough-light] { … }   /* globals.css:592-593 */
```

- 문서 안에 `data-landing-walkthrough-dark` 요소가 **하나라도 있으면** `:has()` 가 참이 되어
  **문서 전체가 라이트여도 `--glass-dropdown-frame` 이 다크 값으로 되돌아간다.**
  그 속성을 다는 곳은 `components/landing/demo-snapshots/StaticCreateDemo.tsx:541` 하나다.
- 반대로 다크 문서 안의 `[data-landing-walkthrough-light]` 서브트리는 라이트 프레임을 받는다.
- `--glass-dropdown-frame` 은 `[data-landing-walkthrough-dark]` 블록(`globals.css:775-813`)에서
  **재선언되지 않는다** — 그 서브트리는 `html` 값을 그대로 상속한다.

**`--node-meta-dropdown-shadow` 의 4중 재선언.** 값은 어디서나 같은 식
`var(--dropdown-ambient-shadow), var(--glass-dropdown-frame)` 인데 네 곳에 반복돼 있다 —
`globals.css:559-560`(`:root`) · `:607-608`(라이트 규칙) · `:760-761`(`html[data-theme=light]`) ·
`:805-806`(walkthrough-dark) · `:849-850`(walkthrough-light). 두 walkthrough 스코프의 재선언은
**그 서브트리의 프레임 값으로 다시 치환시키기 위해 필요**하고, `html` 쪽 두 개는 같은 요소에서
이미 같은 결과가 나오는 방어적 중복이다.

#### 6.1.2 `--glass-dropdown-frame-on-dark` — 테마와 무관하게 고정

`globals.css:72-77`. **값은 다크 프레임과 바이트 단위로 동일**하고, **테마 오버라이드가 없다**
(문서 전체에서 이 이름의 선언은 `:72` 한 줄뿐).

- 용도: 앱 테마와 무관하게 **항상 어두운 표면** 위에 얹는 알약·칩. 라이트에서 프레임의 흰 림이
  50% → 100% 로 뒤집혀 흰 테두리가 떠 버리는 것을 막는다(`globals.css:69-71` 주석).
- 실제 사용처는 두 곳뿐이다 — `components/ui/VideoPlayer.tsx:68`
  (`[--player-glass-shadow:var(--glass-dropdown-frame-on-dark)]`),
  `node-canvas-v2/components/CanvasOnboardingHints.tsx:44`
  (`[box-shadow:var(--dropdown-ambient-shadow),var(--glass-dropdown-frame-on-dark)]`).

#### 6.1.3 베벨의 최종 해상값 · 4줄 변형

`--glass-inner-shadow-rgb` 는 `:root` 에서 **한 번만** 정의되고(`globals.css:53`)
`--palette-gray-000-rgb` = **`250 250 250`(#fafafa, `globals.css:40`)** 로 풀린다.
**테마 오버라이드가 없다** — `globals.css` 안에서 이 이름의 선언은 `:53` 하나뿐이고, 나머지 한 건은
`app/(highlight-standalone)/hl/page.module.css:34` 에 같은 값으로 재선언한 것이다.
따라서 **라이트에서도 베벨은 흰색**이며, 카드 hover 링·프리뷰 베벨·토스트/모달 베벨이 라이트에서
흰색으로 보이는 것은 버그가 아니다.

`--glass-bevel-offset` = `1px`, `--glass-bevel-blur` = `1px` (`globals.css:55-56`, 테마 무관).
따라서 §6.1 의 표준 2줄 페어는 **양 테마·양 회색 램프에서 다음 한 가지로만** 풀린다:

```css
inset 0 1px 1px  rgb(250 250 250 / 25%),
inset 0 -1px 1px rgb(250 250 250 / 25%);
```

> `globals.css:54` 주석은 이 베벨을 「하이라이트(↓ Y+2) + 쉐이딩(↑ Y-2)」로 적고 있으나
> 실제 오프셋은 **1px** 이다(`:55`). 주석이 옛 값이다.

**실제로 쓰이는 알파** (`--glass-inner-shadow-rgb` 소비 지점 전수, `apps/web` / node_modules 제외):
`25%` 가 압도적(180곳)이고 그 밖에 `10 · 12 · 14 · 15 · 16 · 18 · 20 · 22 · 24 · 28 · 32 · 35 · 42 · 58 · 100%` 가 있다.
§6.1 본문의 「`15%`, `18%`, `32%` 등 사용 가능」은 실제 분포의 일부다.

**4줄 변형 — 앱 메인 카드 크롬만.** 표준 2줄에 **좌·우 18%** 두 줄이 더 붙는 변형이 있고,
문서 전체에서 이 형태를 쓰는 곳은 `.appMainCardChromeSurface::after`(`globals.css:1414-1419`)와
`.appMainCardChrome::after`(`globals.css:1446-1451`) **둘뿐**이다:

```css
var(--glass-bevel-highlight) rgb(var(--glass-inner-shadow-rgb) / 25%),
var(--glass-bevel-shade)     rgb(var(--glass-inner-shadow-rgb) / 25%),
inset var(--glass-bevel-offset) 0 var(--glass-bevel-blur)
  rgb(var(--glass-inner-shadow-rgb) / 18%),
inset calc(-1 * var(--glass-bevel-offset)) 0 var(--glass-bevel-blur)
  rgb(var(--glass-inner-shadow-rgb) / 18%);
```

→ 최종값 `inset 0 1px 1px rgb(250 250 250/25%), inset 0 −1px 1px rgb(250 250 250/25%),
inset 1px 0 1px rgb(250 250 250/18%), inset −1px 0 1px rgb(250 250 250/18%)`.
이 두 클래스는 베벨을 **본체가 아니라 `::after`(`inset:0` · `z-index:11` ·
`pointer-events:none` · `border-radius:inherit`)** 에 얹고, 본체에는 프레임만 건다
(`globals.css:1398-1405`, `:1430-1437`). 카드 면색은 라이트 `--palette-gray-100` /
다크 `--palette-gray-800` (`globals.css:1422-1428`, `:1454-1460`).

**「임의 inset 금지」의 승인된 예외.** 공용 Button `primary` 는 베벨 페어를 `box-shadow` 에 두고,
글로우는 **별도 `::before` 레이어**로 분리한다 —
`before:[box-shadow:inset_0_0_8px_0_rgb(var(--palette-gray-000-rgb)/100%)]` +
`before:mix-blend-overlay` (`components/ui/Button.tsx:94-99`). 즉 §6.1 의 금지 규칙은
**가장자리 정의 레이어**에 대한 것이고, 블렌드 모드로 분리된 글로우 레이어는 별개다.

#### 6.1.4 라이트 회색 램프 두 벌과 §6.1 의 관계

**§6.1 의 값은 어느 램프에서도 바뀌지 않는다.** 앱 셸 재매핑
(`html[data-theme=light] body:has(.gnb-wrapperSidebar)`, `Gnb.tsx:1972-1985`)이 다시 매핑하는 것은
`--palette-gray-100 / 150 / 200 / 300 / 400 / 500 / 600` 과 각 `-rgb` **뿐이며,
`--palette-gray-000`(`-rgb` 포함)은 건드리지 않는다.**

- 베벨 색 = `--palette-gray-000-rgb` → 전역 램프·앱 셸 램프 **양쪽에서 `250 250 250`**.
- 프레임 = `0 0 0 0.5px var(--palette-gray-700)`(다크) / `--palette-gray-300`(라이트).
  **회색 램프를 쓰지만 `--palette-gray-300/700` 은 앱 셸 재매핑 대상이 아니라 값이 안 바뀐다.**
  (2026-08 단순화 전에는 검정·흰색 리터럴 5겹이었다 — 위 경고 상자 참조.)

따라서 페이지 절이 「이 화면은 앱 셸 램프」라고 적었더라도 §6.1 값은 그대로 쓰면 된다.
바뀌는 것은 이 토큰들이 **올라앉는 면색**(예: 카드 `--palette-gray-100` 이 전역 #f1f1f3 →
앱 셸 #f8f8f9)뿐이다.

#### 6.1.5 backdrop blur — 실제 배포 계단

§6.1 본문의 「small `blur(10px)` / panel `blur(40px)`」은 실제 배포값의 일부다. 전수(`apps/web`,
node_modules 제외)는 다음과 같고, **`saturate()` 동반 여부까지가 한 세트**다.

| blur | saturate | 대표 근거 |
| --- | --- | --- |
| `2px` | — | `components/ui/VideoPlayer.tsx:107` · `nodes/VideoEditModal.tsx:3788` · `videoEditParts/ClipCropModal.tsx:55` |
| `4px` | — | `node-canvas-v2/index.tsx:522` · `components/Toolbar.tsx:33` · `components/CanvasZoomControl.tsx:26` · `components/CanvasOnboardingHints.tsx:40` · `navigation/CommandPalette.tsx:74` · `scenes/appHomeSceneStyles.ts:658` |
| `6px` | — | `demo-snapshots/VideoEditorDemoPad.tsx:123` (**Tailwind 기본 유틸 `backdrop-blur-[6px]`**) |
| `8px` | — | `scenes/highlightSceneStyles.ts:28` · `nodes/VideoEditModal.tsx:964` · `youtube/YoutubeUploadModal.tsx:35` |
| `10px` | — | `scenes/CreateScene.tsx:172` · `scenes/myPageSceneStyles.ts:333` · `admin/BannerManagement.tsx:93` (인라인: `scenes/CreateScene.tsx:1004` · `navigation/Gnb.tsx:4285` · `generation/GenerationProvider.tsx:288`) |
| `12px` | 없음 / `120%` / `130%` | `landing/navigation/Gnb.tsx:65` · 노드 카드 `nodes/VideoNode.tsx:754`·`TextNode.tsx:477`·`TtsNode.tsx:587`·`ImageNode.tsx:391`·`BgmNode.tsx:531`(전부 `saturate(120%)`) · `scenes/appHomeSceneStyles.ts:454`(`130%`) · `banners/TabBannerCarousel.tsx:130`(`130%`) |
| `14px` | `140%` | `demo-snapshots/StaticCreateDemo.tsx:166` |
| `16px` | — | `app/(highlight-standalone)/layout.tsx:65` |
| `18px` | `140%` | `node-canvas-v2/index.tsx:595` |
| `20px` | `150%` | `components/PaneContextMenu.tsx:41` · `components/NodeContextMenu.tsx:33` |
| `22px` | `125%` | `scenes/appHomeSceneStyles.ts:506`(`before:`) · `banners/TabBannerCarousel.tsx:53`(`before:`) |
| `40px` | — | 프로필 팝오버 3곳, **React 인라인 스타일** `navigation/Gnb.tsx:4025-4026`·`5167-5168`·`5361-5362` |

**작성 규칙 — `-webkit-backdrop-filter` 를 표준 속성과 병기하지 않는다.**
lightningcss 가 **둘 다 떨어뜨려** 블러가 통째로 죽는다(`docs/tailwind-migration.md:306-310`;
저장소 주석 `node-canvas-v2/components/Toolbar.tsx` · `components/ui/VideoPlayer.tsx:34-35` ·
`admin/TemplateManagement.tsx:33` · `scenes/YoutubeAnalyticsScene.tsx:717` ·
`scenes/NodeCanvasHomeScene.tsx:71` · `scenes/VideoEditScene.tsx:370`). 임의 값에서는
**표준 `[backdrop-filter:…]` 만** 쓴다. 단 `blur(40px)` 팝오버 3곳은 **CSS 가 아니라 React
인라인 `style`** 이라 `backdropFilter` + `WebkitBackdropFilter` 를 함께 넣어도 lightningcss 를
거치지 않는다(`Gnb.tsx:4024-4026`).

**동반 선언.** 글래스 알약/툴바는 `backdrop-filter` 와 함께
`[transform:translateZ(0)]` + `[border:none]` 을 같이 건다 — `node-canvas-v2/index.tsx:522` ·
`components/Toolbar.tsx:33` · `components/CanvasZoomControl.tsx:26`. §6.1 의 「border 로 외곽선을
두지 않는다」가 코드에서는 명시적 `[border:none]` 으로 나타난다.

#### 6.1.6 이 절 범위에서 코드가 스스로 모순되는 지점

승자를 고르지 않고 그대로 적는다.

| 위치 | 주석이 말하는 것 | 선언이 하는 것 |
| --- | --- | --- |
| `globals.css:54` | 베벨 오프셋 `Y+2 / Y-2` | `--glass-bevel-offset: 1px` (`:55`) |
| `globals.css:70-71` | `--glass-dropdown-frame` 은 라이트에서 흰 림 **24% → 100%** | 다크 흰 림은 **50%**(`:67-68`), 라이트 **100%**(`:598-599`) |
| `globals.css:558` | MetaDropdown 다크 「검정 레이어 **100%**, 흰 림 **24%**」 | 검정 링 **50%** / 좌우 **80%**, 흰 림 **50%** (`:64-68`) |
| `globals.css:78-80` | `--dropdown-ambient-shadow` 는 「프레임 토큰(**83곳** 공유)」 | §6.0 인벤토리 서문은 같은 토큰을 **111곳**이라 적는다 (`DESIGN_SYSTEM.md:495`) |
| `banners/TabBannerCarousel.tsx:130-131` | 저장소 규칙은 `-webkit-` 병기 금지 | 표준 + `-webkit-` 를 **둘 다** 임의 유틸로 쓴다 |
| `demo-snapshots/VideoEditorDemoPad.tsx:122` | 「`backdrop-blur-[6px]` 은 `-webkit-backdrop-filter` 까지 함께 낸다」(문제없다는 전제) | `docs/tailwind-migration.md:308` 은 병기하면 둘 다 죽는다고 적는다 |

### 6.2 GNB (Landing)

- Wrapper padding: `16px 20px`
- 로고 높이: `24px`. 워드마크 폭은 높이에서 계산한다 — `logoWordmarkWidthForHeight` (`components/landing/navigation/Gnb.tsx`)
- 메뉴 버튼 높이: `28px`
- 상단 블러 그라디언트 레이어 8-step 사용
- **`navBlack` 모드** (`html[data-theme="dark"]` 와 무관, **scroll trigger** 로 `pricing` / `final-cta` 라이트 섹션 위에서만 활성):
  - 로고 자산 자동 스왑 (`/klipse-light.svg` ↔ `/klipse-dark.svg`)
  - `LanguageSelector` 트리거 컬러는 **`var(--gray-900)` 솔리드** (이전 72% 알파 → 100%) 로 메뉴/Try 버튼과 톤 위계 맞춤. globe(셰브론은 없다 — `LanguageSelector.tsx:353-358` 은 `GlobeIcon` 하나만 렌더한다. 같은 파일 `:69`·`:186` 주석과 모듈의 `.chevron` 은 제거 전 잔재다) 얇은 stroke 가 옅게 보이지 않게 하는 의도.
  - hover 는 `opacity: 0.7` 로 별도 처리.


#### 6.2.0 이 절을 읽기 전에 — 적용 범위와 회색 램프 기준

**소비처는 5곳뿐이고, 전부 `<main data-page-root>` 안에 있다.**

| 라우트 | 렌더 위치 | `lightSurface` |
| --- | --- | --- |
| `/` | `app/HomePageClient.tsx:765` (`:763` 의 `<main … data-page-root>` 안) | 없음 |
| `/pricing` | `app/pricing/page.tsx:50` (`:48` 의 `<main … data-page-root>` 안) | **있음** |
| `/docs`, `/docs/*` | `app/docs/layout.tsx:64` (`:63` 의 `<main … data-page-root>` 안) | **있음** |
| `/inquiry` (랜딩 브랜치) | `app/inquiry/InquiryClient.tsx:783` (`:777-780` 의 `<main … data-page-root>` 안) | **있음** |
| `/blog` (공개 예정 화면) | `components/landing/sections/BlogComingSoon.tsx:107` (`:102-105` 의 `<main … data-page-root>` 안) | **있음** |

**따라서 이 절의 `--gray-*` 는 라이트/다크 어느 쪽에서도 값이 같다.**
`apps/web/app/globals.css:1658` 의 `[data-page-root]` 블록이 시맨틱 램프를 팔레트 램프로 **테마와
무관하게** 고정하기 때문이다(`:1659` `--gray-000: var(--palette-gray-000)`, `:1660` `--gray-100`,
`:1668` `--gray-900`, `:1670`·`:1679` 각 `-rgb`). 이 선언은 `html[data-theme="light"]`
(`globals.css:719-740`) 보다 **더 가까운 조상**에 있으므로 커스텀 프로퍼티 상속에서 이긴다.

| 이 절에서 쓰는 토큰 | 라이트 최종값 | 다크 최종값 | 근거 |
| --- | --- | --- | --- |
| `--gray-000` | `#fafafa` | `#fafafa` | `globals.css:1659` → `:20` |
| `--gray-100` | `#f1f1f3` | `#f1f1f3` | `globals.css:1660` → `:24` |
| `--gray-900` | `#171b22` | `#171b22` | `globals.css:1668` → `:37` |

**어느 회색 램프 기준인가 — 전역 램프다.** 앱 셸에서 `--palette-gray-*` 를 재매핑하는 규칙은
앱 사이드바 요소를 `body:has(&)` 로 잡는 Tailwind 임의 변형이고
(`apps/web/components/navigation/Gnb.tsx:1972-1989`), 랜딩 GNB 는 그 사이드바와 같은 문서에
공존하지 않는다(`/inquiry?shell=app` 은 앱 브랜치에서 먼저 return 하며 랜딩 GNB 를 렌더하지
않는다 — `app/inquiry/InquiryClient.tsx:770-774`). 그래서 이 절의 팔레트 값은 전부
`globals.css:20-52` 의 전역 정의(`--palette-gray-100` `#f1f1f3` · `--palette-gray-500` `#9aa0ab` ·
`--palette-gray-600` `#777d89` · `--palette-gray-900` `#171b22`)를 쓴다.

**단 하나의 예외:** 리소스 드롭다운 패널은 `document.body` 로 portal 되어(`Gnb.tsx:782`)
`[data-page-root]` **밖**이다. 그 안에서는 `--dropdown-surface-bg` / `--glass-dropdown-frame` 이
`html[data-theme]` 을 따른다(§6.2.6 표에 라이트·다크 최종값을 모두 적었다).

---

#### 6.2.1 위 11줄 중 코드와 어긋나는 3건 — 코드 기준 정정

§10.2 · §10.3 · §10.4 가 「§6.2 로 위임하지 말 것」이라고 적은 근거가 이 세 건이다.
아래는 **코드가 실제로 무엇인지**이며, 어느 쪽이 정본인지는 §6.2.9 참조.

| 위 본문 | 코드의 실제 값 | 근거 |
| --- | --- | --- |
| `Wrapper padding: 16px 20px` | `[padding:12px_12px_12px_20px]`, `@media(max-width:450px)` 에서 `[padding:12px_16px]!` | `Gnb.tsx:70-77` |
| `상단 블러 그라디언트 레이어 8-step 사용` | 레이어 1개 — `[backdrop-filter:blur(12px)]` + 2-stop 마스크. 8-step 레이어는 저장소에 없다 | `Gnb.tsx:63-69` |
| navBlack 이 `pricing`/`final-cta` 두 섹션 스크롤에서만 활성 | 조건 3개(`isCapabilitiesTheme \|\| lightSurface \|\| (mobileOpen && !isDarkTheme)`), 관찰 섹션 7개 | `Gnb.tsx:399-400`, `:611` |

`LanguageSelector` 트리거 컬러에 대한 위 서술도 토큰 이름만 다르다 — 실제 선언은
`[&_button[aria-haspopup=listbox]]:[color:rgb(var(--palette-gray-900-rgb)/1)]!`
(`Gnb.tsx:99`)로 **팔레트** 토큰이다. `[data-page-root]` 아래에서 `--gray-900` 과 최종값이
`#171b22` 로 같아 결과는 동일하다. hover 는 `opacity-70` 과 **함께**
`[color:rgb(var(--palette-gray-900-rgb)/0.92)]!` 가 걸린다(`Gnb.tsx:100-102`).

---

#### 6.2.2 레이어 · z-index · 브레이크포인트

| 요소 | 선언 | 값 | 근거 |
| --- | --- | --- | --- |
| 상단 블러 판 | `fixed top-0 left-0 right-0 h-[120px] pointer-events-none z-[1000]` | 높이 120px, z 1000 | `Gnb.tsx:64` |
| 〃 | `[backdrop-filter:blur(12px)]` | blur 12px | `Gnb.tsx:65` |
| 〃 마스크 | `linear-gradient(to bottom, rgb(0 0 0) 40%, rgb(0 0 0/0%) 100%)` — 표준·`-webkit-` 둘 다 | 상단 40% 완전 불투명 → 하단 0% | `Gnb.tsx:66-67` |
| 〃 | `aria-hidden="true"` | 접근성 트리에서 제외 | `Gnb.tsx:700` |
| `<header>` 래퍼 | `fixed top-0 left-0 w-full z-[1001]` · `[background:transparent]` | z 1001, 배경 없음 | `Gnb.tsx:71-73` |
| `<nav>` | `relative z-2` | z-index 2 | `Gnb.tsx:79` |
| 리소스 패널 | 인라인 `style` 의 `zIndex: 2000` (클래스의 `z-20` 을 이긴다) | z 2000 | `Gnb.tsx:163`, `:797` |
| 모바일 풀스크린 메뉴 | `fixed inset-0 z-[-1]` | z −1 — `nav`(z 2) 아래, 로고·햄버거는 위에 떠서 계속 클릭 가능 | `Gnb.tsx:288` |

브레이크포인트는 두 개뿐이다.

- **`max-width: 719px`** — nav 그리드가 3열→2열(`[grid-template-columns:1fr_auto]!`, `Gnb.tsx:81`),
  가운데 메뉴 `display:none!`(`:118`), 상단 CTA `display:none!`(`:243`),
  햄버거 `display:inline-flex!`(`:256`), 모바일 메뉴 `display:block!`(`:290`).
- **`max-width: 450px`** — 래퍼 패딩만 `12px 16px` 로 바뀐다(`Gnb.tsx:74`).

**행 높이.** `<nav>` 는 `grid items-center min-h-12` = 최소 24px(`--spacing: 2px`,
`app/tailwind.css:164`)이므로 헤더 높이는 `12px + max(자식 높이, 24px) + 12px` 로 **유도**된다.
데스크톱(≥720px)의 최대 자식은 32px(`LanguageSelector` compact / 상단 CTA)라 56px,
≤719px 에서는 38px(햄버거)라 62px 이 나온다. **실측값이 아니다** — §10.3 의 같은 유도와 일치한다.

---

#### 6.2.3 navBlack 활성 조건 (정정 · 전문)

```
navBlackActive = isCapabilitiesTheme || lightSurface || (mobileOpen && !isDarkTheme)
```
`Gnb.tsx:399-400`.

1. **`lightSurface` prop** — 위 소비처 표의 4개 라우트에서 `true` 라 **스크롤과 무관하게 상시**
   navBlack 이다(`Gnb.tsx:371-374`).
2. **`isCapabilitiesTheme`** — `/` 에서만 의미가 있다. `IntersectionObserver` 가 관찰하는 id 는
   **7개**: `overview` · `capabilities` · `video-editor` · `highlight` · `pricing` · `faq` ·
   `final-cta`(`Gnb.tsx:611`). 감지선은 `rootMargin: "-3% 0px -96% 0px"`, `threshold: 0`
   (`Gnb.tsx:655-656`) — 뷰포트 최상단(고정 GNB 자리)을 지나는 라이트 섹션이 하나라도 있으면 on.
   7개 id 는 `/` 에 모두 실재한다(`app/HomePageClient.tsx:771`·`:837`·`:904`·`:943`·`:975`·`:1066`,
   `faq` 는 `components/landing/sections/FAQ.tsx:165` 의 기본 id 로 `HomePageClient.tsx:1064` 에서 붙는다).
3. **`#overview` 예외** — `overviewEl.dataset.merge === "idle"`(완전 검정 인트로) 동안에는 라이트
   섹션에서 제외해 라이트 텍스트를 유지하고, `data-merge` 가 바뀌는 순간 `MutationObserver` 가
   재평가한다(`Gnb.tsx:620-628`, `:664-671`).
4. **`mobileOpen && !isDarkTheme`** — 풀스크린 메뉴가 열리면 navBlack 으로 넘어가되, **다크 테마에서는
   제외**한다. 메뉴 배경이 `--palette-gray-900`(어두움)이라 헤더는 밝게 남아야 하기 때문이다
   (`Gnb.tsx:396-400`). `isDarkTheme` 은 `html[data-theme]` 을 `MutationObserver` 로 추적한다
   (`Gnb.tsx:508-522`).

navBlack 이 갈라놓는 것은 다음 5가지뿐이다.

| 대상 | navBlack 아님 | navBlack | 근거 |
| --- | --- | --- | --- |
| `<nav>` 색 | `text-gray-000` + `--gray-000` 를 팔레트 흰색으로 재고정 | `text-gray-900` (`#171b22`) | `Gnb.tsx:86-90`, `:97-98` |
| 로고 자산 | `/klipse-dark.svg` | `/klipse-light.svg` | `Gnb.tsx:706-709` |
| 메뉴 링크 | `text-gray-000!` / 비활성 `opacity-70`·hover `0.9` | `text-gray-900!` / 비활성 `opacity-50`·hover `0.7` | `Gnb.tsx:131-138` |
| 상단 CTA | `[background:var(--gray-000)]!` + `text-gray-900!` = `#fafafa` 면 / `#171b22` 글자 | `[background:var(--gray-900)]!` + `text-gray-100!` = `#171b22` 면 / `#f1f1f3` 글자 | `Gnb.tsx:247-248` |
| 햄버거 | `text-gray-000` (`#fafafa`) | `text-gray-900` (`#171b22`) | `Gnb.tsx:259-260` |

> `NAV_LIGHT`(`Gnb.tsx:86-90`)가 `--gray-000` 을 `var(--palette-gray-000)` 로 되돌리는 선언은
> **현재 소비처 5곳 전부에서 무효타**다 — `[data-page-root]` 가 이미 같은 값을 세우고 있다
> (`globals.css:1659`). `data-page-root` 없는 셸에 이 GNB 를 얹으면 그때 비로소 효력이 생긴다.

---

#### 6.2.4 로고

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 링크 | `<Link href="/">`, `aria-label="Klipse"`, `draggable={false}` | `Gnb.tsx:703` |
| 배치 | `justify-self-start inline-flex`, 드래그·선택 차단 | `Gnb.tsx:105` |
| 박스 | `h-12` = **24px**, `w-[calc(24px * 291 / 85)]` ≈ **82.16px**, `max-w-full` | `Gnb.tsx:108` |
| `<Image>` 속성 | `width={logoWordmarkWidthForHeight(24)}` = **82**, `height={24}`, `priority` | `Gnb.tsx:712-714` |
| viewBox 근거 | 291 × 85 (좌측 결합 마크 72 × 72) | `components/ui/brandLogoMetrics.ts:1-11` |
| 이미지 | `object-contain`, `[object-position:left_center]`, `[transition:filter_320ms_ease]`, `will-change: filter` | `Gnb.tsx:110-114` |
| 클릭 | `pathname === "/"` 일 때만 `preventDefault` → `scrollTo({top:0, behavior:"smooth"})` + `replaceState` 로 해시 제거 | `Gnb.tsx:471-480` |

⚠ CSS 폭(82.16px)과 `width` 속성(82)이 0.16px 어긋난다. **CSS 가 이긴다.**
⚠ 파일명이 반대로 읽힌다 — `/klipse-light.svg` 가 **어두운 잉크** 자산이라 navBlack 에서 쓰인다.

---

#### 6.2.5 가운데 메뉴 (`<ul>`)

`justify-self-center [list-style:none] flex items-center gap-8`(= **16px**), ≤719px `display:none!`
— `Gnb.tsx:116-119`.

**항목은 3개 + 드롭다운 트리거 1개다.** 전부 `route: true` 라 인페이지 앵커는 하나도 없다.

| 순서 | i18n 키 | 한 | 영 | href | 근거 |
| --- | --- | --- | --- | --- | --- |
| 1 | `messages.nav.docs` | 문서 | Docs | `/docs` | `Gnb.tsx:464`, `messages/ko.ts:15`, `messages/en.ts:13` |
| 2 | `messages.nav.pricing` | 가격 | Pricing | `/pricing` | `Gnb.tsx:465`, `ko.ts:11`, `en.ts:9` |
| 3 | `messages.nav.inquiry` | 문의 | Contact | `/inquiry` | `Gnb.tsx:466`, `ko.ts:16`, `en.ts:14` |
| 4 | `messages.nav.community` | **리소스** | **Resources** | 드롭다운(링크 아님) | `Gnb.tsx:774`, `ko.ts:17`, `en.ts:15` |

활성 판정은 `pathname === href || pathname.startsWith(`${href}/`)` 이고 `aria-current="page"` 를 단다
(`Gnb.tsx:723-736`). 드롭다운 트리거는 `pathname` 이 `/blog` · `/blog/*` · `/templates` · `/templates/*`
이거나 열려 있을 때 활성으로 그린다(`Gnb.tsx:427-431`, `:770-773`).

**링크 셸** (`Gnb.tsx:121-129`, 타이포는 `type-body-14-medium` — `Gnb.tsx:142`)

| 프로퍼티 | 값 |
| --- | --- |
| 레이아웃 | `inline-flex items-center justify-center` |
| 높이 | `h-14` = **28px** |
| 좌우 패딩 | `px-6` = **12px**, `py-0` |
| 곡률 | `rounded-[999px]` |
| 배경 | `transparent` |
| 폰트 | `[font-family:var(--type-font-family)]` · `[font-feature-settings:var(--type-feature-settings)]` (`globals.css:341-342`) |
| 트랜지션 | `color 320ms ease, opacity 200ms ease` |

**톤 · 투명도 행렬** (`Gnb.tsx:131-151`) — 라이트/다크 구분 없음(§6.2.0).

| 상태 | 비-navBlack | navBlack |
| --- | --- | --- |
| 활성 | `#fafafa` / `opacity 1` | `#171b22` / `opacity 1` |
| 비활성 | `#fafafa` / `opacity 0.7` | `#171b22` / `opacity 0.5` |
| 비활성 hover | `opacity 0.9` | `opacity 0.7` |

hover 는 `[&:hover]:` 로 옮겨져 **`@media (hover: hover)` 가드가 없다**(모듈 CSS 원본과 동일).

---

#### 6.2.6 리소스 드롭다운 (body portal)

**항목 5개** (`Gnb.tsx:403-419`)

| 순서 | i18n 키 | 한 | 영 | 동작 |
| --- | --- | --- | --- | --- |
| 1 | `messages.nav.templates` | 템플릿 | Templates | `/templates` (`ko.ts:13`, `en.ts:11`) |
| 2 | `messages.nav.blog` | 블로그 | Blog | **공개 예정**(`comingSoon`) (`ko.ts:12`, `en.ts:10`) |
| 3 | `messages.nav.ambassador` | 앰버서더 | Ambassador | **공개 예정** (`ko.ts:18`, `en.ts:16`) |
| 4 | `messages.nav.officialYoutube` | 공식 유튜브 | Official YouTube | `https://www.youtube.com/@Klipse-ai` 새 탭 (`ko.ts:19`, `en.ts:17`) |
| 5 | `messages.nav.officialInstagram` | 공식 인스타그램 | Official Instagram | `https://www.instagram.com/klipse_ai` 새 탭 (`ko.ts:20`, `en.ts:18`) |

칩 문구 `messages.nav.communitySoon` — 「공개 예정」 / 「Coming soon」(`ko.ts:21`, `en.ts:19`).

**위치·모션** — 트리거는 `<button aria-haspopup="true" aria-expanded>`(`Gnb.tsx:775-777`).
패널은 `document.body` 로 portal 되고(`Gnb.tsx:782`, `mounted` 가드 `:445`), 위치는
`useLayoutEffect` 가 트리거 `getBoundingClientRect()` 로 계산해 인라인 `style` 로 세운다 —
`position: fixed`, `top = rect.bottom`, `left = rect.left + rect.width / 2`, `zIndex: 2000`
(`Gnb.tsx:447-459`, `:791-798`). `resize` 에서만 재계산하고 **스크롤 리스너는 없다**(헤더가 고정이라 필요 없다).

| 상태 | 선언 | 근거 |
| --- | --- | --- |
| 공통 | `pt-6`(=12px, 트리거↔카드 호버 브리지) · `[transform-origin:top_center]` | `Gnb.tsx:163-171` |
| 닫힘 | `opacity-0 pointer-events-none` · `translateX(-50%) scale(0.92)` · `transition: opacity 130ms ease-in, transform 130ms ease-in` | `Gnb.tsx:173-178` |
| 열림 | `opacity-100 pointer-events-auto` · `translateX(-50%) scale(1)` · `transition: transform 260ms cubic-bezier(0.32,0.72,0,1)` | `Gnb.tsx:180-186` |
| reduced-motion | `motion-reduce:[transform:none]` · `motion-reduce:[transition:opacity_120ms_ease]` | `Gnb.tsx:168-169` |

⚠ **열림 트랜지션에는 `opacity` 가 들어 있지 않다** — 열 때 투명도는 즉시 100% 로 튀고 스케일만
260ms 동안 움직인다. 닫힐 때만 130ms 페이드가 걸린다(비대칭).

**표면** (`Gnb.tsx:189-197`)

| 프로퍼티 | 라이트 최종값 | 다크 최종값 | 근거 |
| --- | --- | --- | --- |
| 폭 | `220px`, `max-width: calc(100vw - 40px)` | 동일 | `Gnb.tsx:190` |
| 패딩 | `var(--dropdown-padding)` = **6px** | 동일 | `globals.css:85` |
| 곡률 | `var(--dropdown-radius)` = **16px** | 동일 | `globals.css:84` |
| 배경 | `var(--dropdown-surface-bg)` = `rgb(241 241 243)` = **#f1f1f3** | 클래스가 `rgb(241 241 243)` 로 덮음 = **#f1f1f3** | `globals.css:600`, `Gnb.tsx:196` |
| 그림자 | `var(--dropdown-ambient-shadow)` `0px 8px 15px 0px rgba(0,0,0,0.04)` + 라이트 프레임(링 `rgba(0,0,0,0.15)` / 좌우 `0.25` / 흰 림 `1`) | 같은 앰비언트 + **다크** 프레임(링 `rgba(0,0,0,0.5)` / 좌우 `0.8` / 흰 림 `0.5`) | `globals.css:81`, `:594-599`, `:63-68` |

⚠ 다크 테마에서 **표면만 라이트로 고정되고 프레임은 다크판이 그대로 온다** — 패널이 portal 로
`[data-page-root]` 밖에 있어 `--glass-dropdown-frame` 이 `html[data-theme]` 을 따르기 때문이다.

**행** (`Gnb.tsx:199-230`)

| 항목 | 값 |
| --- | --- |
| 컨테이너 | `flex flex-col gap-2` = **4px** |
| 행 | `flex items-center gap-7`(=**14px**) `p-4`(=**8px**), 곡률 `var(--dropdown-item-radius)` = **10px**, `transition: background-color 160ms ease` |
| 행 hover / 현재 경로 | `rgb(0 0 0 / 0.05)` (양쪽 동일) |
| 라벨 | `type-body-16-medium`, `text-palette-gray-1000` = **#000000** |
| 공개 예정 칩 | `type-caption-12-medium`, `shrink-0 ml-auto`, 패딩 `3px 8px`, `rounded-6`, 글자 `#777d89`, 배경 `rgb(154 160 171 / 14%)` |

칩의 다크 오버라이드(`Gnb.tsx:229-230`)는 `rgb(119 125 137)` / `rgb(154 160 171/14%)` 로
**라이트 값과 숫자가 같다**(`#777d89` = `rgb(119 125 137)`, `--palette-gray-500-rgb` = `154 160 171`).
즉 칩은 테마에 따라 달라지지 않는다.

**호버 인텐트** — `mouseenter` 즉시 열림, `mouseleave` 후 **120ms** 뒤 닫힘(`Gnb.tsx:440-443`).
트리거 클릭은 토글(`Gnb.tsx:778-780`). 패널에도 같은 enter/leave 핸들러가 붙어 이동 중 닫히지 않는다(`:799-800`).

---

#### 6.2.7 우측 액션 영역

`justify-self-end inline-flex items-center gap-4`(= **8px**) — `Gnb.tsx:232`.

**`LanguageSelector compact`** (`Gnb.tsx:872`) — 트리거 사양은 `components/landing/system/LanguageSelector.tsx` 가 원천.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 높이 | `h-16` = **32px**, `inline-flex items-center gap-2`(=4px), `[border:0]`, 배경 투명 | `LanguageSelector.tsx:51-53` |
| 패딩·곡률 | `[padding:0_8px]`, `rounded-12` (**12px**) | `LanguageSelector.tsx:70-71` |
| 아이콘 | `h-10 w-10` = **20px**, `stroke-width: 1.5`, `vector-effect: non-scaling-stroke` | `LanguageSelector.tsx:95-101` |
| 기본 색 | `rgb(var(--gray-000-rgb)/100%)` = **#fafafa** (base `.trigger` 의 76% 를 덮음) | `LanguageSelector.tsx:79` |
| navBlack 색 | GNB 가 `#171b22` 로 덮음(§6.2.1) | `Gnb.tsx:99-102` |
| 트랜지션 | `color 180ms ease-in-out` | `LanguageSelector.tsx:54` |

**상단 CTA** — `<Button variant="primary">` 위에 `TOPBAR_CTA` 를 얹어 **뉴트럴 버튼으로 뒤집는다**
(`Gnb.tsx:873-879`).

| 프로퍼티 | 값 | 근거 |
| --- | --- | --- |
| 높이 | `--button-height: 32px` (재생성 FAB 과 동일) | `Gnb.tsx:239` |
| 좌우 패딩 | `--button-padding-inline: 12px` | `Gnb.tsx:240` |
| 곡률 | `var(--button-radius)` = **12px** | `globals.css:88`, `components/ui/Button.tsx:46` |
| 타이포 | `type-body-14-medium` (Button 이 붙인다) | `Button.tsx:187` |
| 그림자 | `[box-shadow:var(--glass-dropdown-frame)]!` — primary 의 글래스 베벨을 **대체** | `Gnb.tsx:241` |
| 오버레이 | `before:[display:none]!` — primary 의 `mix-blend-overlay` 이너섀도우 제거 | `Gnb.tsx:242` |
| 면/글자 | 비-navBlack `#fafafa` / `#171b22` · navBlack `#171b22` / `#f1f1f3` | `Gnb.tsx:247-248` |
| ≤719px | `display:none!` (풀스크린 메뉴 안 CTA 로 이동) | `Gnb.tsx:243` |
| 라벨 | `messages.nav.getStarted` — 「시작하기」 / 「Get started」 | `ko.ts:24`, `en.ts:22` |
| 동작 | `router.push(user ? "/archive" : "/login")`, 인증 로딩 중 `disabled` | `Gnb.tsx:876-877` |

⚠ 이 CTA 는 라이트/다크 프레임이 갈린다 — `--glass-dropdown-frame` 은 헤더가
`[data-page-root]` 안이라도 `html[data-theme]` 스코프에 정의돼 있어 테마를 따른다
(라이트 `globals.css:594-599` / 다크 `:63-68`).

---

#### 6.2.8 햄버거 · 풀스크린 모바일 메뉴 (≤719px)

**햄버거 버튼** (`Gnb.tsx:251-285`)

| 항목 | 값 |
| --- | --- |
| 박스 | `w-19 h-19` = **38 × 38px**, `p-0`, `[border:0]`, `rounded-10`(=10px), 배경 투명 |
| 표시 | 기본 `display:none` → `@media(max-width:719px)` 에서 `inline-flex!` |
| 색 | 비-navBlack `#fafafa` / navBlack `#171b22` |
| 아이콘 박스 | `w-10 h-7` = **20 × 14px** |
| 막대 | `absolute left-0 w-full h-[1.5px] rounded-2`, `background: currentColor` |
| 막대 트랜지션 | `top 220ms ease, transform 220ms ease, opacity 160ms ease` |
| 닫힘 위치 | 1번 `top: 0` · 2번 `top: 6px` · 3번 `top: 12px` |
| 열림 | 1번 `top: 6px` + `rotate(45deg)` · 2번 `opacity: 0` · 3번 `top: 6px` + `rotate(-45deg)` |
| `aria-label` | `messages.nav.openMenu` 「메뉴 열기」/「Open menu」 ↔ `messages.nav.closeMenu` 「메뉴 닫기」/「Close menu」 (`ko.ts:25-26`, `en.ts:23-24`) |
| `aria-expanded` | `mobileOpen` (`Gnb.tsx:889`) |

**패널** (`Gnb.tsx:287-303`)

| 항목 | 라이트 | 다크 | 근거 |
| --- | --- | --- | --- |
| 컨테이너 | `fixed inset-0 z-[-1]`, `transition: opacity 220ms ease`; 닫힘 `opacity-0 pointer-events-none` / 열림 `opacity-100 pointer-events-auto` | 동일 | `Gnb.tsx:288-294` |
| 내부 | `h-full flex flex-col gap-1`(=**2px**), `overflow-y-auto`, `[border:none] [border-radius:0]` | 동일 | `Gnb.tsx:298-301` |
| 패딩 | `78px 18px calc(28px + env(safe-area-inset-bottom, 0px))` | 동일 | `Gnb.tsx:299` |
| 배경 | `var(--palette-gray-100)` = **#f1f1f3** | `var(--palette-gray-900)` = **#171b22** | `Gnb.tsx:302-303`, `globals.css:24`·`:37` |

**행** (`Gnb.tsx:305-334`) — 메뉴 3개 → 「리소스」 라벨 → 리소스 5개 → CTA 순.

| 항목 | 라이트 | 다크 |
| --- | --- | --- |
| 섹션 라벨 | `type-caption-12-medium`, 패딩 `6px 12px 2px`, 색 `rgb(0 0 0 / 0.45)` | 색 `rgb(250 250 250 / 0.45)` |
| 행 셸 | `type-body-20-medium`, `flex items-center`, 패딩 **`11px 12px`**, `rounded-12`, `transition: background-color 160ms ease, color 160ms ease` | 동일 |
| 기본 색 | `rgb(0 0 0 / 0.74)` | `rgb(250 250 250 / 0.74)` |
| hover | 배경 `rgb(0 0 0 / 0.05)`, 색 `#000000` | 배경 `rgb(250 250 250 / 0.08)`, 색 `#fafafa` |
| 활성 | 배경 `rgb(0 0 0 / 0.05)`, 색 `#000000` | 배경 `rgb(250 250 250 / 0.08)`, 색 `#fafafa` |
| 공개 예정 행 | `justify-between cursor-default` + 위 기본 색 그대로, 우측에 §6.2.6 칩 | 동일 |

**메뉴 안 CTA** — `w-full mt-auto` 만 얹은 **소재 그대로의 primary 버튼**이다(`Gnb.tsx:340`, `:993-1003`):
높이 `var(--button-height)` = **40px**, 좌우 패딩 **16px**, 곡률 12px, 배경
`var(--node-prompt-generate-gradient)` = `linear-gradient(90deg, #1491ff 0%, #0088ff 50%, #1491ff 100%)`
(`globals.css:513-518`, `:159`, `:179`), 글자 `--palette-gray-000` **#fafafa**, 글래스 베벨 이너섀도우 +
`::before` 오버레이(`Button.tsx:92-104`). 라벨·이동 대상은 상단 CTA 와 같고, 클릭 시 메뉴를 먼저 닫는다.

---

#### 6.2.9 인터랙션 · 수명주기 (한 곳에 모음)

| 트리거 | 동작 | 근거 |
| --- | --- | --- |
| `pathname` 변경 | 드롭다운·모바일 메뉴 동시에 닫힘 | `Gnb.tsx:484-487` |
| 바깥 `pointerdown` (모바일 메뉴 열림) | `wrapperRef` 밖이면 닫힘 | `Gnb.tsx:490-499` |
| `Escape` | 모바일 메뉴·드롭다운 각각 닫힘 | `Gnb.tsx:500-502`, `:536-538` |
| 바깥 `pointerdown` (드롭다운 열림) | 트리거·패널 둘 다 밖이면 닫힘 | `Gnb.tsx:526-535` |
| `html[data-theme]` 변경 | `MutationObserver` → `isDarkTheme` 갱신 | `Gnb.tsx:508-522` |
| Ctrl + wheel | 래퍼에서 `preventDefault` + `stopPropagation`(`passive:false`)으로 브라우저 핀치 줌 차단 | `Gnb.tsx:683-695` |
| 언마운트 | 호버 인텐트 타이머 정리 | `Gnb.tsx:541-547` |

---

#### 6.2.10 코드가 스스로 모순되는 지점 (승자를 고르지 않고 그대로 적는다)

1. **인페이지 앵커 경로가 통째로 죽어 있다.** `menuItems` 는 셋 다 `route: true` 이고 `sectionId`
   가 없다(`Gnb.tsx:462-467`). 그래서 활성 섹션 관찰자는 `sectionElements.length === 0` 로 즉시
   반환하고(`Gnb.tsx:563-565`), `rootMargin: "-36% 0px -63% 0px"`(`:594`)도 `aria-current="location"`
   분기(`:757`)도 실행되지 않는다. 타입 `MenuItem.sectionId` 와 그 주석(`:346-350`)만 남아 있다.
2. **「블로그」가 링크이자 공개 예정이다.** `communityItems` 의 블로그 항목은 `comingSoon: true` 라
   링크가 아닌데(`Gnb.tsx:406`), 같은 파일 주석은 "블로그(내부)"라 하고(`:402`) `isCommunityActive`
   는 `/blog`·`/blog/*` 를 활성으로 친다(`:428-429`). 실제 `/blog` 라우트도 존재한다
   (`components/landing/sections/BlogComingSoon.tsx:107`).
3. **드롭다운의 「비활성 55% 색」이 화면에 나타나지 않는다.** `COMMUNITY_ITEM_DISABLED_DROPDOWN` 은
   바깥 `<span>` 에 `[color:rgb(var(--palette-gray-1000-rgb)/0.55)]!` 를 건다(`Gnb.tsx:215-218`).
   그런데 그 안의 라벨 `<span>` 이 자기 `color`(`text-palette-gray-1000` = `#000000`)를 갖고
   (`Gnb.tsx:220`, `:813-817`), 칩도 자기 색을 가지므로 상속이 닿는 텍스트가 없다. 같은 항목이
   모바일 메뉴에서는 라벨을 직접 텍스트로 두어 0.74 알파가 실제로 적용된다(`Gnb.tsx:948-960`).
4. **`NAV_LIGHT` 의 램프 복구가 현재 소비처에서 전부 무효타다** — §6.2.3 마지막 인용 참조.
5. **주석과 실제 스코프가 어긋난다.** `NAV_LIGHT` 주석은 "랜딩 `main` 이 주 텍스트 토큰을 어둡게
   리매핑"이라 적었지만(`Gnb.tsx:84-85`), `[data-page-root]` 는 `--gray-000` 을
   `var(--palette-gray-000)`(밝은 값)로 세운다(`globals.css:1659`). 토큰을 어둡게 만드는 것은
   `html[data-theme="light"]`(`globals.css:719`) 쪽이고, 그 선언은 `data-page-root` 안에서는 지므로
   주석이 설명하는 상황 자체가 현재 트리에서 발생하지 않는다.
6. **`Gnb.tsx:52-58` 이 예고한 외부 훅은 이미 소멸했다.** 랜딩 셸에서 해시 클래스명을 부분
   문자열로 잡던 규칙은 `app/globals.css` 에 남아 있지 않다(`navBlack` 문자열 검색 0건). 계산값은
   `NAV_LIGHT` 로 옮겨져 동일하다.

---

#### 6.2.11 정본 판정이 필요한 것 (문서가 답하지 못하는 부분)

§10.2 · §10.3 · §10.4 는 모두 「§6.2 를 위임처로 쓰지 말 것」을 명시하고 GNB 를 자체 기술했고,
§10.5 는 그 때문에 **위임할 대상이 없다**고 적었다. 위 §6.2.1~§6.2.10 은 그 세 건의 불일치를
코드 기준으로 정정하고 빠진 값을 채운 것이지만, **「§6.2 를 코드에 맞춘다」인지 「§6.2 가 목표
사양이고 코드가 부채」인지는 저장소 어디에도 확정돼 있지 않다.** 그 판정이 나오기 전까지는
`DESIGN_SYSTEM.md:44`(`/`) · `:81`(`/pricing`) 의 라우트 커버리지 수준을 올릴 수 없다.

### 6.3 GNB (App) — 좌측 사이드바

앱 내비게이션은 **상단 바가 아니라 좌측 사이드바**다. 거의 모든 앱 화면(§10)이 이 부품을 공유하므로,
페이지 절들은 사이드바 내부를 **이 절에 위임**한다. 원천은 `components/navigation/Gnb.tsx` 이고
폭·여백 토큰은 `app/globals.css` 다.

> **먼저 읽을 것 — 베이스 정의를 그대로 읽으면 틀린다.** `menuLink` 의 베이스는 상단 바용
> **28px 알약**(`border-radius:999px` · `padding:0 12px` · body-16 regular)이다. 그런데
> `.gnb-menuSidebar &` 오버라이드가 이를 **32px · 곡률 10px · body-14 medium · 좌우 패딩 4px** 로
> 전부 덮는다. 사이드바에 알약은 없다. 같은 함정이 활성 배경에도 있다(아래 상태 표).

#### 기하

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 컨테이너 `.gnb-wrapper` 베이스 | `position:fixed; top:0; left:0; z-index:1001; padding:12px 24px; background:transparent` | `Gnb.tsx:1946-1954` |
| 사이드바 변형이 덮는 것 | `left:0; right:auto; width:var(--app-gnb-sidebar-width); max-width:100%; height:100dvh; box-sizing:border-box; display:flex; flex-direction:column; padding-top:var(--app-gnb-safe-top); padding-inline:var(--app-gnb-sidebar-padding-x)(=12px); transition:width 320ms cubic-bezier(0.4,0,0.2,1); transform-origin:left center` | `Gnb.tsx:1955-1972` |
| 펼침 폭 | `min(280px, calc(100vw - 120px))` → `--app-shell-min-width:960px` 이므로 데스크톱에서 **항상 280px** | `globals.css:120-143` |
| 히트 폭 `--app-gnb-sidebar-menu-hit-w` | `calc((16px - 12px) + 20px + 8px)` = **32px** | `globals.css:132-134` |
| 접힘 폭 | `calc(2 * 12px + 32px)` = **56px** | `globals.css:407-411` |
| ≤719px | `--app-gnb-sidebar-width: 0px` — 오프캔버스 드로어가 된다 | `globals.css:413-427` |
| 로고 행 `sidebarHeaderRow` | `min-height:40px; gap:8px; flex-shrink:0`. 펼침에서만 `padding-left:calc(16px − 12px)`=**4px**, `transition:padding-left 320ms` | `Gnb.tsx:1770-1786` |
| 메뉴 트랙 `menuSidebarOuter` | `margin-top:var(--app-gnb-rail-below-chrome-gap)`=**12px** — 본문 카드 윗선과 첫 메뉴가 같은 선에 온다 | `Gnb.tsx:764-776` |
| `ul.gnb-menu.gnb-menuSidebar` | `flex-direction:column; align-items:stretch; width:100%; **gap:4px**; position:relative; z-index:1` | `Gnb.tsx:633-660` |

**배경색 선언이 없다.** 데스크톱에서 사이드바는 페이지 배경 위에 그대로 얹힌다 — 면이 따로 없다.
(≤719px 드로어에서만 배경을 잡는다.) 카드처럼 그리면 틀린다.

#### 항목 렌더 순서 (로그인 사용자)

위에서 아래로. ①은 내비가 아니라 버튼이라 **활성 인디케이터 대상이 아니다.**

| # | 항목 | 경로 | 아이콘 | 비고 |
| --- | --- | --- | --- | --- |
| ① | 검색 `appNav.search` 「검색」/「Search」 | — | `/icons/MagnifyingGlass.svg` | CommandPalette 를 연다 |
| ② | 홈 `appNav.archive` 「홈」/「Home」 | `/archive` | `/icons/House.svg` | **라우트명은 archive 인데 라벨은 「홈」이다** |
| ③ | 노드 캔버스 「노드 캔버스」/「NodeCanvas」 | `/nodecanvas` | `/icons/Graph.svg` | 「+」 복합 행 |
| ④ | 비디오 에디터 「비디오 에디터」/「VideoEditor」 | `/videoeditor` | `/icons/MagicWand.svg` | 「+」 복합 행 |
| ⑤ | 하이라이트 「하이라이트」/「Highlight」 | `/highlight` | `/highlight_symbol.svg` | 베타 칩 |
| ⑥ | eyebrow 「분석」/「Analytics」 | — | — | 라벨 행 |
| ⑦ | YouTube 분석 | `/analytics/youtube` | `/icons/youtube.svg` | |

근거: `Gnb.tsx:2069-2091, 4556-4610` · `lib/app-paths.ts:37` · `messages/ko.ts:1208-1252` · `en.ts:1221-1265`.

- **`/analytics/instagram` 은 렌더되지 않는다** — `INSTAGRAM_ANALYTICS_HIDDEN = true` (`app-paths.ts:37`).
  라우트는 존재하지만 사이드바에 진입점이 없다.
- **「업데이트 예정」 칩은 없다** — `VIDEO_EDIT_NAV_DISABLED = false` (`Gnb.tsx:2277`).
- 하단 알약은 `sidebarHomeHref` 를 넘기지 않는 화면에서 **업그레이드 버튼**이 된다(`Gnb.tsx:5007-5090`).

#### 하단 알약 (업그레이드 CTA)

**세 번 연속 「문서에 없다」로 잡힌 자리다**(§10.7 · §10.8 · §10.12). 사이드바를 쓰는 화면이면
거의 전부 보이므로 여기 한 번만 적고 페이지 절은 이 절을 가리킨다.

**언제 보이는가** — `showAppUpgradeCta`(`Gnb.tsx:2417-2421`):

```
isLandingDemo ? true : normalizeUpgradePlanCode(billing?.current_plan_code) !== "max"
```

즉 **max 플랜이 아닌 모든 사용자에게 보이고, max 플랜에서는 요소 자체가 DOM 에 없다**
(`Gnb.tsx:5092` 가 `: null`). 앞선 분기 `useSidebarNav && sidebarHomeHref` 가 참이면 그쪽이
「홈」 버튼을 렌더하므로, 이 알약은 **`sidebarHomeHref` 를 넘기지 않는 화면**에서만 나온다.
`embedded || onNavigate` 이면 `<button>`, 아니면 `<Link>` 다(`Gnb.tsx:5041-5089`).

| 부품 | 값 | 근거 |
| --- | --- | --- |
| 래퍼 `sidebarUpgradeWrap` | `margin-top:auto`(바닥으로 밀림) · `flex-shrink:0` · `width:100%` · `padding-bottom:env(safe-area-inset-bottom, 0)` | `Gnb.tsx:1937-1944` |
| ↳ 접힘 | `width:fit-content` · `max-width:100%` | `Gnb.tsx:1937-1938` |
| 버튼 `sidebarUpgradeButton` | `position:relative` · `inline-flex` 중앙정렬 · `gap:8px` · `width:100%` · `box-sizing:border-box` · **`min-height:40px`** · **`padding:10px 14px`** · `border:0` · **`border-radius:12px`** · `text-align:center` · `cursor:pointer` · `font-family:inherit` · `font-weight:var(--type-weight-medium)` | `Gnb.tsx:1854-1875` |
| 전환 | `width` · `min-width` · `max-width` · `min-height` · `height` · `padding` · `gap` = 320ms `cubic-bezier(0.4,0,0.2,1)`, `background`·`color` = 160ms ease | `Gnb.tsx:1875` |
| 접힘 버튼 | `width:fit-content` · `min-height/height:32px` · `padding:0 10px` · `gap:0` · `justify-content:center` | `Gnb.tsx:1876-1885` |
| 접힘 라벨 | `max-width:4.5rem` = **54px**(§3 `1rem = 12px`, 브라우저 실측) · `margin/padding:0` · `text-overflow:ellipsis` · caption-12 토큰 3종 | `Gnb.tsx:1911-1925` |

문구는 `messages.appNav.upgrade` — ko 「업그레이드」 / en "Upgrade". 목적지 `/mypage/upgrade`.
`resolvedPath.startsWith("/mypage/upgrade")` 일 때만 `gnb-sidebarUpgradeButtonActive` 와
`aria-current="page"` 가 붙는다(`Gnb.tsx:5043-5051`).

> **⚠ 베이스 정의(민트)는 화면에 나오지 않는다.** 클래스 자체는
> `background: rgb(var(--accent-mint-500-rgb)/16%)` · `color: var(--accent-mint-700)` 로 시작하지만,
> `sidebarUpgradeButtonActive` 안의 `.gnb-sidebarUpgradeButton:not(&)` 규칙이 이를 덮는다.
> Tailwind 는 소스 스캔으로 CSS 를 내보내므로 그 규칙은 **항상 존재**하고 선택자가 길어 이긴다.
>
> | 상태 | light (앱 셸) | dark |
> | --- | --- | --- |
> | 기본 배경 | `var(--palette-gray-900)` → `#171b22` | `var(--palette-gray-100)` → `#f1f1f3` |
> | 기본 글자 | `var(--palette-gray-100)` → `#f8f8f9` | `var(--palette-gray-900)` → `#171b22` |
> | hover 배경 | `var(--palette-gray-800)` → `#313640` | `var(--palette-gray-200)` → `#e3e4e8` |
>
> **즉 라이트에서 검정 알약, 다크에서 흰 알약이다.** 민트로 그리면 틀린다.
> 활성(`/mypage/upgrade` 에 있을 때)만 별도 값을 쓴다 — `Gnb.tsx:1886-1910`.

#### 항목 해부

| 부품 | 값 | 근거 |
| --- | --- | --- |
| `menuLink` (사이드바) | `height/min-height:32px; padding-left:calc(16px−12px)=4px; padding-right:4px; border-radius:10px; width:100%; box-sizing:border-box; justify-content:flex-start; align-items:center` · 타이포 **body-14 medium** · `transition:color/background-color/box-shadow 200ms ease` | `Gnb.tsx:456-491` |
| `menuLinkInner` | `inline-flex; align-items:center; **gap:10px**; transition:gap 320ms cubic-bezier(0.4,0,0.2,1)`; 사이드바에서 `width:100%; min-width:0` | `Gnb.tsx:582-596` |
| `menuLinkIconMask` | **20×20px**; `flex-shrink:0`; `background-color:currentColor`; **`opacity:0.92`** (활성 항목에서 `1`); `mask-image:var(--nav-icon-mask)`; `mask-repeat:no-repeat; mask-position:center; mask-size:contain` (+`-webkit-`) | `Gnb.tsx:564-581` |
| `menuLinkLabel` | `min-width:0; max-width:220px; overflow:hidden; white-space:nowrap; transition:max-width/margin 320ms cubic-bezier(0.4,0,0.2,1)` | `Gnb.tsx:597-616` |
| 베타 칩 `exploreSoonChip` | `type-caption-12-medium`; `padding:3px 8px`; `border-radius:6px`; 라이트 `color:var(--palette-gray-600)` · `background:rgb(var(--palette-gray-500-rgb)/14%)`; 다크 `color:var(--palette-gray-400)` · `background:rgb(var(--gray-000-rgb)/14%)`. 사이드바에서 `margin-left:auto`, 접힘에서 `display:none`. 문구 `appNav.beta` 「베타」/「BETA」 | `Gnb.tsx:178-190, 4790-4802` |

#### 브랜드 로고 락업 (사이드바 최상단)

`sidebarHeaderRow > sidebarLogoHit > sidebarLogoRail > sidebarBrandCrop > BrandLogo`
(`Gnb.tsx:4377-4422`).

| 부품 | 값 | 근거 |
| --- | --- | --- |
| `sidebarLogoHit` | `embedded \|\| onNavigate` 이면 `<button>`. `width:100%; min-height:40px; display:flex; align-items:center; justify-content:flex-start; border/padding/margin:0; background:transparent; color/font:inherit; transform-origin:left center; user-select:none`. 클릭 시 `navigate(APP_HOME_PATH)` = `/archive` | `Gnb.tsx:1787-1818` · `lib/app-paths.ts:9` |
| 로고 치수 | 높이 **28px**(`SIDEBAR_LOGO_H`), 워드마크 폭 `round(28 × 291 / 85)` = **96px** | `Gnb.tsx:2250` · `components/ui/brandLogoMetrics.ts:1-12` |
| 자산 | `/klipse-light.svg` 와 `/klipse-dark.svg` 를 **둘 다 렌더**하고 `opacity`·`visibility`·`pointer-events` 로 스왑한다. 하나만 그리면 테마 전환이 안 된다 | `components/ui/BrandLogo.tsx:79-105` |
| `.gnb-logo` | `height:28px; width:auto; display:block` | `Gnb.tsx:262-270` |
| 접힘 | `sidebarBrandCrop` `width:var(--app-gnb-sidebar-logo-cube-px)`(=`calc(28px*72/85)` ≈ **23.72px**) + `overflow:hidden` · `sidebarLogoRail` `width:28px`, `justify-content:center`, `transform:translateX(calc((32px − 28px)/2))` = **2px** · `sidebarLogoHit` `width/min-width:32px` | `Gnb.tsx:1755-1769, 1819-1838` |

전환은 전부 `320ms cubic-bezier(0.4,0,0.2,1)`, `prefers-reduced-motion` 에서 `0.01ms!`.

#### 「+」 복합 행 — 노드 캔버스 · 비디오 에디터

**이 두 행은 단순 링크가 아니라 좌우 2분할이다.** 왼쪽이 내비, 오른쪽이 24×24 「+」 버튼이다.

| 부품 | 값 | 근거 |
| --- | --- | --- |
| 행 컨테이너 `menuSidebarCreateCompound` | `.gnb-menuSidebar .gnb-menuLink&` 스코프에서 `display:flex; flex-direction:row; align-items:center; gap:4px; cursor:default` | `Gnb.tsx:708-715` |
| 내비 파트 `menuSidebarCreateNavPart` | `flex:1; min-width:0; height:100%; margin/padding:0; border:0; background:transparent; border-radius:0; font/color:inherit; text-align:left` · `:focus-visible { outline:none }`(의도적 제거) · 접힘에서 `justify-content:center` | `Gnb.tsx:717-736` |
| 「+」 `menuSidebarCreateAddonInset` | **24×24** · `border-radius:6px` · `border:0` · `padding/margin:0` · `font-size:calc(var(--type-body-14-size) + 3px)` · `line-height:1` · `font-weight:var(--type-weight-semibold)` · `color:inherit` · `transition:background 160ms ease` · **접힘에서 `display:none!`** | `Gnb.tsx:683-707` |
| 글리프 `NavPlusGlyph` | 인라인 SVG **20×20**, `viewBox="0 0 32 32"`, `M16 9V23` + `M9 16H23`, `stroke=currentColor`, `stroke-width=2.4`, `stroke-linecap=round`, `aria-hidden` | `Gnb.tsx:2126-2150` |

| 「+」 배경 | light (앱 셸) | dark |
| --- | --- | --- |
| 기본 | `var(--palette-gray-200)` → `#eeeef1` | `var(--palette-gray-700)` → `#575d68` |
| hover | `var(--palette-gray-300)` → `#e4e5e9` | `var(--palette-gray-600)` → `#777d89` |

라이트 값은 **§4.0.1 앱 셸 램프 기준**이다(전역 램프로 읽으면 두 단계 어긋난다).

**동작이 서로 다르다.**

- 노드 캔버스 「+」 (`Gnb.tsx:4675-4690`) — `event.stopPropagation()` 후
  `openCreateProjectModal(event.currentTarget)`. **`CreateProjectModal` 의 네 번째 트리거이며,
  모달의 모션 원점이 이 24×24 버튼의 rect 다.** 라벨 `messages.appNav.createNewCanvasProject`.
- 비디오 에디터 「+」 (`Gnb.tsx:4739-4757`) — `void createVideoEditProject()`.
  **모달이 없다.** POST 후 곧바로 이동한다. 라벨 `messages.appNav.createNewVideoEditProject`.

#### 「분석」 eyebrow 행

| 부품 | 값 | 근거 |
| --- | --- | --- |
| `menuSidebarEyebrowRow` | `<li role="presentation">` · `list-style:none` · `margin:0` · **`padding:12px 0 4px`** · `width:100%` · 접힘에서 `display:none`(단 ≤719px 에서는 `display:block`) | `Gnb.tsx:744-752` |
| `menuSidebarEyebrow` | `<span class="type-caption-12-medium">` · `display:block` · `padding-left:calc(16px − 12px)` = **4px**(로고·메뉴 아이콘과 같은 시작선) | `Gnb.tsx:737-743` |
| 색 | light `var(--palette-gray-600)` → 앱 셸 **#9aa0ab** · dark `var(--palette-gray-400)` → **#bcc0c9** | `Gnb.tsx:737-743` |

문구는 `messages.appNav.analyticsEyebrow` (`Gnb.tsx:4610`).

#### 상태 — 해결된 최종값

**활성 항목의 배경은 라이트·다크 모두 `transparent` 다.** 배경처럼 보이는 것은 슬라이딩 인디케이터가
그린다. 일반(비사이드바) 활성값은 라이트 `--palette-gray-300`(#d5d7dd) · 다크 `--palette-gray-800`(#313640)
인데, `.gnb-menuSidebar &` 가 두 테마 모두 `transparent` + `box-shadow:none` 으로 되돌린다.
**일반 활성값을 사이드바에 그리면 틀린다.** (`.gnb-customSidebarMenu` 는 반대로 솔리드 값을 되살린다.)

| 상태 | 속성 | light | dark |
| --- | --- | --- | --- |
| 비활성 | `color: var(--gray-300)` | `#575d68` | `#d5d7dd` |
| 비활성 hover | `color: var(--gray-200)` | `#313640` | `#e3e4e8` |
| 비활성 hover | `background-color` | `rgb(213 215 221 / 50%)` | `rgb(250 250 250 / 10%)` |
| 활성 (hover 포함) | `color: var(--gray-000)` | `#000000` | `#fafafa` |
| 활성 (hover 포함) | `background-color` | `transparent` | `transparent` |

근거: `Gnb.tsx:511-540`. 다크 비활성 hover 는 `box-shadow:none` 을 함께 건다.

#### 접힘 (collapsed)

루트에 `data-app-gnb-sidebar-collapsed="true"` 가 붙는다. 상태는
`localStorage["klipse-app-gnb-sidebar-collapsed"]`(`"1"`/`"0"`)에 저장되고 마운트 시 복원된다.
`/videoeditor/[id]` 진입 시 자동으로 접히고 이탈 시 복원된다. **≤719px 에서는 이 속성을 붙이지 않는다**
— 드로어는 항상 펼침 레이아웃이다. (`Gnb.tsx:3707-3784, 2269`)

| 부품 | 접힘에서 |
| --- | --- |
| `menuLink` | `width/min-width/max-width:32px; height/min-height:32px; padding-inline:0; justify-content:center` |
| `menuLinkInner` | `justify-content:center; width:auto; flex:none; **gap:0**; transition:none` |
| `menuLinkLabel` | `max-width:0; margin:0; padding:0; overflow:hidden; pointer-events:none; border:0; transition:none` |
| eyebrow 행 · 베타 칩 | `display:none` |
| `ul` · `li` | `width:fit-content` |

근거: `Gnb.tsx:496-504, 591-595, 608-615`.

**접힘일 때만 툴팁이 뜬다.** 모든 항목이 `<ChromeTooltip placement="right" suppress={!sidebarCollapsed}>`
로 감싸여 있다. 버블은 `document.body` 로 portal, `position:fixed`, **`z-index:10400`**,
`max-width:min(320px, calc(100vw − 20px))`, 트리거와 간격 `GAP_SIDE = 8px`, `transform:translate(0,-50%)`,
`transform-origin:left`. 표면은 전역 `.app-tooltip-chrome` — `border-radius:8px`, `padding:4px 8px`,
caption-12 regular, `border:1px solid var(--app-tooltip-border)`.
**툴팁 면은 본문과 반전된다:** 배경 라이트 `#313640` / 다크 `#e3e4e8`, 글자 라이트 `#fafafa` / 다크 `#171b22`.
근거: `ChromeTooltip.tsx:16-90` · `Gnb.tsx:753-763` · `globals.css:379-394`.

#### 사이드바 토글 버튼 (상단 바 좌측)

`32×32px`; `padding:0`; `border:none`; `border-radius:var(--button-radius)`=**12px**;
`inline-flex` 중앙정렬; `background:transparent`; `box-shadow:none`; `backdrop-filter:none`;
`transition:color/background-color/box-shadow 200ms ease`. (`Gnb.tsx:350-383`)

| 상태 | light | dark |
| --- | --- | --- |
| 기본 `color` | `rgb(0 0 0 / 65%)` | `rgb(250 250 250 / 70%)` |
| hover `color` | `rgb(0 0 0 / 90%)` | `rgb(250 250 250 / 92%)` |
| hover `background` | `rgb(0 0 0 / 12%)` | **`var(--gray-700)` (솔리드)** |
| hover `box-shadow` | `var(--glass-bevel-highlight) rgb(var(--glass-inner-shadow-rgb)/25%), var(--glass-bevel-shade) …/25%` | 동일 |

**포커스 링이 있다** — `:focus-visible` 에서 `outline:2px solid rgb(var(--gray-000-rgb)/35%)`,
`outline-offset:2px`, 다크에서 `outline-color:rgb(var(--gray-000-rgb)/45%)` (`Gnb.tsx:374-375, 382`).

아이콘은 `20×20` 뷰포트에 `viewBox="0 0 32 32"`, `stroke-width = (1.5 × 32) / 20 = 2.4`,
`stroke-linecap/linejoin:round`, svg `opacity:0.92`. 세로선 + 라운드 사각 패널 두 도형이고,
세로선만 `mainChromeSidebarToggleLineShift` 로 감싸여 이동한다. (`Gnb.tsx:384-397, 5244-5269`)

#### 프로필은 사이드바에 없다

`Gnb` 의 `profileOnly` 분기를 `components/scenes/create/ProjectHeader.tsx` 가 `PROFILE_SLOT` 으로 심는다 —
아바타 24px, 팝오버는 viewport 고정 `top:12px; right:12px; width:240px` (**6.4절**).

> **삭제된 사양 (2026-08 확인):** 이 절에는 상단 바 메뉴(`Archive`/`Create`/`Dashboard`)와
> **Token Gauge**(`64x28`, 여유/보통/부족 3색, `TOKEN_CAPACITY = 1500`)가 적혀 있었다.
> 둘 다 제품에서 사라졌다 — 코드 전체에 `gauge` 는 한 건도 없고 `TOKEN_CAPACITY` 도 존재하지 않는다.
> 문서만 남아 있었고, 그걸 근거로 Figma 에까지 옮겨 그렸다가 걷어냈다.

### 6.4 Profile Popover (App)

- 위치: viewport 우상단 기준 `12px, 12px`
- 반경: `24px`
- 배경: `gray-900 / 70%`
- Blur: `40px`
- Drop shadow: `0 12px 24px rgba(0,0,0,0.12)`
- Inset shadow: **6.1** 글래스 이너 섀도우 조합(`--glass-bevel-highlight` + `--glass-bevel-shade`)과 동일 2개
- 닫기 방식: 외부 클릭, `Esc`, 닫기 버튼


#### 6.4 보강 — 셸 실측값 · 마운트 3곳 · 모션 (재구현 정본)

원천은 전부 `apps/web/components/navigation/Gnb.tsx` 의 `gnbStyles.profilePopover*` 계열이다
(`profilePopover` `:1264-1296` · `profilePopoverOpen` `:1353-1361` · `profilePopoverEmbedded` `:1346-1352` ·
`profilePopoverContent` `:1337-1345`). 아래 값은 모두 arbitrary 리터럴이라 **적힌 px 가 곧 결과**다
(Tailwind 2px 스케일이 아니다).

##### ⚠ 위 6줄 중 5개가 코드와 다르다 — 재구현 시 이 표를 따른다

| 위에 적힌 것 | 실제 | 근거 |
| --- | --- | --- |
| 반경 `24px` | `border-radius: var(--dropdown-radius)` = **16px** | `Gnb.tsx:1272` → `globals.css:84` |
| 배경 `gray-900 / 70%` | `background: var(--dropdown-surface-bg)` — **완전 불투명**. 다크 `rgb(49 54 64)` = **`#313640`**, 라이트 아래 표 참조 | `Gnb.tsx:1273` → `globals.css:101, 50, 36` |
| Drop shadow `0 12px 24px rgba(0,0,0,0.12)` | `box-shadow: var(--dropdown-ambient-shadow), var(--glass-dropdown-frame)`. 앰비언트는 **`0px 8px 15px 0px rgba(0,0,0,0.04)`** | `Gnb.tsx:1274` → `globals.css:81` |
| Inset shadow = 6.1 베벨 2줄(`--glass-bevel-highlight` + `--glass-bevel-shade`) | **베벨 토큰을 안 쓴다.** 실제로는 `--glass-dropdown-frame` **5줄**(외곽 링 1 + 좌우 엣지 2 + 상하 흰 림 inset 2) | `globals.css:63-68`(다크) / `:594-599`(라이트) |
| 닫기 방식에 “닫기 버튼” | **팝오버 안에 닫기 버튼이 없다.** `profilePopoverClose`(`:1297-1312`)·`profilePopoverCloseIcon`(`:1313-1336`)는 **모바일 내비 오버레이**(`:5386-5392`)에서만 렌더된다 | `Gnb.tsx:5386-5392` |

Blur `40px` 만 맞다 — 단 CSS 가 아니라 **세 마운트 지점 모두 인라인 `style` 로 주입**한다
(`backdropFilter` + `WebkitBackdropFilter`, `Gnb.tsx:4025-4026` · `:5165-5166` · `:5361-5362`).

##### 셸 확정값

| 속성 | 값 | 근거 |
| --- | --- | --- |
| `width` | `240px` (`box-sizing:border-box`, `globals.css:1002-1004`) | `Gnb.tsx:1269` |
| `padding` | `var(--dropdown-padding)` = **6px** ⇒ 내용 폭 **228px** | `Gnb.tsx:1271` → `globals.css:85` |
| `overflow` | `hidden` | `Gnb.tsx:1270` |
| `z-index` | `1100` | `Gnb.tsx:1275` |
| `transform-origin` | `top right` (임베디드에서 동일값 재선언) | `Gnb.tsx:1279`, `:1351` |
| 닫힘 시 `pointer-events` | `[&:not(.gnb-profilePopoverOpen)]:pointer-events:none` — **선택자로 가드**되어 있다 | `Gnb.tsx:1276` |
| 내용 래퍼 | `position:relative · z-index:1 · display:flex · flex-direction:column · gap:0 · opacity:1` | `Gnb.tsx:1337-1345` |

##### 표면색 — 라이트가 두 값이다

라이트 회색 램프 재매핑은 `html[data-theme=light] body:has(.gnb-wrapperSidebar)` 로 **`body` 에** 얹힌다
(`Gnb.tsx:1972-2000`). 팝오버는 `document.body` 로 포털되어도 그 `body` 의 자식이므로 **상속받는다.**
따라서 **문서 안에 앱 셸 사이드바(`.gnb-wrapperSidebar`, `Gnb.tsx:1957`)가 있는지**로 갈린다.

| | 다크 | 라이트 (앱 셸 = 사이드바 있음) | 라이트 (전역 램프 = 사이드바 없음) |
| --- | --- | --- | --- |
| 표면 `--dropdown-surface-bg` | **`#313640`** (`globals.css:101`→`:50`→`:36`) | **`#f8f8f9`** (`Gnb.tsx:1979`·`:2000`) | **`#f1f1f3`** (`globals.css:600`→`:42`→`:24`) |
| 구분선 `--profile-line-color` | `var(--palette-gray-700)` = **`#575d68`** (`Gnb.tsx:1286`→`globals.css:34`) | `var(--palette-gray-200)` = **`#eeeef1`** (`Gnb.tsx:1293`→`Gnb.tsx:1974`) | `var(--palette-gray-200)` = **`#e3e4e8`** (`globals.css:28`) |
| `--gray-000-rgb` (아래 알파 계열의 기준색) | `250 250 250` (`globals.css:677`→`:40`) | `0 0 0` (`globals.css:731`→`:52`) | 동일 `0 0 0` |

##### 팝오버가 자기 스코프에 까는 로컬 변수

다크는 `Gnb.tsx:1281-1286`, 라이트 재선언은 `[html[data-theme=light] &]` 로 `Gnb.tsx:1288-1293`.
알파 기준색은 위 표의 `--gray-000-rgb` 다.

| 변수 | 다크 | 라이트 | 근거 |
| --- | --- | --- | --- |
| `--profile-muted-color` | `rgb(250 250 250 / 60%)` | `rgb(0 0 0 / 68%)` | `:1281` / `:1288` |
| `--profile-subtle-color` | `rgb(250 250 250 / 45%)` | `rgb(0 0 0 / 56%)` | `:1282` / `:1289` |
| `--profile-soft-color` | `rgb(250 250 250 / 55%)` | `rgb(0 0 0 / 62%)` | `:1283` / `:1290` |
| `--profile-chip-bg` | `rgb(250 250 250 / 8%)` | `rgb(0 0 0 / 6%)` | `:1284` / `:1291` |
| `--profile-chip-bg-strong` | `rgb(250 250 250 / 12%)` | `rgb(0 0 0 / 10%)` | `:1285` / `:1292` |

라이트 분기는 `box-shadow` 를 **같은 값으로 한 번 더 선언**한다(`Gnb.tsx:1287`) — 토큰이 테마별로
갈리므로 실효는 없고, 죽은 선언이다.

##### 마운트 3곳 · 위치 2종

`isMounted` 게이트(`Gnb.tsx:2491`) 때문에 **SSR HTML 에는 팝오버가 없다** — 첫 클라이언트 렌더에서
닫힌 상태로 붙는다.

| # | 어디 | 위치 | 근거 |
| --- | --- | --- | --- |
| ① | `profileOnly` 분기(노드 캔버스 `ProjectHeader` 가 쓰는 경로) | `document.body` 포털, **트리거 기준 인라인 좌표** | `Gnb.tsx:3976`, `:4012-4041` |
| ② | 일반 앱 GNB | `document.body` 포털, **트리거 기준 인라인 좌표** | `Gnb.tsx:5348-5379` |
| ③ | `embedded`(랜딩 데모) | 포털 없음. `profilePopoverEmbedded` = `position:absolute · top:calc(100% + 8px) · right:0` | `Gnb.tsx:5154-5174`, `:1346-1352` |

①② 의 좌표는 `useLayoutEffect`(`Gnb.tsx:3865-3876`)가 트리거의 `getBoundingClientRect()` 로
`top = rect.bottom + 8` · `right = window.innerWidth - rect.right` 를 계산해 **인라인 style 로** 넣는다.
클래스의 `position:fixed`(`:1266`) · `top:12px`(`:1267`) · `right:12px`(`:1268`)는 **인라인 좌표가 아직
없을 때만** 보이는 폴백이다 — `useEffect` 가 아니라 `useLayoutEffect` 인 이유가 “첫 프레임이 12px,12px
에 그려졌다가 버튼 아래로 튀는 것”을 막기 위해서라고 주석에 적혀 있다(`:3863-3864`).
③ 은 클래스 `top:calc(100% + 8px)` 가 `top:12px` 를 이긴다(빌드 산출물
`apps/web/.next/static/css/1a8a23c6f8ae981e.css`, 2026-08-04 11:45 기준 오프셋 3933 < 4156).
`right` 와 `position` 은 `&:not(.gnb-profilePopoverEmbedded)` 로 선택자 가드가 걸려 있으나
**`top` 만 가드가 빠져 있어 출력 순서에 의존한다** — 코드 자체의 비일관이다.

`portalPopoverPos`(`Gnb.tsx:2494-2497`)는 **닫을 때 `null` 로 되돌리지 않는다.** 한 번 연 뒤에는 마지막
좌표가 남아 있고, 다음 열림에서 `useLayoutEffect` 가 덮어쓴다.

##### 열림·닫힘 모션 (§6.5 가 “6.4 와 같은 계열”이라고 참조하는 그것)

| 상태 | `opacity` | `transform` | `pointer-events` | 전환 |
| --- | --- | --- | --- | --- |
| 닫힘 (`profilePopover`) | `0` | `scale(0.92)` | `none` | `opacity 130ms var(--ease-out-strong), transform 130ms var(--ease-out-strong)` |
| 열림 (`+ profilePopoverOpen`) | `1` | `scale(1)` | `auto` | `opacity 200ms var(--ease-out-strong), transform 260ms var(--ease-out-strong)` |

`--ease-out-strong` = `cubic-bezier(0.32, 0.72, 0, 1)` (`globals.css:17`).
근거: 닫힘 `Gnb.tsx:1277-1280`, 열림 `Gnb.tsx:1355-1358`.
열림은 **비대칭** — opacity 를 200ms 로 먼저 끝내고 scale 이 260ms 에 안착한다. 닫힘은 둘 다 130ms.

`prefers-reduced-motion: reduce` 에서 두 클래스 모두 `transform: none !important` +
`transition: opacity 120ms ease !important` (`Gnb.tsx:1294-1295`, `:1359-1360`).

> **주의 — 상태 전환이 CSS 출력 순서에 의존한다.** `opacity` · `transform` · `transition` 세 쌍은
> 선택자 가드 없이 같은 특이성의 arbitrary 유틸리티로 겹친다(`pointer-events` 만 `:not()` 가드가 있다).
> 빌드 산출물(`apps/web/.next/static/css/1a8a23c6f8ae981e.css`, 2026-08-04 11:45)에서 열림 쪽이 뒤에
> 나와 이긴다 — `opacity:0` 196235 < `opacity:1` 196299 · `scale(0.92)` 56143 < `scale(1)` 56585 ·
> `transition:opacity_130ms…` 322414 < `transition:opacity_200ms…` 324737. 의도대로 동작하지만
> **순서가 뒤집히면 게이트 없이 깨진다.**

##### 닫히는 경로는 넷

ⓐ 팝오버 패널·트리거 **밖** `pointerdown` (`Gnb.tsx:3896-3931`, 포함 여부 검사 `:3906-3913`) ·
ⓑ `Escape` keydown (`:3918-3922`) · ⓒ 팝오버 항목 클릭 · ⓓ `resolvedPath` 변경 (`:3858-3861`).
**트리거 재클릭은 닫기 경로가 아니다** — 열림 상태에서 `gnb-rightControlsOpen`
(= `pointer-events:none`, `Gnb.tsx:1752-1754`)이 트리거에 붙는다.

##### 접근성 · 문구

`id="profile-popover"` · `role="dialog"` · `aria-label="Profile details"` · `aria-hidden={!isProfileOpen}`
— 세 마운트 지점 모두 동일(`Gnb.tsx:4014-4023` · `:5155-5164` · `:5350-5359`).
**`aria-label` 은 영어 리터럴 하드코딩이고 `messages.ts` 를 거치지 않는다.** 셸 자체에는 사용자
노출 문구가 없다.

##### 내용물은 이 절이 아니다

팝오버 안쪽(계정 행 · 크레딧 카드 · 메뉴 행 · 구분선 · 로그아웃)은 `renderPopoverMenuContent()`
(`Gnb.tsx:2997-3432`) 한 함수가 전부 만들며, **`design/pages/10.7.md` 의 「프로필 팝오버 안쪽」
절이 정본**이다. 구분선 `profileMenuDivider`(`Gnb.tsx:1033-1038`)만 셸 성격이라 여기 적는다 —
`height:1px · margin:4px 10px · background: var(--profile-line-color)` ⇒ 내용 폭 228px 중 **208px** 만
그어진다.

### 6.5 Dropdown / Menu (App — 노드 캔버스 패턴)

노드 캔버스에서 쓰는 **작은 드롭다운 패널**과 **열림·닫힘 모션**의 기준이다. 동일 토큰을 **대시보드 플랫폼 툴바 “더보기”(계정 전환·연동 해제)** 등에서 재사용한다.

**원천 파일 (`apps/web`):**

| 역할                                                       | 파일                                                                                         |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 패널·행 스타일                                             | `components/scenes/create/node-canvas-v2/nodes/EditNode.tsx` 의 `SIDE_MENU_*` 상수           |
| opacity + scale 모션, `transform-origin`, 뷰포트 보정 래퍼 | `components/scenes/create/node-canvas-v2/components/MetaDropdownPanel.tsx` 의 `MOTION*` 상수 |
| 캔버스에서 조합 + 줌 보정                                  | `…/components/MetaDropdownPanel.tsx`                                                         |
| 대시보드(줌 없음) 재사용                                   | `components/scenes/analytics/AnalyticsAccountMoreMenu.tsx`                                   |

> **표면이 하나가 아니다.** 이 절이 기술하는 것은 `SIDE_MENU_*` 계열(EditNode·Toolbar 가 각자 같은 값을
> 복사해 갖고 있다)이다. **캔버스 우클릭 메뉴는 별도 표면**으로, `PaneContextMenu.tsx` 의 `MENU_WRAP` 은
> `rounded-14` · `p-3`(6px) · `bg-[rgb(var(--palette-gray-900-rgb)/88%)]` + `backdrop-filter: blur(20px) saturate(150%)`
> 이고 등장 모션도 `animate-[menuPopIn_130ms_cubic-bezier(0.16,1,0.3,1)]` 로 다르다. 셋을 하나로 합칠지는
> **미결정**이므로, 새 메뉴를 만들 때 어느 쪽을 따를지 먼저 정한다.
>
> 아래 `.menuSurface` / `.menuItem` 등의 이름은 **CSS Module 시절의 이름이고 지금은 존재하지 않는다.**
> Tailwind 전환 후 값은 위 상수들에 산다 — 이름이 아니라 값을 기준으로 읽는다.

#### 패널 (`.menuSurface`)

- 레이아웃: `display: flex`, `flex-direction: column`, `gap: 2px`, `padding: 4px`(`--menu-pad`), `border-radius: var(--dropdown-radius)`(16px), `border: none`, `min-width: 160px`
  - 공용 `--dropdown-padding`(6px)을 쓰지 않고 **이 계열만 4px** 이다. 아이템 곡률이 이 값에 연동된다.
- 다크 배경: `rgb(var(--gray-800-rgb) / 100%)`
- 바깥 섀도: `0 4px 24px rgb(0 0 0 / 28%)`, `0 1px 4px rgb(0 0 0 / 18%)` + **6.1절** 글래스 이너 2줄 (`--glass-bevel-highlight` / `--glass-bevel-shade`, `rgb(var(--glass-inner-shadow-rgb) / 25%)`)
- 라이트 배경: `rgb(var(--palette-gray-100-rgb) / 100%)`, 섀도 `0 12px 24px rgb(var(--gray-600-rgb) / 24%)` + 동일 이너 2줄
- `max-width: 480px` 구간: 표면·섀도를 라이트용과 동일하게 두는 미디어 쿼리가 있다.

#### 행 (`.menuItem`, `.menuItemLabel`)

- 행: `display: flex`, `align-items: center`, `gap: 8px`, `padding: 6px 10px`, `border-radius: calc(var(--dropdown-radius) - var(--menu-pad))`(= 12px, **동심원 정렬**), `width: 100%`, `transition: background-color 140ms ease, color 140ms ease`
- 다크: 기본 `color: rgb(255 255 255 / 74%)`, 호버 배경 `rgb(255 255 255 / 8%)`, 글자 `96%`
- 라이트: 기본 `rgb(0 0 0 / 68%)`, 호버 배경 `rgb(0 0 0 / 5%)`, 글자 `88%`
- 라벨: **`type-body-14-regular`** + `min-width: 0`

#### 위험 행 (`.menuItemDanger`)

- 다크: `color: #ff7f79`, 호버 `:not(:disabled)` 시 배경 `rgb(255 127 121 / 12%)` 등
- 라이트: `color: #e11d48`, 호버 배경 `rgb(225 29 72 / 10%)`, 글자 `#be123c`

#### 비활성 (`.menuItem:disabled`)

- `opacity: 0.45`, `cursor: default`, 호버 시 배경·색은 비활성 기본으로 되돌림

#### 열림·닫힘 모션 (`.motion` / `.motionOpen`)

6.4 프로필 팝오버와 같은 계열: **opacity + scale**.

| 상태                             | `opacity` | `transform`   | `pointer-events` |
| -------------------------------- | --------- | ------------- | ---------------- |
| 닫힘 (`MOTION`)                  | `0`       | `scale(0.92)` | `none`           |
| 열림 (`MOTION_OPEN`)             | `1`       | `scale(1)`    | `auto`           |

- 전환은 **열림·닫힘이 비대칭**이다.
  - 열림: `opacity 200ms` + `transform 260ms` — opacity 를 먼저 끝내 내용이 또렷해진 뒤 scale 안착
  - 닫힘: `opacity`·`transform` 모두 `130ms`
  - 이징은 양쪽 모두 **`var(--ease-out-strong)`** = `cubic-bezier(0.32, 0.72, 0, 1)` (닫힘에 ease-in 금지)
  - `prefers-reduced-motion: reduce` 에서는 `opacity 120ms ease` 만
- `transform-origin` 상수 (`MetaDropdownPanel.tsx`): `MOTION_ORIGIN_BOTTOM_LEFT` · `_BOTTOM_CENTER` · `_TOP_CENTER` · `_LEFT_CENTER` · `_RIGHT_CENTER` · `_LEFT_TOP` · `_RIGHT_TOP` — 트리거 기준 모서리에 맞게 고른다
- **`.viewportClamp`**: column flex 래퍼; 패널을 뷰포트 안에 두기 위해 `translate` 보정을 줄 때 사용 (캔버스는 React Flow 줌 배율 반영, 대시보드는 1배)

#### 구현 패턴

- **열기**: 마운트 후 이중 `requestAnimationFrame`으로 `.motionOpen`을 붙여야 전환이 안정적으로 재생되는 경우가 많다.
- **닫기**: `.motionOpen` 제거 → `transitionend`에서 `opacity` / `transform` 확인 후 언마운트하면 사라질 때까지 모션이 유지된다.
- 노드 전용 앵커(`.menuAnchorLeft` 등)는 **줌 역보정 `scale(1/var(--node-canvas-zoom))`** 을 포함하므로, 캔버스 밖 UI는 별도 래퍼(예: `AnalyticsShell.module.css`(삭제됨)의 `.platformAccountMoreAnchor`)로 위치만 잡는다.


#### `--dropdown-*` 토큰 해상값 (§6.5 로 위임된 「표면 토큰」의 정본)

10.1 · 10.9 · 10.10 · 10.11 · 10.12 가 「드롭다운 표면 토큰(`--dropdown-*`)은 6.5절」로 위임하는데
지금까지 이 절에 **토큰 자체의 정의가 없었다.** 아래가 그 정의다. 전부 `apps/web/app/globals.css`.

| 토큰 | 다크 (`:root`) | 라이트 (`html[data-theme="light"]`) | 근거 |
| --- | --- | --- | --- |
| `--dropdown-radius` | `16px` | 동일 (테마 무관) | `globals.css:84` |
| `--dropdown-padding` | `6px` | 동일 (테마 무관) | `globals.css:85` |
| `--dropdown-item-radius` | `10px` | 동일 (테마 무관) | `globals.css:86` |
| `--dropdown-ambient-shadow` | `0px 8px 15px 0px rgba(0, 0, 0, 0.04)` | 동일 (라이트 오버라이드 없음) | `globals.css:81` |
| `--dropdown-surface-bg` | `rgb(var(--palette-gray-800-rgb))` = **#313640** | `rgb(var(--palette-gray-100-rgb))` = **#f1f1f3** | `globals.css:101` / `globals.css:600`, hex 는 `globals.css:36,50` · `:24,42` |
| `--node-meta-dropdown-shadow` | `var(--dropdown-ambient-shadow), var(--glass-dropdown-frame)` | **문자 그대로 같은 값** | `globals.css:559-560` · `:607-608` |
| `--ease-out-strong` | `cubic-bezier(0.32, 0.72, 0, 1)` | 동일 | `globals.css:17` |

- `--dropdown-surface-bg` 와 `--glass-dropdown-frame` 은 `:root` 가 아니라 **`html[data-theme]` 에 정의**된다 —
  `document.body` 로 portal 된 메뉴도 상속받게 하려는 의도다(`globals.css:58,82-83` 주석).
- `--node-meta-dropdown-shadow` 는 **5개 스코프에 똑같은 두 줄로 중복 선언**돼 있다:
  `:root`(`globals.css:559-560`) · `html[data-theme="light"]`(`:607-608`) · `:760-761` · `:805-806` · `:849-850`
  (뒤 셋은 라이트 · walkthrough-dark · walkthrough-light 스코프). **어느 스코프에서도 값이 다르지 않다** —
  테마 차이는 전부 `--glass-dropdown-frame` 안에서 난다.
- `--dropdown-ambient-shadow` 는 프레임 토큰과 **분리해서 두는 것이 규칙**이다. 프레임(`--glass-dropdown-frame`)은
  83곳이 공유하므로 드롭 섀도우를 넣으면 카드·패널·버튼까지 번진다 — 필요한 표면에서만
  `box-shadow: var(--dropdown-ambient-shadow), var(--glass-dropdown-frame)` 로 **앞에 조합**한다(`globals.css:78-80` 주석).

##### ⚠ 라이트 표면 배경은 앱 셸 안에서 값이 다르다

`--dropdown-surface-bg` 는 GNB 사이드바가 있는 앱 셸의 `body` 에 **한 번 더 선언**된다:

```
"[html[data-theme=light]_body:has(&)]:[--dropdown-surface-bg:rgb(var(--palette-gray-100-rgb))]"
```
`components/navigation/Gnb.tsx:2000`

선언문은 `globals.css:600` 과 글자까지 같지만, 같은 셀렉터가 `--palette-gray-100-rgb` 를
`248 248 249` 로 재매핑한다(`Gnb.tsx:1979`, hex 는 `Gnb.tsx:1972`). 따라서 **다시 해석된다**:

| 문맥 | 라이트 `--dropdown-surface-bg` |
| --- | --- |
| 전역(랜딩 등, 앱 셸 밖) | `rgb(241 241 243)` = **#f1f1f3** |
| **앱 셸 안**(`body:has(.gnb-wrapperSidebar)`) | `rgb(248 248 249)` = **#f8f8f9** |

다크는 어느 쪽이든 **#313640** 이다(램프 재매핑은 라이트 전용).
`design/pages/10.10.md:1543` 이 적은 「면 라이트 #f8f8f9」는 앱 셸 기준이라 맞다.
**이 절의 나머지 라이트 hex 는 별도 표기가 없는 한 앱 셸 리맵 기준이다** — 이 절의 세 원천 파일
(EditNode · MetaDropdownPanel · AnalyticsAccountMoreMenu)은 전부 앱 셸 안에서만 렌더된다.

#### ⚠ `--dropdown-*` 를 쓰는 표면은 **두 계열**이고, 패딩·아이템 곡률이 서로 다르다

이 절 본문이 기술하는 `SIDE_MENU_*` 계열은 `--dropdown-padding` 을 **쓰지 않는다.**
같은 `--dropdown-surface-bg` / `--dropdown-radius` 를 쓰면서 패딩과 아이템 곡률만 다른 계열이 하나 더 있다.
페이지 절이 「§6.5 표면 토큰」으로 위임할 때 실제로 가리키는 쪽은 **B 인 경우가 많다.**

| | A — `SIDE_MENU_*` (이 절 본문) | B — `--dropdown-padding` 계열 |
| --- | --- | --- |
| 표면 패딩 | `--menu-pad: 4px` (지역 변수) | `--dropdown-padding` = **6px** |
| 아이템 곡률 | `calc(var(--dropdown-radius) - var(--menu-pad))` = **12px** | `--dropdown-item-radius` = **10px** |
| 표면 곡률 | `var(--dropdown-radius)` 16px | 동일 |
| 표면 배경 | `var(--dropdown-surface-bg)` | 동일 |
| 표면 섀도 | `var(--node-meta-dropdown-shadow)` | `var(--dropdown-ambient-shadow), var(--glass-dropdown-frame)` (전개형, 같은 값) |
| 원천 | `EditNode.tsx:326-334` · `AnalyticsAccountMoreMenu.tsx:62-70` | `NodeMoreMenu.tsx:53-58` |

B 계열에서 `--dropdown-item-radius`(10px)를 실제로 소비하는 곳(전수):
`components/scenes/create/node-canvas-v2/components/NodeMoreMenu.tsx:65` ·
`components/scenes/create/node-canvas-v2/nodes/VideoModelMenu.tsx:70`·`:129` ·
`components/scenes/HomeCreateNewMenu.tsx:47` ·
`components/scenes/NodeCanvasHomeScene.tsx:421` ·
`components/scenes/VideoEditScene.tsx:343` ·
`components/scenes/create/CustomDropdown.tsx:114` ·
`components/landing/system/LanguageSelector.tsx:148` ·
`components/landing/navigation/Gnb.tsx:203`.

B 계열 대표(`NodeMoreMenu`)의 나머지 실측값 — 표면 `flex flex-col gap-1`(**2px**) `min-w-70`(**140px**)
`overflow-hidden`(`:54`), 내부 `MENU` 는 `flex flex-col gap-0`(`:60`), 행은
`inline-flex items-center gap-4`(**8px**) `w-full py-4 px-5`(**8px / 10px**) `border-0 text-left`
`[transition:background_0.12s_ease,color_0.12s_ease]` `disabled:opacity-[0.45] disabled:cursor-not-allowed`
(`NodeMoreMenu.tsx:63-69`). **A 계열의 `140ms ease` 와 전이 시간이 다르고(120ms), 비활성 커서도 다르다**
(A 는 `cursor-default`, B 는 `cursor-not-allowed`).

#### 행 아이콘 (`SIDE_MENU_ITEM_ICON`)

`design/pages/10.9.md:1017` 이 「아이콘이 있는 §6.5 다른 드롭다운」이라 부르는 그 아이콘 슬롯이다.
본문에 없어서 채운다 — `EditNode.tsx:357-362`:

- `flex items-center justify-center` · `w-10 h-10` = **20×20px** · `rounded-[5px]` (**5px 리터럴** — 토큰 아님) · `shrink-0`
- 면 다크 `rgb(var(--gray-700-rgb) / 100%)` → `--gray-700-rgb` = `--palette-gray-700-rgb` (`globals.css:684`) = **#575d68** (`globals.css:34,49`)
- 면 라이트 `light:bg-[rgb(var(--palette-gray-200-rgb)/100%)]` → 전역 **#e3e4e8**(`globals.css:28,44`),
  **앱 셸 안 #eeeef1**(`Gnb.tsx:1974`·`:1981`)
  - 라이트는 **의미 토큰이 아니라 `--palette-` 를 직접** 쓴다. 라이트에서 `--gray-700-rgb` 는
    `--palette-gray-300-rgb` 로 뒤집히므로(`globals.css:738`) 기본 선언을 그대로 두면 훨씬 밝아진다 —
    `light:` 변형이 그 자리를 덮는 이유다.
- 행 라벨은 아이콘과 **형제**이고 `SIDE_MENU_ITEM_LABEL` = `"min-w-0"` 하나뿐이다(`EditNode.tsx:363`).
  `type-body-14-regular` 는 상수가 아니라 **호출부에서 문자열로 이어 붙인다**
  (`` `type-body-14-regular ${SIDE_MENU_ITEM_LABEL}` ``, `EditNode.tsx:872`·`:887`).

#### 위험 행 (danger) — 실측값

본문의 「다크 `#ff7f79` / 라이트 `#e11d48` · `#be123c`」는 **현재 코드에 없는 값이다.**
정본은 `AnalyticsAccountMoreMenu.tsx:105-116`(`SIDE_MENU_ITEM_TONE_DANGER`)이고, 전부 accent-red 토큰이다.
구조(패딩·곡률·전이)는 기본 행과 공유하며(`SIDE_MENU_ITEM_BASE`, `:77-83`), **톤만 상호배타로 갈린다**(`:118-119`).

| 상태 | 다크 | 라이트 | 근거 |
| --- | --- | --- | --- |
| 기본 글자 | `var(--accent-red-300)` = **#ff9aa4** | `var(--accent-red-600)` = **#e23645** | `:106`·`:111` / hex `globals.css:232`·`:235` |
| 기본 배경 | `transparent` | `transparent` | `:106` |
| 호버 `:not(:disabled)` 배경 | `rgb(255 75 89 / 12%)` (`--accent-red-500-rgb`) | `rgb(226 54 69 / 10%)` (`--accent-red-600-rgb`) **`!`** | `:107`·`:114` / rgb `globals.css:243`·`:244` |
| 호버 `:not(:disabled)` 글자 | `rgb(255 196 202 / 98%)` (`--accent-red-200-rgb`) | `var(--accent-red-700)` = **#b72431** **`!`** | `:108`·`:115` / `globals.css:240`·`:236` |
| 비활성 호버 배경 | `transparent` | `rgb(0 0 0 / 5%)` **`!`** | `:109`·`:112` |
| 비활성 호버 글자 | `rgb(250 250 250 / 74%)` (`--palette-gray-000-rgb`) | `rgb(0 0 0 / 68%)` **`!`** | `:110`·`:113` / `globals.css:40` |

- **danger 행은 기본 행의 호버 톤을 받지 않는다.** 원본 CSS 에서 `.menuItem:hover`(다크 96%/8%)는
  danger 요소에서 항상 졌고, 라이트 배경 5% 만 **비활성 호버에서** 이겼다 — 그 자리 하나만 `!` 로 남겼다
  (`AnalyticsAccountMoreMenu.tsx:99-104` 주석이 승패를 그대로 기록해 둔다).
- `EditNode.tsx` 의 `SIDE_MENU_*` 에는 **danger 변형이 없다**(`:340-355` 는 기본 톤 하나뿐). danger 는
  `AnalyticsAccountMoreMenu`(연동 해제) 쪽에만 존재한다.
- `--accent-red-300` / `-700` 은 `-rgb` 짝이 없어 hex 로 직접 참조된다(`globals.css:232`·`:236` vs `:240-244`).

#### 자동 세로 플립 — `.viewportClamp` 는 **삭제됐다**

본문의 「`.viewportClamp`: 패널을 뷰포트 안에 두기 위해 `translate` 보정」은 **더 이상 사실이 아니다.**

- `MetaDropdownPanel.tsx:85-86` 이 설계 결정으로 명시한다 — **「뷰포트 클램프(translate nudge)는 두지 않음.
  플립 후에도 화면 가장자리에서 잘리면 그냥 잘려 노출된다.」**
- `nudgeScale` prop 은 `@deprecated`, 받기만 하고 무시한다(`MetaDropdownPanel.tsx:88`·`:112`·`:124-125`).
- 소비자 쪽 클래스도 죽은 참조다: `const VIEWPORT_CLAMP: string | undefined = undefined;`
  — 「정의가 삭제된 죽은 참조(모듈 별칭 값이 undefined) — 원본도 class 속성 없이 렌더된다」
  (`AnalyticsAccountMoreMenu.tsx:55-57`).
- `computeViewportNudge()` 함수 자체는 `metaDropdownViewport.ts:7-24` 에 **남아 있지만 이 패널은 호출하지 않는다**
  (`MetaDropdownPanel.tsx` 의 import 는 `META_DROPDOWN_DEFAULT_VERTICAL_GAP_PX` 와
  `shouldOpenPopoverBelowTrigger` 둘뿐, `:16-19`). 코드가 스스로 모순된 자리다.

대신 있는 것은 **세로 플립 하나**다:

- 상수: `META_DROPDOWN_VIEWPORT_PAD_PX = 8`(`metaDropdownViewport.ts:2`),
  `META_DROPDOWN_DEFAULT_VERTICAL_GAP_PX = 4`(`:5`). 후자는 `verticalPopoverGapPx` prop 으로 덮을 수 있고,
  주석상 **노드 메타 4px / 캔버스 하단 툴바 8px** 이다(`MetaDropdownPanel.tsx:126-127`·`:159`).
- 판정(`shouldOpenPopoverBelowTrigger`, `metaDropdownViewport.ts:37-45`) — `need = 패널높이 + gap`,
  `aboveAvail = wrapRect.top - 8`, `belowAvail = 뷰포트높이 - 8 - wrapRect.bottom`.
  **위에 들어가면 위**(`fitsAbove → false`), 아니면 **아래에 들어가면 아래**, 둘 다 안 들어가면 **더 넓은 쪽**.
- 기본 배치는 트리거 **위쪽**(CSS `bottom: 100%+gap`)이다(`metaDropdownViewport.ts:26-28`).
- 플립은 `motionOrigin` 이 `bottom-center` 또는 `bottom-left` 일 때만 기본 활성
  (`MetaDropdownPanel.tsx:155-157`) — 측면 서브메뉴(`left-top` 등)는 제외. `autoVerticalFlip` 로 강제 가능.
- 플립되면 앵커에 **인라인 스타일**로 `top: calc(100% + {gap}px)` · `bottom: auto` ·
  `transform-origin: top center`(bottom-center) 또는 `left top`(bottom-left) 을 얹는다
  (`MetaDropdownPanel.tsx:314-322`), 그리고 origin 클래스도 `TOP_CENTER` / `TOP_LEFT` 로 갈아탄다(`:304-312`).
- 재측정 트리거: 열려 있을 때만 마운트되는 `ViewportReflowTrigger` 가 React Flow `x/y/zoom` 을 구독(`:95-105`·`:344-346`),
  더해 표면의 `ResizeObserver` 와 `window resize`(`:222-238`). 전부 `requestAnimationFrame` 1회로 코얼레스(`:192-199`),
  상태 반영은 `flushSync`(`:171`·`:189`).
- **닫히는 동안에는 플립 상태를 리셋하지 않는다** — 즉시 false 로 되돌리면 아래로 열렸던 패널이
  페이드 도중 위로 튄다(`:204-206`).

#### 열기·닫기 실측 시퀀스 (본문 「구현 패턴」 정정)

본문은 「마운트 후 **이중** `requestAnimationFrame`」이라 적었지만, 실제 구현은 **rAF 1회 + 강제 리플로우**다:

```
requestAnimationFrame(() => {
  measureVerticalFlip();
  void surfaceRef.current?.offsetHeight;   // 닫힌 상태(MOTION)를 강제 커밋
  setShow(true);
});
```
`MetaDropdownPanel.tsx:255-261` — 주석이 이유를 명시한다: 「다음 프레임(rAF)을 더 기다리지 않고 즉시 표시 —
닫힌 상태를 강제 리플로우로 커밋해 enter 트랜지션은 보장하면서 여는 마운트 프레임 지연을 없앤다.」

닫기는 본문대로 `transitionend` 기반이되 가드가 셋이다(`:272-283`):
`e.target !== e.currentTarget` 무시 · `propertyName` 이 `opacity`/`transform` 이 아니면 무시 ·
`closeCommittedRef` 로 **1회만** 언마운트(두 프로퍼티가 각각 끝나므로 이벤트가 두 번 온다).

부가 상태·마커:
- `staticOpen` prop — **랜딩 미리보기 전용**. 등장 애니메이션 없이 즉시 열린 상태(`:117`·`:135-136`·`:250-253`).
- 앵커에 붙는 마커 두 개는 **의도가 다르므로 속성이 따로다**(`:328-341`):
  `data-meta-dropdown-open` 은 **열림 동안만**, `data-meta-dropdown-anchor` 는 **마운트되어 있는 동안 내내**
  (= 닫힘 애니메이션이 끝날 때까지). 후자를 `globals.css:1298`
  (`.react-flow__node *:has([data-meta-dropdown-anchor])`)이 조상 체인 전체를 잡는 데 쓴다.
- 앵커 z-index 만으로는 부족하다 — React Flow 가 노드 래퍼마다 인라인 `transform` 을 걸어 **별도 쌓임 맥락**을
  만들기 때문에, 카드보다 넓은 패널(모델 메뉴 440px vs 카드 400px)은 이웃 노드의 사이드 버튼에 덮인다.
  그래서 `data-meta-dropdown-open` 으로 **노드 래퍼 자체를** 올린다(`:328-333` 주석).

#### `MOTION` / `MOTION_OPEN` 에 본문이 빠뜨린 것

- 두 상수 모두 `[will-change:opacity,transform]` 을 포함한다(`MetaDropdownPanel.tsx:46`·`:55`).
- 두 상수는 **상호배타**로 갈려 있고 **한 번에 하나만** 붙는다(`:349`). 원본 CSS 는 `.motion` 과
  `.motionOpen` 을 같은 요소에 함께 걸고 소스 순서로 open 이 이겼는데, 유틸리티는 정렬이 순서를
  대신 정하므로 분기로 승패를 고정했다(`:30-32` 주석). **새 상태를 얹을 때 두 상수를 합치면 안 된다.**
- `prefers-reduced-motion` 은 별도 상수 `MOTION_REDUCED` 로 **양쪽 분기에 모두** 들어가며,
  둘 다 `!` 가 붙는다 — `transform:none!` + `transition:opacity 120ms ease!`(`:36-39`).
  scale 이 `none` 으로 죽으므로 **모션 축소 환경에서는 페이드만 남는다.**
- `transform-origin` 상수는 **8개**이고, 본문 목록에 `MOTION_ORIGIN_TOP_LEFT` 가 빠져 있다(`:61-68`):
  `_BOTTOM_LEFT`(`bottom left`) · `_BOTTOM_CENTER`(`bottom center`) · **`_TOP_LEFT`(`left top`)** ·
  `_TOP_CENTER`(`top center`) · `_LEFT_CENTER`(`left center`) · `_RIGHT_CENTER`(`right center`) ·
  `_LEFT_TOP`(`left top`) · `_RIGHT_TOP`(`right top`).
  **`_TOP_LEFT` 와 `_LEFT_TOP` 은 값이 같다**(둘 다 `left top`) — 이름만 다른 중복이고, 원본 CSS 의
  `.motionOriginTopLeft` / `.motionOriginLeftTop` 을 그대로 옮긴 결과다(`:59-60` 주석).
  `MetaDropdownMotionOrigin` 타입의 리터럴 8종도 이와 1:1이다(`:70-78`).
- 이 계열의 소비자는 `MetaDropdownPanel` 을 import 하는 노드들이다 — `NodeSideButtons.tsx`(6개소:
  `:1396`·`:1431`·`:1463`·`:1548`·`:1595`·`:1628`), `VideoNode.tsx`(4개소: `:2535`·`:2611`·`:2711`·`:2776`),
  `YoutubeNode.tsx`(`:1220`·`:1554` 등). `AnalyticsAccountMoreMenu.tsx` 는 컴포넌트를 쓰지 않고
  **상수만 복제**한다(`:13-17` 주석; `MOTION`/`MOTION_OPEN`/`MOTION_REDUCED` 는 `:30-51`, 값 동일).

#### 표면 배경·섀도 — 본문 값의 정정

본문의 「바깥 섀도 `0 4px 24px rgb(0 0 0 / 28%)`, `0 1px 4px rgb(0 0 0 / 18%)`」와
「라이트 섀도 `0 12px 24px rgb(var(--gray-600-rgb) / 24%)`」는 **현재 코드에 존재하지 않는다.**
표면 상수는 섀도를 리터럴로 쓰지 않고 토큰 하나만 참조한다:

- `"[box-shadow:var(--node-meta-dropdown-shadow)]"` — `EditNode.tsx:333` · `AnalyticsAccountMoreMenu.tsx:68`
  (= `--dropdown-ambient-shadow` + `--glass-dropdown-frame`, 위 표 참조)
- 배경도 `rgb(var(--gray-800-rgb) / 100%)` 가 아니라 `"[background:var(--dropdown-surface-bg)]"` 이고
  (`EditNode.tsx:328` · `AnalyticsAccountMoreMenu.tsx:64`), 그 토큰은 **의미 토큰이 아니라
  `--palette-gray-800/100` 을 직접** 가리킨다(`globals.css:101`·`:600`) — 테마와 함께 뒤집히지 않는다.
- 이너 2줄(`--glass-bevel-highlight` / `-shade` / `--glass-inner-shadow-rgb`)은 이 표면에 **직접 붙지 않는다.**
  `--glass-dropdown-frame` 안의 마지막 두 레이어
  (`inset 0px ±1px 1px -0.5px rgba(255,255,255,·)`, `globals.css:66-68` 다크 / `:598-599` 라이트)가
  그 역할을 대신한다. 다크 흰 림 **50%**, 라이트 **100%** 로 뒤집힌다.

#### `CustomDropdown` 은 이 절이 아니다 (10.7 위임 회신)

`design/pages/10.7.md:1461` 이 「CustomDropdown 내부 구조 … 6.5절 참조」로 넘겼지만, 같은 문서 `:571-573` 이
이미 「**§6.5 가 아니다**」로 정정한다. **후자가 맞다.** 정본은 `components/scenes/create/CustomDropdown.tsx` 이며,
공유하는 것은 `--dropdown-surface-bg` / `--dropdown-item-radius` 두 토큰뿐이고 **패딩·곡률·모션이 전부 다르다.**
혼동을 끊기 위한 대조만 여기 남긴다(값의 소유는 10.7):

| | §6.5 `SIDE_MENU_*` | `CustomDropdown` |
| --- | --- | --- |
| 표면 패딩 / 곡률 | 4px / `--dropdown-radius`(16px) | `p-4` = **8px** / `rounded-16` **리터럴 유틸**(`CustomDropdown.tsx:52`) |
| 표면 배경 | `var(--dropdown-surface-bg)` | `var(--node-floating-bg, var(--dropdown-surface-bg))` — **노드 스코프 폴백 체인**(`:53`) |
| 표면 섀도 | `var(--node-meta-dropdown-shadow)` | `0 12px 24px rgb(23 27 34 / 12%)` + inset 2줄 + `var(--glass-dropdown-frame)`(`:54`; hex `globals.css:37,51`) |
| 열림 이징 | `--ease-out-strong` 양쪽 동일 | opacity `180ms cubic-bezier(0.16,1,0.3,1)` + transform `200ms cubic-bezier(0.34,1.56,0.64,1)` — **오버슛 탄성**(`:79-82`) |
| 닫힘 이징 | `130ms var(--ease-out-strong)` (ease-in 금지) | `100ms cubic-bezier(0.7,0,0.84,0)` — **ease-in**, 규칙의 정반대(`:74-77`) |
| 닫힘 scale | `scale(0.92)` | `scale(0.96)`(`:75`) |
| `prefers-reduced-motion` | `transform:none!` + `opacity 120ms ease!` | **문자 그대로 동일**(`:68-69`) |

10.7 이 「접근성 설정 시 애니메이션 없음」으로 적으면 틀린다고 경고한 그 자리(`10.7.md:458`)는
**두 계열 모두 같다** — `transform` 만 죽고 `opacity 120ms ease` 페이드는 남는다.

### 6.6 Node Canvas Chrome (App)

`Create` 씬의 **노드 캔버스 화면 가장자리 3영역** — 좌상단 알약, 우상단 알약, 하단 ComposerBar — 과 노드 카드 외곽선의 토큰을 한 곳에서 관리한다. 셋의 **베이스 색은 동일 토큰**으로 묶여 있으므로 새로운 모서리 UI를 추가할 때도 같은 토큰을 따른다.

**원천 파일 (`apps/web`):**

| 영역                                                                  | 파일                                                                                                                                                      |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 좌상단 `projectHeaderBrandShell` / 우상단 `projectHeaderActionsShell` | `components/navigation/Gnb.tsx`, `components/scenes/create/ProjectHeader.tsx`                                                                             |
| 하단 알약 — 컴포저 모드 (`COMPOSER_CARD`)                             | `components/scenes/create/ComposerBar.tsx` (`viewMode === "default"` 일 때 노출)                                                                          |
| 하단 알약 — 노드 캔버스 모드 (`TOOLBAR_WRAP` in `TOOLBAR_ROW`)        | `components/scenes/create/node-canvas-v2/components/Toolbar.tsx` · `components/scenes/create/node-canvas-v2/index.tsx` (`viewMode === "node"` 일 때 노출) |
| 노드 카드 외곽선 SSOT                                                 | `components/scenes/create/node-canvas-v2/index.tsx` 의 `CANVAS_SHELL_BASE` — `[data-node-chrome="wrap"]` 후손 변형                                        |
| 노드 카드 배경(노드별)                                                | 각 노드 TSX 의 `NODE_WRAP` 상수 (`components/scenes/create/node-canvas-v2/nodes/*.tsx`) — 모듈 CSS 는 전부 사라졌다                                       |

#### 가장자리 영역 베이스 색

**상단 두 영역은 더 이상 알약이 아니다.** `BRAND_SHELL` / `ACTIONS_SHELL`
(`components/scenes/create/ProjectHeader.tsx`) 은 `bg-transparent` + `box-shadow: none` 이고,
패딩도 없어 콘텐츠가 헤더 패딩(12px)에 직접 정렬된다. 모듈 CSS 시절 배경·그림자 선언은
같은 특이도의 뒤 규칙("알약 제거")에 져 있었고, Tailwind 전환 때 **승자만** 옮겨 왔다.

면을 실제로 갖는 것은 하단 두 알약뿐이고, 둘은 서로 다른 표면이다.

| 영역                                              | 다크                                     | 라이트                                        |
| ------------------------------------------------- | ---------------------------------------- | --------------------------------------------- |
| 상단 `BRAND_SHELL` · `ACTIONS_SHELL`              | 없음 (`bg-transparent`)                  | 동일                                          |
| 하단 — 컴포저 모드 `COMPOSER_CARD`                | `rgb(var(--gray-800-rgb) / 100%)`        | `rgb(var(--palette-gray-100-rgb) / 100%)`     |
| 하단 — 노드 캔버스 모드 `TOOLBAR_WRAP`            | `rgb(var(--gray-800-rgb) / 70%)` + 블러  | `rgb(var(--palette-gray-100-rgb) / 70%)`      |

- `COMPOSER_CARD` 는 불투명 면 + **6.1절** 글래스 이너 2줄. 누름은 `COMPOSER_CARD_PRESSED`.
- `TOOLBAR_WRAP` 은 **70% 알파 + `backdrop-filter: blur(4px)`** 로 캔버스가 비쳐 보이는
  글래스이고, 외곽은 `border` 가 아니라 전역 `--glass-dropdown-frame`(0.5px 헤어라인 한 겹)이다.
  라이트도 순백이 아니라 `palette-gray-100` 을 같은 알파로 쓴다.
- 헥스는 여기 적지 않는다 — **4.1절** 팔레트 표가 원천이다. 예전에 이 표에 손으로 적어 둔
  `#3a4049` / `#f7f7f9` 세 값은 팔레트가 바뀐 뒤에도 그대로 남아 전부 틀린 값이 돼 있었다.

> **App Home `.updateBanner` (메인 배너) — 다크 베이스 `gray-900`**: `components/scenes/appHomeSceneStyles.ts` 의 `bannerSlide*` 그라디언트 베이스는 `--palette-gray-900-rgb` (#171b22). 캔버스 노드 토큰(`gray-800`) 과 의도적으로 한 단계 옅게 구분해 페이지 배경(gray-900)과 자연스럽게 이어지도록 함. 라이트 모드는 `--palette-gray-100-rgb` 유지.

- 라이트는 의도적으로 “순백”이 아닌 살짝 회끼 있는 `palette-gray-100`을 사용한다 — 캔버스 위에서 알약·바가 분리되어 보이도록 한 톤 다운 처리. (팔레트의 `palette-gray-000` 자체도 순백이 아니라 `#fafafa` 다.)
- 다크는 노드 카드 배경과 같은 `gray-800` 토큰을 써서 같은 면이라는 인상을 준다.

#### 화면 모서리까지의 거리 (기준 패딩)

| 영역                             | 위/아래                                    | 좌/우                                                                   |
| -------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------- |
| 좌상단 브랜드 영역               | `max(12px, env(safe-area-inset-top, 0px))` | `env(safe-area-inset-left, 0px) + 12px`                                 |
| 우상단 액션 영역                 | 동일                                       | `var(--app-gnb-main-inline-padding-end)` (= `12px`)                     |
| 하단 컴포저 (`COMPOSER_WRAP`)    | `bottom-6` (= 12px, `--spacing: 2px`)      | `w-[min(100%,560px)]` · `mx-auto` · `gap-3` (브레이크포인트별 거터 변동) |
| 하단 캔버스 툴바 (`.toolbarRow`) | `bottom: 12px`                             | `left: 50%; transform: translateX(-50%);` (가로 중앙)                   |

- 상단 컨테이너(`.nodeProjectHeader`)는 `position: fixed; top:0; left:0; right:0;` 로 화면 상단 폭 전체를 덮고, 패딩 안쪽에 두 알약을 grid 양 끝 정렬한다.
- 하단 ComposerBar는 `@media (max-width: 720px)`에서 `width: min(100%, 520px); padding-inline: 16px;`, `@media (max-width: 480px)`에서 `width: 100%`로 좁아진다.

#### 노드 카드 외곽선 (SSOT — `node-canvas-v2/index.tsx` 의 `CANVAS_SHELL_BASE`)

각 노드 모듈(`.nodeWrap`)은 **`border` 를 직접 선언하지 않는다**. 캔버스 한 곳에서 두께·스타일·색을 일괄 관리한다.

| 상태   | 다크                                                        | 라이트                                                    |
| ------ | ----------------------------------------------------------- | --------------------------------------------------------- |
| 비선택 | `2px solid rgb(var(--palette-gray-600-rgb) / 100%)`         | `2px solid rgb(var(--palette-gray-000-rgb) / 100%)`       |
| 선택   | `2px solid rgb(var(--node-selection-accent-rgb) / 86%)`     | 동일                                                      |

- 다크 비선택은 **`--palette-gray-600`** 이다 — 시맨틱 `--gray-700` 이 아니다. 노드 프롬프트
  필드의 면·스트로크를 `gray-600`/`gray-700` 으로 맞추면서 카드 외곽선도 함께 올렸다.
- 선택 강조에 `box-shadow` 를 추가하지 않는다 — 비용을 줄이기 위해 색상 전환만 사용.
- 새 노드를 추가할 때 `.nodeWrap` 에 `border` 를 다시 선언하지 말 것. 두께 변경이 필요한 경우 SSOT 룰만 수정.

#### 노드 안 톤 사다리 (2026-08 확정)

카드 안의 면·선은 **한 톤씩 이동**한다. 다크는 카드에서 계속 밝아지고, 라이트는
**입력 박스만 카드보다 밝고** 나머지는 어두워진다. 토큰은 `globals.css` 의 테마 블록에 있다.

<!-- GENERATED:theme-roles START -->
| Token | 라이트 | 다크 |
| --- | --- | --- |
| `--surface-page` | `var(--palette-gray-100)` → `#f1f1f3` | `var(--palette-gray-900)` → `#171b22` |
| `--surface-raised` | `var(--palette-gray-100)` → `#f1f1f3` | `var(--palette-gray-800)` → `#313640` |
| `--surface-input` | `var(--palette-gray-50)` → `#f8f8f9` | `var(--palette-gray-700)` → `#575d68` |
| `--surface-answer` | `var(--palette-gray-150)` → `#eaebee` | `var(--palette-gray-600)` → `#777d89` |
| `--surface-inset` | `var(--palette-gray-100)` → `#f1f1f3` | `var(--palette-gray-600)` → `#777d89` |
| `--surface-inset-hover` | `var(--palette-gray-150)` → `#eaebee` | `var(--palette-gray-500)` → `#9aa0ab` |
| `--surface-inset-pressed` | `var(--palette-gray-200)` → `#e3e4e8` | `var(--palette-gray-400)` → `#bcc0c9` |
| `--border-input` | `var(--palette-gray-000)` → `#fafafa` | `var(--palette-gray-600)` → `#777d89` |
| `--border-control` | `var(--palette-gray-150)` → `#eaebee` | `var(--palette-gray-500)` → `#9aa0ab` |
<!-- GENERATED:theme-roles END -->

| 토큰                    | 위치                |
| ----------------------- | ------------------- |
| `--surface-page`        | 페이지              |
| `--surface-raised`      | 노드 카드           |
| `--surface-input`       | 입력 박스 면        |
| `--surface-answer`      | AI 답변 버블        |
| `--surface-inset`       | 메타 버튼 면        |
| `--surface-inset-hover` | 메타 버튼 호버      |
| `--surface-inset-pressed` | 메타 버튼 누름    |
| `--border-input`        | 입력 박스 외곽선    |
| `--border-control`      | 메타 버튼 외곽선    |

- **답변 버블에는 외곽선을 두지 않는다.** 면만으로 구분한다. 다크에서는 카드(800)보다 두 톤 밝은 600 이라 면 대비만으로 충분하다.
- 외곽선 두께는 노드 카드 최외곽(2px)을 제외하고 전부 **0.5px**.
- 라이트에서 방향이 갈리는 것은 의도다 — 입력 박스는 눌러 넣은 면이 아니라 **띄운 면**으로 읽혀야 한다.

> **아직 소비처는 옮기지 않았다.** 토큰만 정의돼 있고, 노드 파일들은 여전히
> `--palette-gray-*` 를 직접 참조한다(800곳 이상). 파일 단위로 옮기면서 두 테마를 눈으로
> 확인하는 것이 남은 작업이다.

#### 노드 카드 배경

| 상태        | 다크                              | 라이트                                    |
| ----------- | --------------------------------- | ----------------------------------------- |
| `NODE_WRAP` | `rgb(var(--gray-800-rgb) / 100%)` | `rgb(var(--palette-gray-100-rgb) / 100%)` |

- 노드 **8종**(`ImageNode` / `VideoNode` / `TextNode` / `EditNode` / `InstagramNode` /
  `YoutubeNode` / `BgmNode` / `TtsNode`)이 각자 `NODE_WRAP` 상수에 **같은 두 줄을 인라인**한다.
  노드별 배경 차별이 필요하면 헤더 오버레이 등 내부 레이어로 처리하고 카드 면 자체는 공통 토큰을 유지한다.
- 외곽선과 달리 배경은 SSOT 가 없다 — 8곳에 복제돼 있어, 카드 면 색을 바꾸려면 8개 파일을
  함께 고쳐야 한다. §6.6 톤 사다리의 `--surface-raised` 가 이 자리를 대체하려고 만든 토큰이다.

#### 테마 토글 버튼 위치

- **단일 위치**: `ProjectHeader` 우상단 actions shell 안에 `iconButton` + `projectGuideButton` 클래스 조합으로 들어간다 (`apps/web/components/scenes/create/ProjectHeader.tsx`).
- 캔버스 하단 툴바에는 더 이상 별도 테마 토글 버튼·CSS 클래스(`.themeToggleButton`)가 존재하지 않는다.
- 순환 순서는 캔버스에서 쓰던 것과 동일: `system → dark → light → …`.
- 글리프(`ThemeGlyph`): `system: 모니터 / light: 태양 / dark: 달` — 14×14 viewBox, 1px stroke.

### 6.7 Buttons (구현 인벤토리)

> **이 절은 사양이 아니라 이름 목록이다.** 값(높이·패딩·면·상태)이 없다.
> 이름이 많아 보여서 그 화면이 문서화된 것처럼 읽히지만, 이 표만으로는 아무것도 만들 수 없다.
> 실제로 `/archive` 를 이 문서대로 만들라고 했을 때 배포 환경과 다른 결과가 나온 원인이 이것이다 —
> `archive` 가 문서에 23번 등장하지만 그중 9줄이 이 표의 이름 나열이었다.
> 버튼의 실제 사양은 **6.10절**(공용 `Button`)에 있고, 화면별 구조는 **1.5절** 표에서
> 그 라우트의 문서화 수준을 먼저 확인한다.

`apps/web` 기준으로 **실제 `<button>` / `role` 링크 버튼에 쓰이는 Tailwind 클래스 상수와 남아 있는
CSS Module 클래스**를 파일별로 정리한 목록이다. 신규 버튼은 먼저 공용
``Button``과 [`Button` 규범](../design/components/button.md)을 재사용한다.
화면 고유 변형이 꼭 필요할 때만 같은 소유 파일의 구현 패턴을 따른다. Pill·글래스 표면은 **6.1절**
규칙(이너 섀도 2줄, `border` 스트로크 금지)을 따르고, 라벨은 `type-body-*` /
`type-heading-*` 유틸과 조합한다.

#### 공통 패턴 (코드 전반)

| 패턴             | 설명                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| Primary / filled | 배경 채움 + 라운드(또는 pill), 호버/액티브/`:disabled`                                |
| Outline / ghost  | 얇은 테두리 또는 투명 배경 + 호버만 강조                                              |
| Icon-only        | 정사각형·원형 히트영역, `aria-label` 필수                                             |
| Danger           | 빨강/액센트 계열 호버·텍스트 (`*Danger*`, `*danger*` 접미/복합 클래스)                 |
| Modal footer     | `.modalCancel` + `.modalConfirm` (또는 `.modalConfirmDanger`) 조합이 여러 씬에서 반복 |
| Node canvas      | 노드 툴바·카드·엣지·생성 CTA 는 `components/scenes/create/**` 각 TSX 의 상수로 이관됨 |

> **버튼 곡률 규약:** 솔리드/아웃라인 **액션 버튼**(다운로드·확인·CTA·결과 액션 등)은 `border-radius: 12px` 를 기본으로 한다. pill(`999px`)은 **6.1절** 글래스 칩 등 **전용 패턴에만** 사용한다. **하단 캔버스 툴바는 알약이 아니다** — `Toolbar.tsx` 의 `TOOLBAR_WRAP` 은 `rounded-16` 이다. (예: 하이라이트 결과 상세의 `clipModalDownload`/`clipModalShorts` 도 12px. auth 버튼은 2026-05 에 12 로 통일 — **A) 인증·온보딩** 표 하단 참조.)

#### 누름 효과 (`:active`)

**전역 토큰은 없다.** 누름감은 소유 컴포넌트의 Tailwind 클래스 상수 또는 남아 있는 CSS Module에서
`*:active` / `*:active:not(:disabled)`로 따로 정의되어 있으며, **일부 버튼은 `:active` 규칙이
없고** 호버·배경 변화만 있다.

코드에서 자주 쓰이는 패턴(참고용, 실제 수치는 각 파일 기준):

| 패턴      | 예시                                                  | 비고                              |
| --------- | ----------------------------------------------------- | --------------------------------- |
| 살짝 축소 | `transform: scale(0.96)` ~ `scale(0.99)`              | 아이콘 버튼·필터·플로팅 버튼 등   |
| 살짝 확대 | `transform: scale(1.02)` ~ `scale(1.05)`              | 랜딩 CTA, 모달 확인 등            |
| 필터만    | `filter: brightness(...)` / `saturate`                | 솔리드 primary, 글래스 pill       |
| 수직 이동 | `transform: translateY(0)` (hover에서 `-1px` 등과 쌍) | 업그레이드 상태 버튼류            |
| 복합      | `transform` + `filter`                                | 로그인/회원가입 `submitButton` 등 |

새 버튼을 만들 때는 공용 `Button`의 상태 계약을 먼저 따르고, 공용 컴포넌트로 표현할 수 없는 화면
고유 버튼만 같은 소유 파일의 `:active` 패턴을 재사용한다. `:disabled`에서는 `transform`/`filter`를
끄는 기존 계약을 유지한다.

---

<!-- GENERATED:button-inventory START -->
`components/**` · `app/**` 에서 이름에 `Button` / `Btn` 이 들어간 클래스·상수를 모은 것이다 — 파일 139개, 737건.

| 파일 | 버튼 클래스 · 상수 |
| --- | --- |
| `app/(highlight-standalone)/hl-login/page.module.css` | `submitBtn` · `toggleBtn` |
| `app/(highlight-standalone)/hl-login/page.tsx` | `submitBtn` · `toggleBtn` |
| `app/(highlight-standalone)/hl-signup/check-email/page.tsx` | `PRIMARY_BUTTON` · `SECONDARY_BUTTON` · `primaryButton` · `resendButton` · `secondaryButton` |
| `app/(highlight-standalone)/hl-signup/page.module.css` | `submitBtn` · `toggleBtn` · `viewBtn` |
| `app/(highlight-standalone)/hl-signup/page.tsx` | `submitBtn` · `toggleBtn` · `viewBtn` |
| `app/(highlight-standalone)/hl/[projectId]/page.module.css` | `backBtn` · `retryBtn` |
| `app/(highlight-standalone)/hl/[projectId]/page.tsx` | `backBtn` · `retryBtn` |
| `app/(highlight-standalone)/layout.tsx` | `navBtn` |
| `app/admin/AdminClient.tsx` | `MODAL_BUTTON_BASE` · `SORT_BUTTON` · `SORT_BUTTON_ACTIVE` · `SORT_BUTTON_BASE` · `SORT_BUTTON_GROUP` · `TAB_BUTTON` · `TAB_BUTTON_ACTIVE` · `TAB_BUTTON_BASE` · `sortButton` · `sortButtonActive` · `tabButton` · `tabButtonActive` |
| `app/admin/BannerManagement.tsx` | `BANNER_ADD_BTN` · `BANNER_DELETE_BTN` · `BANNER_EDIT_BTN` · `BANNER_ROW_BTN` |
| `app/admin/BlogManagement.tsx` | `BLOG_DANGER_BTN` · `BLOG_GHOST_BTN` · `BLOG_PRIMARY_BTN` |
| `app/admin/CaptionTemplateManagement.tsx` | `ADD_BTN` · `DANGER_BTN` · `LINK_BTN` · `addBtn` · `dangerBtn` · `linkBtn` |
| `app/admin/InquiryManagement.tsx` | `MODAL_BUTTON_BASE` · `REFRESH_BUTTON` · `RESOLVE_BUTTON` |
| `app/admin/JobMonitor.tsx` | `SORT_BUTTON` · `SORT_BUTTON_ACTIVE` · `SORT_BUTTON_GROUP` · `SORT_BUTTON_IDLE` |
| `app/admin/ProductMetricsDashboard.tsx` | `TAB_BUTTON` · `TAB_BUTTON_ACTIVE` · `TAB_BUTTON_BASE` · `tabButton` · `tabButtonActive` |
| `app/admin/RefundManagement.tsx` | `MODAL_BUTTON_BASE` · `REFRESH_BUTTON` · `RESOLVE_BUTTON` |
| `app/admin/TemplateManagement.tsx` | `BANNER_BTN_BASE` · `BANNER_DELETE_BTN` · `BANNER_EDIT_BTN` · `BLOG_GHOST_BTN` · `BLOG_PRIMARY_BTN` · `bannerEditBtn` · `blogGhostBtn` · `blogPrimaryBtn` |
| `app/aws/signup/page.tsx` | `LANG_BTN` · `LEGAL_VIEW_BUTTON` · `SUBMIT_BUTTON` · `langBtn` · `submitButton` |
| `app/globals.css` | `processButton` · `sideButtons` · `toolbarButton` · `uploadPillButton` |
| `app/highlight/[projectId]/shorts/[shortId]/page.tsx` | `SHORT_RESULT_ACTION_BTN` · `SHORT_RESULT_SOFT_BTN` · `cancelBtn` · `shortResultActionBtn` · `shortResultSoftBtn` · `upgradeBtn` |
| `app/HomePageClient.tsx` | `TIER_BUTTON` · `tryButton` |
| `app/inquiry/InquiryClient.tsx` | `ATTACH_BUTTON` · `SUBMIT_BUTTON` |
| `app/keyframes.css` | `loginButtonSpin` |
| `app/login/page.tsx` | `SUBMIT_BUTTON` · `SUBMIT_BUTTON_DISABLED` · `SUBMIT_BUTTON_ENABLED` · `SUBMIT_BUTTON_LABEL` · `SUBMIT_BUTTON_LOADING` · `SUBMIT_BUTTON_LOADING_ACTIVE` · `SUBMIT_BUTTON_LOADING_REST` · `SUBMIT_BUTTON_SPINNER` · `passwordClearButton` · `submitButton` · `submitButtonLoading` · `submitButtonLoadingActive` · `submitButtonSpinner` |
| `app/mypage/topup/fail/page.tsx` | `STATUS_BUTTON_PRIMARY` |
| `app/mypage/topup/success/page.tsx` | `STATUS_BUTTON_PRIMARY` |
| `app/mypage/upgrade/billing-change-fail/page.tsx` | `STATUS_BUTTON_PRIMARY` |
| `app/mypage/upgrade/billing-change-success/page.tsx` | `STATUS_BUTTON_PRIMARY` |
| `app/mypage/upgrade/billing-fail/page.tsx` | `STATUS_BUTTON_BASE` · `STATUS_BUTTON_PRIMARY` · `STATUS_BUTTON_SECONDARY` |
| `app/mypage/upgrade/billing-success/page.tsx` | `STATUS_BUTTON_PRIMARY` · `STATUS_BUTTON_SECONDARY` |
| `app/mypage/upgrade/checkout/page.tsx` | `CHROME_BACK_BUTTON` · `mainChromeBackButton` |
| `app/mypage/upgrade/fail/page.tsx` | `STATUS_BUTTON_BASE` · `STATUS_BUTTON_PRIMARY` · `STATUS_BUTTON_SECONDARY` |
| `app/mypage/upgrade/page.tsx` | `CHROME_BACK_BUTTON` · `TIER_BUTTON` · `TIER_BUTTON_CURRENT` · `mainChromeBackButton` |
| `app/mypage/upgrade/TossPaymentWindowPanel.tsx` | `CHECKOUT_PAY_BUTTON` |
| `app/recover/page.tsx` | `SUBMIT_BUTTON` · `SUBMIT_BUTTON_DISABLED` · `SUBMIT_BUTTON_ENABLED` |
| `app/reset-password/new/page.tsx` | `SECONDARY_BUTTON` · `SUBMIT_BUTTON` · `newPasswordButton` · `secondaryButton` · `submitButton` |
| `app/reset-password/page.tsx` | `PRIMARY_BUTTON` · `SECONDARY_BUTTON` · `primaryButton` · `resendButton` · `secondaryButton` · `submitButton` |
| `app/signup/check-email/SignupCheckEmailClient.tsx` | `PRIMARY_BUTTON` · `SECONDARY_BUTTON` · `primaryButton` · `resendButton` · `secondaryButton` |
| `app/signup/expired/page.tsx` | `PRIMARY_BUTTON` · `primaryButton` · `signupButton` |
| `app/signup/page.tsx` | `LEGAL_VIEW_BUTTON` · `SUBMIT_BUTTON` · `submitButton` |
| `app/signup/verified/page.tsx` | `PRIMARY_BUTTON` · `loginButton` · `primaryButton` |
| `app/videoeditor/[projectId]/EditorProjectWorkspace.tsx` | `LEAVE_DISCARD_BTN` · `SETTINGS_ROW_BUTTON` · `cancelBtn` · `leaveDiscardBtn` · `mainChromeBackButton` · `settingsRowButton` · `upgradeBtn` |
| `components/banners/TabBannerCarousel.tsx` | `ARROW_BUTTON` |
| `components/landing/demo-snapshots/StaticAnalyticsDemo.tsx` | `PERIOD_BTN` · `PERIOD_BTN_ACTIVE` · `PERIOD_BTN_IDLE` · `activeBtn` · `periodBtn` · `periodBtnActive` |
| `components/landing/demo-snapshots/StaticArchiveDemo.tsx` | `archiveMoreButton` · `createButton` · `floatingCreateButton` |
| `components/landing/demo-snapshots/StaticCreateDemo.tsx` | `NAV_BUTTON_FOCUS_RING` · `NAV_BUTTON_FOCUS_RING_LIGHT` · `WALKTHROUGH_NAV_BUTTON` |
| `components/landing/demo-snapshots/StaticGnb.tsx` | `LOGO_BUTTON` · `logoButton` |
| `components/landing/demo-snapshots/StaticHighlightDemo.tsx` | `generateBtnHost` |
| `components/landing/navigation/Gnb.tsx` | `tryButton` · `tryButtonLabel` |
| `components/landing/sections/AppHomeLiveDemo.tsx` | `DEMO_CTA_BUTTON` |
| `components/landing/sections/CapabilitiesShowcase.tsx` | `PREVIEW_RESET_BUTTON` · `RESOLUTION_BUTTON` · `RESOLUTION_BUTTON_ACTIVE` · `RESOLUTION_BUTTON_IDLE` · `previewResetButton` · `resolutionButton` · `resolutionButtonActive` |
| `components/landing/sections/Hero.tsx` | `CTA_BUTTON` |
| `components/landing/sections/PricingSection.tsx` | `TIER_BUTTON` |
| `components/landing/system/messages/en.ts` | `analyticsConnectBtn` · `analyzeButton` · `cancelBtn` · `confirmBtn` · `confirmDeleteBtn` · `confirmUploadBtn` · `connectBtn` · `connectButton` · `createButton` · `editEdgeRemoveConfirmBtn` · `extractButton` · `headerDoneButton` · `headerExportButton` · `headerResetButton` · `headerViewResultButton` · `inquiryButton` · `lockBriefButton` · `loginButton` · `newPasswordButton` · `nodeDeleteConfirmBtn` · `pricingButtonAria` · `processButton` · `processingButton` · `resendButton` · `sideButtonsV2` · `signupButton` · `submitButton` · `subscribeBtn` · `upgradeBtn` · `uploadButton` · `withdrawalButton` |
| `components/landing/system/messages/ja-overrides-create.ts` | `analyzeButton` · `cancelBtn` · `confirmBtn` · `confirmDeleteBtn` · `confirmUploadBtn` · `editEdgeRemoveConfirmBtn` · `headerDoneButton` · `headerExportButton` · `headerResetButton` · `headerViewResultButton` · `nodeDeleteConfirmBtn` · `pricingButtonAria` · `processButton` · `processingButton` · `sideButtonsV2` · `subscribeBtn` · `uploadButton` |
| `components/landing/system/messages/ja-overrides-landing.ts` | `lockBriefButton` · `uploadButton` |
| `components/landing/system/messages/ja-overrides-surface.ts` | `analyticsConnectBtn` · `cancelBtn` · `connectBtn` · `connectButton` · `createButton` · `extractButton` · `inquiryButton` · `loginButton` · `newPasswordButton` · `resendButton` · `signupButton` · `submitButton` · `upgradeBtn` · `withdrawalButton` |
| `components/landing/system/messages/ko.ts` | `analyticsConnectBtn` · `analyzeButton` · `cancelBtn` · `confirmBtn` · `confirmDeleteBtn` · `confirmUploadBtn` · `connectBtn` · `connectButton` · `createButton` · `editEdgeRemoveConfirmBtn` · `extractButton` · `headerDoneButton` · `headerExportButton` · `headerResetButton` · `headerViewResultButton` · `inquiryButton` · `lockBriefButton` · `loginButton` · `newPasswordButton` · `nodeDeleteConfirmBtn` · `pricingButtonAria` · `processButton` · `processingButton` · `resendButton` · `sideButtonsV2` · `signupButton` · `submitButton` · `subscribeBtn` · `upgradeBtn` · `uploadButton` · `withdrawalButton` |
| `components/legal/LegalDocumentBackButton.tsx` | `BACK_BUTTON` · `BACK_BUTTON_ICON` · `backButton` · `backButtonIcon` |
| `components/navigation/CommandPalette.tsx` | `CLOSE_BTN` |
| `components/navigation/Gnb.tsx` | `backButtonLoading` · `iconButton` · `logoButton` · `mobileMenuButton` · `mobileMenuCloseButton` · `mobileMenuUpgradeButton` · `profileMenuThemeBtn` · `profileMenuThemeBtnActive` · `projectGuideButton` · `projectGuideButtonActive` · `projectSaveButton` · `searchButtonRef` · `showNodeGuideButton` · `showPricingButton` · `sidebarUpgradeButton` · `sidebarUpgradeButtonActive` · `themeButtons` |
| `components/projects/CreateProjectModal.tsx` | `MODAL_BUTTON` · `upgradeBtn` |
| `components/scenes/analytics/AnalyticsAccountMoreMenu.tsx` | `toolbarButton` |
| `components/scenes/analytics/PerformanceTab.tsx` | `PERIOD_BTN` · `PERIOD_BTN_ACTIVE` · `PERIOD_BTN_INACTIVE` · `periodBtn` · `periodBtnActive` |
| `components/scenes/AppHomeScene.tsx` | `archiveMoreButton` · `bannerArrowButton` |
| `components/scenes/appHomeSceneStyles.ts` | `archiveMoreButton` · `bannerArrowButton` · `floatingCreateButton` |
| `components/scenes/archive/PlatformSection.tsx` | `ACTION_ROW_BUTTON` · `ANALYSIS_BUTTON` · `ANALYSIS_BUTTON_LOADING` · `HEADER_BTN` · `HEADER_EMPTY_SLOT_BUTTON` · `actionRowButton` · `analysisButton` · `analysisButtonLoading` · `platformHeaderBtn` · `platformHeaderEmptySlotButton` · `uploadButton` |
| `components/scenes/archive/YoutubeVideoAnalyticsView.tsx` | `BACK_ICON_BUTTON` · `backIconButton` |
| `components/scenes/create/ComposerBar.tsx` | `ASSET_FOOTER_BUTTON` · `COMPOSER_ASSET_BUTTONS` · `COMPOSER_SEGMENT_BUTTON_ACTIVE` · `COMPOSER_SEGMENT_BUTTON_BASE` · `COMPOSER_SEGMENT_BUTTON_IDLE` · `DURATION_STEP_BTN_BASE` · `DURATION_STEP_BTN_DISABLED` · `DURATION_STEP_BTN_ENABLED` · `DURATION_STEP_BTN_FIRST` · `DURATION_STEP_BTN_LAST` · `SUBMIT_BUTTON_BASE` · `SUBMIT_BUTTON_DISABLED` · `SUBMIT_BUTTON_ENABLED` · `VIEW_MODE_BUTTON_ACTIVE` · `VIEW_MODE_BUTTON_BASE` · `VIEW_MODE_BUTTON_IDLE` |
| `components/scenes/create/ConfirmModal.tsx` | `MODAL_BUTTON_BASE` |
| `components/scenes/create/CustomDropdown.tsx` | `optionButtons` |
| `components/scenes/create/guide/ModelSpecPanel.tsx` | `sideButtonsV2` |
| `components/scenes/create/guide/WorkflowRecipesPanel.tsx` | `GUIDE_RECIPE_DEMO_BUTTON` |
| `components/scenes/create/ImageCropModal.tsx` | `CROP_MODAL_APPLY_BUTTON` · `CROP_MODAL_CANCEL_BUTTON` · `CROP_MODAL_CLOSE_BUTTON` |
| `components/scenes/create/ImageLightbox.tsx` | `LIGHTBOX_ACTION_BUTTON` · `lightboxActionButton` |
| `components/scenes/create/node-canvas-v2/components/ActionButton.tsx` | `ACTION_BUTTON` · `actionButton` |
| `components/scenes/create/node-canvas-v2/components/CanvasZoomControl.tsx` | `ZOOM_LABEL_BUTTON` |
| `components/scenes/create/node-canvas-v2/components/CreditConfirmModal.tsx` | `cancelBtn` · `confirmBtn` |
| `components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx` | `MODAL_BUTTON_BASE` · `cancelBtnRef` · `confirmBtnRef` |
| `components/scenes/create/node-canvas-v2/components/NodeDeleteConfirmModal.tsx` | `nodeDeleteConfirmBtn` |
| `components/scenes/create/node-canvas-v2/components/NodeLayersPanel.tsx` | `COLLAPSE_BTN` · `ROW_COLLAPSE_BTN` · `rowCollapseBtn` |
| `components/scenes/create/node-canvas-v2/components/NodePromptInputCopyButton.tsx` | `COPY_BUTTON` · `COPY_BUTTON_BASE` · `COPY_BUTTON_DISABLED` · `promptInputCopyButton` · `promptInputCopyButtonDisabled` |
| `components/scenes/create/node-canvas-v2/components/PaneContextMenu.tsx` | `sideButtonsV2` |
| `components/scenes/create/node-canvas-v2/components/ProjectVideosPopover.tsx` | `ITEM_BUTTON` |
| `components/scenes/create/node-canvas-v2/components/PromptVariantCompareModal.tsx` | `CLOSE_BTN` · `USE_BTN` |
| `components/scenes/create/node-canvas-v2/components/Toolbar.tsx` | `TOOLBAR_BUTTON` · `TOOLBAR_BUTTON_ACTIVE` · `TOOLBAR_BUTTON_BASE` · `TOOLBAR_BUTTON_TONE_ACTIVE` · `TOOLBAR_BUTTON_TONE_IDLE` · `sideButtonsV2` · `toolbarButton` · `toolbarButtonActive` |
| `components/scenes/create/node-canvas-v2/components/YoutubeSchedulePickers.tsx` | `DAY_BTN_BASE` · `DAY_BTN_DISABLED_INK` · `DAY_BTN_IDLE` · `DAY_BTN_PAST` · `DAY_BTN_SELECTED` · `DAY_BTN_SELECTED_FILL` · `DAY_BTN_SELECTED_PAST` · `FOOTER_BTN_BASE` · `FOOTER_BTN_DISABLED` · `FOOTER_BTN_ENABLED` · `dayBtn` · `dayBtnClass` · `dayBtnDisabled` · `dayBtnSelected` · `footerBtn` |
| `components/scenes/create/node-canvas-v2/edges/DeletableEdge.tsx` | `DELETE_BTN` |
| `components/scenes/create/node-canvas-v2/hooks/useShowcaseWalkthrough.ts` | `handleVideoToYoutubeButtonPressOverlayComplete` · `setVideoToYoutubeButtonPressWalkthroughActive` · `videoToYoutubeButtonPressWalkthroughActive` |
| `components/scenes/create/node-canvas-v2/index.tsx` | `TOOLBAR_BUTTON` · `TOOLBAR_BUTTON_ACTIVE` · `TOOLBAR_BUTTON_BASE` · `TOOLBAR_BUTTON_TONE_ACTIVE` · `TOOLBAR_BUTTON_TONE_IDLE` · `cancelBtn` · `editEdgeRemoveConfirmBtn` · `handleVideoToYoutubeButtonPressOverlayComplete` · `sideButtonsV2` · `subscribeBtn` · `toolbarButton` · `toolbarButtonActive` · `upgradeBtn` · `videoToYoutubeButtonPressWalkthroughActive` |
| `components/scenes/create/node-canvas-v2/lib/archiveThumbnail/canvasPrimitives.ts` | `ACTION_BTN` · `SIDE_BTN` · `SIDE_BTN_GAP` · `drawGlassCircleButton` · `drawLeftSideButtonColumn` · `metaIconButton` · `sideButtonStackCenterY` |
| `components/scenes/create/node-canvas-v2/lib/archiveThumbnail/drawNodes.ts` | `SIDE_BTN` · `SIDE_BTN_GAP` · `drawGlassCircleButton` · `drawLeftSideButtonColumn` · `editUploadButton` · `processButton` · `sideButtonsV2` · `textBtnDisabled` · `uploadButton` · `uploadPillButton` |
| `components/scenes/create/node-canvas-v2/lib/archiveThumbnail/layout.ts` | `SIDE_BTN` · `SIDE_BTN_GAP` · `drawLeftSideButtonColumn` · `sideButtonStackCenterY` · `sideButtonsAnchorMediaBand` |
| `components/scenes/create/node-canvas-v2/lib/editorProjectThumbnail.ts` | `panelTabStripBtn` |
| `components/scenes/create/node-canvas-v2/lib/videoEdit/modalConstants.ts` | `SEQUENCE_TIMELINE_ZOOM_BUTTON_STEP` |
| `components/scenes/create/node-canvas-v2/NodeCanvasAnalysisModal.tsx` | `CLOSE_BUTTON` |
| `components/scenes/create/node-canvas-v2/nodes/BgmNode.tsx` | `AUDIO_PLAY_BTN` · `MODE_SEGMENT_BTN` · `MODE_SEGMENT_BTN_ACTIVE` · `MODE_SEGMENT_BTN_BASE` · `cancelBtn` · `modeSegmentBtn` · `modeSegmentBtnActive` · `upgradeBtn` |
| `components/scenes/create/node-canvas-v2/nodes/ColorPopover.tsx` | `EYEDROPPER_BUTTON` · `ICON_BUTTON` · `SWATCH_BUTTON` · `swatchButton` |
| `components/scenes/create/node-canvas-v2/nodes/CropModal.tsx` | `ASPECT_BUTTON` · `ASPECT_BUTTON_BASE` · `ASPECT_BUTTON_SELECTED` · `ASPECT_BUTTON_TONE_IDLE` · `ASPECT_BUTTON_TONE_SELECTED` · `CANCEL_BUTTON` · `CLOSE_BUTTON` · `CONFIRM_BUTTON` |
| `components/scenes/create/node-canvas-v2/nodes/EditNode.tsx` | `PROCESS_BUTTON` · `PROCESS_BUTTON_PROCESSING` · `PROCESS_BUTTON_SPINNER` · `editNodeInstagramButton` · `editNodeOutputButton` · `editNodeOutputButtonInactive` · `editUploadButton` · `processButton` · `processButtonDisabled` · `processingButton` · `showSeekSkipButtons` · `sideButtonsV2` |
| `components/scenes/create/node-canvas-v2/nodes/ImageNode.tsx` | `imageButtonDisabled` · `imageButtonDisabledHint` · `imageSideButtonDisabled` · `imageSideButtonDisabledHint` · `showGenerateButton` · `sideButtonsV2` · `walkthroughGenBtnRef` |
| `components/scenes/create/node-canvas-v2/nodes/InstagramNode.tsx` | `CONFIRM_BTN_PRIMARY` · `CONFIRM_BTN_PRIMARY_DANGER` · `CONFIRM_BTN_SECONDARY` · `TOOLBAR_BUTTON` · `UPLOAD_PILL_BUTTON` · `UPLOAD_PILL_BUTTON_DISABLED` · `analyzeButton` · `cancelBtn` · `confirmBtn` · `confirmDeleteBtn` · `confirmUploadBtn` · `processButton` · `upgradeBtn` · `uploadButton` · `uploadPillButton` · `uploadPillButtonDisabled` |
| `components/scenes/create/node-canvas-v2/nodes/NodeSideButtons.tsx` | `SIDE_BUTTONS` · `SIDE_BUTTONS_ANCHOR_MEDIA_BAND` · `SIDE_BUTTON_FACET_BASE` · `SIDE_BUTTON_FACET_INNER_SHADOW` · `SIDE_BUTTON_INERT` · `SIDE_BUTTON_INERT_PRESSED` · `SIDE_BUTTON_INTERACTIVE` · `SIDE_BUTTON_INTERACTIVE_PRESSED` · `SIDE_BUTTON_SHELL` · `effectiveImageButtonDisabled` · `effectiveImageButtonDisabledHint` · `hideTextButton` · `imageButtonDisabled` · `imageButtonDisabledHint` · `setWalkthroughReferenceMenuButtonPressed` · `setWalkthroughTextMenuButtonPressed` · `sideButtons` · `sideButtonsAnchorScope` · `sideButtonsV2` · `walkthroughReferenceMenuButtonPressed` · `walkthroughTextMenuButtonPressed` |
| `components/scenes/create/node-canvas-v2/nodes/SectionNode.tsx` | `COLOR_BTN` |
| `components/scenes/create/node-canvas-v2/nodes/TextNode.tsx` | `cancelBtn` · `embedLlmGenButtonDisabledLook` · `sideButtonsV2` · `upgradeBtn` · `walkthroughGenBtnRef` |
| `components/scenes/create/node-canvas-v2/nodes/TtsNode.tsx` | `AUDIO_PLAY_BTN` · `cancelBtn` · `upgradeBtn` |
| `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx` | `SEQUENCE_TIMELINE_ZOOM_BUTTON_STEP` · `alignButton` · `alignButtonActive` · `alignButtonGroup` · `assetRailBtn` · `assetRailBtnActive` · `audioClipBtn` · `audioTrackMuteBtn` · `audioTrackMuteBtnActive` · `cancelBtn` · `clipRegionRemoveBtn` · `confirmBtn` · `guidesBtnOn` · `headerCloseXBtn` · `headerDoneButton` · `headerExportButton` · `headerResetBtn` · `headerResetButton` · `headerViewResultButton` · `inspectorAudioIconBtn` · `inspectorAudioIconBtnMuted` · `inspectorFieldRemoveBtn` · `inspectorToggleBtn` · `inspectorToggleBtnActive` · `overlayDeleteBtn` · `overlayDeleteBtnGlyph` · `overlayDeleteBtnIcon` · `overlayUploadBtn` · `previewControlsBtn` · `previewControlsBtnActive` · `previewDockZoomStepBtn` · `projectImportBackBtn` · `propertiesGhostBtn` · `shortcutCloseBtn` · `sourceItemRemoveBtn` · `sourceSectionAddBtn` · `timelineDockToolbarBtn` · `timelineVisibilityBtn` · `upgradeBtn` |
| `components/scenes/create/node-canvas-v2/nodes/videoEditParts/ClipCropModal.tsx` | `CROP_ACTION_BTN` · `CROP_APPLY_BTN` · `CROP_CLOSE_BTN` · `CROP_MODE_BTN` · `CROP_MODE_BTN_ACTIVE` · `CROP_MODE_BTN_IDLE` · `CROP_RESET_BTN` |
| `components/scenes/create/node-canvas-v2/nodes/videoEditParts/effectsTabRow.tsx` | `EFFECTS_TAB_PICK_BTN` · `effectsTabPickBtn` |
| `components/scenes/create/node-canvas-v2/nodes/VideoModelMenu.tsx` | `pricingButtonAria` |
| `components/scenes/create/node-canvas-v2/nodes/VideoNode.tsx` | `META_ICON_BUTTON` · `META_ICON_BUTTON_BASE` · `META_ICON_BUTTON_DISABLED` · `REFERENCE_VIDEO_ROLE_SEG_BTN` · `cancelBtn` · `promptGenerateButton` · `referenceVideoRoleSegBtn` · `showGenerateButton` · `showSeekSkipButtons` · `sideButtonsV2` · `upgradeBtn` · `walkthroughGenBtnRef` · `xxxUploadButton` · `youtubeUploadButtonInactive` |
| `components/scenes/create/node-canvas-v2/nodes/YoutubeNode.tsx` | `CONFIRM_BTN_PRIMARY` · `CONFIRM_BTN_PRIMARY_DANGER` · `CONFIRM_BTN_SECONDARY` · `TOOLBAR_BUTTON` · `TOOLBAR_BUTTON_DISABLED` · `UPLOAD_PILL_BUTTON` · `UPLOAD_PILL_BUTTON_DISABLED` · `analyzeButton` · `cancelBtn` · `confirmBtn` · `confirmDeleteBtn` · `confirmUploadBtn` · `processButton` · `showSeekSkipButtons` · `toolbarButton` · `toolbarButtonDisabled` · `upgradeBtn` · `uploadButton` · `uploadPillButton` · `uploadPillButtonDisabled` · `walkthroughUploadBtnRef` · `youtubeUploadButtonInactive` |
| `components/scenes/create/node-canvas-v2/WalkthroughVideoToYoutubeButtonPressOverlay.tsx` | `youtubeBtn` |
| `components/scenes/create/node-canvas/thumbnail.ts` | `outputButtonFill` |
| `components/scenes/create/NodeCanvasGuideModal.tsx` | `GUIDE_MODAL_CLOSE_BUTTON` · `GUIDE_MODAL_TAB_SEGMENT_BTN` · `GUIDE_MODAL_TAB_SEGMENT_BTN_ACTIVE` · `GUIDE_MODAL_TAB_SEGMENT_BTN_ACTIVE_CLS` · `GUIDE_MODAL_TAB_SEGMENT_BTN_BASE` · `GUIDE_MODAL_TAB_SEGMENT_BTN_IDLE` · `iconButton` |
| `components/scenes/create/PhotoGrid.tsx` | `ASSET_ACTION_BUTTON` · `ASSET_EMPTY_BUTTON` |
| `components/scenes/create/PricingModal.tsx` | `PRICING_MODAL_CLOSE_BUTTON` |
| `components/scenes/create/ProjectHeader.tsx` | `FLAT_ICON_BUTTON_BASE` · `GUIDE_BUTTON_ACTIVE` · `GUIDE_BUTTON_IDLE` · `LOGO_CLUSTER_BUTTON` · `SAVE_BUTTON` · `SHELL_ICON_BUTTON_BASE` · `iconButton` · `projectGuideButtonActive` · `projectVideosButtonRef` · `showNodeGuideButton` · `showPricingButton` |
| `components/scenes/create/PublishFlow.tsx` | `ACTION_BUTTON_BASE` · `AUTO_GENERATE_BUTTON` · `AUTO_GENERATE_BUTTON_INNER` · `UPLOAD_BUTTON_LOADING` · `UPLOAD_BUTTON_SPINNER` |
| `components/scenes/create/ShotCarousel.tsx` | `SHOT_STEP_BTN` |
| `components/scenes/CreateScene.tsx` | `showNodeGuideButton` |
| `components/scenes/HighlightCreateModal.tsx` | `MODAL_CLOSE_BUTTON` |
| `components/scenes/HighlightProjectScene.tsx` | `HIGHLIGHT_BACK_BUTTON` · `backButton` · `cancelBtn` · `downloadAllButton` · `extractButton` · `refinementPrimaryBtn` · `refinementRevertBtn` · `refinementUpgradeBtn` · `showSeekSkipButtons` · `upgradeBtn` · `viewToggleButton` · `viewToggleButtonActive` |
| `components/scenes/HighlightScene.tsx` | `generateBtnHost` · `historyMoreButton` |
| `components/scenes/highlightSceneStyles.ts` | `backButton` · `downloadAllButton` · `generateBtnHost` · `historyMoreButton` · `refinementPrimaryBtn` · `refinementRevertBtn` · `refinementUpgradeBtn` · `viewToggleButton` · `viewToggleButtonActive` |
| `components/scenes/InstagramAnalyticsScene.tsx` | `CONNECT_NOTICE_BTN` · `PERIOD_BTN` · `PERIOD_BTN_ACTIVE` · `PERIOD_BTN_COMMON` · `connectBtn` |
| `components/scenes/myPageSceneStyles.ts` | `creditHistoryPageBtn` · `dangerButton` · `planTabOutlineButton` · `planTabPrimaryButton` · `settingsAvatarApplyButton` · `settingsRowButton` · `settingsRowDangerButton` · `settingsToggleBtn` · `settingsToggleBtnActive` · `skeletonButtonWide` · `withdrawalButton` |
| `components/scenes/NodeCanvasHomeScene.tsx` | `ARCHIVE_MORE_BUTTON` · `MODAL_BUTTON_BASE` · `archiveMoreButton` |
| `components/scenes/SegmentedToggle.tsx` | `settingsToggleBtn` · `settingsToggleBtnActive` |
| `components/scenes/SettingsScene.tsx` | `inquiryButton` · `settingsAvatarApplyButton` · `settingsRowButton` · `settingsRowDangerButton` |
| `components/scenes/SubscriptionScene.tsx` | `creditHistoryPageBtn` · `dangerButton` · `planTabOutlineButton` · `planTabPrimaryButton` · `skeletonButtonWide` · `withdrawalButton` |
| `components/scenes/VideoEditProjectPicker.tsx` | `DRILL_BACK_BTN` · `IMPORT_BUTTON` |
| `components/scenes/VideoEditScene.tsx` | `HISTORY_MORE_BUTTON` · `historyMoreButton` |
| `components/scenes/YoutubeAnalyticsScene.tsx` | `CHANNEL_DESC_BUTTON` · `CONNECT_NOTICE_BTN` · `PERIOD_BTN` · `PERIOD_BTN_ACTIVE` · `PERIOD_BTN_COMMON` · `analyticsConnectBtn` · `cancelBtn` · `upgradeBtn` |
| `components/signup/SignupLegalModal.tsx` | `CLOSE_BUTTON` · `closeButton` |
| `components/templates/CopyPromptButton.tsx` | `COPY_BUTTON_CLASS` · `COPY_BUTTON_DONE_CLASS` · `COPY_BUTTON_IDLE_CLASS` · `copyButton` · `copyButtonDone` |
| `components/templates/TemplateResultCarousel.tsx` | `NAV_BTN_CLASS` |
| `components/ui/VideoPlayer.tsx` | `APPLE_SKIP_BTN` · `CENTER_PLAY_BTN` · `CONTROL_BTN` · `DOWNLOAD_BTN` · `DOWNLOAD_BTN_Z_APPLE` · `DOWNLOAD_BTN_Z_DEFAULT` · `EXPAND_MODAL_CLOSE_BTN` · `EXPAND_PREVIEW_BTN` · `appleSkipBtn` · `centerPlayBtn` · `controlBtn` · `downloadBtn` · `expandCloseBtnRef` · `expandModalCloseBtn` · `showSeekSkipButtons` |
| `components/youtube/YoutubeUploadModal.tsx` | `CLOSE_BTN` · `LINK_BTN` · `WATCH_MORE_BTN` · `WATCH_SEG_BTN` · `YT_BTN` · `YT_PLAY_BTN` · `YT_SETTINGS_BTN` · `connectButton` · `ytBtn` |
<!-- GENERATED:button-inventory END -->


**유지보수:** 위 표는 코드에서 생성된다. 손으로 고치지 말고 `pnpm check-design-system --write` 로 다시 만든다. 예전에는 이 목록을 손으로 적었고, Tailwind 전환으로 클래스가 사라지는 동안 문서만 남아 실재하지 않는 이름 85 개를 가리키고 있었다.

### 6.8 Auth Two-Panel Theme (Login / Signup / AuthStatusCard)

`/login`, `/signup`, 그리고 `AuthStatusCard` 가 렌더하는 모든 인증 상태 페이지(`/reset-password`, `/reset-password/new`, `/signup/check-email|verified|expired`, `/(highlight-standalone)/hl-signup/check-email`) 가 동일한 **좌측 브랜드 패널 + 우측 폼 패널** 2컬럼 레이아웃을 공유한다.

**원천 파일 (`apps/web`):**

| 역할                           | 파일                                                      |
| ------------------------------ | --------------------------------------------------------- |
| 로그인 페이지                  | `app/login/page.tsx` (Tailwind 전환 완료)                 |
| 회원가입 페이지                | `app/signup/page.tsx` (Tailwind 전환 완료)                |
| 상태 카드(공용 래퍼)           | `components/auth/AuthStatusCard.tsx` (Tailwind 전환 완료) |
| 평면 심볼 마크(`currentColor`) | `components/ui/BrandSymbolMark.tsx`                       |

#### 레이아웃 (≥720px)

- 페이지: `display: grid; grid-template-columns: 1fr 1fr; padding: 20px; gap: 20px; background: var(--gray-900);`
- 좌측 `brandPanel`:
  - 배경: `background-color: #0093ff;` + `background-image: url("/footer-logo-bg.svg")` (full-bleed)
  - `border-radius: 12px`, `padding: 20px`
  - flex column / `justify-content: space-between` — 심볼 좌상단, 슬로건 좌하단
- 우측 `formPanel`: `display: grid; place-items: center; padding: clamp(32px, 6svh, 72px) 32px;`

#### 브랜드 마크 (`brandSymbol`)

- 컴포넌트: `<BrandSymbolMark />` — viewBox `0 0 800 800` 단일 path, `fill="currentColor"` 라 CSS `color` 만으로 톤 제어
- 표시 톤: `var(--gray-000)` (다크 패널 위 화이트 평면 — Figma 큐브 그라디언트 효과는 의도적으로 사용 안 함)
- 크기: `36px × 36px`

#### 슬로건 (`brandSlogan`)

- 텍스트: `messages.footer.tagline`
- 타이포: `type-heading-36-medium` 기본, **≥1200px** 미디어 쿼리에서 `type-heading-48` 토큰 값으로 한 단계 상승 (`--type-heading-48-size/line-height/letter-spacing` 직접 적용)
- 컬러: `var(--gray-000)`

#### 모바일 (<720px)

- 단일 컬럼. `brandPanel { display: none; }`, `formPanel { display: contents; }` 로 폼만 노출.
- `logoLink` (워드마크 `<BrandLogo>`) 가 폼 카드 상단에 노출되어 브랜딩 보조.

#### 버튼 곡률

- `submitButton`(login/signup), `primaryButton`/`secondaryButton`(AuthStatusCard), `LEGAL_VIEW_BUTTON`(signup) — **모두 `border-radius: 12px`** 로 통일. 과거 pill(`999px`) 사용 패턴 제거.

### 6.9 Node Anatomy (Create — 노드 캔버스 V2 카드)

**6.6** 이 노드 카드의 *면·외곽선 토큰*을 다룬다면, 이 절은 그 카드가 **무엇으로 이루어지고 어떤 순서로 쌓이는지**를 다룬다 — 부품, 세로 리듬, 동심원 곡률, 사이드 컨트롤 좌표, 줌 역보정. 노드 8종이 이 구조를 공유하므로, 새 노드는 여기서 시작한다.

**원천 파일 (`apps/web`):**

| 역할 | 파일 |
| --- | --- |
| 노드 구조 상수 (`NODE_CONTAINER` · `NODE_MAIN` · `NODE_WRAP` · `NODE_HEADER_ABOVE` · `PROMPT_*`) | `components/scenes/create/node-canvas-v2/nodes/*.tsx` (노드마다 자기 파일에 선언) |
| 카드 곡률·내부 패딩·세로 간격 규칙 SSOT | `components/scenes/create/node-canvas-v2/index.tsx` 의 `CANVAS_SHELL_BASE` |
| 사이드 핸들·레일 기하 토큰 | `app/globals.css` `:root` (`--node-side-*`) |
| 사이드 기하 TS 미러 상수 | `components/scenes/create/node-canvas-v2/constants.ts` |
| 헤더 액션(다운로드·삭제) | `components/scenes/create/node-canvas-v2/components/NodeHeaderActions.tsx` |
| 좌측 사이드 버튼 레일 | `components/scenes/create/node-canvas-v2/nodes/NodeSideButtons.tsx` |

#### 적층 순서 (바깥 → 안)

```
노드 컨테이너 (NODE_CONTAINER — 완전 투명)
├─ 헤더 밴드 (NODE_HEADER_ABOVE)   ← 카드 **바깥·위**. 카드의 형제이며 카드보다 앞선다.
└─ NODE_MAIN                       ← 사이드 컨트롤 좌표의 기준 박스
   └─ 카드 (NODE_WRAP)
      ├─ 미디어 밴드
      ├─ 본문 밴드 (NODE_BODY)     ← 오디오 노드(Bgm/Tts)에만 존재
      └─ 프롬프트 밴드 (PROMPT_AREA)
         └─ 프롬프트 셸 (PROMPT_FIELD_SHELL)
            ├─ 연결 칩 / 참조 미디어
            ├─ 복사 · 글자수 행
            ├─ textarea
            └─ foot tray (PROMPT_FOOTER)
```

사이드 핸들과 사이드 버튼 레일은 이 스택 밖에 `absolute` 로 붙는다.

> **이 구조의 핵심은 헤더가 카드 안이 아니라 카드 위에 별도 행으로 뜬다는 것이다.** 카드는
> `overflow-visible` 이라 헤더를 클리핑하지도 않는다. 헤더를 카드 안으로 옮기면
> `-mb-3`(−6px)로 컨테이너 `gap-5`(10px)를 상쇄해 만든 **헤더↔카드 4px** 산식이 통째로 깨진다.

#### 부품별 치수

간격 유틸리티는 전부 `--spacing: 2px` 기준이다(`gap-5` = 10px, `gap-4` = 8px, `px-1` = 2px, `-mb-3` = −6px). 곡률(`rounded-16` 등)은 px 스케일이라 이 배수가 적용되지 않는다.

| 부품 | 레이아웃 · 치수 | 면 · 곡률 |
| --- | --- | --- |
| 노드 컨테이너 `NODE_CONTAINER` | `relative flex flex-col items-center gap-5` → 자식 간 **10px**. 자식은 정확히 둘(헤더 밴드, `NODE_MAIN`) | 없음(완전 투명). 로컬 토큰 `[--node-card-width:400px]` · `[--node-side-outset:0px]` 를 여기서 선언 |
| 헤더 밴드 `NODE_HEADER_ABOVE` | `flex items-center justify-between gap-4`(**8px**) · `w-[var(--node-card-width)]` · `ml-[var(--node-side-outset,0px)]` · `py-0 px-1`(상하 0 / 좌우 **2px**) · `box-border` · `-mb-3`(**−6px**) | 면·테두리·곡률·그림자 **전부 없음** — 캔버스 배경 위에 글자·아이콘만 뜬다 |
| `NODE_MAIN` | `relative w-[calc(var(--node-card-width) + 2 * var(--node-side-outset))]` | 없음. 사이드 절대배치의 기준 컨테이닝 블록 |
| 카드 `NODE_WRAP` | `relative w-[var(--node-card-width)]`(**400px**) · `ml-[var(--node-side-outset)]` · `box-border` · `overflow-visible` · `cursor-default select-none` | `rounded-[var(--node-outer-radius,24px)]`. 면·외곽선은 **6.6절** 참조 |
| 미디어 밴드 — 변형 A (Image/Video/Text/Edit) | `relative w-full`, **패딩 0** → 미디어가 카드 안쪽 모서리에 밀착 | 미디어 영역 자체가 상단만 `rounded-t-[var(--node-inner-radius)]` + `overflow-hidden` 으로 자른다 |
| 미디어 밴드 — 변형 B (Bgm/Tts) | `relative w-full box-border` · `p-[var(--node-inner-padding,8px)] pb-0`(상·좌·우 **8px**, 하 0) · `[&:empty]:p-0` | 결과 카드가 자기 곡률 `rounded-16` + `0.5px solid rgb(var(--accent-pink-500-rgb)/20%)` + 면 `rgb(var(--accent-pink-500-rgb)/10%)`(양 테마 동일) + 내부 패딩 8px |
| 본문 밴드 `NODE_BODY` (오디오 전용) | `flex flex-col gap-4`(**8px**) · 상·우·좌 `--node-inner-padding` · **`pb-0`** · `box-border` | 없음 |
| 프롬프트 밴드 `PROMPT_AREA` | `relative flex flex-col items-stretch gap-4`(**8px**) · `p-[var(--node-inner-padding,8px)]`(4방향 **8px**) | `bg-transparent`. 카드의 마지막 요소일 때 `rounded-b-[var(--node-inner-radius)]` |
| 프롬프트 셸 `PROMPT_FIELD_SHELL` | `relative flex flex-col box-border w-full min-w-0` · 4방향 `--node-inner-padding`(**8px**) · 기본 `min-h-70` = **140px** (참조 미디어가 셸 안에 들어오면 `min-h-0` 으로 해제) | `rounded-[var(--node-input-radius,16px)]` · `[border:0.5px solid rgb(var(--palette-gray-600-rgb)/100%)]`(라이트는 `border-color` 만 `rgb(var(--palette-gray-000-rgb)/100%)` 로 교체) · 면 다크 `var(--palette-gray-700)` / 라이트 `var(--palette-gray-50)` · `backdrop-filter: blur(12px) saturate(120%)` |
| foot tray `PROMPT_FOOTER` | `flex flex-[0_0_auto] flex-col gap-4`(**8px**) · `mt-[var(--node-inner-padding,8px)]`(textarea 와의 간격 **8px**) · `min-w-0` | 없음 |

#### 헤더 밴드 안쪽

- **좌측 — 타이틀 그룹(`NODE_TITLE_WRAP`)**: `flex items-center gap-[5px]`(아이콘↔라벨 **5px**, 2px 격자 밖의 리터럴) · `w-auto min-w-0 m-0 p-0`. 색은 다크 `rgb(var(--palette-gray-500-rgb)/100%)` / 라이트 `rgb(var(--palette-gray-700-rgb)/100%)`. 타이틀 아이콘 16px, 라벨은 `type-body-14-medium` + `leading-[1]!` + `overflow-hidden text-ellipsis whitespace-nowrap!`.
  - `leading-[1]!` 은 `type-body-14` 의 행간 1.5 를 헤더 한 줄에서 1 로 좁혀 아이콘과 시각 중앙을 맞추려는 것이다. `type-*` 는 레이어 밖이라 `!` 가 필요하다.
  - 훅 속성 `data-node-title="plain"` 이 **필수**다 — 선택 시 액센트 규칙이 이 속성으로 걸린다.
- **우측 — 액션(`NodeHeaderActions`)**: 다운로드 + 삭제 2버튼, `gap-0` 으로 **의도적으로 맞붙인다**(`--node-chrome-btn-gap` 을 쓰지 않는다). 버튼은 `w/h = var(--node-chrome-btn-h)`(**32×32px**) · `rounded-[var(--node-chrome-btn-radius)]` · `bg-transparent` · `p-0 border-0`(면은 호버에서만), 글리프 `w-8 h-8` = **16px**. 색은 타이틀과 같은 톤(라이트 `palette-gray-700` / 다크 `palette-gray-500`).
- **헤더 밴드에는 높이 선언이 없다.** 실측 높이는 이 32px 액션 버튼이 결정한다. (타이틀 줄 높이를 `--node-header-inner-h` 로 고정하는지가 노드마다 갈린다 — **7.5절** 참조.)

#### 프롬프트 셸 내부 세로 순서

위 → 아래로 네 칸이며, textarea 가 남는 세로 공간을 흡수해 foot tray 가 셸 바닥에 붙는다.

| 순서 | 요소 | 치수 |
| --- | --- | --- |
| ① | 연결 칩 / 참조 미디어 | `flex-[0_0_auto] self-stretch w-full min-w-0`. 참조 미디어는 `mb-4`(**8px**), 연결 칩은 `mb-0` |
| ② | 복사 · 글자수 행 | `flex-[0_0_28px] w-full min-h-14`(**28px**) `flex flex-row items-center gap-0` |
| ③ | textarea | `flex-[1_1_auto] self-stretch min-h-24`(**48px**) `w-full m-0` · `py-0 px-[var(--node-inner-padding,8px)]`(좌우 8px, **상하 0**) · `resize-none overflow-y-auto` |
| ④ | foot tray | 위 표 참조 |

- 연결 칩 크롬: `inline-flex items-center justify-start w-full min-w-0 gap-2`(4px) · `py-3 px-5`(**6px / 10px**) · `rounded-10` · `[border:0.5px solid rgb(var(--accent-yellow-500-rgb)/20%)]` + 면 `rgb(var(--accent-yellow-500-rgb)/10%)`.
- 복사 행과 textarea 사이 간격이 0 인 것은 의도다 — 복사 버튼 자체의 패딩이 이미 시각 간격을 만든다. 이 행에 `overflow: hidden` 을 걸면 안 된다(복사 버튼 툴팁이 위로 뜨는데 잘린다).

#### foot tray 한 줄의 구성

`PROMPT_FOOTER_CONTROLS` 는 `flex items-center min-w-0 h-16` — **높이 32px 고정** 한 줄이고, 그 줄에 두 덩어리가 들어간다.

- **메타 툴바**: `static flex-[1_1_auto] min-w-0 h-16` · `flex flex-row flex-nowrap items-center justify-start` · 알약 간 `gap-[var(--node-chrome-btn-gap)]`(**4px**) · `bg-transparent [border:none]`.
- **생성 FAB**: `flex flex-[0_0_auto] items-center ml-4`(**8px**).
- 메타 알약 자체의 치수·면은 노드 크롬 버튼 SSOT(`--node-chrome-btn-h` / `-padding-x` / `-radius` / `-bg` / `-border`)를 따른다 — **6.0절** 토큰 인벤토리 참조.

#### 동심원 곡률 규칙

세 토큰은 `CANVAS_SHELL_BASE` 에서 한 번에 선언된다.

| 토큰 | 쓰이는 곳 | 파생 여부 |
| --- | --- | --- |
| `--node-outer-radius` | 카드 최외곽(`NODE_WRAP`) | 원본 |
| `--node-inner-radius` | 카드 경계에 닿는 면(미디어 영역 상단, 프롬프트 밴드 하단) | **outer − 카드 border 두께(2px)** |
| `--node-input-radius` | 카드 안에서 8px 인셋된 박스(프롬프트 셸) | **파생값이 아니라 독립 선언** |

- 파생식의 근거는 **border 2px 이지 패딩이 아니다.** 코드 주석도 "외곽 24px, 2px border 안쪽" 이라고만 적는다.
- 8px 인셋된 박스는 기하학적 동심값(22 − 8 = 14px)이 아니라 **16px** 을 쓴다. 오디오 결과 카드도 같은 16px(`rounded-16`)이다. **버그로 보고 14px 로 "고치지" 말 것.**
- 새 중첩 단계를 만들 때: 카드 경계에 닿는 면은 `--node-inner-radius`, 8px 인셋된 면은 `--node-input-radius` / `rounded-16`.

#### 세로 리듬 규칙 (모든 노드 공통 SSOT)

카드 안에서 세로로 쌓이는 **투명 래퍼는 `padding-bottom` 을 두지 않는다.** 아래 요소가 자기 `padding-top` 으로 간격을 만든다.

```
미디어 밴드 (하단 0) → 본문 밴드 (하단 0) → 프롬프트 밴드 (상단 8px)
                                              ⇒ 각 경계 8px
```

- 단위 값은 전부 `--node-inner-padding`(8px)이다.
- **새 밴드를 끼울 때 위아래 양쪽에 8px 을 주면 16px 이 된다.** 이 규칙이 존재하는 이유가 그것이다.
- 면(배경)을 가진 블록의 패딩은 내부 여백이므로 이 규칙 밖이다 — 오디오 결과 카드, 오류 배너 등.

#### 노드 높이는 무엇이 결정하는가

- 카드 높이를 고정하는 선언이 **없다.** 높이 = 미디어 밴드 + 본문 + 프롬프트 밴드의 합(콘텐츠 구동).
- 프롬프트가 길어져도 노드가 무한히 커지지 않는다 — `usePromptResize` 가 기본 6줄에서 높이를 캡하고 textarea 가 내부 스크롤한다.
- **유일한 예외: `TextNode` 는 `min-h-[var(--node-card-width)]`(400px) 정방형 최소 높이**를 갖는다. `min-height` 라 결과·프롬프트가 길어지면 그대로 늘어난다. 랜딩 임베드에는 적용하지 않는다(`buildLandingShowcaseV2Document` 가 노드 외곽 높이를 미리 계산해 배치하므로 좌표가 어긋난다).
- `V2_DEFAULT_NODE_HEIGHT = 160` 은 스타일이 아니다 — 실측 높이가 아직 없을 때 쓰는 배치 계산용 폴백이다.

#### 사이드 컨트롤 기하

토큰은 `globals.css` `:root` 에, 같은 값의 TS 미러가 `constants.ts` 에 있다.

| CSS 토큰 | 의미 | TS 미러 |
| --- | --- | --- |
| `--node-side-handle-size` | 핸들·사이드 버튼 한 변 (28px) | `NODE_SIDE_CONTROL_PX` |
| `--node-side-handle-radius` | 그 곡률 (8px) | — |
| `--node-side-gap` | 카드 패딩박스 ↔ 컨트롤 (10px) | `NODE_SIDE_GAP_PX` |
| `--node-side-stack-gap` | 컨트롤끼리 세로 간격 (8px) | `NODE_SIDE_STACK_GAP_PX` |
| `--node-side-ctrl` | `= var(--node-side-handle-size, 28px)` | — |
| `--node-side-leading-offset` | `calc(--node-side-gap + --node-side-ctrl)` = **38px** | `NODE_SIDE_OUTSET_PX` |
| `--node-handle-outbound-slot` | `calc(100% + var(--node-side-gap))` | — |

**좌·우 레일 배치식** (globals.css 상단 핸들 주석이 규범으로 못박아 둔 두 식):

- **좌측**: `left: calc(-1 * var(--node-side-leading-offset))` — 또는 동등한 반대 표기 `right: var(--node-handle-outbound-slot)`.
- **우측**: `left: var(--node-handle-outbound-slot)`.
- 두 레일 모두 `top: 50%` + `[transform:translateY(-50%)]` 로 **카드 세로 중앙 정렬**, 컨테이너는 `z-[5]`.

> **좌 레일과 우 핸들은 같은 토큰을 반대 방향으로 쓴다.** 좌우를 `left` 로만 통일하려다 부호를
> 잘못 잡는 사고가 그 주석이 존재하는 이유다.

**핸들이 여러 개 세로로 쌓일 때**: 레일 컨테이너가 `flex flex-col items-center gap-[var(--node-side-stack-gap)]`(**8px**)이고 **레일 전체가 카드 세로 중앙**에 정렬된다 — 개별 핸들에 top 오프셋을 주지 않는다. React Flow 가 건 absolute 는 `relative! left-auto! top-auto! [transform:none]!` 로 되돌려 핸들을 레일의 flex 아이템으로 만든다. ⇒ n개 스택의 총 높이 = `n×28 + (n−1)×8`, 카드 중앙 기준 대칭.

#### 핸들 자체의 구성 (shell + facet 2층)

| 층 | 역할 | 스펙 |
| --- | --- | --- |
| 바깥 shell (`.react-flow__handle`) | 포인터·툴팁·전환만 담당 | `w/h/min-w/min-h = var(--node-side-handle-size)` · `rounded-[var(--node-side-handle-radius)]` · `[border:none]` · **`background: transparent`** · `transition: filter .13s ease, color .13s ease, border-color .13s ease` |
| 안쪽 facet (`data-side-handle-facet`) | 채색·글리프 | `w-full h-full rounded-[inherit] pointer-events-none` · 배경 `var(--node-handle-icon-{channel})` · 글리프 색 `rgb(var(--palette-gray-000-rgb)/100%)` 고정 · `transition: transform .1s ease` |

- facet 의 `::before` 는 Figma 이너 섀도(X/Y 0 · Blur 8 · Spread 0 · `palette-gray-000` 100% · Overlay)를 근사한 레이어다 — `box-shadow: inset 0 0 8px 0 rgb(var(--palette-gray-000-rgb)/100%)` + `mix-blend-mode: overlay`. 이너 섀도 단독 블렌드가 지원되지 않아 별도 레이어로 만든 것이다.
- 글리프 색에 시맨틱 `--gray-000` 을 쓰면 안 된다 — 라이트에서 어둡게 뒤집혀 채색 원반 위에서 깨진다.
- 채널별 색 토큰은 **6.0절** 노드 채널 표를 따른다.

#### `--node-side-outset` — 앱 vs 랜딩 임베드

기본값은 **0px**(각 노드 컨테이너에서 선언). `[data-node-canvas-marketing]` 스코프 안에서만 `var(--node-side-leading-offset)`(**38px**)로 올라가고, 컨테이너 정렬이 `items-center` → `items-stretch` 로 바뀐다.

`NODE_MAIN` 폭 = `카드폭 + 2 × outset` 이고 카드는 `ml-[var(--node-side-outset)]` 로 밀리므로:

| 컨텍스트 | outset | 노드 박스 폭 | 사이드 크롬 위치 |
| --- | --- | --- | --- |
| 앱 (Create 씬) | 0px | **400px** | 노드 박스 **밖** |
| 랜딩 / 워크스루 임베드 | 38px | **476px** (`NODE_FLOW_OUTER_WIDTH_PX`) | 노드 박스 **안** |

> **랜딩 스크린샷을 기준으로 카드 폭을 재면 틀린 값이 나온다.** 구현 카드 폭은 400px 이고,
> CSS 단일 출처는 `--node-card-width`(노드 파일 8개가 각자 컨테이너에 선언), TS 미러는
> `V2_MEDIA_NODE_WIDTH`(텍스트·유튜브·편집 노드가 재수출, 썸네일 렌더 `archiveThumbnail/layout.ts`
> 의 `NODE_CARD_W` 도 재사용). Figma 프레임 폭은 이와 다르다 — **7.5절** 참조.

#### 캔버스 줌 역보정 계약

`--node-canvas-zoom` 은 캔버스 셸 요소에 **React Flow 의 현재 zoom 이 인라인 style 로** 주입된다. `CANVAS_SHELL_BASE` 가 `[--node-canvas-zoom:1]` 로 기본값을 세워, 정적/랜딩 임베드처럼 zoom 을 주입하지 않는 경로에서도 식이 성립한다.

| | 대상 | 형식 |
| --- | --- | --- |
| **역보정한다** (화면 기준 크기 고정) | 노드에서 열리는 팝오버·드롭다운만 — 메타 툴바 드롭다운 앵커, 사이드 버튼 서브메뉴, 출력 핸들의 다운스트림 생성 메뉴, `NodeMoreMenu`, 워크스루 가짜 커서 | `[transform: … scale(calc(1 / var(--node-canvas-zoom,1)))]` + 열리는 방향에 맞춘 `transform-origin` |
| **역보정하지 않는다** (보드와 함께 줌) | 카드·헤더 밴드·헤더 액션·사이드 핸들·프롬프트 셸 등 노드 본체 전부 | — |

노드 본체는 보드의 일부라 같이 줄어드는 게 맞고, 텍스트가 든 임시 표면(메뉴)만 줌아웃에서 판독 불가가 되기 때문이다.

> **역보정은 React Flow 뷰포트 transform *안*에 있는 요소에만 넣는다.** 캔버스 하단 툴바는
> 뷰포트 밖(화면 고정)이라 `scale(1/zoom)` 을 넣으면 줌아웃 시 메뉴가 거꾸로 커진다.
>
> `ChromeTooltip` 의 `invertCanvasZoom` prop 은 **현재 no-op(호환용)** 이다 — 버블을 body 로
> portal 해 캔버스 transform 밖에서 그리므로 이미 화면 기준 크기다. 이 prop 을 보고
> "툴팁도 역보정한다"고 문서화하면 틀린다.

#### 상태

| 상태 | 변화 |
| --- | --- |
| 비선택(기본) | 카드 외곽선은 캔버스 셸이 공급(**6.6절** 표). 헤더 타이틀 다크 `palette-gray-500` / 라이트 `palette-gray-700` |
| 선택 | 카드 `border` → `2px solid rgb(var(--node-selection-accent-rgb)/86%)`(양 테마 동일). 헤더 타이틀(`[data-node-title=plain]`) `color` → `rgb(var(--node-selection-accent-rgb)/100%)`, 편집 중 `<input>` 은 `-webkit-text-fill-color` 도 함께 덮는다. **헤더 액션 버튼(다운로드·삭제)은 액센트를 따라가지 않는다 — 의도된 동작.** `box-shadow` 는 쓰지 않고 `border-color` 변화만 |

**`--node-selection-accent-rgb` 는 단일 값이 아니다 — 노드 채널마다 다르다.**
`[data-node-accent="…"]` 스코프가 채널별로 재선언한다(`globals.css:620-648`).
「선택 시 액센트」를 한 색으로 옮기면 일곱 채널 중 여섯이 틀린다.

| `data-node-accent` | 토큰 | 값 (양 테마 동일) |
| --- | --- | --- |
| `video` | `--primary-500` | `#0088ff` |
| `image` | `--accent-mint-500` | `#00c68e` |
| `text` | `--accent-yellow-500` | `#ffb200` |
| `youtube` | `--accent-red-500` | `#ff4b59` |
| `instagram` | `--accent-red-500` | `#ff4b59` (YouTube 와 의도적으로 동일) |
| `audio` | `--accent-pink-500` | `#ff4d88` |
| `edit` | `--accent-violet-500` | `#6055ff` |

| 핸들 hover | facet `transform: scale(1.08)`, shell `filter: brightness(1.1)` |
| 핸들 active | facet `transform: scale(0.94)!`, shell `filter: brightness(0.94)!` — hover 보다 항상 이기도록 `!` 로 고정 |
| 핸들 disabled | 다크: 배경 `--node-handle-bg-disabled-{channel}` + 글리프 `--node-handle-icon-disabled-{channel}`, `opacity` 는 깎지 않는다. 라이트: 활성 토큰을 유지한 채 `filter: brightness(0.78) saturate(0.95)`. `pointer-events: none` |
| 헤더 액션 hover | 중립(다운로드) 배경 라이트 `rgb(0 0 0/7%)` / 다크 `rgb(var(--palette-gray-000-rgb)/12%)`. 위험(삭제) `color: rgb(var(--red-500-rgb,239 68 68)/100%)` + 배경 라이트 10% / 다크 14%. 전환 `color,background-color,opacity 120ms ease`, `motion-reduce:transition-none` |
| 헤더 액션 active / disabled | active `transform: scale(0.94)`(disabled 제외) / disabled `cursor-not-allowed` + `opacity-35` |
| 노드 스폰(등장) | **Image·Video 만**: 컨테이너 `opacity 0 → 1`, `transform scale(0.96) → scale(1)`, 전환 `opacity 220ms ease-out, transform 220ms cubic-bezier(0.34,1.56,0.64,1)`. Tts·Bgm·Text 컨테이너에는 이 전환이 없다 |
| 연결 힌트 노출 중 | `[data-connect-hint=true]` 스코프에서 모든 `.react-flow__handle` 이 `connectHintHandlePulse 1.6s ease-in-out infinite`. `motion-safe:` 로만 걸려 감소 모션 설정에서는 빠진다 |
| 노드 z-index 승격 | 사이드 버튼 hover·focus-within 인 `.react-flow__node` 를 `z-[2000]`(툴팁이 이웃 카드에 가리지 않게), 메타 드롭다운이 열린 노드는 `z-[2000]!`(카드 400px 보다 넓은 440px 모델 메뉴가 이웃 위로 넘칠 때) |

#### 새 노드를 만들 때 놓치기 쉬운 것

- **카드에 `border` 를 선언하지 않는다.** 캔버스 셸의 후손 규칙 `[&_.react-flow__node_[data-node-chrome=wrap]]` 이 SSOT 다(**6.6절**).
- 훅 속성 3종이 빠지면 외곽선·선택 액센트가 **조용히** 죽는다 — `data-node-chrome="wrap"`(카드) · `data-node-title="plain"`(타이틀 래퍼) · `data-node-accent`(컨테이너).
- React Flow 자체 스타일시트(`@xyflow/react/dist/style.css`)는 Tailwind 레이어 **밖**이라 `.react-flow__handle` 의 position·size·background·border 를 특이도와 무관하게 이긴다 — 핸들 관련 유틸리티는 전부 `!` 를 달아야 한다. `overflow` 만 예외(RF 가 건드리지 않는다).
- React Flow 는 노드 래퍼에 `style={{ zIndex, transform }}` 를 **인라인**으로 넣는다. 노드마다 쌓임 맥락이 생겨 노드 안 z-index 는 노드 경계를 못 넘고, 인라인을 이기려면 `!` 가 필요하다.
- 오디오 노드 미디어 밴드의 `[&:empty]:p-0` 때문에 결과도 생성중도 아니면 밴드가 **접힌다.** 빈 상태 목업에 8px 여백을 그리면 실제와 다르다.

### 6.10 공용 Button (`components/ui/Button.tsx`)

`variant` 4종 × `size` 2종의 단일 프리미티브다. 화면마다 버튼을 새로 정의하지 말고 이 조합을 쓴다.

> **다만 실제 커버리지는 좁다.** `ui/Button` 을 import 하는 파일은 apps + packages 전체에서
> **17개**뿐이고, 같은 트리에 직접 작성한 `<button` 은 600곳이 넘는다. **6.7절** 인벤토리가
> 그 나머지다. 새 버튼은 이 컴포넌트로 만들되, 기존 화면을 볼 때 "공용 버튼이겠거니" 가정하면 안 된다.

#### 렌더 요소와 슬롯

- 항상 네이티브 `<button>` 을 렌더한다. `asChild` · `as` · polymorphic 렌더링은 **없다**.
- 자식 순서는 `[좌아이콘 span] → [라벨 span] → [우아이콘 span]` 이며 세 슬롯 모두 조건부다(값이 `null` 이면 span 자체가 없다).
- 라벨은 반드시 `<span class="[color:inherit]">` 로 한 겹 감싸진다 — 텍스트 노드 직접 배치가 아니다.
- 아이콘 슬롯은 `<span class="inline-flex items-center" aria-hidden>`. **컴포넌트는 아이콘의 width/height/color 를 일절 지정하지 않는다** — 크기는 전적으로 호출부가 넘긴 노드가 결정한다.

#### 루트 (전 variant/size 공통)

- 레이아웃: `box-border relative inline-flex items-center justify-center`. `relative` 는 primary 의 `::before` 오버레이 기준면이라 제거 불가.
- 곡률: `rounded-[var(--button-radius)]` — md/sm 동일하며 루트에 한 번만 선언한다(사이즈별 곡률 분기 없음). 같은 토큰을 32×32 아이콘 액션 버튼도 공유한다.
- 타이포: **`type-body-14-medium`** 한 클래스 고정. 사이즈·variant 와 무관하다.
- `cursor-pointer` / `disabled:cursor-not-allowed` · `white-space: nowrap` · `text-decoration: none`.
- 전환: `background-color 140ms ease, border-color 140ms ease, opacity 140ms ease, filter 140ms ease, transform 120ms ease` — **transform 만 120ms**, 나머지 넷은 140ms. (전역 duration 토큰이 없어 리터럴이다 — **7.5절**)

#### size

| | height | padding-inline | gap | min-width |
| --- | --- | --- | --- | --- |
| `md` (기본) | `var(--button-height)` | `var(--button-padding-inline)` | `gap-4` = **8px** | 없음 |
| `sm` | `var(--button-height-sm)` | `var(--button-padding-inline-sm)` | `gap-2` = **4px** | `var(--button-min-width-sm)` |

**아이콘 광학 보정**: `leftIcon` 이 있으면 `padding-left`, `rightIcon` 이 있으면 `padding-right` 를 그 사이즈의 `padding-inline` 에서 **2px 뺀다**(`calc(var(--button-padding-inline) - 2px)` / `…-sm - 2px`). 보정폭은 md·sm 모두 2px 로 같고, 좌우 독립 적용이다(한쪽만 있으면 그 쪽만 줄어든다). 아이콘 자체의 시각 여백 때문에 텍스트-only 대비 그 쪽 패딩이 넓어 보이는 것을 상쇄한다.

#### variant

| variant | 면 | 글자 | 테두리 | 그림자 |
| --- | --- | --- | --- | --- |
| `primary` (기본) | `var(--node-prompt-generate-gradient)` — 노드 생성 FAB 과 **같은 토큰** | `text-palette-gray-000` | 없음 | 글래스 베벨 2줄 + `::before` 오버레이 |
| `secondary` | `transparent` | 라이트 `text-palette-gray-600` / 다크 `rgb(var(--palette-gray-000-rgb)/72%)` | `1px solid rgb(var(--palette-gray-900-rgb)/12%)`, 다크는 `border-color: rgb(var(--palette-gray-000-rgb)/16%)` | 없음 |
| `ghost` | `transparent` | secondary 와 **동일** | 없음 | 없음 |
| `danger` | `var(--accent-red-500)` (단색, 그라디언트 아님) | `text-palette-gray-000` | 없음 | primary 와 완전히 같은 글래스 베벨 2줄 |

- **글래스 베벨 2줄** = `var(--glass-bevel-highlight) rgb(var(--glass-inner-shadow-rgb)/25%), var(--glass-bevel-shade) rgb(var(--glass-inner-shadow-rgb)/25%)` — **6.1절** 규칙 그대로.
- **`::before` 오버레이(primary 전용)**: `content:'' · position:absolute · inset:0 · border-radius:inherit · box-shadow: inset 0 0 8px 0 rgb(var(--palette-gray-000-rgb)/100%) · mix-blend-mode: overlay · pointer-events:none · transform:translateZ(0)`. 루트에도 `translateZ(0)` 를 걸어 합성 레이어를 분리한다. **danger 에는 없다.**
- primary·danger 는 라이트/다크 오버라이드가 **없다**(`palette-*` 고정 팔레트).
- ghost 는 secondary 와 색이 같고 **테두리만 없다**.

#### 상태

| variant | hover | `:active` | `:disabled` |
| --- | --- | --- | --- |
| `primary` | `filter: brightness(1.06)` — 어두워지지 않고 **밝아진다** | `transform: scale(0.98)` | `opacity: 0.35` |
| `secondary` | 배경 라이트 `rgb(var(--palette-gray-900-rgb)/5%)` · 다크 `rgb(var(--palette-gray-000-rgb)/8%)` | `scale(0.98)` | `0.45` |
| `ghost` | 배경 라이트 `rgb(var(--palette-gray-900-rgb)/8%)` · 다크 `rgb(var(--palette-gray-000-rgb)/10%)` — secondary 보다 각각 3%p / 2%p 진하다 | `scale(0.97)` — **ghost 만 1%p 더 깊게** | `0.5` |
| `danger` | `opacity: 0.85` (배경·filter 변화 없음) | `scale(0.98)` | `0.4` |

- 호버·프레스는 모두 `:not(:disabled)` 로 게이트된다. `disabled` 는 `cursor: not-allowed` 만 추가하고 `pointer-events` 는 막지 않는다(네이티브 `disabled` 속성에 의존).
- **네 variant 모두 `[&:hover:not(:disabled)]` 로 작성돼 `@media (hover: hover)` 가드가 없다** — 터치 기기에서도 호버 스타일이 걸릴 수 있다. 원본 모듈 CSS 의 `:hover` 거동을 그대로 보존한 것이다.
- **focus / focus-visible 은 시각 변화가 없다.** 컴포넌트가 focus 스타일을 선언하지 않고, `globals.css` 의 레이어 밖 전역 규칙이 `button:focus` / `button:focus-visible` 의 outline 을 지운다 — **7.5절** "포커스 링".
- **loading 상태는 존재하지 않는다** — `loading`/`busy` prop, 스피너 슬롯, `aria-busy` 중 어느 것도 없다.

#### 클래스 조립 순서

```
[type-body-14-medium, ROOT, SIZE, BORDER, VARIANT, (primary면 PRIMARY_HOOK), (아이콘 패딩), className]
```

소비자 `className` 이 문자열 마지막에 붙는다. 다만 **Tailwind 는 소스 순서가 아니라 자체 정렬로 승자를 정하므로 순서만으로 덮을 수는 없다.**

#### 접근성

아이콘 span 두 개에 `aria-hidden` 을 거는 것이 전부다. `role` · `aria-busy` · `aria-disabled` · `aria-pressed` 를 세우지 않고, `type` 기본값은 `"button"`(명시 지정 시 덮어씀), 나머지 props 는 `ButtonHTMLAttributes` 로 `<button>` 에 그대로 스프레드된다. **아이콘만 있고 children 이 없는 사용에도 `aria-label` 을 강제하지 않는다.**

#### 이 파일이 지키는 캐스케이드 규칙 (변형 추가 시 그대로 따를 것)

- **`white-space: nowrap` 에 `!` 를 붙이지 않는다.** 랜딩/마케팅 트리의 레이어 밖 전역 `[data-page-root] :where(…, button, …)` 이 `text-wrap-mode` 롱핸드를 통해 nowrap 을 무력화하는데, 원본에서도 그 전역이 이기고 있었다. `!` 로 뒤집으면 헤더/푸터 높이가 어긋난다(실제 사고 기록). ⇒ **마케팅 페이지 안의 Button 라벨은 줄바꿈될 수 있고, 그 밖에서는 nowrap 이다.**
- **다크 오버라이드는 `dark:` 가 아니라 `[html[data-theme=dark]_&]:…!`** 로 쓴다. `dark:` 는 `:where()` 로 감싸져 특이도 0 이라 무접두 `[&:hover]:` 와 순서 싸움이 되지만, 원본 셀렉터는 특이도로 이기고 있었다. 다크 선언 5개 전부에 `!` 가 붙어 있으므로 **소비자 `className` 으로 다크 색을 덮으려면 마찬가지로 중요 선언이 필요하다.**
- **같은 프로퍼티를 다투는 값은 전부 상호배타 삼항으로 가른다** (md↔sm 의 height/padding-inline/gap, secondary↔그 외의 border, ghost↔그 외의 `:active` scale). 한 요소에 같은 프로퍼티 유틸리티 두 개를 얹으면 승패가 보장되지 않는다.
- **border 해제는 `border-0` 이 아니라 `[border:none]`.** `border-0` 은 폭만 0 으로 두고 `--tw-border-style` 이 solid 로 남는다.
- **색 알파는 `/12` 단축이 아니라 `rgb(var(--x-rgb)/12%)` 임의값.** 단축은 `color-mix()` 로 컴파일돼 값이 달라진다.

#### `Button_primary` — hl 라우트 전용 스코프 훅

`variant="primary"` 일 때만 리터럴 클래스 `Button_primary` 가 추가로 붙는다. **스타일이 아니라 스코프 훅이다** — `app/(highlight-standalone)/hl/page.module.css` 가 `[class*="Button_primary"]` 를 부분문자열로 잡아 `color: #1a1a1a !important` 와 `svg { fill: #1a1a1a !important }` 를 건다. 같은 파일이 `--node-prompt-generate-gradient` 와 `--primary-450/-500` 을 `#FFDD00` 로 덮으므로 그 라우트의 primary 는 **노란 면 + `#1a1a1a` 텍스트**가 된다. hl 라우트 밖에서는 이 이름을 정의하는 규칙이 없어 무효과다. (존치 여부는 **7.5절**)

#### 혼동하기 쉬운 경쟁 구현

| 파일 | 무엇 | 왜 헷갈리나 |
| --- | --- | --- |
| `components/scenes/create/node-canvas-v2/components/NodePromptGenerateButton.tsx` | 노드 캔버스 생성 FAB | 같은 `--button-radius` · 같은 그라디언트 토큰 · 같은 `inset 0 0 8px` 오버레이를 쓰지만 치수는 `h-16`/`min-w-16`/`px-4`(높이 32px · 최소폭 32px · 좌우 8px)이고 프레스 스케일이 0.95 다. **`Button size="sm"` 과 가장 혼동하기 쉽다** |
| `components/ui/VideoPlayer.tsx` | 재생 컨트롤 | 파일 안에서 `--button-radius` 를 쓰는 32×32(`w-16 h-16`) 로컬 버튼 크롬을 여러 벌 따로 정의한다 |

그 밖에 primary 그라디언트를 로컬로 재구현한 파일이 더 있다(`admin/BlogManagement.tsx` · `admin/TemplateManagement.tsx` · node-canvas-v2 의 `InstagramNode` · `YoutubeNode` · `EditNode` · `VideoEditModal`). 새 화면에서 파란 채움 버튼이 필요하면 **먼저 `ui/Button` 을 본다.**


#### 토큰 → 최종 리터럴 (이 절이 이름만 적고 넘어간 `var()` 전량)

이 절의 모든 값은 아래 8개 토큰을 거친다. **페이지 절에서 위임받은 「최종 높이·패딩·면·글자색」은 전부 여기서 나온다.**

| 토큰 | 최종값 | 정의 |
| --- | --- | --- |
| `--button-radius` | **12px** | `app/globals.css:88` |
| `--button-padding-inline` | **16px** | `app/globals.css:89` |
| `--button-height` | **40px** | `app/globals.css:90` |
| `--button-height-sm` | **32px** | `app/globals.css:93` |
| `--button-padding-inline-sm` | **12px** | `app/globals.css:94` |
| `--button-min-width-sm` | **48px** | `app/globals.css:95` |
| `--glass-bevel-highlight` | `inset 0 1px 1px` (`--glass-bevel-offset` 1px `app/globals.css:55` · `--glass-bevel-blur` 1px `:56`) | `app/globals.css:57` |
| `--glass-bevel-shade` | `inset 0 -1px 1px` (`calc(-1 * 1px)`) | `app/globals.css:58` |
| `--glass-inner-shadow-rgb` | `250 250 250` (= `--palette-gray-000-rgb` `app/globals.css:40`) | `app/globals.css:53` |
| `--node-prompt-generate-gradient` | `linear-gradient(90deg, #1491ff 0%, #0088ff 50%, #1491ff 100%)` (`--primary-450` #1491ff `:179` · `--primary-500` #0088ff `:159`) | `app/globals.css:513-518` |
| `--accent-red-500` | **#ff4b59** — `:root` 한 곳에만 선언, 라이트/다크 오버라이드 없음 | `app/globals.css:234` |

`gap-4` = **8px**, `gap-2` = **4px** (`--spacing: 2px`, `app/tailwind.css:164`).

#### size — 최종 px

| | height | padding-inline | `leftIcon` 있을 때 `padding-left` | `rightIcon` 있을 때 `padding-right` | gap | min-width | radius |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `md`(기본) | **40px** | **16px** | **14px** | **14px** | **8px** | 없음 | **12px** |
| `sm` | **32px** | **12px** | **10px** | **10px** | **4px** | **48px** | **12px** |

`padding-block` 은 양 사이즈 모두 `py-0` = **0** (`components/ui/Button.tsx:58,65`). 곡률은 사이즈 분기 없이 루트 한 곳(`:46`).

#### variant — 최종 색

**`primary`** (`components/ui/Button.tsx:91-103`) — 라이트/다크 동일. `--primary-450/-500` 은 `:root` 외에 재정의하는 곳이 hl 모듈뿐이다.

- `background: linear-gradient(90deg, #1491ff 0%, #0088ff 50%, #1491ff 100%)` (`:92`)
- `color: #fafafa` (`:93` → `app/globals.css:20`)
- `box-shadow: inset 0 1px 1px rgb(250 250 250 / 25%), inset 0 -1px 1px rgb(250 250 250 / 25%)` (`:94`)
- `::before { box-shadow: inset 0 0 8px 0 rgb(250 250 250 / 100%) }` (`:97`)

**`danger`** (`:126-133`) — 라이트/다크 동일. `background: #ff4b59` · `color: #fafafa` · 베벨은 primary 와 **글자 그대로 같은 문자열**(`:129` ≡ `:94`).

**`secondary` / `ghost`** — 라이트에서 **회색 램프가 세 벌**이라 글자색이 화면마다 다르다. 아래 표는 그 셋을 모두 편 것이다.

| | 글자색 | secondary 테두리 | secondary hover 면 | ghost hover 면 |
| --- | --- | --- | --- | --- |
| 라이트 · **전역 램프** (랜딩 `[data-page-root]` · auth · 사이드바 없는 화면) | **#777d89** | `1px solid rgb(23 27 34 / 12%)` | `rgb(23 27 34 / 5%)` | `rgb(23 27 34 / 8%)` |
| 라이트 · **앱 셸 램프** (`html[data-theme=light] body:has(.gnb-wrapperSidebar)`) | **#9aa0ab** | **동일** `1px solid rgb(23 27 34 / 12%)` | **동일** `rgb(23 27 34 / 5%)` | **동일** `rgb(23 27 34 / 8%)` |
| 라이트/다크 무관 · **hl 스코프** (`.wrapper`) | **#d4d4d4** | `1px solid rgb(10 10 10 / 12%)` | `rgb(10 10 10 / 5%)` | `rgb(10 10 10 / 8%)` |
| **다크** (`html[data-theme=dark]`, `!` 선언) | `rgb(250 250 250 / 72%)` | `border-color: rgb(250 250 250 / 16%)` | `rgb(250 250 250 / 8%)` | `rgb(250 250 250 / 10%)` |

근거: 글자색은 `text-palette-gray-600`(`components/ui/Button.tsx:107,118`) → 컴파일 결과가 `color: var(--palette-gray-600)` 로 **theme 별칭을 거치지 않고 원 토큰을 직접 참조**하므로 스코프 재매핑이 그대로 먹는다. 전역 #777d89 `app/globals.css:33` · 앱 셸 #9aa0ab `components/navigation/Gnb.tsx:1978`(`gnb-wrapperSidebar` 리터럴은 `:1957`) · hl #d4d4d4 `app/(highlight-standalone)/hl/page.module.css:23`.

**테두리·hover 알파의 기준색은 앱 셸에서 바뀌지 않는다.** 그 둘은 `--palette-gray-900-rgb`(`app/globals.css:51` = `23 27 34`)를 쓰는데, 앱 셸 재매핑은 **100~600 과 그 `-rgb` 만** 덮고 `000`·`700`~`1000` 은 건드리지 않는다(`components/navigation/Gnb.tsx:1972-1985`). hl 스코프만 `--palette-gray-900` 을 `--palette-gray-000`(#111111 / `10 10 10`)로 되돌려 놓아 값이 달라진다(`hl/page.module.css:29-30`, `:11-12`).

다크 오버라이드는 secondary 3개(`:111-113`) + ghost 2개(`:122-123`) 총 5개이고 **secondary 의 다크 선언은 `border-color` 만 덮는다** — 굵기·스타일은 라이트의 `1px solid` 가 그대로 남는다(`:111`).

#### hl 스코프에서 primary 가 다른 버튼이 되는 경로

§6.10 이 이미 적은 `Button_primary` 훅(`hl/page.module.css:65-70`) 외에, **같은 `.wrapper` 가 팔레트를 통째로 반전시킨다.**

- `--primary-450` / `--primary-500` → **#FFDD00** (`hl/page.module.css:47-48`), `--node-prompt-generate-gradient` → **`#FFDD00` 단색**(그라디언트가 아니다, `:55`)
- `--palette-gray-000-rgb` → `10 10 10`(`:12`) ⇒ primary `::before` 오버레이가 `inset 0 0 8px 0 rgb(10 10 10 / 100%)` 로 **어두워진다**
- 이 스코프에 공용 Button 이 실제로 들어온다: `hl/page.tsx:57-59` · `hl/[projectId]/page.tsx:203-204` 가 `styles.wrapper` 안에 `HighlightProjectScene` 을 렌더하고, 그 파일이 `ui/Button` 을 import 한다(`components/scenes/HighlightProjectScene.tsx:31`). `(highlight-standalone)` 트리 자체에는 `ui/Button` import 가 하나도 없어 grep 으로는 보이지 않는다.

#### 타이포 최종값 — 그리고 `[font-family:inherit]` 은 죽은 선언이다

`type-body-14-medium`(`components/ui/Button.tsx:185`) 이 푸는 값:

`font-size: 14px`(`app/globals.css:370`) · `line-height: 1.5`(`:371`) · `letter-spacing: -0.01em`(`:372`) · `font-weight: 500`(`--type-weight-medium`, `:345`) · `font-family: var(--type-font-family)` = `var(--font-pretendard)`(`:341`, `html[lang="ja"]` 에서는 `var(--font-pretendard-jp), var(--font-pretendard)` `:399-401`) · `font-feature-settings: "ss07" 1`(`:342`).

ROOT 의 `[font-family:inherit]`(`components/ui/Button.tsx:47`)은 **항상 진다.** 컴파일 결과에서 `.\[font-family\:inherit\]` 은 `@layer utilities` 안에 있고, `font-family` 를 세우는 `.type-body-14-*` 공용 블록(`app/globals.css:1072-1080`)은 **레이어 밖**이다. 레이어 밖이 레이어 안을 특이도와 무관하게 이기므로 버튼 글꼴은 언제나 `--type-font-family` 다. `[font-family:inherit]` 은 아무 효과가 없다.

#### 소비자 오버라이드 — 실제로 쓰이는 두 경로

**(A) 토큰 경로 — `!` 불필요.** 같은 프로퍼티 유틸리티가 아니라 커스텀 프로퍼티만 갈아끼우므로 Tailwind 정렬 싸움이 없다.

```
[--button-height:32px] [--button-padding-inline:12px]
```

`components/landing/navigation/Gnb.tsx:238-240`(`TOPBAR_CTA`). **저장소 전체에서 `--button-height` / `--button-padding-inline` 을 재정의하는 곳은 이 한 곳뿐**이고, `--button-radius` · `--button-height-sm` · `--button-padding-inline-sm` · `--button-min-width-sm` 은 **어디서도 재정의되지 않는다.** ⇒ 위 size 표의 px 는 그 한 곳을 빼면 전역 상수다.

**(B) 유틸리티 경로 — `!` 필수.** 루트/variant 가 이미 세운 프로퍼티를 직접 덮으려면 중요 선언이 필요하다. 실제 사례:

| 덮는 것 | 어떻게 | 어디 |
| --- | --- | --- |
| `height` | `h-[44px]!` | 문의 제출 버튼(10.5절) |
| primary 의 `box-shadow` 베벨 | `[box-shadow:var(--glass-dropdown-frame)]!` | `components/landing/navigation/Gnb.tsx:241` |
| primary 의 `::before` 오버레이 | `before:[display:none]!` | `components/landing/navigation/Gnb.tsx:242` |
| `display` (미디어쿼리 동반) | `[@media(max-width:719px)]:[display:none]!` | `components/landing/navigation/Gnb.tsx:243` |
| `background` · `color` | `[background:var(--gray-000)]! text-gray-900!` / `[background:var(--gray-900)]! text-gray-100!` | `components/landing/navigation/Gnb.tsx:246-247` |

**`--button-radius` 를 소비자가 재정의하지 말 것.** 이 토큰은 Button 밖의 32×32 아이콘 액션 버튼 십수 곳이 함께 읽는다(예: `components/ui/VideoPlayer.tsx:158,219,240,264` · `components/scenes/create/ProjectHeader.tsx:214` · `app/mypage/upgrade/page.tsx:322`). 상위에서 갈면 그 전부에 번진다.

#### 실사용 census (`ui/Button` import 17파일 · `<Button` 호출부 26곳)

| | 호출부 수 | 어디 |
| --- | --- | --- |
| `variant="danger"` | **0** | **저장소 어디에서도 쓰이지 않는다.** 위 danger 값은 코드에는 있으나 렌더된 적이 없는 경로다 |
| `variant="ghost"` | 2 | `app/highlight/[projectId]/shorts/[shortId]/page.tsx:1345,1355` |
| `size="sm"` | 5 | `components/scenes/HomeCreateNewMenu.tsx:112` · `components/scenes/NodeCanvasHomeScene.tsx:1274,1296` · `components/scenes/VideoEditScene.tsx:728,750` |
| `rightIcon` | 1 | `components/scenes/HomeCreateNewMenu.tsx:119` — 12×12 chevron SVG |
| 나머지 | — | `variant="primary"`(기본) + `size="md"`(기본) |

⇒ **`sm` 을 쓰는 다섯 자리와 `ghost` 두 자리를 빼면 이 컴포넌트는 사실상 「40px primary」 한 형태로만 화면에 나온다.**

### 6.11 모달 셸 (`GlassConfirmModal`) 과 그 파생

확인/경고 모달은 **하나의 셸을 물리적으로 공유한다.** `PlanGateModal` · `NodeDeleteConfirmModal` · `CreditConfirmModal` 셋 모두 `<GlassConfirmModal>` 을 렌더하고, 셸은 `className` / `style` / 클래스 오버라이드 prop 을 **하나도 노출하지 않는다.**

공개 API 는 `open` · `onCancel` · `onConfirm` · `title` · `description` · `cancelLabel` · `confirmLabel` · `confirmVariant`(`'primary'|'danger'`, 기본 `'primary'`) · `titleId` · `children` 뿐이다. 따라서 파생이 바꿀 수 있는 것은 **(a) 문구, (b) `confirmVariant`, (c) `titleId`, (d) 설명과 버튼 행 사이에 끼우는 `children`** — 이 넷이 전부다. 오버레이·패널·타이틀·버튼 행은 단일 소스다.

**원천 파일 (`apps/web`):**

| 역할 | 파일 |
| --- | --- |
| 셸(정본) | `components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx` |
| 플랜 안내 | `…/components/PlanGateModal.tsx` — `children` 없음 + 기본 variant = **순수 래퍼** |
| 노드 삭제 확인 | `…/components/NodeDeleteConfirmModal.tsx` — `confirmVariant='danger'` + 체크박스 1줄 |
| 크레딧 차감 확인 | `…/components/CreditConfirmModal.tsx` — 크레딧 내역 박스 + 체크박스 1줄 |

셸은 이 넷 밖에서도 재사용된다(`EditorProjectWorkspace` · `YoutubeAnalyticsScene` · `VideoEditScene`) — 셸을 고치면 파급이 넓다.

#### 레이어

| 레이어 | 스펙 |
| --- | --- |
| 루트 (포털) | `document.body` 로 `createPortal`. `fixed inset-0 z-10200 grid place-items-center box-border`, 패딩은 `env(safe-area-inset-*)`. 카드는 세로·가로 모두 뷰포트 중앙 |
| 스크림(백드롭) | 카드와 **형제**인 별도 레이어. `absolute inset-0 pointer-events-none` — 클릭은 스크림이 아니라 **루트**가 받는다. 색은 닫힘 `rgb(var(--palette-gray-900-rgb)/0%)` → 열림 `…/50%`. `aria-hidden="true"` |
| 패널(카드) | `relative z-1 w-[min(360px,calc(100vw - 40px))] p-8 rounded-24` → 폭 `min(360px, 100vw−40px)` · 패딩 **16px** · 라운드 **24px**. 높이는 내용 기반 |

**패널 표면**은 `--palette-*` **불투명** 값이며 시맨틱 `--gray-*` 반전을 타지 않는다 — 다크 `rgb(var(--palette-gray-800-rgb)/100%)`, 라이트 `rgb(var(--palette-gray-100-rgb)/100%)`(공급 셀렉터 `[html[data-theme=light]_&]`). 테두리 프로퍼티는 없고 외곽은 전적으로 `box-shadow: var(--glass-dropdown-frame)` 하나로 만든다 — 드롭다운이 함께 쓰는 `--dropdown-ambient-shadow` 는 **붙이지 않는다.**

> **이름이 `Glass*` 지만 유리(블러) 표면이 아니다.** 스크림에는 `backdrop-filter` 가 없고,
> 카드는 `backdrop-filter: none` / `-webkit-backdrop-filter: none` 을 **명시적으로 끈다.**
> 목업에서 배경 블러를 넣으면 구현과 다르다.

#### 수직 리듬

셸 기본(= `children` 없음, `PlanGateModal`):

```
카드 패딩 16px
  h3 (타이틀)
  ↕ 8px      (mt-4)
  p  (설명)
  ↕ 24px     (mt-12)
  버튼 행
```

전역 리셋이 `* { margin:0; padding:0 }` 이라 `h3`/`p` 의 UA 마진은 0에서 시작한다.

- **타이틀**: `<h3 id={titleId}>` · `type-body-16-semibold` + `text-gray-000`(시맨틱이라 테마 반전).
- **설명**: `<p>` · `type-body-16-regular` + `mt-4` + 색 `rgb(var(--gray-000-rgb)/60%)`. `line-height` 를 `leading-[var(--type-body-16-line-height)]!` 로 다시 얹는데, 값은 같은 토큰이라 계산값은 동일하다 — `!` 는 레이어 밖 `type-*` 를 이기기 위한 것이다. `aria-describedby` 는 걸려 있지 않다.

> **카드는 블록 컨테이너라 형제 마진이 상쇄된다.** `CreditConfirmModal` 에서 내역 박스
> `mb-8`(16px) + 체크박스 `mt-8`(16px)의 실제 간격은 **16px**(32px 아님)이고, 체크박스
> `mb-10`(20px) + 버튼 행 `mt-12`(24px)는 **24px** 이다. 두 값을 더해서 그리면 틀린다.

#### 버튼 행

`flex gap-4 mt-12 -mr-4 -mb-4 -ml-4` — 버튼 간격 **8px**, 위 여백 **24px**, 좌·우·아래 **−8px**.

> 음수 마진은 **카드 패딩을 의도적으로 침범한다.** 카드 패딩은 16px 인데 버튼 행만 가장자리에서
> 8px 인셋으로 앉고, 버튼 라운드 16px 도 여기서 나온 값이다(카드 24 − 인셋 8 = 동심 곡률).

순서는 항상 **[취소] 왼쪽 · [확인] 오른쪽**, 각 버튼 `flex-1` 로 1:1 균등 분할.

| | 공통 | 면 · 글자 | 그림자 |
| --- | --- | --- | --- |
| 취소 | `inline-flex items-center justify-center flex-1 h-[44px]` · `rounded-16` · `[border:0]` · `cursor-pointer` · 라벨 `type-body-16-medium` | `bg-[rgb(var(--gray-000-rgb)/10%)]` + `text-gray-000` | **6.1절** 글래스 베벨 2줄(`--glass-bevel-highlight` / `--glass-bevel-shade`, `rgb(var(--glass-inner-shadow-rgb)/25%)`) — 테마 불변 |
| 확인 — `primary` | 동일 | `bg-gray-000` + `text-gray-1000` (둘 다 시맨틱이라 테마에서 뒤집힌다) | 없음 |
| 확인 — `danger` | 동일 | `bg-accent-red-500` + `text-palette-gray-000` (**고정 palette**) | 없음 |

- danger 에서 글자에 시맨틱 `--gray-000` 을 쓰지 않는 이유는 라이트에서 검정으로 뒤집혀 빨강 위에서 깨지기 때문이다.
- **danger 는 색만 바뀐다** — 레이아웃·크기·라운드·모션 전부 primary 와 같고, 타이틀·설명·취소 버튼·패널에는 danger 처리가 **없다**(아이콘·빨간 테두리·경고 배너 없음).
- 버튼 높이 **44px 는 리터럴**이며 공용 `--button-height`(40px)와 별개다 — **7.5절** 참조.

**버튼 상태**

| 상태 | 값 |
| --- | --- |
| hover | 취소 `filter: brightness(125%)` · 확인(primary) `brightness(92%)` · 확인(danger) `brightness(0.92)` |
| active | `transform: scale(0.97)` (셋 공통) |
| focus | **시각 표시 없음** — `globals.css` 가 레이어 밖에서 `button:focus, button:focus-visible { outline: none }` 을 걸어 모든 유틸리티를 이긴다(**7.5절**) |
| disabled | `opacity: 0.6` + `cursor: default` + hover 필터 억제가 정의돼 있으나, **셸이 disabled prop 을 노출하지 않아 현재 API 로는 도달할 수 없다** |

전환은 `transform 180ms ease, filter 180ms ease, opacity 180ms ease`. 셀렉터가 `hover:` 가 아니라 `[&:hover:not(:disabled)]:` 라 **`@media (hover: hover)` 가드가 없다**(터치 기기에서도 발동).

#### 모션

| 대상 | 전환 | 닫힘 → 열림 |
| --- | --- | --- |
| 스크림 | `background 260ms cubic-bezier(0.22,1,0.36,1)` | 알파 0% → 50% |
| 카드 | `transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 220ms ease, filter 320ms ease` + `will-change: transform,opacity,filter` | `opacity 0 → 1` · `translate3d(0,16px,0) scale(0.96,0.96) → translate3d(0,0,0) scale(1)` · `filter: saturate(88%) blur(1px) → saturate(100%) blur(0)` |

오프셋/스케일 값은 인라인 CSS 변수로 주입된다(`--create-project-translate-y: 16px`, `--create-project-scale-x/y: 0.96`).

**시퀀싱**: `open=true` → 즉시 마운트(닫힘 상태) → `requestAnimationFrame` 한 프레임 뒤 열림 상태로 전환(그래서 첫 프레임부터 트랜지션이 재생된다). `open=false` → 열림 클래스 제거 후 **280ms(`CLOSE_MS`)** 뒤 언마운트.

`prefers-reduced-motion: reduce` 에서는 스크림·카드 모두 `motion-reduce:[transition:none]` 으로 즉시 스냅한다. 다만 **언마운트 지연 280ms 는 JS 타이머라 그대로 남는다** — 카드가 사라진 뒤에도 그 시간 동안 DOM 에 있다.

> `CLOSE_MS = 280ms` 는 카드의 가장 긴 트랜지션(transform·filter **320ms**)보다 짧다.
> 퇴장 애니메이션은 마지막 40ms 가 잘린 채 언마운트된다 — **실측 퇴장 길이는 320ms 가 아니라 280ms** 다.
>
> `MODAL_CARD_CLOSED` 의 `transform` 에 적힌 폴백값 `scale(0.24, 0.16)` 은 **절대 쓰이지 않는다** —
> 인라인 `motionStyle` 이 항상 0.96 을 세운다. 코드만 훑으면 0.24/0.16 을 스펙으로 오독하기 쉽다.

#### 닫는 방법 · 키보드 · 포커스

닫히는 경로는 넷이다.

1. 취소 버튼
2. 확인 버튼
3. **카드 바깥 아무 곳 클릭** — 루트 div 의 `onClick` → `onCancel`(카드는 `stopPropagation` 으로 차단)
4. **Enter 키 — 어디서 눌러도 확인으로 처리**

**Escape 는 아무 동작도 하지 않는다** — 셸에 Escape 핸들러가 없다(같은 캔버스의 다른 오버레이는 대부분 Escape 로 닫힌다 — **7.5절**).

**Enter 전역 캡처 규칙**: `open` 인 동안 `document.addEventListener('keydown', …, true)`. `e.key === 'Enter'` 이고 이벤트 타깃이 (a) `input, textarea, select, [contenteditable=true]` 내부가 아니고 (b) 취소 버튼 자신도 (c) 확인 버튼 자신도 아닐 때 → `preventDefault()` + `stopPropagation()` + `onConfirm()`. (b)(c) 예외는 네이티브 버튼 활성화에 맡기기 위함이다. **캡처 단계라 아래 캔버스의 Enter 핸들러보다 먼저 가로챈다.**

> Enter 리스너는 **open 인 모든 인스턴스에 각각 붙는다.** 동시에 두 개의 `GlassConfirmModal` 이
> 열려 있으면 Enter 한 번에 둘 다 confirm 된다. 또 `openRef` 로 최신 `open` 을 동기 추적하는
> 이유는 effect cleanup 이 리렌더 뒤로 밀려 닫힌 직후 Enter 오토리핏이 이전 리스너를 타는 것을
> 막기 위함이다 — **리팩터 시 이 ref 를 제거하면 회귀한다.**

**포커스**: 열림 + 가시 상태가 되면 `rAF` 한 프레임 뒤 **확인 버튼에 프로그래매틱 포커스**. **포커스 트랩은 없다** — Tab 이 카드 밖(캔버스)으로 빠지고, 닫힐 때 이전 포커스로 되돌리는 코드도 없다(**7.5절**).

**아래 캔버스**: 바디 스크롤 잠금이 **없고**, 캔버스는 블러되지 않고 계속 렌더된다(스크림은 색만 바뀐다). 포인터 입력은 루트 `fixed inset-0` 가 뷰포트를 덮어 차단한다. 닫히는 280ms 동안에는 루트에 `pointerEvents:'none'` 이 붙어 마우스가 통과하고, 포커스된 버튼의 Enter/Space 클릭은 `handleCancel`/`handleConfirm` 의 `if (!open) return` 가드가 막는다.

**접근성 마크업**: 카드에 `role="dialog"` · `aria-modal="true"` · `aria-labelledby={titleId}`. `titleId` 기본값은 `glass-confirm-title` 이고 파생마다 고유값을 넘긴다(`plan-gate-modal-title` · `node-delete-confirm-title` · `credit-confirm-modal-title`). 설명에는 id 도 `aria-describedby` 도 없다.

**loading / error 상태는 없다** — 스피너·비동기 상태·에러 슬롯이 셸에 없다. 확인 버튼은 누르는 즉시 `onConfirm` 을 호출하고 닫힘은 부모가 `open` 을 내려서 처리한다.

#### `children` 로 끼우는 것들

**크레딧 내역 박스 (`CreditConfirmModal`)** — 설명 아래 삽입.

- 박스: `flex flex-col gap-4`(항목 간 **8px**) · `mt-2 mx-0 mb-8`(위 **4px** / 아래 **16px**) · `px-7 py-6`(좌우 **14px** / 상하 **12px**) · `rounded-12` · 면 `rgb(var(--gray-000-rgb)/6%)` + `bg-clip-border`.
- 행: `flex items-center justify-between gap-6`(**12px**). 라벨 `type-body-14-regular` + `rgb(var(--gray-000-rgb)/60%)`, 값 `type-body-14-semibold` + `text-gray-000`.
- 잔여 행 앞 구분선 `<hr>`: `border-top: 1px solid rgb(var(--gray-000-rgb)/12%)`, 나머지 3변 `none`, `my-1`(**2px**) → flex gap 8px 와 합쳐 위아래 실효 간격 10px.
- 행 순서: 보유 → 사용(−cost) → 구분선 → 잔여.

**세션 스킵 체크박스 줄** — `CreditConfirmModal` 이 `SKIP_LABEL_CLASS` / `SKIP_CHECKBOX_CLASS` 를 export 해 `NodeDeleteConfirmModal` 과 **같은 상수를 공유**한다.

- 라벨: `flex items-center gap-4`(**8px**) · `mt-8 mb-10`(위 **16px** / 아래 **20px**) · 색 `rgb(var(--gray-000-rgb)/60%)` · `cursor-pointer select-none` · `type-body-14-regular`. 위 여백 16px 은 제목·설명 간격(8px)의 2배다.
- 인풋: `w-7 h-7`(**14×14px**) · `m-0` · `cursor-pointer` · `accent-gray-000`(네이티브 체크박스 `accent-color`, 테마 반전).

**`NodeDeleteConfirmModal` 의 조건부 분기** — 체크박스가 항상 있는 것이 아니다.

| 상황 | children |
| --- | --- |
| 섹션 삭제(`sectionMemberCount != null`) + 멤버 > 0 | "포함 노드도 함께 삭제" 체크박스 |
| 섹션 아님 + `videoWithDownstream=false` | "이번 세션 동안 다시 묻지 않기" 체크박스 |
| 빈 섹션 / 다운스트림 경고 변형 | **없음** — 설명 → 버튼 행 간격은 셸 기본 24px 그대로 |

두 체크박스 모두 열릴 때마다 `false` 로 리셋된다.

#### 목업·구현 시 주의

- **셸은 포털(`document.body`)이다.** 부모 `.scene` 의 stacking·backdrop 과 분리되며, `z-index: 10200` 은 `VideoEditModal`·`CropModal` 등 z-index 9999 포털 **위**에 오도록 고른 값이다. Figma 나 스토리북에서 캔버스 자식으로 그리면 실제 합성 순서가 재현되지 않는다.
- 패널 라이트 분기는 `[html[data-theme=light]_&]:`(평범한 후손 셀렉터)인데, `--glass-dropdown-frame` 의 라이트 값은 더 좁은 스코프에서 온다. 페이지 DOM 어딘가에 `[data-landing-walkthrough-dark]` 가 존재하면 **면은 라이트로 뒤집히는데 프레임은 다크 값에 남는다.** 앱 화면에서는 발생하지 않지만 랜딩 워크스루 위에 이 모달을 얹으면 깨진다.
- 그림자는 `shadow-*` 가 아니라 `[box-shadow:…]` 임의 프로퍼티다. `shadow-*` 는 마지막 색을 `var(--tw-shadow-color, …)` 로 감싸고 `--tw-ring-*` 합성 체인을 끼워 넣어 계산값이 달라진다. 같은 이유로 `border: 0` 은 `[border:0]`, 구분선은 4변 롱핸드다.
- 타이포 4종(타이틀 body-16-semibold · 설명 body-16-regular · 버튼 body-16-medium · 부속 body-14-\*)은 **뷰포트 450px 이하에서 body-16 이 14px 로 축소된다**(**5.2.1절** 반응형 램프). 모바일 폭에서는 타이틀·설명·버튼 라벨이 전부 14px 가 되어 본문과 크기가 같아진다.

### 6.12 툴팁 · 피드백 상태 (스피너 / 생성 중 / 빈 상태 / 오류)

#### 툴팁 — 표면은 하나, 변형은 셋

표면·타이포·모션 토큰은 **완전히 통일돼 있다.** 세 변형이 모두 `globals.css` 의 `.app-tooltip-chrome` SSOT 를 소비한다.

```css
.app-tooltip-chrome {
  border: 1px solid var(--app-tooltip-border);
  border-radius: var(--app-tooltip-radius);
  background: var(--app-tooltip-bg);
  box-shadow: var(--app-tooltip-shadow);
  color: var(--app-tooltip-text);
  padding: var(--app-tooltip-padding);   /* = 4px 8px */
  font-size / font-weight / line-height / letter-spacing: var(--app-tooltip-*)
}
```

- 타이포는 **caption-12 regular 고정**(테마 무관) — `--app-tooltip-font-size` 가 `var(--type-caption-12-size)` 를 가리킨다.
- 패딩은 `--app-tooltip-padding-block: 4px` / `--app-tooltip-padding-inline: 8px`.
- 색 값은 **6.0절** 토큰 인벤토리 참조. 스코프는 `html[data-theme="dark"]` / `html[data-theme="light"]` 이고, `[data-landing-walkthrough-dark]` / `-light` 가 각각 같은 다섯 값을 다시 선언해 워크스루 안에서도 규칙이 유지된다.

> **툴팁 색은 테마 반전이다.** 다크 UI 에서 밝은 면(`palette-gray-200` 면 / `palette-gray-900` 글자),
> 라이트 UI 에서 어두운 면(`palette-gray-800` 면 / `palette-gray-000` 글자). **시안을 다크로 그리면서
> 툴팁만 어둡게 칠하는 실수가 나기 쉽다.**

| | A — `ChromeTooltip` | B — 노드 핸들 `[data-tooltip]` | C — 영상 편집 모달 `ModalTooltip` |
| --- | --- | --- | --- |
| 구현 | React 컴포넌트, `document.body` 로 portal | 순수 CSS `::after` (`content: attr(data-tooltip)`) | Radix Tooltip |
| placement | `top`(기본) · `left` · `right` — **bottom 없음, 자동 플립·충돌 회피 없음** | 좌 / 우 | `top`(기본) · `bottom` |
| 오프셋 | top **5px**(`GAP_TOP`) · left/right **8px**(`GAP_SIDE`) | **9px** (`calc(100% + 9px)`) | `sideOffset={6}` |
| 배치 | `position: fixed`, 좌표는 트리거 `getBoundingClientRect()` 로 산출 | `position: absolute; top: 50%` | Radix 계산 |
| z-index | `z-[10400]` | `z-index: 100` | `10300` |
| 화살표 | 없음 | 없음 | **있음** — `width={10} height={5}`, `fill: var(--app-tooltip-bg)` |
| 트리거 | `onPointerEnter` / `onFocus` (닫힘 `onPointerLeave` / `onBlur`) — **클릭·탭으로는 열리지 않는다** | `:hover` / `:focus-visible` | Radix |

최대폭·줄바꿈 정책과 호버 지연은 세 변형이 서로 다르다 — **7.5절** 참조.

**A 의 정렬 translate**: top `translate(-50%,-100%)` · left `translate(-100%,-50%)` · right `translate(0,-50%)`. **확대 기준점**은 트리거 쪽 모서리 — top `origin-bottom` · left `origin-right` · right `origin-left`.

**모션 토큰 (전 변형 공통 SSOT, `:root` — 테마 무관)**

| 토큰 | 값 |
| --- | --- |
| `--app-tooltip-motion-scale-rest` | `0.97` |
| `--app-tooltip-motion-duration-enter` | `140ms` |
| `--app-tooltip-motion-duration-exit` | `120ms` |
| `--app-tooltip-motion-ease-enter` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--app-tooltip-motion-ease-exit` | `cubic-bezier(0.19, 1, 0.22, 1)` |

`prefers-reduced-motion: reduce` 에서 `:root` 의 enter/exit duration 을 **1ms**, rest scale 을 **1** 로 덮는다. 세 변형이 모두 토큰을 참조하므로 한 번에 적용된다.

**A 의 상태 흐름**

| 상태 | 동작 |
| --- | --- |
| 닫힘 | **미마운트.** 열릴 때만 portal 로 DOM 에 삽입된다 (B 는 항상 DOM 에 있고 `opacity: 0` + `scale(0.97)` 로 숨는다) |
| 첫 호버 | 지연 뒤 마운트 → 다음 rAF 에 열림 클래스 → `opacity 0→1`, `scale 0.97→1`, enter 타이밍 |
| 연속 호버 | 직전까지 다른 툴팁이 떠 있었으면 지연 0 + `data-instant="true"` → `duration: 0` 으로 모션 없이 즉시 표시. 그 '연속' 판정 창은 포인터가 떠난 뒤 **600ms** 유지 |
| focus | 지연 없이 즉시 열린다. `onBlur` 로 닫힌다 |
| 닫힘 전환 | `opacity 1→0`, `scale 1→0.97`, exit 타이밍. `transitionend`(opacity 또는 transform)에 언마운트, 폴백 타이머 **180ms** |
| `suppress` | exit 모션 없이 **즉시 언마운트** — 잔상이 버튼 옆에 남지 않게(같은 트리거의 드롭다운이 열린 경우 등) |

- `label` 이 빈 문자열이면 호스트조차 렌더하지 않고 children 을 그대로 통과시킨다.
- 떠 있는 동안 `scroll`(capture) · `resize` 에 좌표를 재산출한다. **캔버스 팬에는 반응하지 않는다.**

> **측정 대상 주의**: 호스트가 `display: contents` 면 자체 박스가 없어 `getBoundingClientRect()` 가
> 0 을 반환하므로, `ChromeTooltip` 은 **호스트가 아니라 첫 자식 요소**를 측정한다
> (`host.firstElementChild ?? host`).
>
> `-translate-x-1/2` 류 유틸리티는 Tailwind v4 에서 `transform` 이 아니라 `translate` 속성을 쓴다.
> `ChromeTooltip` 은 버블의 `transform` 트랜지션·`transitionend` 판정과 축을 맞추려고 일부러
> `[transform:translate(…)]` 임의값을 쓴다 — **유틸리티로 '정리'하면 exit 언마운트가 깨진다.**
>
> 버블 내부 `<span>` 의 줄바꿈 3종에 `!` 가 **없는 것은 의도**다. 랜딩의 레이어 밖 전역
> `[data-page-root] :where(… span …)` 은 유틸리티를 이기지만, 이 span 은 body 로 포털되어
> 그 서브트리 밖이라 매칭 자체가 없다. **버블을 인라인 배치로 되돌리면 그때는 `!` 가 필요해진다.**
>
> 모달 Radix 툴팁의 화살표는 `fill: var(--app-tooltip-bg)` 만 칠한다 — 패널의 1px
> `--app-tooltip-border` 는 화살표로 이어지지 않는다. **시안에서 화살표에 테두리를 그리면 어긋난다.**
>
> `@keyframes app-tooltip-enter-transform` / `-exit-transform` 는 소비처가
> `--app-tooltip-enter-transform-from` / `-to` 를 **직접 세워야** 동작한다(키프레임 본문이 그 변수만
> 참조). 세우지 않으면 애니메이션이 무효가 된다.

#### 스피너

`components/ui/LoadingSpinner.tsx` 와 `components/ui/InlineLoadingLabel.tsx` 가 **같은 링 구현**을 갖는다.

- 구조: 원 하나(`relative rounded-[50%]`)에 `::before` / `::after` 두 링을 겹친다. 둘 다 `absolute; inset:0; border-radius:inherit; box-sizing:border-box`.
  - `::before` = 전체 테두리, `border-color: currentColor`, `opacity: 0.22` (배경 링)
  - `::after` = `border-color: transparent` + `border-top-color: currentColor` (도는 호)
- 색은 `currentColor` — 소비처 텍스트 색을 그대로 따른다.
- 속도: `animation: inlineLoadingSpin 700ms linear infinite`. `@keyframes inlineLoadingSpin { to { transform: rotate(360deg) } }` (`app/keyframes.css`). 한 바퀴 **700ms**, 등속.

| size | 지름 | 링 두께 |
| --- | --- | --- |
| `md` (기본) | `w-8 h-8` = **16 × 16px** | `border-2` = **2px** |
| `sm` | `w-6 h-6` = **12 × 12px** | `border` = **1px** |

그 외 사이즈는 없다.

**독립형 (`LoadingSpinner`)**: 래퍼 `inline-flex items-center justify-center align-middle` + `line-height: 0` + `color: inherit` + `shrink-0`. 회전은 항상 running.

**접근성**: 기본은 `role="status"` + `aria-live="polite"` + `aria-busy` + `aria-label`(기본 `"Loading"`, 화면별 i18n 으로 override). `decorative` 면 그 넷을 빼고 `aria-hidden` 만 남긴다 — **스피너 + 텍스트 한 행에서 부모가 이름을 소유할 때** 쓴다.

**인라인 로딩 라벨 (`InlineLoadingLabel`)**: `inline-flex items-center justify-center min-w-0 max-w-full` 안에 [라벨 `<span class="flex-none min-w-0">`] + [스피너 슬롯 `<span aria-hidden>`] 두 칸. **라벨 텍스트가 idle ↔ loading 으로 교체되고 스피너는 오른쪽에서 열린다.**

| 슬롯 | 값 |
| --- | --- |
| 공통 | `inline-flex items-center justify-center overflow-hidden flex-none`. 높이는 열림/닫힘 무관 고정 — md `h-8`(16px) / sm `h-6`(12px) |
| 닫힘 | `w-0 ml-0 opacity-0 [transform:scale(0.85)]`, 회전 `animation-play-state: paused` |
| 열림 (md) | `w-8`(**16px**) · `ml-3`(**6px**) · `opacity-100` · `scale(1)`, 회전 `running` |
| 열림 (sm) | `w-6`(**12px**) · `ml-2`(**4px**) · 나머지 동일 |

전환은 `width` · `margin-left` = **200ms `cubic-bezier(0.22,1,0.36,1)`**, `opacity` · `transform` = **180ms ease**.

**문구 규칙**: `loadingLabel` 의 **후행 말줄임표(`...` 또는 `…`)를 제거**하고 표시한다 — 도는 스피너가 그 역할을 대신하므로. idle 상태에는 `idleLabel` 을 그대로 쓴다.

#### 노드 생성 중

결과 영역이 생성 셸로 교체된다. Image · Video · Edit 이 같은 구조를 쓰고, TextNode 는 부모가 높이를 고정해 `min-h` 만 없다.

| 부품 | 스펙 |
| --- | --- |
| 셸 | `relative flex flex-col items-center justify-center gap-2`(**4px**) · `w-full h-full min-h-60`(**120px**) · `overflow-hidden pointer-events-none` · `rounded-[inherit] bg-transparent`. 컨테이너에 `role="status" aria-live="polite"` |
| 아이콘 박스 | `relative z-[1] isolate inline-flex items-center justify-center` · `w-32 h-32` = **64 × 64px** · `[transform-origin:center center] [filter:none] [will-change:transform,opacity]` · `[&>svg]:w-full [&>svg]:h-full [&>svg]:block`. 아이콘 컴포넌트는 `size={64} strokeScreenPx={2}` |
| 단계 캡션 | `type-body-14-medium` + `relative z-[1] text-center max-w-[92%] inline-block`. 아이콘 아래 **4px**(셸의 `gap-2`) |

**아이콘 모션(2단)** — `animate-[media-icon-grow-in_320ms_cubic-bezier(0.22,1,0.36,1)_both, media-icon-breathe_1000ms_cubic-bezier(0.34,1.56,0.64,1)_320ms_infinite]`.

- `media-icon-grow-in`: `scale(0.8) → scale(1)` + `opacity 0 → 1`, 1회
- `media-icon-breathe`: `scale(1) → 1.14 → 1`, 무한 루프. **`320ms` 딜레이로 grow-in 종료 시점에 이어받고, scale(1) 에서 시작하므로 전환 시 튐이 없다.**
- `motion-reduce:animate-none`.

**매체별 accent**

| 노드 | 아이콘 색 | 캡션 색 (다크 / 라이트) |
| --- | --- | --- |
| Image | `--accent-mint-500` | `--accent-mint-100` / `--accent-mint-700` |
| Video | `--accent-sky-500` | `--accent-sky-100` / `--accent-sky-700` |
| Text | `--accent-yellow-500` | `--accent-yellow-100` / `--accent-yellow-700` |
| Edit | `--accent-violet-500` | `--accent-violet-100` / `--accent-violet-700` |

라이트에서 100 셰이드를 700 으로 낮추는 이유는 밝은 카드 면에서 100 셰이드의 대비가 약하기 때문이다. 캡션 색은 `--caption-tone` 커스텀 프로퍼티에도 같은 값을 보존한다 — 쉬머가 `background-clip: text` 기법이라 `color` 가 transparent 가 될 수 있어서다. **따라서 캡션 색을 바꾸려면 `color` 만 고쳐서는 아무 변화가 없다.** (쉬머 스윕 적용 범위는 **7.5절**)

**단계 라벨 타이밍 (ImageNode)**: 외부 API 가 진행률을 주지 않아 **시간 기반**으로만 전환한다. 전환 시각 `[3000, 6000, 12000, 24000]ms`, 마지막 단계는 유지. 완료 시 마지막 단계를 **900ms**(`IMAGE_GENERATING_TAIL_MS`) 더 보여준 뒤 결과로 교체한다.

**진행률 표현 — 세 갈래**

| 노드 | 표현 |
| --- | --- |
| Image / Video / Text | 없음. 아이콘 + 시간 기반 단계 캡션뿐 |
| Edit (영상 합성) | **실측 퍼센트**(`node.data.processingProgress` 0~100, 서버 폴링) |
| Tts / Bgm (오디오) | 실제 진행률이 없어 **9초 타이머 애니메이션**으로 대체 |

*Edit 의 진행 바*: 래퍼 `relative z-[1] flex items-center gap-4`(**8px**) · `w-[60%] max-w-80`(**최대 160px**) · `mt-1`(**2px**). 트랙 `h-2`(**4px**) · `rounded-full` · `bg-[rgb(var(--accent-violet-500-rgb)/24%)]` · `overflow-hidden`. 필은 `h-full rounded-[inherit] bg-[var(--accent-violet-500)]` 에 `transition: width 400ms cubic-bezier(0.22,1,0.36,1)`. `role="progressbar"` + `aria-valuemin/max/now`. 퍼센트 라벨은 `type-caption-12-medium` + `flex-none min-w-[2.5em] text-right tabular-nums`, 색 `rgb(var(--palette-gray-100-rgb)/82%)` / 라이트 `rgb(var(--palette-gray-900-rgb)/82%)`.

*Edit 의 영역 차오름*: 진행 바와 **함께** 프리뷰 영역 전체가 좌→우로 차오른다. `absolute inset-0 z-0` · `bg-[rgb(var(--accent-violet-500-rgb)/22%)]`(라이트 `/16%`) · `[transform-origin:left center]` · `[transform:scaleX(var(--processing-fill,0))]` — 인라인 스타일로 `pct/100` 을 넣는다. `transition: transform 400ms cubic-bezier(0.22,1,0.36,1)` + `motion-reduce:[transition:none]`. **`width` 가 아니라 `scaleX` 를 쓰는 이유는 레이아웃/페인트 없이 GPU 합성만으로 차올라 노드가 많아도 가볍기 때문이다.**

*오디오 타이머 게이지*: `absolute inset-0` · `[background:var(--accent-pink-900)]`(라이트 `var(--accent-pink-100)`) · `[transform-origin:left center]` · 시작 `scaleX(0)` · `animation: audioAreaGeneratingFill 9s cubic-bezier(0.22,1,0.36,1) both`(BGM 은 이름만 다른 `bgmAudioAreaGeneratingFill`, 키프레임 본문은 `scaleX 0→1` 로 동일). `motion-reduce` 에서는 애니메이션 없이 `scaleX(1)`. 생성 중 결과 영역은 완료 상태와 같은 높이 `min-h-[calc(32px + 2 * var(--node-inner-padding,8px))]` 를 확보하고 면을 카드 면(다크 `rgb(var(--gray-800-rgb)/100%)` / 라이트 `rgb(var(--palette-gray-100-rgb)/100%)`)으로 바꾼다 — 그렇지 않으면 높이가 접혀 게이지가 보이지 않는다.

#### 빈 상태

전 노드 공통 패턴이다: `flex flex-col items-center justify-center gap-2`(**4px**) · `opacity: 0.28` · `pointer-events-none`. 아이콘 위, 라벨 아래 세로 1열.

- 아이콘 박스: `inline-flex items-center justify-center w-32 h-32` = **64 × 64px**. 아이콘 컴포넌트는 `size={64} strokeScreenPx={2}` 이며 노드 종류별 글리프(Image=`ImageIcon` · Video=`VideoCameraIcon` · Edit=`MagicWandIcon` · Text=`TextIcon`)를 그 노드의 **타이틀 아이콘과 같은 출처**에서 쓴다.
- 색은 accent 가 **아니라 중립**이다 — `rgb(var(--palette-gray-000-rgb)/100%)`, 라이트 스코프 `rgb(0 0 0/100%)`. 아이콘·라벨 동일.
- 라벨: `type-body-14-regular`. 부모의 `opacity: 0.28` 이 함께 적용되므로 실효 대비는 그만큼 낮다.
- TextNode 만 셸에 `w-full h-full min-h-0 text-center` 를, 라벨에 `m-0 max-w-full whitespace-pre-line` 을 더해 문구의 명시적 `\n` 을 살린다.

#### 오류 배너

Image · Video · Edit · Tts · Bgm **다섯 노드가 바이트 동일한 배너**를 쓴다. (TextNode 의 LLM 오류만 다른 표현이다 — **7.5절**)

- 면: `flex items-center gap-4`(**8px**) · `w-full` · `h-14`(**높이 28px 고정**) · `py-0 px-4`(**좌우 8px**) · `box-border` · `[border:0.5px solid rgb(var(--accent-red-500-rgb)/20%)]` · `rounded-12` · `bg-[rgb(var(--accent-red-500-rgb)/10%)]` · `color: var(--accent-red-500)`.
- **면 10% / 테두리 20% / 글자 100% 이며 라이트·다크 공통값이다** — 테마 분기가 없다.
- 텍스트: `type-body-14-regular` + `flex-[1_1_auto] min-w-0 overflow-hidden text-ellipsis whitespace-nowrap!`. 28px 한 줄 고정이므로 **넘치면 말줄임**하고 전문은 `title` 속성으로 노출한다.
- 배치: 프롬프트 셸 안, 메타 툴바 + 생성 버튼 행 **아래**에 foot tray 의 `gap-4`(8px)만큼 띄워 폭을 가득 채워 놓인다. 컨테이너에 `role="alert"`. (EditNode 만 `ACTION_AREA` 의 `flex-wrap: wrap; gap: 8px` 덕에 실행 버튼 행 아래로 감기지만 간격 결과는 같다.)
- **같은 배너가 두 메시지를 담는다** — 생성 실패와 **크레딧 부족 안내**. 즉 빨간 배너 = "이 노드는 지금 생성할 수 없다" 하나의 의미다.

> **z-index 스택**: `ChromeTooltip` 포털 **10400** > 컬러 팝오버 10300 · 모달 Radix 툴팁 **10300** >
> 영상 편집 모달 10100 ≫ 노드 핸들 `[data-tooltip]` **100**. 핸들 툴팁은 노드 내부 stacking context
> 안에 있어 사이드 버튼·미디어 zoom transform 에 잘릴 수 있고, **그래서 `ChromeTooltip` 은
> `document.body` 로 포털한다.**
>
> `NodeGeneratingShimmer.module.css` 와 `InlineLoadingLabel.module.css` 는 **둘 다 존재하지 않는다.**
> 생성 중 UI 는 각 노드 TSX 상단 상수(`MEDIA_ROOT` / `MEDIA_ICON_*` / `MEDIA_CAPTION_*`)로 인라인됐고,
> `@keyframes` 만 `app/keyframes.css` 로 올라가 있다. `InlineLoadingLabel`과 `LoadingSpinner`도
> Tailwind 클래스 문자열로 인라인되어 있으며, 두 파일의 주석은 제거된 모듈이 남아 있다는 뜻이 아니라
> 전환 출처와 공유 링 레시피를 설명한다.
>
> `--app-tooltip-kbd-bg` 와 `--app-tooltip-text-subtle` 은 정의만 있고 **소비처가 0** 이다 —
> 툴팁 안 단축키 칩 UI 는 아직 없다.
>
> `prefers-reduced-motion` 대응 문법이 노드마다 다르다 — ImageNode 캡션은 `motion-safe:` 로 켜고,
> VideoNode 캡션은 기본으로 켠 뒤 `motion-reduce:` 로 되돌린다. **계산 결과는 같으므로 둘 중
> 아무거나 베껴도 된다.**

### 6.13 앱 페이지 셸 (App Page Shell — 사이드바 우측 메인 영역)

**6.3** 이 좌측 사이드바 *안쪽*을 다룬다면, 이 절은 **사이드바 오른쪽 전부**를 다룬다 — 카드가 어느 요소에 걸리는지, 뷰포트 여백을 누가 만드는지, 무엇이 스크롤하는지, 720px 아래에서 무엇이 사라지는지. 로그인 후 화면 대부분(홈·아카이브·노드캔버스 허브·대시보드·마이페이지·설정·구독·영상 편집·어드민)이 이 셸을 공유한다.

**원천 파일 (`apps/web`):**

| 역할 | 파일 |
| --- | --- |
| 셸 토큰 (`--app-gnb-*` · `--app-shell-*` · `--app-page-bg`) | `app/globals.css` `:root`, `html[data-app-gnb-sidebar-collapsed="true"]`, `@media (max-width: 719px)` |
| 메인 카드 크롬 SSOT (`appMainCardChrome` / `appMainCardChromeSurface`) | `app/globals.css` (레이어 **밖** 전역 클래스) |
| 형태 A 씬 (카드 = `<main>`) | `components/scenes/appHomeSceneStyles.ts` · `NodeCanvasHomeScene.tsx` · `YoutubeAnalyticsScene.tsx` · `InstagramAnalyticsScene.tsx` · `app/admin/AdminClient.tsx` |
| 형태 B 씬 (카드 = 별도 패널 div) | `components/scenes/myPageSceneStyles.ts` · `VideoEditScene.tsx` · `HighlightScene.tsx` · `HighlightProjectScene.tsx` · `ExploreScene.tsx` · `SettingsScene.tsx` · `SubscriptionScene.tsx` |
| 사이드바 fixed 래퍼 · 모바일 드로어 · 상단 크롬 바 portal | `components/navigation/Gnb.tsx` |
| 헤더 스크롤 진행값 주입 | `components/scenes/useMainChromeHeaderScrollProgress.ts` |
| 문서 루트 래퍼 · 프로바이더 순서 | `app/layout.tsx` |

> **라우트 레이아웃은 셸을 만들지 않는다.** `(app)` 라우트 그룹은 존재하지 않고,
> `app/nodecanvas|mypage|analytics|settings|archive/layout.tsx` 는 전부 `export const metadata = noIndexMetadata`
> 뒤에 `return children` 만 하는 통과 레이아웃이다. **앱 셸은 씬 컴포넌트 안에 통째로 들어 있다** —
> 페이지 셸을 찾을 때는 라우트 폴더가 아니라 `components/scenes/*Scene.tsx` 를 본다.

#### 적층 순서 (바깥 → 안)

```
<body>
├─ PastDueBanner                       ← SITE_ROOT 의 형제, 앞에 놓인다
└─ SITE_ROOT   (min-h-svh flex flex-col)
   └─ SITE_CONTENT (flex-1 min-h-0)
      └─ 씬 루트                        ← 여기부터 씬 파일이 소유한다
         ├─ Gnb 사이드바 (position: fixed — 문서 흐름 밖)
         └─ 메인 카드
            ├─ 헤더 슬롯 (sticky · Gnb 가 portal 로 채운다)
            └─ 스크롤 뷰포트
               └─ 페이지 콘텐츠
```

- 프로바이더 스택(`AuthProvider` → `ThemeProvider` → `YoutubeConnectionProvider` → `InstagramConnectionProvider` → `I18nProvider` → `GenerationProvider` → `HighlightUploadProvider`)은 **DOM 을 만들지 않는다.**
- `SITE_ROOT` · `SITE_CONTENT` 두 래퍼는 배경을 직접 칠한다 — 라이트 `bg-palette-gray-200`, 다크 `dark:bg-palette-gray-900`.
- 사이드바는 `position: fixed` 라 문서 흐름에서 빠진다. **메인 영역은 아래 `margin-left` / `width` 로만 사이드바 자리를 비운다.**

#### 카드를 어디에 거는가 — 형태 A / 형태 B

같은 화면처럼 보이지만 카드가 걸리는 요소가 두 계열로 갈린다. 새 페이지는 반드시 둘 중 하나를 복제하게 되므로 먼저 어느 쪽인지 정한다(정본 선언은 **7.5절**).

| 항목 | 형태 A — 카드 = `<main>` | 형태 B — 카드 = 별도 패널 div |
| --- | --- | --- |
| 크롬 클래스 | `appMainCardChrome` | `appMainCardChromeSurface` |
| 사이드바 자리를 비우는 요소 | **씬 루트** (`margin-left` + `width: calc(100% − 폭)` + `box-sizing: border-box`) | **패널 div** (`margin-left` + `margin-right: var(--app-gnb-main-inline-padding-end)`, `margin-top/bottom: 0`) |
| 접힘 전환 대상 | `margin-left` **와** `width` (320ms `cubic-bezier(0.4,0,0.2,1)`) | `margin-left` **만** (같은 320ms 커브) |
| 페이드 | 하단 20px **만** (`::before`) | 패널 자체 `::before` 로 **상단 + 하단 20px** |
| 카드 안쪽 패딩 | `<main>` 이 `margin: 0` + `padding: 0 var(--app-gnb-main-inline-padding)` (좌우 16px, 상하 0) | 패널 패딩 0, 안쪽 `<main>` 이 `padding: 0 12px 20px 16px` |
| 스크롤 컨테이너 | `<main>` 안의 별도 스크롤 뷰포트 | `<main>` 자신 |
| 페이지 루트 | 씬 루트가 곧 카드의 부모 — 고정 높이 + `overflow: clip` | 전폭 (`relative` · `min-height: 100dvh` · `flex flex-col` · `overflow: hidden`) |

형태 B 의 페이지 루트는 `<main>` 존재 여부를 `:has()` 로 감지해 `height: 100dvh; max-height: 100dvh; padding-top: var(--app-gnb-safe-top); padding-bottom: var(--app-gnb-rail-padding-bottom); box-sizing: border-box` 를 켠다. ≤719px 에서 그 상·하 패딩은 0 이 된다.

#### 셸 토큰과 실제 값

| 토큰 | 데스크톱 | ≤719px |
| --- | --- | --- |
| `--app-gnb-sidebar-width` (펼침) | `min(280px, calc(100vw − 120px))` → 하한이 960px 이므로 실질 **280px 고정** | **0px** (드로어가 자기 폭을 따로 잡는다) |
| `--app-gnb-sidebar-width` (접힘) | `calc(2 * var(--app-gnb-sidebar-padding-x) + var(--app-gnb-sidebar-menu-hit-w))` = 2×12 + 32 = **56px** | **0px** (접힘 스코프도 함께 0 으로 강제) |
| `--app-gnb-sidebar-menu-hit-w` | `calc((16px − 12px) + 20px + 8px)` = **32px** | — |
| `--app-gnb-safe-top` | `max(12px, env(safe-area-inset-top, 0px))` → 데스크톱 **12px** | 동일 (단 루트 패딩이 0 이 된다) |
| `--app-gnb-main-inline-padding` (좌) | **16px** | 16px (유지) |
| `--app-gnb-main-inline-padding-end` (우) | **12px** | **16px** |
| `--app-gnb-rail-padding-bottom` | **12px** | **0px** |
| `--app-shell-min-width` | **960px** = 사이드바 280 + 카드 우측 12 + 본문 ≈ 668 | 미적용 |

사이드바 자체는 `gnb-wrapper`(`position: fixed; top: 0; left: 0; z-index: 1001; padding: 12px 24px`) 위에 사이드바 변형이 `left: 0; right: auto; width: var(--app-gnb-sidebar-width); height: 100dvh; flex column` 과 `padding-top: var(--app-gnb-safe-top)` · `padding-left/right: var(--app-gnb-sidebar-padding-x)`(12px)를 덮는다. **`padding-bottom: 12px` 는 베이스 shorthand 에서 그대로 남는다**(의도 여부는 **7.5절**). 폭 변화는 `transition: width 320ms cubic-bezier(0.4,0,0.2,1)`.

#### 메인 카드 — 표면

`appMainCardChrome` 과 `appMainCardChromeSurface` 는 `globals.css` 의 **레이어 밖 전역 클래스**이며 본체 값이 동일하다.

- `position: relative` · `border: none` · `overflow: hidden` · `border-radius: 16px` · `box-shadow: var(--glass-dropdown-frame)`
- 면색은 테마 스코프가 공급한다 — 라이트 `--palette-gray-100`, 다크 `--palette-gray-800`
- 테두리 대신 `::after`(z-index **11** · `pointer-events: none` · `border-radius: inherit`)가 글래스 링을 그린다: `--glass-bevel-highlight` / `--glass-bevel-shade` 를 `rgb(var(--glass-inner-shadow-rgb)/25%)` 로, 좌·우 inset 을 `--glass-bevel-offset` · `--glass-bevel-blur` 에 `/18%` 로. (토큰 값은 **6.1절**)
- 두 클래스의 유일한 차이는 **하단 페이드**다. `appMainCardChrome` 만 `::before`(z-index **10** · `inset: 0` · `border-radius: inherit`)로 `linear-gradient(to top, 면색 100% → 53% @50% → 19% @80% → 0% @100%) bottom / 100% 20px no-repeat` 를 갖는다. `appMainCardChromeSurface` 에는 `::before` 가 없고, 형태 B 는 패널이 자체 `::before` 로 상·하 페이드를 함께 그린다 — 상단 높이는 `calc(72px * min(1, var(--header-progress, 0) * 1000))` 이라 **스크롤이 0 을 벗어나는 순간 0 → 72px 로 즉시 켜진다.**

> **카드 테두리를 1px stroke 로 그리지 말 것.** `border` 는 `none` 이고, 링은 `--glass-dropdown-frame`(다중 box-shadow) + `::after` 베벨 inset 조합이다. 라이트/다크에서 값이 뒤집히므로 stroke 로 근사하면 재현되지 않는다.

#### 여백은 카드가 아니라 씬 루트가 만든다

형태 A 카드의 `margin` 은 **네 방향 모두 0** 이다. 화면 가장자리와의 12px 은 씬 루트 패딩이 만든다.

| 방향 | 값 | 이유 |
| --- | --- | --- |
| 위 | `var(--app-gnb-safe-top)` (데스크톱 12px) | 노치 대응 겸 카드 상단 여백 |
| 우 | `var(--app-gnb-main-inline-padding-end)` (12px) | 카드·레일 우측 여백 |
| 아래 | `var(--app-gnb-rail-padding-bottom)` (12px) | 뷰포트·카드 사이 |
| 좌 | **0** | 카드가 사이드바에 딱 붙어야 하고, 카드 안쪽 `--app-gnb-main-inline-padding`(16px)이 사이드바 메뉴 시작선과 동기된다 |

같은 이유로 사이드바 헤더 행은 `padding-left: calc(var(--app-gnb-main-inline-padding) − var(--app-gnb-sidebar-padding-x))` = **4px** 을 받아 로고 시작선이 카드 안쪽 16px 선과 맞는다. 분석 씬만 카드 좌우 패딩을 0 으로 두고(상단 배너 풀블리드) 자식 `dashboardBody` 가 `pl/pr: var(--app-gnb-main-inline-padding)` 으로 인셋을 잡는다.

#### 페이지 배경

- 토큰은 **`--app-page-bg`** 다. `--background` 가 **아니다** — 그쪽은 법적 고지·`error`·404 전용이다(**4.4절**).
- `--app-page-bg` 는 네 스코프(`html[data-theme=dark]` · `html[data-theme=light]` · `[data-landing-walkthrough-dark]` · `[data-landing-walkthrough-light]`) 모두에서 `var(--gray-900)` 로 선언된다.
- **라이트에서는 씬 루트가 이 토큰을 쓰지 않고 `html[data-theme=light] &` 로 `--palette-gray-200` 을 직접 덮어쓴다.** `SiteRootLayout` 의 `.content` 와 톤을 맞춰 투톤을 막기 위해서다(토큰과 오버라이드 중 무엇이 정본인지는 **7.5절**).
- ≤719px 에서는 라이트 `--palette-gray-100`, 다크 `--palette-gray-800` — 즉 **모바일에서는 페이지 배경이 카드 면색과 같아진다.** 카드 크롬이 사라지므로 그래야 이음매가 보이지 않는다.

#### 라이트 앱 셸은 회색 램프를 통째로 다시 매핑한다

`html[data-theme=light] body:has(.gnb-wrapperSidebar)` 스코프가 라이트 팔레트 자체를 갈아끼운다.

| 토큰 | 기본 | 앱 셸(라이트) |
| --- | --- | --- |
| `--palette-gray-100` | `#f1f1f3` | **`#f8f8f9`** |
| `--palette-gray-150` | `#eaebee` | `#f1f1f3` |
| `--palette-gray-200` | `#e3e4e8` | **`#eeeef1`** |
| `--palette-gray-300` | `#d5d7dd` | `#e4e5e9` |
| `--palette-gray-400` | — | `#d5d7dd` |
| `--palette-gray-500` | — | `#bcc0c9` |
| `--palette-gray-600` | — | `#9aa0ab` |

동시에 시맨틱 `--gray-400…-900` 이 한 칸씩 밀리고 `--app-page-bg: var(--palette-gray-100)`, `--dropdown-surface-bg: rgb(var(--palette-gray-100-rgb))` 로 재정의된다.

> **결과적으로 라이트 앱 셸의 실제 색은 페이지 `#eeeef1` / 카드 `#f8f8f9` 이며, 팔레트 표의 기본값(`#e3e4e8` / `#f1f1f3`)이 아니다.** 스포이드로 찍고 표와 다르다고 놀라지 말 것. 이 스코프는 **사이드바가 DOM 에 있는 화면에만** 걸린다 — CreateScene 노드 뷰·랜딩·인증 화면에는 적용되지 않는다.

#### 상단 크롬 바는 카드 안으로 portal 된다

`Gnb` 가 `mainChromeSlot` prop 을 받으면 상단 크롬 바를 `createPortal` 로 카드 안 헤더 슬롯에 심는다.

- 헤더 슬롯: `position: sticky; top: 0; z-index: 5; display: flex; flex-direction: column` + `&:empty { display: none }`. **슬롯이 스크롤 콘텐츠의 직계여야 sticky 가 먹는다** — 헤더 자신에 sticky 를 주면 슬롯 안에 갇힌다.
- 바 본체는 `position: static`, `padding: 8px var(--mainchrome-pad-x)`(기본 8px), 그리고 `width: calc(100% + bleed-left + bleed-right)` + 음수 좌우 마진으로 **카드 안쪽 패딩을 상쇄해 카드 모서리까지 풀블리드**한다.
- 배경은 카드 면색(라이트 `--palette-gray-100` / 다크 `--palette-gray-800`), 하단 1px `color-mix` 구분선이 `--mainchrome-divider-progress` 로 페이드인한다.
- ≤719px 에서 바 패딩은 `8px var(--app-gnb-main-inline-padding-end) 8px var(--app-gnb-main-inline-padding)` 로 바뀐다.

`useMainChromeHeaderScrollProgress` 가 rAF 로 스크롤 뷰포트를 읽어 두 CSS 변수를 헤더 슬롯(및 상위 `<main>`)에 직접 set 한다 — **React 렌더가 일어나지 않는다.**

| 변수 | 산식 | 용도 |
| --- | --- | --- |
| `--header-progress` | `clamp(0, 1, scrollTop / 120)` (`HEADER_COLLAPSE_SCROLL_PX = 120`) | 워드마크 축소 등 헤더 collapse |
| `--mainchrome-divider-progress` | `scrollTop <= 0 ? 0 : min(1, scrollTop / 12)` | 구분선 페이드인 (12px 만에 완전 노출) |

#### 세로 리듬

**카드 상단 안쪽 여백은 0 이다.** 첫 여백은 헤더 바의 `padding: 8px` 과 스크롤 스택이 만든다.

| 요소 | 값 |
| --- | --- |
| 스크롤 스택 | `padding-top: 0` · `padding-bottom: 16px` |
| 섹션 간격 | `margin-top: 40px` (`mt-20`) |
| 섹션 헤더 행 | `flex items-center justify-between` · `gap: 16px`(`gap-8`) · `margin-bottom: 8px`(`mb-4`) |
| 섹션 eyebrow | `margin: 0 0 8px` (헤더 행 안에서는 0) |
| 카드 그리드 | `gap: 12px` |
| 분석 씬 본문 컬럼 | `flex flex-col gap-8`(16px) · `pt-4`(8px) · `pb-20`(40px) |
| MyPage 계열 콘텐츠 컨테이너 | `flex flex-col` · `gap: 32px` |

**셸 레벨 max-width 는 없다.** 형태 A 카드는 명시적으로 `max-width: none; width: 100%` 이고 형태 B 패널도 같다. 유일한 예외는 MyPage 설정 컨테이너로, `settingsSection` 이 붙으면 `max-width: 1200px; margin-inline: auto`, 구독 설정(`subscriptionSettingsInner`)까지 겹치면 `max-width: 1400px` 이 된다. 초광폭 정책 자체는 **7.5절**.

#### 스크롤 모델 — 문서는 스크롤하지 않는다

앱 셸에서 세로 스크롤은 **카드 내부에서만** 일어난다.

- **형태 A**: 씬 루트 `height: var(--app-shell-vh, 100dvh)` · `max-height` 동일 · `overflow: clip` · `overflow-clip-margin: 2px` → 카드 `<main>` `flex: 1 1 auto; min-height: 0; overflow: hidden!` → 스크롤 뷰포트 `flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: none`.
  - `overflow-clip-margin: 2px` 은 카드 좌측 프레임 링 ±0.5px 이 셸 경계에 잘리지 않게 하려는 값이다.
  - 스크롤 뷰포트는 `width: calc(100% + var(--app-gnb-main-inline-padding) * 2)` + 음수 `margin-inline` + 같은 크기 `padding-inline` 로 카드 안쪽 패딩을 뚫고 나간다 — **스크롤바가 카드 모서리에 붙게 하려는 것**이다.
- **형태 B**: 페이지 루트 `height: 100dvh; overflow: hidden` → 패널 `flex: 1 1 auto; min-height: 0` → `<main>` `overflow-x: hidden; overflow-y: auto`.
- `--app-shell-vh` 는 AppHomeScene 이 `visualViewport.height`(없으면 `innerHeight`)를 반올림해 `documentElement` 에 px 로 주입하는 값으로, **iOS Safari 의 `100dvh` 어긋남 보정용**이다. CSS 는 `var(--app-shell-vh, 100dvh)` 폴백이라 JS 실행 전에는 기존 동작을 유지한다.

#### 반응형 — 셸이 바뀌는 지점은 719/720px 하나뿐이다

720px 미만에서 일어나는 일:

1. 폭 토큰이 0 이 되어 형태 A 의 `margin-left`/`width`, 형태 B 패널의 `margin-left`, fixed 크롬 바의 `left` 가 모두 전폭이 된다.
2. 씬 루트/페이지 루트의 상·우·하 패딩이 전부 0 이 된다.
3. **카드 크롬이 사라진다** — `appMainCardChrome`/`Surface` 가 `border-radius: 0; box-shadow: none; overflow: visible` 로 되돌아가고 `::before`/`::after` 는 `display: none` 이 된다.
4. 인셋 토큰이 바뀐다: `--app-gnb-main-inline-padding-end` 12 → **16px**, `--app-gnb-rail-padding-bottom` 12 → **0px** (좌측 16px 은 유지).
5. 페이지 배경이 카드 면색으로 바뀐다.
6. 헤더 바 패딩이 좌우 인셋 토큰 기준으로 바뀐다.

≥720px 에서는 `html` 에 `min-width: var(--app-shell-min-width); max-width: none; overflow-x: auto`, `body` 에 `max-width: none; overflow-x: auto` 가 걸린다. **960px 아래로 창을 줄이면 레이아웃이 반응하는 게 아니라 가로 스크롤이 생긴다** — 720–960px 구간용 별도 레이아웃은 존재하지 않는다.

그 밖의 브레이크포인트는 전부 **콘텐츠** 브레이크포인트다.

| 폭 | 변화 |
| --- | --- |
| 780px | 형태 A `<main>` 의 `padding-bottom: 160px`; 플로팅 생성 버튼 200×104 → 180×80, radius 24 → 20 |
| 960px | `--app-shell-min-width` 하한 · 히어로 배너 이미지 `-md` 교체 · MyPage 카드 패딩 24 → 20 |
| 720 / 1200 / 1800px | 아카이브 그리드 2 → 3 → 4 → 5열 |
| 560px | 분석 대시보드 하단 패딩 40 → 30px |
| 480px | 배너 타이틀 `--type-heading-28-size` · 플로팅 버튼 164px · 햄버거 오버레이 전환 |

#### z-index 층 (페이지 셸 기준)

| 층 | 값 |
| --- | --- |
| 카드 안 헤더 슬롯 | 5 |
| 카드 `::before` 하단 페이드 | 10 |
| 카드 `::after` 베벨 링 | 11 |
| GNB 사이드바 `gnb-wrapper` | 1001 |
| fixed 상단 크롬 바 (portal 미사용 폴백) | 1002 |
| 플로팅 생성 독 | 1050 |
| 아카이브 드롭다운 | 1100 |
| 모달 오버레이 | 1200 |
| 토스트 | 1300 |
| ≤480px 햄버거 오버레이 | 1350 |
| 드로어 스크림 | 1399 |
| 드로어 사이드바 | 1400 |

#### 상태

| 상태 | 변화 |
| --- | --- |
| 사이드바 펼침 (기본) | 폭 280px. 메인 영역이 그만큼 밀린다 |
| 사이드바 접힘 (`html[data-app-gnb-sidebar-collapsed="true"]`) | 루트 스코프에서 **폭 토큰만** 56px 로 재정의된다. **메인 영역 쪽에 이 셀렉터를 쓰는 규칙은 하나도 없다** — 씬은 `var(--app-gnb-sidebar-width)` 만 읽으므로 자동으로 따라간다. 변화는 `margin-left`(형태 A 는 `width` 도)의 320ms `cubic-bezier(0.4,0,0.2,1)` 애니메이션뿐이고 카드 패딩·radius·배경은 그대로다. 사이드바 안쪽에서는 라벨·배지·칩이 `display: none`, 메뉴 히트 영역이 32×32 정사각 고정, 워드마크가 `--app-gnb-sidebar-logo-cube-px` 로 클립된다. 상태는 `localStorage['klipse-app-gnb-sidebar-collapsed']` 에 저장되고 `isCompactViewport`(≤719px)에서는 속성을 걸지 않는다 |
| 모바일 드로어 열림 (`html[data-app-gnb-sidebar-mobile-open="true"]`, ≤719px) | 사이드바 `transform: translateX(-100%) → translateX(0)`, `box-shadow: none`, `transition: transform 320ms cubic-bezier(0.4,0,0.2,1)`(`motion-reduce` 시 전환 없음). 폭 `min(280px, calc(100vw − 40px))`, 배경 `var(--app-page-bg)`, `z-index: 1400`. 스크림은 별도 `<button>` 으로 `fixed inset-0; z-index: 1399; background: rgba(0,0,0,0.44)` + `mobileMenuFadeIn 200ms ease forwards`. **메인 영역은 이동하지 않는다** — 폭 토큰이 이미 0 이라 본문은 계속 전폭이고 드로어가 그 위를 덮는다. 드로어는 항상 **펼침** 레이아웃으로 뜨며(접힘 CSS 가 라벨·간격을 깨지 않도록 compact 뷰포트에서는 collapsed 속성을 걸지 않는다), Escape · `innerWidth > 719` 리사이즈 · 경로 변경 시 자동으로 닫힌다 |
| 카드 내부 스크롤 중 | 헤더 슬롯이 `sticky top-0` 으로 고정된 채, 12px 에서 구분선이 완전히 나타나고 120px 구간에 걸쳐 `--header-progress` 가 0 → 1 로 헤더가 collapse 한다. 형태 B 패널은 `--header-progress` 가 0 을 벗어나는 즉시 상단 72px 페이드를 켠다. 카드 하단 20px 페이드는 항상 켜져 있다 |
| 초기 로딩 (형태 A, 카드 비어 있음) | `<main>` 에 로딩 변형 클래스가 붙어 `display: flex; flex-direction: column; gap: 20px` 가 켜지고 상단 배너가 `flex-shrink: 0` 을 받아 눌리지 않는다. **카드 크롬·배경은 변하지 않는다** |
| embedded (랜딩 워크스루 데모 임베드) | 셸이 통째로 꺼진다 — 씬 루트 `min-height: 100%; background: transparent; isolation: auto`, `margin-left`·고정 높이·`overflow: clip` 없음, 카드 크롬 클래스도 붙지 않는다. `<main>` 은 `padding: 0 var(--app-gnb-main-inline-padding) 180px`(≤780px 에서 160px)로 되돌아가고, 형태 B 패널은 `display: contents` 인 투명 래퍼가 된다. **앱 라우트에서는 나타나지 않는 상태다** |
| 라이트 ↔ 다크 | 페이지 라이트 `--palette-gray-200`(앱 셸 재매핑 후 `#eeeef1`) / 다크 `--palette-gray-900`. 카드 라이트 `--palette-gray-100`(`#f8f8f9`) / 다크 `--palette-gray-800`. `--glass-dropdown-frame` 은 라이트에서 외곽 링 50 → 15%, 좌우 엣지 80 → 25%, 흰 림 50 → 100% 로 뒤집힌다. 셀렉터는 전부 `html[data-theme="light"|"dark"]` 후손 스코프이며 `prefers-color-scheme` 이 아니다 |

#### 카드에서 빠지는 화면 (opt-out)

**CreateScene 의 `viewMode === "node"`(노드 캔버스 편집 화면)은 앱 카드 셸을 쓰지 않는다.** 루트는 `[background: var(--app-page-bg)] h-[100svh] min-h-[100svh] overflow-hidden` 이고 `margin-left` 오프셋도 `appMainCardChrome*` 도 없다. 사이드바 대신 `create/ProjectHeader.tsx` 가 상단 크롬을 담당한다(**6.3절**의 `PROFILE_SLOT` 이 여기다). 좌우 여백만 셸 토큰을 재사용한다 — `<main>` 이 `pl-[var(--app-gnb-main-inline-padding)] pr-[var(--app-gnb-main-inline-padding-end)]`(16/12px), ≤720px 에서 `pt-32`(64px) `pb-10`(20px), ≤480px `pb-6!`(12px).

#### 새 앱 페이지를 만들 때 놓치기 쉬운 것

- **`--background` 를 앱 화면에 쓰지 않는다.** 페이지 배경 토큰은 `--app-page-bg` 다.
- **뷰포트 여백은 카드가 아니라 씬 루트가 만든다.** 카드 자체 margin 은 네 방향 0 이다. 카드에 margin 을 주면 좌측 0 규칙이 깨져 사이드바와 카드 사이에 틈이 생긴다.
- **카드의 `overflow: hidden!` 은 중요 선언이다.** ≤719px 리셋이 레이어 밖 전역 규칙이라, 유틸리티(`@layer utilities`)는 특이도와 무관하게 진다. 카드 overflow 를 건드리는 변경은 `!` 없이는 조용히 무시된다.
- **상단 크롬 바는 fixed 가 아니라 카드 안으로 portal 된다.** ref 가 아직 null 인 첫 렌더에서는 fixed 폴백을 **아예 그리지 않는다**(카드 밖 네비가 깜빡이는 것을 막기 위해서다). 헤더가 카드 밖에 떠 있는 스크린샷은 잘못된 참조다.
- **≤719px 에서는 카드가 통째로 사라진다.** 모바일 시안에 라운드 카드를 그리면 구현과 어긋난다.
- **형태 A `<main>` 은 720–780px 구간에서 하단에 160px 의 죽은 여백을 갖는다.** `.main { padding-bottom: 160px }` 이 소스 순서상 `.mainWithAppSidebar` 의 padding shorthand 뒤라 이긴다. 코드 주석이 이 승자를 의도적으로 보존했다고 적고 있다.
- **Tailwind spacing base 는 2px 이다.** 이 절의 유틸리티는 전부 ×2 로 읽는다 — `mt-20`=40px · `gap-8`=16px · `pt-4`=8px · `pb-20`=40px · `pb-10`=20px · `mb-4`=8px · `gap-10`=20px · `pt-32`=64px. 곡률(`rounded-16` 등)만 px 스케일이라 예외다.
- **`hover:` 유틸리티는 `@media (hover: hover)` 로 감싸이지만 이식된 모듈 CSS 의 `[&:hover]:` 는 아니다.** 셸 주변 컴포넌트에는 두 표기가 섞여 있다.

### 6.14 상태·결과 화면 템플릿 (결제 결과 7종)

결제 성공/실패 뒤에 도착하는 7개 라우트가 **같은 한 벌의 화면**을 쓴다. 이 절은 그 템플릿의 부품·리듬·상태를 기술한다. 셸(사이드바 오프셋·카드 크롬·배경)은 **6.13절**과 같은 계약이고, 여기서는 카드 **안쪽**만 다룬다.

**대상 라우트 (`apps/web/app/mypage/`):**

`topup/success` · `topup/fail` · `upgrade/fail` · `upgrade/billing-success` · `upgrade/billing-fail` · `upgrade/billing-change-success` · `upgrade/billing-change-fail`

**원천 파일 (`apps/web`):**

| 역할 | 파일 |
| --- | --- |
| 화면 상수 (`PAGE_SHELL` · `STATUS_MAIN` · `HEADER_SLOT` · `STATUS_CARD` · `STATUS_TITLE` · `STATUS_DESCRIPTION` · `STATUS_META_LIST` · `STATUS_ACTIONS` · `STATUS_BUTTON_*`) | 위 7개 `page.tsx` **각각의 모듈 스코프** |
| 오류 코드 → 문구 매핑 | `app/mypage/upgrade/copy.ts` (`getSubscriptionErrorMessage`, 28-case switch, 기본값 `subscription.errors.unknown`) |
| 금액 포맷 | `formatSubscriptionAmount(value, amountPrefix, amountSuffix)` — en/ja 는 접두 `"KRW "`, ko 는 접미 `"원"` |
| 로딩 스윕 키프레임 | `app/keyframes.css` 의 `statusLoadingSweep` |

> **공유 컴포넌트가 없다.** 카드는 **7벌 복붙**이고 어떤 파일도 상태/결과 컴포넌트를 import 하지 않는다
> (공유 import 는 `Gnb` · `useI18n` · `copy.ts` 뿐). 다만 **값은 아직 갈라지지 않았다** — 상수 블록을
> diff 하면 차이는 구조적 유무뿐이고 숫자·토큰·클래스가 다른 곳은 한 군데도 없다.
> 따라서 아래를 **하나의 스펙**으로 읽되, 그 스펙이 일곱 파일에 흩어져 있고 이를 묶어두는 장치가
> 없다는 점을 함께 기억한다(추출 여부는 **7.5절**).

#### 적층 순서 (바깥 → 안)

```
div.PAGE_SHELL                       ← 페이지 배경 · safe-top/bottom 패딩
├─ <Gnb currentPath onNavigate mainChromeSlot={headerSlot} />   ← fixed, 흐름 밖 (6.3절)
└─ main.STATUS_MAIN                  ← 우측 앱 셸 카드. 표면 · 16px 곡률 · 글래스 프레임
   ├─ div.HEADER_SLOT                ← 빈 sticky div. ref 를 Gnb 에 넘겨 크롬 바를 portal 받는다
   └─ section.STATUS_CARD            ← 520px 콘텐츠 컬럼 (면 없음)
      ├─ 로딩 시머                    ← 처리 중일 때 아래 전부를 대체
      └─ h1.STATUS_TITLE
         p.STATUS_DESCRIPTION
         div.STATUS_ALERT_ERROR ×0–2  (billing-success 전용)
         dl.STATUS_META_LIST ×0–2
         div.STATUS_ACTIONS
```

헤더 슬롯은 **양방향 핸드셰이크**다. 페이지가 빈 sticky div 를 렌더하고 그 엘리먼트를 state 에 저장한 뒤 `Gnb` 에 `mainChromeSlot` 으로 넘기면, `Gnb` 가 상단 크롬 바를 그 안으로 portal 한다. 슬롯의 `empty:hidden` 이 아무것도 오지 않았을 때 슬롯을 접는다.

#### 부품별 치수

| 부품 | 레이아웃 · 치수 | 면 · 곡률 |
| --- | --- | --- |
| `PAGE_SHELL` | `min-height: 100vh` → `@supports(min-height: 100dvh)` 에서 `100dvh` · `padding-top: var(--app-gnb-safe-top)` · `padding-bottom: var(--app-gnb-rail-padding-bottom)` · `box-border` | 배경 **모든 단계가 `!important`**(원본 모듈 규칙이 important 였고 레이어된 유틸리티를 계속 이겨야 한다): 기본 `var(--app-page-bg)` → `html[data-theme=light] &` 는 `--palette-gray-200` → ≤719px 라이트 `--palette-gray-100` / 다크 `--palette-gray-800`. 글자색 `var(--foreground)` |
| `STATUS_MAIN` (= 실제 카드) | `flex flex-col items-stretch justify-start` · `w-auto` · `margin-left: var(--app-gnb-sidebar-width)` · `margin-top: 0` · `margin-right: var(--app-gnb-main-inline-padding-end)` · `min-height: calc(100dvh − var(--app-gnb-sidebar-align-main-margin-top) − var(--app-gnb-rail-below-chrome-gap) − var(--app-gnb-rail-padding-bottom))` · 안쪽 패딩 `pt-0 pr-12 pb-28 pl-12` = **0 / 24 / 56 / 24px** (≤900px → 우 12px · 하 40px · 좌 16px) · `transition: margin-left 320ms cubic-bezier(0.4,0,0.2,1), width 320ms …` | `position: relative` · `overflow: hidden` · `border: none` · `rounded-16` · `box-shadow: var(--glass-dropdown-frame)`. 면은 **고정 팔레트 쌍** — 다크 `--palette-gray-800`, `html[data-theme=light] &` 에서 `--palette-gray-100`. portal 되는 크롬을 위해 `--mainchrome-bleed-left/right: 24px`(≤719px 0px)도 여기서 선언한다 |
| `STATUS_CARD` | `width: min(520px, 100%)` · `align-self: center` · `flex flex-col` · `gap-12` = **24px** · `margin-top: clamp(56px, 10vh, 120px)`(≤900px → `mt-28` = 56px) | **면·테두리·곡률·패딩 전부 없음** |
| `h1.STATUS_TITLE` | `margin: 0` · `break-keep` · `overflow-wrap: break-word` | `color: text-gray-000` · `font-size: var(--type-heading-36-size)` · `line-height: var(--type-heading-36-line-height)` · `font-weight: var(--type-weight-medium)`. **`type-heading-36-*` 유틸리티 클래스를 쓰지 않으므로 font-family·feature-settings 는 붙지 않는다** |
| `p.STATUS_DESCRIPTION` | `margin: 0` · `white-space: pre-line` — i18n 문자열의 `\n` 이 실제 줄바꿈이 된다(`upgradeFail.description` 이 이에 의존) | `color: rgb(var(--gray-000-rgb) / 56%)` · `var(--type-body-16-size)` / `var(--type-body-16-line-height)` |
| `dl.STATUS_META_LIST` | `flex flex-col` · `gap: 0` · `margin: 0` | 없음 |
| `dl > div` (행) | `flex justify-between items-center` · `gap-8` = **16px** · `py-6 px-0` = 상하 **12px** | `border-bottom: 1px solid rgb(var(--gray-000-rgb) / 8%)`, `:last-child` 는 제거 |
| `dt` | `margin: 0` | `color: rgb(var(--gray-000-rgb) / 48%)` · `font-size: var(--type-body-14-size)` · `line-height: var(--type-body-16-line-height)` |
| `dd` | `margin: 0` · `text-align: right` · `word-break: break-word` | `color: text-gray-000` · body-14 / 1.5 |
| `STATUS_ACTIONS` | `flex flex-wrap` · `gap-5` = **10px** · `mt-4` = **8px** | 없음 |

#### 세로 리듬은 24px 하나뿐이다

`STATUS_CARD` 의 `gap-12`(24px)가 **이 템플릿의 세로 리듬 전부**다. 타이틀 → 본문 → 알림 → 메타 리스트 → 액션이 모두 24px 간격으로 놓이고, 액션 행만 `mt-4`(8px)를 더해 마지막 `dl` 행 경계로부터 33px 이 된다. `dl` 이 둘 연달아 오면(billing-success 의 구독 dl + 결제 dl) 하나의 연속 구분선 목록이 아니라 **24px 벌어진 두 그룹**으로 보인다.

#### 액션 버튼 2변형

두 변형 모두 `next/link` 의 `<Link>` 다 — `<button>` 이 아니다.

| 항목 | 공통 |
| --- | --- |
| 박스 | `flex items-center justify-center` · **`w-full`** · `h-20` = **40px** · `py-0 px-10` = 0 / **20px** · `rounded-12` |
| 타이포 | `font-size: var(--type-body-14-size)` · `font-weight: var(--type-weight-regular)` |
| 기타 | `text-decoration: none !important` · `cursor: pointer` · `transition: background-color 140ms ease, transform 120ms ease, opacity 140ms ease` |

| 상태 | PRIMARY | SECONDARY |
| --- | --- | --- |
| 기본 | `border: none` · 배경 `gray-000`(시맨틱 — 테마에 따라 반전) · 글자 `gray-900 !important` — 완전 대비 반전 버튼 | `border: 0` · 배경 `rgb(var(--palette-gray-000-rgb) / 8%)`(**고정** near-white) · 글자 `gray-000 !important` |
| 호버 | 배경 `rgb(var(--gray-000-rgb) / 90%)` | 배경 `…/14%` |
| 누름 | 배경 `rgb(var(--gray-000-rgb) / 82%) !important` + `transform: scale(0.98)` | 배경 `…/18% !important` + `scale(0.98)` |

- 호버는 `[&:hover]:` 로 쓰여 **`@media (hover: hover)` 로 감싸이지 않는다** — 원본 모듈 CSS 동작(터치 후 sticky hover)을 보존하려는 의도이며 파일 헤더 주석에 근거가 적혀 있다.
- `active:` 의 `!important` 는 Tailwind 가 `active:` 를 `hover:` **앞**으로 정렬하는데 원본 소스 순서에서는 active 가 이겼기 때문이다.
- **버튼은 `w-full` 이라 `flex-wrap` 안에서도 절대 나란히 서지 않는다.** 각자 한 줄을 차지하고 `gap-5`(10px)는 세로 간격으로 읽힌다. 가로 2열 목업은 구현과 다르다.

#### 처리 중 (로딩) — 비동기 3개 라우트만

`topup/success` · `billing-success` · `billing-change-success` 는 `loading = true` 로 시작해 카드 본문을 통째로 교체한다.

- `STATUS_CARD` 가 상단 오프셋 대신 `flex: 1 1 auto; justify-content: center; margin-top: 0` 을 받아 **카드 높이를 채우고 세로 중앙 정렬**된다.
- 시머 래퍼: `flex flex-col items-center justify-center` · `gap-12`(24px) · `py-30 px-10` = **60px / 20px**.
- 그 안 `<span>` 하나가 전역 유틸리티 **`type-heading-28-medium`**(크기·패밀리·feature-settings 공급)과 시머 클래스를 **함께** 갖는다: `inline-block` · `color: transparent` · `background-clip: text`(+ `-webkit-`) · 9-stop `linear-gradient(90deg, …)` 로 `rgb(var(--gray-000-rgb)/ 20% · 28% · 88% · 34% · 20% · 28% · 88% · 34% · 20%)` 를 0/12/24/36/50/62/74/86/100% 에 배치 · `background-size: 200% 100%` · `background-position: 0% 50%` · `will-change: background-position` · `animation: statusLoadingSweep 2.2s linear infinite` · `motion-reduce:animate-none`.
- 키프레임은 전역이다: `from { background-position: 0% 50% } to { background-position: -100% 50% }`. **CreateScene 의 생성 중 라벨과 같은 스윕**이다.
- 이 상태에는 타이틀·설명·메타·버튼이 **하나도 없다.**

#### 오류 알림 박스 (`STATUS_ALERT_ERROR`) — billing-success 전용

- `margin: 0` · `py-6 px-8` = **12px / 16px** · `rounded-12` · `border: 1px solid rgb(var(--accent-red-500-rgb) / 16%)` · 면 `rgb(var(--accent-red-500-rgb) / 8%)` · 글자 `text-accent-red-500` · `var(--type-body-14-size)` / `var(--type-body-14-line-height)`.
- 설명 문단과 메타 리스트 **사이**에 놓이며, 한 렌더에 **두 번**(`error` · `subscriptionError`) 나타날 수 있다.
- **다른 6개 라우트에는 빨간 면이 전혀 없다.**

#### 아이콘은 없다

7개 라우트 어디에도 `<svg>` · 아이콘 컴포넌트 · `next/image` · 이모지 · 색 배지가 **없다.** 성공/실패 구분은 **타이틀 문구**와 (billing-success 에만 있는) 빨간 알림 박스가 전부다. `role="status"` / `aria-live` 도 없어 로딩 → 결과 전환은 보조기술에 침묵한다. 체크·엑스 배지가 있는 것처럼 문서화하면 안 된다.

#### 라우트별 내용 매트릭스

| 라우트 | 비동기 | 타이틀 | 본문 | `dl` 행 | 액션 (위 → 아래) |
| --- | --- | --- | --- | --- | --- |
| `topup/success` | ○ | `profile.toast.creditsCharged(n)` / 오류 시 `subscription.topupPartialError.title` | 오류일 때만 | `Pack`(하드코딩) · `upgradeSuccess.amount` · `planTab.creditsGranted` · `planTab.creditsRemaining` | PRIMARY `profile.backToMyPage` → `/subscription` |
| `topup/fail` | — | `upgradeFail.title` | `upgradeFail.**defaultMessage**` | `labels.code` 1행 | PRIMARY → `/subscription` |
| `upgrade/fail` | — | `upgradeFail.title` | `upgradeFail.**description**` | code · message · orderId (3행, `?orderId` 기본값은 리터럴 `"-"`) | PRIMARY `backToPlans` → `/mypage/upgrade` · SECONDARY `goToArchive` → `/archive` |
| `upgrade/billing-success` | ○ | `upgradeSuccess.title` / `upgradePartialError.title` | 성공 문구 또는 오류 문자열 | 플랜 dl(newPlan · tokensGranted>0 · tokensCarriedOver>0 · nextRenewal) + 결제 dl(order · amount · method · `Card` 하드코딩) | SECONDARY `backToPlans` · PRIMARY `goToArchive`(오류 시 `tryAgain` → `/mypage/upgrade`) |
| `upgrade/billing-fail` | — | `upgradeFail.title` | `upgradeFail.description` | code · message (2행) | PRIMARY `backToPlans` · SECONDARY `goToArchive` |
| `upgrade/billing-change-success` | ○ | `profile.billingSettings.changePaymentMethodComplete` / `upgradePartialError.title` | `profile.toast.paymentMethodUpdated` 또는 오류 | `billingSettings.paymentMethodTitle`(마스킹 카드 있을 때) + `Status`(하드코딩) | PRIMARY → `/mypage?tab=settings` |
| `upgrade/billing-change-fail` | — | `upgradeFail.title` | `upgradeFail.defaultMessage` | code 1행 | PRIMARY → `/mypage?tab=settings` |

#### 카피와 로케일

- 문구는 전부 `useI18n().messages` 에서 온다 — `messages.subscription.{upgradeSuccess, upgradeFail, upgradePartialError, topupPartialError, errors.*}` 와 `messages.profile.{backToMyPage, toast.*, planTab.*, billingSettings.*}`.
- 오류 문구는 API `code` 를 `getSubscriptionErrorMessage(sub, code, fallback)` 에 통과시켜 얻는다.
- 세 로케일(`en` · `ko` · `ja`)에 필요한 키가 **모두 존재한다.** `ja` 는 `deepMerge(en, overrides)` 구조지만 오버라이드 파일이 여기서 쓰는 subscription 4블록과 profile 키를 전부 채우고 있어 **영어로 폴백되는 라우트가 없다.**
- **예외: `dt` 라벨 3개(`"Pack"` · `"Card"` · `"Status"`)가 i18n 을 우회한 영어 리터럴이다.** `/subscription` · `/settings` 의 `useDocumentTitle("구독")` / `useDocumentTitle("설정")` 도 한국어 하드코딩이다(**7.5절**).

#### 자동 리다이렉트·카운트다운은 없다

7개 파일 어디에도 `setTimeout` · `setInterval` · `router.replace` 가 없다. 각 파일의 유일한 `router.push` 는 `Gnb` 에 넘기는 `onNavigate` 핸들러(사이드바 클릭)다. 비동기 3개는 `requestedRef` 로 가드된 `useEffect` 에서 POST 를 **정확히 한 번** 쏘고 결과 화면에 머문다. "N초 후 이동" 같은 표현을 그리면 안 된다.

> **디자이너용 상태 스위치**: 개발 환경(`process.env.NODE_ENV !== "production"`)에서 쿼리로 상태를 강제할 수 있다 —
> `?preview=processing|success|error`(topup/success · billing-change-success),
> `?preview=processing|success|partial|error`(billing-success). 실제 결제 없이 네 상태를 다 볼 수 있는 가장 빠른 방법이다.

#### 상태

| 상태 | 변화 |
| --- | --- |
| 처리 중 | 카드 본문 전체가 시머 단어 하나로 대체. `STATUS_CARD` 가 `flex: 1 1 auto; justify-content: center; margin-top: 0` |
| 성공 | 타이틀 heading-36/500/`gray-000`, 설명 body-16 `gray-000` 56%, 메타 dl, 액션 행. **초록으로 변하는 것도 아이콘이 붙는 것도 없다** |
| 부분 오류 (결제는 성공, 후속 반영 실패) | billing-success: 타이틀·설명이 `upgradePartialError.*` 로 바뀌고 설명과 메타 사이에 빨간 알림 박스가 하나 더 삽입된다. dl 과 액션 행은 그대로. topup/success: 타이틀만 `topupPartialError.title` 로 바뀌고, 성공 시 생략되던 설명 문단이 나타나 오류 문자열을 담는다 — **알림 박스는 없다.** 같은 종류의 실패가 두 라우트에서 다르게 보인다 |
| 하드 오류 (POST 실패 · 필수 쿼리 누락) | billing-success: 두 메타 리스트가 모두 사라지고, 오류 문자열이 설명 문단과 알림 박스에 **중복**으로 표시되며, PRIMARY 가 `goToArchive` → `tryAgain` 으로 바뀐다. topup/success: dl 이 사라지고 타이틀 + 설명 + 버튼 하나만 남는다. billing-change-success: 타이틀이 `upgradePartialError.title`, 본문이 오류, dl 소멸, 버튼 불변 |
| 정적 실패 4종 | 로딩·fetch·상태 자체가 없다. 쿼리 파라미터로 즉시 렌더하며 `?code` 기본값은 리터럴 `"UNKNOWN_ERROR"`. 크롬은 성공 라우트와 동일하고 문구·행 수만 다르다 |
| 라이트 테마 | 페이지 `--palette-gray-200`(`!important`), 카드 `--palette-gray-100`. `--gray-000` 이 반전되어 타이틀·`dd` 가 검정이 되고 56/48/8% 알파는 검정 위 알파가 된다. PRIMARY 버튼은 검정 면 + `--palette-gray-100` 글자. `--glass-dropdown-frame` 도 함께 뒤집힌다 |
| ≤900px | 카드 패딩 우 12 / 하 40 / 좌 16px, 520px 컬럼 상단 오프셋 `clamp(...)` → 56px 고정, `dl` 행이 `flex-col` 로 쌓이고 `dd` 가 `text-left` 로 바뀐다 |
| ≤719px | 사이드바 폭·하단 레일 패딩이 0 이 되어 카드가 좌측 오프셋과 세로 패딩을 잃고, `mr-0` + bleed 0 이 된다. 페이지 배경이 카드 면색과 같아진다. **단 카드는 `rounded-16` 과 `--glass-dropdown-frame` 을 그대로 유지한다** — `/subscription`·`/settings` 패널이 모바일에서 곡률·그림자를 버리는 것과 반대다(**7.5절**) |
| ≤450px | `:root` 에서 `--type-body-16-size` 가 body-14 값으로 재정의되어 설명 문단이 14px 로 줄어든다. **타이틀은 36px 그대로** — heading-36 반응형 축소는 `[data-page-root]`(랜딩) 스코프라 이 라우트에는 걸리지 않는다 |
| 사이드바 접힘/펼침 | 카드가 `margin-left`(및 `width`)를 320ms `cubic-bezier(0.4,0,0.2,1)` 로 애니메이션한다. 520px 컬럼은 `self-center` 라 같은 320ms 동안 다시 가운데로 이동한다 |

#### 놓치기 쉬운 것

- **카드처럼 보이는 것이 `STATUS_CARD` 가 아니다.** 520px 컬럼에는 면·테두리·곡률·패딩이 전혀 없다. 표면·16px 곡률·글래스 프레임은 전부 `STATUS_MAIN`(전체 높이 우측 패널)의 것이다. "상태 카드 = 520px 라운드 박스"로 문서화하면 모든 항목이 틀린다.
- **`--type-heading-36-line-height` 의 `1.2` 폴백은 죽은 값이다.** 토큰이 정의돼 있으므로 항상 토큰이 이긴다. TSX 만 읽고 1.2 를 적으면 틀린다.
- **`--spacing: 2px` 이라 모든 유틸리티가 절반으로 읽힌다** — `gap-12`=24px · `pb-28`=56px · `pr-12`/`pl-12`=24px · `mt-28`=56px · `h-20`=40px · `px-10`=20px · `gap-8`=16px · `py-6`=12px · `px-8`=16px · `gap-5`=10px · `mt-4`=8px · `py-30`=60px. 곡률만 실제 px(`rounded-16`=16px, `rounded-12`=12px)이고 `z-5` 는 간격이 아니라 z-index 다.
- **`dt` 는 body-14 크기에 body-16 행간을 받는다.** 두 토큰의 현재 값이 같아 지금은 차이가 없지만, 토큰이 갈라지면 어긋난다.
- **이 파일들의 `!important` 는 전부 의도된 것이다** — 페이지 배경은 레이어된 유틸리티를 이겨야 하고, 링크의 `color`/`text-decoration` 은 레이어 밖 전역 `a` 규칙을 이겨야 하며, `active:` 는 Tailwind 정렬 순서를 뒤집어야 한다. 지우면 렌더가 바뀌는데도 `build`·`check-types`·`lint` 는 전부 통과한다.
- **파일 헤더 주석의 "원본 모듈 CSS 는 아직 남겨둔다"는 문장은 낡았다.** `upgrade.module.css` 와 `AppHomeScene.module.css` 는 이미 없다(`css-modules-baseline.json` 에는 `hl-*` 5개만 남아 있다). 주석을 살아 있는 원천으로 따라가지 말 것.

### 6.15 Auth 폼 컨트롤 (필드 · 라벨 · 포커스 · 검증 · 체크박스 · 제출)

**6.8** 이 인증 화면의 *2패널 테마*를 다룬다면, 이 절은 그 안에 들어가는 **폼 컨트롤 자체**를 다룬다. 대상 라우트는 `/login` · `/signup` · `/reset-password` · `/reset-password/new` · `/recover` · `/signup/check-email` 이다. 이 컨트롤들은 코드베이스에서 **폼 요소가 가장 완성도 높게 조립된 곳**이면서 동시에 공용 컴포넌트가 하나도 없는 곳이다.

**원천 파일 (`apps/web`):**

| 역할 | 파일 |
| --- | --- |
| 필드 셸·라벨·포커스·트레일링 버튼·제출 버튼 상수 | `app/login/page.tsx` · `app/signup/page.tsx` · `app/reset-password/page.tsx` · `app/reset-password/new/page.tsx` · `app/recover/page.tsx` (각 파일 모듈 스코프) |
| 동의 체크박스 | `app/signup/page.tsx` |
| 상태 카드 버튼(primary/secondary) | `app/reset-password/page.tsx` · `app/signup/check-email/SignupCheckEmailClient.tsx` |
| 제출 로딩 라벨·스피너 | `components/ui/InlineLoadingLabel.tsx` (+ `app/keyframes.css` 의 `inlineLoadingSpin`) |
| outline 리셋 (레이어 밖) | `app/globals.css` |

> **어떤 인증 화면도 `components/ui/Button.tsx` 를 import 하지 않는다.** 제출 버튼은 화면마다 로컬
> 상수다. 공용 Button 을 "인증 제출 버튼"으로 문서화하면 틀린다.

#### 필드의 적층 순서 — 박스는 `<div>` 이고 `<input>` 이 아니다

```
div (INPUT_GROUP — 스택 그룹일 때만)
└─ div (INPUT_BOX)              ← 면 · 테두리 · 곡률 · 패딩을 전부 소유. onMouseDown 으로 포커스 전달
   ├─ input                     ← border:0 · background:transparent · padding:0 · outline:none
   ├─ span (FLOATING_LABEL)     ← absolute · pointer-events-none
   ├─ button (비밀번호 표시)      ← 값이 있을 때만 마운트
   └─ button (× 지우기)          ← /login · /recover 만
```

박스가 `onMouseDown={e => { e.preventDefault(); ref.current?.focus() }}` 를 갖는다 — **박스 어디를 눌러도(라벨 포함) 캐럿이 움직이지 않고 입력에 포커스가 간다.** 박스 안에 새 컨트롤을 넣으면 그 컨트롤도 자기 `onMouseDown` 에서 `preventDefault()` + `stopPropagation()` 을 호출해야 한다(지우기 버튼이 하는 일이 정확히 그것이다).

#### 부품별 치수

| 부품 | 레이아웃 · 치수 | 면 · 곡률 |
| --- | --- | --- |
| 필드 박스 `INPUT_BOX` | `relative box-border` · `py-6 px-8` = **12px / 16px** · `cursor-text` · `transition: border-color 180ms ease, box-shadow 180ms ease` | 다크 면 `rgb(var(--gray-000-rgb) / 6%)`, 라이트는 `[html[data-theme=light]_&]:bg-gray-900`. 테두리 `1px solid rgb(var(--gray-000-rgb) / 12%)` · `rounded-12` |
| `input` | `mt-4` = **8px**(라벨 자리) · `p-0` · `w-full` · `[outline:none]` · `placeholder:text-transparent` · `placeholder=" "` | 없음 (완전히 벗겨진 상태) |
| 라벨 `<span>` | `absolute left-8`(**16px**) · `pointer-events-none` · `transform-origin: left top` · `transition: all 180ms ease` | `font-weight: var(--type-weight-medium)` |
| 비밀번호 표시 버튼 | `absolute` · `p-1`(2px) · `inline-flex items-center justify-center` · `border: 0` · 배경 투명 | 글리프 `/icons/eye.svg` ↔ `/icons/eyeslash.svg`, `w-9 h-9` = **18px** → 히트 영역 **22×22px** |
| 지우기(×) 버튼 | 같은 위치 상수, `right` 만 다름 — 지우기 `right-4`(**8px**), 표시 `right-16`(**32px**) | `/icons/XCircle.svg` 18px |
| 제출 버튼 | `w-full` · `h-24` = **48px 고정** · `mt-4`(8px) · `border: 0` · `rounded-12` · `transition: transform 180ms ease, filter 180ms ease` | 면 `bg-gray-000` / 글자 `text-gray-1000` — 반전 잉크. 라벨 클래스 `type-body-16-medium` |
| 상태 카드 PRIMARY | `inline-flex` · **`min-h-24`**(48px 최소, 고정 아님) · `w-full` · `py-0 px-9`(18px) · `rounded-12` | `bg-gray-000` · `text-gray-1000!` · `no-underline!` |
| 상태 카드 SECONDARY | 동일 박스 (항상 `/login` 으로 가는 `<Link>`) | 면 `rgb(var(--gray-000-rgb) / 8%)` → 호버 `/12%` · `text-gray-000!` |

`!` 가 붙는 이유는 레이어 밖 전역 `a { color: inherit; text-decoration: none }` 이 레이어된 유틸리티를 이기기 때문이다.

#### 필드 높이는 선언되지 않는다

어떤 인증 필드에도 `height` 선언이 없다. 실측 높이는 다음의 합이다.

```
1px(테두리) + 12px(padding-top) + 8px(input mt-4) + 입력 라인박스 + 12px(padding-bottom) + 1px(테두리)
```

`type-body-16` 기준(16px × 1.5 = 24px)이면 **58px**, `--type-body-16-size` 가 body-14 로 재정의되는 ≤450px 에서는 라인박스가 21px 이 되어 **55px** 이다. *(두 값은 산식 결과이며 브라우저 실측이 아니다.)* **Figma 에서 필드 높이를 고정값으로 스펙하면 안 된다** — 타이포나 8px 거터가 바뀌면 같이 바뀐다.

#### 라벨 — 위치와 색은 서로 다른 축이다

| 축 | 트리거 | 값 |
| --- | --- | --- |
| 위치 | `focused \|\| value` | 안착: `top: 50%` + `translateY(-50%)`, `var(--type-body-16-size)` / `var(--type-body-16-line-height)` → 부상: `top-6`(**12px**) + `transform: none`, `var(--type-caption-12-size)` / `line-height: 1` |
| 색 | **`focused` 만** | 비활성 `rgb(var(--gray-000-rgb) / 40%)` → 활성 `var(--gray-000)` |

두 술어가 다르므로 **값이 채워진 채 blur 된 필드는 라벨이 부상한 상태로 비활성 색을 유지한다.** 부상 위치 `top: 12px` 은 박스 `padding-top` 과 같은 값이며, 입력의 `mt-4`(8px)가 열어둔 거터를 정확히 차지한다.

실제 placeholder 는 공백 한 칸(`placeholder=" "`)이고 `placeholder:text-transparent` 로 지워진다 — **장식이 아니라 부동 라벨을 위한 구조물**이다. 지우면 브라우저 휴리스틱이 필드를 비어 있다고 판단한다.

#### 포커스 — outline 도 링도 아니다

`globals.css` 는 outline 을 **두 번** 죽인다(`@layer base` 안, 그리고 레이어 **밖**). 입력 자신도 `outline: none` 을 건다. 실제로 보이는 포커스는 **박스**에 걸리며, `:focus-within` 이 아니라 **React state(`focused === '<field>'`)** 로 구동된다.

| 상태 | 값 |
| --- | --- |
| 기본 | `border-color: rgb(var(--gray-000-rgb) / 12%)` · `z-index: 1` |
| 포커스 | `border-color: rgb(var(--gray-000-rgb) / 40%)` + `box-shadow: inset 0 0 0 1px rgb(var(--gray-000-rgb) / 40%)` · `z-index: 2` |

**inset 그림자가 같은 색 1px 테두리 바로 안쪽에 놓이므로 결과는 떨어진 링이 아니라 2px 두께의 40% 헤어라인**이다. 전환은 180ms ease. 액센트 색도, 오프셋 링도 없고, **키보드 포커스와 포인터 포커스가 구분되지 않는다.**

#### 스택 그룹 — 두 필드를 하나의 캡슐로 붙이는 방법

`/login`·`/recover` 의 이메일+비밀번호, `/signup`·`/reset-password/new` 의 비밀번호+확인은 하나의 캡슐로 용접된다.

- 위 박스: `border-radius: 12px 12px 0 0` + **`margin-bottom: -1px`** → 두 개의 1px 테두리가 겹쳐 한 줄이 된다.
- 아래 박스: `border-radius: 0 0 12px 12px`.
- 테두리가 겹치므로 z-index 가 상태 구동이다 — 기본 1, 포커스 2. 포커스된 쪽 테두리가 이웃 위에 그려진다.
- 그룹 전체는 `INPUT_GROUP`(`w-full`)으로 감싸져 **폼 그리드에서 자식 하나로 센다.**

곡률·테두리 두께·그룹 래퍼 중 하나만 건드려도 캡슐이 갈라지거나 헤어라인이 두 줄로 보인다.

#### 트레일링 컨트롤과 아이콘 렌더링

- 두 버튼 모두 필드에 값이 있을 때만 **마운트**된다. 애니메이션은 없다.
- 입력 우측 패딩이 그만큼 넓어진다 — 지우기만 있으면 `pr-19` = **38px**, 지우기 + 표시가 함께 가능하면 `pr-34` = **68px**.
- `/login` 에서 지우기 버튼은 `tabIndex={-1}`(키보드 건너뜀)이고 **표시 토글은 Tab 으로 도달 가능**하다.
- **글리프는 `color` 가 아니라 CSS filter 로 칠해진다.**

| 테마 | 기본 | 부모 호버 |
| --- | --- | --- |
| 다크 | `filter: brightness(0) invert(1)` · `opacity: 0.6` (흰 실루엣) | `opacity: 0.4` |
| 라이트 (`html[data-theme="light"]` 후손) | `filter: brightness(0)` · `opacity: 0.42` (검정 실루엣) | `opacity: 0.65` |

호버 방향이 테마별로 **반대**인 것은 글리프가 다크에서는 반전된 흰색, 라이트에서는 검정이기 때문이다. 이 규칙은 `@media (hover: hover)` 로 감싸지 않는다 — 원본 동작을 보존하려고 후손 훅/`[&:hover]` 로 이식했다.

#### 검증 · 경고 · 힌트 — 세 개의 서로 다른 슬롯

| 슬롯 | 위치 | 스타일 |
| --- | --- | --- |
| 폼 오류 | 마지막 필드 그룹과 제출 버튼 **사이**, 폼 그리드의 정규 자식(즉 gap 한 칸을 소비하고 버튼을 밀어낸다) | `type-caption-12-regular` + `text-accent-red-500` + `text-left pl-2`(4px — 16px 필드 패딩에서 의도적으로 벗어난 시각 보정) |
| Caps Lock 경고 | 필드 **그룹 안**, 스택 박스 아래 | `type-caption-12-regular` · 색 `var(--accent-yellow-500)` · 패딩 상/좌/우 4px, 하 0. Caps Lock **그리고** 비밀번호 필드 포커스일 때만, blur 시 해제 |
| 비밀번호 규칙 힌트 (`/signup`) | 비밀번호 필드 아래 상시 | `type-caption-12-regular` · `rgb(var(--gray-000-rgb) / 46%)` · `m-0 mt-[-4px] w-full text-left` · `line-height: var(--type-body-16-line-height)` 를 `!` 로 강제(12px 글자에 16px 리듬). `useId()` + `aria-describedby` 로 입력과 연결 |

**오류는 필드 단위가 아니라 폼 단위다. 어떤 인증 화면에도 필드 박스의 오류 상태가 없다** — 박스 상태는 기본과 포커스 둘뿐이고, 오류가 나도 테두리·면·라벨 색은 변하지 않는다.

#### 동의 체크박스 (`/signup`) — 인증 화면 유일의 진짜 포커스 링

3층 구조다.

| 층 | 역할 |
| --- | --- |
| ① 바깥 `<span>` | `relative shrink-0 w-11 h-11 mt-[1px]` = **22×22px** |
| ② 네이티브 `<input type="checkbox">` | `absolute inset-0 z-[2] w-full h-full opacity-0 cursor-pointer` — 보이지 않지만 전체 크기라 히트 영역과 키보드 시맨틱을 소유 |
| ③ 페이스 `<span aria-hidden>` | `absolute inset-0 pointer-events-none rounded-[5px]` — 실제로 그리는 층. `transition: border-color, background, box-shadow 160ms ease`(`motion-reduce` 시 해제) |

| 상태 | 테두리 | 면 | 그림자 |
| --- | --- | --- | --- |
| 미선택 | `1px solid rgb(var(--gray-000-rgb) / 26%)` | `rgb(var(--gray-000-rgb) / 5%)` | `inset 0 1px 1px rgb(var(--gray-1000-rgb)/12%), 0 1px 0 rgb(var(--gray-000-rgb)/6%)` |
| 호버 | `…/44%` | `…/9%` | — |
| `:focus-visible` | `…/62%` | — | `0 0 0 2px rgb(var(--gray-000-rgb)/18%), inset 0 1px 1px rgb(var(--gray-1000-rgb)/12%)` |
| 선택 | `1px solid var(--gray-000)` | `var(--gray-000)` | `inset 0 1px 2px rgb(var(--gray-1000-rgb)/12%), 0 1px 2px rgb(var(--gray-1000-rgb)/18%)` |

- 호버는 `input:hover:not(:focus-visible)` 로 걸려 **포커스가 호버를 이긴다.**
- **이 2px 외곽 헤일로가 인증 화면 전체에서 유일하게 보이는 키보드 포커스 표시다.** `box-shadow` 라서 레이어 밖 `outline: none` 리셋이 건드리지 못하기 때문에 살아남았다.
- 체크 글리프는 아이콘이 아니라 **회전한 CSS 테두리 모서리**다: 페이스의 `::after` 가 `left: 50%; top: 45%; width: 4px; height: 7px; border-style: solid; border-color: var(--gray-1000); border-width: 0 1px 1px 0; transform: translate(-50%, -58%) rotate(45deg)`, `opacity 0 → 1` 150ms ease. 획이 `--gray-1000`, 선택된 면이 `--gray-000` 이라 **테마에 따라 자동으로 반전**된다.
- 인증 화면에 라디오는 존재하지 않는다.

**동의 행 레이아웃**: 목록 `flex flex-col gap-5`(10px). 행 `flex items-start justify-between gap-5` — 좌측에 체크박스+문구, 우측에 "전문 보기" 버튼. `<label class="flex items-start gap-5 cursor-pointer flex-1 min-w-0">` 가 체크박스와 문구를 감싸 **문구 전체가 토글 영역**이다. 문구는 `type-body-16-regular` · `rgb(var(--gray-000-rgb)/86%)` · `pt-[1px]`(22px 박스와 광학 정렬). 전문 보기 버튼은 `type-caption-12-medium` · `py-1 px-3` = **2px / 6px** · `rounded-12` · 면 `rgb(var(--gray-000-rgb)/10%)` → 호버 `/14%` · 글자 `…/88%` → 호버 `var(--gray-000)` · `transition: background 160ms ease, color 160ms ease`.

#### 제출 버튼 상태

| 상태 | 로컬 제출 버튼 | 상태 카드 PRIMARY |
| --- | --- | --- |
| 호버 | `filter: saturate(125%) brightness(125%)` | `filter: saturate(118%) brightness(110%)` |
| 누름 | `filter: saturate(150%) brightness(150%)` + `transform: scale(0.98)` | `transform: scale(0.99)` |
| 비활성 (`submitting`) | `opacity: 0.5` · `cursor: not-allowed` · `filter: none` · `transform: none` — **비활성이 호버/누름을 이긴다** | 동일 |
| 포커스 | **아무것도 렌더되지 않는다** (레이어 밖 `button:focus, button:focus-visible { outline: none }`) | 동일 |

테두리·배경은 어떤 상태에서도 변하지 않는다 — 이 버튼의 피드백 어휘는 **filter + scale 이 전부**다.

**로딩**: 5개 화면 중 4개가 공용 `<InlineLoadingLabel loading idleLabel loadingLabel>` 을 쓴다. 라벨 텍스트가 로딩 문구로 바뀌고(끝의 말줄임표는 프로그램적으로 제거), 스피너 슬롯이 열린다 — `width 0 → 16px`, `margin-left 0 → 6px`, `opacity 0 → 1`, `scale(0.85) → scale(1)`, `200ms cubic-bezier(0.22,1,0.36,1)`(opacity/transform 은 180ms ease). 스피너는 16px 원 하나를 두 의사요소로 그린다 — `::before` 는 `currentColor` 22% 의 2px 완전 링, `::after` 는 2px 투명 링에 `border-top-color: currentColor` 만 넣고 `inlineLoadingSpin 700ms linear infinite`. **idle 일 때 `animation-play-state: paused`** 라 보이지 않는 채로 회전하지 않는다.

#### 폼 리듬

- 폼: `w-full grid gap-7` = **14px** (`/login` · `/signup` · `/reset-password/new` · `/recover`).
- 스택 필드 쌍은 `INPUT_GROUP` 으로 묶여 **그리드 자식 하나**로 센다 — 14px 간격은 그룹 **사이**에만 적용되고 그룹 안쪽 간격은 −1px 테두리 겹침이다.
- 폼을 담는 카드: `w-[min(100%,400px)] grid gap-4 justify-items-center text-center`, ≥720px 에서 `gap-12`(24px)로 벌어진다(`/login` 은 `gap-14` = 28px).
- 상태 카드 액션: `grid w-full gap-5`(10px).

#### 상태

| 상태 | 변화 |
| --- | --- |
| 필드 기본 → 포커스 | 테두리 12% → 40%, `inset 0 0 0 1px …/40%` 추가, `z-index` 1 → 2. 180ms ease. **`:focus-within` 이 아니라 React state 구동** |
| 라벨 안착 → 부상 | `top: 50%`+`translateY(-50%)` → `top: 12px`+`transform: none`, body-16 → caption-12, 행간 1.5 → 1. `all 180ms ease`. 트리거 `focused \|\| value` |
| 라벨 비활성 → 활성 색 | 40% → `var(--gray-000)`. 트리거 **`focused` 만** |
| 값 없음 → 있음 | 트레일링 버튼이 마운트/언마운트된다. `/signup`·`/reset-password/new` 는 표시 토글만, `/login`·`/recover` 는 이메일·비밀번호 양쪽에 지우기 + 비밀번호에 표시 토글 |
| 비밀번호 숨김 → 표시 | `type` 이 `password` ↔ `text`, 아이콘이 eye ↔ eyeslash, `aria-label` 이 showPassword ↔ hidePassword 로 바뀐다. 색·크기 변화 없음 |
| Caps Lock 꺼짐 → 켜짐 (포커스 중) | 노란 caption-12 경고가 필드 그룹 안에 마운트, blur 시 해제 |
| 폼 정상 → 오류 | caption-12 빨간 문단이 그리드 자식으로 마운트되어 14px 한 칸을 소비하고 제출 버튼을 밀어낸다. **필드 쪽은 아무것도 변하지 않는다** |
| 제출 활성 → 비활성 | `opacity: 0.5` · `cursor: not-allowed` · filter/transform 해제. `/reset-password` 는 60초 재전송 쿨다운으로도 비활성되며 라벨이 `"<label> (Ns)"` 가 된다 |
| 제출 대기 → 로딩 | 라벨 교체 + 스피너 슬롯 확장 + `animation-play-state: paused → running` |

#### 놓치기 쉬운 것

- **필드 높이를 스펙하지 않는다.** 12px 패딩 + 8px 라벨 거터 + 라인박스에서 파생된다.
- **라이트 테마에서 필드 면 토큰과 페이지 배경 토큰이 같다**(둘 다 `bg-gray-900`). 필드가 보이는 이유는 1px 테두리뿐이다. **4.4절**이 이 동일함을 의도로 기록하고 있으므로, 전역 결정 없이 라이트 전용 면색을 새로 만들지 말 것.
- **`--gray-000` 은 테마에 따라 반전된다.** 필드의 모든 알파(`/6%` · `/12%` · `/40%` · `/26%` · `/5%`)는 다크에서 흰 워시, 라이트에서 검정 워시다. `gray-000` 을 "흰색"으로 읽으면 안 된다.
- **포커스는 박스에 React state 로 걸린다.** 자동완성, 외부에서의 프로그래매틱 `.focus()` 등 입력의 `onFocus` 를 태우지 않는 경로에서는 **실제로 포커스인데도 필드가 기본 상태로 보인다.**
- **글리프에 색 토큰을 줘도 효과가 없다.** filter 로 칠하기 때문이며, 버튼에 붙은 `text-[…/56%]` 는 실제로 죽은 선언이다.
- **표시 토글의 히트 영역은 22×22px** 로 일반적인 터치 최소치보다 작고, `/login` 에서는 지우기만 `tabIndex={-1}` 인 비대칭이 있다.
- **`--accent-red-500` 과 `--accent-yellow-500` 은 테마에 따라 바뀌지 않는다** — 오류·Caps Lock 색은 다크 페이지와 라이트 페이지에서 동일하다. Caps Lock 클래스의 `var(--accent-yellow-500, #e5a000)` 폴백은 토큰이 정의돼 있어 **절대 적용되지 않는 죽은 값**이다.
- **체크박스 페이스의 `rounded-[5px]` 는 저장소 곡률 스케일(2/4/6/8/10/12/14/16/20/24/999)에 없는 리터럴이다.**
- **체크 표시는 4×7px, 1px 획의 CSS 테두리 모서리라 크기에 비례하지 않는다.** 22px 박스를 키우면 글리프 비율이 조용히 깨진다.
- **`html[data-theme="light"]` 후손 규칙을 쓰고 `light:` 변형을 쓰지 않는다** — 이 저장소의 `light:`/`walkthrough-light:` 는 앱 테마가 아니라 랜딩 워크스루 스코프다.

### 6.16 페이지 레벨 피드백 (로딩 · 빈 상태 · 오류 · 토스트)

**6.12** 가 **노드 카드 안쪽**의 피드백을 다룬다면, 이 절은 **페이지 레벨** — 앱 셸 카드 안, 노드 밖 — 의 로딩·빈 상태·오류·토스트를 다룬다. 두 층은 **표현이 다르고 서로 대체 가능하지 않다.** 6.12 의 값을 페이지로 확대 적용하면 구현과 어긋난다.

**원천 파일 (`apps/web`):**

| 역할 | 파일 |
| --- | --- |
| 리스트 페이지 로딩·빈 상태 | `components/scenes/NodeCanvasHomeScene.tsx` · `components/scenes/appHomeSceneStyles.ts` · `AppHomeScene.tsx` · `VideoEditScene.tsx` · `app/videoeditor/[projectId]/EditorProjectWorkspace.tsx` |
| 대시보드 스켈레톤 · 상태 패널 | `components/scenes/analytics/shared.tsx` (토큰 스코프는 `YoutubeAnalyticsScene.tsx` · `InstagramAnalyticsScene.tsx` · `components/landing/demo-snapshots/StaticAnalyticsDemo.tsx`) |
| 라우트 경계 | `app/error.tsx` · `app/not-found.tsx` + `app/not-found-content.tsx` · `app/global-error.tsx` |
| 토스트 (글래스) | `appHomeSceneStyles.ts` · `NodeCanvasHomeScene.tsx` · `CreateScene.tsx` · `VideoEditScene.tsx` · `EditorProjectWorkspace.tsx` · `highlightSceneStyles.ts` |
| 토스트 (솔리드 알약) | `components/scenes/myPageSceneStyles.ts` (소비: `SubscriptionScene.tsx` · `SettingsScene.tsx`) |
| 인라인 스피너 | `components/ui/LoadingSpinner.tsx` · `components/ui/InlineLoadingLabel.tsx` |
| 키프레임 | `app/keyframes.css` |

#### 로딩 ① — 리스트 페이지는 스켈레톤이 아니라 **시머 단어**다

아카이브·노드캔버스 허브·영상 편집 프로젝트 목록은 첫 로딩에 스켈레톤을 그리지 않는다. 가운데 텍스트 한 줄의 글자 자체가 그라디언트로 채워져 쓸린다.

- 컨테이너: `min-h-[480px] flex items-center justify-center py-40 px-0` → **최소 높이 480px, 패딩 80px 0**.
- 라벨: **`type-heading-28-medium`**.
- 그라디언트 9-stop, 전부 `--gray-000-rgb` 기준이라 **테마에 따라 자동 반전**: 20% → 28%@12% → 88%@24% → 34%@36% → 20%@50% → 28%@62% → 88%@74% → 34%@86% → 20%@100%. `background-size: 200% 100%`, 시작 `background-position: 0% 50%`.
- 애니메이션: `archiveLoadingSweep 2.2s linear infinite` (`0% 50%` → `-100% 50%`).
- `background-clip: text` 와 `-webkit-background-clip: text` 를 **각각 별도 선언으로** 내보낸다. 하나로 합치거나 접두사를 빼면 라벨이 사라지거나 쓸리지 않는다.
- 감소 모션: `[@media(prefers-reduced-motion:reduce)]:animate-none!` — 애니메이션만 끄고 그라디언트는 남는다.
- 시맨틱: `<section>` 에 `aria-live="polite"`, `<span>` 에 `role="status"` + `aria-label`.

**더 보기(무한 스크롤) 변형**은 같은 레시피에 다른 키프레임(`archiveLoadingMoreShimmer` — 본문은 위와 동일)을 쓰고, 행이 `col-span-full flex justify-center pt-8 px-0 pb-4`(상 16px / 하 8px)로 그리드 전체를 가로지른다. 색 기준이 시맨틱이 아니라 **고정 `--palette-gray-900-rgb`** 라서 `html[data-theme=dark]` 에서 `--palette-gray-000-rgb` 로 갈아끼우는 **다크 분기가 별도로 필요하다** — 첫 로딩 단어에는 없는 분기다.

#### 로딩 ② — 대시보드는 실제 스켈레톤 세트를 쓴다 (정본 레시피)

분석 대시보드(YouTube / Instagram)만 완성된 스켈레톤 시스템을 갖는다. 채택 폭이 가장 넓은 레시피이기도 하다(7파일).

- 시머 면: `background-image: linear-gradient(90deg, var(--skeleton-lo) 0%, var(--skeleton-hi) 50%, var(--skeleton-lo) 100%)` + `background-size: 200% 100%` + `animation: dashboardSkeletonPulse 1.6s cubic-bezier(0.4,0,0.2,1) infinite`.
- 키프레임: `0% { background-position: 200% 0 } 100% { background-position: -200% 0 }`.
- 곡률은 `rounded-8`(8px)이며 **면 상수(`SKELETON_SURFACE`)와 분리되어 있다.** 알약 변형이 `rounded-[999px]` 로 곡률만 덮어쓸 수 있어야 하기 때문이다 — 곡률을 면에 구워 넣으면 한 요소에 곡률 유틸리티가 둘 올라가고 **작성자가 아니라 Tailwind 정렬 순서가 승자를 정한다.**
- `--skeleton-*` 스코프는 4개 셸에서 동일하게 공급된다(전부 `rgb(var(--gray-000-rgb) / n)`): lo **6%** · hi **12%** · surface **5%** · dot **9%** · grad-top **8%** · grad-bot **3%** · wave-peak **10%** · border **6%**. 시맨틱 기준이라 **라이트/다크 분기가 필요 없다.**

**막대 크기 스케일** — 모든 막대는 `SKELETON_BLOCK` + 사이즈 클래스 하나다. 폭은 항상 `min(100%, Npx)` 라 좁은 카드에서 접힌다.

| 이름 | 폭 | 높이 | 비고 |
| --- | --- | --- | --- |
| XS | `min(100%, 90px)` | `h-6` = **12px** | 메타·eyebrow 줄 |
| SM | `min(100%, 140px)` | `h-8` = **16px** | 라벨 줄 (기본 지연 60ms) |
| MD | `min(100%, 180px)` | `h-12` = **24px** | 값 줄 (기본 지연 120ms) |
| EYEBROW | `min(100%, 80px)` | `h-6` = **12px** | `mb-4` = 8px |
| PRIMARY VALUE | `min(100%, 140px)` | `h-14` = **28px** | 기본 지연 80ms |
| META | `min(100%, 120px)` | `h-7` = **14px** | 기본 지연 160ms |
| PILL SM | `min(100%, 88px)` | `22px` | `rounded-[999px]` |
| CHART X-LABEL | `min(100%, 40px)` | `11px` | `rounded-[999px]` |

**스태거는 막대가 아니라 카드 인덱스가 소유한다.** 카드 1 = 0ms · 2 = 80ms · 3 = 160ms · 4 = 240ms 사다리가 그 카드 안 **모든** 막대에 적용되고, 코드가 `skeletonCardDelay(index) || SKELETON_BLOCK_*_DELAY` 로 계산하므로 **막대 자신의 기본 지연은 카드 1 에서만 도달한다.** 규칙은 하나다 — **한 요소에 `animation-delay` 는 언제나 한 번만 나온다.** 원본 CSS 는 후손 셀렉터로 했지만, 이식본은 실효 지연을 미리 계산해 속성이 한 번만 나오게 한다.

**구성 — 카드 행**

- KPI 카드(`ReportKpiRowSkeleton`, 기본 3개, 그리드는 4열): `rounded-10 py-6 px-7 gap-3` = 곡률 10px · 패딩 12/14px · 간격 6px, 면 `var(--dashboard-card-bg)`, `border: 0`, `cursor-default`(라이브 카드의 포인터를 죽인다). 내용은 XS → 베이스라인 행(`flex items-baseline flex-wrap gap-x-3 gap-y-[5px]`)에 MD + XS.
- 메트릭 카드(`MetricCardsSkeleton`, 기본 4개): flex 행, gap 없음. 각 셀 `flex-1 flex-col gap-[3px] py-3 px-4`(6/8px)에 **라이브 선택 상태용 2px 투명 하단 보더를 미리 잡아둔다.** 내용 SM → MD → XS.
- 프라이머리 블록: `rounded-16 p-3 gap-4`(곡률 16px · 패딩 6px · 간격 8px) · 면 `--dashboard-card-bg` · `box-shadow: var(--glass-dropdown-frame)`. EYEBROW → 헤더 행(`pt-3 px-3 pb-1`)에 좌 PRIMARY_VALUE + SM, 우 META → 메트릭 카드 → 차트.

**구성 — 테이블 행**

`ContentTableSkeleton` 은 `OVERVIEW_CONTENT_PAGE_SIZE` 개 행을 표준 콘텐츠 카드 안에 그린다. 행은 `grid [grid-template-columns:56px_minmax(0,1.8fr)_repeat(4,minmax(60px,1fr))] gap-6 items-center p-6`(간격·패딩 12px), 하단 구분선 `1px solid var(--skeleton-border)`(`:last-child` 제거). 셀은 좌 → 우로 썸네일 `w-28 h-48 rounded-6`(**56×96px**, 라이브 9:16 썸네일과 일치) · 제목 `w-full h-8`(16px) · 숫자 4칸 `w-full h-7`(14px). **테이블 헤더는 스켈레톤이 아니다** — 실제 `<h2 class="type-body-14-medium">` 제목이 그대로 있고 우측 카운트만 `SKELETON_PILL_SM` + `aria-hidden="true"` 로 대체된다.

**구성 — 차트**

라이브 차트 래퍼(`aspect-[4/1] min-h-[140px] py-6`, ≥1000px 5/1 · ≤720px 3/1 · ≤480px 2.5/1) 안에 들어가 **예약 면적이 어긋나지 않는다.** 판: `absolute inset-[12px_0] rounded-8 bg-[var(--skeleton-surface)]`. 영역 채움: `absolute inset-0 rounded-12 overflow-hidden` 에 세로 그라디언트(`--skeleton-grad-top` → `--skeleton-grad-bot`) + 20×20px `--skeleton-dot` 점격자 2겹, `animation: dashboardSkeletonFade 2s ease-in-out infinite`(`0%,100% { opacity: .45 } 50% { opacity: 1 }`). 가짜 파형: `::after` `h-[62%]` · `border-radius: 12px 12px 8px 8px` · `--skeleton-wave-peak` → transparent · 고정 `clip-path: polygon(0 82%, 14% 72%, 30% 78%, 48% 56%, 64% 62%, 82% 36%, 100% 28%, 100% 100%, 0 100%)`. 축은 **정확히 6개**의 알약 라벨.

#### 빈 상태 (리스트 페이지)

- `<section>`: `flex flex-col items-center justify-center gap-6 py-40 px-0` → 간격 **12px**, 패딩 **80px 0**. **`min-height` 없음**(로딩의 480px 과 다르다), 테두리·배경·아이콘 **없음**.
- 컨테이너 색 `rgb(var(--gray-000-rgb) / 40%)` — 두 자식 어느 쪽의 색도 아닌 주변 톤이다.
- 제목 `<h2 class="type-body-20-semibold">` + `text-[var(--gray-000)]`.
- 본문 `<p class="type-body-16-regular">` + `rgb(var(--gray-000-rgb)/55%)` + `text-center`.
- CTA 는 세 번째 자식으로, 두 화면이 **동일하게** 공용 버튼을 쓴다: `<Button variant="primary" size="sm" leftIcon={<PlusIcon size={14} />}>`. 높이·곡률·색·그림자는 **6.10절** Button 이 소유한다.
- 임베드 분기: `html[data-theme=light] [data-forced-theme=dark] &` 스코프에서 세 색을 전부 **고정 `--palette-gray-000-rgb`** 기준으로 다시 선언한다 — 라이트 페이지에 박힌 강제 다크 데모 패널이 밝은 글자를 유지해야 하기 때문이다.

> **페이지 빈 상태에는 아이콘이 없다.** **6.12절**의 64×64 아이콘(opacity 0.28)은 **노드 카드** 빈 상태이고
> 페이지로 확대되지 않는다. 출시된 페이지 빈 상태는 전부 텍스트(+ 선택적 버튼)뿐이다.

#### 오류 ① — 대시보드 fetch 실패는 배너가 아니라 **인라인 패널**이다

`AnalyticsStatePanel` 하나가 "이 섹션을 불러오지 못했다"와 "이 섹션이 비었다"를 **모두** 담당하며, 섹션 내용 자리에 그대로 렌더된다.

- 패널: `flex flex-col gap-3 p-10 rounded-12` → 간격 **6px**, 패딩 **20px**, 곡률 12px. 면 `var(--dashboard-chip-bg-strong)`(= `--gray-700`), 테두리 `1px solid var(--dashboard-input-border)`(= `--gray-600`). 시맨틱 회색이라 테마 분기가 필요 없다.
- 제목 `type-body-16-semibold` + `text-gray-000`.
- 메시지 `type-body-14-regular` + `text-[var(--dashboard-muted-color)]`(= `--gray-400`)에 `line-height: var(--type-body-16-line-height)` 를 `!` 로 강제 — **14px 글자에 16px 행간이 의도**다. 전역 타입 클래스가 레이어 밖이라 `!` 가 없으면 진다.
- **아이콘 없음, 재시도 버튼 없음, 액센트 색 없음.** 오류와 빈 상태는 **픽셀이 동일하고 문구만 다르다.**

#### 오류 ② — 라우트 경계 (`error.tsx` / `not-found.tsx`)

둘은 같은 원본에서 이식되어 레이아웃이 동일하다.

- 루트 `<main>`: `min-h-[100svh] flex flex-col items-center justify-center pt-12 px-10 pb-16 box-border` → 패딩 상 24 / 좌우 20 / 하 32px, ≤719px 에서 좌우 `px-8`(16px). 면 `bg-[var(--background)]` · 글자 `text-[var(--foreground)]` — **앱 셸의 `--app-page-bg` 가 아니라 `--background` 를 쓰는 몇 안 되는 화면이다.**
- 콘텐츠 컬럼: `w-[min(100%,440px)] flex flex-col items-center text-center gap-6`(12px).
- 제목 `type-heading-36-medium m-0`, 설명 `type-body-16-regular m-0 max-w-[36ch] whitespace-pre-line!` · 다크 `rgb(var(--gray-000-rgb)/62%)` / 라이트 `…/58%`.
- CTA 는 공용 `<Button variant="primary">`(기본 size)에 **`mt-6!`(12px)만** 더한다 — 페이지는 간격만 공급하고 색·높이·곡률·그림자는 Button 이 소유한다는 규칙이 소스에 명시돼 있다.
- `error.tsx` 는 버튼 아래에 홈으로 가는 평문 링크를 추가하고(레이어 밖 `a { color: inherit }` 때문에 색에 `!` 필요), 마운트 시 `Sentry.captureException` 을 호출한다.
- **`global-error.tsx` 는 디자인 시스템 밖이다.** 루트 레이아웃 자체가 실패한 상황이라 `globals.css` 도 i18n 도 못 쓴다 — 인라인 스타일, 하드코딩 한국어, `#0a0a0a`/`#ededed`, `system-ui` 폰트, 8px 곡률. **토큰 위반으로 고칠 대상이 아니다.**

#### 토스트 — 세 개의 표면이 출시돼 있다

| | A. 글래스 (6곳) | B. 솔리드 알약 (2곳) | C. 에디터 오류 (1곳) |
| --- | --- | --- | --- |
| 위치 | `fixed bottom-16 left-1/2 [transform:translateX(-50%)]` → 하단 **32px**, 가운데 | `bottom: 32px; left: 50%; translateX(-50%)` | `bottom: 32px; left: 50%` |
| z-index | **1300** | **2000** | **1400** |
| 박스 | `inline-flex items-center gap-6 py-6 px-10 rounded-16` → 간격 12px · 패딩 **12/20px** · 곡률 16px | `padding: 12px 24px` · `border-radius: 999px` | `padding: 11px 20px` · `rounded-[999px]` · `max-w-[min(92vw,440px)]` · `text-center` |
| 면 | **테마에 반대로 반전** — 라이트 `rgb(var(--palette-gray-800-rgb)/70%)`(어두운 판), 다크 `rgb(var(--palette-gray-200-rgb)/70%)`(밝은 판). 둘 다 **고정** 팔레트 | `rgb(var(--gray-900-rgb) / 1)` — **완전 불투명**, 시맨틱이라 페이지와 같이 반전 | `rgb(var(--gray-900-rgb)/82%)` + `backdrop-filter: blur(12px)` |
| 테두리·그림자 | 테두리 없음. `0 8px 20px rgb(var(--gray-1000-rgb)/16%)` + **6.1절** 글래스 베벨 2줄 | `1px solid rgb(var(--gray-000-rgb)/10%)`, 그림자·블러·베벨 **없음** | `0 10px 28px rgb(0 0 0 / 30%)` |
| 글자 | `type-body-16-regular` · `white-space: nowrap`(`!`) · 라이트 `--palette-gray-000` / 다크 `--palette-gray-900` | 박스 자체에 `rgb(var(--gray-000-rgb)/92%)`, 타입 클래스는 호출부에서 붙인다(별도 텍스트 요소 없음) | — (`pointer-events-none`) |

글래스 토스트에는 선택적 액션 버튼이 있다(CreateScene 만): `inline-flex py-2 px-6 rounded-[999px]`(4/12px, 알약) · `type-body-16-medium` · **음수 마진 `-mt-2 -mr-4 -mb-2`(−4 / −8 / −4px)로 토스트 높이를 유지** · 면 라이트 `palette-gray-000/14%` → 호버 `/22%`, 다크 `palette-gray-900/12%` → `/20%` · `active:scale(0.97)` · `transition: background 120ms ease, transform 120ms ease`.

**모션 · 타이밍 · 쌓임**

- 등장 280ms `ease`: `opacity 0 → 1` + `translateY(10px) → 0`. 퇴장 280ms `ease forwards` 로 정확한 역순.
- **모든 키프레임이 `translateX(-50%)` 를 `from`·`to` 양쪽에 유지한다.** `translateY` 만 애니메이션하는 새 키프레임을 쓰면 토스트가 애니메이션 내내 중앙에서 벗어난다.
- `appHomeToastIn/Out` · `createToastIn/Out` · `highlightToastIn/Out` · `myPageToastIn/Out` **네 쌍의 본문이 바이트 동일**하다. CSS Modules 정리 과정에서 이름만 네임스페이스한 중복이지 변형이 아니다 — **토스트 모션은 하나로 스펙한다.**
- 유지 시간 뒤 닫힘 클래스로 전환하고 정확히 **280ms** 뒤 언마운트한다(퇴장이 잘리지 않게).
- **쌓임이 없다.** 구현마다 `toast` 값 하나만 저장하고 `showToast` 가 두 타이머를 지운 뒤 메시지를 교체하므로, **새 토스트는 보이는 토스트를 그 자리에서 대체한다.** 큐도, 스택도, 오프셋 사다리도, 닫기 ✕ 도 없다.
- **z 1300 은 모달 오버레이(1200)보다 위다.** 모달 안에서 띄운 토스트가 모달 위에 보이는 것은 의도다.
- 에디터 오류 토스트(C)만 모션이 240ms 로 더 빠르고, **유일하게 `prefers-reduced-motion: reduce` 에서 `animate-none!` 을 건다.**

#### 인라인(버튼 레벨) 스피너

페이지 상태는 아니지만 **유일한 공용 로딩 프리미티브**이며, 페이지 스피너를 만든다면 여기서 출발한다.

- `LoadingSpinner`: 한 요소에 두 개의 동심 링 — `::before` 는 `2px solid currentColor` 완전 링(`opacity: 0.22`), `::after` 는 `2px solid transparent` 에 `border-top-color: currentColor` 만. `border-radius: 50%` · `animation: inlineLoadingSpin 700ms linear infinite`.
- 크기: `md` = `w-8 h-8`(**16×16px**, 획 2px) · `sm` = `w-6 h-6`(**12×12px**, 획 1px).
- **색은 항상 `currentColor` 다** — 자기 토큰이 없고 놓인 자리의 색을 그대로 받는다.
- `InlineLoadingLabel` 은 라벨 옆의 폭 애니메이션 슬롯으로 감싼다: 닫힘 `w-0 ml-0 opacity-0 scale(0.85)`, 열림 md `w-8 ml-3`(16px 폭 / 6px 좌 마진), sm `w-6 ml-2`(12/4px). `transition: width/margin-left 200ms cubic-bezier(0.22,1,0.36,1)` + `opacity/transform 180ms ease`. 회전은 idle 에서 `paused`. 로딩 라벨의 끝 `...`/`…` 는 프로그램적으로 제거된다.

#### 상태

| 상태 | 표현 |
| --- | --- |
| 첫 로딩, 데이터 없음 (리스트) | 시머 단어 블록 (최소 높이 480px · 패딩 80px 0 · `type-heading-28-medium` · `archiveLoadingSweep 2.2s linear infinite`) |
| 첫 로딩, 데이터 없음 (대시보드) | 전체 스켈레톤 세트(KPI 행 + 메트릭 카드 + 차트 + 테이블). **최종 레이아웃을 그대로 예약해 도착 시 밀림이 없다** |
| 로딩 완료, 항목 0 (리스트) | 가운데 컬럼 · 간격 12px · 패딩 80px 0. 제목 `type-body-20-semibold`, 본문 `type-body-16-regular` 55%, 아이콘·테두리·배경·최소 높이 없음. 선택적 primary CTA |
| 로딩 완료, 항목 0 (대시보드 섹션) | 완전히 다른 컴포넌트 — `AnalyticsStatePanel`(테두리 있는 카드) |
| fetch 실패 (대시보드 섹션) | 같은 `AnalyticsStatePanel`, `tone="error"`. **오류 분기의 클래스 문자열이 비어 있어 픽셀은 빈 상태와 동일하다** — 제목이 `loadErrorTitle`, 메시지가 원본 오류 문자열로 바뀌는 것뿐 |
| 단일 사용자 액션 실패 (이름 변경 등) | 인라인 오류 면이 **없다** — 평범한 성공 토스트를 그대로 재사용한다. **글래스 토스트에는 오류 변형이 없다**(빨강·아이콘·별도 톤 모두 없음) |
| 렌더 예외 · 라우트 없음 | 전체 화면 인수(`min-h-[100svh]`, 440px 컬럼, 간격 12px): heading-36 제목 → body-16 설명(62% / 라이트 58%) → 공용 primary Button(`mt-6!`). `error.tsx` 는 Sentry 보고 + 홈 링크 추가 |
| 루트 레이아웃 자체 실패 | `global-error.tsx` — 디자인 시스템 밖(인라인 스타일·하드코딩) |
| 토스트 등장 / 유지 / 퇴장 | 280ms ease 등장 → 정적 유지(클릭 해제·호버 정지·닫기 버튼 **없음**) → 280ms ease 퇴장 후 언마운트 |
| 토스트 표시 중 두 번째 토스트 | 두 타이머를 지우고 닫힘 플래그를 되돌린 뒤 메시지만 교체. **재등장 애니메이션도, 쌓임도 없다** |
| `prefers-reduced-motion: reduce` | **갈린다.** 시머 단어와 에디터 오류 토스트는 애니메이션을 끄고(정적 그라디언트만 남음), **대시보드 스켈레톤에는 감소 모션 규칙이 아예 없어 계속 펄스한다** |
| 랜딩 워크스루 강제 다크 데모 안의 빈 상태 | 세 색이 `html[data-theme=light] [data-forced-theme=dark] &` 스코프에서 고정 `--palette-gray-000-rgb` 기준으로 재선언된다 |

#### 놓치기 쉬운 것

- **페이지 오류는 배너가 아니다.** **6.12절**의 28px 오류 배너는 노드 카드 안이다. 페이지 레벨에서 대시보드 fetch 실패는 **빈 상태와 같은** 테두리 패널로 그려진다 — 빨강도, 아이콘도, 액센트도, 재시도 버튼도 없다. 빨간 페이지 오류 배너를 그리면 존재하지 않는 컴포넌트를 발명하는 것이다.
- **토스트 면은 툴팁처럼 페이지와 반대로 반전된다.** 라이트에서 어두운 판 + 흰 글자, 다크에서 밝은 판 + 어두운 글자이고, **시맨틱이 아니라 고정 `--palette-gray-*`** 를 쓴다. 시맨틱 값 하나로는 이 동작을 만들 수 없다.
- **토스트는 쌓이지도 큐잉되지도 않는다.** 두 개가 겹친 목업, 오프셋 사다리, 닫기 ✕ 는 전부 구현에 없는 것이다.
- **스켈레톤 스태거는 카드의 것이지 막대의 것이 아니다.** 카드 2–4 는 그 안 모든 막대에 80/160/240ms 를 강제한다. 한 요소에 `animation-delay` 를 두 번 내보내지 않는다.
- **`SKELETON_SURFACE`(시머)와 곡률은 일부러 분리돼 있다.** 알약 변형이 곡률만 갈아끼울 수 있어야 한다.
- **`AnalyticsStatePanel` 메시지의 `!` 는 필요하다** — 전역 타입 클래스가 레이어 밖이라 그것 없이는 14px 글자에 16px 행간을 줄 수 없다.
- **간격이 2px 격자라 숫자가 눈으로는 틀리게 읽힌다**: `py-40`=80px · `bottom-16`=32px · `py-6 px-10`=12/20px · `gap-6`=12px · `gap-3`=6px · `p-10`=20px · `h-14`=28px · `w-28 h-48`=56×96px.
- **리스트 로딩은 스피너도 스켈레톤도 아니라 살아 있는 텍스트 위의 `background-clip: text` 그라디언트다.** `background-clip` 과 `-webkit-background-clip` 을 각각 내보내고 `color: transparent` 를 유지해야 한다.
- **토스트에는 `role="status"`/`aria-live` 가 하나도 없다.** 시머 로딩 단어는 갖고 있다 — 접근성을 다룬다면 토스트가 그 격차다.
- **감소 모션 대응은 시스템 전반의 동작이 아니다.** 8개 토스트 중 2개, 스켈레톤은 0개만 대응한다.

## 7) 자산 경로

실제 자산은 모두 `apps/web/public/` 하위.

- 브랜드 로고 (워드마크 + 심볼 통합):
  - `apps/web/public/klipse-light.svg` — 라이트 bg 용 전체 로고
  - `apps/web/public/klipse-dark.svg` — 다크 bg 용 전체 로고
- 심볼 단독:
  - `apps/web/public/symbol.png` — 원본 심볼 PNG. `favicon.png` / `app/apple-icon.png` 생성 기준
  - `apps/web/public/favicon.png` — `symbol.png` 기반 800×800 favicon
  - 평면 mark (`fill="currentColor"`): `apps/web/components/ui/BrandSymbolMark.tsx` — 6.8절 auth panel 용
- 워드마크 텍스트만:
  - `apps/web/public/klipse-wordmark-text-dark.svg`
- 풋터·랜딩 보조:
  - `apps/web/public/footer-logo-bg.svg` — auth brandPanel / footer 배경에 사용
  - `highlight-wordmark-gradient.svg`, `highlight-wordmark.svg`, `highlight-symbol-gradient.svg`, `highlight_symbol.svg`
- 주요 배경 이미지:
  - `apps/web/public/images/hero/*` — `hero-main-bg.webp`, `hero-main-bg-md.webp`, `Scene 7.png`, `Scene 8.png`, `demo-bg-01.jpg`
  - `apps/web/public/images/capabilities/stages/*` — `stage-00~03.webp`, `stage-00-bg.webp`, `Group 7.png`(URL 인코딩으로 사용), `generated.png`
  - `apps/web/public/images/highlight.png` — Highlight standalone landing 배너 이미지
  - `apps/web/public/images/icon-upload.svg`, `icon-sparkle.svg`, `icon-video.svg` — Highlight standalone landing 배너 인라인 아이콘
- 아이콘 시스템:
  - `apps/web/public/icons/*.svg` — UI 아이콘. 코드에서 참조되지 않는 legacy SVG는 유지하지 않는다.
- 동영상:
  - `apps/web/public/intro.mp4` (Hero 배경), `apps/web/public/videos/showcase-hero.mp4`

## 7.5) 미결정 — 결정이 필요한 항목

### Figma 변수 컬렉션에 앱 셸 램프 모드를 둘 것인가

**상황.** 라이트 회색 램프가 두 벌인데(§4.0.1) Figma 변수 컬렉션에는 전역 한 벌만 있다.
`palette-gray/100` 을 바인딩하면 `#f1f1f3` 이 나오고, 앱 화면의 실제 값 `#f8f8f9` 와 어긋난다.
현재는 **앱 화면에서 변수 바인딩을 금지하고 해결값을 직접 입력**하는 것으로 막아 두었다.

| 선택지 | 장점 | 대가 |
| --- | --- | --- |
| **A. 바인딩 금지 유지** (현행) | 코드가 유일한 원천으로 남는다 | 앱 화면 색이 Figma 에서 하드코딩돼 코드가 바뀌어도 안 따라온다 |
| **B. Figma 에 `전역`/`앱셸` 모드 추가** | 바인딩이 살아 있어 코드 변경이 전파된다 | **코드에 없는 개념이 Figma 에만 생긴다.** 모드 전환 기준(사이드바 유무)을 사람이 매번 판단해야 한다 |

**추천: A 유지.** B 는 「어느 모드인가」를 Figma 쪽에서 판단해야 하는데, 실제 조건은
`body:has(.gnb-wrapperSidebar)` 라는 **런타임 DOM 상태**라 Figma 로 옮길 수 없다. 잘못된 모드로
그리면 지금과 같은 오류가 나면서 원인은 더 찾기 어려워진다.
다만 A 는 코드 변경이 Figma 로 전파되지 않으므로, 램프가 바뀌면 **앱 화면을 손으로 갱신**해야 한다.

문서화 이전에 **결정이 필요한** 항목들이다. 코드가 자기모순이라 "현재 구현"을 그대로 적을 수 없다.
각 항목에 **관측된 분포**를 함께 적었으므로, 회의 없이 다수결이나 판단으로 정할 수 있다.
정한 뒤에는 값을 토큰으로 올리고 이 절에서 지운다.

**조용히 비워두는 것만이 유일하게 나쁜 선택지다.** 비어 있으면 다음 사람이 또 새 값을 만든다.

### 역할 토큰 층을 착지시킬 것인가

`--surface-*` / `--border-*` 9개가 정의돼 있으나 **소비처가 0**이다(`globals.css` 밖에서 `var()` 참조 0건).
`design/llms/foundations.txt` 는 Figma Semantic 컬렉션 기준 36개 역할을 광고하는데, CSS 변수로 존재하는 것은 9개뿐이다.
반면 코드는 숫자 스케일(`gray-*`)을 광범위하게 쓴다.

- **A안** — 역할 층을 실제로 착지시킨다(변수 채우고 호출부를 옮긴다). 규모가 크다.
- **B안** — "Figma 전용 / 미구현"으로 표시하고 신규 작업에 권하지 않는다. 문서가 정직해진다.

지금은 스킬이 "컬러는 역할로 고른다"고 지시하는데 코드가 그걸 못 따르는 상태다 — **문서 전체에서 가장 큰 괴리**다.

### z-index 계층

리터럴 **고유값 65종**이 쓰인다(0~99990). 관측되는 암묵 결정은 있다 — 9999 미디어 모달 · 1200/1300 토스트 계열 · 100/200 드롭다운.
이름만 정하면 `--z-*` 계열을 `:root` 에 넣는 것만으로 자동으로 문서에 실린다.
**리터럴에서 사다리를 "생성"하려 하지 말 것** — 목적이 리터럴을 없애는 것이다.

### 포커스 링 — 이것은 문서가 아니라 코드 결정이다

`globals.css` 가 outline 을 **두 번** 죽인다.

- `@layer base` 안: `button, input[type=button|submit|reset] { outline: none }`
- **레이어 밖**(1017-1027행): `button:focus, button:focus-visible, … { outline: none }`

두 번째가 **레이어 밖**이라 모든 Tailwind 유틸리티를 이긴다(레이어 없는 규칙이 레이어된 규칙을 이긴다 — `CLAUDE.md` 의 CSS Modules 함정과 같은 원리).
따라서 어떤 포커스 토큰을 만들어도 **호출부마다 `!` 가 필요하다.** 리셋을 유지할지 제거할지를 먼저 정해야 한다.
키보드 포커스가 보이지 않는 상태이므로(WCAG 2.4.7) 문서화와 별개로 판단이 필요하다.

### 모션 — 정본 커브와 duration

ease 토큰은 `--ease-out-strong` · `--ease-in-out-strong` 둘뿐인데 코드는 그 밖의 `cubic-bezier` 를 직접 쓴다.
duration 토큰은 **아예 없다**. 정본을 정하면 타이포그래피 베이스라인과 같은 방식의 ratchet 으로
raw 리터럴 수가 한 방향으로만 움직이게 할 수 있다.

### disabled 기본 opacity

관측 분포(상위): `0.5`(23) · `0.45`(16) · `0.4`(12) · `0.35`(11).
공용 `Button` 의 variant 별 차등은 의도된 설계이므로 그대로 두되, **앱 전역 기본값 하나**는 정해야 한다.

### 토스트 · 시머 · 폼 컨트롤

- 토스트가 글래스/솔리드 두 계열로 병존한다. radius·elevation·blur 가 양립 불가라 하나를 정해야 한다.
- 시머/스켈레톤 구현이 여러 벌이다. 노드의 `media-caption-shimmer-sweep` 에 SSOT 표시가 붙어 있다.
- 폼 컨트롤(입력·체크박스·토글·셀렉트)은 코드에서 뽑을 다수결이 없다. `components/ui/Button.tsx` 전례대로
  `Input` / `Checkbox` / `Select` / `Switch` 를 만들지 여부가 선행 결정이다.

### 적용 범위

어드민 화면과 `app/(highlight-standalone)` 은 디자인 시스템 적용 범위인가.
**"범위 밖"이 정당하고 값싼 답이다** — `CLAUDE.md` 는 `hl-*` 페이지를 삭제 예정이라고 적고 있다.
범위를 명시만 하면 된다.

### 6.9–6.12 전사 과정에서 드러난 항목

아래는 **6.9–6.12 를 쓰면서 코드가 자기모순임이 확인된** 것들이다. 스펙으로 적을 수 없어 여기로 뺐다.

### `--node-header-band-pad` 의 정체

캔버스 선언부 주석은 "노드 카드 상단 타이틀 밴드: `--node-header-band-pad`(16) 를 두른 안쪽 한 줄" 이라고 이 토큰을 헤더 밴드 패딩으로 규정하지만, 실제 `NODE_HEADER_ABOVE` 는 `py-0 px-1`(좌우 2px)이고 16px 을 쓰지 않는다. **이 토큰의 유일한 소비처는 `TextNode` 의 LLM 결과 영역 좌우 패딩**(`px-[var(--node-header-band-pad,16px)]`)이다.

- **A안** — 헤더 밴드 패딩을 16px 로 되돌린다(주석이 정본).
- **B안** — 토큰 이름/의미를 결과 영역 쪽으로 재정의하고 주석을 고친다(코드가 정본).

관측: 선언 1 · 헤더 소비 0 · 결과 영역 소비 1. (`node-canvas-v2/index.tsx` vs `nodes/BgmNode.tsx` vs `nodes/TextNode.tsx`)

### `--node-header-inner-h` 의 적용 범위

타이틀 줄 높이를 24px 로 고정하는지가 노드마다 다르다. Bgm · Tts · Text · Youtube 는 타이틀 줄 래퍼(`NODE_TITLE_LEFT`)에 `h`/`max-h` 로 24px 을 고정하지만, **Image · Video 에는 그 래퍼 자체가 없어** 타이틀 줄 높이가 무제약이다.

관측: 고정 4 · 무제약 2. 어느 쪽이든 밴드 실측 높이는 32px 액션 버튼이 결정하므로 지금은 눈에 띄지 않지만, **헤더 높이를 스펙으로 못박으려면 통일이 먼저다.**

### 헤더 타이틀 래퍼의 flex 성장

Bgm / Tts / Video / Text 는 `flex-[1_1_auto]`(남는 폭을 타이틀이 먹음), **ImageNode 만** `flex-[0_1_auto]` + 액션에 `ml-auto`(타이틀은 내용폭, 액션이 우측으로 밀림).

관측: `1 1 auto` 4 · `0 1 auto` 1. 밴드가 `justify-between` 이라 결과는 비슷해 보이지만 "타이틀이 늘어나는가"는 **말줄임 시점이 달라지는 구조적 차이**다.

### Figma 노드 프레임 폭 vs 구현 카드 폭

구현 카드 폭은 **400px**(`--node-card-width` / `V2_MEDIA_NODE_WIDTH`)이고, 카드 + 좌우 사이드 크롬은 **476px**(`NODE_FLOW_OUTER_WIDTH_PX` = 400 + 2×38)이다. Figma 프레임은 이 둘 어느 쪽과도 맞지 않는다.

- **A안** — Figma 프레임을 476 / 400 으로 맞춘다.
- **B안** — 구현의 `--node-side-gap` 을 조정해 Figma 값에 맞춘다.

어느 쪽을 정본으로 삼을지 결정 필요. (`design/figma/components.json` vs `node-canvas-v2/constants.ts`)

### 노드 사이드 핸들 shell 의 z-index

같은 사이드 핸들 shell 인데 Bgm · Tts · Edit 는 `z-[6]`, Video 의 우측 아웃바운드 핸들은 `z-[5]` 다(레일 컨테이너는 양쪽 모두 `z-[5]`). 현재 눈에 띄는 증상은 없지만 **핸들과 레일이 같은 값인 경우와 한 단계 위인 경우가 섞여 있다.** 위 "z-index 계층" 항목에서 `--z-*` 사다리를 정할 때 함께 정리한다.

### 공용 `Button` 의 `size="sm"` — SSOT 주장이 코드와 어긋난다

`Button.tsx` 와 `globals.css` 의 주석은 sm 이 `NodePromptGenerateButton.rootLabeled` 와 '동일 치수'라고 선언하지만, (a) 그 클래스는 CSS 모듈 제거 후 더 이상 존재하지 않고, (b) 현재 그 컴포넌트의 ROOT 는 `min-w-16`(32px) / `px-4`(8px)로 sm 의 48px / 12px 와 다르다. **높이 32px 만 일치한다.**

- **A안** — sm 을 노드 생성 FAB 과 실제로 맞춘다.
- **B안** — SSOT 주장을 폐기하고 sm 을 독립 사이즈로 문서화한다(주석 삭제).

### 포커스 링 — 공용 `Button` 과 모달 셸의 구체 사례

위 "포커스 링" 항목의 실제 피해자 둘. `components/ui/Button.tsx` 는 focus 스타일을 전혀 선언하지 않고, `GlassConfirmModal` 은 **열릴 때 확인 버튼에 프로그래매틱 포커스를 주면서도** 시각 표시가 없다. 레이어 밖 리셋을 유지할지 제거할지를 정한 뒤, 이 둘에 어떤 토큰·오프셋으로 링을 정의할지가 뒤따르는 결정이다. **스펙으로 옮길 수 있는 기존 값이 없어 이 절에 남긴다.**

### 공용 `Button` 의 로딩/처리 중 상태

공용 버튼에 `loading` prop · 스피너 슬롯 · `aria-busy` 가 **전무**하다. 반면 노드 생성 FAB(`NodePromptGenerateButton`)은 자체 스피너를 갖고 있고, `components/ui/LoadingSpinner.tsx` · `InlineLoadingLabel.tsx` 라는 재사용 가능한 프리미티브도 이미 있다.

공용 버튼에 로딩 상태를 정의할지, 정의한다면 어느 variant 에서 어떤 표현인지(라벨 교체 + 우측 슬롯 열림 = `InlineLoadingLabel` 패턴 재사용 여부) 결정 필요.

### `Button_primary` 훅과 hl 라우트의 '노란 primary'

`app/(highlight-standalone)/` 하위에서 `ui/Button` 을 import 하는 파일이 **0개**인데, `hl/page.module.css` 는 여전히 `[class*="Button_primary"]` 를 노란 CTA 색 반전용으로 잡고 있다.

- **A안** — '노란 primary' 를 문서화된 라우트 변형으로 인정한다.
- **B안** — hl 페이지 삭제 시 훅 상수(`PRIMARY_HOOK`)를 함께 제거할 대상으로 본다.

`CLAUDE.md` 가 hl-\* 페이지를 삭제 예정이라고 적고 있으므로 **B안이 값싼 답**이다.

### `Button` variant 별 호버 기법에 규칙이 없다

관측: primary = `filter: brightness(1.06)` · danger = `opacity: 0.85` · secondary/ghost = 배경 알파(라이트 5% / 8%, 다크 8% / 10%). 각각은 코드상 일관되게 적혀 있으나 **상호 관계에 규칙이 없어, 새 variant 를 추가할 때 어느 기법을 따를지가 코드만으로는 결정되지 않는다.** (disabled opacity 의 variant 별 차등은 위 "disabled 기본 opacity" 항목에서 이미 의도된 설계로 정리했다 — 여기서는 호버 기법만 다룬다.)

### 확인 모달이 Escape 로 닫히지 않는다

`GlassConfirmModal` 에는 Escape 핸들러가 없어 취소하려면 취소 버튼이나 카드 바깥 클릭이 필요하다. 반면 같은 node-canvas-v2 안의 다른 오버레이는 거의 전부 Escape 로 닫힌다(`NodeMoreMenu` · `PaneContextMenu` · `NodeContextMenu` · `CanvasZoomControl` · `PromptVariantCompareModal` · `VideoEditModal`).

관측: Escape 지원 6+ · 미지원 1(확인 모달 셸). **확인 모달만 예외인 것이 의도인지, 셸에 Escape → `onCancel` 을 넣을지 결정 필요.**

### 확인 모달의 포커스 트랩·바디 스크롤 잠금 부재

`aria-modal="true"` 를 선언하면서도 Tab 이 카드 밖으로 빠지고, 닫힐 때 이전 포커스로 복귀하지 않으며, body overflow 도 건드리지 않아 뒤 캔버스가 계속 스크롤된다. **선언과 동작이 어긋나 있다.**

- **A안** — 트랩 + 스크롤락을 넣는다.
- **B안** — `aria-modal` 선언을 조정한다.

이 셸은 확인 모달 3종을 넘어 `EditorProjectWorkspace` · `YoutubeAnalyticsScene` · `VideoEditScene` 까지 쓰므로 **결정 파급이 크다.**

### Enter 키가 danger 변형에서도 '확인'을 의미한다

`GlassConfirmModal` 은 open 인 동안 document 캡처 단계에서 Enter 를 가로채 `onConfirm()` 을 호출한다. `NodeDeleteConfirmModal` 은 `confirmVariant='danger'` 인데도 이 동작을 그대로 상속해, **입력 필드 밖에서 Enter 를 누르면 삭제가 즉시 실행된다.**

파괴적 액션에서 Enter 기본 동작을 확인으로 둘지 취소로 둘지, 또는 danger 일 때 비활성화할지는 제품 결정 사항이다.

### 모달 버튼 높이 44px 이 공용 버튼 토큰과 다르다

모달 버튼은 `h-[44px]` 리터럴 + `rounded-16` 인데, 공용 Button 토큰은 `--button-height: 40px` · `--button-radius: 12px` 다. 라운드 16px 은 카드 24 − 인셋 8 의 동심 곡률이라 근거가 있지만 높이 44px 에는 근거가 없다.

- **A안** — 모달 전용 사이즈를 인정해 토큰(`--modal-button-height` 등)으로 올린다.
- **B안** — 공용 `Button` 으로 흡수한다(높이·곡률이 바뀐다).

### 툴팁 호버 지연이 네 값으로 갈린다

관측: `ChromeTooltip` **300ms** · 영상 편집 모달 `ModalTooltip` **280ms** · 그 모달의 `Tooltip.Provider` 기본값 **360ms**(delay 를 지정하지 않은 트리거에 적용) · 노드 핸들 CSS 툴팁 **0ms**(순수 `:hover`).

표면·타이포·모션 토큰은 완전히 통일돼 있는데 **지연만 통일되지 않았다.** 정본 값을 정하고 `--app-tooltip-delay-*` 로 올릴지 결정 필요.

### 툴팁 최대폭·줄바꿈 정책이 변형별로 반대다

관측: `ChromeTooltip` = `max-width: min(320px, calc(100vw - 20px))` + `white-space: normal` + `overflow-wrap: break-word`(감김) · 노드 핸들 `[data-tooltip]` = `white-space: nowrap` + max-width 없음(무한히 옆으로 뻗음) · 모달 Radix 툴팁 = `min(288px, 94vw)`.

같은 표면 SSOT 를 공유하는 세 변형의 최대폭/줄바꿈을 **하나로 볼지 변형별 규칙으로 남길지** 결정 필요.

### 생성 중 캡션의 쉬머 스윕이 노드마다 있고 없다

관측: ImageNode · VideoNode 는 `media-caption-shimmer-sweep 1.8s linear infinite` + `background-clip: text` 그라디언트를 캡션에 얹지만, TextNode · EditNode 는 **같은 `NodeGeneratingShimmer SSOT` 주석을 달고도** 그라디언트·스윕이 전혀 없다(색만 accent). 네 노드 모두 아이콘 모션·셸·타이포는 동일하다.

전 노드 적용인지 이미지/영상 한정인지 결정 필요.

### 오류 표시 방식이 TextNode 만 다르다

관측: Image · Video · Edit · Tts · Bgm 다섯 노드는 **바이트 동일한** red-500 배너(면 10% / 테두리 0.5px 20% / 글자 100%, 높이 28px, radius 12px)를 쓰는데, TextNode 의 LLM 오류는 배너 없이 `<p class="type-body-14-regular">` 하나에 **토큰이 아닌 하드코딩 색** `rgb(255 140 140 / 92%)`(라이트 `rgb(180 40 40 / 92%)`)를 쓴다. 게다가 **오류가 결과 영역 자체를 대체한다**(다른 노드는 결과 영역을 두고 프롬프트 하단에 배너를 덧붙인다).

통일 여부와 방향 결정 필요. 하드코딩 색은 어느 쪽으로 정하든 토큰으로 올려야 한다.

### 오류 배너의 닫기(dismiss) 유무가 갈린다

관측: TtsNode · BgmNode 는 같은 배너에 **18px 원형 `✕` 버튼**(`ERROR_DISMISS` — `w-9 h-9`, `rounded-[50%]`, 테두리·배경 없음, `opacity 0.7 → 1`, `transition: opacity 0.1s ease`, `font-size: var(--type-caption-12-size)` / `line-height: 18px`)을 붙여 사용자가 직접 닫을 수 있게 하고, ImageNode · VideoNode · EditNode 는 동일한 배너를 **닫기 버튼 없이** 렌더한다(상태가 바뀔 때만 사라진다).

관측 분포 2 : 3. 배너가 dismissible 인지 아닌지 결정 필요.

### 6.13–6.16 전사 과정에서 드러난 항목

**28개 라우트를 막던 페이지 레벨 사양**을 옮겨 적으면서 코드가 자기모순임이 확인된 것들이다.
스펙으로 적을 수 없어 여기로 뺐다.

### 앱 셸: `--app-gnb-main-card-padding-block-start` 는 죽은 토큰이다

`globals.css` 가 기본 `0px` 로 선언하고, 5개 셸(`appHomeSceneStyles.ts:915` · `NodeCanvasHomeScene.tsx:91` · `YoutubeAnalyticsScene.tsx:739` · `InstagramAnalyticsScene.tsx:274` · `app/admin/AdminClient.tsx:51`)이 전부 `20px` 로 세팅한다. 그런데 **`var(--app-gnb-main-card-padding-block-start)` 를 읽는 규칙이 코드베이스에 하나도 없다**(grep 결과 선언 1 · 세팅 5 · 소비 0). 게다가 선언부 주석은 "기본 0, **아카이브 씬만 8px** 로 덮어씀" 이라고 적혀 있어 주석·선언·세팅이 셋 다 다르다.

- **A안** — 카드 상단 안쪽 여백 20px 을 실제로 구현한다(소비처를 만든다).
- **B안** — 토큰과 5개 세팅을 지운다(현재 렌더가 정본).

### 앱 셸: 셸 높이 계산이 세 가지다

`AppHomeScene` · `NodeCanvasHomeScene` · `AdminClient` 는 `min-h-[100svh]` + `h-[var(--app-shell-vh,100dvh)]`(JS 가 `visualViewport.height` 를 주입, iOS Safari 보정)을 쓴다. `YoutubeAnalyticsScene`(:747) · `InstagramAnalyticsScene` 은 보정 없이 `h-[100dvh] max-h-[100dvh]`, `VideoEditScene`(:51,58)은 `min-h-[100dvh]`+`h-[100dvh]`, `myPageSceneStyles`(:553,559-560)도 `100dvh` 다.

관측: `--app-shell-vh` 보정 3 · 순수 `100dvh` 4. **svh / dvh / `--app-shell-vh` 중 무엇이 정본인지, iOS 보정을 전 셸에 적용할지 결정 필요.**

### 앱 셸: 카드를 거는 위치가 두 계열로 갈린다 (형태 A vs 형태 B)

형태 A 는 `<main>` 자체가 `appMainCardChrome`, 형태 B 는 별도 패널 div 가 `appMainCardChromeSurface` 이고 `<main>` 은 그 안의 스크롤러다. 시각 결과는 거의 같지만 세 가지가 다르다 — (a) A 는 하단 페이드만, B 는 상단+하단 페이드, (b) A 는 `margin-left`+`width` 를 전환, B 는 `margin-left` 만 전환(접힘 애니메이션이 미묘하게 다르다), (c) 카드 안쪽 패딩을 잡는 요소가 다르다.

관측: A 5씬(AppHome · NodeCanvasHome · Youtube/InstagramAnalytics · Admin) · B 7씬(MyPage 계열 · VideoEdit · Highlight · HighlightProject · Explore · Settings · Subscription). **새 페이지가 어느 쪽을 복제해야 하는지 정본 선언 필요.**

### 앱 셸: `--app-page-bg` 가 라이트에서 실제 페이지 색과 다르다

토큰은 네 스코프 모두 `var(--gray-900)` 인데, 모든 앱 셸 씬이 `html[data-theme=light] &` 로 `--palette-gray-200` 을 덮어쓴다(`appHomeSceneStyles:900` · `NodeCanvasHomeScene:107` · `VideoEditScene:65` · `myPageSceneStyles:564` · `YoutubeAnalyticsScene:736`).

- **A안** — 토큰 값을 고쳐 오버라이드를 전부 없앤다.
- **B안** — 오버라이드가 정본이고 토큰은 다크 전용으로 문서화한다.

관측: 오버라이드 5 · 토큰 그대로 사용 0.

### 앱 셸: `overscroll-behavior` 가 스크롤러마다 다르다

`none`(`appHomeSceneStyles:386` 아카이브 뷰포트 · `myPageSceneStyles:50` · `VideoEditScene:114`) vs `contain`(`highlightSceneStyles:1148` Highlight `<main>` · `VideoEditScene:122` embedded). **같은 셸 위치에서 값이 갈린다.** 관측: none 3 · contain 2.

### 앱 셸: 페이지 콘텐츠 max-width 정책이 없다

형태 A 카드도 형태 B 패널도 전부 `max-width: none` 이라 3440px 모니터에서 카드가 끝까지 늘어난다. 유일한 예외가 MyPage 설정 컨테이너로 `settingsSection` 이 붙으면 1200px, `subscriptionSettingsInner` 까지 겹치면 1400px 로 가운데 정렬한다.

**초광폭에서 본문을 제한할지, 제한한다면 1200 인지 1400 인지 결정 필요.**

### 앱 셸: 사이드바 fixed 래퍼의 `padding-bottom: 12px`

베이스 `gnb-wrapper` 의 `padding: 12px 24px` shorthand 잔재다 — 사이드바 변형(`Gnb.tsx:1966-1968`)이 top/left/right 만 덮고 bottom 은 놔둔다. **의도된 12px 인지, 덮는 것을 빠뜨린 것인지 확인 필요.**

### 앱 셸: `--app-gnb-sidebar-align-main-margin-top` · `--app-gnb-rail-below-chrome-gap` 이 셸에서 소비되지 않는다

두 토큰을 읽는 곳은 `mypage/upgrade|topup/*` 결과 페이지 7개의 `min-height` 계산과 Gnb `menuSidebarOuter` 의 `margin-top` 뿐이다. `globals.css:112-119` 주석이 규정하는 "본문 루트 padding-top = align-main-margin-top + rail-below-chrome-gap" 규칙은 **현재 코드에 존재하지 않는다** — 실제 씬 루트 padding-top 은 `var(--app-gnb-safe-top)` 단독이고, 상태 페이지의 `PAGE_SHELL` 과 `myPageSceneStyles.page` 도 둘 다 safe-top 만 쓴다(두 구현은 서로 일치한다).

- **A안** — 주석대로 구현을 되돌린다.
- **B안** — 주석을 지우고 safe-top 단독을 정본으로 문서화한다.

### 결과 화면: 메인 카드 크롬 — SSOT 클래스 vs 손으로 복사한 값

`/subscription` · `/settings` 는 전역 `.appMainCardChromeSurface` 를 조합하는데, 결제 결과 7개 페이지는 같은 기본값을 인라인해 두고 SSOT 가 규정하는 두 가지를 빠뜨린다 — (a) `::after` 글래스 베벨 오버레이가 없고, (b) `@media (max-width: 719px)` 리셋이 없어 **모바일에서 혼자 `border-radius: 16px` + `box-shadow: var(--glass-dropdown-frame)` 를 유지**한다(다른 앱 카드는 전부 곡률 0 · 그림자 없음 · `overflow: visible`).

- **A안** — 결과 페이지가 `.appMainCardChromeSurface` 를 채택한다.
- **B안** — SSOT 의 모바일 동작이 틀린 것으로 보고 리셋을 재검토한다.

근거: `app/mypage/topup/success/page.tsx:51-62` vs `globals.css:1389-1419`, `:1485-1498`.

### 결과 화면: SECONDARY 버튼이 라이트 테마에서 무너진다

면이 `rgb(var(--palette-gray-000-rgb) / 8%)` — **고정** near-white 인데 글자는 시맨틱 `text-gray-000!` 이고, 바로 옆 PRIMARY 는 시맨틱 `--gray-000-rgb` 를 쓴다. 다크에서는 `--palette-gray-800` 위 흰색 8% 라 맞지만, 라이트에서는 `--palette-gray-100` 위 흰색 8% — 검정 글자 뒤에 사실상 보이지 않는 면이 된다.

**PRIMARY 처럼 시맨틱으로 갈지, 의도된 고정 화이트 처리인지 결정 필요.** (`app/mypage/upgrade/fail/page.tsx:123-129` vs `:115-121`)

### 결과 화면: billing-success 가 하드 오류에서 같은 문자열을 두 번 보여준다

`error` 가 있으면 `description = error` 가 되어 설명 문단에 한 번, `STATUS_ALERT_ERROR` 박스에 다시 한 번 같은 문자열이 나온다. **의도된 중복인지, 설명은 `upgradePartialError.description` 으로 폴백해야 하는지 결정 필요.** (`billing-success/page.tsx:397-403`, `:432-434`)

### 결과 화면: 하드 실패인데 "결제는 완료됨" 타이틀이 나온다

`billing-success` 와 `billing-change-success` 는 **결제 전에 던져진 오류**(예: `MISSING_BILLING_PARAMS`)에서도 `upgradePartialError.title`("결제는 확인됐지만 플랜 반영이 지연됨")을 그대로 쓴다. 결제가 일어나지 않았는데 결제 성공을 단언하는 카피다.

**하드 실패 전용 타이틀 키가 필요하다.** (`billing-success:391-395` + `:284-291` · `billing-change-success:281-284` + `:206-210`)

### 결과 화면: topup/success 가 토스트 문자열을 `h1` 으로 쓴다

`profile.toast.creditsCharged(n)`("10,000 크레딧이 충전되었습니다.")을 heading-36/500 페이지 제목으로 렌더한다. 다른 성공 라우트는 전부 전용 title 키를 쓴다.

- **A안** — `topupSuccess.title` 을 추가한다.
- **B안** — 토스트-as-헤딩 패턴을 인정하고 문서화한다.

### 결과 화면: 실패 4종이 서로 다른 본문 키와 행 수를 쓴다

`upgrade/fail` · `billing-fail` 은 `upgradeFail.description`(두 줄 `\n` 카피), `topup/fail` · `billing-change-fail` 은 `upgradeFail.defaultMessage`("결제 요청 실패")를 본문으로 쓴다. `dl` 행 수는 3(code/message/orderId) / 2(code/message) / 1(code) / 1(code) 이고, `?message` 와 `?orderId` 를 읽는 것은 `upgrade/fail` 뿐이다.

**하나의 템플릿인가 네 개인가.** 관측: description 2 · defaultMessage 2.

### 결과 화면: 액션 행 순서가 성공/실패에서 뒤집힌다

`upgrade/fail` · `billing-fail` 은 PRIMARY(`backToPlans`) → SECONDARY(`goToArchive`), `billing-success` 는 SECONDARY(`backToPlans`) → PRIMARY(`goToArchive`/`tryAgain`). 버튼이 `w-full` 로 세로로 쌓이므로 **어느 버튼이 위에 오는지가 뒤바뀐다.**

### 결과 화면: `dt` 라벨 3개가 i18n 을 우회하고, 원시 API 값이 노출된다

`"Pack"`(topup/success:343) · `"Card"`(billing-success:493) · `"Status"`(billing-change-success:298)가 세 로케일 모두에서 영어 리터럴로 나간다. `billing-change-success` 는 추가로 API 의 `paymentMethod.status` 원시값(예: `"active"`)을 그대로 사용자용 `dd` 에 찍는다(:299).

**i18n 키와 표시값 매핑이 필요하다.** (`/subscription`·`/settings` 의 `useDocumentTitle("구독")`/`useDocumentTitle("설정")` 한국어 하드코딩도 같은 성격이다.)

### 결과 화면: `subscription.upgradeFail.eyebrow` 가 번역돼 있는데 아무도 안 쓴다

세 로케일에 모두 정의·번역돼 있으나(`en.ts:3936` · `ko.ts:3893` · `ja-overrides-surface.ts:946`) `app/`·`components/` 전체에서 `.eyebrow` 사용 0건이다.

- **A안** — 타이틀 위 eyebrow 를 도입한다(성공/실패 색 큐를 붙이기에도 자연스러운 자리다).
- **B안** — 키를 지운다.

### 결과 화면: `STATUS_MAIN` 의 `min-height` 계산이 카드 아래 약 52px 을 남긴다

`min-height: calc(100dvh − align-main-margin-top − rail-below-chrome-gap − rail-padding-bottom)` = `100dvh − (safe-top + 40) − 12 − 12` 인데, 카드의 실제 top 은 `safe-top`(`PAGE_SHELL` 의 `pt`, 카드 `mt-0`)이다. 결과적으로 카드 아래에 페이지 배경이 약 52px 남는다. 씬 패널은 다른 방식으로 높이를 잡는다(`page` 가 `height: 100dvh`, 패널이 `flex: 1 1 auto`).

**의도된 여백인지, 결과 페이지도 flex-fill 로 바꿀지 결정 필요.**

### 결과 화면: 7벌 복붙을 유지할 것인가

오늘은 값이 동일하지만 **그것을 유지시키는 장치가 없다** — 공유 모듈도, 테스트도, lint 규칙도 없다. 이 템플릿을 DESIGN_SYSTEM.md 에 하나의 스펙으로 올린다면, 먼저 공용 `PaymentStatusPage` 컴포넌트를 뽑을지 결정해야 한다. 그러지 않으면 문서는 일곱 파일이 언제든 갈라질 수 있는 스펙 하나를 기술하게 된다.

### Auth: 필드 텍스트 weight 가 화면마다 다르다

`/login` · `/recover` 는 `<input>` 에 `type-body-16-regular`, `/signup` · `/reset-password` · `/reset-password/new` 는 `type-body-16-medium` 을 준다. 부동 라벨은 어디서나 `--type-weight-medium`(500)이므로 **`/login` 에서는 라벨이 값보다 굵고 `/signup` 에서는 같다.**

관측: regular 2 · medium 3.

### Auth: 비밀번호 토글 위치가 화면마다 다르다

`/login` · `/recover` — `top: 50%` + `translateY(-50%)`(진짜 세로 중앙), `right: 32px`, 옆에 지우기 버튼 `right: 8px`, 입력 `padding-right: 68px`. `/signup` · `/reset-password/new` — `top: 50%` + `translateY(-20%)`(의도적으로 아래로, 코드에 근거 없음), `right: 12px`, 지우기 없음, 입력 `padding-right: 40px`.

**같은 컨트롤에 세 벌의 숫자가 있다.** 관측: 중앙 정렬 2 · `-20%` 2.

### Auth: 지우기(×) 버튼이 일부 화면에만 있다

`/login` · `/recover` 에는 이메일·비밀번호 모두에 있고, `/signup` · `/reset-password/new` 에는 비밀번호 필드에도 없다(눈 아이콘만). **지우기가 필드의 일부인지 로그인 전용 어포던스인지 결정 필요.**

### Auth: `/recover` 필드에 라이트 테마 오버라이드가 없다

다른 인증 필드가 라이트에서 `var(--gray-900)` 면으로 바뀌는 것과 달리 `/recover` 는 `bg-[rgb(var(--gray-000-rgb)/6%)]` 를 그대로 둔다 — 라이트에서 검정 6% 가 되어 **밝은 페이지 위에 회색 틴트 필드**가 된다.

관측: 오버라이드 있음 4화면 · 없음 1화면(`/recover`).

### Auth: `/recover` 제출 버튼이 알약이다 — §6.8 과 어긋난다

`/recover` 는 `rounded-[999px]`, `/login` · `/signup` · `/reset-password/new` 와 AuthStatusCard 버튼은 전부 `rounded-12` 다. **6.8절**은 이미 "모두 border-radius: 12px 로 통일. 과거 pill(999px) 사용 패턴 제거" 라고 단언하고 있으므로 **문서와 코드가 정면으로 어긋난다.** 관측: 12px 4 · 999px 1.

### Auth: 제출 버튼 높이 계약이 두 가지다

로컬 제출 버튼은 `h-24`(48px 고정), AuthStatusCard 의 primary/secondary 는 `min-h-24`(48px 최소, 늘어남) + `px-9`(18px) + 다른 전환 목록(`… 180ms ease-in-out`, background-color/border-color 포함 vs `… 180ms ease`)이다.

### Auth: 제출 호버/누름 필터 레시피가 두 가지다

로컬 제출 버튼 `saturate(125%) brightness(125%)` / `scale(0.98)`, AuthStatusCard primary `saturate(118%) brightness(110%)` / `scale(0.99)`. **같은 시각 역할에 두 벌의 숫자.**

### Auth: 제출 로딩이 두 번 구현돼 있다

`/login` 은 자체 스피너를 손으로 만든다(`loginButtonSpin`, 220ms `cubic-bezier(0.22,1,0.36,1)`, 단일 border 원에 `border-top: var(--gray-1000)`, 말줄임표 제거 없음). 나머지 화면은 공용 `<InlineLoadingLabel>`(`inlineLoadingSpin`, 200ms, 의사요소 2겹 링, 말줄임표 제거)을 쓴다. **키프레임 2개 · duration 2개 · 스피너 구조 2개.**

### Auth: 폼 gap 이 두 값이다

`gap-7`(14px) — `/login` · `/signup` · `/reset-password/new` · `/recover`. `gap-6`(12px) — `/reset-password`. 관측: 14px 4 · 12px 1.

### Auth: 오류가 폼 단위라 필드에 붙지 않는다

오류는 어디서나 폼 레벨 `<p>` 하나이고 **필드 박스에는 오류 상태 자체가 없다**(박스 상태는 기본·포커스 둘뿐). "비밀번호 불일치" 같은 필드 특정 오류도 해당 필드에 시각적으로 붙지 않고 테두리도 붉어지지 않는다. **필드 오류 상태를 만들지 여부가 문서화 이전의 결정이다.**

### Auth: 포커스 링 — 기존 "포커스 링" 항목에 대한 보고(결정이 아니라 사실 보강)

인증 필드는 `outline` 을 전혀 쓰지 않는다. 대신 **테두리 색 변화 + 같은 색 `inset 0 0 0 1px` 그림자**로 2px 헤어라인을 만들며, 이는 레이어 밖 `outline: none` 리셋이 지울 수 없다. `/signup` 동의 체크박스는 `:focus-visible` 에서 진짜 2px 외곽 헤일로(`0 0 0 2px rgb(var(--gray-000-rgb)/18%)`)를 렌더한다.

즉 **인증 화면에는 이미 토큰화되지 않은 포커스 어휘가 두 벌 존재하고, 그중 하나는 이 절이 "없다"고 적은 키보드 포커스 요구를 이미 만족한다.** 포커스 링 결정은 "없는 것을 새로 만든다"가 아니라 **이 둘을 정리하는 것**부터 시작해야 한다.

### 페이지 피드백: 토스트 표면이 두 계열로 병존한다 (기존 "토스트 · 시머 · 폼 컨트롤" 항목의 구체화)

**글래스** — 곡률 16px · 패딩 12/20px · 반투명 70% 판(테마와 반대로 반전) · 글래스 베벨 그림자 · backdrop blur · z 1300 — 6곳(AppHome · NodeCanvasHome · Create · VideoEdit · EditorProjectWorkspace · Highlight). **솔리드 알약** — 곡률 999px · 패딩 12/24px · 불투명 시맨틱 `--gray-900` · 1px `gray-000/10%` 테두리 · blur·베벨 없음 · z 2000 — 2곳(Subscription · Settings, 둘 다 `myPageSceneStyles` 경유).

관측: 글래스 6 · 솔리드 2. 글래스가 채택 폭도 넓고 툴팁 반전 규칙과도 맞지만, 이건 전사가 아니라 **디자인 결정**이다.

### 페이지 피드백: 토스트 z-index 가 세 값이다

1300(글래스) · 2000(솔리드 알약) · 1400(EditorProjectWorkspace 오류 토스트). 모달 오버레이는 1200 이다. 페이지 레벨 오버레이의 z 스케일이 문서화돼 있지 않으므로, 하나를 정하고 **토스트가 모달·드롭다운·노드 캔버스 크롬에 대해 어디 서는지** 명시해야 한다(위 "z-index 계층" 항목과 함께 정리).

### 페이지 피드백: 토스트 유지 시간이 세 값이다

3000ms(AppHome · NodeCanvasHome · VideoEdit · Highlight, 4곳) · 2400ms(Subscription · Settings, 2곳) · 3200ms(EditorProjectWorkspace, 1곳). 퇴장은 어디서나 280ms 로 일관된다. **유지 시간 하나를 정한다.**

### 페이지 피드백: 토스트 backdrop blur 가 두 값이다

클래스는 `blur(10px)` 인데 두 곳이 인라인 `blur(16px) saturate(130%)`(`floatingCtaBlurStyle`)로 덮어써 인라인이 이긴다. CreateScene 은 인라인으로 `blur(10px)` 를 넣는다. **같은 시각 컴포넌트가 10px 과 16px+saturate 두 벌로 출시돼 있다.**

### 페이지 피드백: 스켈레톤 레시피가 세 가지다

**A. background-position 스윕** — `dashboardSkeletonPulse 1.6s cubic-bezier(0.4,0,0.2,1)`, 90deg lo/hi/lo 그라디언트, 200% 폭, 곡률 8px — **7파일, 가장 넓다.** **B. 이동하는 `::after` 하이라이트** — `analyticsSkeletonShimmer 1.6s cubic-bezier(0.4,0,0.2,1)`, 110deg 밴드를 −100% → 100% 로 이동, 알약 곡률, **A 에는 없는 라이트 테마 분기(lo 3% / hi 7%) 있음** — 2파일. **C. myPage** — `myPageSkeletonShimmer 1.3s ease-in-out`, 90deg 0/9%/0 밴드, 베이스 `gray-000/8%`, 알약 곡률 — 1파일.

정본을 고르고, **시머 스톱에 라이트 분기가 필요한지도 함께 정한다**(A 와 B 의 판단이 다르다).

### 페이지 피드백: 스켈레톤 이징이 두 가지다

`dashboardSkeletonPulse` 가 6곳에서는 `cubic-bezier(0.4,0,0.2,1)`, 2곳(채널 아바타 스켈레톤)에서는 CSS `ease-in-out` 으로 쓰인다. **서로 다른 커브다.**

### 페이지 피드백: 페이지 빈 상태 레이아웃이 네 가지다

**A** 제목 + 본문(+ 선택 CTA), 간격 12px, 패딩 80px 0 — 아카이브·노드캔버스 허브. **B** 문단 하나 + primary CTA, 간격 16px, 패딩 64px 0, 색 `--palette-gray-500` — `VideoEditScene:187-190`. **C** 가운데 문단 하나, 패딩 80px 0, `--text-soft`, max-width 1120px — `app/templates/page.tsx:68-73`. **D** 테두리 패널(제목 + 메시지) — `AnalyticsStatePanel`.

**D 를 '섹션 빈 상태'라는 별도 컴포넌트로 둘지, A 가 흡수할지 결정 필요.**

### 페이지 피드백: 빈 상태 CTA 가 필수인가

NodeCanvasHomeScene · VideoEditScene 에는 있고 AppHomeScene · `app/templates` 에는 없다. **필수인지 화면별 선택인지 정한다.** 관측: CTA 있음 2 · 없음 2.

### 페이지 피드백: `tone="error"` 가 아무것도 하지 않는다

`AnalyticsStatePanel` 은 `tone="error"` 를 받지만 오류 분기가 빈 문자열로 해석된다(`analytics/shared.tsx:130-132`). 소스 주석 자체가 원래의 오류 배경/테두리가 특이도 싸움에서 져 "죽은 선언" 이라고 적고 있다. **API 가 약속한 시각 구분이 렌더되지 않는다.**

- **A안** — 오류에 실제 처리를 준다.
- **B안** — prop 을 제거한다.

### 페이지 피드백: 감소 모션 대응이 일관되지 않다

시머 단어와 에디터 오류 토스트만 애니메이션을 끄고, 대시보드 스켈레톤·글래스/솔리드 토스트·스켈레톤 차트 페이드는 대응이 없다. **페이지 피드백에 감소 모션 대응을 요구할지 정하고, 정했다면 일괄 적용한다.**

### 페이지 피드백: 토스트에 라이브 리전이 없다

어떤 토스트에도 `role="status"`/`aria-live` 가 없어 성공·실패 메시지가 스크린 리더에 전달되지 않는다. 리스트 로딩 시머 단어는 이미 `aria-live="polite"` + `role="status"` 로 패턴을 보여주고 있다. **스펙이 토스트에 라이브 리전을 요구할지 결정 필요.**

## 10) 페이지 사양 (라우트별)

§6 이 **부품**을 다룬다면 여기는 **화면**을 다룬다. 분량이 커서 절마다 파일이 따로 있다.

> **Observed audit.** 아래 파일은 현재 구현을 관측한 증거이며 신규 화면의 규범이 아니다. 라우트별
> 현재 문서화 수준은 §1.5의 자동 생성 표를 따른다. 과거 검증 라운드의 판정과 수치는 현재 상태로
> 간주하지 않는다. `전체(3)`도 모든 서술의 정확성이나 접근성 완결성을 보증하지 않는다.

| 보장됨 (기계 검사) | 보장 안 됨 |
| --- | --- |
| 인용한 식별자가 코드에 실재하는지 (`check-doc-identifiers`) | 화면 구조와 상태가 빠짐없이 기록됐는지 |
| 인용한 `file:line` 근거가 실재하는지 | 서술의 의미와 사용자 경험이 올바른지 |
| 토큰 옆 색 주석이 실제 해결값과 일치하는지 (`check-doc-colors`) | i18n 문구와 접근성 계약의 완결성 |
| 문서의 Tailwind px 환산이 맞는지 | 브라우저에서의 시각·상호작용 회귀 |

각 파일 끝의 `<!-- 재구현 검증 미충족 -->`, `<!-- 미확인 -->`, `<!-- 결정 필요 -->` 블록은
현재 구현을 규범으로 승격하기 전에 해소해야 할 감사 항목이다. 아래 통계는 그 파일들에서 생성한다.

> **색 값은 사람이 쓰면 계통적으로 틀린다.** 회색 램프에 `--palette-gray-150` 이 끼어 있어
> 단계 세기가 어긋나고, 실제로 초안 두 세대 모두에서 **한 단계 밝은 값**이 32건·34건 나왔다
> (`--palette-gray-500` 옆에 `--palette-gray-400` 의 `#bcc0c9`). `check-doc-colors` 가 방어선이다.
> **색을 손으로 적었으면 반드시 이 게이트를 돌릴 것.**

<!-- GENERATED:route-audit-summary START -->
| 절 | 화면 | 라우트 | 파일 | 미충족 | 미확인 | 결정필요 |
| --- | --- | --- | --- | --- | --- | --- |
| §10.1 | 홈·아카이브 | 1개 | [`design/pages/10.1.md`](product-screens/10.1.md) (1,386줄) | 0 | 12 | 4 |
| §10.2 | 랜딩·마케팅 | 3개 | [`design/pages/10.2.md`](product-screens/10.2.md) (1,771줄) | 0 | 18 | 7 |
| §10.3 | 템플릿 | 2개 | [`design/pages/10.3.md`](product-screens/10.3.md) (1,089줄) | 0 | 12 | 8 |
| §10.4 | 블로그·문서 | 6개 | [`design/pages/10.4.md`](product-screens/10.4.md) (1,456줄) | 0 | 12 | 7 |
| §10.5 | 법적고지·문의 | 4개 | [`design/pages/10.5.md`](product-screens/10.5.md) (1,952줄) | 0 | 18 | 9 |
| §10.6 | 인증 | 9개 | [`design/pages/10.6.md`](product-screens/10.6.md) (1,069줄) | 0 | 10 | 8 |
| §10.7 | 계정·설정 | 3개 | [`design/pages/10.7.md`](product-screens/10.7.md) (1,657줄) | 0 | 19 | 9 |
| §10.8 | 결제·충전 | 9개 | [`design/pages/10.8.md`](product-screens/10.8.md) (1,321줄) | 0 | 12 | 4 |
| §10.9 | 노드 캔버스 | 1개 | [`design/pages/10.9.md`](product-screens/10.9.md) (3,629줄) | 0 | 27 | 21 |
| §10.10 | 비디오 에디터 | 2개 | [`design/pages/10.10.md`](product-screens/10.10.md) (3,033줄) | 0 | 17 | 23 |
| §10.11 | 하이라이트 | 3개 | [`design/pages/10.11.md`](product-screens/10.11.md) (2,286줄) | 0 | 15 | 13 |
| §10.12 | 애널리틱스·어드민 | 3개 | [`design/pages/10.12.md`](product-screens/10.12.md) (1,873줄) | 0 | 18 | 21 |

합계 **22,522줄** · 46개 라우트 · 미충족 0건 · 미확인 190건 · 결정필요 134건.
<!-- GENERATED:route-audit-summary END -->

## 8) 작업 체크리스트

- 새 UI 만들 때:
  - 컬러는 CSS 변수만 사용 (`--gray-*`, `--primary-*`, `--accent-*`)
  - 타이포는 `type-*` 유틸 클래스 또는 동일 토큰값 사용
  - 간격·크기는 **px**로 직접 기입 (과거 rem과 동일 시각이면 `×10` 규칙 참고)
  - glass 이너 섀도우는 **6.1절**의 `var(--glass-bevel-highlight)` + `var(--glass-bevel-shade)` + `rgb(var(--glass-inner-shadow-rgb) / …%)` 조합만 사용
  - 드롭다운·메뉴 패널은 **6.5절** (`.menuSurface` / `.motion`)을 우선 재사용
  - 버튼은 [`design/components/button.md`](../design/components/button.md)와 공용 `Button`을 먼저
    확인하고, 화면 고유 예외를 조사할 때만 **6.7절** 구현 인벤토리를 사용
- 변경 후:
  - `pnpm --filter <app> check-types`
  - `pnpm --filter <app> lint`

## 9) 업데이트 원칙

**이 문서의 표는 손으로 고치지 않는다.** `<!-- GENERATED:<id> -->` 마커 사이는 코드·manifest·감사
문서에서 각 생성기가 만들고, CI가 어긋남을 막는다. 마커 밖 산문만 사람이 쓴다.

토큰 값이 바뀌면:

1. `globals.css` 를 고친다 (원천)
2. `pnpm check-design-system --write` · `pnpm --filter web build-design-tokens` ·
   `pnpm --filter web build-llms-docs` 로 산출물을 다시 만든다
3. 컴포넌트 영향 범위를 점검한다 (양 테마 확인)

산출물과 게이트:

| 산출물 | 무엇 | 게이트 |
| --- | --- | --- |
| `DESIGN_SYSTEM.md` 생성 구간 | 사람이 읽는 참조 문서 | `pnpm check-design-system` |
| 문서가 인용한 식별자 | 클래스·상수·CSS 변수가 코드에 실재하는지 | `pnpm check-doc-identifiers` |
| `design/tokens.yaml` | CSS에서 생성한 구현 토큰 export (Figma 대조용) | `pnpm check-design-tokens` |
| `design/llms/*.txt` | AI 에이전트용 문서 | `pnpm check-llms-docs` |

`build-design-tokens --figma <dump.json>` 은 Figma 변수 덤프와 코드를 3자 대조한다 —
Figma 의 primary 램프가 Tailwind 기본 블루로 남아 있던 것을 이 경로로 잡았다.

**손으로 적은 값은 반드시 썩는다.** 이 문서에서 실제로 확인된 사례:
`--primary-500` 이 `#3B82F6` 로 적혀 있었지만 코드는 `#0088ff` 였고, §6.6 의 헥스 네 개
(`#3a4049` · `#f7f7f9` · `#5a606b` · `#ffffff`)가 전부 팔레트와 어긋나 있었다. 새 표를 추가할
때는 먼저 "생성할 수 있는가"를 묻는다.

---

운영 카탈로그와 문서 상태는 [`design/README.md`](../design/README.md)에서 관리한다.
