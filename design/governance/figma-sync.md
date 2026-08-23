---
id: governance-figma-sync
status: experimental
authority: normative
---

# Figma Sync Governance

Figma와 코드는 서로를 자동으로 덮어쓰는 두 정본이 아니다. 승인된 design decision을 중심으로
token과 component parity를 검토하며, 자동 sync가 구현되기 전까지 상태를 과장하지 않는다.

## 운영 파일

Figma에는 역할이 다른 **파일 셋**이 있다. 섞지 않는다. **쓰기 전에 이 표를 확인한다.**

| 역할 | File key | 소유 | 쓰기 |
| --- | --- | --- | --- |
| 디자인 시스템 라이브러리 (정본 projection) | `bxGEp0km5zluMJGulaTvFW` — "Klipse Design System — Library" | 이 저장소 | 허용. `verify-figma-parity` · `readback.json` · `snapshot.json` 이 이 파일을 가리킨다 |
| 제품 화면 이식 보드 | `OlYKERKOkgbxBEEoXGZW2c` | 이 저장소 | 허용. **게이트 밖이다.** 조립 규칙은 [figma-screen-assembly](figma-screen-assembly.md), 실행 절차는 `.claude/skills/klipse-figma-transplant/SKILL.md` |
| 제품 미러 reference | `CNORJOONt4z0a4Bl22Kjuu` — "Klipse 3.0" | 제품/디자인 작업자 | **금지.** 읽기 전용 evidence ([KP-FIGMA-001](../../migration/product-baseline.md)) |

**두 쓰기 대상은 collection 이름 체계가 다르다** — 아래 「이전은 끝나지 않았다」 절 참조.
DS 변수·style·component 를 쓸 곳은 라이브러리이고, 제품 화면을 조립할 곳은 이식 보드다.

**이전은 끝나지 않았고, 두 파일은 지금 서로 다른 것이 됐다(2026-08-22 실측).**

2026-08-21에 새 파일 `OlYKERKOkgbxBEEoXGZW2c`를 `SEJUNKI` 팀에 만들고 변수 258개와 style
23개를 옮겼다. 그 뒤 그 파일에서 **제품 화면 이식**이 진행되면서 파일의 성격이 갈렸다.
두 파일을 Figma에서 직접 세면 이렇다.

| | `bxGEp0km5zluMJGulaTvFW` (정본 라이브러리) | `OlYKERKOkgbxBEEoXGZW2c` (제품 화면 이식 보드) |
| --- | --- | --- |
| 페이지 | Cover · Foundations · Components · Patterns · Templates · Product inventory (6) | 여정 순 8페이지 (00 START HERE ~ 99 보류) |
| collection | `Klipse Primitive` · `Klipse Semantic` · `Klipse Semantic Color`(2모드) | `1 · Palette`(2모드) · `2 · Semantic`(4모드) · `3 · Scale` |
| 변수 | 345 | 299 |
| text style · effect style | 15 · 8 | 46 · 4 |

**collection 이름 체계가 서로 다르다.** 한쪽에서 다른 쪽으로 그냥 옮길 수 없고, 옮기려면
매핑을 먼저 결정해야 한다.

`readback.json`·`snapshot.json`과 `verify-figma-parity`는 **정본 라이브러리
`bxGEp0km5zluMJGulaTvFW`를 가리킨다.** DS 변수·style·component를 쓸 곳은 그 파일이다.
제품 화면 조립은 `OlYKERKOkgbxBEEoXGZW2c`에서 하고, 그 규약은
[figma-screen-assembly](figma-screen-assembly.md)와 `klipse-figma-transplant` 스킬이 소유한다.
**둘을 섞지 마라 — 어느 파일에 쓰는지 먼저 확인한다.**

라이브러리 파일은 2026-08-14에 `SEJUNKI` 팀(pro tier, Full seat) drafts에 생성됐다. 파일 분리는
publish 이후에만 검토한다 — publish 전에는 파일 간 변수·component 소비가 불가능하므로 단일 파일
3-페이지 구조를 유지한다.

### 실측된 capability (2026-08-14, 라이브러리 파일)

- variable collection 생성과 두 번째 mode 추가: 가능
- collection당 mode 상한: **10개** (Professional tier 값과 일치)
- `Pretendard` 폰트 사용 가능 (Inter, Noto Sans KR/JP도 있음)
- 요금제나 API가 바뀌면 이 절을 재실측해 갱신한다.

### 쓰기 정책

1. 위 표에서 쓰기가 허용된 파일에만 쓴다. 다른 파일에 대한 쓰기는 사용자가 명시적으로 대상을
   지정하기 전까지 `blocked`다.
2. 자동화 경로는 Figma MCP(Plugin API)뿐이다. Variables REST API는 Enterprise 전용이라 쓰지 않는다.
3. **library publish는 어떤 방법으로도 자동화하지 않는다.** publish API가 존재하지 않으며 항상
   사람이 Figma UI에서 수행한다. publish 여부를 추측해 상태를 올리지 않는다.
4. 쓰기 스크립트는 idempotent해야 하고, 실행 전후 상태를 대조해 무엇이 바뀌었는지 보고한다.
   **변수 적용은 `figma/apply-variables.*.js`가 유일한 경로이며 번호순으로 전부 실행한다** — `scripts/build-figma-variables.mjs`가
   token proposal에서 생성하며 `verify-figma-variables`가 드리프트를 잡는다. 그 파일 내용을
   `use_figma`에 그대로 넘기고 손대지 않는다. 즉석 코드를 쓰지 않는 이유는 `inventory-draw.*.js`와
   같다 — 쓰는 코드가 대화에만 있으면 무엇을 적용했는지가 남지 않는다.
   생성 시점에 현재 라이브러리 스냅샷과 **변수 258개·값 318건을 전수 대조해 불일치 0**을 확인했다.
   style도 같다 — `figma/apply-styles.js`는 `scripts/build-figma-styles.mjs`가 만들고
   `verify-figma-styles`가 지키며, **값 140건을 전수 대조해 불일치 0**을 확인한 뒤 적용했다.

   **effect style에는 모드가 없다.** DTCG shadow는 테마별로 값이 갈리는데 Figma effect style은
   단일 값이라 **Light를 명시적으로 고른다.** 고르지 않고 첫 모드를 쓰면 Dark가 잡혀
   `elevation/menu`의 헤어라인이 어두운 값으로 들어간다 — 라이트 화면에 검은 테두리가 생긴다.
   다크 그림자는 Figma가 표현하지 못한다.
5. Figma 쪽 수동 편집과 충돌하면 덮어쓰지 않고 diff를 보고한다.
6. **되읽기는 페이지를 명시적으로 전환한 뒤 수행한다.** `figma.currentPage`는 매 호출 첫 페이지로
   초기화되므로, `await figma.setCurrentPageAsync(page)` 없이 세면 component가 조용히 0개로 나온다.
   실제로 겪은 사고이며, 덤프가 "없음"과 "안 봄"을 구분하지 못하는 형태다.
7. 아이콘 되읽기는 `icon/` 접두사 component마다 frame 크기·vector 수·stroke 두께·cap·paint
   바인딩 수를 담는다. **좌표는 담지 않는다** — Figma vector 왕복 손실을 아직 실측하지 않았기
   때문이며, 대신 요소 분해 보존(코드 `elementCount` ↔ Figma `vectors`)을 대조한다. 도형이
   병합되거나 사라지는 사고는 좌표를 보지 않아도 이것으로 드러난다.

## Figma로 그대로 옮길 수 없는 것

**근사치를 지어내지 않는다.** 아래는 CSS에서만 성립한다. 재현하지 말고 `재현 불가`로 표시한 뒤
코드를 원천으로 두고, 무엇을 포기하고 무엇으로 대체할지는 이 문서가 정해질 때까지 비워 둔다.
숫자는 배포본 `KlipseAI/klipse-web` 기준이다.

| 항목 | 규모 | 왜 안 되나 |
| --- | --- | --- |
| `backdrop-filter` (뒤 배경 블러) | **65개 파일** | 뒤에 실제로 무엇이 있느냐에 따라 결과가 달라진다. 단색 채우기로 대체하면 다른 화면이 된다 |
| 그라디언트 마스크 | **23개 파일** | 블러·이펙트에 알파 그라디언트를 씌우는 형태다. 레이어 마스크로는 강도가 점진적으로 변하는 구간이 재현되지 않는다 |
| 테마를 따라가지 않는 그림자 | `--dropdown-ambient-shadow` | `:root`에만 정의되고 다크 재정의가 없다 — **다크에서도 같은 값이다**(`globals.css:63`). 다크용 변형을 새로 만들면 코드와 갈린다. 이름이 비슷한 `--dropdown-frame`도 정의가 둘이지만 **두 값이 바이트 동일**이라 결국 테마 무관이다 |
| `@layer` 밖 규칙의 우선순위 | — | 명시도와 무관하게 유틸리티를 이긴다. 옮길 때 `!`가 필요한 자리는 스타일 결정이 아니라 이 우선순위 때문이며, Figma에 대응 개념이 없다 |

사용처 표본 — `backdrop-filter`: `app/admin/AdminClient.tsx` · `app/admin/BannerManagement.tsx` ·
`app/admin/JobMonitor.tsx`. 마스크: `app/HomePageClient.tsx` ·
`components/banners/TabBannerCarousel.tsx` · `app/mypage/upgrade/page.tsx`.

막힌 자리는 근사치로 메우지 말고 기록한다 — 무엇이 없어서 raw로 그렸는지는
[figma-gap-registry](../../migration/figma-gap-registry.md)가 소유한다.

제품 값을 읽어 Figma에 옮길 때의 함정은
[제품을 읽을 때 틀리는 자리](../foundations/product-reading-traps.md)가 소유한다. **그리기 전에 읽는다.**

## 현재 상태

- published Klipse Design library: `not-ready`
- library 파일: collection 3개(`Klipse Primitive` · `Klipse Semantic` · `Klipse Semantic Color`).
  **수는 이 문서가 갖지 않는다** — `pnpm verify-figma-parity` 출력과 `figma/snapshot.json` 이 낸다.
  publish하지 않음
- P2 token/Figma proposal pipeline: local `release-candidate`
- generated proposal: `packages/tokens/generated/figma.tokens.json` — `done`, not published
- variable/style parity checker: `done` — `scripts/verify-figma-parity.mjs`가 `pnpm verify`에
  연결됨. 변수·style·component·icon 을 전수 대조하고 **변조 canary** 를 매 실행에서 자체
  검증한다. 각 수는 그 게이트의 출력 한 줄이 낸다
- snapshot export: `done` — `figma/readback.json`(Plugin API 되읽기 원본)과 `figma/snapshot.json`
  (parity 입력)으로 나뉘며 `scripts/build-figma-snapshot.mjs`가 후자를 생성한다. snapshot을 손으로
  쓰지 않는다는 규칙이 성립하려면 **손으로 쓰지 않는 경로가 실제로 존재해야 한다**
- icon component: `partial` — `icon/{kebab}`, 24×24 frame 하나, 크기 variant 없음. stroke와
  fill을 전부 `color/foreground-primary`에 바인딩해 raw 값 0을 만족한다. publish 전
- text/effect style: `done` — `typography/*` 15종, `elevation/*` 4종 (semantic tier 이름)
- **파일 구조(2026-08-18): Cover → Foundations → Components → Templates.** Foundations는 그 전까지
  **최상위 노드가 0개**였다 — 변수 210개와 style 22개가 파일에 있는데 **보이는 것이 하나도
  없었다.** 색(semantic 41 × Light·Dark 두 열, `setExplicitVariableModeForCollection`으로 한 화면),
  타이포(text style), 간격·반경(막대 길이와 모서리가 변수 값 그대로), 그림자(effect style)를
  세웠고 **전부 변수·style 바인딩이라 값이 바뀌면 문서가 따라온다.**
- **게이트가 검사하는 것만 잘돼 있었다.** parity는 raw 값 0·변수 바인딩·기하를 34종 canary로
  지키지만 "사람이 열었을 때 쓸 수 있는가"는 아무도 검사하지 않는다. 그 부분만 비어 있었다.
- **Components 페이지 정리(2026-08-18): 세트마다 이름과 목적문이 캔버스에 보인다.** 그 전에는
  세트를 클릭해야만 설명이 보였고, 새로 만든 6개(TextField · SegmentedControl · Checkbox · Slider ·
  SelectableListRow · Avatar)는 **아예 섹션 밖에 흩어져 있었다.** Forms 섹션을 만들어 입력 계열을
  모으고, 나머지 둘은 Content로 넣었다. 섹션 순서는 Actions → Forms → Content → Overlays →
  Feedback → Shell → Icons이며 **읽는 순서**를 따른다 — 누르는 것, 값을 넣는 것, 내용, 위에 뜨는
  것, 알리는 것, 껍데기, 글리프
- **라벨의 목적문은 손으로 쓰지 않는다.** `figma/component-summaries.json`이 규범 문서의 H1 다음
  첫 문단 첫 문장을 담고 `scripts/build-figma-summaries.mjs`가 생성한다. `pnpm check`에 연결돼
  있어 규범 문서가 바뀌면 **생성물이 어긋나 실패한다** — Figma 라벨이 조용히 낡는 경로를 닫는다.
  이름 해석은 `build-figma-snapshot.mjs`와 같은 규칙(`figmaNames ?? figmaName`)을 쓴다
- 이 과정에서 실측으로 드러난 것 둘: Forms 섹션이 Figma 기본 짙은 회색으로 만들어져 **검은 글자가
  안 보였고**(나머지 6개는 흰색), Components 페이지 배경만 **순검정**이라 다른 세 페이지와 달랐다.
  둘 다 형제에서 값을 읽어 맞췄다. 섹션은 자식을 붙여도 스스로 커지지 않아 흰 면이 내용 밖에서
  끊겼다 — 자식 경계로 다시 크기를 잡았다
- component library: publish 전. component·아이콘 수는 `pnpm verify-figma-parity` 출력과
  `figma/snapshot.json` 이 낸다. 최신은 SegmentedControl 2 variant(Size)이며
  선택/비선택은 variant 축이 아니라 한 variant 안의 두 자손이다 — 색만 다르고 기하가 같다
- component parity checker: `done` — Figma variant 옵션을 코드 타입 선언과 대조하고, 선언되지 않은
  property와 raw 값 사용을 실패로 처리한다

P2는 review 가능한 proposal까지만 소유한다. 실제 library evidence가 생길 때까지 manifest의 Figma 상태는
`not-ready`다. 파일이 생성됐다는 사실만으로 어떤 상태도 올리지 않는다.

## P2 proposal contract

- `packages/tokens/src/klipse.tokens.json`의 안정 token ID, type, mode, alias와 description을 보존한다.
- `scripts/lib/token-model.mjs`가 proposal의 primitive/semantic token, raw/resolved value, alias,
  description/deprecation과 root metadata를 JS·JSON·manifest와 같은 normalized graph에서 검증한다. CSS는
  같은 graph의 semantic consumption surface다.
- TypeScript declaration은 별도로 JavaScript export와 token ID/type/mode/alias/value-shape contract를
  맞춘다.
- Figma collection, mode와 variable name 변환을 명시하고 이름 충돌을 build error로 처리한다.
- Figma가 composite typography, shadow, easing이나 runtime layer를 완전히 표현하지 못하면 field expansion과
  loss metadata를 포함한다.
- 이전 proposal과의 diff는 create, stable ID/mode remove, source-path-only move, value/alias change, mode change,
  description/deprecation과 collection change를 구분한다. 공개 ID rename은 create + deprecated replacement +
  remove 순서로 다룬다.
- proposal은 credential 없이 CI에서 생성·검증할 수 있어야 하며 자동 publish하지 않는다.

## 목표 흐름

1. P2 구조화 token source에서 Figma-compatible proposal을 생성한다.
2. proposal은 자동 적용하지 않고 token maintainer와 design maintainer가 diff를 review한다.
3. P3에서 승인된 proposal을 library draft에 적용하고 stable variable key를 기록한다.
4. 이름, mode, alias, component property와 variant parity를 검사한다.
5. 승인한 Figma change와 code change를 같은 DS release에 연결한다.
6. 제품 screen은 published library component instance를 소비하고 detach 이유를 제품 이슈에 기록한다.

## 승격 조건

P2 private release-candidate와 proposal만으로는 `figma: not-ready`를 유지한다.
`figma: partial`에는 review 가능한 P3 library draft와 stable variable/component key가 필요하다.
`figma: done`에는 published library, token/variant parity check, usage guidance와 owner가 필요하다.

credential이나 plugin session이 없는 CI에서도 catalog가 정직해야 하므로, Figma 연결 실패를
`done`으로 캐시하지 않는다.
