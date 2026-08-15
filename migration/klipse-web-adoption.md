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

## 단계

### 1단계 — 패키지 연결 (선행)

DS는 아직 registry에 publish되지 않았다. 연결 방법은 셋이고 각각 대가가 다르다.

| 방법 | 장점 | 대가 |
| --- | --- | --- |
| registry publish | 버전 고정, CI에서 동작 | publish 권한이 필요하다 (`DS-GOV-000` blocked) |
| git dependency | 권한 없이 가능, 커밋 고정 | 설치가 느리고 private 저장소 접근 설정이 필요하다 |
| `file:` 경로 | 즉시 가능 | 로컬 경로에 묶여 CI에서 깨진다 |

**판단이 필요한 지점이다.** 아래 단계는 연결 방식과 무관하게 같다.

### 2단계 — 토큰 정본 이관 (되돌리기 쉬움)

`check-tailwind-theme.mjs`의 입력을 `globals.css`에서 `@klipse-design/css/theme.css`로 바꾼다.

- 그 스크립트는 이미 생성 + 검사 구조라 입력만 바뀐다.
- DS의 `theme.css`는 유틸리티 토큰 93개와 변수 전용 16개를 담는다.
- **되돌리기**: 입력 경로를 원래대로 돌리면 끝난다.

이 단계까지는 화면이 바뀌지 않는다 — 같은 값을 다른 곳에서 가져올 뿐이다.

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
