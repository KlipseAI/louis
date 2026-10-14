---
id: chat-panel
status: experimental
authority: normative
summary: 접힌 알약이 대화 창으로 자라, 지금 보고 있는 것을 말로 고치게 합니다.
---

# Chat Panel

화면 구석에 떠 있는 대화 셸이다(`.louis-chat-panel`, [DS-D-0094](../governance/decisions/DS-D-0094-chat-panel.md)). 쉴 때는 이름 하나를 단
**알약**이고, 누르면 **같은 요소가 그대로** 대화 창으로 자란다 — 알약이 창의 머리가 된다. 창은 기록(말풍선) · 제안 · 입력 줄을 담고, 보고 있는
화면을 가리지 않도록 비모달이며 소비처가 전체 투명도를 낮출 수 있다. 확인 · 결정을 받는 가운데 창이면 [Dialog](dialog.md), 목록을 고르는 떠 있는
면이면 [Menu Popover](menu-popover.md), 한 줄 알림이면 [Toast](toast.md) 다.

제품 정본은 하이라이트 판의 「AI 클립 수정」이다 — `components/scenes/highlight/ClipRefinementWidget.tsx`(셸 `:447-461`, 머리 `:462-557`, 본문 `:558-567`,
대화 `:148-293`)와 `components/scenes/highlightSceneStyles.ts`(셸 `:795-926`, 머리 `:657-793`, 본문 `:589-655`, 대화 · 독 `:445-587` · `:928-1082`),
keyframe `app/keyframes.css:911-958`(통합 판 `54b62a8aa`).

**안의 조작은 있는 부품을 그대로 앉힌다.** 보내기 · 적용 · 취소는 [Button](button.md), 보내기의 스피너 라벨은
[Inline Loading Label](inline-loading-label.md), 투명도는 [Slider](slider.md), 닫기는 [Icon Button](icon-button.md) `ghost`, 생각 중 글자는
[Loading Word](loading-word.md) 다. 이 부품이 소유하는 것은 셸(알약 ↔ 창) · 빛과 고리 · 머리 · 본문 · 기록 · 말풍선 · 차이 상자 · 미디어 틀 · 결정 줄 ·
독 · 제안 · 입력 줄 · 잠김 단추와 그 모션이다.

**늘 어두운 면은 토큰이 아니라 스코프로 받는다.** 레시피는 일반 시맨틱만 쓴다 — 소비처가 루트에 `data-theme="dark"` 를 달면 `tokens.css` 의
다크 선언이 그 아래에서 풀려 제품의 고정 `palette-gray-900` 면과 같은 색이 나오고, 안에 앉는 버튼 · 슬라이더 · 로딩 글자도 덮어쓰기 없이 다크 값으로 선다
([DS-D-0068](../governance/decisions/DS-D-0068-hairline-recipe-per-theme-scope.md) — 조합값도 스코프마다 다시 풀린다). 그 속성을 빼면 창은 테마를 따라 밝아진다.

```html
<!-- 루트: 늘 어두운 창이면 data-theme="dark". 자리 · 겹 순서 · 투명도는 소비처(style/class). -->
<div class="louis-chat-panel" data-theme="dark" data-state="open"
     role="dialog" aria-labelledby="refine-title"
     style="--louis-chat-panel-pill-inline-size: 152px">
  <header class="louis-chat-panel__header">
    <button type="button" class="louis-chat-panel__trigger" aria-expanded="true" disabled tabindex="-1">
      <span class="louis-chat-panel__trigger-icon" aria-hidden="true"><svg>…</svg></span>
      <span class="louis-chat-panel__title" id="refine-title">AI 클립 수정</span>
    </button>
    <div class="louis-chat-panel__controls">
      <label class="louis-slider louis-chat-panel__opacity" data-size="md">
        <input type="range" class="louis-slider__control" min="35" max="100" step="5" value="100"
               aria-label="채팅창 투명도" aria-valuetext="투명도 100%" style="--louis-slider-fill: 100%">
      </label>
      <button type="button" class="louis-icon-button louis-chat-panel__close" data-variant="ghost" data-size="md"
              aria-label="AI 클립 수정 닫기"><svg class="louis-icon-button__glyph" aria-hidden="true">…x…</svg></button>
    </div>
  </header>

  <div class="louis-chat-panel__body">
    <div class="louis-chat-panel__log" role="log" aria-label="AI 클립 수정 대화">
      <div class="louis-chat-panel__bubble" data-from="user"><p class="louis-chat-panel__text">앞에 1초 추가</p></div>
      <div class="louis-chat-panel__bubble" data-from="assistant">
        <p class="louis-chat-panel__text">시작을 1초 앞당겨 슛 직전 패스부터 보이게 한 수정안입니다.</p>
        <div class="louis-chat-panel__diff">00:00 ~ 00:04 (4초)</div>
      </div>
      <div class="louis-chat-panel__media">…미리보기(소비처)…</div>
      <div class="louis-chat-panel__actions">
        <button class="louis-button" data-variant="primary" data-size="md"><span class="louis-button__label">적용</span></button>
        <button class="louis-button" data-variant="ghost" data-size="md"><span class="louis-button__label">취소</span></button>
      </div>
      <div class="louis-chat-panel__bubble" data-from="assistant" aria-busy="true">
        <span class="louis-chat-panel__text louis-loading-word">생각하는 중</span>
      </div>
    </div>

    <div class="louis-chat-panel__dock">
      <!-- 대화가 비었을 때만 -->
      <div class="louis-chat-panel__suggestions" role="group" aria-label="빠른 수정">
        <button type="button" class="louis-chat-panel__suggestion">앞에 5초 추가</button>
        <button type="button" class="louis-chat-panel__suggestion">뒤에 3초 자르기</button>
      </div>
      <div class="louis-chat-panel__composer">
        <input type="text" class="louis-chat-panel__input" placeholder="수정할 내용을 입력하세요" aria-label="수정할 내용">
        <button class="louis-button" data-variant="primary" data-size="md" aria-busy="false">…inline-loading-label 「전송」…</button>
      </div>
    </div>
  </div>
</div>
```

잠김(요금제가 없을 때)은 본문에 `__log` · `__dock` 대신 `<button class="louis-chat-panel__gate">AI 클립 수정 — Pro</button>` 하나를 둔다.

계산값: 알약 높이 40 · 반경 12, 창 360 × 560(화면 − 48 상한) · 안 8 · 반경 22, 머리 48(8 + 32 + 8), 입력 줄 48 · 반경 14(22 − 8), 잠김 높이 43.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/chat-panel.css` · 실브라우저 시험 `chat-panel.browser.test.tsx`. React 표면은 없다 — 여닫기 · 초점 · 보내기 · 투명도는 소비처 스크립트이고 마크업 계약을 문다(DS-D-0094) |
| Figma         | `done`      | 2026-10-14 — `ChatPanel` 세트(Expanded `false` · `true` — 코드 `data-state` closed · open × State `Default` · `Hover`, 열린 창의 Hover 는 채움 칸, TEXT `Title`, BOOLEAN `Controls`), 말풍선 `ChatBubble`(Layout `user` · `assistant` — 코드 `data-from` 철자 · `media`, TEXT `Text` · `DiffText`, BOOLEAN `Diff`), 독 `ChatDock`(BOOLEAN `Suggestions`, TEXT `Placeholder`), 제안 `ChatSuggestion`(State `Default` · `Hover` · `Disabled`), 잠김 `ChatGate`(State `Default` · `Hover`). 늘 어두운 창이라 Semantic Color 모드를 Dark 로 고정했다. 빛은 Glow 층의 안쪽 그림자, 고리는 Ring 층의 INSIDE 획, 본문은 시드 데이터 인스턴스. 독 위 선 · 제안 사이 선은 단색 1px(CSS 는 양끝이 사라지는 그라디언트). 변수 `motion/chat-panel-morph`. 기록 `chat-panel` · `chat-bubble` · `chat-dock` · `chat-suggestion` · `chat-gate` 와 parity 기하 계약, 실브라우저 되재기(`chat-panel-geometry.browser.test.tsx`). 제품 렌더 대조는 없다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## When to use

- 화면을 보면서 AI 에게 말로 고칠 것을 요청하고, 그 결과를 미리 본 뒤 적용 · 취소한다.
- 쓰지 않는다 — 한 번의 확인 · 결정([Dialog](dialog.md)), 한 줄 알림([Toast](toast.md)), 늘 펼쳐 둔 사이드 패널(인스펙터), 반투명 유리 막대([Floating Shell](floating-shell.md)).

## Anatomy

1. 셸(루트) — 알약(높이 40 · 반경 12) ↔ 창(360 × 560 · 안 8 · 반경 22). 사방 안쪽 파란 빛(닫힘 8 → 열림 24), 열린 창은 안쪽 1px 고리(흰 16%)와 바깥 1px 선(흰 8%).
2. 머리(`__header`) — 알약 단추(`__trigger`: 글리프 칸 `__trigger-icon` 18 + 제목 `__title`) · 조작 묶음(`__controls`: 투명도 Slider 64 `__opacity` + 닫기 Icon Button 32 `__close`). 조작은 열림에만.
3. 본문(`__body`) — 닫힘에 크기 0 · `inert`.
4. 기록(`__log`, `role="log"`) — 말풍선(`__bubble[data-from=user|assistant]` + `__text`), 차이 상자(`__diff`), 미디어 틀(`__media`), 결정 줄(`__actions`).
5. 독(`__dock`) — 제안 줄(`__suggestions` · `__suggestion`, 대화가 비었을 때 — 위에 양끝이 사라지는 1px 선) + 입력 줄(`__composer`: `__input` + 보내기 Button).
6. 잠김(`__gate`) — 요금제가 없을 때 기록 · 독 대신 서는 점선 단추.

## Properties

| 속성 | 값 | 자리 · 뜻 |
| --- | --- | --- |
| `data-state` | `closed` · `open` · `closing` | 루트 — 알약 · 창 · 접히는 440ms(소비처 타이머가 `motion-chat-panel-morph-duration` 을 읽는다) |
| `data-theme` | `dark`(제품 기본) | 루트 — 늘 어두운 창. 빼면 테마를 따른다 |
| `data-from` | `user` · `assistant` | `__bubble` — 오른쪽 강조 면 · 왼쪽 흰 12% 면 |
| `aria-busy` | `true` | 생각 중 `__bubble` — 4px 올라오며 들어온다 |
| `--louis-chat-panel-inline-size` | 길이(기본 `min(360px, 100vw − 48px)`) | 루트 인라인 — 창 폭 |
| `--louis-chat-panel-block-size` | 길이(기본 `min(560px, 100vh − 48px)`) | 루트 인라인 — 창 높이 |
| `--louis-chat-panel-pill-inline-size` | 길이(기본 `fit-content`) | 루트 인라인 — 접힌 알약 폭. `fit-content` 는 보간되지 않아 소비처가 접힌 머리를 재서 px 로 준다 |

자리(화면 구석 `fixed` · 무대 구석 · 폰 판), 겹 순서(`--louis-layer-popover`), 전체 투명도(0.35 ~ 1)는 소비처의 배치다 — 레시피는 갖지 않는다
([Floating Shell](floating-shell.md) 「z-index 를 갖지 않는다」와 같은 판단).

## States

| 상태 | 그림 |
| --- | --- |
| `closed` | 알약 — 글리프 + 제목(medium), 빛 8, 그림자 `elevation-toast`. 호버에 알약 전체가 흰 8% |
| `open` | 창 — 머리 안 8 · 제목 semibold · 조작 묶음, 본문이 6px 올라오며 나타남(지연 80), 빛 24 · 고리 · 바깥 선 + `elevation-modal`, 튐(.84 → 72% 1.015 → 1) |
| `closing` | 내용이 먼저 사라지고 높이가 창에 남은 채 `max-block-size` 가 40 으로 접힌다, 한 번 움츠림(46% .976), 누를 수 없다 |
| 독 · 제안 있음 | 위 선과 제안 줄이 선다, 열릴 때 하나씩 올라온다(stagger) |
| 제안 호버 · 비활성 | 글이 `fg-tertiary` → `fg-primary` · 불투명도 50% |
| 생각 중 | 도우미 말풍선 `aria-busy` + Loading Word, 보내기 Button `aria-busy` · `disabled` |
| 잠김 · 호버 | 점선 `gray-000-alpha-16` · 글 `fg-tertiary` → 점선 · 글 `accent-primary-hover`, 면 흰 4% |
| 줄인 모션 | 모핑 · 튐 · 올라옴 없이 즉시 바뀐다 |

## Interaction and responsive behavior

- 알약을 누르면 열리고 초점이 닫기로 간다(입력칸이 아니다 — 폰에서 자판이 올라온다). 닫기 · Esc(초점이 창 안일 때)로 닫히면 다 접힌 뒤 알약으로 돌아온다.
  그사이 다른 곳을 눌렀으면 그 초점을 둔다.
- 제안을 누르면 그 글이 그대로 사용자 말풍선이 된다. Enter 로 보낸다(IME 조합 중 `isComposing` 제외).
- 수정안이 오면 차이 상자 → 미디어 틀(미리보기) → 결정 줄 순으로 선다 — 미리 본 뒤에 묻는다.
- 창 크기는 변수 셋으로 맞춘다. 무대 안 · 폰 판의 자리 식은 판의 막대 높이를 재는 소비처 계산이다.

## Content

- 제목은 동사 + 대상 한 줄(「AI 클립 수정」) — 알약의 폭이 된다.
- 제안은 셋까지, 사용자가 칠 법한 말 그대로(「앞에 5초 추가」).
- 생각 중은 「생각하는 중」 한 마디 — 로딩 글자가 흐른다.
- 잠김은 「제목 — 요금제」(「AI 클립 수정 — Pro」).

## Accessibility

- 열림에만 루트 `role="dialog"` + 이름(`aria-labelledby` 제목). 비모달 — 초점을 가두지 않는다.
- 닫힘 — 알약 단추 `aria-expanded="false"` · 켜짐, 조작 묶음 `aria-hidden="true"` 와 그 안 조작 `tabindex="-1"`, 본문 `aria-hidden="true"` + `inert`
  (닫힌 칩 · 입력칸이 탭에 잡히지 않게). 열림 — 알약 단추 `aria-expanded="true"` · `disabled` · `tabindex="-1"`.
- 기록은 `role="log"` — 새 말풍선을 낭독한다(DS-D-0094 판정 8). 생각 중 말풍선 · 보내기 버튼은 `aria-busy`.
- 슬라이더는 `aria-valuetext`(「투명도 100%」). 닫기 · 입력칸은 보이는 라벨이 없어 `aria-label`.
- 포커스 링은 그리지 않는다(DS-D-0074). 강제 색에서는 창 · 말풍선 · 입력 줄에 테두리를 되살리고, 입력 줄이 `:focus-within` 링을 그린다.
- 대비(다크 스코프, 창 면 `bg-overlay` 위) — 제목 · 도우미 글 16.54 · 11.66, 제안 `fg-tertiary` 5.25, placeholder `fg-secondary` on 입력 줄 5.63,
  차이 상자 글 `fg-secondary` 4.53, 잠김 글 5.25 · 호버 5.88, 닫기 글리프 5.81(그래픽). 사용자 말풍선 3.37 은 Known deviations 1.

## Specification

| 칸 | 값 |
| --- | --- |
| 알약 | 높이 40 · 안 0 16 · 사이 8 · 글리프 칸 18 · 반경 12 |
| 창 | 360 × 560(화면 − 48 상한) · 안 8 · 반경 22 · 머리 48 · 조작 묶음 64 + 8 + 32 = 104(상한 128) |
| 기록 | 위 10 · 좌우 14 · 말풍선 사이 8 · 말풍선 안 8 · 12 · 반경 12 · 최대 85% |
| 차이 상자 | 위 6 · 안 6 · 10 · 반경 8 · 사이 6 · caption |
| 독 | 위 10 · 사이 10 · 제안 높이 18 · 제안 간격 20 · 입력 줄 8 · 32 · 8 = 48 · 반경 14 |
| 잠김 | 안 10 · 16 · 반경 10 · 1px 점선 · 높이 43 |
| 모션 | `motion-chat-panel-morph` 440ms(`menu-enter` 곡선, lifecycle `morph`) · 제안 stagger 360ms(지연 340 · 380 · 450) · 생각 중 `overlay-enter` 200ms |

## Acceptance tests

`packages/react/test/chat-panel.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다.

1. 알약 — 높이 40 · 반경 12 · 안 0 16 · 사이 8 · 글리프 칸 18, 본문은 크기 0 이고 조작 묶음은 폭 0 · 투명.
2. 창 — 360 × 560 · 안 8 · 반경 22 · 머리 48 · 조작 묶음 104, 빛 24 · 고리 보임.
3. 기록 · 말풍선 — 위 10 · 좌우 14 · 사이 8, 말풍선 8 · 12 · 반경 12 · 최대 85%, 사용자 오른쪽 · 도우미 왼쪽.
4. 독 — 위 10 · 사이 10, 제안 간격 20, 입력 줄 48 · 반경 14 · 입력칸 32, 잠김 43 · 반경 10.
5. 다크 스코프 — `data-theme="dark"` 루트 안에서 창 면이 `#171b22`, 안의 Button primary 가 다크 값이다.
6. 대비는 실제로 잰다 — 위 Accessibility 의 쌍을 계산값에서 다시 잰다(차이 상자 4.5 이상, placeholder 4.5 이상, 잠김 4.5 이상).
7. 호버 규칙은 모두 `@media (hover: hover)` 안이고, 줄인 모션에서 루트 애니메이션이 없다.

## Known deviations

1. 사용자 말풍선 글 `fg-inverse` on `accent-primary` 3.37 — [Button](button.md) primary 의 소유자 수용 편차와 같은 쌍이다(DS-D-0094 판정 3).
   여러 줄 본문이라 버튼 라벨 판정을 넓혀 읽었다 — 고쳐 올린다면 `blue-620` #006ec4(5.00)이 가장 가까운 통과 값이다.
2. 차이 상자 글 4.53 — 기준 바로 위다. 제품 gray-200(6.12)에 맞는 다크 칸이 없어 한 칸 어둡다.
3. 전체 투명도를 낮추면(소비처 값, 0.35 까지) 모든 대비가 기준 아래로 내려간다 — 사용자가 고르는 보기 설정이다.
4. 제품의 스프링 곡선 · 제목 자간 전이 · 닫기 밝기 필터는 옮기지 않았다(허용 속성 · 토큰 밖). 넘침은 keyframe 의 72% 칸이 그린다.
5. 제안 들어옴 지연 340 · 380 · 450 — 제품 340 · 440 · 540. stagger 토큰 간격을 따른다.
6. `transform-origin` 은 물리 방향(오른쪽 아래)이다 — RTL 소비처가 덮는다.
7. 그림자가 가볍다 — 닫힘 `elevation-toast`, 열림 `elevation-modal`(제품 `0 6 20 20%` · `0 12 40 28% + 0 32 80 20%`, 판정 12).
8. 투명도 슬라이더는 LOUIS Slider 그대로다 — 채움 · 썸이 회색 → 파랑, 레일 흰 20% → `stroke-default`(판정 6).
9. 반짝 글리프는 아이콘 세트 회차에 `sparkle-generate` 로 더한다(판정 15) — 그때까지 소비처가 인라인으로 넣는다.

## Migration and changelog

- **제품에서 발견한 것.** 비대화(`hideHeader=false`) 갈래와 라이트 말풍선 갈래는 부르는 곳이 없는 죽은 코드다(`components/scenes/HighlightProjectScene.tsx:2532`).
  잠김 버튼은 위젯 갈래가 없어 라이트 테마에서 어두운 창 위에 라이트 잉크를 칠한다 — 글 3.74 · 점선이 면과 같은 색(`components/scenes/highlightSceneStyles.ts:1053-1072`).
  입력칸 placeholder 는 입력 줄 위 4.09 다(`components/scenes/highlightSceneStyles.ts:928-940`). 슬라이더 토큰 덮기 셋(`components/scenes/highlightSceneStyles.ts:779-783`)은
  다크 스코프가 없어서 생겼다. 닫힌 본문의 `inert` 는 칩 · 입력칸이 탭에 잡히던 결함을 막은 것이다(`components/scenes/highlight/ClipRefinementWidget.tsx:558-563`).
- **고쳐 올린 값**(DS-D-0084 3항) — placeholder `palette-gray-400` 4.09 → `fg-secondary` 5.63, 잠김 라이트 결함 → 다크 스코프 `fg-tertiary` 5.25 ·
  점선 `gray-000-alpha-16`, 슬라이더 덮기 셋 제거.
- 2026-10-14 섰다 — [DS-D-0094](../governance/decisions/DS-D-0094-chat-panel.md).
