---
id: decision-document-is-not-an-app-screen
status: experimental
authority: normative
---

# DS-D-0067 문서는 앱 화면이 아니다 — 문서 부품을 한 벌 세우고, 표 하나만 변형으로 얹는다

- Status: accepted (LOUIS 2026-09-21, Figma · 토큰 승격은 남았다)
- Date: 2026-09-21
- Owners: repository owner (디자인 승인), design system maintainer
- Affects: `document`, `table`, `stat-tile`, `alert`, `badge`, `section-header`,
  `decision-three-in-one-change`, `decision-token-names-must-be-true`, `decision-alpha-scale`

## Context

소유자가 「LOUIS 에 문서 패턴으로 옮겨줘」라고 했다. 옮길 것은 2026-09-21 에 승인한 「Klipse Meta
광고 운영안」 한 편이다 — 보고서 · 운영안 · 제안서처럼 스크롤로 끝까지 읽는 문서.

**그 문서에는 거절된 첫 시안이 있다.** 첫 시안은 LOUIS 앱 부품을 그대로 얹었다 — 결론을 Alert
배너로, 지표를 StatTile 로, 카드마다 헤어라인 테두리를 둘렀다. 소유자 반응은 「실망스럽다」 ·
「난 화려한 걸 원하는 게 아니야」였다. 승인된 두 번째 시안은 klipse-deck-kit 의 구성 규칙
(`docs/DESIGN-RULES.md` — 깊이는 메인 카드 헤어라인 한 겹, 안쪽 면은 잉크 알파 면색만, 강조색 하나,
노랑은 비용 지점만, 라벨 앞 점 · 라벨 사이 가운뎃점 금지, 7단계 타이포, 박스 간격 10, 카드 여백
24/32, 반경 역할 다섯)으로 다시 짰다. 두 시안의 차이가 이 결정의 재료다.

같은 모양의 **형제 구현**이 deck-kit 에 있다 — `docs/COMPONENTS.md` 의 `k-statcard` · `k-bars` ·
`k-timeline--v` · `k-callout` · `k-card--accent` · `k-chip` · `k-table` · `k-numlist`. 다만 deck-kit 은
`.louis-document*` 를 쓰는 소비처가 아니라 같은 조형을 따로 짠 구현이고, **이 레시피의 실제 소비처는
0 이다.** `packages/css/README.md` 가 공용 승격에 요구하는 「두 개 이상의 실제 소비처」를 이 결정은
충족하지 않는다. 승격의 근거는 소유자 요청(「LOUIS 에 문서 패턴으로 옮겨줘」)과 형제 구현이 같은
조형으로 수렴했다는 사실이고, 그래서 manifest 의 `web` 은 `partial` 이다.

## Decision

1. **Document 를 패턴으로 세운다** — 규범 [`design/patterns/document.md`](../../patterns/document.md),
   레시피 `packages/css/src/pattern/document.css`(`.louis-document*`). 셸(바닥 · 시트 · 본문 열) ·
   머리 · 결정 요청 · 절 · 산문 · 격자 · 카드 · 수치 · 비교 막대 · 판정 알약 · 타임라인 · 흐름 ·
   콜아웃 · 표 래퍼 · 맺음이 한 레시피에 있다. 이 부품들은 「시트 안의 면은 잉크 알파뿐」이라는
   문서의 깊이 규칙에 기대어 서므로 문서 밖에서 따로 쓰는 컴포넌트로 떼지 않는다.
2. **기존 컴포넌트에 얹는 것은 표 하나다** — `.louis-table[data-variant="ruled"]` 와 셀 강조
   `data-emphasis="total|lead"`. 나머지는 아래 판정표의 이유로 얹지 않는다.
3. **문서 규칙 값은 아직 토큰이 아니다.** 레시피 루트가 이름으로 한 번씩만 선언한다
   (`--louis-document-box-gap` 10 · `--louis-document-card-inset` 24 · `-lg` 32 · 시트 폭 · 여백 · 절
   간격). 부품의 겉 치수는 그 부품 루트가 같은 방식으로 소유한다. 이유는 아래 「토큰으로 세우지
   않은 이유」.
4. **면은 `fg-primary` 알파다**(4 · 8 · 12 · 16 · 24 — [DS-D-0026](DS-D-0026-alpha-scale.md) 스케일).
   `color-mix` 로 역할 잉크에서 만든다. 면 사다리 칸을 쓰지 않는다 — 다크에 시트 위 한 칸 면이 없다
   ([DS-D-0065](DS-D-0065-table-row-hover-is-a-state-layer.md)).
5. **글자는 역할 잉크다.** 승인본의 잉크 알파 글자(72% · 56%)를 `fg-secondary` · `fg-tertiary` 로
   옮긴다 — [Section Header](../../components/section-header.md) Known deviations 2 와 같은 판단이다.

## 판정표 — 변형으로 얹을 수 있는가

| 문서 부품 | 얹을 후보 | 판정 | 이유 |
| --- | --- | --- | --- |
| 규선 표 | [Table](../../components/table.md) | **변형** `data-variant="ruled"` | 같은 것(데이터 표)의 다른 조판이다. 구조 · 정렬 속성 · 스크롤 소유가 같고 머리 면 · 규선 · 여백만 다르다. Figma 가 `partial` 이라 CSS 변형이 Figma 판정을 거짓으로 만들지 않는다 |
| 기간 대비 증감 | `louis-delta-pill` | **그대로 쓴다** | 방향(up · down) 어휘 그대로다. 새 선언이 없다 |
| 수치 카드 | [Stat Tile](../../components/stat-tile.md) | 얹지 않는다 | Stat Tile 이 자기 규칙으로 「액자가 있고 없고가 조형을 가른다 — 한 컴포넌트의 두 크기가 아니다」를 갖는다. 문서 수치는 액자(헤어라인 · `bg-raised`)가 없고, 라벨 14 · 수치 36 · 여백 24 로 크기 축 밖의 값이 셋이다. 크기 축은 「값의 크기만 바꾼다」고 못 박혀 있다. Figma `done` 인 세트에 코드만 있는 변형을 더하면 variant parity 가 거짓이 된다 |
| 콜아웃 | [Alert](../../components/alert.md) `data-layout` | 얹지 않는다 | Alert 는 **화면의 상태**를 알리는 배너다 — 소비처가 긴급도를 `role` 로 정하고, 톤이 danger · info · success · warning 이며, 닫기가 있다. 문서의 콜아웃은 글의 한 대목을 짚는 **편집 강조**다(`role="note"`). 첫 시안이 거절된 이유 가운데 하나가 「경고 박스를 편집 강조로 쓰기」였다. Alert 도 Figma `done` 이다 |
| 판정 알약 | `louis-delta-pill` | 얹지 않는다 | 비교의 판정(「약 7% 낮음」 — 비용이 내려가 앞섰다)은 방향이 아니다. 방향 어휘로 칠하면 앞선 값이 빨강이 된다. 뜻이 다르므로 이름이 달라야 한다 |
| 흐름 칩 | [Badge](../../components/badge.md) | 얹지 않는다 | Badge 는 반경 `control-sm` 8 의 **상태 표식**이고 톤 어휘를 갖는다. 흐름 칩은 알약(999)이고 순서의 한 칸이다. Stat Tile 문서가 이미 「둘을 한 컴포넌트로 접으면 반경이 축이 되는데 그 축은 이름을 붙일 수 없다」고 판정했다 |
| 절 머리 | [Section Header](../../components/section-header.md) | 얹지 않는다 | Section Header 는 화면 · 묶음 · 패널의 머리(제목 36 · 20 · 12, 오른쪽 끝 액션 묶음, 719 에서 접힘)다. 문서 절 머리는 강조색 키커 + 28 제목 + 출처 줄이고 액션이 없다. 어느 `level` 에도 28 이 없고, 키커는 Section Header 의 슬롯이 아니다 |
| 번호 카드 · 결정 항목 · 타임라인 · 비교 막대 | 없음 | 새 부품 | LOUIS 에 같은 조형이 없다. Step Tile 은 정사각 빈 면 + 캡션(랜딩 한 자리)이라 다르다. Progress 는 진행률(값 하나 · `role="progressbar"`)이고 비교 막대는 둘 이상의 대상을 나란히 재는 그림이다 |
| 기간 요약 카드 | 없음 | 카드 변형 `data-layout="split"` | 승인본에서 한 번 쓰였다. 장식이 아니라 「요약 + 설명」이라는 배치라 카드의 배치 변형으로 남기고, 전용 부품을 만들지 않았다 |

## 토큰으로 세우지 않은 이유

박스 간격 10 · 카드 여백 24/32 는 `migration/deck/layout-rules.md` 가 장표 93장을 실측해 적은 규약이고,
시트 폭 1120 · 측정 폭 920 · 여백 80/40/64 · 절 간격 72 는 승인본의 값이다. **그 역할을 말하는 토큰이
저장소에 없다.** 같은 값의 다른 역할 토큰(`layout-alert-compact-inset` 10 · `space-layout-section` 24)을
빌리면 한 값이 두 뜻을 나른다([DS-D-0029](DS-D-0029-token-names-must-be-true.md) ·
[DS-D-0030](DS-D-0030-no-duplicate-role-tokens.md)).

토큰을 새로 세우는 길은 막혀 있지 않지만 **이 작업 안에서는 닫힌다.** 토큰은 전부 Figma 변수로
나가고, 원본에 하나를 더하면 `verify-figma-parity` 가 「변수가 snapshot 에 없습니다」로 멈춘다
(2026-09-21 이 워크트리에서 `space-document-box-gap` 하나를 더해 확인했다). 그것을 초록으로 만드는
길은 Figma 변수 적용과 되읽기뿐이고, [DS-D-0028](DS-D-0028-three-in-one-change.md)이 셋을 같은 작업에서
하라고 정한다. 이 패턴의 Figma 는 `not-ready` 다.

그래서 값을 **레시피 루트의 이름**으로 둔다. 규칙 본문에는 숫자가 없고 이름만 있다
(`gap: var(--louis-document-box-gap)`). 토큰으로 올릴 때는 선언 한 줄을 `var(--louis-space-…)` 로
바꾸면 모든 규칙이 따라온다. `.louis-pill-trigger` 가 선언하는 `--louis-floating-shell-blur` 가 같은 형태의
선례다.

## Alternatives

- **첫 시안처럼 앱 부품을 얹는다.** 거절됐다.
- **부품마다 컴포넌트를 세운다**(DocumentCard · DocumentStat · …). 부품들이 「시트 안의 면은 잉크
  알파뿐」이라는 문서의 깊이 규칙에 기대어 선다. 문서 밖에서 쓰면 그 전제가 사라져 면이 바닥에
  묻힌다. 패턴 레시피 하나가 그 전제를 함께 들고 간다.
- **Stat Tile · Alert 에 변형을 더한다.** 위 판정표. 둘 다 Figma `done` 이고 자기 문서가 경계를 이미
  그었다.
- **문서 토큰을 지금 세운다.** 위 「토큰으로 세우지 않은 이유」.
- **승인본의 잉크 알파 글자를 그대로 옮긴다.** LOUIS 의 잉크 역할은 바닥과 무관하게 정해진다.

## Consequences

- `@klipse-design/css` 의 `styles.css` · `styles.layer.css` 에 `.louis-document*` 규칙과 표 변형이
  더해진다. 기존 클래스의 계산값은 바뀌지 않는다 — 변형이 없는 표는 그대로다(테스트가 잰다).
- **쓰지 않는 소비처도 이 CSS 를 싣는다.** 제품은 `@klipse-design/css/styles.layer.css` 를 통째로
  import 하므로(제품 전역 스타일시트, 2026-09-21 확인), 핀을 올리면 문서를 그리지 않는 페이지에도 이
  규칙이 실린다. `styles.css` 가 425,752 → 468,946 B(+43 KB), gzip 120,040 → 128,373 B(+8.3 KB)다(816eb0b
  기준 실측). 제품 소비처가 0 인 동안 이 비용은 이득 없이 나간다 — 문서 CSS 를 따로 import 하는
  진입점은 소비처가 생길 때 package surface Decision 으로 다룬다.
- **다른 부품의 토큰 셋을 빌린다** — `layout-app-shell-outer-gap` · `progress-track` ·
  `alert-warning-stroke`(document.md Known deviations 5). 레시피 루트의 이름 셋만 읽는다. 앞의 것은
  LOUIS CSS 가 처음 무는 토큰이라 `check-coverage-targets` 의 `DEAD_TOKEN_BASELINE` 이 73 → 72 로
  내려갔다. 그 토큰은 앵커 브랜치의 링 여백 결정
  ([DS-D-0063](DS-D-0063-ring-and-compact-inset-follow-the-product.md))이 12 → 8 로 옮겼으므로, 두 변경이
  만난 뒤(Updates (148)) 720 이상의 바닥과 시트 사이는 승인본의 12 가 아니라 8 이다.
- 셀 강조 `data-emphasis` 는 규선 표가 아니어도 쓸 수 있다.
- **대비 결함 둘을 알고 들인다** — 강조색 글자(키커 · 날짜) 라이트 3.37:1, 앞선 값 초록 라이트
  2.12:1. 둘 다 승인본의 색이고, 글자로 쓸 역할 토큰이 없다는 같은 뿌리를 가진다
  (`louis-delta-pill` 이 이미 같은 결함을 적어 두었다). 해소는 역할 토큰 판정이고 소유자 몫이다.
- Figma 는 `not-ready` 다. 템플릿 보드가 없고 문서 규칙 값이 변수가 아니다.

## Rollout and verification

- 예시 `packages/css/examples/document.html` 이 승인본을 LOUIS 클래스만으로 다시 짠다. 데스크톱 1440 ·
  모바일 390 · 다크 1440 세 판을 승인 캡처와 나란히 대조했다.
- `packages/css/test/document.browser.test.ts` — 깊이 · 면 합성색(두 테마) · 간격 · 반경 · 타이포 ·
  막대 · 타임라인 · 흐름 · 콜아웃 · 판정 알약 · 규선 표 · 좁은 화면.
- `pnpm build:css` · 저작 게이트(`verify-css-gates`) · `check-design-docs` · `check-llms-docs`.

**되돌리기.** `packages/css/src/pattern/document.css` 를 지우고 `table.css` 의 규선 변형 · 셀 강조
블록을 빼고 `pnpm build:css` 하면 생성물이 이전과 같아진다. 그러면 `layout-app-shell-outer-gap` 을
무는 곳이 다시 없어지므로 `scripts/check-coverage-targets.mjs` 의 `DEAD_TOKEN_BASELINE` 을 72 → 73 으로
함께 되돌린다 — 양방향 래칫이라 빼먹으면 게이트가 실패한다. 문서가 빌린 토큰을 문서 역할 토큰으로
옮길 때도 같다. 소비처가 없으므로 제품 쪽 되돌림은 없다.

**다시 볼 때.** 문서 규칙 값을 토큰으로 올릴 때(Figma 변수와 함께), 두 번째 문서가 이 레시피로
만들어질 때, 강조 잉크 · 성공 잉크 역할 토큰이 설 때.

## 2026-09-28 소유자 조정

운영 보고 예시(`packages/css/examples/document-report.html`)를 보고 소유자가 셋을 고쳤다. 위 판정은 기록으로 남기고, 현재 값은
[Document](../../patterns/document.md) 가 소유한다.

- **레일 변형을 걷어냈다.** 카드 앞의 강조색 3px 선(`data-accent="rail"`)이 왜 있냐는 지적이다. 강조는 본문 `strong` 과 절 구성으로
  준다. 옛 마크업을 둔 카드는 여느 카드로 선다(실브라우저 테스트가 선이 없음을 잰다).
- **박스 간격 10 → 8.** 카드 격자의 간격을 8 로 하라는 지시다. 박스를 나열하는 컨테이너는 한 값을 쓰므로 결정 항목도 함께 8 이다.
  deck-kit 「박스 사이 간격 10」에서 내린 값이다.
- **제목 48 → 36, 리드 20/400 → 16/500.** 랜딩 데스크톱의 절 제목(`type-heading-36-semibold`) · 설명(`type-body-16-medium`)과 같게
  하라는 지시다. 좁은 화면의 제목은 28 이다.
- **제목은 구 경계에서 끊는다.** 문서 제목 · 절 제목은 `text-wrap: balance`, 두 줄로 쓸 제목은 줄마다 한 구를
  `.louis-document__title-line` 으로 감싼다(`<br>` 을 쓰지 않는다).

## 2026-09-29 소유자 결정 — 표는 LOUIS 기본 표다 · 추이와 캡처를 세운다

위 Decision 2 와 판정표의 「규선 표」 행은 기록으로 남긴다. 현재 값은 [Document](../../patterns/document.md) · [Table](../../components/table.md) 가 소유한다.

- **규선 변형(`data-variant="ruled"`)을 걷어냈다.** 소유자가 「문서 속 표 스타일이 루이에 정의된 스타일 맞아?」라고 물었다. 그 변형은
  `table.css` 와 Table 규범에 있었지만 이 결정이 문서를 위해 세운 것이었고, Figma 의 Table 세트와 제품의 표에는 없었다. 기본 표로
  통일하기로 정했다 — 문서의 표도 머리 면 · 헤어라인 · 머리 12 · 셀 8 이다. 위 판정표가 적은 「Figma 가 `partial` 이라 CSS 변형이
  Figma 판정을 거짓으로 만들지 않는다」는 판정이 틀렸다는 뜻이다 — 거짓이 되지는 않았지만, 코드에만 있는 변형은 「LOUIS 에 정의된
  표」를 두 벌로 만들었다.
- **문서는 열 폭 정책만 정한다.** `.louis-document-table > .louis-table` 이 `table-layout: auto` 를 준다. Table 이 「가로 스크롤과 열
  너비는 소비처가 소유한다」고 적어 두었으므로 새 변형이 아니다.
- **행 머리는 기본 표가 받는다.** `th scope="row"` 가 몸 칸 규칙을 받는다(굵기 400 · 시작 정렬) — 규선 변형만 갖고 있던 규칙이고,
  없으면 브라우저 기본값(굵게 · 가운데)이 새어 나온다. Figma 의 TableCell 과 같은 칸이다. 셀 강조 `data-emphasis` 는 원래 기본 표의
  축이라 그대로다.
- **「깊이는 헤어라인 한 겹」의 예외가 표 하나 생겼다** — 표 머리 행의 면과 헤어라인. document.md Known deviations 7.
- **추이(`.louis-document-trend`)와 캡처(`.louis-document-media` · `.louis-document-compare`)를 세웠다.** 운영 보고 부록이 가장 자주
  부딪혔다고 적은 두 자리다. 추이는 앱의 [Chart Card](../../components/chart-card.md) 에 얹지 않는다 — Chart Card 는 바깥 액자와 안쪽 면
  두 겹(반경 16 · 10)의 대시보드 카드이고, 문서는 카드 면 한 겹이다(첫 시안이 거절된 「앱 부품을 문서에 얹기」와 같은 자리다). 캡처는
  deck-kit `.k-shot` 의 규칙(면색만으로 서는 프레임 · 비율 유지 · 사각형 대신 핀)을 문서 카드로 옮겼다.

**되돌리기.** 규선 변형을 되살리려면 이 추기 전의 `table.css` 규선 블록 · 문서 테스트 · 두 예시의 `data-variant="ruled"` 를 한 커밋에서
되돌린다. 추이 · 캡처는 `document.css` 의 두 블록과 예시의 해당 마크업 · `examples/media/` 를 빼면 된다 — 다른 부품이 그 이름을 읽지 않는다.
