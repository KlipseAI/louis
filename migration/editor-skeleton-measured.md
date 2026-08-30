# 에디터 뼈대 실측 — editor-workspace 의 입력 (2026-08-29)

`figma-gap-registry.md` 가 「이것 없이는 에디터가 한 줄도 조립되지 않는다」고 적은 뼈대 부품을
제품에서 실측했다. `editor-workspace` 는 규범 문서만 있고 Figma·Web 모두 `not-ready` 인 유일한
pattern 이며(`design/manifest.json`), 이 문서는 그것을 세우기 위한 근거다.

> **등록부의 수가 셋 다 틀렸다.** 아래 실측이 정정한다. 이 저장소가 실측에서 반복해 틀린
> 이유는 늘 같았다 — 한 검색 축만 쓰면 놓친다(`figma-gap-registry.md` 의 Slider·SegmentedControl·
> Checkbox·Badge 사례). 그래서 부품마다 컴포넌트 이름 · CSS 클래스 · 인라인 Tailwind · 네이티브
> 엘리먼트 · 스타일 상수 객체 · ARIA 역할 · 의존성까지 여러 축으로 세고, 축마다 히트 수를 남겼다.

| 등록부가 적은 것 | 실측 |
| --- | --- |
| 5-pane grid | **4-pane + 3-divider** — 열 트랙 5개를 패널 수로 읽은 것이다 |
| PaneDivider 6선언 | **2 레시피 · 3벌** — assetsDivider 와 propertiesDivider 는 26개 선언이 바이트 동일 |
| InspectorField 33회 · InspectorSection 22회 | **71벌 · 7 레시피** (둘 합산, 8파일) |

## 요약

| 부품 | 벌 | 레시피 | 파일 | 정본 | 판정 |
| --- | ---: | ---: | ---: | --- | --- |
| 5-pane grid + PaneDivider | 8 | 4 | 16 | **없다** (첫 판정이 반증에서 뒤집힘) | `register-after-owner-decision` |
| InspectorField + InspectorSection | 71 | 7 | 8 | **없다** | `register-after-owner-decision` |
| TimeRuler + Playhead | 23 | 9 | 8 | **없다** | `register-after-owner-decision` |
| TimelineClip + TrackLane | 72 | 12 | 7 | **없다** | `register-after-owner-decision` |

**네 부품 모두 정본이 없다.** 값이 갈리는 축이 부품마다 14~18개다. 그래서 판정이 넷 다
`register-after-owner-decision` 이다 — 지금 등록하면 **DS 가 디자인 결정을 대신 내리게 된다.**
`figma-gap-registry.md` 가 Slider 에 대해 적은 것과 같은 상황이다: 「일곱 레시피가 합의하는 축이
하나도 없어 정본이 없다.」

## 소유자 결정이 필요한 것

아래가 정해지면 나머지는 즉시 등록 가능하다. 각 항목은 **코드에서 읽어낼 수 없다** — 어느 쪽도
「지금 그렇게 되어 있다」이지 「그래야 한다」가 아니기 때문이다.

### D-1. compact(≤719px)에서 assets 패널을 어디로 보내는가

지금은 **아무 데도 안 보낸다.** `vemClass.ts:1212` 의 compact 격자가 `assets` · `assets-divider`
영역 이름을 아예 빼는데, 두 요소에는 719px 분기가 없어 **암묵 트랙으로 자동 배치**된다.
`design/patterns/editor-workspace.md` 의 Compact 절이 명시적으로 금지한 실패 형태다.
선택지: 탭 · 시트 · 드로어 · 접힘. 이건 제품 결정이다.

**제안 — 탭(소유자 승인 대기).** Figma `1000:1274` 가 Assets · Preview · Timeline · Inspector
넷을 탭으로 그렸다(2026-08-30). 같은 문구를 Figma `1040:13348` 에 주석으로 남겨 두었다.
승인 전에는 제안이지 계약이 아니다 — 제품은 여전히 암묵 트랙에 흘린다.

### D-2. 디바이더 그립의 계약 — 세로 기준인가 가로 기준인가

| 축 | 세로(assets·properties) | 가로(timeline) |
| --- | --- | --- |
| 그립 기하 | 4 × 60px | 84 × 5px |
| hover | height 60 → 80px | **크기 변화 없음**(opacity 만) |
| active | opacity 1 + height 80px | opacity 1 + **라이트 색 재선언(no-op)** |
| compact | properties `display:none` / assets **규칙 없음** | height 8px + 그립 72 × 5 |

5px 는 이 저장소 2px 그리드에서 벗어난 유일한 값이다. 어느 쪽이 계약인지 DS 가 고르면 둘 중
하나가 틀린다.

### D-3. 타임라인 레인 높이 — 40 / 44 / 36 중 무엇인가

지금 셋이 산다: 선언 40px · 죽은 폴백 44px 6벌 · 캔버스 썸네일 36px.

### D-4. Inspector 라벨의 접근성 계약

`<label>` 26벌 중 **`htmlFor` 를 가진 것이 0개**이고 컨트롤을 감싼 것도 0개다(전부 형제 노드).
컨트롤은 따로 `aria-label` 을 든다. 라벨을 진짜 라벨로 만들 것인지, `<span>` 으로 통일하고
`aria-labelledby` 로 묶을 것인지 정해야 한다. 지금은 26벌이 **거짓 라벨**이다.

### D-5. 숫자 입력 — 프리미티브인가 네이티브인가

`NumberInput` 프리미티브 7벌 vs 네이티브 `input[type=number]` 11벌. 프리미티브 주석
(`inspectorPrimitives.tsx:206`)이 스스로 「기존 raw `<input>` 을 대체한다」고 적는데 대체가
절반에서 멈췄다.

## 실측이 드러낸 결함 — 결정과 별개로 고쳐야 한다

1. **줌 상한이 두 값이라 프레임 그리드 모드가 도달 불가다.** `ruler.ts:5`
   `SEQUENCE_TIMELINE_ZOOM_MAX = 120` vs `modalConstants.ts:65` 의 같은 이름 `= 8`. 제품이
   import 하는 것은 후자라 실제 줌은 8 에서 막히는데, `ruler.ts:181` 의 `frameGridMode` 는
   `>= 48` 에서 켜진다. **켜질 수 없는 분기가 살아 있다.**
2. **Inspector 라벨 26벌이 거짓 라벨이다** (D-4).
3. **바이트 단위 중복 레시피가 셋** — `assetsDivider` ↔ `propertiesDivider`,
   `inspectorStackField` ↔ `propertiesFontFamilyField`, `inspectorMetric` 의 선언 12개가 전부
   `inspectorField` 에 들어 있다.
4. **디바이더 히트영역 12px** — 8px 거터를 양쪽 2px 씩 넘어 이웃 패널 위로 올라타면서도
   접근성 최소치(24/44px)에 미달한다.
5. **키보드 리사이즈가 없다** — 세 `role="separator"` 어디에도 `tabIndex`·`onKeyDown`·
   `aria-valuenow/min/max` 가 없다. 리셋도 더블클릭(포인터)뿐이다.
   `editor-workspace.md` 규범이 요구하는 것과 어긋난다.
6. **mode 를 `portalContainer` 유무로 추론한다** (`VideoEditModal.tsx:11025`). 같은 규범이
   콕 집어 금지한 패턴이다.

## 합의하는 축 — 이건 지금도 등록할 수 있다

부품별로 이미 셋 이상이 같은 값을 쓰는 축이다. D-1~D-5 와 무관하다.

### 5-pane grid + PaneDivider

> **2026-08-30 — 요소 쪽 좌표는 이력이다.** 세 구분자 레시피(`assetsDivider` ·
> `propertiesDivider` · `timelineDivider`)는 이 실측 뒤 LOUIS `.louis-pane-divider` 로 접혔고
> 제품에는 `grid-area` 와 클래스 이름만 남았다(vemClass.ts:46-49 주석 ·
> `packages/css/src/component/pane-divider.css`). 격자 쪽 좌표(트랙 · 거터 · compact)만 현행으로
> 맞췄다. `::before`/`::after` 기하를 가리키는 좌표는 2026-08-29 실측 시점의 것이므로 그대로
> 두었다 — 값은 지금도 맞고, 소유자만 제품에서 LOUIS 로 옮겨 갔다.

- 트랙 두께 4px — 격자 트랙도 4px, 요소도 4px(vemClass.ts:1200·1201 ↔ :98 width:4px · :2554 width:4px · :3675 height:4px)
- 히트영역 12px — ::after inset:0_-4px(세로) / -4px_0(가로)로 좌우(상하) 4px씩 확장(vemClass.ts:104-105 · 2561-2562 · 3681-3682). 셋 다 동일
- 거터 8px — column-gap:2px + 트랙 4px + 2px(vemClass.ts:1208 column-gap · :1209 row-gap). 즉 12px 히트영역이 8px 거터를 양쪽 2px씩 넘어 이웃 패널 위로 올라탄다. 셋 다 동일
- 그립은 ::before 알약 하나 — border-radius:999px · background:var(--palette-gray-500) · transform:translate(-50%,-50%) · z-index:1 · opacity 0→1, 라이트/다크 같은 색(vemClass.ts:110-121 · 2567-2578 · 3686-3699)
- 전환 120ms ease(vemClass.ts:119 · 2576 · 3695)
- 면·레이아웃 골격 — background:transparent · touch-action:none · margin:0 · position:relative(vemClass.ts:97-102 · 2554-2559 · 3676-3680)
- ARIA — role="separator" + aria-orientation + i18n aria-label + title 툴팁. 셋 다 동일 형태(VideoEditModal.tsx:11066-11077 · 11638-11649 · 13505-13516)
- 조작 — 좌클릭 pointerdown → window pointermove/up/cancel, 더블클릭이 리셋(usePanelLayout.ts:90-137 · 141-176 · 178-213)
- 활성 표시 방식 — *DividerActive 클래스를 usePanelLayout 상태로 토글(usePanelLayout.ts:44·49·51)
- 패널 네 개의 면 계약 — border-radius:12px + box-shadow:var(--louis-hairline-inset)로 이미 LOUIS 토큰을 읽는다(vemClass.ts:168 assets · 1291 preview · 1392 timeline · 2770 properties)

### InspectorField + InspectorSection

- 라벨 열 폭 `flex: 0 0 38%` + `max-width: 9.5em` — 43벌 전부 일치 (vemClass.ts:2615-2616 · inspectorPrimitives.tsx:42-43)
- 라벨 타이포 `type-caption-12-medium` — 34/34 일치, InspectorMetric 라벨(inspectorPrimitives.tsx:455)도 같아 43/43
- 라벨 색 다크 `var(--palette-gray-400)` / 라이트 `var(--palette-gray-600)` — 두 라벨 레시피 완전 일치 (vemClass.ts:2613-2614 · inspectorPrimitives.tsx:40-41)
- 행 골격 `display:flex; flex-direction:row; align-items:center; justify-content:space-between; gap:10px; min-width:0; padding:0; border-radius:0; background:transparent; box-shadow:none` — inspectorField(vemClass.ts:786-802) 와 inspectorMetric(inspectorPrimitives.tsx:16-29) 선언이 완전히 겹친다. inspectorField 가 `flex-wrap:nowrap` 과 자손 input 규칙만 더 갖는다
- 컨트롤 열 폭 `140px` 고정 — inspectorValueField · propertiesColorRow · propertiesFieldDropdownWrap · propertiesSliderValueStrip · overlayEditorNum · inspectorFramedInputRow · inspectorMetricValueRow 일곱 레시피가 모두 flex/width/min/max 140px
- 컨트롤 높이 `28px` — 위 일곱 전부. LOUIS `--louis-layout-inspector-control-height: 28px` (tokens.css:469) 와 이미 같은 값
- 컨트롤 면·반경 `border-radius:8px` + `border:none` + 다크 `var(--palette-gray-700)` / 라이트 `var(--palette-gray-300)` — inspectorValueField(vemClass.ts:1011-1015) 와 inspectorMetricValueRow(inspectorPrimitives.tsx:80-85) 일치. LOUIS `--louis-radius-control-sm: 8px` 와도 일치
- 값 텍스트 `color: rgb(var(--gray-000-rgb)/96%)` · `font-variant-numeric: tabular-nums` · `text-align:left` · `flex:1 1 auto` · `min-width:0` — inspectorValueText(vemClass.ts:1042-1048) 와 inspectorMetricValue(inspectorPrimitives.tsx:53-63) 가 선언 단위로 동일
- 모바일 필드 최소 높이 `44px` @ `max-width:719px` — inspectorField·inspectorMetric 일치. LOUIS `--louis-layout-control-hit-target-minimum: 44px` (tokens.css:467) 와 같은 값
- 섹션 제목 타이포 `type-body-14-medium` — 21/21 일치
- 섹션 메타 타이포 `type-caption-12-regular` — 9/9 일치
- 인스펙터 섹션 컨테이너 `padding:16px 0 14px` · `gap:10px` · `border-top:1px solid rgb(var(--palette-gray-000-rgb)/8%)` (라이트 `--palette-gray-200`) · `background:transparent` — inspectorCard 23벌 전부, 그리고 23벌 모두 `<section>` 엘리먼트다 (div 0건)
- 패널 폭 `var(--video-edit-properties-width, 324px)` — propertiesPanel 단일 선언 (vemClass.ts:2764)

### TimeRuler + Playhead

- 플레이헤드 선 폭 = 2px. 3벌 전부 일치 — vemClass.ts:1984 (ppSeqStemLineZoom [width:2px]) · vemClass.ts:3164 (sequenceTracksPlayheadLine [width:2px]) · editorProjectThumbnail.ts:1332 (ctx.fillRect(phX-1, rulerTop, 2, ...))
- 플레이헤드 색 = --primary-500 (#0088ff), 라이트/다크 동일. ppSeqStemLineZoom 은 light 분기에서도 같은 값을 다시 적어 '테마 무관'을 명시한다 (vemClass.ts:1990 + 1997). 캔버스는 var() 를 못 써 PRIMARY_500 = "#0088ff" 로 하드코딩하며 주석으로 라이브를 인용한다 (editorProjectThumbnail.ts:48-49)
- 드래그 히트영역 = 좌우 ±6px 확장(2px 선 → 실효 14px). DOM 두 벌 모두 ::before 로 동일하게 넓힌다 — vemClass.ts:1995-1996 (left:-6px / right:-6px) · vemClass.ts:3174-3175 (같은 값)
- 잡는 손잡이(grab handle) 없음 — 3벌 어디에도 캡 말고 잡는 조형이 없다. 캡 자체는 [pointer-events:none] (vemClass.ts:2013) 이라 손잡이가 아니다. 잡는 곳은 선(cursor:ew-resize, vemClass.ts:1987 · 3168)과 룰러 면 전체(sequenceRuler.tsx:338 cursor:ew-resize)뿐이다
- 플레이헤드 캡 조형 = 배경 primary-500 · 글자 gray-000 · 하단만 라운드 · tabular-nums · 상단 밀착(top:0). vemClass.ts:2001-2015 와 캔버스 editorProjectThumbnail.ts:1333-1348 이 같은 조형(캔버스 주석이 '실제 .ppSequencePlayheadCap border-radius 0 0 4px 4px' 라고 인용)
- 눈금 3위계가 높이 한 줄만 다르다 — major/mid/minor 선언을 줄 단위로 비교하면 [height:10px] / [height:6px] / [height:4px] 외에는 전부 같다 (sequenceRuler.tsx:20-67). 공통 축: [width:1px] · [bottom:4px] · [transform:translateX(-50%)] · [border-radius:999px]
- 실제 마운트에서의 눈금 색이 DOM·캔버스 일치 — DOM 은 다크 rgb(gray-000/80%) + 헤일로 0 0 2px rgb(0 0 0/56%), 라이트 rgb(gray-900/72%) + 헤일로 (sequenceRuler.tsx:22-25). 캔버스는 rgba(250,250,250,0.8) / rgba(23,27,34,0.72) (editorProjectThumbnail.ts:110-111, 141-142) — 같은 값
- 레이아웃 축: 라벨은 위(top:4px, sequenceRuler.tsx:109-112), 눈금은 아래(bottom:4px, :59)로 갈라져 40px 한 레인을 나눠 쓴다. 레인 높이는 --timeline-result-lane-h 40px (sequenceRuler.tsx:82, vemClass.ts:3102)
- 라벨 타이포는 한 벌뿐 — type-caption-12-regular + tabular-nums + letter-spacing 0.02em + line-height 1 (sequenceRuler.tsx:363, 115-119). 캡은 type-caption-12-medium (sequenceRuler.tsx:378 · VideoEditModal.tsx:12006)

### TimelineClip + TrackLane

- 곡률 8px — 클립 네 종류 + 드롭 고스트 + 에셋 드래그 칩 여섯이 합의한다. vemClass.ts:157(audioClip) · 1778(overlayTrackRegion) · 3772(timelineDropGhost) · 17(assetDragChip). 비디오 클립만 두 단계로 도달한다 — resultClipRegion 이 `border-radius:0`(2987)을 선언하고 timelineClipRegion 이 `.vem-result-clip-region&`(0,2,0) 로 8px 로 덮는다(3639)
- 1px inset 스트로크 — 네 레시피가 **바이트 단위로 동일한 10줄 블록**을 각자 복제해서 들고 있다: `--timeline-clip-stroke-width:1px` + `::before` 의 content/absolute/inset:0/z-index:3/box-sizing:border-box/border-radius:inherit/pointer-events:none/background:transparent/border. audioClip 144-153 · overlayTrackRegionImage 1788-1797 · overlayTrackRegionText 1818-1827 · timelineClipRegion 3617-3626 (네 곳 모두 연속·동일)
- 배치 — `position:absolute; top:0; bottom:0` + 인라인 `left/width` %. audioClip 154-156 · overlayTrackRegion 1773-1775 · resultClipRegion 2981-2983
- 채움 톤 사다리 300/48% → hover 400/48% → selected 500/48% — 오디오·자막·이미지 **셋이** 합의한다. pink 159/169/228 · yellow 1835/1838/1813 · green 1805/1808/1814
- 스트로크 테마 사다리 라이트 300 / 다크 800 — 같은 셋이 합의한다. pink 158·168 · green 1798·1799 · yellow 1828·1829 (accent 토큰은 테마로 뒤집히지 않는 고정 팔레트이므로 이 스왑은 선언으로만 일어난다 — globals.css:242-253)
- 커서 `grab`, `:active` 에서 `grabbing` — audioClip 163 · overlayTrackRegion 1780 · timelineClipRegion 3640·3641
- 레인 높이 변수 선언은 한 곳뿐 — `--timeline-lane-h:40px` (vemClass.ts:3101, `.vem-sequence-lanes`). 모든 레인이 그 안에 있다: VideoEditModal.tsx:11716 → 11752 → 12063
- 레인 세로 간격 `row-gap:8px` — vemClass.ts:3195, 한 곳
- 레일 폭 76px(≤719px 56px) + `position:sticky; left:0` — laneRailOverlay 1062-1065 와 그리드 트랙 정의 3187 이 같은 값
- 잠금 표시는 한 벌을 공유 — `timelineClipRegionLocked`(45° 6px/6px repeating-linear-gradient `rgb(0 0 0/14%)`, vemClass.ts:3651)를 비디오 클립(VideoEditModal.tsx:12488)과 오디오 클립(13170)이 함께 쓴다

## 필요한 토큰 — LOUIS 에 대응이 없는 것

부품별 실측에서 뽑았다. 값은 제품 실측치이고, 등록 여부는 D-1~D-5 결정 뒤에 정한다.

### 5-pane grid + PaneDivider (11)

- divider/track-thickness = 4px — 창 사이 구분자 트랙 한 변. 제품 --spacing:2px 그리드로는 2단위. LOUIS spacing 명부에 이 역할이 없다
- divider/hit-slop = 4px (양쪽) → 히트영역 12px. LOUIS interaction-states 에 포인터 슬롭 개념 자체가 없고, 12px 은 접근성 최소치 미달이라 값과 함께 판정도 필요하다
- divider/gutter = 8px = gap 2 + track 4 + gap 2. 세 값이 한 식으로 묶여야 한다 — 트랙만 옮기면 히트영역이 거터를 넘는 사실이 사라진다
- divider/grip-length = 60px(idle) / 80px(hover·active) — 세로 전용
- divider/grip-length-horizontal = 84px, compact 72px — 가로 전용
- divider/grip-thickness = 4px(세로) / 5px(가로). **5px 은 2px 그리드를 벗어나는 유일한 값**이라 그대로 옮길지 4 또는 6으로 정렬할지 판정이 필요하다
- divider/grip-color = var(--palette-gray-500) — 라이트·다크 같은 색. 시맨틱 gray 가 아니라 고정 팔레트다. LOUIS 로 옮길 때 시맨틱으로 바꾸면 두 테마 중 하나가 틀린다
- divider/grip-radius = 999px — LOUIS radius 명부에 full/pill 역할이 없다(spacing-radius.md 는 control·surface·overlay·overlay-item 넷만 든다)
- motion/divider-reveal = 120ms ease — LOUIS motion.md 에 120ms 는 overlay-exit 로만 존재한다(motion.md:53). 같은 숫자를 다른 역할로 재사용할지, 새 semantic recipe 를 만들지 판정 필요
- pane 클램프 5조 = assets 200/236/420 · properties 324/324/520(최소=기본) · timeline 80/400 · preview 하한 폭 360 · preview 하한 높이 260~400. 임의 fallback 숫자가 아니라 modalConstants.ts:137-162 의 승인값이며 한 세트로 옮겨야 한다.
  Figma 는 properties 폭을 324 로 맞춰 그렸고(`1000:1265`, modalConstants.ts:138-141 의 최소=기본),
  **변수 바인딩은 여전히 없다** — 승인된 pane 폭 토큰이 생기면 그때 바인딩한다
- compact divider 두께 8px + 거터 16px(row-gap 4 + 8 + 4) — 이 브레이크포인트에서만 히트영역 16px 과 거터가 정확히 맞는다

### InspectorField + InspectorSection (9)

- `--louis-layout-inspector-label-column: 38%` — 라벨 열 폭. 43벌 전부가 이 값이고 LOUIS 에 대응 토큰이 없다
- `--louis-layout-inspector-label-max: 9.5em` — 라벨 최대 폭(em 기준). 43벌 일치
- `--louis-layout-inspector-control-column: 140px` — 컨트롤 열 고정 폭. 일곱 레시피가 전부 이 값. LOUIS 에 140px 토큰 없음
- `--louis-space-inspector-field-gap: 10px` — 라벨↔컨트롤 간격. `--louis-space-control-*` 은 4·8·12·16 뿐이라 10px 이 없다. 기존 `--louis-layout-node-chip-inset: 10px` 를 재사용하면 역할이 다른 이름을 빌리는 것이라 DS-D-0030(중복 역할 토큰 금지)에 걸린다
- `--louis-space-inspector-section-gap: 10px` — 섹션 안 필드 간격. 위와 값은 같지만 역할이 달라 별도 이름이 필요하다
- `--louis-layout-inspector-section-inset: 16px 0 14px` — 섹션 상/하 패딩(좌우 0). 위아래가 비대칭이라 단일 spacing 토큰으로 안 접힌다
- `--louis-space-inspector-section-header-gap: 12px` — 제목↔메타 행 간격. `--louis-space-control-md: 12px` 로 대체 가능한지는 소유자 판단(역할이 다르면 새 이름)
- `--louis-color-inspector-control-surface` — 컨트롤 면. 현재 다크 `--palette-gray-700` / 라이트 `--palette-gray-300` 를 직접 읽는다. LOUIS 에 이 역할의 시맨틱 별칭이 없어 테마마다 팔레트를 직접 집는 상태다
- `--louis-color-inspector-section-divider` — 섹션 구분선. 현재 다크 `rgb(var(--palette-gray-000-rgb)/8%)` / 라이트 `--palette-gray-200` 로 알파와 실색을 테마별로 다르게 쓴다. 한 토큰으로 접으려면 알파 스케일 결정(DS-D-0026 alpha-scale)에 맞춰야 한다

### TimeRuler + Playhead (12)

- timeline-tick-width: 1px — LOUIS 의 border-width 계열에 1px 눈금용 값이 없다(border-width-hairline 0.5px / border-width-ring 만 있음)
- timeline-tick-height-major / -mid / -minor: 10px / 6px / 4px — 3위계 높이 사다리. LOUIS 에 대응 계열 없음
- timeline-tick-inset-block-end: 4px (눈금 하단 인셋) · timeline-label-inset-block-start: 4px (라벨 상단 인셋)
- timeline-playhead-width: 2px
- timeline-playhead-hit-inline: 6px (::before 좌우 확장, 실효 히트폭 14px)
- timeline-playhead-cap-radius: 0 0 4px 4px · timeline-playhead-cap-padding: 2px
- timeline-lane-height: 40px (현행 --timeline-result-lane-h; fallback 44px 은 실제로 안 쓰임 — 둘 중 하나로 정리 필요)
- timeline-label-target-gap: 88px · timeline-dot-min-gap: 7px — 픽셀 기준 눈금 밀도 임계. LOUIS 에 '밀도 임계' 성격의 토큰 종류 자체가 없다
- color-timeline-tick: 표면 위 다크 rgb(gray-000/80%) · 라이트 rgb(gray-900/72%) — LOUIS color-stroke 계열에 이 알파 쌍이 없다
- elevation/shadow-timeline-tick-halo: 0 0 2px rgb(0 0 0/56%) (다크) / 0 0 2px rgb(gray-000/80%) (라이트) — 눈금이 필름스트립 위에서 읽히게 하는 헤일로. LOUIS elevation 계열은 표면 그림자용이라 이 용도가 없다
- layer-timeline-* 사다리 — LOUIS layerOrder 는 content(0) → sticky(100) → popover(200) → modal(300) → critical(400) 뿐이고, 타임라인 축 안의 6단(룰러면 7 · 캡 7 · 길이핸들 8 · 호버선 10 · 마커 41 · 플레이헤드 52)을 담을 층이 없다. content 안쪽 서브 사다리가 필요하다
- color-timeline-playhead 는 새 토큰이 아니라 별칭이면 된다 — primary-500 을 그대로 쓰고 라이트/다크 동일. 단 LOUIS 별칭은 채널 경유(rgb(var(--louis-…-rgb)))로 걸어야 한다

### TimelineClip + TrackLane (13)

- --louis-timeline-lane-height (40px) — 레인 한 행 높이. 지금 제품에 40(선언)/44(죽은 폴백 6벌)/36(캔버스) 세 값이 산다
- --louis-timeline-lane-gap (8px) — 레인 사이 row-gap(vemClass.ts:3195)
- --louis-timeline-rail-width (76px) / --louis-timeline-rail-width-compact (56px) — 레일 열 폭, ≤719px 전환
- --louis-timeline-clip-radius (8px) — 클립·고스트·드래그 칩 공통 곡률
- --louis-timeline-clip-stroke-width (1px) — 지금 네 레시피가 각자 복제해 든 값
- --louis-timeline-clip-fill-alpha (48%) — 채움 알파. 300/400/500 세 단계에 모두 같은 48% 가 붙는다
- 클립 종류별 역할 색 4쌍 — --louis-color-clip-video-{fill,stroke} / -audio-* (pink) / -caption-* (yellow) / -image-* (green). 지금은 accent 팔레트 원색(accent-pink-300 등)을 클립이 직접 부르고 있어 팔레트가 움직이면 클립 의미가 함께 흔들린다
- --louis-timeline-clip-state-{hover,selected} 램프 규칙 — 기본 300 · hover 400 · selected 500(오디오·자막·이미지가 합의한 유일한 상태 사다리)
- --louis-timeline-clip-trim-handle-width (10px) / -coarse (16px) — 지금 비디오 10px vs 오디오 6px 로 갈림
- --louis-timeline-clip-trim-handle-bar (2×18px, radius 1px, inset 4px) — 오디오만 2×14px/inset 2px
- --louis-timeline-clip-locked-hatch — 45° 6px/6px repeating-linear-gradient rgb(0 0 0/14%)
- --louis-timeline-drop-indicator — 트랙 드롭 라인 2px. 지금 토큰 밖 리터럴 rgb(14 165 233)
- --louis-timeline-lane-surface / -surface-audio — 레인 면. 비디오 gray-900 100% 대 오디오 면 없음의 갈림을 이 토큰이 흡수해야 한다

---

전체 실측 원본(축별 히트 수·갈리는 축 62개 전문)은 이 문서를 만든 작업의 산출물이며, 위
요약이 그중 판정에 쓰인 것을 담는다. 다시 재려면 이 문서의 「실측 방법」 문단대로 여러 축으로
세라 — 한 축만 쓰면 등록부가 틀렸던 것과 같은 방식으로 틀린다.
