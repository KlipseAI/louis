---
id: caption-thumb
status: experimental
authority: normative
summary: 자막 템플릿 한 벌을 9:16 세로 프레임의 작은 썸네일로 보입니다.
---

# Caption Thumb

자막 템플릿 한 벌을 9:16 세로 프레임에 줄인 썸네일이다 — 레터박스, 원본 비율의 영상 자리, 제목 · 부제목 · 자막 막대 셋(`.louis-caption-thumb`,
[DS-D-0115](../governance/decisions/DS-D-0115-caption-layout-icons-and-thumb.md)). 제품 정본은 하이라이트 숏츠 편집 화면 템플릿 탭의 `TemplateThumb`
(`app/highlight/[projectId]/shorts/[shortId]/page.tsx`, 통합 판 `54b62a8aa`)이다. 같은 탭의 레이아웃 칩 글리프는 부품이 아니라 아이콘
`caption-layout-standard` · `-essay` · `-news` · `-bubble` · `-cinematic` · `-impact` · `-lecture` 다(같은 결정).

```html
<span class="louis-caption-thumb" aria-hidden="true"
      style="--louis-caption-thumb-letterbox: #000; --louis-caption-thumb-video-y: 34.18%; --louis-caption-thumb-video-h: 31.64%">
  <span class="louis-caption-thumb__video"></span>
  <span class="louis-caption-thumb__line" data-role="title" style="--louis-caption-thumb-y: 6%; --louis-caption-thumb-color: #fafafa"></span>
  <span class="louis-caption-thumb__line" data-role="subtitle" style="--louis-caption-thumb-y: 13%; --louis-caption-thumb-color: #ffd400"></span>
  <span class="louis-caption-thumb__line" data-role="caption" data-boxed="true"
        style="--louis-caption-thumb-y: 68%; --louis-caption-thumb-x: 15%; --louis-caption-thumb-w: 70%; --louis-caption-thumb-color: #0088ff"></span>
</span>
```

| 부분 | 값 |
| --- | --- |
| 프레임 | 27 × 48 · 반경 4 · 헤어라인(`hairline-inset`) · 넘침 자름. 면은 레터박스(데이터) |
| 영상 자리 | `caption-thumb-video`(두 테마 `palette-gray-600`) — 위치 · 크기는 원본 비율을 fit 으로 넣은 백분율(데이터) |
| 줄 | 제목 3 · 부제목 2 · 자막 3, 박스 배경이 있으면(`data-boxed`) +2 · 반경 1. 위치 · 폭 · 색(배경 ?? 글자색)은 데이터 |

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/caption-thumb.css` 와 시맨틱 `caption-thumb-video`. React 표면은 없다 — 소비처가 클래스와 지역 변수를 주면 된다 |
| Figma         | `done`        | 2026-10-15 — `CaptionThumb`(시드 템플릿 표본). 프레임 · 줄 높이는 계약, 위치 · 색은 표본이다. 레이아웃 칩은 `DS · Icons` 의 `icon/caption-layout-*` 일곱. 기하 계약 · 실측 기록 · 브라우저 되재기가 섰다(DS-D-0035) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| `--louis-caption-thumb-letterbox` | 색 | 레터박스(템플릿 `letterbox_color`) |
| `--louis-caption-thumb-video-x` · `-y` · `-w` · `-h` | 백분율 | 영상 자리 |
| `__line[data-role]` | `title` · `subtitle` · `caption` | 줄의 높이 계단 |
| `__line[data-boxed="true"]` | — | 박스 배경이 있다 — 높이 +2 |
| `--louis-caption-thumb-x` · `-y` · `-w` · `-color` | 줄 요소에 | 줄의 위치 · 폭 · 색 |

## States

상태가 없다 — 고른 템플릿은 그 행(목록 칸)이 말한다.

## Content

- 장식이다. 템플릿 이름은 행의 글자가 갖는다.

## Accessibility

- `aria-hidden="true"` — 이름은 옆 글자가 준다. 대비를 재지 않는다(콘텐츠 색이고 정보는 글자가 나른다).
- 강제 색에서는 콘텐츠 색이 지워지므로 프레임 경계만 남긴다.

## Acceptance tests

`packages/react/test/caption-thumb.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다 — 프레임 27 × 48 · 반경 4 · 넘침 자름, 영상 자리가 지역 변수대로
서고 두 테마에서 같은 색, 줄 높이 3 · 2 · 3 · 박스 +2, 줄 위치 · 색이 지역 변수를 따른다. `packages/react/test/caption-thumb-geometry.browser.test.tsx` 가 기록
`caption-thumb` 을 되잰다. 아이콘 일곱은 `node scripts/verify-icon-gates.mjs` 가 격자 · 획 · 알파 사다리 · 출처 · 키워드를 지킨다.

## Known deviations

1. **레이아웃 칩 글리프가 24 격자 선 아이콘으로 바뀐다** — 프레임 불투명도 0.24 → 0.4, 막대 0.75 → 1, news 막대 간격을 벌렸다(DS-D-0115 판정 2 · 3).

## 제품에서 발견한 것

- `TemplateThumb` 과 관리자 미리보기(`admin/CaptionTemplateManagement.tsx`)가 영상 자리 fit 계산을 따로 갖는다 — 값은 같다.
