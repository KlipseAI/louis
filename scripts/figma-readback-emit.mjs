#!/usr/bin/env node
// Figma 되읽기(`figma/readback.json`)의 `components` 블록을 **뜨는 절차 그 자체**를 코드로 갖는다.
//
// **왜 있는가.** `figma/readback.json` 은 손으로 떠 오는 파일이다. 채취 절차는
// `scripts/build-figma-snapshot.mjs` 머리말에 **산문으로만** 적혀 있었고 실행 가능한 스크립트가
// 없었다. 그래서 Figma 를 고치고 되읽기를 빠뜨리면 게이트가 **초록인 채로** 어긋난다 —
// parity 게이트는 되읽기를 정본으로 읽으므로, 되읽기가 낡으면 낡은 사실을 성실하게 검증한다.
// 실제로 세 번 그랬고, 이 스크립트를 처음 돌렸을 때 네 번째가 드러났다(아래 「알려진 어긋남」).
//
// 사용법
//   node scripts/figma-readback-emit.mjs --components [--only Name1,Name2]
//       Figma 플러그인(`use_figma`)에서 그대로 돌릴 JS 를 stdout 으로 낸다. 그 코드의
//       반환값이 `readback.json` 의 `components` 블록과 **같은 모양**이다.
//       한 응답이 20KB 를 넘으면 잘리므로 `--only` 로 나눠 뜬다.
//   node scripts/figma-readback-emit.mjs --merge <결과.json>
//       그 반환 JSON 을 `figma/readback.json` 의 `components` 에 병합한다. 키는 알파벳순을
//       유지하고 **나머지 블록은 건드리지 않는다.**
//   node scripts/figma-readback-emit.mjs --spec [--only ...]
//   node scripts/figma-readback-emit.mjs --variables --only color/a,color/b   # 변수 행만 뜬다
//   node scripts/figma-readback-emit.mjs --merge-variables <결과.json>
//       채취 명세만 낸다(디버그용).
//
// **채취 명세(`CAPTURE`)가 왜 필요한가.** 되읽기는 「Figma 를 전부 덤프한 것」이 아니라
// **계약이 보는 축만** 담는다. 어느 자손을 `parts` 로 뜨는지, 그중 어느 필드를 뜨는지, 어느
// stroke·effect 역할을 담는지가 컴포넌트마다 다르다 — TextField 는 `Box` 만 담고 `Focus ring`
// 은 담지 않으며, Badge 는 라벨의 `fontSize` 만 담고 폭은 담지 않는다(라벨 폭은 글꼴 렌더링에
// 달려 있어 브라우저와 Figma 가 원래 다르다). 그 선택은 계약이 소유하는 판단이라 코드가
// 추론할 수 없다. 그래서 **명세를 선언으로 적고 값만 Figma 에서 읽는다.**
// 아래 표는 2026-08-26 시점의 `readback.json` 41개 항목에서 역설계했다 — 새 컴포넌트를 더할
// 때는 항목을 손으로 적는다.
//
// 명세 항목
//   key         geometry 키 규칙. `{by:["Size"]}` 면 그 variant 축의 값이 키가 되고,
//               `{by:["Size","Variant"]}` 면 `{size}/{variant}` 복합 키(Slider),
//               `{name:"base"}` 면 전 variant 를 한 키에 묶는다.
//               `{by:[…], omit:{Join:"none"}}` 이면 그 축이 그 값일 때 키에 칸을 만들지 않는다 —
//               기본값이 있는 축을 **나중에** 열 때 기존 키를 개명하지 않기 위한 것이다.
//               **키를 해석하는 코드는 없다** —
//               되읽기와 `figma/components.measured.json` 이 같은 키를 쓰기만 하면
//               verify-figma-parity 가 그대로 대조한다.
//   fields      root 에서 담을 기하 필드와 **그 순서**. 생략하면 DEFAULT_FIELDS.
//   slots       `WxH` 로 담을 자손 이름(`"size"`) 또는 존재 여부로 담을 이름(`"present"`).
//   parts       자손별로 담을 필드.
//   strokes     담을 stroke 역할 이름. `self` 는 variant 루트다.
//   effects     담을 effect 역할 이름.
//   childOrder  칠 순서를 담을지. 숫자 z-index 가 없는 컴포넌트는 자식 순서가 곧 칠 순서다.
//   outsideParts  **일부러** 프레임 밖으로 나가는 자손(포커스 링·말풍선 화살표).
//
// 채취 규칙(하나로 통일했다 — 아래 「어긋남」이 규칙이 여럿이었다는 증거다)
//   1. 변형마다 한 번 훑고 **INSTANCE 에서 멈춘다.** instance 노드 자신은 담되 내부로는
//      들어가지 않는다 — 그 값은 원본 컴포넌트의 것이고, 아이콘 instance 의 원시값은 icon
//      게이트가 각 아이콘 component 에서 따로 잡는다. build-figma-snapshot 머리말이 적어 둔
//      의도와 같다(다만 거기 적힌 이유 「INSTANCE.children 이 비어 있다」는 사실이 아니다 —
//      Plugin API 는 instance 자식을 노출한다. 규칙은 맞고 이유가 틀렸다).
//   2. stroke·effect 역할 이름은 `self`(변형 루트) 아니면 **그 노드의 이름**이다.
//   3. `geometry.strokeWeight` 는 stroke 를 가진 노드의 두께인데 **VECTOR 는 뺀다** —
//      벡터의 stroke 는 테두리가 아니라 그림 자체다(캐럿 1px, 아이콘 획 1.5px).
//   4. 숫자는 기하 1자리, effect 좌표 6자리에서 접는다.
//
// **알려진 어긋남(2026-08-26, 이 스크립트를 처음 돌려 확인).** 되읽기 41개 항목은 한 절차로
// 만들어지지 않았다. 서로 **양립하지 않는 규칙**이 섞여 있어서 어떤 emitter 도 41개를 전부
// 재현할 수 없다. 확인된 것:
//   · `Button` — **해소됐다(2026-09-01).** 되읽기 쪽은 이 emitter 로 다시 떠서 `strokes:{}` 가
//     됐는데(라이브 300변형 중 stroke 를 가진 노드가 없다) 계약이 `strokes.self = borderWidth|INSIDE`
//     를 그대로 들고 있어 parity 가 「Figma 에 없습니다」로 빨갰다. **틀린 쪽은 계약이었다** —
//     secondary 60개의 헤어라인은 규범(figma-component-authoring.md 「헤어라인은 stroke 가 아니라
//     INNER_SHADOW 로 그린다」, DS-D-0023)대로 `INNER_SHADOW:0:0:0.5` 로 서 있다. 그 값을 담을
//     자리가 채취 명세에 없어 계약 밖이었으므로 `effects:["self"]` 를 열고 계약을 stroke 에서
//     effect 로 옮겼다. `IconButton` 은 같은 CSS(`border:0` + inset box-shadow)를 stroke 0.5|INSIDE
//     로 그리고 있어 **규범과 어긋난 채 초록이다** — 기법을 맞추는 것은 소유자 판정으로 남긴다.
//   · `Slider` — `variantCount:12` 와 `binding` 3분의 1은 그 뒤 되읽기가 갱신되며 해소됐다(18변형).
//     `outsideParts:["FocusRing"]` 이 이 명세에 없어 다시 뜨면 사라지던 것은 2026-09-01 에 명세에
//     적어 닫았다 — 포커스 링은 `outline-offset: 2` 라 각 변 2px 밖에 서는 것이 계약이다.
//   · `MenuPanel` — **값은 같고 형태만 다르다(2026-08-30 확인).** `CompositePopover` 를 등재하며
//     같은 명세로 MenuPanel 을 다시 떠 대조했더니 기하·바인딩·effect 가 전부 일치하고 빈
//     `parts: {}` 키의 유무만 달랐다. 되읽기 기하 블록 101개 중 10개가 그 키를 생략하고 2개가 빈
//     객체로 갖고 있다 — 규칙이 여럿이었다는 또 한 증거다. parity 는 `parts ?? {}` 로 읽어 둘을
//     구분하지 않으므로 검증력에는 영향이 없다.
//   · `MenuSeparator` — **해소됐다(2026-09-01).** 되읽기가 `height:[1]` 을 들고 있었는데 CSS 는
//     `block-size: var(--louis-border-width-hairline)` = 0.5 를 그린다. 1 은 제품이 `a3ed8e0` 에서
//     쓰던 값이고, DS-D-0023 §7 이 「실측 두께 토큰은 0.5 로 유지한다」이므로 틀린 쪽은 Figma 였다.
//     라이브 `764:754` 를 0.5 로 줄이고 fill 바인딩도 `color/stroke-subtle` → `color/stroke-hairline`
//     으로 옮겼다 — 색 역시 DS-D-0023 이 generic 헤어라인으로 통일한 축인데 Figma 만 옛 색을
//     들고 있었다(`menu-popover.css:243-245` 가 그 이관을 적고 있다). 되읽기·snapshot 을 같은
//     작업에서 다시 떴다. `strokes:{}`·`effects:{}` 두 키가 새로 생기는데 이 명세에 두 축이 없어
//     빈 객체가 되는 것이며, 없던 것은 채취 규칙이 아니라 옛 되읽기의 생략이다.
//   · `ProjectCard` — **해소됐다(2026-08-30).** 자손 이름이 Figma 에서 `Adornment` → `More`
//     로 어긋나 있었고 계약이 두 이름을 따로 셌다. Figma 를 공개 API 이름 `Adornment` 로
//     되돌리고 계약을 한 줄로 합쳤다. 비-오토레이아웃 프레임의 padding 을 빈 배열로 담는데
//     `VideoPlayer` 는 같은 상황에서 0 을 담는 것은 그대로 남아 있다 — 같은 축을 두 규칙으로 잰다.
// 이 스크립트는 그 사실을 **드러내기만** 한다. 되읽기를 고치면 계약도 함께 움직이므로 별도
// 판단이 필요하다.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const READBACK_PATH = "figma/readback.json";

// component set 이 사는 페이지. 아이콘은 `DS · Icons` 에 있고 `icon/` 접두사로 갈린다.
const COMPONENT_PAGE = "DS · Components";

// 기본 root 기하 필드와 그 순서.
const DEFAULT_FIELDS = [
  "height",
  "width",
  "paddingBlock",
  "paddingBlockEnd",
  "paddingInline",
  "paddingInlineEnd",
  "itemSpacing",
  "cornerRadius",
  "layoutMode",
  "strokeWeight",
];

// 컴포넌트당 한 줄로 적는다 — 항목이 늘어도 diff 가 그 줄 하나로 남는다.
const CAPTURE = {
  // 키가 Tone 에서 Layout 으로 옮겨졌다(2026-09-06 레이아웃 축). 기하를 가르는 것은 톤이
  // 아니라 레이아웃이고, 네 톤은 같은 키 안에서 값이 같아야 한다 — 한 톤만 어긋나면 배열이
  // 길어져 그 사실이 보인다. Icon 은 `width` 만 담는다: 높이는 block 이 21(줄 높이만큼 늘려
  // 세로 가운데 정렬로 광학 정렬을 얻는다) · inline·banner 가 16 이라 CSS 의 16 정사각과
  // 갈리고, 그 어긋남은 alert.md Known deviations 10 이 소유한다.
  // `Content` 는 담지 않는다. 그 폭·높이는 표본에 넣은 문구가 정하는 값이라 계약이 아니고,
  // 담으면 parity 가 「계약에 없는 자손」으로 문다 — 실제로 그렇게 물렸다. 계약 밖의 값을
  // 되읽기에 담아 두면 다음 사람이 그것을 계약으로 착각한다.
  "Alert": {"key":{"by":["Layout"]},"fields":["height","width","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing","cornerRadius","layoutMode","strokeWeight"],"parts":{"Icon":["width","height"]},"strokes":["self"]},
  "AppTopBar": {"key":{"name":"topBar"},"slots":{"LeadingSlot":"present","TrailingSlot":"present"},"parts":{"Leading":["height"],"Trailing":["height"]}},
  "Avatar": {"key":{"by":["Size"]},"slots":{"Fallback":"size"},"parts":{"Fallback":["width","height"]}},
  "Badge": {"key":{"name":"base"},"slots":{"Icon":"size","Dot":"size"},"parts":{"Label":["fontSize"]}},
  "BannerCarousel": {"key":{"by":["Bleed"]},"fields":["width","height","cornerRadius","layoutMode","strokeWeight"],"parts":{"Content":["width","height","paddingLeft","paddingTop"],"Controls":["width","height","itemSpacing"],"DotActive":["width","height","cornerRadius"],"DotRest1":["width","height","cornerRadius"],"PlaybackToggle":["width","height","cornerRadius","children"]}},
  "Breadcrumb": {"key":{"by":["Kind"]},"parts":{"Current":["width","height","fontSize"],"Parent":["width","height","fontSize"],"Separator":["width","height","fontSize"]}},
  // `LeftIcon.glyph`·`RightIcon.glyph` 를 뺐다(2026-09-01). 역할 이름은 규칙 2 대로 **그 노드의
  // 이름**이라 점이 든 경로는 어떤 노드와도 맞지 않고, 맞더라도 규칙 1 이 INSTANCE 에서 멈추므로
  // 아이콘 인스턴스 안의 벡터에는 닿지 않는다. 글리프 획의 정본은 아이콘 manifest 이고
  // verify-figma-parity 의 compareIcons 가 아이콘 component 31개에서 1.5 를 직접 잰다.
  // `effects:["self"]` 는 secondary 의 헤어라인을 담는다 — 규범이 stroke 가 아니라 INNER_SHADOW 로
  // 그리라고 정했고(design/governance/figma-component-authoring.md, DS-D-0023) 라이브 300변형 중
  // secondary 60개가 그것을 갖고 있는데 담는 자리가 없어 계약 밖이었다.
  // `childOrder` 를 켠다(2026-09-01). 2026-09-01 감사에서 Loading 60칸의 Spinner 가 맨 뒤에 서
  // 있었는데(코드는 button.tsx:82 가 맨 앞에 그린다) **되읽기가 자식 순서를 담지 않아 게이트가
  // 초록이었다.** 라이브 전수 순회로만 드러났다. 기능은 이미 있었고 Button 에서 꺼져 있었을 뿐이다.
  // 켜기 위해 300칸의 순서를 `Spinner | LeftIcon | Label | RightIcon` 하나로 통일했다 — 숨은
  // Spinner 도 「그려진다면 설 자리」에 두어야 한 키에 한 값이 담긴다.
  // `fields` 를 손으로 적는 이유는 **`minWidth` 하나 때문**이다(2026-09-02). DEFAULT_FIELDS 에는
  // 그 축이 없어 되읽기가 최소 폭을 담은 적이 없었고, 그래서 `button.css` 가 lg·md·sm 세 칸
  // 전부에 거는 `min-inline-size: control-minimum-width-md`(48)를 Figma 마스터가 갖고 있지
  // 않아도 게이트가 초록이었다. 드러난 방식은 게이트가 아니라 화면 보드다 — `/settings` 의
  // 「Go」가 제품 48 · Figma 42 로 어긋났다(라벨이 짧아 HUG 가 바닥에 닿는 유일한 자리였다).
  // 나머지는 DEFAULT_FIELDS 와 같은 목록·같은 순서이고, `minWidth` 는 MenuPanel 이 이미 쓰는
  // 자리(cornerRadius 다음)에 넣는다.
  "Button": {"key":{"by":["Size"]},"fields":["height","width","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing","cornerRadius","minWidth","layoutMode","strokeWeight"],"slots":{"LeftIcon":"size","RightIcon":"size","Spinner":"size"},"strokes":["Spinner","self"],"effects":["self"],"childOrder":true},
  "CarouselArrow": {"key":{"name":"base"},"parts":{"Caret":["width","height"],"glyph":["width","height"]},"strokes":["glyph"],"effects":["self"]},
  "Checkbox": {"key":{"name":"base"},"parts":{"Box":["width","height","cornerRadius"],"Check":["width","height"],"Dash":["width","height","cornerRadius"],"Label":["width","height","fontSize"]},"strokes":["Box","Check"]},
  // CompositePopover 는 MenuPanel 과 같은 표면인데 **minWidth 를 담지 않는다.** Figma 의
  // minWidth 가 `null` 이라(실측 2026-08-30) 채취하면 빈 배열이 되고, parity 는 빈 배열을
  // 「값이 없습니다」로 읽어 담는 것 자체가 실패가 된다. 240 은 고정폭 프레임으로 그려져
  // `width` 에 있으므로 계약이 그쪽을 CSS 하한과 대조한다(verify-figma-parity 의 계약 주석).
  "CompositePopover": {"key":{"name":"composite-popover"},"fields":["height","width","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing","cornerRadius","layoutMode"],"effects":["self"]},
  // **Dialog 만 `cornerRadius` 대신 모서리 둘을 담는다.** sheet 변형은 아래에서 올라와 뷰포트
  // 바닥에 붙으므로 아래 두 모서리가 0 이다(`dialog.css` 의 `[data-variant="sheet"]` 가
  // `border-end-start-radius: 0` 을 건다). 네 모서리가 갈리면 Figma 의 `cornerRadius` 는
  // `mixed` 가 되어 `undefined` 로 떨어지고, 그러면 그 칸은 **아무 값도 대조되지 않은 채**
  // 되읽기에 빈 배열로 남는다 — 2026-09-01 에 실제로 그 상태였다. 좌우는 대칭이므로 왼쪽
  // 두 모서리만 담는다.
  "Dialog": {"key":{"by":["Size"]},"fields":["height","width","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing","topLeftRadius","bottomLeftRadius","layoutMode","strokeWeight"],"parts":{"Footer":["paddingTop","paddingInline","paddingInlineEnd","paddingBottom","children"],"Actions":["itemSpacing","children","layoutMode","primaryAxisAlignItems"]},"strokes":["self"],"effects":["self"]},
  // `Layout` 축을 열며 키를 `base` 고정에서 variant 값으로 옮겼다(2026-09-06). 세 칸은 기하가
  // 서로 다르다 — compact 은 면·테두리·반경을 갖고 좌측 정렬이며, canvas 는 여백·간격·제목
  // 크기가 다르다. `counterAxisAlignItems` 를 담는 이유는 **정렬이 이 축에서 가장 눈에 띄는
  // 값인데 되읽기에 담는 자리가 없었기 때문**이다 — 담지 않으면 Figma 가 compact 을 가운데
  // 정렬로 그려도 게이트가 초록이다. `strokes:["self"]` 는 compact 의 1px 테두리를 담는다:
  // 기하의 `strokeWeight` 는 stroke 가 **있을 때** 두께만 보므로, 테두리가 사라진 경우를
  // 잡으려면 역할이 계약에 있어야 한다.
  "EmptyState": {"key":{"by":["Layout"]},"fields":["width","height","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing","cornerRadius","counterAxisAlignItems","layoutMode","strokeWeight"],"parts":{"Graphic":["width","height"],"Title":["width","height","fontSize","lineHeightPercent"],"Description":["width","height","fontSize","lineHeightPercent"],"Action":["width","height","paddingBlock","itemSpacing","layoutMode"]},"strokes":["self"]},
  "FaqRow": {"key":{"by":["Expanded","Size"]},"parts":{"Question":["width","height","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing"],"QuestionText":["width","height","fontSize","lineHeightPercent"],"Icon":["width","height"],"Glyph":["fontSize"]}},
  "FormMessage": {"key":{"by":["Tone"]},"parts":{"Message":["width","height","fontSize"]}},
  // `Glyph.glyph` 를 뺐다(2026-09-01) — Button 과 같은 이유다. 위 Button 주석이 근거를 갖는다.
  "IconButton": {"key":{"by":["Size"]},"slots":{"Glyph":"size"},"strokes":["self"]},
  "InlineLoadingLabel": {"key":{"by":["Size","Loading"]},"slots":{"Slot":"size"},"parts":{"Label":["width","height","fontSize","lineHeightPercent"],"Slot":["width","height"]}},
  "Keycap": {"key":{"by":["Kind"]},"parts":{"Label":["width","height","fontSize"]},"effects":["self"]},
  "MediaCard": {"key":{"name":"base"},"slots":{"Glyph":"size"},"parts":{"TopBar":["width","height","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd"],"Badge":["height","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","cornerRadius"],"BadgeLabel":["fontSize","lineHeightPercent"],"InfoBar":["width","height","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing","layoutMode"],"NameRow":["height","itemSpacing"],"Title":["fontSize","lineHeightPercent"],"Description":["fontSize","lineHeightPercent"]},"effects":["Badge","InfoBar"]},
  "MediaScrubber": {"key":{"name":"base"},"parts":{"Track":["width","height"],"Thumb":["width","height"]}},
  "Menu": {"key":{"name":"panel"}},
  "MenuTrigger": {"key":{"name":"trigger"},"parts":{"Glyph":["width","height"]}},
  "MenuPanel": {"key":{"name":"panel"},"fields":["height","width","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing","cornerRadius","minWidth","layoutMode"],"effects":["self"]},
  // 키가 `panel` 인 것은 **대조 상대의 자리 이름**이다(2026-09-01). 구분선에는 size 축이 없지만
  // 그 실측값은 `components.measured.json` 의 `menu-popover.sizes.panel` 안에
  // `separatorWidth`·`separatorMargin` 으로 산다 — parity 는 되읽기와 measured 가 **같은 키**를
  // 쓸 때만 둘을 만나게 하므로, `default` 로 두면 계약에 geometry 를 붙이는 순간
  // 「기하가 snapshot 에 없습니다」가 된다. MenuPanel 이 같은 이유로 같은 키를 쓴다.
  "MenuSeparator": {"key":{"name":"panel"}},
  "GnbMenuItem": {"key":{"by":["Surface","State"]},"fields":["height","width","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing","cornerRadius","layoutMode","strokeWeight","opacity"],"parts":{"Label":["width","height","fontSize","lineHeightPercent"]}},
  "NodeChip": {"key":{"by":["Shape"]},"slots":{"Glyph":"size"},"parts":{"Glyph":["width","height"],"Label":["width","height","fontSize"]},"effects":["self"]},
  "NewsCard": {"key":{"by":["Featured"]},"parts":{"Body":["width","height","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing"],"Date":["width","height","fontSize"],"Headline":["width","height","fontSize","lineHeightPercent"]}},
  "PaneDivider": {"key":{"by":["Orientation","State"]},"parts":{"Grip":["width","height","cornerRadius","opacity"]}},
  "ProgressBar": {"key":{"name":"base"},"parts":{"Fill":["width","height","cornerRadius","layoutMode"]}},
  "ProgressRing": {"key":{"name":"base"},"parts":{"Track":["width","height"],"Content":["width","height"]}},
  // `Rename` 은 **반경 하나만** 담는다(2026-09-03, DS-D-0050). 이름 변경 상자는 크롬이 없어
  // (테두리도 면도 없다) 담을 값이 반경뿐이고, 폭·높이는 오버레이 안쪽 폭과 글자 metrics 에서
  // 나오는 파생값이라 담으면 계약이 되지 않은 채 스냅숏에만 앉는다. 부품이 `State=Renaming`
  // 한 변형에만 있으므로 값 배열은 길이 1 이다.
  "ProjectCard": {"key":{"name":"base"},"parts":{"Media":["width","height"],"Title overlay":["width","height","itemSpacing","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","layoutMode"],"Eyebrow":["width","height","fontSize","lineHeightPercent"],"Title":["width","height","fontSize","lineHeightPercent"],"Meta":["width","height","fontSize","lineHeightPercent"],"Thumbnail":["width","height"],"Action":["width","height"],"Adornment":["width","height"],"Rename":["cornerRadius","itemSpacing"],"Underline":["height"]},"strokes":["self"],"effects":["Title overlay"],"childOrder":true},
  "SegmentedControl": {"key":{"by":["Size"]},"slots":{"Item 1":"size","Item 2":"size","Item 3":"size"},"parts":{"Item 1":["width","height"],"Item 2":["width","height"],"Item 3":["width","height"]},"effects":["self"]},
  "SegmentedControlItem": {"key":{"by":["Size"]},"parts":{"Label":["width","height","fontSize"],"FocusRing":["width","height"]},"strokes":["FocusRing"],"outsideParts":["FocusRing"]},
  "SegmentedCodeInput": {"key":{"by":["State"]},"parts":{"Cell 1":["width","height","cornerRadius"],"Separator":["width","height"],"Dash":["fontSize"],"Char":["height","fontSize"]},"strokes":["Cell 1"]},
  "SelectableListRow": {"key":{"name":"base"},"parts":{"Marker":["width","height","cornerRadius"],"Media":["width","height","cornerRadius"],"Text":["width","height","itemSpacing","cornerRadius"],"Title":["width","height","fontSize"],"Meta":["width","height","fontSize"],"Trailing":["width","height","fontSize"]}},
  "SidebarBrand": {"key":{"by":["Collapsed"]},"fields":["strokeWeight","width","height","cornerRadius","layoutMode","paddingInline","paddingInlineEnd","paddingBlock","paddingBlockEnd","itemSpacing"],"parts":{"Mark":["width","height"],"Wordmark":["width","height"]}},
  "SidebarCta": {"key":{"by":["Collapsed"]},"parts":{"Label":["width"]},"effects":["self"]},
  "SidebarNavItem": {"key":{"name":"navItem"},"parts":{"Icon":["width","height"]}},
  "SidebarNavRow": {"key":{"name":"navRow"},"fields":["strokeWeight","width","height","cornerRadius","layoutMode","itemSpacing","paddingInline","paddingInlineEnd","paddingBlock","paddingBlockEnd"],"parts":{"Item":["height"],"Action":["width","height"]},"childOrder":true},
  "Skeleton": {"key":{"by":["Shape"]}},
  "Slider": {"key":{"by":["Size","Variant"]},"parts":{"Label":["width","height","fontSize","lineHeightPercent"],"Control":["width","height"],"Rail":["width","height"],"Fill":["width","height"],"Thumb":["width","height"]},"strokes":["Thumb"],"outsideParts":["FocusRing"]},
  "Spinner": {"key":{"by":["Size"]},"fields":["width","height","strokeWeight"],"parts":{"Track":["width","height"],"Arc":["width","height"]}},
  "StepTile": {"key":{"name":"base"},"slots":{"Description":"present"},"parts":{"Tile":["width","height","cornerRadius"],"Caption":["width","height","itemSpacing","layoutMode"],"Label":["width","height","fontSize","lineHeightPercent"],"Description":["width","height","fontSize","lineHeightPercent"]}},
  "Switch": {"key":{"by":["Checked"]},"parts":{"Thumb":["width","height"]},"effects":["Thumb"]},
  "TabItem": {"key":{"by":["State"]},"parts":{"Label":["width","height","fontSize"]}},
  "Table": {"key":{"name":"base"},"parts":{"HeaderRow":["width","height"],"Row 1":["width","height"],"Row 2":["width","height"],"Row 3":["width","height"]},"strokes":["TableCell"],"effects":["HeaderRow"]},
  "TableCell": {"key":{"by":["Align"]},"parts":{"Label":["width","height","fontSize"]},"strokes":["self"]},
  "TableHeaderCell": {"key":{"by":["Align"]},"parts":{"Label":["width","height","fontSize"]}},
  "Tabs": {"key":{"name":"base"},"slots":{"TabItem":"size"},"parts":{"TabItem":["width","height"]}},
  // **TextField 의 Box 만 `cornerRadius` 대신 모서리 둘을 담는다.** 결합 칸(`Join`)은 맞닿는 변의
  // 곡률을 펴므로 네 모서리가 갈리고, 그러면 Figma 의 `cornerRadius` 는 `mixed` 가 되어
  // `undefined` 로 떨어진다 — 그 칸의 곡률이 **아무 값과도 대조되지 않는다.** Dialog 의 sheet 가
  // 같은 이유로 같은 모양을 쓴다. 좌우는 대칭이라 왼쪽 두 모서리만 건다 (DS-D-0052).
  "TextField": {"key":{"by":["Size","LabelBehavior","Join"],"omit":{"Join":"none"}},"parts":{"Box":["height","width","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing","topLeftRadius","bottomLeftRadius","layoutMode"],"Label":["height","width","fontSize","lineHeightPercent"],"Value":["height","width","fontSize","lineHeightPercent"],"Message":["height","width","fontSize","lineHeightPercent"]},"strokes":["Box"]},
  "Toast": {"key":{"by":["Layout"]},"effects":["self"],"parts":{"Content":["itemSpacing"],"Action":["height","cornerRadius","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd"]}},
  "Tooltip": {"key":{"by":["Layout"]},"parts":{"Arrow":["width","height"],"Tail":["width","height"],"Stack":["itemSpacing"]},"strokes":["self"],"effects":["self"],"outsideParts":["Arrow","Tail"]},
  "VideoPlayer": {"key":{"name":"base"},"parts":{"Video (placeholder)":["width","height"],"Scrim (opacity 0)":["width","height"],"Center chrome":["width","height"],"Bottom chrome":["width","height"]},"strokes":["Vector"],"effects":["Skip back 10s","Play","Skip forward 10s","Progress pill","Expand"]},
};

function usage(message) {
  if (message) console.error(`[readback-emit] ${message}`);
  console.error(
    [
      "사용법:",
      "  node scripts/figma-readback-emit.mjs --components [--only Name1,Name2]",
      "  node scripts/figma-readback-emit.mjs --merge <결과.json>",
      "  node scripts/figma-readback-emit.mjs --spec [--only Name1,Name2]",
      "  node scripts/figma-readback-emit.mjs --variables --only color/a,color/b",
      "  node scripts/figma-readback-emit.mjs --merge-variables <결과.json>",
      "  node scripts/figma-readback-emit.mjs --remove-variables 'Klipse Primitive::color/a,…'",
    ].join("\n"),
  );
  process.exit(message ? 1 : 0);
}

const argv = process.argv.slice(2);
const onlyIndex = argv.indexOf("--only");
const only =
  onlyIndex === -1
    ? null
    : String(argv[onlyIndex + 1] ?? "")
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
if (onlyIndex !== -1 && (only === null || only.length === 0)) {
  usage("--only 뒤에 이름이 필요합니다.");
}

function selectedSpec() {
  if (only === null) return CAPTURE;
  const picked = {};
  for (const name of only) {
    if (CAPTURE[name] === undefined) {
      usage(
        `채취 명세에 없는 컴포넌트입니다: ${name}. 새 컴포넌트라면 이 파일의 CAPTURE 에 항목을 먼저 적습니다.`,
      );
    }
    picked[name] = CAPTURE[name];
  }
  return picked;
}

/** 플러그인에서 돌릴 채취 코드. 반환값이 readback.components 와 같은 모양이다. */
function pluginSource(spec) {
  return `// 생성물 — \`node scripts/figma-readback-emit.mjs --components\` 가 낸 코드다. 손으로 고치지 않는다.
const SPEC = ${JSON.stringify(spec)};
const PAGE = ${JSON.stringify(COMPONENT_PAGE)};
const DEFAULT_FIELDS = ${JSON.stringify(DEFAULT_FIELDS)};

// Figma FLOAT 는 float32 라 0.45 가 0.44999998807907104 로, 120% 가 120.00000476837158 로
// 돌아온다. effect 좌표는 6자리(r6), 기하는 **1자리**(r1)에서 접는다 — 되읽기의 기하 값은
// 소수 한 자리를 넘지 않으며(전수 확인) parity 는 root 필드를 완전 일치로 본다.
const r6 = (n) => (typeof n === "number" ? Math.round(n * 1e6) / 1e6 : n);
const r1 = (n) => (typeof n === "number" ? Math.round(n * 10) / 10 : n);
const num = (n) => (typeof n === "number" && Number.isFinite(n) ? r1(n) : undefined);

const page = figma.root.children.find((p) => p.name === PAGE);
if (!page) throw new Error("페이지를 찾지 못했습니다: " + PAGE);
// figma.currentPage 는 매 호출 첫 페이지로 초기화된다. 이 줄 없이 세면 component 가 0개다.
await figma.setCurrentPageAsync(page);

// blur 반경이 묶인 변수의 Figma 이름. effect 문자열이 var(이름) 을 쓴다.
const VARNAME = new Map((await figma.variables.getLocalVariablesAsync()).map((v) => [v.id, v.name]));

// **COMPONENT_SET 만 세지 않는다.** variant 축이 없는 컴포넌트(ProjectCard)는 단일 COMPONENT 이고,
// 그것만 빠뜨리면 계약을 추가해도 "snapshot 에 없습니다" 로 막힌다.
const tops = page
  .findAllWithCriteria({ types: ["COMPONENT_SET", "COMPONENT"] })
  .filter((n) => n.parent && n.parent.type !== "COMPONENT_SET" && n.name.indexOf("icon/") !== 0);
const byName = new Map(tops.map((n) => [n.name, n]));

const hasPaint = (paints) => Array.isArray(paints) && paints.some((p) => p.visible !== false);

/**
 * effect 직렬화. 문자열 완전 일치로 비교되므로 형식을 지킨다.
 *   DROP_SHADOW|INNER_SHADOW → {TYPE}:{offsetY}:{radius}:{spread}
 *   BACKGROUND_BLUR|LAYER_BLUR (NORMAL) → {TYPE}:{blurType}:{radius|var(figmaName)}
 *   BACKGROUND_BLUR (PROGRESSIVE) → {TYPE}:PROGRESSIVE:{radius}:{startRadius}:{sx},{sy}:{ex},{ey}
 * 여러 겹은 " + " 로 잇는다.
 */
const effectString = (effects) => {
  const layers = [];
  for (const e of effects || []) {
    if (e.visible === false) continue;
    if (e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW") {
      layers.push(e.type + ":" + r6(e.offset.y) + ":" + r6(e.radius) + ":" + r6(e.spread || 0));
    } else if (e.type === "BACKGROUND_BLUR" || e.type === "LAYER_BLUR") {
      const bound = e.boundVariables && e.boundVariables.radius;
      const radius = bound ? "var(" + (VARNAME.get(bound.id) || bound.id) + ")" : String(r6(e.radius));
      if (e.blurType === "PROGRESSIVE") {
        layers.push(
          e.type + ":PROGRESSIVE:" + radius + ":" + r6(e.startRadius || 0) + ":" +
            r6(e.startOffset.x) + "," + r6(e.startOffset.y) + ":" +
            r6(e.endOffset.x) + "," + r6(e.endOffset.y),
        );
      } else {
        layers.push(e.type + ":" + (e.blurType || "NORMAL") + ":" + radius);
      }
    }
  }
  return layers.length === 0 ? null : layers.join(" + ");
};

// 값마다 **배열**인 이유는 같은 키의 variant 가 서로 다르면 배열이 길어져 "40개 중 하나만
// 어긋난" 경우가 보이기 때문이다.
const push = (bag, key, value) => {
  if (value === undefined || value === null) return;
  const list = bag[key] || (bag[key] = []);
  if (list.indexOf(value) === -1) list.push(value);
};

const rootField = (node, field) => {
  if (field === "layoutMode") return node.layoutMode;
  // 교차축 정렬. **기하 숫자가 아니라 열거값이라 num() 을 태우면 undefined 로 떨어진다** —
  // 담기지 않는 값은 대조되지 않으므로 여기서 문자열 그대로 돌려준다. EmptyState 의 layout
  // 축이 이 값으로 갈린다(compact 만 MIN).
  if (field === "counterAxisAlignItems") return node.counterAxisAlignItems;
  // 불투명도가 **계약 그 자체**인 컴포넌트가 있다(GnbMenuItem 은 여덟 변형의 기하가 완전히
  // 같고 잉크 한 색의 불투명도만 바뀐다). Figma FLOAT 는 float32 라 0.65 가
  // 0.6499999761581421 로 돌아오므로 두 자리에서 접는다.
  if (field === "opacity") return Math.round(node.opacity * 100) / 100;
  if (field === "paddingBlock") return num(node.paddingTop);
  if (field === "paddingBlockEnd") return num(node.paddingBottom);
  if (field === "paddingInline") return num(node.paddingLeft);
  if (field === "paddingInlineEnd") return num(node.paddingRight);
  if (field === "cornerRadius") return typeof node.cornerRadius === "number" ? num(node.cornerRadius) : undefined;
  return num(node[field]);
};

const partField = (node, field) => {
  if (field === "fontSize") return num(node.fontSize);
  if (field === "fontStyle") return node.fontName && node.fontName.style;
  if (field === "lineHeightPercent") {
    const lh = node.lineHeight;
    return lh && lh.unit === "PERCENT" ? num(lh.value) : undefined;
  }
  if (field === "children") return (node.children || []).length;
  if (field === "layoutMode") return node.layoutMode;
  if (field === "primaryAxisAlignItems") return node.primaryAxisAlignItems;
  if (field === "paddingTop" || field === "paddingBlock") return num(node.paddingTop);
  if (field === "paddingBottom" || field === "paddingBlockEnd") return num(node.paddingBottom);
  if (field === "paddingLeft" || field === "paddingInline") return num(node.paddingLeft);
  if (field === "paddingRight" || field === "paddingInlineEnd") return num(node.paddingRight);
  if (field === "cornerRadius") return typeof node.cornerRadius === "number" ? num(node.cornerRadius) : undefined;
  return num(node[field]);
};

const result = {};
for (const name of Object.keys(SPEC)) {
  const spec = SPEC[name];
  const set = byName.get(name);
  if (!set) { result[name] = { $missing: true }; continue; }
  const variants = set.type === "COMPONENT_SET" ? set.children : [set];
  const fields = spec.fields || DEFAULT_FIELDS;

  const properties = {};
  for (const raw of Object.keys(set.componentPropertyDefinitions || {})) {
    const def = set.componentPropertyDefinitions[raw];
    const key = raw.split("#")[0];
    properties[key] =
      def.type === "VARIANT" ? { type: "VARIANT", options: def.variantOptions.slice() } : { type: def.type };
  }

  const binding = { boundFills: 0, rawFills: 0, boundStrokes: 0, rawStrokes: 0, textStyled: 0, textUnstyled: 0 };
  const strokes = {};
  const effects = {};
  const bags = {};
  const order = [];

  const countNode = (node) => {
    const bvFills = (node.boundVariables && node.boundVariables.fills) || [];
    const fillList = Array.isArray(node.fills) ? node.fills : [];
    for (let i = 0; i < fillList.length; i += 1) {
      const paint = fillList[i];
      if (paint.visible === false) continue;
      if (paint.type && paint.type.indexOf("GRADIENT") === 0) {
        // **그라디언트는 paint 가 아니라 stop 단위로 센다.** paint 에는 boundVariables.color 가
        // 아예 없어서 paint 로 세면 어떤 그라디언트든 raw 로 잡힌다. 알파 0 stop 은 색을
        // 나르지 않고 파일에 알파 0 색 변수도 없으므로 세지 않는다.
        for (const stop of paint.gradientStops || []) {
          if (!stop.color || stop.color.a <= 0) continue;
          if (stop.boundVariables && stop.boundVariables.color) binding.boundFills += 1;
          else binding.rawFills += 1;
        }
        continue;
      }
      if (paint.type !== "SOLID") continue;
      // 완전히 투명한 fill 은 색이 아니다 — Figma 배경 흐림이 렌더되려면 그 층에 fill 이
      // 있어야 해서 생기는 것이다.
      if ((paint.opacity === undefined ? 1 : paint.opacity) === 0) continue;
      if (bvFills[i]) binding.boundFills += 1;
      else binding.rawFills += 1;
    }
    const bvStrokes = (node.boundVariables && node.boundVariables.strokes) || [];
    const strokeList = Array.isArray(node.strokes) ? node.strokes : [];
    for (let i = 0; i < strokeList.length; i += 1) {
      const paint = strokeList[i];
      if (paint.visible === false) continue;
      if (paint.type !== "SOLID") continue;
      if ((paint.opacity === undefined ? 1 : paint.opacity) === 0) continue;
      if (bvStrokes[i]) binding.boundStrokes += 1;
      else binding.rawStrokes += 1;
    }
    if (node.type === "TEXT") {
      if (node.textStyleId && node.textStyleId !== "") binding.textStyled += 1;
      else binding.textUnstyled += 1;
    }
  };

  const variantValues = (node) => {
    const out = {};
    for (const part of String(node.name).split(",")) {
      const at = part.indexOf("=");
      if (at !== -1) out[part.slice(0, at).trim()] = part.slice(at + 1).trim();
    }
    return out;
  };

  for (const variant of variants) {
    // \`omit\` 이 있으면 그 축의 그 값은 키에 칸을 만들지 않는다. TextField 의 \`Join=none\` 이
    // 그것이다 — 결합하지 않은 스무 변형의 키를 \`lg/stacked\` 그대로 두고 결합 칸만
    // \`lg/floating/start\` 로 늘리기 위해서다. 축을 통째로 키에 넣으면 기존 네 키가 전부
    // 개명되고, 그 개명은 계약·브라우저 테스트·제품 대조 핀까지 따라 움직인다 (DS-D-0052).
    const omitted = spec.key.omit || {};
    const key = spec.key.name !== undefined
      ? spec.key.name
      : spec.key.by
          .map((axis) => [axis, variantValues(variant)[axis]])
          .filter((pair) => pair[1] !== omitted[pair[0]])
          .map((pair) => pair[1])
          .join("/");
    if (!bags[key]) { bags[key] = { slots: {}, parts: {}, root: {}, weights: [], overflowing: [], childOrder: null }; order.push(key); }
    const bag = bags[key];

    for (const field of fields) {
      if (field === "strokeWeight") continue;
      push(bag.root, field, rootField(variant, field));
    }
    if (spec.childOrder) bag.childOrder = (variant.children || []).map((c) => c.name);

    const box = variant.absoluteBoundingBox;
    // 숨긴 레이어의 **자손**은 화면에 없다. 넘침·슬롯·자손 치수를 셀 때 그 subtree 를 빼지
    // 않으면 「안 보이는 것이 프레임 밖으로 나갔다」는 거짓 결함이 잡힌다 — 실제로
    // InlineLoadingLabel 의 닫힌 변형(슬롯을 숨겨 폭 0 을 표현한다)에서 그랬다.
    // **바인딩은 계속 센다** — 숨긴 레이어의 원시 fill 도 라이브러리에는 그대로 실린다.
    const visit = (node, hidden) => {
      countNode(node);
      const invisible = hidden || node.visible === false;
      if (node.id !== variant.id && !invisible) {
        // **VECTOR 의 stroke 는 테두리가 아니라 그림 자체다.** 글리프 외곽선을 테두리 두께로
        // 세면 "보이는 테두리는 CSS border 두께여야 한다" 검사가 아이콘 획을 잡는다.
        if (hasPaint(node.strokes) && typeof node.strokeWeight === "number" && node.type !== "VECTOR") {
          if (bag.weights.indexOf(r1(node.strokeWeight)) === -1) bag.weights.push(r1(node.strokeWeight));
        }
        const role = node.name;
        if ((spec.strokes || []).indexOf(role) !== -1 && hasPaint(node.strokes)) {
          push(strokes, role, r1(node.strokeWeight) + "|" + node.strokeAlign);
        }
        if ((spec.effects || []).indexOf(role) !== -1) push(effects, role, effectString(node.effects));
        const slotKind = (spec.slots || {})[node.name];
        if (slotKind === "present") bag.slots[node.name] = true;
        else if (slotKind === "size") push(bag.slots, node.name, r1(node.width) + "x" + r1(node.height));
        const partFields = (spec.parts || {})[node.name];
        if (partFields) {
          const target = bag.parts[node.name] || (bag.parts[node.name] = {});
          for (const field of partFields) push(target, field, partField(node, field));
        }
        // 보이는 자손이 variant 프레임 밖으로 나가면 썸네일과 인스턴스에서 잘려 보인다.
        const own = node.absoluteBoundingBox;
        if (own && box) {
          const outside =
            own.x < box.x - 0.01 || own.y < box.y - 0.01 ||
            own.x + own.width > box.x + box.width + 0.01 ||
            own.y + own.height > box.y + box.height + 0.01;
          if (outside && bag.overflowing.indexOf(node.name) === -1) bag.overflowing.push(node.name);
        }
      }
      // **instance 내부로 들어가지 않는다.** instance 가 품은 값은 그 원본 컴포넌트의 것이고,
      // 아이콘 instance 의 원시값은 icon 게이트가 각 아이콘 component 에서 따로 잡는다.
      // 여기서 세면 같은 값이 두 곳에서 두 번 계약된다.
      if (node.type !== "INSTANCE") for (const child of node.children || []) visit(child, invisible);
    };

    countNode(variant);
    if ((spec.strokes || []).indexOf("self") !== -1 && hasPaint(variant.strokes)) {
      push(strokes, "self", r1(variant.strokeWeight) + "|" + variant.strokeAlign);
      if (bag.weights.indexOf(r1(variant.strokeWeight)) === -1) bag.weights.push(r1(variant.strokeWeight));
    }
    if ((spec.effects || []).indexOf("self") !== -1) push(effects, "self", effectString(variant.effects));
    for (const child of variant.children || []) visit(child, false);
  }
  // set 프레임 자신도 센다 — 여기에 원시 fill 이 남아 있으면 라이브러리에 그대로 실린다.
  if (set.type === "COMPONENT_SET") countNode(set);

  const geometry = {};
  for (const key of order) {
    const bag = bags[key];
    const one = { slots: bag.slots, parts: bag.parts };
    for (const field of fields) one[field] = field === "strokeWeight" ? bag.weights : bag.root[field] || [];
    if (spec.childOrder) one.childOrder = bag.childOrder;
    one.overflowingParts = bag.overflowing;
    // 회전한 도형은 자기 상자 안에서 치우쳐 보인다. 지금 파일에는 어긋난 표식이 없고,
    // 생기면 verify-figma-parity 의 compareOpticalCentering 이 잡는다.
    one.offCenterMarks = [];
    geometry[key] = one;
  }

  const entry = {
    variantCount: variants.length,
    hasDescription: typeof set.description === "string" && set.description.trim().length > 0,
    properties: properties,
    binding: binding,
    geometry: geometry,
    strokes: strokes,
    effects: effects,
  };
  if (spec.outsideParts) entry.outsideParts = spec.outsideParts;
  result[name] = entry;
}
return result;
`;
}

function mergeInto(resultPath) {
  const readbackFile = resolve(repoRoot, READBACK_PATH);
  const readback = JSON.parse(readFileSync(readbackFile, "utf8"));
  const incomingRaw = JSON.parse(readFileSync(resolve(process.cwd(), resultPath), "utf8"));
  // `use_figma` 응답을 그대로 저장한 파일도 받는다 — 한 겹 감싸여 있을 수 있다.
  const incoming = incomingRaw.components ?? incomingRaw;
  const missing = Object.entries(incoming)
    .filter(([, value]) => value && value.$missing === true)
    .map(([name]) => name);
  if (missing.length > 0) {
    console.error(
      `[readback-emit] Figma 에서 찾지 못한 component set 이 있습니다: ${missing.join(", ")}`,
    );
    process.exit(1);
  }
  const merged = { ...(readback.components ?? {}), ...incoming };
  const sorted = {};
  for (const name of Object.keys(merged).sort()) sorted[name] = merged[name];
  readback.components = sorted;
  writeFileSync(readbackFile, `${JSON.stringify(readback, null, 2)}\n`);
  console.error(
    `[readback-emit] ${Object.keys(incoming).length}개를 병합했습니다: ${Object.keys(incoming)
      .sort()
      .join(", ")}`,
  );
}


/** 변수 부분 채취 — 이름을 지정한 변수의 행만 뜬다.
 *
 * 컬렉션 전체(191행)를 한 번에 뜨면 `use_figma` 응답 20KB 제한에서 잘린다. 토큰 하나를 고쳤을
 * 때 되읽기를 손으로 고치지 않으려면 **그 행만 다시 뜨는 길**이 있어야 한다. 행 형식은
 * `readback.json` 의 `rowFormat` 이 정한다:
 *   [figmaName, resolvedType, scopesCsv, [[modeName, aliasRef|null, rawValue|null], ...]] */
function variablesPluginSource(names) {
  return `// 생성물 — \`node scripts/figma-readback-emit.mjs --variables\` 가 낸 코드다. 손으로 고치지 않는다.
const NAMES = ${JSON.stringify(names)};
const cs = await figma.variables.getLocalVariableCollectionsAsync();
const all = await figma.variables.getLocalVariablesAsync();
const byId = new Map(all.map((v) => [v.id, v]));
const collById = new Map(cs.map((c) => [c.id, c.name]));
const r6 = (n) => Math.round(n * 1e6) / 1e6;
const out = {};
for (const v of all) {
  if (NAMES.indexOf(v.name) === -1) continue;
  const coll = cs.find((c) => c.id === v.variableCollectionId);
  const modeName = new Map(coll.modes.map((m) => [m.modeId, m.name]));
  const modes = [];
  for (const [modeId, raw] of Object.entries(v.valuesByMode)) {
    const name = modeName.get(modeId);
    if (name === undefined) continue;
    if (raw && raw.type === "VARIABLE_ALIAS") {
      const t = byId.get(raw.id);
      modes.push([name, collById.get(t.variableCollectionId) + "::" + t.name, null]);
    } else if (raw && typeof raw === "object" && "r" in raw) {
      modes.push([name, null, [r6(raw.r), r6(raw.g), r6(raw.b), r6(raw.a)]]);
    } else modes.push([name, null, raw]);
  }
  (out[coll.name] = out[coll.name] || []).push([v.name, v.resolvedType, v.scopes.join(","), modes]);
}
const missing = NAMES.filter((n) => !Object.values(out).some((rows) => rows.some((r) => r[0] === n)));
return { rows: out, missing };
`;
}

/** `--variables` 결과를 `readback.json` 의 컬렉션 행에 **이름으로 덮어쓴다.** 순서는 건드리지 않는다. */
function mergeVariables(resultPath) {
  const readbackFile = resolve(repoRoot, READBACK_PATH);
  const readback = JSON.parse(readFileSync(readbackFile, "utf8"));
  const incoming = JSON.parse(readFileSync(resolve(process.cwd(), resultPath), "utf8"));
  if (Array.isArray(incoming.missing) && incoming.missing.length > 0) {
    console.error(`[readback-emit] Figma 에서 찾지 못한 변수가 있습니다: ${incoming.missing.join(", ")}`);
    process.exit(1);
  }
  let touched = 0;
  let added = 0;
  // 새 행의 scopes 는 여기서 읽는다(위 삽입 분기의 주석 참고). 갱신 경로는 이 표를 보지 않는다.
  const proposalScopes = new Map();
  {
    const proposal = JSON.parse(
      readFileSync(resolve(repoRoot, "packages/tokens/generated/figma.tokens.json"), "utf8"),
    );
    for (const [collName, coll] of Object.entries(proposal.collections ?? {})) {
      for (const spec of Object.values(coll.variables ?? {})) {
        if (!spec.figmaName) continue;
        proposalScopes.set(`${collName}::${spec.figmaName}`, (spec.scopes ?? []).join(","));
      }
    }
  }
  for (const [collName, rows] of Object.entries(incoming.rows ?? {})) {
    const target = readback.collections?.[collName];
    if (target === undefined) {
      console.error(`[readback-emit] 되읽기에 없는 컬렉션입니다: ${collName}`);
      process.exit(1);
    }
    for (const row of rows) {
      const at = target.rows.findIndex((r) => r[0] === row[0]);
      if (at === -1) {
        /* **새 변수는 넣는다.** 예전에는 여기서 죽었다. 그러면 Figma 에 변수를 더한 날
           되읽기를 갱신할 길이 이 스크립트에 없어져 — 손으로 고치는 것 말고는 — 되읽기가
           영구히 낡고, parity 게이트가 낡은 사실을 성실하게 검증한다. 이 스크립트가 막으려던
           바로 그 상태다. 형식 문제의 처방은 삭제가 아니라 형식 수정이다(DS-D-0030).

           **이름은 이미 검증돼 있다** — 방출 코드가 Figma 에서 못 찾은 이름을 `missing` 으로
           내고 위에서 걸러 죽는다. 그러므로 여기 도달한 행은 Figma 에 실재한다.

           행 순서는 세 컬렉션 모두 figmaName 알파벳순이 불변식이라 그 자리에 꽂는다.

           **scopes 는 Figma 가 아니라 proposal 에서 가져온다.** 아래 갱신 경로가 기존 행의
           scopes 를 보존하는 이유와 같은 이유다 — 두 표기가 갈린다. 갈리는 방식이 둘이다:
           COLOR 는 어휘가 다르고(`ALL_FILLS` ↔ `FRAME_FILL,SHAPE_FILL,…`), FLOAT 는 어휘는
           같은데 **순서**가 다르다(Figma `WIDTH_HEIGHT,GAP` ↔ proposal `GAP,WIDTH_HEIGHT`).
           새 행에는 보존할 이전 값이 없으므로 Figma 표기를 그대로 쓰면 같은 컬렉션 안에서
           같은 축이 두 표기로 적힌다. proposal 을 읽으면 그 문제가 통째로 사라진다. */
        const proposed = proposalScopes.get(`${collName}::${row[0]}`);
        if (proposed === undefined) {
          /* Figma 에는 있는데 토큰 정본이 모르는 변수다. 되읽기에 넣으면 「정본에 없는 것」이
             정본 행세를 하게 되므로 멈춘다 — 지우든 정본에 더하든 사람이 정할 일이다. */
          console.error(
            `[readback-emit] 토큰 정본이 모르는 변수라 넣지 않습니다: ${collName}::${row[0]}\n` +
              "  packages/tokens/generated/figma.tokens.json 에 해당 figmaName 이 없습니다.",
          );
          process.exit(1);
        }
        const insertAt = target.rows.findIndex((r) => r[0] > row[0]);
        const placed = insertAt === -1 ? target.rows.length : insertAt;
        target.rows.splice(placed, 0, [row[0], row[1], proposed, row[3]]);
        added += 1;
        continue;
      }
      /* **scopes 문자열은 덮어쓰지 않는다.** 되읽기의 `capturedBy` 가 「scopes 는 Figma 쪽 저장
         형태라 proposal 값을 쓴다 — 게이트가 보는 축이 아니다」로 정해 두었다. Figma 는 같은
         변수를 `ALL_FILLS,STROKE_COLOR,EFFECT_COLOR` 로, proposal 은
         `FRAME_FILL,SHAPE_FILL,STROKE_COLOR,TEXT_FILL` 로 적는다 — 뜻은 같고 표기만 다르다.
         여기서 덮으면 게이트와 무관한 diff 가 매번 생긴다. 갈아 끼우는 것은 **모드 값**뿐이다. */
      const [, type, , modes] = row;
      if (target.rows[at][1] !== type) {
        console.error(`[readback-emit] resolvedType 이 바뀌었습니다: ${collName}::${row[0]} — ${target.rows[at][1]} → ${type}`);
        process.exit(1);
      }
      target.rows[at] = [target.rows[at][0], type, target.rows[at][2], modes];
      touched += 1;
    }
  }
  writeFileSync(readbackFile, `${JSON.stringify(readback, null, 2)}\n`);
  console.error(
    `[readback-emit] 변수 ${touched}개 행을 갱신하고 ${added}개를 새로 넣었습니다.`,
  );
}

/** 되읽기에서 **행을 뺀다.** 라이브에서 지워진 변수를 되읽기에 남겨 두지 않기 위한 길이다.
 *
 * `--merge-variables` 는 갱신과 삽입만 한다 — 방출 코드가 라이브에 없는 이름을 `missing` 으로
 * 내고 거기서 죽으므로, **라이브에 없는 행은 이 스크립트로 지울 방법이 아예 없었다.** 그래서
 * 삭제만 손으로 하게 되고, 손이 들어가는 순간 되읽기가 조용히 낡는다 — 이 파일 머리말이 막으려던
 * 바로 그 상태다(DS-D-0030). 이름은 컬렉션이 갈리는 축(`border-width/hairline` 은 Primitive 와
 * Semantic 양쪽에 있다)이라 `컬렉션::이름` 으로만 받는다. */
function removeVariables(spec) {
  const readbackFile = resolve(repoRoot, READBACK_PATH);
  const readback = JSON.parse(readFileSync(readbackFile, "utf8"));
  let removed = 0;
  for (const entry of spec) {
    const at = entry.indexOf("::");
    if (at === -1) usage(`--remove-variables 는 '컬렉션::이름' 형식이 필요합니다: ${entry}`);
    const collName = entry.slice(0, at);
    const varName = entry.slice(at + 2);
    const target = readback.collections?.[collName];
    if (target === undefined) {
      console.error(`[readback-emit] 되읽기에 없는 컬렉션입니다: ${collName}`);
      process.exit(1);
    }
    const row = target.rows.findIndex((r) => r[0] === varName);
    if (row === -1) {
      /* 이미 없는 행을 지우라고 한 것은 대상을 잘못 짚었다는 뜻이다 — 조용히 넘기면 오타가
         「지웠다」로 보고된다. */
      console.error(`[readback-emit] 되읽기에 없는 변수입니다: ${entry}`);
      process.exit(1);
    }
    target.rows.splice(row, 1);
    removed += 1;
  }
  writeFileSync(readbackFile, `${JSON.stringify(readback, null, 2)}\n`);
  console.error(`[readback-emit] 변수 ${removed}개 행을 뺐습니다.`);
}

if (argv.includes("--components")) {
  process.stdout.write(pluginSource(selectedSpec()));
} else if (argv.includes("--spec")) {
  process.stdout.write(`${JSON.stringify(selectedSpec(), null, 2)}\n`);
} else if (argv.includes("--variables")) {
  const only = argv[argv.indexOf("--only") + 1];
  if (!argv.includes("--only") || !only) usage("--variables 에는 --only <이름,이름> 이 필요합니다.");
  process.stdout.write(variablesPluginSource(only.split(",").map((n) => n.trim()).filter(Boolean)));
} else if (argv.includes("--merge-variables")) {
  const path = argv[argv.indexOf("--merge-variables") + 1];
  if (!path) usage("--merge-variables 뒤에 결과 파일 경로가 필요합니다.");
  mergeVariables(path);
} else if (argv.includes("--remove-variables")) {
  const list = argv[argv.indexOf("--remove-variables") + 1];
  if (!list) usage("--remove-variables 뒤에 '컬렉션::이름' 목록이 필요합니다.");
  const spec = list.split(",").map((n) => n.trim()).filter(Boolean);
  if (spec.length === 0) usage("--remove-variables 뒤에 '컬렉션::이름' 목록이 필요합니다.");
  removeVariables(spec);
} else if (argv.includes("--merge")) {
  const path = argv[argv.indexOf("--merge") + 1];
  if (!path) usage("--merge 뒤에 결과 파일 경로가 필요합니다.");
  mergeInto(path);
} else {
  usage(argv.length === 0 ? null : `알 수 없는 인자입니다: ${argv.join(" ")}`);
}
