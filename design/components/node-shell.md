---
id: node-shell
status: experimental
authority: normative
summary: 캔버스 노드의 겉 — 카드 위에 얹힌 헤더 한 줄과 그 아래 400px 카드.
---

# Node Shell

캔버스에 놓이는 노드 여덟 종이 공유하는 **겉**이다. 카드 **위**에 얹힌 헤더 한 줄(타입 글리프 ·
노드 이름 · 도움말/다운로드/삭제 액션)과 그 아래 400px 폭 카드로 이루어진다. 카드 **안**의 내용은
이 컴포넌트가 소유하지 않는다 — 미디어든 폼이든 프롬프트든 노드 타입이 채우는 슬롯이다. 다만 그
슬롯 **바닥에 놓이는 입력판**(면 · 설정 줄 · 생성 버튼 자리 · 오류 배너)은 노드마다 복제되던 것이라
이 컴포넌트의 하위 부품으로 세웠다(아래 「입력판」).

**제품에 정본이 없다는 것이 이 컴포넌트의 출발점이었다.** 여덟 노드 파일이 각자
`[--node-card-width:400px]` 를 선언하고, 각자 `NODE_WRAP` · `NODE_HEADER_ABOVE` ·
`NODE_TITLE_WRAP` 이라는 같은 이름의 상수를 갖는다. 값이 전부 같은 채로 여덟 벌이 복제돼 있고,
공유되는 것은 클래스가 아니라 **토큰과 이름**뿐이다. (「아홉」이라 적혀 있던 것은 틀렸다 —
`SectionNode` 는 카드가 아니라 그 선언을 하나도 갖지 않는다. 2026-09-09 실측.) 카드 테두리만은 예외로
`node-canvas-v2/index.tsx` 의 캔버스 셸이 `[data-node-chrome=wrap]` 후손 선택자 하나로 여덟을
한꺼번에 칠한다 — 그 한 줄이 「셸이 있어야 한다」는 것을 제품 스스로 인정한 자리다.

## 타입 축이 아홉이 아니라 일곱인 이유

계획서는 이 벌을 「타입 축 9」로 적었다. 실측은 **일곱**이다.

- 제품이 선언하는 축은 타입이 아니라 **액센트**다. `globals.css` 의 `[data-node-accent]` 가
  `video` · `image` · `text` · `youtube` · `instagram` · `audio` · `edit` 일곱 값을 갖고,
  `tts` 와 `bgm` 노드는 **둘 다** `audio` 를 쓴다.
- 그 일곱 중 `youtube` 와 `instagram` 은 같은 rgb(`accent-red-500`)를 가리킨다. 선택 테두리까지
  바이트 단위로 같다. 제품의 어휘를 그대로 옮기려고 두 칸을 남겨 두었고, 같다는 사실을
  기록의 `$whyAccentNotType` 가 갖는다.
- 아홉 번째인 `section` 은 **카드가 아니다.** 반경 16 · 카드 면 없음 · 반투명 색 프리셋 열셋 ·
  제목 바가 프레임 바깥 왼쪽 위 · 네 변 리사이즈. 셸의 계약(400 폭 · 반경 24 · 2px 테두리 ·
  카드 위 헤더)이 단 한 줄도 참이 아니라서 이 세트에 넣지 않았다.

**미선택 일곱의 기하와 색이 전부 같다는 것도 실측이다.** 카드 자신은 타입을 드러내지 않는다.
타입이 보이는 자리는 셋 — 선택 테두리 색, 헤더 글리프, 사이드 채널 버튼 — 이고 그중 셸이
소유하는 것은 첫째 하나다. 나머지 둘은 슬롯([Node Side Handle](node-side-handle.md))이다.

## Availability

| Surface       | 상태             | 근거 |
| ------------- | ---------------- | ---- |
| Web           | `partial`        | CSS recipe `packages/css/src/component/node-shell.css`. React 표면은 없다 — 소비처(제품 노드 여덟)가 클래스를 물면 되고, 감싸는 컴포넌트를 요구하는 자리가 아직 없다. 입력판 하위 부품(`__composer` · `__field` · `__footer` · `__footer-controls` · `__meta` · `__generate` · `__error`)은 2026-10-07 에 섰고 **브라우저 시험이 아직 없다** |
| Figma         | `partial`        | NodeShell — Accent(7) × Selected(2) = 14 variant. 슬롯: TypeGlyph(INSTANCE_SWAP) · Label(TEXT) · HelpButton(BOOLEAN, 기본 꺼짐 — 헤더 액션 맨 앞의 도움말 단추, 2026-10-08). 본문·사이드 레일은 담지 않는다. 입력판은 2026-10-08 에 단일 컴포넌트 둘로 섰다 — NodeComposer(BOOLEAN `HasLead` 기본 켜짐 · `HasError` 기본 꺼짐)와 그 오류 칸 NodeComposerError(TEXT `Message`). 입력판 값은 레시피 선언 기록(`node-composer`)과 맞대고 브라우저 되재기는 없다(아래 「입력판 — Figma」) |
| Documentation | `done`           | 이 문서 |
| Maturity      | `experimental`   | Figma 가 코드보다 앞서 있다. 카드 테두리는 2026-10-08 에 캔버스 토큰 `color-node-card-stroke` 로 제품과 맞췄고(DS-D-0082) Figma 결합도 2026-10-09 에 옮겼다(아래 Known deviations 1) |

## Anatomy

```
NodeShell (세로, 간격 4, 폭 400)
├─ HeaderRow (가로, 높이 32, 좌우 여백 2, 간격 8, 양끝 정렬)
│  ├─ Title (가로, 간격 5)
│  │  ├─ TypeGlyph  16×16  ← INSTANCE_SWAP
│  │  ├─ Label      body-14 medium · 줄 높이 1
│  │  └─ TitleChip  (선택, 여백 1/6, 반경 10, caption medium, 글리프 10)   ← 편집 모드 · 재편집 필요
│  └─ Actions (가로, 간격 0)   ← 셋을 의도적으로 붙인다
│     ├─ Help = NodeChromeButton  Tone=neutral  (도움말)   ← 조건부 칸(HelpButton), 글리프 question-circle
│     ├─ NodeChromeButton  Tone=neutral  (다운로드)
│     └─ NodeChromeButton  Tone=danger   (삭제)
└─ Card (폭 400, 반경 24, 테두리 2 안쪽)
   └─ Body  ← 노드 타입이 채우는 슬롯
      └─ Composer (세로, 간격 8, 사방 8)   ← 입력판. 쓰는 노드만
         └─ Field (면 node-composer-surface, 반경 16, 사방 8, 헤어라인)
            ├─ (첫 줄 · 글 입력칸)  ← 슬롯. 이 부품이 소유하지 않는다
            └─ Footer (세로, 간격 8)   ← 앞에 무엇이 있으면 위로 8
               ├─ FooterControls (가로, 높이 32)
               │  ├─ Meta (가로, 간격 4, 남는 폭)   ← Node Chip 줄
               │  └─ Generate (오른쪽 끝, 왼쪽 8)   ← 생성 버튼 `__generate-button`(DS-D-0084)
               └─ Error (최소 높이 28, 반경 12)   ← 있을 때만
```

**헤더의 높이를 정하는 것은 제목이 아니라 액션 버튼이다.** 글리프는 16이고 라벨의 줄 상자는
14인데, 행이 32인 것은 [Node Chrome Button](node-chrome-button.md) 셋이 32이기 때문이다.
액션을 지우면 헤더가 16으로 주저앉는다.

**도움말 단추는 2026-10-07 에 생긴 셋째 칸이고 조건부다.** 제품 `NodeHeaderActions.tsx:104`
(`chore/landing-dead-walkthrough` @d040dce15)의 `NodeHelpAction` 이 모든 노드 머리 맨 **앞**에
`BUTTON_NEUTRAL` — 다운로드와 같은 중립 톤 — 로 붙는다. 노드 종류를 노드 파일마다 넘기지 않고
캔버스 저장소에서 읽으므로 노드 파일 아홉을 고치지 않고 한 곳에서 붙는다. 그리는 조건은 둘이고
둘 다 참일 때만이다 — **캔버스가 도움말을 열 수 있을 것**(랜딩 · 임베드는 못 연다)과 **그 노드에
도움말 쪽이 있을 것**. 그래서 헤더 액션의 개수는 둘에서 셋 사이에서 움직이고, 액션 묶음에 폭을
적지 않는다. 누르면 [Editor Workspace](../patterns/editor-workspace.md)의 「캔버스 측면 패널」이
그 노드의 쪽으로 열린다. 툴팁은 짧게 「도움말」이고 `aria-label` 은 어느 노드의 도움말인지까지
말한다.

**Figma 에서는 BOOLEAN `HelpButton` 이다(2026-10-08).** 14 변형 모두 `Actions` 맨 앞에 `Help`(NodeChromeButton
`Tone=neutral` · `Glyph` = `icon/question-circle`) 인스턴스가 서고 가시성이 그 속성에 물렸다. 조건이 두 개라도 그리는 것은
「있다/없다」 하나이고, 켜고 꺼도 계속 보이는 레이어의 스타일이 그대로이며 `Actions` 는 간격 0 의 hug 라 자기 값을 다시 쓰지
않는다 — [작성 규범](../governance/figma-component-authoring.md) §2 의 네 시험을 다 통과하므로 축이 아니라 BOOLEAN 이다.
**기본은 꺼짐이다** — 앵커 제품과 그것을 잰 화면 보드가 아직 둘만 그리므로, 이미 놓인 인스턴스가 저절로 셋이 되면 안 된다.
켜면 묶음 폭이 64 → 96 이 된다. 같은 회차에 삭제 단추의 글리프가 `icon/download-simple` 로 잘못 꽂혀 있던 것을
`icon/trash-simple` 로 바로잡았다.

**헤더와 카드 사이 4는 뺄셈의 결과다.** 제품은 컨테이너 간격 10(`gap-5`, 격자가 2px)에 헤더의
`-mb-3`(−6)을 겹쳐 4를 만든다. Figma 오토레이아웃에는 음수 여백이 없으므로 결과값 4를
컨테이너 간격으로 세웠다. 값은 같고 만드는 방법이 다르다.

## 생성 버튼

입력판 오른쪽 끝의 별 + 크레딧 알약이다(`.louis-node-shell__generate-button`, [DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md)).
제품 `NodePromptGenerateButton` 의 정본이고 노드 다섯과 Creative Media 가 같은 조형을 쓴다. Button 의 변형이 아니다 — 빛이 사방 8px
안쪽 그림자(overlay)이고 면이 가로 그라디언트이며 라벨 대신 별과 후행 슬롯을 갖는다.

```html
<button type="button" class="louis-node-shell__generate-button" aria-label="Generate — 2250 credits">
  <span class="louis-node-shell__generate-content">
    <svg class="louis-node-shell__generate-icon" aria-hidden="true">…</svg>
    <span class="louis-node-shell__generate-trailing">2250</span>
  </span>
</button>
```

| 부분 | 값 |
| --- | --- |
| 면 | `linear-gradient(90deg, node-generate-surface-edge, -center 50%, -edge)` — blue-450 · blue-500 |
| 안쪽 빛 | `::before` `inset 0 0 8px 0 node-generate-foreground` · `mix-blend-mode: overlay` |
| 상자 | 높이 · 최소 폭 32, 좌우 8, 반경 `radius-control`, 별과 후행 슬롯 사이 2 |
| 별 · 후행 | 별 14(사다리 밖 제품 값) · 후행 body-sm-regular `node-generate-trailing`(blue-100), 숫자 고정폭 |
| 상태 | hover `brightness(1.06)`(호버 기기만) · 누름 0.95 · `:disabled`/`aria-disabled` 불투명도 0.35 · 생성 중은 안에 `louis-spinner` `data-size="sm"` 을 두고 `aria-busy="true"` |

후행 슬롯은 예상 크레딧 숫자와 「Regenerate」 같은 캡션이 같은 자리 · 같은 서식을 쓴다. 숫자만 보이는 버튼은 `aria-label` 로 행동을 말한다.
**Figma** 는 DS · Components 「7 · 캔버스 · 에디터」 의 `NodeGenerateButton` 세트다 — State `Default` · `Disabled`(불투명도 0.35) ·
`Loading`(Spinner sm, 고리 흰색 · 트랙 22%), TEXT 속성 `Trailing`. 면 그라디언트 정지점 셋 · 안쪽 빛 · 별 · 글자가 전부 위 시맨틱에 묶였다.
`NodeComposer` 의 `Generate` 자리도 이 인스턴스다. 값은 기록 `node-generate-button`(레시피 선언)과 parity 로 맞대고, 실브라우저 시험은
`packages/react/test/node-chrome.browser.test.tsx` 의 생성 버튼 셋(기하 · 그라디언트와 overlay 빛 · 비활성)이다.

## 제목 옆 칩

이미지 노드의 「편집 모드」와 편집 노드의 「재편집 필요」가 제목 바로 옆에 붙는 칩이다(`.louis-node-shell__title-chip`).
[Badge](./badge.md) 가 아니다 — 높이가 헤더에 묶이고(최대 24) 기하(여백 1/6 · 반경 10 · caption medium · 글리프 10)가
배지(4/8 · 8 · regular · `1em`)와 축 하나로 접히지 않는다. 1 · 6 · 10 은 사다리 밖이라 제품 실측(`nodeChrome.ts:289-304`)을 옮긴다.

| 칩 | 속성 | 면 | 글자 | 대비 |
| --- | --- | --- | --- | --- |
| 편집 모드 | (기본) | `node-edit-chip-surface` — 라이트 `violet-alpha/08` · 다크 `/16` | `node-edit-chip-foreground` — 라이트 `violet-700` · 다크 `violet-300` | 8.78 · 5.61 |
| 재편집 필요 | `data-tone="warning"` | `bg-warning` | `fg-warning` | 10.83 |

색은 제품 값이 아니다. 제품 편집 모드는 Tailwind 보라 리터럴이고(`ImageNode.tsx:227-228`), `node-edit-accent` 를 같은 색 16%
위에 얹으면 다크에서 3.00:1 이다. 재편집 필요는 제품 `yellow-600` on `yellow-200` 이 1.94:1 이다.
[DS-D-0083](../governance/decisions/DS-D-0083-deck-feedback-triage.md). **Figma 부품은 아직 없다.**

## 입력판

카드 슬롯 바닥에 서는 입력 영역이다. 클래스는 `.louis-node-shell__composer` 이하 일곱이고 노드가 쓸
때만 문다 — 이미지 뷰어만 있는 노드나 텍스트 노드의 글 입력칸은 이 부품 밖이다.

**왜 부품인가.** 제품 `feat/3d-model-node-design` `Model3dNode.tsx@0b75c760d:189`(@d97ad187c)가 「입력판은 부품이
아니라 노드마다 같은 상수를 들고 있다(VideoNode 633~857)」고 적고 영역 · 면 · 푸터 · 설정 줄 · 생성 버튼
자리 · 오류 배너 여섯 상수를 또 옮겨 적었다. 값은 `VideoNode.tsx` 와 같고 `ImageNode.tsx` · `TextNode.tsx` 도 같은
상수를 읽는다 — 소비처가 넷이다. 새 노드가 생길 때마다 사본이 하나씩 는다 — 셸이 recipe 로 선 이유와 같다.

| 클래스 | 무엇 | 값 · 출처 |
| --- | --- | --- |
| `__composer` | 영역. 세로 flex, 투명 | 사방 `8` · 줄 사이 `8` — `--node-inner-padding` · `gap-4` |
| `__field` | **면.** 카드보다 한 칸 위 | `node-composer-surface`(라이트 흰색 · 다크 `palette-gray-800`, DS-D-0083) · 반경 `16`(`--node-input-radius`) · 사방 `8` · 헤어라인 · `isolation: isolate` |
| `__footer` | 설정 줄 + 오류 배너 | 줄 사이 `8`. 앞에 형제가 있을 때만 위로 `8` |
| `__footer-controls` | 한 줄 | 높이 `32`(`layout-node-chip-height`) |
| `__meta` | 알약 줄 | 간격 `4`(`--node-chrome-btn-gap`) · 남는 폭 · 넘침 보임(드롭다운) |
| `__generate` | 오른쪽 끝 행동 자리 | 왼쪽 `8` |
| `__error` / `__error-text` | 오류 배너 | 최소 높이 `28` · 반경 `12` · 사방 `8` · `accent-danger` 8% 면 · 글자 최대 3줄 |

**푸터의 위 여백은 속성이 아니라 형제 관계다.** 제품은 면 첫 줄(연결 사진 · 뽑아 둔 산출물)이 있으면
`mt-8` 이 붙은 상수를, 없으면 붙지 않은 상수를 호출부가 골랐다. recipe 는 「앞에 무엇이 있으면 띄운다」를
형제 선택자 하나로 갖는다 — 호출부가 분기하지 않는다.

**면에 흐림을 얹지 않는다.** 제품이 이 면의 `backdrop-filter` 를 걷었다 — 면이 불투명이라 비칠 틈이
없는데 합성 레이어 · 배경 캡처 비용을 매 프레임 내고 모바일 WebKit 에서 탭 메모리에 쌓였다. 쌓임
맥락만 `isolation: isolate` 로 남긴다(면 안 드롭다운이 밖 형제와 겨루는 순서가 전과 같아야 한다).

**이 부품이 소유하지 않는 것.**

- **글 입력칸과 복사 · 글자 수 줄.** 텍스트를 받는 노드의 슬롯이다.
- **생성 버튼의 배치 덮어쓰기.** 버튼 자체는 이제 이 부품이 갖는다(아래 「생성 버튼」). 제품 버튼의 절대 배치를 흐름으로
  되돌리던 후손 선택자는 제품 쪽 결합이라 호출부가 갖는다.
- **미디어 위 유리 칩 · 참조 썸네일.** Known deviations 9.
- **`PROMPT_COMPOSER` 래퍼.** 면 아래 흐름 상자이고 `--node-prompt-gen-btn-w` 만 얹었는데, 생성 버튼이
  푸터 안 흐름 배치가 된 뒤로 읽는 곳이 없다.

**오류는 한 자리다.** 줄마다 흩어져 뜨던 빨간 글자를 푸터 아래 배너 하나로 모은다. 접근성은 호출부가
`role="alert"` 를 붙인다 — [Alert](alert.md)와 같은 전제다. 이 배너는 Alert block 의 변형이 아니라 따로
갖는다(반경 12 · 테두리 없음 · 사방 8 · 최소 높이 28 의 줄이고, Alert block 은 반경 20 · 1px · 12/18 의
상자다). 입력판 8 격자 위에 얹히는 크기를 Alert 에 접으면 Alert 가 노드용 밀도를 갖게 된다.

### 입력판 — Figma

단일 COMPONENT 둘이다(2026-10-08, DS · Components 「7 · 캔버스 · 에디터」 맨 아래). 변형 축이 없다 — 레시피에 상태 선언이
없고(생성 중 · 결과는 노드 타입의 몫이다) 있고 없음만 갈린다.

| 컴포넌트 | 속성 | 코드 |
| --- | --- | --- |
| `NodeComposer` | `HasLead` (BOOLEAN, 기본 켜짐) | 면 첫 줄(글 입력칸 · 참조 미디어 · 연결 칩)의 유무 — 마크업의 형제 유무 |
| | `HasError` (BOOLEAN, 기본 꺼짐) | 푸터 아래 `.louis-node-shell__error` 의 유무 — 호출부의 렌더 조건 |
| `NodeComposerError` | `Message` (TEXT) | `.louis-node-shell__error-text` 의 문구 |

- 트리는 `NodeComposer`(세로, 사방 · 줄 사이 8, 투명, 폭 400) → `Field`(면 `color/bg-raised` · 반경 `radius/overlay` · 사방 8 ·
  헤어라인 INNER_SHADOW 0.5) → `Lead`(첫 줄 슬롯) · `Footer`(세로, 줄 사이 8) → `FooterControls`(가로, 높이
  `layout/node-chip-height` 32, 간격 8) → `Meta`(가로, 간격 `node/chrome-btn-gap` 4, 남는 폭) · `Generate`, 그리고 `Footer` 끝의
  `Error`(NodeComposerError 인스턴스, `HasError` 에 물림)다.
- **푸터 위 여백 8 은 `Field` 의 itemSpacing 이다.** CSS 는 「앞에 형제가 있으면 푸터를 위로 8 띄운다」를 형제 선택자로 갖는다 —
  Figma 에는 자식별 여백이 없어 간격으로 옮겼고, `HasLead` 를 끄면 간격도 함께 사라져 같은 결과가 난다. 생성 버튼 자리의 왼쪽
  8(`margin-inline-start`)도 같은 이유로 `FooterControls` 의 간격이다.
- **`Lead` 는 비어 있는 자리표시(높이 48)다.** 첫 줄은 이 부품이 소유하지 않는다 — 시안에서는 인스턴스의 `Lead` 에 입력칸을 채운다.
  `Meta` 의 NodeChip 둘은 자리 표시이지 정본이 아니다. `Generate` 는 2026-10-13 부터 `NodeGenerateButton` 인스턴스다(DS-D-0084).
- 높이는 내용의 합이다 — 기본 120(8 + 면 104 + 8), `HasError` 를 켜면 162, `HasLead` 를 끄면 64.
- **오류 배너는 따로 선 컴포넌트다.** 배너가 `NodeComposer` 안에서는 기본 꺼짐이라 되읽기가 감춘 칸의 치수를 보지 않는다 —
  원본을 따로 세워 반경 `radius/control`(12) · 사방 8 · 줄 사이 8 · 최소 높이 28 · 헤어라인을 맞댄다. 글자는
  `typography/caption-regular` 대표값(레시피가 글자 크기를 선언하지 않는다 — 상속), 잉크 `color/accent-danger`, 최대 3줄 말줄임이다.
- 계약은 parity 의 `NodeComposer` · `NodeComposerError`(manifest 항목 `node-shell` 의 `figmaNames` 셋)이고 값은 기록
  `figma/components.measured.json` 의 `node-composer`(`composer` · `error` 두 칸, 레시피 선언)다 — `verify-recipe-record` 가 레시피와
  맞댄다. 입력판을 렌더하는 브라우저 시험은 아직 없다.

## When to use

- 캔버스에 놓이는 노드의 겉을 그릴 때. 화면 보드에서 노드를 인스턴스로 놓을 때.
- 노드가 아닌 카드에는 쓰지 않는다 — 프로젝트 카드는 [Project Card](project-card.md)이고
  반경·면·헤더 구조가 전부 다르다.
- 캔버스의 **섹션 프레임**에는 쓰지 않는다. 위에 적은 대로 셸의 계약이 하나도 참이 아니다.

## Properties

셸이 소비처에 여는 것은 슬롯 둘과 축 둘이다.

| 이름 | 종류 | 뜻 |
| --- | --- | --- |
| `TypeGlyph` | 슬롯 (INSTANCE_SWAP) | 헤더 왼쪽 16px 글리프. 노드 타입이 고른다 |
| `Label` | 슬롯 (TEXT) | 노드 이름. 사용자가 고쳐 쓰거나 i18n 문자열이 채운다 |
| `Accent` | 축 (7) | `video` · `image` · `text` · `youtube` · `instagram` · `audio` · `edit`. 선택 테두리 색만 바꾼다 |
| `Selected` | 축 (2) | 캔버스에서 이 노드가 선택돼 있는가 |
| `Body` | 자손 | 카드 안의 자리. 노드 타입이 채우고 셸은 높이를 소유하지 않는다 |

**액션 쌍은 prop 이 아니라 자손이다.** 헤더 오른쪽의 두 버튼은
[Node Chrome Button](node-chrome-button.md) 인스턴스이고, 그 버튼의 축은 그쪽 문서가 갖는다.

## States

| 상태 | 무엇이 바뀌나 |
| --- | --- |
| 기본 | 테두리 2px 중립. 일곱 액센트가 **전부 같은 값**이다 |
| 선택 | 테두리 2px 가 액센트 색 88% 로 간다. 제목 잉크도 액센트로 간다 |
| 생성 중 · 결과 · 오류 | **셸이 소유하지 않는다.** 본문 슬롯 안에서 일어나고 노드 타입마다 다르다 — 이미지 노드는 단계 문구가 시간축으로 넘어가고, 텍스트 노드는 변형 카드를 데이터 개수만큼 반복한다. 그것을 셸의 축으로 접으면 축 하나가 반복 목록을 통째로 갖게 된다 |

호버는 셸에 없다. 캔버스에서 카드에 마우스를 얹는 것만으로는 아무것도 바뀌지 않고, 반응하는
것은 안쪽 컨트롤과 좌우 레일 버튼이다.

## Content

- **이름은 사용자의 것이다.** 비어 있으면 노드 타입의 기본 이름이 자리를 지킨다(비디오 노드는
  「영상」, 이미지 노드는 「이미지」). 빈 줄로 두지 않는다 — 헤더가 무너지고 액션만 남는다.
- **한 줄을 넘기지 않는다.** 말줄임으로 자르고 줄바꿈하지 않는다. 카드 폭이 고정이라 두 줄이
  되면 헤더가 카드 위로 자라 노드끼리 겹친다.
- **액션 라벨은 툴팁이 갖는다.** 버튼에는 글자가 없고 `aria-label` 과 툴팁이 뜻을 말한다.
  비활성일 때는 「왜 못 하는가」를 툴팁이 대신 말한다(생성 중에는 지울 수 없다).

## Accessibility

- 헤더 이름은 `<span>` 이고 편집 가능한 노드에서는 더블클릭으로 `<input>` 이 된다. 읽기와 편집이
  **같은 무게**로 보여야 한다는 것이 그 자리의 요구다 — 테두리 있는 폼 컨트롤로 그리면 카드
  위에 입력칸이 하나 떠 있는 것처럼 읽힌다.
- 선택 표시를 **색에만** 싣지 않는다. 캔버스는 선택된 노드를 앞으로 올리고 좌우 레일을 함께
  드러내므로 색 말고도 신호가 둘 더 있다.
- 액션 버튼은 노드 드래그 영역에서 빠져 있어야 한다. 제품은 그것을 `nodrag` 클래스로 한다 —
  빠지지 않으면 버튼을 누르는 순간 노드가 끌려간다.

## Acceptance tests

`packages/react/test/node-chrome.browser.test.tsx` 가 실브라우저에서 잰다 — 셋이 한 벌이라 한
파일이고, 헤더 높이가 크롬 버튼의 토큰에서 온다는 인과가 거기서 한 눈에 보인다. 재는 것은
프레임의 폭·간격, 헤더의 높이·간격·여백, 제목 간격과 글리프, 라벨의 줄 상자, 액션 쌍의 간격과
폭, 카드의 폭·곡률·테두리, 그리고 **미선택 일곱이 전부 같은 면과 테두리를 갖는다**는 사실과
선택 테두리의 액센트 88% 다.

`packages/css/src/component/node-shell.css` 의 선언이 기록과 어긋나지 않는지는
`node ./scripts/verify-recipe-record.mjs` 가 따로 본다 — 그쪽은 저작 CSS 의 글자를 읽고, 위
브라우저 시험은 그 글자가 실제로 만드는 픽셀을 읽는다. 둘 다 필요하다: 캐스케이드와
`inherit` 는 글자만 보아서는 나오지 않고, 렌더만 보아서는 팔레트 칸을 직접 적어 넣은 되돌림이
같은 픽셀로 통과한다.

제품 렌더 하네스가 이 조형에 닿지 못하는 사유는 `figma/components.measured.json` 의
`$noProductRender` 가 그대로 갖는다 — recipe 가 섰다고 그 면제가 풀리지는 않는다.

## Known deviations

1. **카드 테두리는 캔버스 토큰이다.** 카드 면은 2026-10-01 부터 두 테마 모두 `color/bg-surface` 와
   같은 값이다(다크 `palette-gray-900`, 라이트 `palette-gray-000` — 제품 `nodeShellStyles.ts` 의
   `NODE_CARD_SURFACE`). 테두리는 제품이 다크 `palette-gray-700` · 라이트 흰색이고(통합 판 `54b62a8aa`
   `node-canvas-v2/index.tsx:441-442`) 그 쌍을 가진 공용 세만틱이 없어, 2026-10-08
   [DS-D-0082](../governance/decisions/DS-D-0082-canvas-semantics-and-product-ink-alpha.md) 로 캔버스 전용
   `color-node-card-stroke`(라이트 `static/white` · 다크 `palette-gray-700`)를 세우고 레시피가 그것을 읽는다. 노드 셸은
   캔버스 밖에 서지 않으므로 범위 규칙 없이 바로 읽는다. Figma `NodeShell` 의 `Selected=false` 일곱 변형 Card 테두리도
   2026-10-09 에 `color/stroke-default` 에서 `color/node-card-stroke` 로 옮겼다. 노드 셸은 캔버스에만 서므로 캔버스 판 없이
   기본 결합을 바꾼다. `Selected=true` 는 갈래 강조색(`color/node-*-accent`) 그대로다.
2. **캔버스 바닥도 지금은 사다리 값과 같지만 계약은 아니다.** 제품 바닥은 다크 `bg-canvas`
   (`palette-gray-950`) · 라이트 `palette-gray-025` 로 두 테마 모두 `bg-canvas` 와 값이 같다. 그러나 제품은
   라이트에서 사다리 토큰이 아니라 «카드의 한 칸 아래» 팔레트 칸을 짚으므로 같은 값은 결과일 뿐이다.
   2026-10-01 소유자 요청으로 라이트 바닥과 면을 두 칸씩 올렸다(바닥 `palette-gray-100` → `025`,
   카드 `050` → `000`, 입력칸과 테두리 `000` → 흰색). 이 문서가 전에 적었던 「라이트 카드 바닥이 캔버스
   바닥과 같아 흰 테두리가 카드를 만든다」는 더는 참이 아니다. 사다리를 정본으로 삼을지는 소유자
   판정이다.

   **2026-10-07 확인 — 이 사다리의 라이트 값은 소유자 확정이다**(제품 `origin/dev` `64f475e05`,
   `node-canvas-v2/index.tsx:533` · `canvasMenuSurface.ts@b57cd1f95:13` · `nodeShellStyles.ts@b57cd1f95:38`). 캔버스 면 하나하나가
   이미 있는 시맨틱과 같은 값이라 **면 토큰을 새로 세우지 않았다.**

   | 면 | 라이트 | 다크 | LOUIS 시맨틱 |
   | --- | --- | --- | --- |
   | 바닥 | `palette-gray-025` | `palette-gray-950` | `color-bg-canvas` |
   | 노드 카드 | `palette-gray-000` | `palette-gray-900` | `color-bg-surface` |
   | 메타 알약 · 호버 | `palette-gray-000` · `025` | `palette-gray-700` · `600` | `color-canvas-chip-surface` · `-hover`(신설, [Node Chip](node-chip.md)) |
   | 노드 크롬 버튼 면(모델 알약 · 게시물 열기) | `palette-gray-000` | `palette-gray-700` | `color/node/chrome-btn-bg`(2026-10-08 갱신 — 메타 알약과 같은 칸) |
   | 카드 테두리 | 흰색 | `palette-gray-700` | `color-node-card-stroke`(2026-10-08 신설) |
   | 캔버스 안 메뉴 · 떠 있는 툴바 · 줌 알약 · 미니맵 | 흰색 | `palette-gray-900` | `color-canvas-menu-surface`(2026-10-08 신설) |

   메뉴 줄은 제품이 `color-bg-menu`(라이트 `palette-gray-025`)를 캔버스 셸 안에서만 흰색으로 덮는 것
   (`light:[--louis-color-bg-menu:var(--palette-white)]`)이다. 카드가 `pg-000` 으로 올라와 메뉴보다
   밝아졌기 때문에 «카드 위에 열리는 메뉴는 카드보다 한 칸 밝아야 한다»는 것이 제품의 근거다. `bg-menu` 는 앱 전체의
   메뉴 면이라 그 값은 옮기지 않았다. **2026-10-08 판정 — 캔버스 전용 시맨틱으로 세운다**
   ([DS-D-0082](../governance/decisions/DS-D-0082-canvas-semantics-and-product-ink-alpha.md)). `bg-raised` 와 지금은 값이 같지만
   근거가 다르다(카드보다 한 칸 밝은 면 · 앱의 떠 있는 면). 레시피는 `data-louis-scope="canvas"` 범위에서 새 토큰을 읽는다 —
   [Floating Shell](floating-shell.md) · [Menu / Popover](menu-popover.md) · [Node Chip](node-chip.md) 「캔버스 안의 면」.
   바닥은 값이 같아도 제품이 라이트에서 팔레트 칸을 직접 짚는다 — 그 관계(바닥 = 카드의 한 칸 아래)를
   계약으로 삼을지, `bg-canvas` 를 정본으로 삼을지도 위 소유자 판정에 속한다(DS-D-0082 는 바닥을 건드리지 않았다).
3. **제목 잉크도 쌍이 없다.** 제품은 다크 `palette-gray-500` · 라이트 `palette-gray-700` 인데
   `color/fg-secondary` 는 라이트가 정확히 같고 다크가 한 단 밝다(`palette-gray-300`).

   **2026-10-07 확인 — 제품 다크가 한 단 올라 `palette-gray-400` 이다**(`NodeHeaderActions.tsx:50`,
   헤더 액션 셋 모두. 제목과 같은 클래스를 쓰도록 맞췄고 `theme.test.ts` 가 둘을 대조한다 — 제품 주석이
   「다크 제목이 pg-500 에서 pg-400 으로 한 단 올라갈 때(2026-09-11)」라고 적는다). 위 `pg-500` 은
   그 전의 값이다. `fg-secondary`(다크 `pg-300`)와의 차이는 두 단에서 한 단으로 줄었다. 레시피 값은
   바꾸지 않았다 — 사다리에 물린 판정은 그대로이고 어긋남의 크기만 달라졌다.
4. **타입 글리프 넷이 없다.** `video-camera` · `youtube` · `instagram` · `magic-wand` 가 아이콘
   세트에 없다. 변형별 기본값을 채우면 그 넷이 거짓 글리프를 갖게 되므로 슬롯 기본값을 하나
   (`icon/image`)만 두었다. 넷이 승격되면 그때 채운다.
5. **본문 높이 160은 자리표시자다.** 실제 높이는 미디어 비율과 폼 길이가 정한다. 160은 제품이
   실측 높이가 없을 때 쓰는 폴백(`V2_DEFAULT_NODE_HEIGHT`)이고, 셸이 본문 높이를 소유한다는
   뜻이 아니다.
6. **선택 표시의 88% 는 `color-mix` 로 만든다.** 제품은 `rgb(var(--node-selection-accent-rgb)/88%)`
   로 채널을 거쳐 알파를 얹는데, LOUIS 의 저작 게이트는 component CSS 에 원시 rgb 리터럴을
   허용하지 않는다. 같은 색을 `color-mix(in srgb, … 88%, transparent)` 로 만들고, 그 값이
   브라우저에서 실제로 같은지는 acceptance test 가 액센트 일곱 전부에 대해 대조한다.
7. **`data-accent` 를 붙이지 않으면 시스템 강조색이 선택 색이 된다.** 액센트는 Figma 에서
   기본값 없는 축이고 CSS 에는 「축을 지정하지 않은 상태」가 실재한다. 그 자리를 일곱 중
   하나로 채우면 **거짓 채널 색**이 되므로 `accent-primary` 로 둔다 — 틀린 채널보다 「채널이
   아니다」가 낫다.
8. **사이드 레일을 담지 않는다.** 노드마다 채널 목록이 달라서, 셸이 레일을 소유하면 열넷의
   변형이 채널 목록을 굳혀 버린다. 레일 좌표는 토큰(`--node-side-gap` · `--node-side-ctrl`)이
   갖고 버튼은 [Node Side Handle](node-side-handle.md)이 갖는다.
9. **미디어 위 유리 칩과 참조 썸네일을 이 문서에 담지 않았다.** 둘 다 입력판 곁에서 같이 복제되지만
   입력판이 아니다.
   - **유리 아이콘 칩**(`Model3dNode.tsx@0b75c760d:103` @2dfc8fbab): 틴트 `palette-gray-900` 28% · 호버 40% ·
     글자 88% · 헤어라인. 제품 주석이 「`VideoPlayer` 의 `PLAYER_GLASS_TOKENS` … 내보내지 않는 상수라
     옮겨 둔다」고 적는다 — 이미지 노드 · 영상 플레이어 · 3D 노드 세 곳이 같은 값을 따로 든다. 정본의
     자리가 [Video Player](video-player.md)(미디어 위 조작)라 그쪽 문서가 소유하는 것이 맞다. 여기서
     레시피를 세우면 영상 플레이어 갈래와 같은 값을 두 번 세운다. **판정 필요**: 공용 조각의 이름과
     소유 문서.
   - **참조 썸네일 76×52와 길이 배지**(`Model3dNode.tsx@0b75c760d:264`, `VideoNode.tsx` `REFERENCE_VIDEO_THUMB`):
     반경 8 · 테두리 `palette-gray-000` 12% · 배지 `rgb(0 0 0 / 56%)` 에 흰 글자. 소비처가 둘이지만
     리터럴 검정 알파가 있어 면 토큰이 먼저 정해져야 한다. 노드 첨부 썸네일 조각으로 올릴지는 **판정
     필요**다(우선순위 낮음).
10. ~~**입력판 면이 다크에서 카드와 같은 칸이다.**~~ **2026-10-12 해소(DS-D-0083).** `color-node-composer-surface`
    (라이트 `static-white` · 다크 `palette-gray-800`)를 세우고 `.louis-node-shell__field` 가 그것을 읽는다 — 제품
    `PROMPT_FIELD_SHELL`(`ImageNode.tsx` 의 `bg-[var(--palette-gray-800)]` · `light:bg-[var(--palette-white)]`)과 같은 쌍이다.
    Figma `NodeComposer` 의 `Field` 는 아직 `color/bg-raised` 에 물려 있다 — 변수 `node-composer-surface` 를 세우고 옮기는 일이 남았다.
11. **오류 배너 글자 대비가 AA 에 못 미친다 — 제품 값 그대로다.** 글자 `accent-danger`(제품
    `--accent-red-500`) 위에 같은 색 8% 면이라 라이트 2.98:1 · 다크 3.78:1 이다(면 흰색 ·
    `palette-gray-800` 기준. LOUIS 면으로 바꾸면 다크는 4.85:1). 같은 자리를 위한 `fg-danger-on-surface`
    가 이미 있지만 제품이 쓰지 않는다. 보드나 레시피에서 고치지 않고 제품 결함으로 기록한다.
12. **도움말 글리프는 `icon/question-circle` 이다(2026-10-07 등재).** 제품 `nodeGlyphs.ts` 의 새 글리프(lucide `circle-help`, 원
    안의 물음표 · 24 격자)이고 아카이브 썸네일의 제목 줄도 같은 경로를 굽는다(`6530c9620`). 이 저장소 아이콘 세트에 Lucide
    `circle-question-mark` 로 등재했다(ISC AND MIT, 선 2 → 1.5) — Figma `DS · Icons` 에도 섰고, 2026-10-08 셸 헤더의
    `HelpButton` 칸에 꽂혔다. 남은 결손은 없다 — 이 항목은 기록으로 남긴다.
13. **Figma 오류 배너의 면은 primitive `color/red-alpha/08` 에 물렸다.** CSS 는 `color-mix(in srgb, accent-danger 8%, transparent)`
    인데 Figma 는 칠에 색 변수를 묶으면 변수 색의 알파가 칠 불투명도를 덮어 시맨틱 `color/accent-danger` 에 8% 를 얹을 수 없다.
    바이트 같은 값의 primitive 를 쓴다 — [Node Chrome Button](node-chrome-button.md) danger 호버와 같은 처리다.

## Related

- [Node Chrome Button](node-chrome-button.md) — 헤더의 두 액션
- [Node Side Handle](node-side-handle.md) — 카드 좌우 레일의 채널 버튼
- [Node Chip](node-chip.md) — 카드 **안** 메타 툴바의 알약
