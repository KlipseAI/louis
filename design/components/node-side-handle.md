---
id: node-side-handle
status: experimental
authority: normative
summary: 노드 카드 좌우 레일에 서는 28px 채널 연결 버튼.
---

# Node Side Handle

노드 카드의 **좌우 레일**에 서서 「여기에 무엇이 연결되는가」를 색으로 말하는 28px 버튼이다.
누르면 그 채널의 메뉴가 열리고, 선을 끌어 연결하는 대상이기도 하다.

**셸과 디스크가 나뉜다.** 바깥 버튼은 투명하고 포인터만 받으며, 색과 곡률은 안쪽 디스크
(`Facet`)가 갖는다. 제품이 그렇게 나눈 이유는 호버·프레스가 디스크만 키우고 줄이기 때문이다 —
셸이 채색을 가지면 스케일이 클릭 영역까지 흔든다.

## 채널은 여섯이다 — 비디오 채널은 없다

**2026-10-12 고침([DS-D-0083](../governance/decisions/DS-D-0083-deck-feedback-triage.md)).** 이 절은 「소스는 셋이다」라고
적고 있었다. `NodeSideButtons.tsx` 의 `type SideTone = "image" | "text" | "edit"` 만 본 결론이었고, 제품 origin/main 의
노드 파일들은 나머지 셋도 원판 면으로 칠한다 — BgmNode · TtsNode 의 `audio`, YoutubeNode · VideoNode 의 `youtube`,
InstagramNode · VideoNode 의 `instagram`(`[background:var(--node-handle-icon-{ch})]!`). 레시피는 이제 여섯을 칠한다
(`data-channel="image|text|edit|audio|youtube|instagram"`), 비활성도 여섯이다.

**비디오 채널은 없다.** 톤은 그 핸들에 꽂히는 **엣지의 채널**이다 — 자기 노드 타입이 아니다. 비디오는 매체이지 채널이
아니어서, edit 입력에 닿는 비디오는 `edit`(보라), 게시 노드로 나가는 비디오는 `youtube` · `instagram` 이다(제품 globals.css
채널 주석). 비디오 노드의 출력점을 보라로 칠하는 것이 맞다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/node-side-handle.css`. React 표면은 없다 — 연결 핸들 배선은 소비처(React Flow)의 몫이라 감싸는 컴포넌트를 두면 그 배선이 LOUIS 로 넘어온다 |
| Figma         | `done`         | NodeSideHandle — Channel(image·text·edit·audio·youtube·instagram) × State(Default·Disabled) = 12 variant(2026-10-14, [DS-D-0099](../governance/decisions/DS-D-0099-figma-partials-close.md)). 슬롯: Glyph(INSTANCE_SWAP). Disabled 는 면 `color/node/handle-bg-disabled-*` · 잉크 `handle-icon-disabled-*` 이고 안쪽 광이 없다. Hover · Active · 메뉴 열림은 열지 않았다(아래). 세트 · parity 계약 · 기하 실측 · 브라우저 되재기가 DS-D-0035 를 채운다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | React 표면이 없고 제품 렌더 대조(`$noProductRender`)가 아직이다. 호버 · 프레스는 Figma 가 표현할 수 없는 칸으로 남는다 |

## Anatomy

- 셸 28×28, 반경 8. 값은 `--node-side-handle-size` · `--node-side-handle-radius` 가 갖는다.
- 디스크가 셸을 꽉 채운다(`w-full h-full` · `rounded-[inherit]`).
- 글리프 20. 헤더 액션의 16보다 크다 — 이 버튼은 라벨 없이 글리프만으로 채널을 말한다.
- 디스크 안쪽에 흰 광이 있다. 제품은 `::before` 에 `inset 0 0 8px` 흰 그림자를
  `mix-blend-mode: overlay` 로 얹고, Figma 는 INNER_SHADOW 의 blendMode 로 같은 것을 그린다.
- 레일 좌표는 이 컴포넌트가 갖지 않는다. 카드 패딩 박스에서 바깥으로 `--node-side-gap`,
  버튼끼리 세로 간격은 `--node-side-stack-gap` 이며 둘 다 캔버스가 소유한다.

## 상태 축 — 연 것 하나, 열지 않은 것 둘

**Disabled 는 열었다(2026-10-14, [DS-D-0099](../governance/decisions/DS-D-0099-figma-partials-close.md)).** 예전 사유는 「비활성 면이
라이트와 다크에서 서로 다른 토큰을 쓰고 라이트 쪽은 필터라 값이 없다」였다. [DS-D-0083](../governance/decisions/DS-D-0083-deck-feedback-triage.md)
이 라이트 비활성 토큰 `color-node-handle-{bg,icon}-disabled-{채널}` 을 제품 필터(`brightness(0.78) saturate(0.95)`)를 구운 색으로 세워 그
사유가 풀렸다 — 한 변수의 라이트/다크 쌍이 두 테마를 다 담는다. Figma `State=Disabled` 칸은 면 `color/node/handle-bg-disabled-{채널}` ·
글리프 `color/node/handle-icon-disabled-{채널}` 에 묶이고 안쪽 광(INNER_SHADOW)이 없다 — 레시피가 비활성에서 `::before` 를 끄는 것과 같다.

열지 않은 둘은 **Figma 가 표현할 수 없는 칸**이다.

1. **Hover·Active 는 색이 아니라 필터다.** 호버는 `brightness(1.1)`, 프레스는 `brightness(0.94)`
   에 디스크 스케일 1.08/0.94다. 옮길 변수가 없고, 같은 면으로 그리면 「호버가 기본과 같다」는
   거짓을 파일에 새긴다. 값은 레시피와 이 문서 States 표가 갖는다.
2. **메뉴가 열린 상태는 기본과 시각이 같다.** 소스에서 `.buttonActive` 가 더하는 선언은
   `filter: none` 하나뿐이고 면과 잉크는 기본 톤 그대로다. `Open` 축을 여는 것이 오히려 거짓이다.

## Properties

| 이름 | 종류 | 뜻 |
| --- | --- | --- |
| `Glyph` | 슬롯 (INSTANCE_SWAP) | 20px 글리프. 같은 채널 안에서도 자리마다 다르다 |
| `Channel` | 축 (6) | `image` · `text` · `edit` · `audio` · `youtube` · `instagram`. 디스크의 면 색을 가른다 |
| `State` | 축 (2) | `Default` · `Disabled`. 비활성 토큰으로 가는 면 · 잉크와 꺼지는 안쪽 광 |

레일 좌표·개수·순서는 이 컴포넌트가 갖지 않는다. 어느 채널 버튼이 몇 개 서는지는 노드 타입이
정하고, 그 배치는 캔버스가 토큰으로 갖는다.

## States

| 상태 | 무엇이 바뀌나 | Figma |
| --- | --- | --- |
| 기본 | 채널 500 면 · 흰 글리프 · 안쪽 광 | 있다 |
| 호버 | `brightness(1.1)` + 디스크 `scale(1.08)` | 없다 — 색이 아니라 필터다 |
| 프레스 | `brightness(0.94)` + 디스크 `scale(0.94)` | 없다 — 같은 이유 |
| 메뉴 열림 | `filter: none` 만 더한다 = **기본과 같다** | 축을 열지 않는 것이 옳다 |
| 비활성 | 다크는 채널 900 면 · 700 잉크, 라이트는 제품 필터를 구운 비활성 토큰 · 안쪽 광 꺼짐 | 있다 — `State=Disabled`(DS-D-0099) |

## Content

글자가 없다. 채널의 뜻은 **색과 글리프**가 나르고, 이름은 툴팁과 `aria-label` 이 나른다.
비활성일 때 툴팁이 「왜 연결할 수 없는가」로 바뀌는 것도 이 버튼의 계약이다 — 색만으로는
「지금 못 쓴다」와 「원래 그 색이다」를 가릴 수 없다.

## Accessibility

- 28×28 은 포인터 타깃 최소치 24를 넘는다. 세로로 쌓일 때 간격 8이 붙어 있어 이웃과 섞이지
  않는다.
- **색이 유일한 신호다.** 채널 셋이 글리프로도 갈리지만(image·text·edit), 비활성은 색과
  밝기로만 표시된다. 그래서 툴팁의 문구가 접근성 계약의 일부이고, 위 Content 절이 그것을 적는다.
- React Flow 의 연결 핸들로도 쓰이므로 `aria-expanded` 와 `aria-disabled` 를 함께 갖는다.
  버튼이면서 연결 대상이라는 이중 역할이 이 표면의 어려운 부분이다.

## Acceptance tests

`packages/react/test/node-chrome.browser.test.tsx` 가 실브라우저에서 잰다 — 셸 28×28 과 반경 8,
글리프 20, **셸의 면이 투명하다**는 사실, 채널 셋이 각자의 토큰을 물고 서로 다르다는 것,
비활성 디스크가 채널별 비활성 토큰으로 간다는 것.

**디스크의 28 과 8 은 이 시험만 잡는다.** 레시피는 그 둘을 수로 적지 않고 `100%` 와 `inherit`
로 적는다 — 관계가 계약이고 수는 그 결과이기 때문이다. 그래서 저작 CSS 의 글자를 읽는
`verify-recipe-record` 는 그 칸을 볼 수 없고, 렌더해야만 나온다. 실제로 디스크 폭을 24 로
바꿔 두고 돌려 보면 이 시험만 빨개진다(`expected 24 to be 28`).

「사이드 핸들 열두 칸」 시험이 Figma 의 열두 칸(Channel 6 × State 2)을 기록의 키마다 렌더해 기하 · 면 · 잉크 · 안쪽 광의
유무를 맞댄다(DS-D-0035 (c)). 호버 · 프레스를 Figma 에 담지 않은 사유는 `figma/components.measured.json` 의
`$whyNoHoverVariant` 가 갖는다 — 밝기와 스케일은 코드에는 있고 Figma 에는 없다.

## Known deviations

1. ~~**비활성 면이 라이트에서 제품과 갈린다.**~~ **2026-10-12 해소(DS-D-0083).** 라이트 비활성 토큰
   `color-node-handle-{bg,icon}-disabled-{채널}` 이 이제 제품 필터(`brightness(0.78) saturate(0.95)`)를 채널 200 ·
   500 에 미리 곱한 색을 가리킨다(`primitive.color.node-handle-disabled-light.*`). 식은 제품 archiveThumbnail
   `toneDownLightInactive` 와 같고, 제품이 그 식과 라이브 DOM 필터의 차이를 0 으로 실측했다. 다크는 그대로다.
2. **흰 잉크가 `fg-on-danger` 에서 온다.** 두 테마에서 같은 흰색을 갖는 세만틱이 그 이름
   하나뿐이다. 「채널 면 위의 잉크」라는 이름이 아직 없다는 사실을 여기 적는다 — 값은 제품의
   `palette-gray-000` 과 같다.
3. **`data-channel` 을 붙이지 않으면 시스템 강조색이 면이 된다.** 채널은 기본값 없는 축이라
   CSS 에는 「축을 지정하지 않은 상태」가 실재한다. 여섯 중 하나로 채우면 **거짓 채널**이 되므로
   `accent-primary` 로 둔다.
4. **글리프 기본값이 채널을 주장하지 않는다.** 같은 채널 안에서도 자리마다 글리프가 다르다 —
   image 채널이 시작 프레임에서는 align-left, 끝 프레임에서는 align-right 를 쓴다. 그래서
   글리프는 축이 아니라 슬롯이고, 기본값 하나만 둔다. edit 채널이 실제로 쓰는 video-camera 는
   아이콘 세트에 아직 없다.
5. **툴팁과 연결 핸들을 담지 않는다.** 제품은 이 버튼을 React Flow 의 `Handle` 로 만들거나
   일반 버튼으로 만들고 둘 다 `ChromeTooltip` 으로 감싼다. 연결 가능 여부는 데이터가 정하는
   것이라 Figma 변형이 담을 축이 아니다.

## Related

- [Node Shell](node-shell.md) — 이 버튼이 붙는 카드
- [Node Chip](node-chip.md) — 카드 안 메타 툴바의 알약
