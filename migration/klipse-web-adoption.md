---
id: klipse-web-adoption
status: experimental
authority: reference
---

# klipse-web 채택 계획

`KlipseAI/klipse-web`이 이 디자인 시스템을 따라가게 만드는 순서와 각 단계의 **측정된 영향 범위**를
적는다. 비규범 기록이며 실행 여부와 시점은 owner가 정한다.

## 왜 손으로 고치지 않는가

owner 지시는 "스트로크 두께 1인 것을 0.5로 바꾸는 것 같은 변경이 klipse-web에도 적용되어야 한다"였다.
그 변경 하나의 범위를 재 보면 이렇다.

| 항목 | klipse-web 실측 |
| --- | --- |
| `border: 1px solid` 선언 | **147곳** |
| 이미 `0.5px`인 선언 | 118곳 |
| 글래스 토큰(`--glass-*`) 사용 파일 | **80개** |

147곳을 손으로 고치면 (1) 한 번에 다 못 고치고, (2) 다음에 또 벌어지고, (3) 무엇이 왜 바뀌었는지
남지 않는다. **토큰 한 곳을 바꾸면 따라오는 구조**로 만드는 것이 순서다.

klipse-web은 이미 그 구조의 절반을 갖고 있다 — `app/tailwind.css`의 `@theme inline` 블록을
`check-tailwind-theme.mjs`가 생성하고 검사한다. 문제는 그 생성기의 **입력이 제품 자신의
`globals.css`**라는 것이다. 그래서 제품 CSS가 토큰의 정본이고, DS가 토큰을 바꿔도 따라오지 않는다.

## 목표 상태

```
klipse-design-system                    klipse-web
  packages/tokens/src/*.tokens.json  ──▶  (정본)
        │
        ├─▶ @klipse-design/css/tokens.css   ──▶ globals.css가 소비
        └─▶ @klipse-design/css/theme.css    ──▶ tailwind.css의 @theme inline
```

DS 토큰 하나를 바꾸면 CSS 변수와 Tailwind 유틸리티가 함께 바뀌고, 제품은 그것을 소비만 한다.

## 지금 상태 — 채택이 실제로 켜졌다 (2026-08-21 실측)

**이 문서의 아래 「단계」는 복사본(vendoring) 시절 기록이다. 제품은 그 단계를 지나 git dependency로
넘어갔고, 지금은 이 저장소를 커밋 SHA로 고정해 받는다.**

klipse-web `design` 브랜치(`a3ed8e03`) 실측:

| 축 | 값 |
| --- | --- |
| 의존성 선언 | `"@klipse-design/css": "github:KlipseAI/louis#bf62eba7…&path:/packages/css"` |
| 고정된 DS 커밋 | `bf62eba7` — 「Checkbox를 세운다」 |
| 진입 CSS가 부르는 것 | `@klipse-design/css/tokens.css`(레이어 밖) · `@klipse-design/css/theme.css`(`layer(theme)`) |
| 순서 | theme import가 제품 자신의 `@theme inline` 블록 **뒤**에 온다 — 앞에 두면 `--color-*: initial`이 DS 색을 지운다(아래 실측과 같은 함정) |
| 이름 충돌 | 0건 (제품 144 · DS 154) |

이 두 줄은 `origin/main`에 **없다.** 그래서 제품 값을 읽을 때 정본이 `design`이다 —
[읽기 함정](../design/foundations/product-reading-traps.md)의 「정본은 `design` 브랜치다」 참조.

### 핀이 낡는다는 사실을 게이트가 안다

이 저장소 HEAD는 그 핀보다 **147커밋 앞서** 있고 `packages/css`가 4,000줄 넘게 달라졌다.
그래서 `measure-product-components.mjs`는 제품 CSS를 컴파일할 때 **HEAD가 아니라 제품이 고정한
커밋의 생성물**을 꺼내 쓴다. HEAD를 쓰면 제품에 없는 DS로 재게 되고, 그것이 바로 이 저장소가
`product-ref.mjs`에서 경계하는 「게이트가 초록인 채로 값이 낡는」 실패다. 게이트 로그가 매번
`DS <sha>`를 함께 찍는다.

**핀을 올리는 것은 의도한 행위여야 한다** — 제품 `package.json`의 SHA를 바꾸는 것이 그 신호다.

## 단계

### 1단계 — 연결 — **완료** (2026-08-15)

연결 방법을 셋 다 따져보면 오늘 가능한 것은 하나뿐이었다.

| 방법 | 가능한가 |
| --- | --- |
| registry publish | 불가 — publish 권한이 없다 (`DS-GOV-000` blocked) |
| git dependency | 그때는 불가 — DS 저장소에 원격이 0개였다. **2026-08-18에 `KlipseAI/louis`(private)가 생겨 이 길이 열렸다** |
| 복사본(vendoring) | 가능 |

그래서 복사본으로 했다. klipse-web 브랜치 `design-system-adoption`, 커밋 `d7be4831`.

- `apps/web/app/klipse-ds/tokens.css` — `--louis-*` 변수. `:root`와 `[data-theme="dark"]`에
  정의되어 klipse-web의 `html[data-theme]` 토글을 그대로 따라간다
- `apps/web/app/klipse-ds/theme.css` — `@theme inline`
- `apps/web/scripts/check-klipse-ds.mjs` — 복사본이 원본과 같은지 검사한다. 원본을 찾지 못하면
  건너뛴다(다른 기계에 DS 저장소가 없다고 빌드를 막을 근거는 없다)

**순서 함정을 실측으로 찾았다.** theme import를 klipse-web의 기존 `@theme inline` 블록 **앞에**
두면 그 블록의 `--color-*: initial`이 DS 색을 통째로 지운다. 빌드 산출물에서
`bg-action-primary`와 `rounded-control`이 생성되지 않고 shadow·spacing·blur만 살아남는 것을
확인하고 뒤로 옮겼다.

이름 충돌은 0건이다(klipse-web 144개 · DS 154개). 기존 화면은 아무것도 바뀌지 않는다.

**원격이 생겼다(2026-08-18, `git@github.com:KlipseAI/louis.git`, private).** 두 파일을 지우고
git dependency로 바꾸는 길이 열렸다 — import 경로 두 줄이다. 다만 private 저장소를 의존성으로
쓰려면 klipse-web의 빌드 환경에 읽기 권한(deploy key 또는 토큰)이 필요하고, 그것은 owner가
정할 일이다. registry publish는 여전히 `DS-GOV-000`이다.

### 2단계 — 새 화면부터 DS 이름으로

1단계로 DS 유틸리티가 생겼지만 **아무도 아직 쓰지 않는다.** Tailwind는 쓰인 것만 만들므로 지금
산출물에는 DS 클래스가 하나도 없다.

- 새로 짓는 화면은 `bg-action-primary` 같은 DS 이름을 쓴다.
- 기존 화면은 그대로 둔다. `--gray-*` 계열을 한 번에 걷어내지 않는다.
- **되돌리기**: 그 화면의 클래스만 되돌리면 된다.

klipse-web의 `check-tailwind-theme.mjs`가 여전히 `globals.css`를 입력으로 쓰는 것은 그대로 둔다.
그 블록은 `--gray-*` 계열을 담당하고 DS 블록은 별개이므로 서로 간섭하지 않는다.

### 3단계 — 값 정합 (화면이 바뀐다)

DS와 제품의 값이 다른 축은 [`product.measured.json`](product.measured.json)에 143건이 판정돼 있다.
그중 DS가 제품 값을 채택한 42건은 이미 같고, **의도적 편차 49건이 화면을 바꾼다.** 대표적인 것.

| 축 | 제품 | DS | 화면 영향 |
| --- | --- | --- | --- |
| 테두리 두께 | 1px (147곳) | 0.5px | 전 화면의 경계선이 얇아진다 |
| 글래스 섀도우 | `--glass-*` 80파일 | 개념 없음 | 메뉴·모달·버튼의 재질감이 사라진다 |
| 버튼 disabled | opacity만 | 전용 전경 토큰 | 비활성 라벨이 읽히게 된다 |
| focus ring | 없음 | 2px outline | 키보드 포커스가 보이게 된다 |
| 메뉴 항목 높이 | 37px | 44px | 메뉴가 길어진다 |

**한 번에 하지 않는다.** 화면 단위로 끊고 각 단계에서 실제 화면을 대조한다.

### 4단계 — 컴포넌트 채택

`@klipse-design/react`의 Button·IconButton·Tooltip·Toast·Menu·Dialog로 제품의 ad-hoc 구현을
바꾼다. 제품에는 컴포넌트마다 손수 만든 정의가 9~20벌 있다
([`component-parity.md`](component-parity.md)).

이 단계는 `DS-P5-002`부터의 adoption 트랙이 소유한다.

## 되돌리기

2단계까지는 입력 경로 한 줄이다. 3단계부터는 화면이 바뀌므로 화면 단위 커밋으로 끊어 되돌릴 수
있게 한다.

## 아직 판정하지 않은 것

- **글래스 섀도우를 제품에서도 없앨 것인가.** DS는 없앴다. 제품은 80파일에서 쓴다. 제품의
  `--glass-dropdown-frame`은 최근 오히려 5겹으로 정교해졌다 — 두 방향이 반대다.
- **`--spacing: 2px` 격자.** 제품의 Tailwind는 `p-4`가 8px이다. DS의 `theme.css`는 이름 있는
  spacing 토큰만 내보내므로 충돌하지 않지만, 두 체계가 한 화면에 섞이면 읽는 사람이 헷갈린다.
- **preflight.** 제품은 기존 CSS Modules 때문에 일부러 뺐다. DS의 `reset.css`는 opt-in이라
  강요하지 않지만, 언제 켤지는 CSS Modules 제거 진척에 달려 있다.

## Tailwind theme의 불러오기 순서 (2026-08-18 실측)

`DS-D-0020`의 근거 기록이다. 규범 문서는 제품 저장소 경로를 직접 참조할 수 없으므로 위치는
여기가 갖는다.

제품의 `apps/web/app/tailwind.css`가 `@theme inline` 안에서 네 namespace를 지운다 —
`--color-*: initial`(41행) · `--radius-*: initial`(169행) · `--text-*: initial`(185행) ·
`--font-*: initial`(217행). Tailwind 기본 팔레트를 버리고 실측값으로 다시 세우기 위한 선언이다.

제품이 실제로 쓰는 **Tailwind 4.3.3**으로 두 순서를 컴파일했다.

| 유틸리티 | DS → 제품 | 제품 → DS |
| --- | --- | --- |
| `bg-action-primary` | **생성 안 됨** | 생성됨 |
| `text-foreground-primary` | **생성 안 됨** | 생성됨 |
| `rounded-card` | **생성 안 됨** | 생성됨 |
| `rounded-control` | **생성 안 됨** | 생성됨 |
| `p-3` · `gap-3` (대조군) | 생성됨 | 생성됨 |

**빌드는 성공한다.** 오류 없이 `bg-action-primary`가 아무것도 하지 않는 클래스가 된다. 대조군이
양쪽에서 살아 있으므로 빌드 실패가 아니라 정확히 reset 범위의 문제다.

그래서 채택 단계에서 `@klipse-design/css/theme.css`는 **제품의 Tailwind 진입 CSS 뒤에** 온다.
`scripts/verify-tailwind-interop.mjs`가 매 `pnpm verify`에서 확인하며, 제품 저장소가 없는 hosted
CI에서는 건너뛴다.

### 함께 확인된 것 — 이름 충돌은 없다

DS `theme.css`의 변수 183개와 제품 `tailwind.css`의 144개를 이름으로 대조하니 **겹치는 것이 0개**다.
DS는 `--spacing-<이름>`(예: `--spacing-control-md`)을 쓰고 제품의 격자 곱수는 `--spacing`이라
서로 건드리지 않는다. **간격이 두 배로 틀어질 위험은 없다** — 재기 전에는 그럴 줄 알았다.
