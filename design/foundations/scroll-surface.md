---
id: foundation-scroll-surface
status: experimental
authority: normative
---

# Scroll Surface

스크롤 막대는 **표면의 일부**다. 제품은 `html`·`body`의 막대를 숨기고, 그 밖의 **모든** 스크롤
영역에 같은 커스텀 막대를 깐다. 카드 안 레일·드롭다운 목록·커맨드 팔레트가 전부 이것을 쓰므로,
이 계약을 모르고 조립하면 브라우저 기본 막대가 그려지고 페이지에는 없어야 할 막대가 생긴다.

이 파운데이션은 **막대의 형태와 톤**만 소유한다. 무엇이 스크롤하는가(스크롤 루트의 배치)는
App Shell 패턴이 소유한다.

## Source and artifacts

| 구분 | 계약 경로 | 현재 상태 |
| --- | --- | --- |
| 제품 정본 | `globals.css`의 전역 `*` 규칙 | 제품 소유 |
| DTCG source | 아직 없음 | **미승격** |
| CSS | 아직 없음 | **미승격** |

**아직 토큰이 없다.** 값을 아래에 적어 두는 것은 승격 전까지 지어내지 않게 하기 위해서다.

## Scroll bar model

두 갈래뿐이다.

| 대상 | 규칙 |
| --- | --- |
| `html` · `body` | **숨긴다.** `scrollbar-width: none` · `-ms-overflow-style: none` · `::-webkit-scrollbar { width: 0; height: 0; display: none }` |
| 그 밖의 모든 스크롤 영역 | 아래 커스텀 막대 |

**페이지 자체에는 스크롤 막대가 보이지 않는다.** 화면 가장자리에 막대를 그리면 틀린다.

## Specification

배포본 실측(`globals.css`). 값은 제품이 소유하며 DS 토큰이 아직 없다.

| 축 | 값 |
| --- | --- |
| 트랙 두께 | `--scrollbar-size` = **10px** (가로·세로 동일) |
| 트랙 면 | `transparent` |
| thumb 곡률 | `999px` |
| thumb 테두리 | `2px solid transparent` + `background-clip: padding-box` |
| **보이는 thumb 폭** | **6px** — 10px 트랙에서 투명 테두리 2px씩이 깎인다 |
| thumb 면 (다크) | `rgb(var(--palette-gray-000-rgb) / 26%)` · hover **42%** |
| thumb 면 (라이트) | `rgb(0 0 0 / 22%)` · hover **36%** |
| corner | `transparent` |
| Firefox 계열 | `scrollbar-width: thin` · `scrollbar-color: <thumb> transparent` |

**10px으로 그리면 두껍다.** 트랙은 10px이지만 눈에 보이는 알약은 **6px**이다 — 투명 테두리가
`padding-box` 클리핑으로 깎아 낸다. Figma에는 클리핑이 없으므로 **6px 알약을 10px 자리 가운데에**
놓는 것이 실제 렌더와 같다.

**라이트와 다크가 같은 잉크가 아니다.** 다크는 흰 잉크(`palette-gray-000`)의 알파이고 라이트는
**검은 리터럴**(`rgb(0 0 0 / …)`)이다. 라이트에서 흰 잉크를 반전해 쓰면 값이 어긋난다.

## Platform mapping

| 플랫폼 | 표현 |
| --- | --- |
| WebKit · Blink | `::-webkit-scrollbar` 계열 의사 요소 |
| Firefox | `scrollbar-width` · `scrollbar-color` — **두께를 px로 못 준다**(`thin`) |
| Figma | 자동 스크롤바가 없다. 필요하면 6px 알약을 도형으로 그린다 |

**두 엔진의 표현력이 다르다.** Firefox에서는 `thin`만 줄 수 있어 10px 트랙과 정확히 같지 않다.
제품은 이 차이를 그대로 두고 있다.

## Acceptance tests

1. `html`과 `body`에 스크롤 막대가 그려지지 않는다 — 두 엔진 모두.
2. 스크롤 컨테이너의 트랙이 10px이고 보이는 thumb이 6px이다.
3. thumb의 면이 테마에 따라 갈린다 — 다크는 흰 잉크 26%, 라이트는 검정 22%.
4. hover에서 thumb만 진해진다(42% / 36%). 트랙은 변하지 않는다.
5. 스크롤 컨테이너에 별도 막대 스타일이 있으면 그것이 이긴다 — 이 규칙은 기본값이다.

## 승격 조건

- `--scrollbar-size`와 두 thumb 톤을 semantic token으로 세운다. 톤이 테마마다 **다른 잉크**를
  쓰므로 단일 알파 토큰으로는 표현되지 않는다 — 색 토큰 두 개가 필요하다.
- 그 전까지 이 문서의 값은 **제품 인용**이며 DS 계약이 아니다.
