---
id: video-player
status: experimental
authority: normative
summary: 영상을 재생하고, 그 위에서 재생 위치를 잡습니다.
---

# Video Player

영상을 재생하고 그 위에 재생 컨트롤을 얹는다. 진행 바(`MediaScrubber`)는 별도 단위다 —
상호작용을 받는 것이 그것 하나이기 때문이다.

**조형이 하나다.** 스킨이 둘 있었고 그중 하나만 여덟 자리 중 일곱에서 쓰였다. 나머지 한
자리(`PublishFlow`)도 같은 조형으로 통합해 **스킨 축을 없앴다** — 두 벌을 유지할 근거가
「예전에 그렇게 만들었다」뿐이었다.

**제품에 구현이 하나뿐이고 소비처가 여덟이다**(`VideoPlayer.tsx`, 972줄).
갈래를 고를 필요가 없어 치수·색을 그 파일에서 그대로 가져왔다. Badge 가 65벌에서 축을 골라야
했던 상황의 정반대다.

## Availability

| Surface       | 상태           | 근거                                                          |
| ------------- | -------------- | -------------------------------------------------------------- |
| Web           | `partial`      | 제품 구현이 정본이다. **LOUIS recipe 는 없다** — `packages/css/src/component` 에 `video-player.css` 가 없고 `packages/react/src` 에도 표면이 없다 |
| Figma         | `partial`      | `MediaScrubber` 2 variant(State, ON_HOVER 프로토타입) · `VideoPlayer` 4 variant(Chrome × Tone) + BOOLEAN 슬롯 3 · INSTANCE_SWAP 1 |
| Documentation | `done`         | 이 문서                                                        |
| Maturity      | `experimental` | Figma 가 코드보다 앞서 있다. LOUIS recipe 가 서면 승격한다      |

## When to use

- 생성 결과 영상을 보여 줄 때. 제품의 여덟 자리가 전부 그것이다.
- 쓰지 않는 자리: **재생이 목적이 아닌 썸네일.** 그것은 이미지이고 컨트롤이 필요 없다.

## Anatomy

1. **Video** — 영상 자체.
2. **Center chrome** — 가운데 재생 원형과 좌우 스킵 알약.
3. **Bottom chrome** — 진행 바 알약과 확대 버튼.
4. **MediaScrubber** — 트랙·채움·썸. **포인터 이벤트를 이것 하나가 소유한다.**

## Variants

| 축 | 값 | 무엇이 바뀌나 |
| --- | --- | --- |
| `Chrome` | `Shown` · `Hidden` | 컨트롤의 opacity 와 pointer-events. 유리 알약의 blur 반경(0↔2px)까지 함께 바뀐다 |
| `Tone` | `dark` · `bright` | **글자·아이콘 색만 바뀐다.** 아래 「함정」 참조 |

`SkipButtons` · `ExpandButton` · `DownloadButton` 은 자식 유무라 BOOLEAN 이다. 축으로 두면
2×2×2×2 = 16 변형이 되는데 그중 실제로 쓰이는 조합은 넷뿐이다.

## Properties

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `tone` | `dark` \| `bright` | `dark` | **글자·아이콘 색만** 바꾼다(아래 함정) |
| `showSeekSkipButtons` | boolean | `false` | 스킵 버튼 두 개. **소비처 8곳 중 켜는 곳이 둘뿐이라 기본을 껐다** |
| `onDownload` | 콜백 | 없음 | 우상단 다운로드 버튼. `PublishFlow` 하나만 쓴다 |
| `expandPreviewCopy` | `{tooltip, closeLabel}` | 없음 | 확대 버튼과 모달. 8곳 중 3곳이 쓴다 |
| `preserveSourceAspect` | boolean | `false` | 원본 비율을 유지한다 |
| `clipStartSec` / `clipEndSec` / `clipLoop` | number / boolean | 없음 | 구간 재생. 시각 변화는 없고 진행 바 계산만 바뀐다 |

**Figma 와 코드의 BOOLEAN 기본값이 같다.** 둘 다 `false` 다 — 처음에는 코드가 `true` 였는데
실제로 켜는 자리가 여덟 중 둘뿐이라 **코드 쪽을 뒤집었다.** 기본을 켜 두면 대다수 화면에
없는 컨트롤이 생기고, 디자이너도 그 상태로 조립하게 된다.

## States

| 상태 | 무엇이 바뀌나 |
| --- | --- |
| 재생 / 일시정지 | 가운데 원형의 글리프만 바뀐다. 통합 전 기본 스킨은 `!playing` 일 때만 오버레이를 마운트했는데 그 분기가 사라졌다 |
| 크롬 표시 / 숨김 | `showControls \|\| !playing`. opacity 와 pointer-events, 유리 blur 반경(0↔2px)까지 |
| 진행 바 hover | 트랙 3→5px, 썸 `scale(0)→scale(1)`, 120ms ease |
| 드래그 | **시각 상태가 없다.** `dragging` state 는 CSS 에 반영되지 않는다 |

재생 중에는 2.5초 뒤 크롬이 스스로 숨는다.

## Content

- 버튼 라벨은 전부 `aria-label` 이다 — 화면에 글자가 없다. 시간 표시만 눈에 보이는 텍스트다.
- 시간은 `tabular-nums` 로 그린다. 자릿수가 바뀔 때 폭이 흔들리면 옆의 진행 바가 함께 움직인다.
- 확대 모달의 제목은 시각적으로 숨기고 `aria-labelledby` 로만 쓴다.

## Accessibility

- 모든 컨트롤이 `<button>` 이고 `aria-label` 을 갖는다.
- 확대 모달은 `role="dialog"` + `aria-labelledby` 이고, 열릴 때 닫기 버튼으로 포커스를 옮긴다.
- 닫힘 애니메이션(200ms)이 끝난 뒤에 unmount 한다 — 애니메이션 중 포커스가 사라지지 않는다.
- 모션 축소 환경에서 확대 모달의 애니메이션이 0.01ms 로 줄어든다.
- **진행 바가 키보드로 조작되지 않는다.** 포인터 이벤트만 있고 `role="slider"` 도 없다 —
  네이티브 `<input type="range">` 를 쓰는 LOUIS Slider 와 다르다. 결손으로 적어 둔다.

## 함정 — `bright` 는 밝은 유리가 아니다

`PLAYER_TONE_BRIGHT`는 유리 틴트를 `0 0 0`(순검정)으로, `dark`
는 `--palette-gray-900-rgb`(#171B22, 역시 거의 검정)로 지정한다. **두 톤 모두
검정 계열 틴트**이고 tone 이 실제로 뒤집는 것은 글자·아이콘 색(흰 88% ↔ 검정 88%)뿐이다.

알약이 밝아 **보이는** 것은 뒤의 밝은 영상이 검정 틴트를 통과해 비치는 합성 결과다. Figma 에서
"bright = 밝은 유리" 로 오해해 틴트를 흰색으로 만들면 원본과 달라진다.

## Interaction

- 진행 바의 hover(트랙 3→5px, 썸 `scale(0)→scale(1)`)는 **바깥 wrapper 하나**가 소유한다.
  트랙·채움·썸에는 리스너가 없고 호버 스타일도 그 wrapper 의 `:hover` 에서 전파된다.
  그래서 Figma 프로토타입도 `MediaScrubber` 에 걸려 있다.
- **드래그 전용 시각 상태는 없다.** `dragging` state 가 있지만 JSX 어디에서도 그것을 읽어
  클래스를 바꾸지 않는다 — 드래그 중에는 hover 표현이 그대로 유지될 뿐이다.
- 확대 모달은 **별도 컴포넌트가 아니다.** 플레이어가 자기 자신을 재귀 렌더한 것이라
  (`VideoPlayer.tsx:711-722`) Figma 에도 크기만 다른 인스턴스로 둔다.

## Specification

| 축 | 값 |
| --- | ---: |
| 스킵 알약 | 48 × 48 |
| 가운데 재생 | 58 × 58 |
| 하단 알약 | 높이 32, radius 12, 좌우 12, gap 10 |
| 확대 버튼 | 32 × 32, radius 12 |
| 다운로드 버튼 | 32 × 32 |
| 진행 히트영역 | 20 |
| 트랙 | 3 → hover 5, radius pill |
| 썸 | 12 × 12 |
| 헤어라인 | 유리 알약마다 inset 0.5 |

## Known deviations

- **아이콘 두 종이 라이브러리에 없다** — `skip-10s` 와 `expand`. 제품 인라인 SVG 패스로 그리고
  stroke 를 아이콘 정본 두께(1.5)로 맞췄다. 제품이 SVG 안에 박아 둔 "10" 숫자는 8px raw 텍스트가
  되어 타입 스케일 밖으로 나가므로 **뺐다.**
- **재생 글리프가 제품과 다르다.** 제품은 채운 삼각형인데 라이브러리 `icon/play` 는 외곽선이다.
  라이브러리 일관성을 택했다 — 수렴 판단이 필요하다.
- `dark` 톤 유리 틴트에 대응하는 `gray-900-alpha/28` 이 없어 `media-control-surface`
  (= `static-black-alpha/28`)로 받았다. `bright` 는 정확히 같고 `dark` 는 색상만 근사다.
- 유리의 hover 40% 는 표현하지 않았다 — VideoPlayer 에 hover 변형을 두지 않았다.

## 제품에서 발견한 것

- **스크림이 죽은 레이어다.** `opacity-0` 으로만 선언돼 있고 이를 켜는 분기가 코드에
  없다. Figma 에도 `Scrim (opacity 0)` 으로 그대로 옮겨 두었다 — 지우기 전에 제품 확인이 필요하다.
- **통합 전 기본 스킨의 진행 바가 라이트 테마에서 사라졌다.** 채움·썸이 `var(--gray-000)` 인데 그 램프는
  테마에 따라 뒤집히므로, 라이트에서 검은 영상 위에 검은 진행 바가 됐다. **스킨 통합으로
  그 코드가 사라져 지금은 재현되지 않는다** — 남은 진행 바는 `currentColor` 를 쓴다.

## Acceptance tests

1. 스킨 축이 없다 — variant 는 `Chrome` × `Tone` 넷뿐이다.
2. `Tone=bright` 에서 **유리 틴트는 그대로**이고 글자·아이콘만 검정으로 뒤집힌다.
3. `Chrome=Hidden` 에서 컨트롤 opacity 가 0 이고 유리 알약의 blur 도 0 이다.
4. `MediaScrubber` 에 포인터를 올리면 트랙이 3→5 로 두꺼워지고 썸이 나타난다.
5. 진행 바 hover 가 **wrapper 하나**에 걸려 있고 트랙·채움·썸에는 반응이 없다.
6. 유리 알약 다섯에 inset 0.5 헤어라인이 있고 그 색이 `stroke-hairline` 에서 온다.
7. raw fill·raw stroke·스타일 없는 텍스트가 각각 0 이다.
