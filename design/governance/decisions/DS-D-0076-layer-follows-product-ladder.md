---
id: decision-layer-follows-product-ladder
status: experimental
authority: normative
---

# DS-D-0076 겹 순서(layer) 값을 제품의 실제 z 사다리에 맞춘다

- Status: accepted (토큰 · 문서 2026-10-07, Figma 변수는 같은 회차)
- Date: 2026-10-07
- Owners: design system maintainer (소유자 결정)
- Affects: `layer-content`, `layer-sticky`, `layer-popover`, `layer-modal`, `layer-critical`,
  `foundation-elevation-layer`, `toast`, `tooltip`, `menu-popover`, `dialog`

## Context

LOUIS layer 는 content 0 · sticky 100 · popover 200 · modal 300 · critical 400 이었다. 제품(klipse-web `origin/dev` 70afc360
와 작업 브랜치 여섯)의 z 값을 전부 모아 역할별 사다리로 정리하자, **LOUIS 의 다섯 값이 모두 제품 앱 셸(사이드바 · 상단 바
1001 · 1002)보다 낮았다.** sticky 머리(5)보다는 위이고 셸 밑인, 쓸 수 없는 띠에 몰려 있었다.

그 결과 LOUIS 층을 쓴 제품 화면이 실제로 셋 깨졌다 — 온보딩 설문 오버레이(`12d1ca0f5`, modal 300 이 셸 1001 밑), 어드민
설정 안내(`d1691eaf1`, 같은 이유), 영상 분석 모달(`7219fe7cb`, modal 칸을 못 쓰고 9999 로). 제품은 그 뒤 LOUIS 층을 피해
숫자를 직접 붙였다 — LOUIS 대화 상자 공통값 10200(여섯 곳), 토스트 1300 · 1400 · 1500 · 2000 · 10200, 레시피의
`.louis-toast-viewport`(critical 400)는 「쓰지 않는다」는 주석과 함께 비켜 갔다.

소유자가 2026-10-07 「LOUIS layer 를 제품 사다리에 맞춘다」를 골랐다.

## Decision

1. **값을 옮긴다. 순서는 그대로다.**

   | 토큰 | 전 | 후 | 제품 사다리에서의 자리 |
   | --- | --- | --- | --- |
   | `layer-content` | 0 | 0 | 바닥 |
   | `layer-sticky` | 100 | 1000 | 본문 섬(≤10) · 캔버스 로컬(≤200) 위, 앱 셸 1001 바로 아래 |
   | `layer-popover` | 200 | 1100 | 제품이 셸 위 드롭다운에 쓰는 값(Gnb 프로필 · 프로젝트, 목록 드롭다운) |
   | `layer-modal` | 300 | 10200 | 제품의 「LOUIS 대화 상자 공통값」. 사고 셋이 모두 이 값으로 고쳐졌다. 옛 모달 루트 9999 위 |
   | `layer-critical` | 400 | 13000 | 모달 10200 · 모달 위 팝오버 10300 · 툴팁 10400 · 전환 메뉴 12000 위 — 「토스트는 모달 위」가 선다 |

2. **순서 변경이 아니므로 `layerOrder` 는 그대로다.** 값 변경은 토큰 diff 정책상 breaking 이고, 이 Decision 이 그 승인이다 —
   기준선(`packages/tokens/baseline/manifest.json`)을 같은 변경 단위에서 옮긴다.
3. **사다리에 칸을 더 열지 않는다.** 제품의 「모달 위 팝오버 10300」 · 툴팁 10400 · 캔버스 노드 띄우기 2000 · 12050 · 전체화면
   영상 99990 · 에디터의 `--vem-z-*` 사다리는 제품 리터럴로 남긴다. LOUIS React 는 모달 안의 팝오버를 부모 층을 물려받는 방식으로
   풀고, CSS 만 쓰는 제품의 그 칸은 이번 결정 밖이다.

## Alternatives

- **제품을 LOUIS 에 맞춘다(셸 · 모달 루트를 300 아래로).** 기각. 소유자가 고르지 않았고, 제품 사다리의 숫자 약 400곳과 에디터
  변수 97곳을 함께 옮겨야 한다.
- **모달 위 팝오버 칸을 새로 연다.** 이번에는 하지 않았다. 칸 하나가 늘면 Figma 변수 · 문서 · 시험이 함께 늘고, 소비처가
  CSS 포털 메뉴 몇 곳뿐이다.

## Consequences

- LOUIS 레시피(`.louis-toast-viewport`, 툴팁, 메뉴, 대화 상자)를 제품이 그대로 써도 앱 셸 위에 선다. 제품이 핀을 이 판으로 올리면
  지금 LOUIS 층을 쓰는 자리(AdminMoreMenu, 템플릿 관리 드래그 고스트, 하이라이트 작업 브랜치의 더보기 메뉴)의 겹이 한꺼번에 바뀐다 —
  핀 상향 때 화면별로 확인한다.
- 9999 모달과 1400 · 1500 어드민 모달을 `layer-modal` 하나로 합치면, 그 안의 확인 창과 포털 메뉴의 순서가 숫자가 아니라 DOM 순서로
  정해진다. 한 번에 옮기지 않고 화면별로 실측하며 옮긴다.
- `critical` 이 제품 커맨드 팔레트(13000)와 같은 값이다 — 둘이 함께 뜨면 DOM 순서가 승패를 정한다.
- 실측표와 근거 목록은 [Elevation and layer](../../foundations/elevation-layer.md) 가 갖는다.
