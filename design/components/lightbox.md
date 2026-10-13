---
id: lightbox
status: experimental
authority: normative
summary: 썸네일을 눌러 그림 하나를 화면 가운데 크게 봅니다. 썸네일 자리에서 자라며 열리고, 닫으면 돌아갑니다.
---

# Lightbox

그림 하나를 크게 보는 모달 창이다(`.louis-lightbox`, [DS-D-0086](../governance/decisions/DS-D-0086-lightbox.md)). 면 · 제목 · 푸터가 없고
그림 자체가 창이다. 무엇을 **편집**하는 큰 창이면 [Dialog](dialog.md) `media-workbench` 이고, 작은 썸네일 칸 자체는 [Media Slot](media-slot.md)이다.
제품 정본은 만들기 화면의 `components/scenes/create/ImageLightbox.tsx:12-57` 과 `components/scenes/create/useCreateSceneUi.ts:57-110` 이고,
크리에이티브 미디어의 둘째 사본 `components/creative-media/CreativeMediaClient.tsx:1039-1060` 을 같은 부품으로 접는다(통합 판 `54b62a8aa`).

```html
<div class="louis-lightbox" role="dialog" aria-modal="true" aria-label="이미지 크게 보기"
     data-louis-state="open"
     style="--louis-lightbox-ratio: 1.5; --louis-lightbox-from-x: -412px; --louis-lightbox-from-y: 180px; --louis-lightbox-from-scale: 0.18">
  <div class="louis-lightbox__scrim" aria-hidden="true"></div>
  <div class="louis-lightbox__frame">
    <img class="louis-lightbox__media" src="…" alt="참조 이미지 2" draggable="false">
    <div class="louis-lightbox__actions">
      <button type="button" class="louis-lightbox__action" aria-label="참조 이미지 2 삭제">
        <svg aria-hidden="true">…trash-simple…</svg>
      </button>
      <button type="button" class="louis-lightbox__action" aria-label="닫기">
        <svg aria-hidden="true">…x…</svg>
      </button>
    </div>
  </div>
</div>
```

## Anatomy

| 부분 | 값 |
| --- | --- |
| 루트 `.louis-lightbox` | 화면을 덮는 모달 · `fixed inset 0` · 층 `layer-modal` · 가운데 정렬 grid · 잉크 `media-foreground-dark` |
| 스크림 `__scrim` | 두 테마 같은 `media-scrim-dark` 88%. 누르면 닫힌다. 보조기술에는 감춘다 |
| 창 `__frame` | 그림 비율 상자 — 가로 `min(640, 90vw, 80dvh × 비율)`, 세로는 비율이 낸다. 반경 16(`radius-overlay`) · 내용 자르기 |
| 그림 `__media` | 창을 채우는 `contain` · 끌기 막음 |
| 액션 묶음 `__actions` | 창 안 오른쪽 위 10 · 사이 8(`space-control-sm`) |
| 액션 `__action` | 36 원 · 면 `media-scrim-dark` 56%(호버 80%) · 흐림 `blur-surface` 10 · 글리프 20(`icon-size-md`) |

**사진 위라 테마를 따르지 않는다.** 스크림과 액션은 [Media Slot](media-slot.md) 의 지우기 버튼과 같은 media 색이다. 라이트 화면에서도
어두운 막이 그림을 떼어 낸다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/lightbox.css`. React 표면은 없다 — 소비처가 클래스와 마크업 계약을 문다(DS-D-0086 판단 10) |
| Figma         | `partial`      | 2026-10-13 — `LightboxAction` 세트(State Default · Hover, INSTANCE_SWAP Icon — 닫기 `icon/x` · 삭제 `icon/trash-simple`, Default 에 ON_HOVER)와 `Lightbox` 단일 컴포넌트(1440 × 900 보드 · 비율 1 그림 자리표시). 스크림 · 액션 면의 알파는 `color/static-pure-black-alpha/88` · `/56` · `/80` 이 갖는다 — 웹 `media-scrim-dark` 와 같은 순검정이고, 색 변수에 묶은 칠의 불투명도는 Figma 가 1 로 되돌린다. 기록 `lightbox-action` · `lightbox` 와 parity 기하 계약, 실브라우저 되재기(`lightbox-geometry.browser.test.tsx`). 제품 렌더 대조는 없다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 종류 | 기본값 | 뜻 |
| --- | --- | --- | --- |
| `--louis-lightbox-ratio` | 수 > 0 | `1` | 그림 가로 ÷ 세로(`naturalWidth / naturalHeight`). 창 비율 · 크기를 정한다 |
| `--louis-lightbox-from-x` · `--louis-lightbox-from-y` | 길이(px) | `0px` | 썸네일 중심 − 창 중심. 열기 직전 · 닫는 동안에만 창에 걸린다 |
| `--louis-lightbox-from-scale` | 수 0~1 | `1` | 썸네일을 덮는 균일 배율 `max(썸네일 폭 ÷ 창 폭, 썸네일 높이 ÷ 창 높이)` |
| `data-louis-state` | `opening` · `open` · `closing` · `closed` | — | 수명(overlay 어휘) |

변수 넷은 루트의 인라인 style 로 준다. 기본값은 「원본 없음」의 그림이다 — 변수를 주지 않으면 제자리에서 페이드만 한다. 변형 축은 없다.

## 기하는 소비처가 준다

썸네일이 화면 어디 있는지와 그림의 비율은 열 때마다 다르고 CSS 가 알 수 없다 — 그 결과만 변수로 받는다. 창의 최종 크기는 비율만 알면 CSS 가
풀 수 있으므로 레시피가 갖는다(제품이 JS 로 셈하던 `components/scenes/create/useCreateSceneUi.ts:66-75` 와 같은 결과).

1. **열기.** `data-louis-state="opening"` 으로 그린다(base 가 `visibility: hidden` 으로 감춘다). 이때 from 변수는 아직 비어 있어 창이 최종
   자리에 있으므로 창의 `getBoundingClientRect()` 가 곧 목표 상자다. 썸네일 상자와 비교해 from 넷을 달고, 다음 프레임에 `open` 으로 바꾼다
   (제품의 이중 `requestAnimationFrame` 과 같은 자리).
2. **닫기.** 썸네일 상자를 **다시 재서** from 을 고친 뒤 `closing` 으로 바꾼다 — 그사이 목록이 굴렀을 수 있다. 썸네일이 사라졌으면(지운 직후)
   from 을 비운다 — 제자리 페이드. 루트의 계산된 `transition-duration` 이 지나면 `closed` 로 내린다(`readExitDuration`, DS-D-0011 결정 3).
3. **모달 행동.** 아래 Accessibility. LOUIS overlay 프리미티브로 띄우면 가둠 · inert · 스크롤 잠금을 그쪽이 진다. 그때 루트에
   `louis-overlay-panel` 이 함께 붙고, 레시피가 그 anchored 전용 상한 · 스크롤 · 열림 scale 0.96 을 되돌린다.

## States

| 상태 | 무엇이 보이나 |
| --- | --- |
| opening | 감춤(visibility) · 투명 · 창은 썸네일 자리(from 변수) |
| open | 스크림 · 창 제자리. 열림 320ms(`motion-modal-enter`) |
| closing | 투명으로 · 창이 썸네일 자리로. 200ms(`motion-modal-exit`), 포인터를 막지 않는다 |
| closed | `display: none` |
| 액션 hover | 면 56 → 80% — 호버 기기에서만 |
| 액션 active | `scale: 0.97` |
| 줄인 모션 | 창 이동 없음 · 시간 0 |

## Content

- 그림 하나다. 여러 장을 넘기는 갤러리 · 확대 · 이동 · 캡션은 이 부품이 아니다.
- 액션은 둘 이하를 권한다 — 닫기는 늘 있고 모서리(마지막)에 선다. 파괴적 액션(삭제)은 앞에 둔다.
- 파괴적 액션을 두면 되돌리기 토스트나 확인은 소비처가 붙인다. 레시피는 행동을 소유하지 않는다(DS-D-0086 판단 9).
- 액션 이름은 무엇을 하는지와 무엇에 하는지(「참조 이미지 2 삭제」). 그림 `alt` 는 원본 썸네일의 이름이다.

## Accessibility

[Dialog](dialog.md) 의 modal 계약(역할 · 포커스 · Escape · 스크롤 표의 「Modal Dialog」 열)을 그대로 따른다.

| 자리 | 계약 |
| --- | --- |
| 루트 | `role="dialog"` · `aria-modal="true"` · 이름(`aria-label`, 또는 숨긴 제목을 `aria-labelledby`) |
| 배경 | inert · 스크롤 주인은 잠근다(`data-louis-scroll-locked="true"`) |
| 초기 포커스 | **닫기** — 가장 안전한 액션(Dialog `danger-confirm` 과 같은 판단). Tab 은 액션 사이에서 돈다 |
| Escape | 닫는다. 닫히면 포커스는 **연 썸네일**로 돌아간다 |
| 스크림 | `aria-hidden="true"` · 포커스 받지 않음. 포인터 전용 닫기다 — 키보드는 Esc · 닫기. 창 안 클릭은 닫지 않는다(스크림이 형제라 전파 막기가 필요 없다) |
| 액션 | `<button type="button">` · 이름 필수 · 글리프는 `aria-hidden` |

- 포커스 링은 전역 규칙이 소유한다([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)). 강제 색에서는 액션 원 · 창에 실선 경계가 선다.
- 줄인 모션에서 창은 제자리에서 나타난다.
- 대비(실브라우저 실측 — 액션은 그림 위에 서므로 순백 그림이 최악 바닥이다): 액션 글리프 56% 면 위 4.73 · 80% 면 위 12.10(두 테마 같다).
  액션 원 대 순백 그림 4.94. 순백 그림 대 스크림(밝은 화면 위 합성) 16.56. 제품 라이트의 흰 72% 스크림은 같은 자리가 1.00 이었다.

## Acceptance tests

`packages/react/test/lightbox.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다 — 창 크기(비율 1 · 1.5 · 0.5 가 640 · 90vw ·
80dvh 안에서 비율을 지킨다), 액션 36 · 묶음 안쪽 10 · 사이 8 · 글리프 20 · 창 반경 16, 루트 층이 `layer-modal`, opening 의 창 `translate` ·
`scale` 이 from 변수와 같고 open 에서 풀린다, closing 의 `transition-duration` 이 modal-exit 이고 줄인 모션에서 0 · 창 이동 없음,
`louis-overlay-panel` 을 함께 단 루트의 opening `scale` 1 · `overflow` hidden, 두 테마 같은 스크림 · 액션 색과 순백 그림 위 글리프 대비.

## Known deviations

1. **열림 시간이 제품 280ms 와 다르다** — modal 토큰(열림 320 · 닫힘 200)을 읽는다(DS-D-0086 판단 3).
2. **썸네일이 `cover` 로 잘린 칸이면 시작 프레임의 그림이 칸과 약간 다르다** — 균일 배율이라 잘림을 흉내 내지 않는다. 시작 프레임은 투명에서
   페이드되어 드러나지 않는다.
3. **작은 값을 사다리로 접었다.** 글리프 18 → 20(`icon-size-md`), 전환 180ms → 160ms(`motion-control-hover`). 사다리에 이름이 없는 액션 36 ·
   묶음 안쪽 10 · 창 상한 640 · 90vw · 80dvh 는 제품 값 그대로 출처 주석과 함께 둔다.

## 제품에서 발견한 것

- 라이트에서 스크림 · 액션이 흰색으로 뒤집힌다 — 테마 램프 `--gray-1000-rgb` 를 물었다(`components/scenes/create/ImageLightbox.tsx:14` · `:48`).
  고쳐 올렸다(두 테마 media 색).
- 레이아웃 속성 넷(`top · left · width · height`)을 전이한다(`components/scenes/create/ImageLightbox.tsx:25-26`) — FLIP 으로 바꿨다.
  `backdrop-filter` · `border-radius` 전이는 값이 바뀌지 않아 죽어 있다.
- 숫자 층 `z-[1400]`(`components/scenes/create/ImageLightbox.tsx:13`) · `z-[100]`(`components/creative-media/CreativeMediaClient.tsx:1041`) — 두 사본이 다른 층이다.
- 모달 의미 · Esc · 포커스 이동 · 복귀가 없다. 둘째 사본은 `role` 만 있고 이름이 없다(`components/creative-media/CreativeMediaClient.tsx:1043-1044`).
- 그림 `alt` 가 영어 고정 「Enlarged preview」(`components/scenes/create/ImageLightbox.tsx:103`)이고 둘째 사본은 빈 `alt` 다. 액션 이름도 영어 고정이다.
- 삭제가 확인 · 되돌리기 없이 즉시 일어난다.
- 닫힘 타이머 280 이 CSS 와 따로 산다(`components/scenes/create/useCreateSceneUi.ts:109`).
- 둘째 사본의 닫기 이름이 「뒤로」이고 글리프가 글자 `✕` 이며, 흰 12% 원의 경계가 스크림 위에서 1.43 이라 원이 보이지 않는다
  (`components/creative-media/CreativeMediaClient.tsx:1052-1059`). 같은 부품으로 접으며 창 안 액션이 된다.
- 호버가 `@media (hover: hover)` 밖이라 터치에서 탭 뒤 진한 면이 남는다(`components/scenes/create/ImageLightbox.tsx:52`).
