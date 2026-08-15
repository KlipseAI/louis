---
id: foundation-iconography
status: experimental
authority: normative
---

# Iconography

아이콘은 라벨을 대체하지 않고 보강한다. 이 문서는 정본 위치, 기하 계약, 크기·색 계약, 접근성 기본값과
Web/Figma 표면을 소유한다. 정본 위치와 provenance 규칙은
[DS-D-0008](../governance/decisions/DS-D-0008-icon-source.md)이 결정했다.

## Source and artifacts

| 역할 | 경로 |
| --- | --- |
| 정본 SVG | `packages/react/src/icons/svg/{name}.svg` |
| provenance | `packages/react/src/icons/provenance.json` |
| upstream 라이선스 원문 | `packages/react/src/icons/licenses/{key}.txt` |
| React 생성물 | `packages/react/src/icons/generated/index.tsx` |
| 아이콘 manifest | `packages/react/src/icons/generated/manifest.json` |
| 고지문 | `packages/react/THIRD-PARTY-NOTICES.md` |

generated 셋은 직접 수정하지 않는다. 정본을 고치고 `pnpm build:icons`를 실행한다.

**모든 글리프는 provenance를 갖는다.** `origin: "original"`이거나, upstream 프로젝트·아이콘 이름·
라이선스·라이선스 파일·출처 URL·취득일·수정 내역을 전부 갖는다. 추정 출처와 `unknown`은 빌드 실패다.
upstream 글리프를 채택하면 그 라이선스 원문이 저장소에 함께 들어오고 고지문이 패키지에 동봉된다.

## Geometry contract

- `viewBox="0 0 24 24"`.
- **root `<svg>`는 `xmlns`와 `viewBox`만 갖는다.** 표현 속성은 요소마다 둔다 — root에 두면
  선언되지 않은 요소가 그것을 상속해, 보이지 않던 잔재가 갑자기 그려진다.
- `stroke="currentColor"`, `fill="none"`, `stroke-linecap="round"`, `stroke-linejoin="round"`를
  **요소마다** 명시한다.
- `stroke-width`는 **1.5** 하나만 허용한다.
- 요소는 `path` `circle` `rect` `ellipse` `line` `polyline` `polygon` `g`만 허용한다.
- 아무것도 그리지 않는 요소를 남기지 않는다(`g` 제외). upstream의 배경 `rect`가 대표적이다.
- `id`와 `clip-path`는 정본에 남길 수 없다. 인라인 SVG의 `id`는 문서 전역이라 같은 페이지의 다른
  아이콘과 클리핑이 서로 먹는다.
- 속성 따옴표는 `"`와 `'` 모두 유효하다. 두 형태가 다르게 취급되면 같은 문서가 규칙에 따라 다르게
  읽히므로, 파서는 둘을 동등하게 보고 **읽지 못한 태그는 통과가 아니라 실패로 처리한다.**

**1.5의 근거는 임의값이 아니다.** 제품의 정본 두께 공식은 `strokeWidth = screenPx × viewBox / size`이고
표준 `screenPx = size / 16`이므로 viewBox 32에서 stroke-width는 크기와 무관하게 상수 2다. 같은 광학
두께를 24 격자로 옮기면 `2 × 24 / 32 = 1.5`다. Figma 변수·component도 24 기준이 다루기 쉽다.

## Size model

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--kds-icon-size-sm` | 16px | 조밀한 행, 인라인 |
| `--kds-icon-size-md` | 20px | 기본 |
| `--kds-icon-size-lg` | 24px | 단독 액션, 큰 타깃 |

- 원시 px를 받는 prop은 제공하지 않는다.
- **컨테이너와 글리프를 구분한다.** 컨테이너 크기는 컨트롤이 소유하고 글리프 크기는 아이콘이
  소유한다. 아이콘은 자기 컨테이너를 그리지 않으며 아이콘 래퍼에 배경색을 두지 않는다.
- 히트 영역은 아이콘이 소유하지 않는다. 주요 액션의 44×44 CSS px 계약은 부모 컨트롤이 소유한다
  ([Inclusive Design](inclusive-design.md)의 "시각 아이콘 크기와 실제 히트 영역을 분리").

## 검색

**사람은 아이콘의 이름을 모른 채 찾는다.** "휴지통"을 떠올리지 `trash-simple`을 떠올리지 않는다.
그래서 글리프마다 한국어와 영어 동의어를 함께 선언한다.

- 원천은 [`packages/react/src/icons/keywords.json`](../../packages/react/src/icons/keywords.json)이며
  글리프당 2개 이상, **한국어를 최소 하나** 포함해야 한다. 없으면 빌드가 실패한다.
- 같은 목록이 icon manifest와 Figma component description의 `KEYWORDS:` 블록에 함께 들어간다.
  parity 게이트가 둘이 갈라지지 않는지 매 실행 확인한다.
- 구분자는 ASCII 마커다. 이모지 마커는 파싱과 diff에서 다루기 어렵다.

## 왜 낱개 component인가

Figma에서 아이콘 26개는 **각각 독립 component**다. component set으로 묶지 않는다.

variant 축은 **값이 2개 이상일 때만** 만든다. Klipse 아이콘은 두께가 `1.5` 하나뿐이라 묶을 축이
없다 — 축이 하나뿐인 set은 드롭다운에 값이 하나만 있는 빈 껍데기가 된다. 나중에 Fill 두께를
그리게 되면 그때 `Weight` 축으로 묶는다.

낱개여도 활용성이 떨어지지 않는 이유는 **소비 방식이 instance swap이기 때문**이다. Button의
`LeftIconGlyph`, IconButton의 `Glyph`가 INSTANCE_SWAP property이므로 컴포넌트 안에서 26개 중
아무거나 고를 수 있다. asset 패널은 `icon/` 접두사로 이미 한 폴더로 묶는다.

## Color contract

- 아이콘은 `currentColor`만 쓴다. 자기 색을 정하지 않으며 부모의 `color`를 상속한다.
- 상태 색은 부모가 semantic token으로 준다. 색만으로 상태를 구분하지 않고 텍스트·형태 신호를 함께
  제공한다 ([Color & Theme](color-theme.md)).
- 다색 글리프는 아이콘이 아니다. 브랜드 로고와 일러스트는 별도 트랙이다.

## Accessibility

- **아이콘의 기본값은 장식이다.** `label`을 주지 않으면 `aria-hidden="true"`가 부여된다.
- **아이콘은 accessible name을 제공하지 않는 것이 기본이다.** 아이콘 전용 버튼의 이름은 버튼이
  `aria-label`로 소유한다 ([Button](../components/button.md)의 Accessibility). 아이콘에도 `label`을
  주면 이름이 두 겹으로 노출된다.
- `label`은 아이콘이 화면에서 **유일한 정보 전달 수단일 때만** 준다. 텍스트 라벨이 곁에 있으면
  아이콘은 언제나 장식이다.
- 아이콘은 라벨의 의미를 반복 설명하지 않는다 ([Menu & Popover](../components/menu-popover.md)).
- 아이콘은 focus를 받지 않는다. 상호작용은 부모 컨트롤이 소유한다.
- forced-colors 모드에서 아이콘은 시스템 텍스트 색을 따라야 한다. `mask-image` + 배경색 기반 렌더는
  이 요구를 만족하지 못하므로 정본 소비 경로가 아니다.

## Web surface

`@klipse-design/react/icons`가 글리프당 named export와 `IconName` union을 제공한다. 시그니처는
`IconProps`가 소유하며 `size`와 `label` 두 prop만 노출한다. Button의 `leftIcon`/`rightIcon`은
`ReactNode`로 유지되므로 Button API는 바뀌지 않는다.

서브패스는 첫 글리프 세트가 게이트를 전부 통과한 뒤에 열었다(DS-D-0008 Rollback). **제거는
breaking이므로**(DS-D-0006) 글리프 이름과 심볼은 이제 공개 계약이다.

`packages/react`의 `files`에 `THIRD-PARTY-NOTICES.md`가 포함되므로, 패키지를 받는 쪽은 upstream
라이선스 원문을 함께 받는다. 고지문 없이 아이콘만 배포되는 경로는 존재하지 않는다.

## Figma mapping

- 이름은 `icon/{kebab-name}`, 개별 component다. component set이 아니다 — 아이콘 이름은 prop이 아니라
  심볼 식별자이므로 `componentPropertyDefinitions` ↔ 코드 prop 대조 규칙(DS-F-006)과 의미가 어긋난다.
- frame은 24×24 하나다. **크기 variant를 두지 않는다.** 두면 코드의 `IconSize`와 Figma variant가 두
  정본이 되어 4px 격자를 누가 소유하는지 모호해진다. 크기는 코드와 이 문서가 소유한다.
- stroke는 색 변수에 바인딩한다. Figma에는 `currentColor`가 없으므로 DS-F-006의 "raw 값 0"을
  만족하려면 변수를 물어야 한다.

## Naming and lifecycle

- kebab-case, upstream 이름을 우선하되 Klipse 의미가 다르면 우리 이름을 쓴다.
- 글리프 제거와 이름 변경은 named export 제거이므로 breaking이다(DS-D-0006).

## Not adopted

| 항목 | 사유 |
| --- | --- |
| `mask-image` + 배경색 소비 | npm 패키지가 소유할 수 없는 URL에 의존하고, 아이콘당 요청 1건이며, forced-colors에서 무너지고, stroke 계약을 소비 시점에 게이트할 수 없다 |
| SVG sprite | 외부 sprite는 소비 앱의 public 경로에 의존하고, 인라인 sprite는 전량 DOM 삽입이라 tree-shaking이 불가능하다 |
| 12 / 13 / 14 / 15px | 4px 격자 밖. 제품 실측의 15px 다수는 노드 캔버스 국소값이다. 이관 시 16으로 수렴한다 |
| 32px과 64px | 32는 정본 viewBox와 숫자가 같아 혼동을 만든다. 64는 빈 상태 컴포넌트가 생길 때 사유와 함께 추가한다 |
| `vector-effect: non-scaling-stroke` | 아이콘 규범이 아니라 줌 컨텍스트의 국소 처방이다 |
| 크기 variant를 가진 Figma component set | 정본 이중화 |
| 브랜드 로고·상표를 아이콘 슬롯에 투입 | 다색·고정색이라 `currentColor` 계약을 만족할 수 없고 상표 조건이 다른 축이다 |

## Known deviations

| 항목 | 상태 | 사유 |
| --- | --- | --- |
| 실루엣 정확성 | 게이트 없음 | 정규화·해시·이름·고지는 기계가 잡지만 "이 글리프가 의도한 그림인가"는 사람의 시각 review다 |
| 출처 미확정 글리프 | 미채택 | provenance를 확인할 수 없는 글리프는 채택하지 않는다(DS-D-0008 결정 3). 재작도 또는 확인이 선행 조건이다 |

## Acceptance tests

1. 세 크기 토큰의 계산 박스가 브라우저에서 16 / 20 / 24 CSS px다.
2. `label` 없는 아이콘이 accessibility tree에 노출되지 않는다.
3. `label` 있는 아이콘이 `role="img"`와 해당 이름으로 정확히 한 번 노출된다.
4. 아이콘 전용 버튼의 accessible name이 버튼의 `aria-label` 하나이며 중복되지 않는다.
5. 부모 `color` 변경이 light/dark 양쪽에서 아이콘 stroke에 반영된다.
6. forced-colors 모드에서 아이콘이 시스템 텍스트 색을 따른다.
7. 같은 아이콘 두 개를 한 문서에 렌더해도 id 충돌로 클리핑이 깨지지 않는다.
8. 200% zoom에서 아이콘과 라벨의 정렬이 유지된다.
9. 한 아이콘만 import한 production 번들에 다른 글리프의 path 데이터가 포함되지 않는다.
10. `THIRD-PARTY-NOTICES.md`가 provenance의 모든 upstream 라이선스 원문을 포함한다.
