---
id: video-player
status: experimental
authority: normative
summary: 영상을 재생하고, 그 위에서 재생 위치를 잡습니다.
---

# Video Player

영상을 재생하고 그 위에 재생 컨트롤을 얹는다. 진행 바(`MediaScrubber`)는 별도 단위다 —
상호작용을 받는 것이 그것 하나이기 때문이다.

**2026-10-13 에 크롬이 LOUIS 레시피가 됐다**(`.louis-video-player`,
[DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md),
[DS-D-0083](../governance/decisions/DS-D-0083-deck-feedback-triage.md) 2a). 유리 한 면 · 가운데 · 하단 줄 · 진행 막대 · 칩 · 볼륨
패널과 YouTube 미리보기 판(`data-platform="youtube"`)을 한 파일(`packages/css/src/component/video-player.css`)이 갖는다.
행동(자동 숨김 · 소리 저장소 · 키 계약 · 크게 보기 모달 · 캔버스 경계)은 제품 `VideoPlayer` 가 갖고 이 레시피의 클래스를 입는다 —
React 표면은 이번에 옮기지 않았다(DS-D-0084 「video-player 에서 기본값으로 정한 판단」).

**2026-10-07 에 소리 조작이 들어왔다.** 하단 줄에 알약 · **볼륨 칩** · 확대 칩이 나란히 서고, 볼륨
칩 위로 **세로 슬라이더**가 펼쳐진다. 진행 바도 이제 키보드로 조작된다. 근거는 제품 `origin/dev`
`videoPlayerChrome.ts` · `VideoPlayerVolume.tsx`(@70afc360, 커밋 2f45fa321 · ac960d43f)이고
`feat/canvas-mobile-ux`(@3923caf7)의 같은 파일은 dev 와 한 글자도 다르지 않다. 세로 슬라이더는
LOUIS `Slider` 가 아니라 이 컴포넌트의 부품이다 — 아래 「세로 슬라이더는 왜 Slider 가 아닌가」.

**조형이 하나다.** 스킨이 둘 있었고 그중 하나만 여덟 자리 중 일곱에서 쓰였다. 나머지 한
자리(`PublishFlow`)도 같은 조형으로 통합해 **스킨 축을 없앴다** — 두 벌을 유지할 근거가
「예전에 그렇게 만들었다」뿐이었다. YouTube 미리보기 판은 그 두 번째 스킨이 아니다 — 아래 「플랫폼 미리보기」.

**제품에 구현이 하나뿐이고 소비처가 9 파일 12 자리다**(`VideoPlayer.tsx`, 1231줄, 통합 판 `54b62a8aa` — 예전 문서가 적은 834줄 · 그 전
측정 973줄에서 늘었다). 셈은 웹 앱 전체에서 `git grep -n -F "<VideoPlayer" 54b62a8aa` 로 찾은 것에서 재귀 1(크게 보기 모달) · 주석 1 ·
`<VideoPlayerClip[]>` 타입 1 을 뺀 것이다. 갈래를 고를 필요가 없어 치수·색을 그 파일에서 그대로 가져왔다. Badge 가 65벌에서 축을
골라야 했던 상황의 정반대다.

## Availability

| Surface       | 상태           | 근거                                                          |
| ------------- | -------------- | -------------------------------------------------------------- |
| Web           | `partial`      | `packages/css/src/component/video-player.css` 레시피와 실브라우저 시험 `packages/react/test/video-player-recipe.browser.test.tsx`(크롬 기하 · 상태 · 볼륨 · 홀로 선 칩 · YouTube 판 · 대비). **React 표면은 없다** — 행동은 제품 `VideoPlayer` 가 갖고 이 레시피의 클래스를 입는다. 2026-08-30 에 레시피가 없어 `not-ready` 로 내렸던 것을 레시피가 서서 다시 올렸다 |
| Figma         | `partial`      | `MediaScrubber` 2 variant(State, ON_HOVER 프로토타입) · `VideoPlayer` 4 variant(Chrome × Tone) + BOOLEAN 슬롯 3 · INSTANCE_SWAP 1. **볼륨 칩 · 볼륨 패널 · 칩 hover · YouTube 판의 Figma 변형은 아직 없다**(이 문서가 먼저 섰다) |
| Documentation | `done`         | 이 문서                                                        |
| Maturity      | `experimental` | 레시피는 섰고 React 표면과 Figma 의 볼륨 · hover · 플랫폼 변형이 아직이다 |

## When to use

- 생성 결과 영상을 보여 줄 때. 제품의 열두 자리가 전부 그것이다.
- 업로드 전에 「YouTube 에서 이렇게 보인다」를 보일 때 — `data-platform="youtube"`(아래 「플랫폼 미리보기」).
- 쓰지 않는 자리: **재생이 목적이 아닌 썸네일.** 그것은 이미지이고 컨트롤이 필요 없다.

## Anatomy

1. **Video** — 영상 자체.
2. **Center chrome** — 가운데 재생 원형과 좌우 스킵 알약.
3. **Bottom chrome** — 진행 바 알약 → 볼륨 칩 → 확대 칩이 한 줄에 선다(좌우 8, 아래 8, 사이 8).
4. **MediaScrubber** — 트랙·채움·썸. **포인터 이벤트를 이것 하나가 소유한다.**
5. **Volume chip** — 스피커 글리프 버튼 하나. 음소거 토글이다. 확대 칩과 **같은 상수 하나**에서
   나오므로 크기 · 곡률 · 유리 · 눌림 반응이 같다.
6. **Volume panel** — 볼륨 칩 **위로** 펼쳐지는 유리 패널과 그 안의 세로 슬라이더(트랙 · 채움 ·
   썸). 흐름 밖(absolute)이라 펼쳐도 알약과 진행 막대를 밀지 않는다. DOM 차례는 칩 → 패널이다
   (그림 차례는 반대).

### 레시피 클래스

| 부분 | 클래스 · 속성 | 값 |
| --- | --- | --- |
| 루트 | `.louis-video-player` · `data-tone` · `data-chrome` · `data-surface="stage"` · `data-platform` | 부모 곡률 상속 · `isolation: isolate`(층은 칠 순서) · 비율 · 맞춤은 변수 |
| 영상 | `__media` | `object-fit: var(--louis-video-player-fit)`(기본 cover) |
| 가운데 | `__center` · `__play`(58 원) · `__skip`(48 원) | 사이 `clamp(28px, 12%, 52px)` |
| 하단 줄 | `__bottom` · `__bar`(32 · 좌우 12 · 사이 10 · 반경 12) · `__time` | 위 6 · 좌우 8 · 아래 8 · 사이 8 |
| 진행 막대 | `__scrubber`(히트 20) · `__scrubber-track`(3 → 5) · `__scrubber-fill` · `__scrubber-thumb`(12, 펼칠 때만) | `--louis-video-player-progress` 0~100 |
| 칩 | `__chip`(32 · 반경 12) · `__download`(오른쪽 위 10) · `data-standalone="true"` | 유리 28 → hover 40, 눌림 0.94 |
| 볼륨 | `__volume` · `__volume-panel` · `__volume-surface` · `__volume-slider` · `__volume-track` · `__volume-fill` · `__volume-thumb` | `data-open` · `data-intent="hover"`, `--louis-video-player-volume` 0~100 · `-volume-length` 64~112 |
| YouTube 판 | `__scrubber-buffer` · `__controls` · `__controls-start` · `__cluster`(`data-align="end"` · `data-open`) · `__button`(`data-role="play"`) · `__deco` · `__badge` · `__clock` · `__clock-separator` · `__clock-total` · `__level` · `__level-slider` · `__level-fill` · `__level-thumb` | 아래 「플랫폼 미리보기」 |

**마크업 계약(차례가 층이다)** — 영상 → 가운데 → 하단 줄 → 다운로드. 숫자 z-index 가 없다(제품 `z-0 · z-[4] · z-[6]`).

```html
<div class="louis-video-player" data-tone="dark" style="--louis-video-player-progress: 42; --louis-video-player-volume: 80">
  <video class="louis-video-player__media"></video>
  <div class="louis-video-player__center">
    <button type="button" class="louis-video-player__skip" aria-label="10초 뒤로">…</button>
    <button type="button" class="louis-video-player__play" aria-label="재생">…</button>
    <button type="button" class="louis-video-player__skip" aria-label="10초 앞으로">…</button>
  </div>
  <div class="louis-video-player__bottom">
    <div class="louis-video-player__bar">
      <span class="louis-video-player__time">0:07</span>
      <div class="louis-video-player__scrubber" role="slider" tabindex="0" aria-label="재생 위치"
           aria-valuemin="0" aria-valuemax="58" aria-valuenow="25" aria-valuetext="0:25 / 0:58">
        <div class="louis-video-player__scrubber-track"><div class="louis-video-player__scrubber-fill"></div></div>
        <div class="louis-video-player__scrubber-thumb"></div>
      </div>
      <span class="louis-video-player__time">−0:33</span>
    </div>
    <div class="louis-video-player__volume" data-open="false">
      <button type="button" class="louis-video-player__chip" aria-label="음소거">…</button>
      <div class="louis-video-player__volume-panel">
        <div class="louis-video-player__volume-surface">
          <div class="louis-video-player__volume-slider" role="slider" aria-orientation="vertical" tabindex="0" aria-label="볼륨"
               aria-valuemin="0" aria-valuemax="100" aria-valuenow="80" aria-valuetext="80%">
            <div class="louis-video-player__volume-track"><div class="louis-video-player__volume-fill"></div></div>
            <div class="louis-video-player__volume-thumb"></div>
          </div>
        </div>
      </div>
    </div>
    <button type="button" class="louis-video-player__chip" aria-label="크게 보기">…</button>
  </div>
  <button type="button" class="louis-video-player__chip louis-video-player__download" aria-label="다운로드">…</button>
</div>
```

### 유리 — 한 면

재생 · 스킵 · 알약 · 칩 · 볼륨 패널 다섯이 한 면을 쓴다.

| 칸 | 토큰 | 값 |
| --- | --- | --- |
| 면 | `media-control-surface` | `static-black-alpha-28`(`#171b22` 28%) — 제품 dark 틴트 `palette-gray-900` 28% 와 **같다** |
| hover | `media-control-surface-hover` | `static-black-alpha-40` — **틴트를 진하게** 한다. 호버 기기에서만, 재생 · 스킵 · 칩(알약은 hover 가 없다) |
| 헤어라인 | `--louis-hairline-inset` | inset 0.5 |
| 흐림 | `blur-media-control` | 2px — 크롬이 숨으면 0(`data-chrome="hidden"`). 뒤를 지우는 유리(`blur-glass` 16)와 달리 **뒤를 남기는 얕은 흐림**이라는 역할 하나다 |
| 잉크 `dark` | `media-control-foreground` | 흰 88% |
| 잉크 `bright` | `media-control-foreground-bright` | 순검정 88% |

**hover 방향이 카드 · 배너와 반대다.** 카드 더보기 · 배너 화살표의 `media-control-hover`(흰 12%)는 면을 **갈아 끼운다**. 플레이어
알약에는 계속 읽히는 시간 글자가 있어 그렇게 하면 대비가 떨어진다 — 중간 회색 영상(128) 위 실측: 쉼 4.85 · 이 hover 5.77 ·
흰 12% 로 갈아 끼우면 2.78. 이름이 달라(`-surface-hover` 대 `-hover`) 섞이지 않는다.

## Variants

| 축 | 레시피 | 값 | 무엇이 바뀌나 |
| --- | --- | --- | --- |
| `Chrome` | `data-chrome` | `Shown`(속성 없음) · `Hidden`(`hidden`) | 가운데 · 하단 줄의 opacity 와 pointer-events. 유리의 흐림(2 ↔ 0)까지 함께 바뀐다. 다운로드 칩은 숨지 않는다 |
| `Tone` | `data-tone` | `dark`(기본) · `bright` | **글자·아이콘 색만 바뀐다.** 아래 「함정」 참조 |
| — | `data-surface` | `stage` | 검은 판(`media-stage-surface`) 위 contain — 크게 보기 모달 · 하이라이트 합성 미리보기 |
| — | `data-platform` | `youtube` | 업로드 전 YouTube 재현. 아래 「플랫폼 미리보기」 |

`SkipButtons` · `ExpandButton` · `DownloadButton` 은 자식 유무라 BOOLEAN 이다. 축으로 두면
2×2×2×2 = 16 변형이 되는데 그중 실제로 쓰이는 조합은 넷뿐이다.

## Properties

제품 `VideoPlayer` 의 prop 이다. 레시피에서는 각각 자식의 유무 · 속성 · 변수가 된다(오른쪽 칸).

| prop | 값 | 기본 | 뜻 | 레시피 |
| --- | --- | --- | --- | --- |
| `tone` | `dark` \| `bright` | `dark` | **글자·아이콘 색만** 바꾼다(아래 함정) | 루트 `data-tone` |
| `showSeekSkipButtons` | boolean | `false` | 스킵 버튼 두 개. **열두 자리 중 켜는 곳이 적어 기본을 껐다** | `__skip` 두 개의 유무 |
| `onDownload` | 콜백 | 없음 | 우상단 다운로드 버튼. `PublishFlow` 하나만 쓴다 | `__chip __download` 의 유무 |
| `expandPreviewCopy` | `{tooltip, closeLabel}` | 없음 | 확대 버튼과 모달 | 하단 줄 마지막 `__chip` 의 유무, 모달 플레이어는 `data-surface="stage"` |
| `preserveSourceAspect` | boolean | `false` | 원본 비율을 유지한다 | `--louis-video-player-aspect` |
| `clipStartSec` / `clipEndSec` / `clipLoop` | number / boolean | 없음 | 구간 재생. 시각 변화는 없고 진행 바 계산만 바뀐다 | `--louis-video-player-progress` |

레시피의 변수는 소비처가 준다.

| 변수 | 기본 | 뜻 |
| --- | --- | --- |
| `--louis-video-player-progress` | `0` | 재생 위치 0~100 — 채움 폭 · 썸 자리 |
| `--louis-video-player-buffer` | `0` | 받은 분 0~100 — YouTube 판만 그린다 |
| `--louis-video-player-volume` | `0` | 보이는 볼륨 수준 0~100(음소거면 0) — 볼륨 채움 · 썸 |
| `--louis-video-player-volume-length` | `112px` | 펼친 볼륨 패널의 높이 64~112 — 칩 위에 남은 높이를 펼치는 순간 소비처가 잰다 |
| `--louis-video-player-aspect` | `auto` | 비율 — 제품 `--vp-aspect-override` |
| `--louis-video-player-fit` | `cover` | 맞춤 — 무대 판(`data-surface="stage"`)이 contain 으로 바꾼다 |
| `--louis-video-player-touch-hit` | `layout-control-hit-target-minimum`(44) | 거친 포인터의 볼륨 칩 히트 — 캔버스 셸은 배율을 나눈 값으로 덮는다(제품 `--node-touch-hit`) |

**Figma 와 코드의 BOOLEAN 기본값이 같다.** 둘 다 `false` 다 — 처음에는 코드가 `true` 였는데
실제로 켜는 자리가 적어 **코드 쪽을 뒤집었다.** 기본을 켜 두면 대다수 화면에
없는 컨트롤이 생기고, 디자이너도 그 상태로 조립하게 된다.

### 볼륨 칩

**플레이어는 소리 상태를 prop 으로 받지 않는다.** 소리(음소거 · 볼륨)는 탭 안의 모든 플레이어가
**하나를 나눠 쓴다** — 노드 카드에서 음소거하고 크게 보기를 열면 모달 플레이어(재귀 인스턴스)도
음소거로 뜬다. 값은 `localStorage` 에 한 숫자(들리는 수준, 음소거는 0)로 남고 마운트 뒤에 한 번만
되살린다. 한 번도 맞춘 적 없는 방문자의 기본은 **소리 켬 · 볼륨 1** 이다 — 광고로 들어온 첫 방문자가
소리 없는 영상을 보지 않게.

| 입력 | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `videoRef` | `<video>` ref | 필수 | 소리를 쓸 요소. 누른 플레이어는 제스처 처리 **안에서 동기로** 쓰고 다른 인스턴스는 effect 로 따라간다 |
| `blur` | boolean | `true` | 크롬이 보일 때만 유리 blur 를 켠다(0↔2px). 확대 칩과 같은 규칙이다. 레시피에서는 루트 `data-chrome` 하나가 정한다 |
| `onHoldChange` | 콜백 | 없음 | 슬라이더를 붙잡는 동안(호버 · 키보드 포커스 · 드래그) 플레이어가 크롬 자동 숨김을 미룬다. 끄는 동안의 값 변화에는 부르지 않는다 |
| `onInteract` | 콜백 | 없음 | 음소거 클릭 · 슬라이더 키 조작 뒤 자동 숨김을 새로 건다 |

레시피에서 패널의 열림은 `__volume[data-open="true"]`, 호버만으로 연 열림은 거기에 `data-intent="hover"` 를 더한다(한 박자 기다림).
**가용 조건이 거짓이면 패널을 그리지 않는다** — 레시피는 패널이 없을 때 칩만으로 완결된다.

## States

| 상태 | 무엇이 바뀌나 |
| --- | --- |
| 재생 / 일시정지 | 가운데 원형의 글리프만 바뀐다(재생 34 · 일시정지 30). 통합 전 기본 스킨은 `!playing` 일 때만 오버레이를 마운트했는데 그 분기가 사라졌다 |
| 크롬 표시 / 숨김 | `showControls \|\| !playing \|\| 볼륨 붙잡음 \|\| 진행 막대 키보드 포커스`. 레시피에서는 루트 `data-chrome="hidden"` — 가운데 · 하단 줄 opacity 0 · 포인터 없음, 유리 흐림 0. **볼륨 슬라이더를 만지는 동안과 진행 막대에 키보드 포커스가 있는 동안은 재생 중에도 숨지 않는다** — 보이지 않는 막대를 키로 옮기지 않게 |
| 재생 · 스킵 · 칩 hover | 면 28 → 40%(`media-control-surface-hover`, 호버 기기만). 알약은 hover 가 없다 |
| 누름 | 재생 · 스킵 `scale(0.96)`, 칩 `scale(0.94)` |
| 진행 바 펼침 | 히트에 호버(호버 기기) **또는 누름(`:active`, 터치 포함)** — 트랙 3→5px, 썸 `scale(0)→scale(1)` |
| 드래그 | **따로 시각 상태가 없다.** 누르는 동안의 펼침이 그대로다 |
| 볼륨 칩 | 글리프 세 단계 — `muted`(음소거 또는 볼륨 0, 가위표) · `low`(볼륨 0.5 미만, 물결 하나) · `high`(물결 둘). hover 면 28→40%, 누르는 동안 `scale(0.94)` |
| 볼륨 패널 닫힘 | 높이 0. **포인터를 받지 않는다** |
| 볼륨 패널 열림 | 높이 0→64~112. 호버**만으로** 열 때는 컨트롤 호버 한 박자(`motion-control-hover-duration`)를 기다린 뒤 전환한다 — 전체화면 칩으로 가며 볼륨 칩을 스쳐 지나가기만 해서 슬라이더가 영상 위로 튀어 오르지 않게. 키보드 포커스 · 드래그로 열 때와 닫을 때는 기다리지 않는다 |
| 볼륨 슬라이더 | **hover 확장이 없다**(진행 바와 다르다) — 열린 동안 트랙 3 · 썸 12 가 늘 보인다 |

재생 중에는 2.5초 뒤 크롬이 스스로 숨는다(소비처 몫).

## Content

- 버튼 라벨은 전부 `aria-label` 이다 — 화면에 글자가 없다. 시간 표시만 눈에 보이는 텍스트다.
- 시간은 `tabular-nums` 로 그린다. 자릿수가 바뀔 때 폭이 흔들리면 옆의 진행 바가 함께 움직인다.
- 확대 모달의 제목은 시각적으로 숨기고 `aria-labelledby` 로만 쓴다.
- 소리 문구는 화면 언어를 따른다 — 음소거 · 음소거 해제 · 볼륨 · 음소거됨(`ko`: 「음소거」 · 「음소거 해제」 ·
  「볼륨」 · 「음소거됨」). 진행 막대의 이름은 「재생 위치」(`seek`)다. 소리 묶음은 I18n Provider 밖에서
  그려져도 던지지 않고 영문 번들로 떨어진다 — 던지면 소리 묶음만이 아니라 플레이어 전체가 사라졌다.

## Accessibility

- 모든 컨트롤이 `<button>` 이고 `aria-label` 을 갖는다.
- 확대 모달은 `role="dialog"` + `aria-labelledby` 이고, 열릴 때 닫기 버튼으로 포커스를 옮긴다.
- 닫힘 애니메이션(200ms)이 끝난 뒤에 unmount 한다 — 애니메이션 중 포커스가 사라지지 않는다.
- 모션 축소 환경에서 확대 모달의 애니메이션이 0.01ms 로 줄어든다. 레시피의 전환(크롬 표시 · hover · 진행 막대 펼침 · 볼륨 패널)은
  `motion-reduced-duration` 으로 줄어든다.
- **진행 바와 볼륨 슬라이더는 둘 다 `role="slider"` 인 `div` 다**(아래 키보드 계약). 네이티브
  `<input type="range">` 를 쓰는 LOUIS Slider 와 다르다 — 이 둘은 포인터 위치의 비율로 값을 정하고
  트랙 · 채움 · 썸이 알약의 텍스트 색(`currentColor`)을 따르는 맞춤 표면이다. 그래서
  **role · aria 값 · 키 처리를 계약이 직접 갖는다.** 예전 문서가 「진행 바가 키보드로 조작되지 않는다」를 결손으로 적어 두었는데 2026-10-07
  기준으로 해소됐다.
- **포커스 링은 그리지 않는다** — 진행 막대 · 볼륨 슬라이더 · 칩 모두. 전역 규칙([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md))이
  소유하고 강제 색에서만 링이 선다. 제품에도 윤곽 선언이 없다(`VideoPlayer.tsx` · `VideoPlayerVolume.tsx` 에 `outline` 0건). 키보드
  포커스 동안 크롬이 숨지 않는 것이 「어디에 있나」를 보이는 단서다.
- 강제 색(`forced-colors: active`)에서 유리 면은 `ButtonText` 1px 테두리, 채움 · 썸은 `ButtonText` 로 그린다.
- 볼륨 칩과 패널은 **Tab 순서가 칩 → 슬라이더**다. 슬라이더는 칩의 위성이므로 칩보다 먼저 두면
  진행 막대에서 곧장 슬라이더로 건너뛴다.
- 칩의 누름(마우스)은 **포커스를 가져가지 않고** 그 전 포커스도 놓는다 — 누른 칩에 포커스가 남으면
  Space 가 페이지를 스크롤하는 대신 칩에 갇히고, 모달 안에서는 Space 가 모달을 닫았다. 키보드
  Tab 포커스는 그대로 산다. 슬라이더는 반대로 마우스 누름에 포커스를 받는다(누른 뒤 방향키로 다듬는
  표준 슬라이더 동작).
- 대비(중간 회색 영상 128 기준, 실브라우저 실측) — `dark` 시간 글자 4.85 · 칩 hover 5.77. `bright` 는 밝은 영상(200) 위에서 6.44 ·
  hover 5.01 이다.

### 키보드 계약 — 진행 막대

| 요소 | 값 |
| --- | --- |
| `role` | `slider` |
| 이름 | 「재생 위치」 |
| `aria-valuemin` / `aria-valuemax` | `0` / 길이(초, 반올림). 구간 재생이면 구간을 이어 붙인 타임라인 길이 |
| `aria-valuenow` | 지금 위치(초, 반올림) |
| `aria-valuetext` | `m:ss / m:ss`(위치 / 길이) — 숫자 초가 그 자체로 뜻을 갖지 않으므로 늘 준다 |
| 탭 정지 | 탐색할 수 있으면 `tabindex=0`. **길이를 모르면 `-1` + `aria-disabled=true`** 로 탭 정지 지점에서 빠진다 |

| 키 | 동작 |
| --- | --- |
| ← · ↓ | 5초 뒤로 |
| → · ↑ | 5초 앞으로 |
| Home | 처음(0) |
| End | 끝(길이) |
| Alt · Ctrl · Meta 조합 | **처리하지 않는다.** 브라우저 몫(Alt+← 뒤로 가기 등) |

- 위치는 요소의 **지금 시각**에서 계산한다. `currentTime` 상태는 `timeupdate` 로만 갱신돼 늦다.
- PageUp · PageDown 은 **없다.** 볼륨과 다르다(아래).
- 키를 누르면 키보드 포커스로 쳐 크롬을 붙잡고 자동 숨김을 새로 건다.
- 구간 재생에서 멈춘 채 End · 끝 너머 →로 끝에 서도 구간 처음으로 돌아가지 않는다(재생을 누를 때만
  끝에서 되감는다) — 되감으면 End 가 Home 처럼 동작했다.

### 키보드 계약 — 볼륨 슬라이더

| 요소 | 값 |
| --- | --- |
| `role` | `slider` |
| `aria-orientation` | **`vertical`** |
| 이름 | 「볼륨」 |
| `aria-valuemin` / `aria-valuemax` | `0` / `100` |
| `aria-valuenow` | **보이는 수준**의 0~100 정수 — 음소거면 `0` |
| `aria-valuetext` | 음소거면 「음소거됨」, 아니면 `N%`. 음소거의 수준은 0 이지만 해제하면 쥐고 있던 볼륨으로 돌아간다는 뜻을 이 문구가 전한다 |
| 탭 정지 | `tabindex=0` — **패널이 있을 때만**(아래 가용 조건). 닫힌 동안에도 포커스는 받는다 |

| 키 | 동작 |
| --- | --- |
| ← · ↓ | 5%p 내림 |
| → · ↑ | 5%p 올림 |
| PageDown · PageUp | 10%p 내림 · 올림 |
| Home | 0 — **음소거** |
| End | 100 |
| Alt · Ctrl · Meta 조합 | 처리하지 않는다 |

- 0 이 되면 음소거로 두고 **지난 볼륨은 쥔다.** 끄는 동안(드래그)에는 끌기를 **시작할 때** 쥐던
  볼륨을 쥔다 — 지금 값에 거듭 적용하면 1 에서 끌어 내릴 때 마지막 작은 값(0.11)을 쥐고, 그 값은
  음소거를 풀어도 거의 들리지 않는다.
- 음소거를 풀 때 볼륨이 0.1 미만이면 0.5 로 되돌린다.
- 키로 조작하면 키보드 포커스로 친다 — 마우스로 누른 뒤의 포커스도 키를 누르면 `:focus-visible` 이
  된다. 포인터가 떠나도 열린 채 붙잡아, 접힌 슬라이더의 값이 방향키로 바뀌지 않게 한다.
- 열린 채 가용 조건이 거짓이 되면(마우스를 뗌 · 도킹 해제) 슬라이더가 이벤트 없이 사라진다. 그때
  끌기와 포커스 상태를 되읽어 풀어야 한다 — 그렇지 않으면 크롬이 재생 중에도 숨지 않았다.

### 음소거 칩

`<button>` 이고 이름은 소리가 들리면 「음소거」, 아니면 「음소거 해제」(`aria-label` 과 `title` 이 같다).
**모든 기기 · 모든 폭에서 보인다.** 토글한 결과가 들리는 수준이 아니면 글리프가 `muted` 다.


## 함정 — `bright` 는 밝은 유리가 아니다

제품 `PLAYER_TONE_BRIGHT`는 유리 틴트를 `0 0 0`(순검정)으로, `dark`
는 `--palette-gray-900-rgb`(#171B22, 역시 거의 검정)로 지정한다. **두 톤 모두
검정 계열 틴트**이고 tone 이 실제로 뒤집는 것은 글자·아이콘 색(흰 88% ↔ 검정 88%)뿐이다.
레시피는 두 톤 모두 `media-control-surface`(`#171b22`)를 쓴다 — `data-tone` 은 잉크 변수 하나만 바꾼다.

알약이 밝아 **보이는** 것은 뒤의 밝은 영상이 검정 틴트를 통과해 비치는 합성 결과다. Figma 에서
"bright = 밝은 유리" 로 오해해 틴트를 흰색으로 만들면 원본과 달라진다.

## Interaction

- 진행 바의 펼침(트랙 3→5px, 썸 `scale(0)→scale(1)`)은 **바깥 wrapper 하나**(`__scrubber`)가 소유한다.
  트랙·채움·썸에는 리스너가 없고 펼침 스타일도 그 wrapper 의 `:hover` · `:active` 에서 전파된다.
  그래서 Figma 프로토타입도 `MediaScrubber` 에 걸려 있다.
- **호버는 호버 기기에서만 펼친다.** 제품은 가드 없는 `:hover` 라 터치에서 탭 뒤 펼침이 남았다. 레시피는 `@media (hover: hover)` 안에
  두고, 대신 누르는 동안(`:active`)은 어느 기기에서나 펼친다 — 터치로 끄는 동안 썸이 보이게.
- **드래그 전용 시각 상태는 없다.** 제품의 `dragging` state 는 클래스를 바꾸지 않는다 — 누르는 동안의 펼침이 그대로 유지될 뿐이다.
- 진행 바는 포인터뿐 아니라 **키보드로도** 움직인다(위 키보드 계약). 포인터 이벤트의 소유는 여전히
  바깥 wrapper 하나다.
- **볼륨 패널은 늘 칩 위로, 세로로 펼친다.** 알약 안에서 가로로 펼치지 않으므로 가로 폭을 다투지 않는다
  (예전에는 알약 안쪽 폭 280 이상일 때만 슬라이더가 있었고 그 조건은 사라졌다).
  - 길이는 칩 위에 남은 높이(플레이어 루트 기준)에 맞춰 줄인다 — 패널 64~112, 슬라이더 48~96. 그
    최소에도 못 미치는 낮은 루트에서는 위쪽이 루트 가장자리에서 잘리지만 칩 위 남은 만큼은 보인다.
    **칩 아래로 뒤집지 않는다** — 칩은 하단 줄의 마지막 근처라 그 아래는 여백 8 뿐이고 루트가
    `overflow: hidden` 이라 아래로 펼친 패널은 통째로 잘려 아무것도 남지 않았다.
  - 남은 높이는 **펼치는 순간에만** 잰다(`--louis-video-player-volume-length`). 캔버스 배율(노드가 변환 안에 있다)은 칩의 화면 높이를 레이아웃
    높이로 나눠 되찾는다 — 칩 한 변의 리터럴로 적지 않는다. 적으면 칩의 크기를 바꿀 때 조용히 어긋난다.
  - **칩과 패널 사이 틈 8 은 패널의 히트 박스가 덮는다**(`__volume-panel` 의 아래 안쪽 8). 그 틈이 묶음 밖으로 떨어지면 칩에서 슬라이더로
    올라가는 길에 pointerleave 가 나 슬라이더가 닫힌다.
  - 열려 있는 동안(호버 · 키보드 포커스 · 드래그) 플레이어는 크롬 자동 숨김을 미룬다.
  - 값은 포인터의 비율(아래 0 · 위 1)이다. 화면 px 끼리 비교하므로 캔버스 배율과 무관하다.
- **패널의 가용 조건은 둘이 모두 참일 때다.**
  ① `(hover: hover) and (pointer: fine)` — 마우스 · 트랙패드. 터치는 `pointerenter` / `leave` 를 호버로 세지 않는다.
  ② `:volume-locked` 가 아님 — 페이지가 볼륨을 못 바꾸는 기기. WebKit 은 iOS 계열 작은 화면(iPhone,
  그 위의 인앱 WKWebView)에서 기본으로 잠그고 iPad 는 버전에 따라 다르다. **기기 이름이 아니라
  `:volume-locked` 로 판정한다** — UA 문자열이나 「써 보고 되읽기」(되읽기는 한 틱 뒤에 되돌아가 동기 판정이
  틀린다)로 판정하지 않는다. 그 선택자를 모르는 엔진은 잠기지 않은 것으로 본다.
  **휴대폰은 ①만으로도 슬라이더가 없다.** 음소거 칩은 그래도 있고 `muted` 는 잠금과 무관하게 동작한다.
- **캔버스 안(제품)**: 볼륨 묶음에 `nokey`(Backspace · Delete · Space 가 노드로 새지 않게), 슬라이더에
  `nopan`(끌기가 캔버스 팬으로 새지 않게)이 붙는다. **음소거 칩에는 `nopan` 을 달지 않는다** — 무장 전
  노드에서 그 위에서 시작한 한 손가락 팬을 살리려는 것이다. 슬라이더를 캔버스 노드 안에서 **끌었으면**
  놓을 때 포커스를 놓는다(`nokey` 가 캔버스 키를 삼키지 않게). 끌지 않고 누르기만 했으면 둔다 —
  누른 자리에 값을 둔 뒤 방향키로 다듬는 흐름이다.
- 거친 포인터(`pointer: coarse`)에서 **볼륨 칩만** 누름 영역이 화면 44px 로 커진다(`layout-control-hit-target-minimum`,
  캔버스 셸 안에서는 배율을 나눈 파생값 — 레시피 `--louis-video-player-touch-hit`, 제품 `--node-touch-hit`). 칩의 `::before` 라
  `.louis-hit-target` 의 `::after` 와 겹치지 않는다. 확대 칩에는 달지 않는다 — 하단 줄의
  마지막 요소라 44 히트가 줄 오른쪽 여백(8)을 넘겨 가로 넘침이 난다. 볼륨 칩의 히트가 확대 칩 쪽 틈을 이미
  덮으므로 둘 사이에 누를 수 없는 띠는 없다. 이 비대칭은 줄의 여백을 넓혀야 풀리는 문제다.
- 확대 모달은 **별도 컴포넌트가 아니다.** 플레이어가 자기 자신을 재귀 렌더한 것이라
  (`VideoPlayer.tsx:1030-1045`) Figma 에도 크기만 다른 인스턴스로 둔다. 모달 안 플레이어는 무대 판(`data-surface="stage"`)이다.

## Specification

| 축 | 값 |
| --- | ---: |
| 스킵 알약 | 48 × 48, 글리프 22 |
| 가운데 재생 | 58 × 58, 글리프 재생 34 · 일시정지 30 |
| 가운데 사이 | `clamp(28px, 12%, 52px)` — 플레이어 폭의 12% |
| 하단 알약 | 높이 32(`layout-control-height-md`), radius 12(`radius-control`), 좌우 12, gap 10 |
| 시간 | caption regular · 줄 높이 1 · `tabular-nums` |
| 확대 칩 | 32 × 32, radius 12 — 볼륨 칩과 **같은 상수** |
| 하단 줄 | 위 6 · 좌우 8 · 아래 8, 알약 · 칩 사이 gap 8 |
| 볼륨 칩 | 32 × 32, radius 12(`button-radius`), 글리프 16 · stroke 2, 누름 영역은 거친 포인터에서 화면 44 |
| 볼륨 패널 | 폭 32 · radius 12 · 안쪽 위아래 8 · **높이 0 ↔ 64~112**(슬라이더 길이 48~96) · 칩과의 틈 8 — 히트 박스 = 패널 + 아래 8 |
| 볼륨 트랙 | 폭 3(진행 막대의 기본 트랙과 같다), 세로로 선다. 채움은 **아래에서 위로** 찬다 |
| 볼륨 썸 | 12 × 12, `currentColor`, **늘 보인다**(진행 막대 썸은 펼칠 때만 `scale(0→1)`) |
| 볼륨 키 단위 | ←↑→↓ 5%p · PageUp/Down 10%p · 음소거를 풀 때 0.1 미만이면 0.5 |
| 진행 키 단위 | ←↑→↓ 5초 |
| 다운로드 버튼 | 32 × 32 칩, 오른쪽 위 10 |
| 진행 히트영역 | 20 |
| 트랙 | 3 → 펼침 5, radius pill, 레일 `currentColor` 28% |
| 썸 | 12 × 12 |
| 헤어라인 | 유리 알약마다 inset 0.5 |
| 전환 | 크롬 표시 `motion-content-fade` · hover · 눌림 · 진행 막대 `motion-control-hover` · 흐림 `motion-content-rise` · 볼륨 패널 높이 `motion-layout-change` |

## 공용 조각 — 미디어 위 유리 칩

**플레이어 안의 칩 둘(볼륨 · 확대)이 같은 상수 하나**에서 나온다(`videoPlayerChrome.ts:35-44`). 레시피에서는 `.louis-video-player__chip`
하나이고 **플레이어가 소유한다** — 플레이어 밖에서는 `data-standalone="true"` 가 유리 · 잉크 · 흐림 변수를 칩 자신에게 세운다(크롬 표시
여부가 없으니 흐림은 늘 켠다).

| 축 | 값 | 출처 |
| --- | --- | --- |
| 크기 | 32 × 32 | `w-16 h-16` |
| 곡률 | 12 | `button-radius`(알약과 같다) |
| 면 | `media-control-surface` 28%, hover `media-control-surface-hover` 40% | 틴트 `palette-gray-900`(`dark`) 또는 `0 0 0`(`bright`) |
| 헤어라인 | inset 0.5 | `--louis-hairline-inset` |
| 글리프 · 글자 | 틴트의 짝 색 88% | `dark` 는 `palette-gray-000`, `bright` 는 검정 |
| 글리프 크기 | 16 · stroke 2 | |
| blur | 크롬이 보일 때만 2px(0↔2) | `blur-media-control` · 제품 `PILL_BLUR_ON` / `_OFF` |
| 눌림 | `scale(0.94)` | |
| 전환 | transform · background `motion-control-hover`, backdrop-filter `motion-content-rise` | 제품 160ms · 520ms(60ms 지연) |

쓰는 자리(통합 판 `54b62a8aa`).

1. **플레이어 하단 줄** — 볼륨 칩 · 확대 칩. 크롬이 `Hidden` 이면 blur 만 0 으로 풀린다.
2. **홀로 선 확대 칩**(`ExpandPreviewChip` 의 `standalone`) — **정의만 있다.** 호출은 플레이어 안의 하나뿐이다
   (웹 앱에서 `git grep -n ExpandPreviewChip 54b62a8aa` 의 결과는 정의 · 플레이어 안 호출 · 주석 둘).
3. **3D 모델 노드 뷰어 위 조작 칩** — **작업 브랜치에서만** 있다(`feat/3d-model-node-design`, `Model3dNode.tsx@0b75c760d:101-112`
   `GLASS_CHIP` @2dfc8fbab). 통합 판에는 그 파일이 없다. 그 브랜치는 유리 토큰 다섯 줄을 같은 값으로 옮겨 적었다 — 합쳐질 때
   `data-standalone` 칩으로 접는다.

앵커에서 플레이어 밖 소비처가 0 이라 `foundations/spacing-radius.md` 의 「두 개 이상의 사용처」 승격 조건에 못 미친다 — 별개 부품
(`media-chip` 또는 IconButton 의 미디어 위 변형)으로 떼는 것은 밖의 소비처가 둘이 될 때 Decision 으로 정한다.

**LOUIS 토큰과 맞는다.** `media-control-surface`(= `static-black-alpha-28`)는 `dark` 톤의 틴트 `gray-900/28` 과 **정확히 같다**
(`#171b22` 28%). 근사인 쪽은 `bright` 다 — 제품은 순검정 28%, 레시피는 `#171b22` 28%(채널당 최대 9.5/255, Known deviations 1).
칩의 hover 는 `media-control-surface-hover`(40%)이고, 카드 · 배너의 `media-control-hover`(흰 12%)와 **방향이 다른 값**이라 다른 이름이다.

**하이라이트의 크게 보기 버튼은 이 칩으로 접는 것이 기본값이다.** 하이라이트 숏폼 완성 칸 무대 오른쪽 위의 크게 보기
버튼(`studioStageFullscreen`, `highlightSceneStyles.ts:1372-1391`)도 미디어 위에 뜬 아이콘 버튼이다 — 36 × 36 **알약**, 면
`gray-1000/56%`, 글리프 `gray-000` 100%, 틴트 hover 없음, 좁은 화면(≤900)에서만 보인다. 같은 역할이 값 셋만 다르므로
`__chip[data-standalone="true"]`(32 · 12 · 28%)로 접는다(DS-D-0084 기본값 표). 제품이 접기 전까지 그 값은 제품 쪽에 남는다.

## 세로 슬라이더는 왜 Slider 가 아닌가

[`Slider`](slider.md)는 네이티브 `<input type="range">` 이고 **가로만** 있다. 볼륨 슬라이더(세로)와 진행
막대(가로)는 둘 다 같은 부류의 **미디어 크롬 슬라이더**다.

| | LOUIS `Slider` | 미디어 크롬 슬라이더(진행 막대 · 볼륨) |
| --- | --- | --- |
| 요소 | 네이티브 `<input type="range">` | `role="slider"` `div` |
| 색 | `accent-primary` + `stroke-default` | **`currentColor`** — 레일은 `currentColor` 28%, 채움 · 썸은 `currentColor` |
| 레일 | 4 | 3(진행 막대는 펼침에서 5) |
| 썸 | 16/12, 표면색 링 | 12, 링 없음 |
| 포커스 | 그리지 않는다(DS-D-0074) | 같다 — 그리지 않는다(DS-D-0074) |
| 값을 정하는 법 | 브라우저 | 포인터의 화면 비율(+ 키 계약) |

그래서 **`Slider` 에 세로 방향(`data-orientation="vertical"`)을 열지 않았다.** 이유는 셋이다.

- 볼륨 슬라이더는 `Slider` 를 쓰지 않으므로 세로가 열려도 소비처가 **0벌**이다. 제품에 세로 슬라이더는 이
  하나뿐이고, 그것은 위 표의 오른쪽 부류다.
- 열려면 네이티브 range 의 세로 방식(`writing-mode: vertical-lr` + `direction: rtl`, WebKit 과 Gecko 의
  썸 정렬 보정, 키보드 방향의 뒤집힘, `aria-orientation`)을 두 브라우저에서 따로 재야 하는데 지금
  harness 는 Chromium 단독이고 pseudo-element 의 렌더 결과를 게이트가 읽지 못한다(slider.md Known deviations).
  재지 못하는 규칙을 소비처 없이 세우면 「확인했다」는 주장만 남는다.
- 승격 조건은 `foundations/spacing-radius.md` 가 정한 **두 개 이상의 사용처**와 같다 — 인스펙터에서 세로 값 조절이
  필요해지면 그때 `data-orientation="vertical"`(기존 컴포넌트의 `data-size` · `data-variant` 와 같은
  `data-*` 축)을 연다.

세로 슬라이더의 **접근성 계약은 이 문서의 키보드 계약이 갖는다.** 어느 쪽으로 구현되든 `role="slider"` ·
`aria-orientation="vertical"` · ↑ 가 올림 · ↓ 가 내림이어야 한다.

## 플랫폼 미리보기 — `data-platform="youtube"`

업로드 전에 「YouTube 에서 이렇게 보인다」를 보이는 재현이다(업로드 모달의 시청 화면 하나, `YoutubeUploadModal.tsx:104-228`).
우리 플레이어의 두 번째 스킨이 아니다 — 행동(재생 · 진행 · 볼륨 · 전체화면, 키 계약)은 같고 겉모습만 플랫폼을 따른다. 그래서 축 이름이
`platform` 이다 — `Chrome` 은 이미 Figma 와 레시피에서 표시 상태(Shown · Hidden)의 이름이다.

```html
<div class="louis-video-player" data-platform="youtube" style="--louis-video-player-progress: 30; --louis-video-player-buffer: 60; --louis-video-player-volume: 50">
  <video class="louis-video-player__media"></video>
  <div class="louis-video-player__bottom">
    <div class="louis-video-player__scrubber" role="slider" tabindex="0" aria-label="재생 위치" …>
      <div class="louis-video-player__scrubber-track">
        <div class="louis-video-player__scrubber-buffer"></div>
        <div class="louis-video-player__scrubber-fill"></div>
      </div>
      <div class="louis-video-player__scrubber-thumb"></div>
    </div>
    <div class="louis-video-player__controls">
      <div class="louis-video-player__controls-start">
        <button type="button" class="louis-video-player__button" data-role="play" aria-label="재생">…</button>
        <div class="louis-video-player__cluster" data-open="false">
          <button type="button" class="louis-video-player__button" aria-label="음소거">…</button>
          <div class="louis-video-player__level">
            <div class="louis-video-player__level-slider" role="slider" tabindex="0" aria-label="볼륨" …>
              <div class="louis-video-player__level-fill"></div>
              <div class="louis-video-player__level-thumb"></div>
            </div>
          </div>
        </div>
        <div class="louis-video-player__cluster">
          <span class="louis-video-player__clock">0:07<span class="louis-video-player__clock-separator"> / </span><span class="louis-video-player__clock-total">0:58</span></span>
        </div>
      </div>
      <div class="louis-video-player__cluster" data-align="end">
        <span class="louis-video-player__deco" aria-hidden="true">…</span>
        <span class="louis-video-player__deco" aria-hidden="true">…<span class="louis-video-player__badge">HD</span></span>
        <button type="button" class="louis-video-player__button" aria-label="전체화면">…</button>
      </div>
    </div>
  </div>
</div>
```

| 부분 | 값 |
| --- | --- |
| 무대 | 검은 판(`media-stage-surface`) · 반경 12(`radius-card`) · 최대 360(≤719 에서 300) · 영상 contain. 전체화면(`data-fullscreen="true"`) 반경 0 · 높이 제한 없음 |
| 아래 크롬 | 좌우 · 아래 12 · 줄 사이 6 — [진행] 위, [컨트롤 줄 40] 아래 |
| 진행 | 히트 16 · 트랙 4 → 6 · 레일 `platform-youtube-rail` · 받은 분 흰 40% · 재생분 · 점 `platform-youtube-accent` · 점은 늘 보이고 호버 7/6 배 |
| 알약 | 높이 40 · `radius-pill` · `media-control-surface` · `blur-panel`(12). 끝 알약 좌우 6 |
| 버튼 | 40 원 · 글리프 30 · 흰(`media-foreground-dark`) · 0.92 → 호버 1. 재생 버튼은 면 없이 흐림만 |
| 시간 | body-sm medium · 좌우 14, 구분 「 / 」 흰 80% Regular · 길이 Regular |
| 가로 볼륨 | 0 ↔ 62(슬라이더 48 + 왼쪽 6 + 오른쪽 8) · 레일 흰 20% · 채움 · 손잡이 12 흰. 호버 · `data-open`(끌기)에서 펼친다 |
| 장식 | 자동재생 · 자막 · 설정(HD 배지) · 미니플레이어 — **버튼이 아니다**(`__deco`, `aria-hidden`, 포인터 없음, 탭 정지 없음) |

- 진행 막대와 볼륨은 이 문서의 키 계약을 그대로 따른다 — 진행 `aria-valuenow` 는 초, `aria-valuetext` 는 `m:ss / m:ss`.
- 플랫폼 빨강(`platform-youtube-accent` = 원시 `youtube-red` `#ff0033`)은 브랜드 재현 전용이다 — 위험 · 오류에 쓰지 않는다.
- 대비(실브라우저 실측) — 중간 회색 영상 위 시간 글자 5.70 · 구분 「 / 」 4.34(Known deviations 9).

## Known deviations

1. **bright 유리 틴트** — 제품은 순검정 28 · 40%, 레시피는 두 톤 모두 `#171b22` 28 · 40%(`media-control-surface` · `-hover`). 채널당 최대
   9.5/255 차이라 영상 위에서 구별되지 않는다. 문서 「함정」의 요지(tone 은 잉크만 바꾼다)가 더 단순해진다.
2. **스크림 층을 옮기지 않았다** — 제품에서 켜는 분기가 없다(`VideoPlayer.tsx:110-118` 선언, `:1086-1089` 에서 늘 `opacity-0`).
3. **다운로드 버튼을 칩 면으로 접었다** — 제품은 검정 32% · 흰 80% · hover `brightness(125%)` · 눌림 0.95(`VideoPlayer.tsx:213-224`). 레시피는
   하단 줄 칩과 같은 유리 · hover · 눌림이다(보이는 변화).
4. **모션** — 가운데 · 하단 줄 opacity 240ms → `content-fade`(300), 재생 · 스킵 · 칩 140 · 120 · 160ms → `control-hover`(160), 진행 막대
   120ms → `control-hover`, 흐림 520ms + 60ms 지연 → `content-rise`(360, 지연 없음). 모션 토큰 밖 ms 를 새로 들이지 않았다.
5. **아이콘** — `play-fill` · `pause-fill` · `speaker-high` · `speaker-x` · `frame-corners` · `download-simple` 은 라이브러리에 있다. 물결 하나
   (`low`)와 10초 스킵은 없다 — Figma 의 `skip-10s` · `expand` 는 제품 인라인 SVG 패스로 그리고 stroke 를 아이콘 정본 두께(1.5)로
   맞췄다. 제품이 SVG 안에 박아 둔 "10" 숫자는 8px raw 텍스트가 되어 타입 스케일 밖으로 나가므로 **뺐다.**
6. **재생 글리프가 제품과 다르다**(Figma). 제품은 채운 삼각형인데 라이브러리 `icon/play` 는 외곽선이다. 라이브러리
   일관성을 택했다 — 수렴 판단이 필요하다.
7. **진행 막대 펼침이 터치에서 남지 않는다** — 제품은 가드 없는 `:hover` 라 탭 뒤 펼침이 남았다. 레시피는 호버 기기의 `:hover` 와
   누르는 동안의 `:active` 로 펼친다.
8. **YouTube 판** — 장식 버튼 넷을 버튼이 아닌 `__deco`(`aria-hidden`)로 고쳤다(제품은 눌러도 아무 일이 없는 포커스 가능한
   `<button>`, 탭 정지 넷). 두 슬라이더에 플레이어 키 계약을 얹고 진행 값을 초로 고쳤다(제품은 키를 받지 않고 `aria-valuenow` 가
   퍼센트). 레일 `rgb(40 40 40/56%)` 를 `#171b22` 56% 로, 유리 순검정 28% 를 `#171b22` 28% 로 접었다. 좁은 화면(≤719)의 전체화면은
   제품이 300 을 남기던 것을 높이 제한 없음으로 고쳤다. 제품 경계 720 은 LOUIS 표준 경계 719 로 맞췄다.
9. **YouTube 판 구분 「 / 」 대비 4.34** — 흰 80% 라 중간 회색 영상 위에서 4.5 에 못 미친다. 뜻을 갖지 않는 구두점이고 양옆 숫자(5.70)가
   읽히므로 제품 값 그대로 둔다.
10. **볼륨 칩 · 볼륨 패널 · 칩 hover · YouTube 판의 Figma 변형이 없다.** 이 문서가 적는 Figma 변형(`Chrome` × `Tone`)
    과 BOOLEAN 슬롯 목록에 볼륨 칩이 없고 칩 둘 + 패널 구조도 옮겨지지 않았다. 코드가 Figma 보다 앞서 있다.
    패널은 상태(닫힘 · 열림 · 음소거) 셋과 길이(64~112)를 가진다.
11. **볼륨 칩이 `ExpandButton`(BOOLEAN) 옆의 새 슬롯이다.** 제품에서 소리 칩은 늘 있고 끄는 prop 이 없다 —
    Figma 에 올릴 때 BOOLEAN 이 아니라 **고정 자식**이다.
12. **슬라이더의 키보드 · 가용 조건은 Figma 로 표현되지 않는다.** 계약은 이 문서가 갖고, Figma 는 열린 상태의
    모양만 그린다.

## 제품에서 발견한 것

- **스크림이 죽은 레이어다.** `opacity-0` 으로만 선언돼 있고 이를 켜는 분기가 코드에
  없다. Figma 에 `Scrim (opacity 0)` 으로 옮겨 두었고 레시피는 옮기지 않았다 — 제품 (나)에서 지운다.
- **유리 토큰이 한 상수 안에 산다.** `PLAYER_GLASS_TOKENS`(`VideoPlayer.tsx:77-82`)는 내보내지 않는 상수다. 작업 브랜치의 3D 모델 노드가
  다섯 줄을 옮겨 적었다(통합 판에는 없다). 제품이 이 레시피의 클래스를 입으면 닫힌다.
- **dev 와 `feat/canvas-mobile-ux` 의 소리 묶음은 같다.** `videoPlayerChrome.ts` ·
  `VideoPlayerVolume.tsx` · `videoPlayerAudio.ts` 가 두 ref 사이에서 한 글자도 다르지 않다(2026-10-07 대조).
  작업 브랜치에서 갈라진 것은 `VideoPlayer.tsx` 의 재생 · 일시정지 `aria-label` 한 줄(i18n 이전 리터럴 「Play」·
  「Pause」)뿐이고, 이것은 dev 가 `a9dc23ecb` 로 이미 번역을 이었다.
- **소리 저장 키가 `klipse.player.volume` 이다.** dev 의 PR #189 가 쓰던 키를 그대로 이어 받아, 예전 플레이어에서
  맞춘 볼륨이 이 칩에도 이어진다. 되읽는 곳은 마운트 뒤 한 번뿐이라 저장소와 `localStorage` 가 서로 덮어쓰지 않는다.
- **이전 볼륨 슬라이더(알약 안에서 가로로 펼침)는 사라졌다.** 알약 안쪽 폭 280 이상이라는 조건과 함께 걷혔고
  자리는 칩 위의 세로 패널이 이었다.
- **통합 전 기본 스킨의 진행 바가 라이트 테마에서 사라졌다.** 채움·썸이 `var(--gray-000)` 인데 그 램프는
  테마에 따라 뒤집히므로, 라이트에서 검은 영상 위에 검은 진행 바가 됐다. **스킨 통합으로
  그 코드가 사라져 지금은 재현되지 않는다** — 남은 진행 바는 `currentColor` 를 쓴다.
- **소비처가 그리는 틀.** 하이라이트 합성 미리보기(`CompositeSegmentPreview.tsx:53-58`)와 크게 보기 모달(`VideoPlayer.tsx:289-296`)이
  같은 「무대 판」(검정 · 16:9 · contain)을 각자 상수로 든다 — 레시피 `data-surface="stage"` + `--louis-video-player-aspect: 16/9` 로
  모인다. 편집 노드 결과 플레이어(`EditNode.tsx:998-1014`)는 톤과 확대 칩만 쓴다 — 레시피에 더할 것이 없다.

### 제품 (나) — 이 레시피가 서면 제품이 할 일

| 제품 자리 | 할 일 |
| --- | --- |
| `VideoPlayer.tsx` 크롬 상수 · `videoPlayerChrome.ts` 칩 상수 | `louis-video-player*` 클래스로. `--vp-*` 를 `--louis-video-player-*` 로, 표시 분기 둘(`CHROME_SHOWN/HIDDEN` · `PILL_BLUR_ON/OFF`)을 루트 `data-chrome` 하나로 |
| 스크림 | 지운다 |
| 다운로드 | `__chip __download` 로 — 면이 칩 유리로 바뀐다(보이는 변화) |
| 볼륨 묶음(`VideoPlayerVolume.tsx`) | `__volume*` 로. 열림 · 호버 의도를 `data-open` · `data-intent` 로 |
| `--node-touch-hit` | 캔버스 셸이 `--louis-video-player-touch-hit` 를 덮도록 이름만 바꾼다 |
| 합성 미리보기 · 크게 보기 모달의 틀 | `data-surface="stage"` 로. 모달의 배경막 · 닫기는 Dialog 의 배경막(`dim-modal`)과 `__chip[data-standalone]` 로 |
| YouTube 업로드 미리보기 | `data-platform="youtube"` 로. 장식 버튼 넷을 `__deco` 로, 두 슬라이더에 키 계약, 진행 값을 초로 |
| 하이라이트 크게 보기 버튼 | `__chip[data-standalone="true"]` 로 |

## Acceptance tests

`packages/react/test/video-player-recipe.browser.test.tsx` 가 1~7 · 13 · 15~19 를 잰다. 8~12 · 14 는 제품 `VideoPlayer` 의 행동 계약이다.

1. 스킨 축이 없다 — 플레이어 variant 는 `Chrome` × `Tone` 넷뿐이고, YouTube 판은 `data-platform` 이다.
2. `Tone=bright` 에서 **유리 틴트는 그대로**이고 글자·아이콘만 검정으로 뒤집힌다.
3. `Chrome=Hidden` 에서 가운데 · 하단 줄 opacity 가 0 · 포인터 없음이고 유리 알약의 blur 도 0 이다. 다운로드 칩은 남는다.
4. `MediaScrubber` 에 포인터를 올리면 트랙이 3→5 로 두꺼워지고 썸이 나타난다.
5. 진행 바 펼침이 **wrapper 하나**에 걸려 있고 트랙·채움·썸에는 반응이 없다.
6. 유리 알약 다섯에 inset 0.5 헤어라인이 있고, 면이 `media-control-surface` · 흐림 2 다. 재생 · 스킵 · 칩 hover 는 `media-control-surface-hover`
   이고 알약은 hover 가 없다.
7. 중간 회색 영상 위 `dark` 시간 글자 · 칩 글리프 대비가 쉼 · hover 모두 4.5 이상이다(흰 12% 로 갈아 끼우면 미달). `bright` 는 밝은 영상(200) 위에서 같다.
8. 진행 막대가 `role="slider"` 이고 ←·↓ −5초, →·↑ +5초, Home 처음, End 끝으로 움직이며 Alt · Ctrl · Meta 조합은
   처리하지 않는다. 길이를 모르면 `tabindex=-1` + `aria-disabled=true` 다.
9. 볼륨 슬라이더가 `role="slider"` + `aria-orientation="vertical"` 이고 값이 `0~100` 이며, 음소거면
   `aria-valuenow=0` · `aria-valuetext` 가 「음소거됨」이다. ←·↓ −5, →·↑ +5, PageDown·PageUp ∓10, Home 음소거,
   End 100 이다.
10. 슬라이더를 0 으로 끌었다 음소거를 풀면 **끌기를 시작할 때** 쥐던 볼륨으로 돌아온다(마지막 작은 값이 아니다).
11. 마우스 · 트랙패드에서만 볼륨 패널이 있고, 터치(`hover: none` · `pointer: coarse`)나 `:volume-locked` 기기에서는
    음소거 칩만 있다. 음소거 칩은 모든 기기에 있다.
12. 칩에서 슬라이더로 올라가는 동안(틈 8) 패널이 닫히지 않는다.
13. 패널은 칩 **위로** 열리고(틈 8) 칩 아래로 뒤집히지 않으며, 열려도 알약과 진행 막대의 위치가 움직이지 않는다. 길이는 변수(64~112)를 따른다.
14. 슬라이더를 호버 · 키보드 포커스 · 드래그하는 동안 재생 중에도 크롬이 숨지 않는다.
15. 볼륨 칩과 확대 칩 · 다운로드 칩이 크기 · 곡률 · 유리 값이 같다(한 클래스).
16. 홀로 선 칩(`data-standalone="true"`)이 플레이어 밖에서도 유리 · 잉크 · 흐림 2 를 든다.
17. 무대 판(`data-surface="stage"`)은 검은 판 위 contain 이다.
18. YouTube 판 — 무대 반경 12 · 최대 360(≤719 에서 300), 아래 크롬 12 · 줄 사이 6 · 컨트롤 줄 40, 트랙 4 → 6 · 점은 늘 보이고 플랫폼 빨강,
    버튼 40 · 글리프 30, 장식은 `aria-hidden` · 포인터 없음.
19. YouTube 판 시간 글자 대비가 중간 회색 영상 위에서 4.5 이상이다.
