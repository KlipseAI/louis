---
id: bare-button
status: experimental
authority: normative
summary: button 의 UA 면을 걷어내되 글꼴은 건드리지 않는 초기화 클래스와, 그 위에 서는 목록 행 제목입니다.
---

# Bare Button

`<button>` 의 UA 면(배경 · 테두리 · 여백 · 가운데 정렬)을 걷어내는 **초기화 클래스**와, 그 위에서 눌러 편집을 여는 목록
행의 **제목 글자** 하나. **글꼴을 건드리지 않는 것이 계약이다.**

LOUIS 레시피는 `packages/css/src/component/bare-button.css`(2026-10-07)다. React 표면은 없다.

## 왜 있는가 — 층 순서 사고

제품 목록 행 제목이 같은 상수를 **네 파일에 복제**했다(`BannerManagement.tsx@b57cd1f95:128` · `ModelManagement.tsx@b57cd1f95:75` ·
`TemplateManagement.tsx@54b62a8a:158` · `CaptionTemplateManagement.tsx:81`, `feat/admin-ops-review` @ce9af3491).
`block max-w-full p-0 m-0 border-0 bg-transparent text-left cursor-pointer rounded-4` 에 `[font:inherit]` 속기가 함께
있었고, 그 임의 속성이 **유틸리티 층**에서 `type-body-14-medium` 을 이겨 목록 행 제목이 14px 500 이 아니라 부모의
16px 400 이 됐다. 문의 · 블로그는 14px 600 인데 배너 · 모델 카드 · 리소스 템플릿은 16px 400 이었다 — 같은 목록 제목이
화면마다 갈렸다. `font` 속기가 크기 · 굵기 · 행간 · 글꼴 족을 한꺼번에 쥐기 때문이다.

그래서 초기화 클래스는 **면과 여백만 지우고 글꼴과 색을 건드리지 않는다.** 행 제목 클래스는 그 위에 14 medium
`fg-primary` 를 **자기 자신이** 갖는다 — type 클래스를 함께 붙이지 않는다(둘이 층 순서로 다시 다툰다).

## Availability

| Surface       | 상태           | 근거                                                                                  |
| ------------- | -------------- | ------------------------------------------------------------------------------------- |
| Web           | `not-ready`    | `packages/css/src/component/bare-button.css` 레시피는 있다. 제품 네 파일은 아직 자기 상수로 그린다 — 소비 증거도 브라우저 시험도 없다 |
| Figma         | `done`      | component set `BareButton`(DS · Components 「1 · 액션」, 2026-10-08, 2 변형). 되읽기 등재 + parity 계약(축 · 여백 · 반경 · 글자 크기 두 칸)이 있다. 기록이 브라우저 실측이 아니라 레시피 선언이고(verify-recipe-record 가 맞댄다) React 표면이 없어 되재는 브라우저 시험이 없으므로 DS-D-0035 (c) 를 채우지 못해 `done` 이 아니다 — 2026-10-14 되재기 시험 `bare-button-geometry.browser.test.tsx` 로 done(DS-D-0035) |
| Documentation | `partial`      | 이 문서 — States · Content · Acceptance tests 절이 아직 없다 |
| Maturity      | `experimental` | 소비처가 이 클래스를 물면 승격을 다시 판정한다                                        |

## API

```html
<!-- 행 제목 — 14 medium fg-primary 를 이 클래스가 갖는다 -->
<button type="button" class="louis-row-title" onclick="…">배너 이름</button>

<!-- 초기화만 — 글꼴과 색은 소비처가 정한다 -->
<button type="button" class="louis-bare-button type-caption-12-regular">더 보기</button>
```

| 클래스 | 갖는 것 | 갖지 않는 것 |
| --- | --- | --- |
| `.louis-bare-button` | 여백 0 · 테두리 0 · 투명 면 · `text-align: start` · `cursor: pointer` | **글꼴 · 색** |
| `.louis-row-title` | 위 전부 + `display: block` · `max-inline-size: 100%` · 반경 4 · body-sm-medium · `fg-primary` | |

## Specification

| 부분 | 값 | 토큰 / 근거 |
| --- | --- | --- |
| 타이포 | 14/1.5, 500 | `typography-body-sm-medium` — 커밋 ce9af3491 이 일곱 목록을 맞춘 값 |
| 잉크 | `fg-primary` | 블로그는 라이트에서 순검정, 배너 · 템플릿은 다크에서 88% 흰색이던 것을 맞춘다 |
| 반경 | 4 | **리터럴** — 반경 계단에 4 의 이름이 없다(`radius-table-header` 는 표 머리의 값). 고대비 링을 위한 모양 |

## Figma

component set `BareButton`(2026-10-08, DS · Components 「1 · 액션」 TextLink 아래). 축 하나가 CSS 클래스 둘을 같은 철자로 옮긴다.

| 축 | 값 | 코드 |
| --- | --- | --- |
| `Layout` | `base` · `row-title` | `.louis-bare-button` · `.louis-row-title` |

- 2 변형이다. 둘 다 면 · 테두리 · 여백 0 의 `Label` 한 줄이고 잉크는 `fg-primary` 다.
- `base` 는 반경 0, 텍스트 스타일 `typography/body-sm-regular` 다. **레시피가 글꼴과 색을 쥐지 않으므로** 이 둘은 대표값이다 —
  인스턴스의 텍스트 스타일과 잉크를 소비처의 type 클래스 · 그 자리 잉크로 바꾼다.
- `row-title` 은 반경 4(리터럴), 텍스트 스타일 `typography/body-sm-medium` 이다 — 이 클래스 자신이 갖는 값이다. 코드에서는
  `display: block` 이라 행 폭을 채우므로 인스턴스를 행에 넣을 때 가로를 채움으로 둔다.
- **상태 축이 없다.** 레시피에 호버 · 비활성 선언이 없고(`disabled` 의 커서도 pointer), Focus 는 그리지 않는다(DS-D-0074).
  반경 4 는 강제 색에서 되살아나는 링의 모양이라 평소에는 보이지 않는다.
- TEXT 속성 `Label` 이 글자를 바꾼다.

## Accessibility

- 포커스 링을 그리지 않는다(DS-D-0074). 제품 `louis-focus-ring rounded-4` 의 링은 base.css 가 걷었다.
- `disabled` 의 커서는 제품과 같이 pointer 로 둔다 — 비활성 표시를 이 클래스가 그리지 않는다.

## Known deviations

- **`CaptionTemplateManagement` 의 제목은 이 클래스로 못 옮긴다(판정 필요).** 그 파일은 `text-inherit [font:inherit]` 로 부모
  글꼴을 물려받는다(`truncate`). 부모 글꼴이 이 클래스의 14 medium 과 같은지가 소비처마다 다르다 — 같으면 `row-title`,
  다르면 `bare-button` + 소비처 type 클래스다.
- **`.louis-bare-button` 의 소비처가 없다.** 지금 올라온 소비는 행 제목 넷뿐이다 — 초기화만 필요한 자리(`AmbassadorManagement`
  의 `LINK_TITLE` 이 `text-inherit [font:inherit]` 로 같은 사고를 부른다)가 이 클래스의 두 번째 소비처 후보다.
- **브라우저 시험이 없다.**

## 출처

2026-10-07, 제품 `feat/admin-ops-review` `BannerManagement.tsx@0b25d15a3:128` · `ModelManagement.tsx@0b25d15a3:75` · `TemplateManagement.tsx@54b62a8a:158` ·
`CaptionTemplateManagement.tsx:81` @ce9af3491(커밋 본문 「행 제목이 … 16px 400 이었다」),
`feat/ambassador-links` `AmbassadorManagement.tsx@2ceec4ed3:93` @7273a964e.
