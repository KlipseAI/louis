---
id: command-palette
status: experimental
authority: normative
summary: 입력 하나로 앱의 메뉴 · 프로젝트 · 설정을 찾아 바로 실행합니다. ⌘K 나 사이드바 검색으로 엽니다.
---

# Command Palette

앱 전체의 행동을 검색해 실행하는 모달이다(`.louis-command-palette`, [DS-D-0095](../governance/decisions/DS-D-0095-command-palette.md)). 제목 · 액션 행이 없고,
화면 위쪽에 유리 패널로 서며, 입력 하나가 아래 목록을 몬다. 결정을 요구하는 과업은 [Dialog](dialog.md), 트리거 옆의 짧은 명령은 [Menu / Popover](menu-popover.md),
폼의 값 하나를 고르는 검색 목록은 [Select](select.md) 다.

제품 정본은 사이드바 검색과 ⌘K 가 여는 `components/navigation/CommandPalette.tsx`(셸 · 상수 `:45-302`, 수명 `:342-414`, 키보드 `:594-652`, 행 `:677-768`,
플라이아웃 `:772-818`, 발 `:822-852`)와 여는 자리 `components/navigation/Gnb.tsx:2828-2838`(⌘K) · `components/navigation/Gnb.tsx:5652-5667`(렌더)이다(통합 판 `54b62a8aa`).

**이 부품이 소유하는 것은 셸과 자리뿐이다.** 셸(딤 · 유리 면 · 위쪽 정렬 배치) · 검색줄 · 목록 자리 · 플라이아웃 자리 · 키 안내 발. 그 안에 서는 조각은
기존 부품이다 — 행은 [Menu](menu-popover.md) 항목의 한 줄 변형 `.louis-menu__item[data-layout="inline"]`, 그룹 제목은 `.louis-menu__group-label`, 닫기는
[Icon Button](icon-button.md) `sm` `ghost`, 키는 [Keycap](keycap.md), 플라이아웃 면은 `.louis-popover`, 글리프는 [Iconography](../foundations/iconography.md) 의 `.louis-icon` 이다.

**Dialog 의 변형이 아니다.** Dialog 는 제목 · 설명 · 액션 골격의 과업 면이고 가운데에 서며 불투명 `bg-overlay` · `elevation-modal` 이다. 팔레트는 제목이 없고
위쪽에 서며, 면이 유리(반투명 + 흐림)이고, 그림자가 `elevation-menu` 다. 모달 **행동**(가둠 · inert · Esc · 복귀 · 스크롤 잠금)은 Dialog 와 같은 계약을 가리킨다.
[Floating Shell](floating-shell.md) 과 재료가 닮았지만 모달이고 그림자를 한 겹 더 얹는다.

```html
<div class="louis-command-palette" role="dialog" aria-modal="true" aria-label="검색"
     data-louis-state="open"
     style="--louis-command-palette-from-x: -508px; --louis-command-palette-from-y: -96px;
            --louis-command-palette-from-scale-x: 0.36; --louis-command-palette-from-scale-y: 0.07;
            --louis-command-palette-flyout-top: 186px">
  <div class="louis-command-palette__scrim" aria-hidden="true"></div>
  <div class="louis-command-palette__panel">
    <div class="louis-command-palette__search">
      <svg class="louis-icon louis-command-palette__search-icon" data-size="sm" aria-hidden="true">…magnifying-glass…</svg>
      <input class="louis-command-palette__input" type="text" role="combobox"
             aria-label="메뉴 · 프로젝트 검색" aria-expanded="true" aria-autocomplete="list"
             aria-controls="cp-flyout" aria-activedescendant="cp-theme-dark"
             placeholder="메뉴 · 프로젝트 검색" autocomplete="off" spellcheck="false">
      <button type="button" class="louis-icon-button" data-size="sm" data-variant="ghost" aria-label="닫기">
        <svg class="louis-icon" data-size="sm" aria-hidden="true">…x…</svg>
      </button>
    </div>
    <div class="louis-command-palette__body">
      <div class="louis-command-palette__list" id="cp-list" role="listbox" aria-label="검색 결과">
        <div class="louis-command-palette__group" role="group" aria-labelledby="cp-g-canvas">
          <div class="louis-menu__group-label" id="cp-g-canvas">캔버스</div>
          <div class="louis-menu__item" data-layout="inline" role="option" id="cp-open-canvas">
            <span class="louis-menu__item-icon"><svg class="louis-icon" data-size="sm" aria-hidden="true">…</svg></span>
            <span class="louis-menu__item-label">캔버스</span>
            <span class="louis-menu__item-description">노드로 이미지 · 영상 만들기</span>
          </div>
        </div>
        <div class="louis-command-palette__group" role="group" aria-labelledby="cp-g-settings">
          <div class="louis-menu__group-label" id="cp-g-settings">설정</div>
          <div class="louis-menu__item" data-layout="inline" role="option" id="cp-theme" data-highlighted="true">
            <span class="louis-menu__item-icon"><svg class="louis-icon" data-size="sm" aria-hidden="true">…paint-roller…</svg></span>
            <span class="louis-menu__item-label">테마</span>
            <span class="louis-menu__item-trailing">다크</span>
            <svg class="louis-command-palette__chevron" aria-hidden="true">…caret-right…</svg>
          </div>
        </div>
        <div class="louis-command-palette__group" role="group" aria-labelledby="cp-g-account">
          <div class="louis-menu__group-label" id="cp-g-account">계정</div>
          <div class="louis-menu__item" data-layout="inline" data-tone="danger" role="option" id="cp-logout">
            <span class="louis-menu__item-icon"><svg class="louis-icon" data-size="sm" aria-hidden="true">…sign-out…</svg></span>
            <span class="louis-menu__item-label">로그아웃</span>
          </div>
        </div>
      </div>
      <div class="louis-popover louis-command-palette__flyout" id="cp-flyout" role="listbox" aria-labelledby="cp-flyout-title">
        <div class="louis-menu__group-label" id="cp-flyout-title">테마</div>
        <div class="louis-menu__item" data-layout="inline" role="option" id="cp-theme-system" aria-selected="false">…시스템…</div>
        <div class="louis-menu__item" data-layout="inline" role="option" id="cp-theme-light" aria-selected="false">…라이트…</div>
        <div class="louis-menu__item" data-layout="inline" role="option" id="cp-theme-dark" aria-selected="true" data-highlighted="true">…다크…</div>
      </div>
    </div>
    <div class="louis-command-palette__footer">
      <span class="louis-command-palette__hint">
        <kbd class="louis-keycap"><svg aria-hidden="true">…arrow-up…</svg><span class="louis-visually-hidden">위 화살표</span></kbd>
        <kbd class="louis-keycap"><svg aria-hidden="true">…arrow-down…</svg><span class="louis-visually-hidden">아래 화살표</span></kbd>
        <span>이동</span>
      </span>
      <span class="louis-command-palette__hint"><kbd class="louis-keycap">Esc</kbd><span>닫기</span></span>
      <span class="louis-command-palette__hint" data-align="end">
        <span>선택</span>
        <kbd class="louis-keycap"><svg aria-hidden="true">…arrow-elbow-down-left…</svg><span class="louis-visually-hidden">Enter</span></kbd>
      </span>
    </div>
    <div class="louis-visually-hidden" role="status" aria-live="polite">결과 12개</div>
  </div>
</div>
```

계산값: 패널 560 · 높이 ≤ min(70dvh, 520) · 반경 16, 검색줄 48(12 + 24 + 12) · 좌 18 · 우 14, 행 37(Menu 항목), 발 38(8 + 22 + 8) · 좌우 18.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/command-palette.css` + Menu `data-layout="inline"`(`menu-popover.css`) · 실브라우저 시험 `command-palette.browser.test.tsx`. React 표면은 없다 — 거르기 · 하이라이트 · 수명 · 포커스는 소비처 스크립트이고 마크업 계약을 문다(DS-D-0095) |
| Figma         | `partial`      | DS · Components 「3 · 오버레이」의 `CommandPalette`(패널 한 장, TEXT `Placeholder`) · `CommandPaletteEmpty`(TEXT `Label`)와 `Menu` 세트 `Layout=inline` 일곱 변형, 아이콘 `icon/arrow-down`, 예시 보드 「Command Palette — 열림 · 테마 플라이아웃」 · 「Command Palette — 결과 없음」. 기록 `command-palette` · `command-palette-empty` · menu-popover `inlineItem` 과 parity 기하 계약, 되재기 `command-palette-geometry.browser.test.tsx`. 제품 렌더 대조가 없어 `partial` |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 소비처 1 · 제품이 아직 이 클래스를 물지 않는다 · 실기 스크린리더 검토 전 |

## When to use

- 앱 어디서나 같은 단축키로 여는 전역 이동 · 실행. 한 앱에 하나다.
- 쓰지 않는 곳: 화면 안 목록 거르기(검색 필드 + 목록), 폼 값 고르기([Select](select.md)), 트리거 옆 명령([Menu](menu-popover.md)), 결정 요구([Dialog](dialog.md)).

## Anatomy

1. 루트(`.louis-command-palette`) — 화면을 덮는 모달, 위 14vh(좁은 화면 8vh) · 좌우 아래 16(12). 겹 `layer-critical`.
2. 딤(`__scrim`) — `dim-modal`. 누르면 닫힌다.
3. 패널(`__panel`) — 560 · 높이 ≤ min(70dvh, 520) · 반경 16 · 메뉴 면 88% + 흐림 4 · 메뉴 그림자 + 헤어라인.
4. 검색줄(`__search`) — 글리프(`__search-icon`) 16 · 입력(`__input`) · 닫기(Icon Button sm ghost). 높이 48 · 좌 18 · 우 14 · 사이 6 · 아래 헤어라인.
5. 본문(`__body`) — 목록과 플라이아웃의 위치 기준.
6. 목록(`__list`) — 안쪽 6 · 그룹 사이 4 · 구른다. 그룹(`__group`) = Menu 그룹 제목 + Menu 항목(`data-layout="inline"`) · 행 사이 2.
7. 셰브론(`__chevron`) — 하위 목록이 있는 행 끝 12.
8. 결과 없음(`__empty`) — 가운데 한 줄 · 위아래 28.
9. 플라이아웃(`.louis-popover.louis-command-palette__flyout`) — 본문 오른쪽 6 · 폭 180 · 값 목록.
10. 발(`__footer`) — 키 안내(`__hint`) 셋 · 묶음 사이 16 · 높이 38 · 위 헤어라인. 키는 [Keycap](keycap.md).

## Properties

| 이름 | 종류 | 기본값 | 뜻 |
| --- | --- | --- | --- |
| `--louis-command-palette-from-x` · `-from-y` | 길이 | `0px` · `-24px` | 여는 버튼 중심 − 패널 중심. opening · closing 에서만 패널에 걸린다 |
| `--louis-command-palette-from-scale-x` · `-from-scale-y` | 수 | `0.32` · `0.18` | 버튼 크기 ÷ 패널 크기(두 축). 제품은 0.12 ~ 0.4 · 0.05 ~ 0.3 으로 자른다 |
| `--louis-command-palette-flyout-top` | 길이 | `0px` | 플라이아웃 위 — 트리거 행의 목록 안 위치, 소비처가 본문 아래로 넘치지 않게 자른다 |
| `data-louis-state` | `opening` · `open` · `closing` · `closed` | — | 수명(overlay 어휘). 루트 |
| `__hint[data-align="end"]` | — | — | 발 끝에 선다(실행 안내) |
| (조합) `.louis-menu__item[data-layout="inline"]` | — | — | 이름 옆 한 줄 설명 — [Menu / Popover](menu-popover.md) |

기본값 넷(`0 · -24 · 0.32 · 0.18`)은 제품의 「버튼 없음」 값이다(`components/navigation/CommandPalette.tsx:371`) — ⌘K 로 열면 패널이 위쪽 가운데에서 펼쳐진다.

### 마크업 계약

| 자리 | 계약 |
| --- | --- |
| 루트 | `role="dialog"` · `aria-modal="true"` · 이름(`aria-label`) · `data-louis-state` · 변수 다섯은 인라인 style. use-overlay 로 띄우면 `data-louis-overlay-mode="modal"` |
| 딤 | `aria-hidden="true"`, 포커스 받지 않음. 포인터 누름 = 닫기 |
| 입력 | `role="combobox"` · 이름(placeholder 는 이름이 아니다) · `aria-expanded="true"` · `aria-autocomplete="list"` · `aria-controls` = 지금 커서가 있는 목록(본 목록 또는 열린 플라이아웃) · `aria-activedescendant` = 하이라이트 행 id. 초기 포커스. 한글 조합 중(`isComposing`) Enter 는 실행하지 않는다 |
| 목록 | `role="listbox"` + 이름. 그룹은 `role="group"` + `aria-labelledby` → 그룹 제목. 행은 `role="option"` · 고유 `id` · **포커스 받지 않음**(Tab 정지 없음) |
| 하이라이트 | `data-highlighted="true"` 가 한 행에만. 팔레트 목록 행에는 `aria-selected` 를 달지 않는다 — Menu 에서 그것은 「지금 값」 면(12%)이다(`packages/css/src/component/menu-popover.css`). 위치는 `aria-activedescendant` 가 말한다 |
| 하위 목록 행 | 셰브론(`aria-hidden`) + 현재값을 `__item-trailing` 으로. → · Enter · 클릭 = 플라이아웃 열기, 같은 행 다시 = 닫기(제품 토글, `components/navigation/CommandPalette.tsx:485-489`) |
| 플라이아웃 | `.louis-popover` + `__flyout`, `role="listbox"` + 이름(그룹 제목 id). **값 목록이라 지금 값에 `aria-selected="true"`** — 제품은 지금 값을 보이지 않았다. ← · Esc = 플라이아웃만 닫고 커서를 트리거 행으로. 검색어가 바뀌면 닫는다(`components/navigation/CommandPalette.tsx:478-480`). 바깥 누름 = 플라이아웃만 닫음(`components/navigation/CommandPalette.tsx:506-521`) |
| 위험 행 | `data-tone="danger"`, 이름은 분명한 동사(「로그아웃」) |
| 결과 없음 | `<p class="louis-command-palette__empty">` 가 목록 자리를 대신한다(`role` 없음). 문구는 무엇을 못 찾았는지 |
| 결과 수 | `.louis-visually-hidden` `role="status"` — 검색어가 바뀔 때 「결과 N개」 · 「결과 없음」 |
| 발 | 키캡 글리프는 `aria-hidden` + 숨긴 키 이름. 발은 보조기술에 그대로 읽힌다(조작 안내) |
| 모달 | 배경 inert · 스크롤 주인 `data-louis-scroll-locked="true"`(`packages/css/src/base.css`) — 제품의 `wheel` · `touchmove` 가로채기(`components/navigation/CommandPalette.tsx:421-446`)를 대신한다. Tab 은 입력 ↔ 닫기 사이에서 돈다. 닫히면 포커스는 연 요소(검색 버튼, ⌘K 면 열기 직전 요소)로. 행이 화면을 옮기면 복귀하지 않는다(Menu `route` 사유와 같은 판단) |

## 시작 자리는 소비처가 준다

행동 목록 · 거르기 · 실행은 앱의 것이고 레시피는 그 결과를 그리는 자리를 소유한다. 소비처가 갖는 행동은 넷이다.

1. **열기** — `data-louis-state="opening"` 으로 그린다(base.css 가 `visibility: hidden` 으로 감춘다). 이때 패널은 최종 자리이고 from 넷이 시작 변형이라,
   버튼을 재려면 패널의 `offsetLeft/Top/Width/Height`(변형 무관 레이아웃 값)를 쓴다 — 제품이 이미 그렇게 잰다(`components/navigation/CommandPalette.tsx:396-397`).
   다음 프레임에 `open`. 포커스는 입력으로.
2. **거르기 · 하이라이트** — 검색어로 행을 거르고(라벨 · 설명 포함), 하이라이트는 **한 행**이다: ↑/↓ 는 끝에서 돌고, 포인터 이동이 그 행으로 옮긴다.
   하이라이트 행에 `data-highlighted="true"`, 입력에 `aria-activedescendant`. 바뀌면 `scrollIntoView({ block: "nearest" })`.
3. **플라이아웃** — 하위 목록이 있는 행에서 → · Enter · 클릭으로 연다. 행의 목록 안 위치를 재서 `--louis-command-palette-flyout-top` 을 단다.
   **본문 아래로 넘치지 않게 자른다** — `min(행 위치, 본문 높이 − 플라이아웃 높이 − 6)`. 제품은 자르지 않아 아래쪽 행의 플라이아웃이 패널 밖으로 잘린다.
4. **닫기** — `closing` 으로 바꾸고 루트의 계산된 `transition-duration` 이 지나면 `closed`(`readExitDuration`, DS-D-0011 결정 3). 버튼에서 열었으면 그 버튼을
   다시 재서 from 을 고친다.

**루트는 페이드하지 않는다.** 딤과 패널이 각자 opacity 를 전이한다. 조상에 `opacity < 1` 이 걸리면 그 조상이 패널의 배경 흐림 기준이 되어, 페이드하는 동안
패널이 페이지가 아니라 딤만 흐린다. 루트는 시간만 발행하고 두 자식이 `inherit` 로 받는다 — `readExitDuration` 이 읽는 값과 시각 전이가 한 선언에서 나온다.
use-overlay 로 띄우면(`.louis-overlay-panel` 이 함께 붙는다) 레시피가 overlay 의 anchored 값(최대 크기 · 루트 opacity · scale)을 되돌리고, 소비처는
`data-louis-overlay-mode="modal"` 을 단다.

## States

| 상태 | 무엇이 보이나 |
| --- | --- |
| `opening` | 감춤 · 투명 · 패널은 버튼 자리에서 납작하게 |
| `open` | 딤 · 패널 제자리. 320ms(`motion-modal-enter`) |
| `closing` | 딤 · 패널 투명으로, 패널이 버튼 자리로. 200ms(`motion-modal-exit`) |
| 행 하이라이트 | 메뉴 하이라이트 면(라이트 4% / 다크 8%) — 한 행. hover 는 하이라이트를 옮길 뿐 따로 칠하지 않는다 |
| 위험 행 | `fg-danger-on-surface` · 하이라이트 빨강 8% / 12% |
| 플라이아웃 | 200ms(`motion-overlay-enter`) 위에서 4 내려오며 페이드. 지금 값 = 12% 면 |
| 결과 없음 | 목록 자리에 한 줄 |
| 줄인 모션 | 시간 0 · 패널 이동 · 배율 없음 · 플라이아웃 즉시 |

## Content

- 그룹 제목은 서비스 · 영역 이름(명사). 행 이름은 목적지나 동사(「새 캔버스」 · 「로그아웃」), 설명은 결과 한 줄.
- 프로젝트 같은 많은 데이터 행은 검색어가 있을 때만 보인다 — 기본 목록을 어지럽히지 않는다.
- 현재값(언어 · 테마)은 `__item-trailing` 짧은 표기. 하위 목록은 한 단계까지.
- 결과 없음 문구는 무엇을 못 찾았는지 — KO 「검색 결과가 없습니다」.
- 키 안내는 셋(이동 · 닫기 · 선택) — 더 늘리지 않는다.

## Accessibility

- 모달: [Dialog](dialog.md) 「Modal Dialog」 열 그대로 — 역할 · `aria-modal` · 이름, 배경 inert, 스크롤 잠금, Tab 가둠(입력 ↔ 닫기), Esc, 연 요소로 복귀.
  행이 화면을 옮기면 복귀하지 않는다(Menu `route` 사유와 같은 판단).
- 입력은 `combobox`, 목록은 `listbox` + `group`, 행은 `option`. 커서는 `aria-activedescendant` — 행은 Tab 정지가 아니다.
- 키보드

  | 키 | 동작 |
  | --- | --- |
  | ↓ · ↑ | 다음 · 이전 행, 끝에서 돈다 |
  | → | 하이라이트 행에 하위 목록이 있으면 연다, 커서가 첫 값으로 |
  | ← | 플라이아웃을 닫고 트리거 행으로 |
  | Enter | 실행(하위 목록 행은 열기 · 다시 누르면 닫기). 한글 조합 중(`isComposing`)에는 조합만 끝낸다 |
  | Esc | 플라이아웃이 열려 있으면 그것만, 아니면 팔레트를 닫는다 |
  | ⌘K / Ctrl+K | 열기 · 닫기 토글(소비처) |

- 결과 수는 `role="status"` 로 알린다.
- 포커스 링은 그리지 않는다(DS-D-0074) — 행 위치는 하이라이트 면이 말한다. 강제 색에서 검색줄 링 · 패널 · 구분선 실선이 선다.
- 줄인 모션에서 패널은 제자리에서 나타난다.
- 대비(유리 88% + `dim-modal` 합성, 보통 바닥 = 테마 캔버스) — `fg-secondary` 라이트 7.60 · 다크 7.33, `fg-tertiary` 5.30 · 5.32, `fg-danger-on-surface`
  5.01 · 6.51, 키캡 8.15 · 7.93. 시험이 계산값에서 다시 잰다.

## Specification

| 칸 | 값 |
| --- | --- |
| 루트 | 위 14vh · 좌우 아래 `space-layout-gutter` 16, 720 미만 8vh · 12. 겹 `layer-critical` |
| 패널 | 560 · ≤ min(70dvh, 520) · 반경 `radius-overlay` 16 · `bg-menu` 88% · 흐림 4 · `elevation-menu` + `hairline-inset` |
| 검색줄 | 위아래 `space-control-md` 12 · 좌 18(목록 안쪽 6 + 행 좌우 12) · 우 14 · 사이 `space-overlay-item-content-gap` 6 · 아래 헤어라인 |
| 목록 | 안쪽 `space-overlay-inset` 6 · 그룹 사이 `space-control-xs` 4 · 행 사이 `space-overlay-item-gap` 2 |
| 행 | Menu 항목 `data-layout="inline"` — 37 · 좌우 12 · 간격 6 · 가운데 정렬 · 설명 같은 줄 `fg-secondary` · 말줄임 |
| 셰브론 | 12 · `fg-tertiary` |
| 결과 없음 | 위아래 28 · 좌우 12 · `body-sm-regular` · `fg-secondary` |
| 플라이아웃 | `.louis-popover` · 오른쪽 6 · 폭 180 · 높이 ≤ 본문 − 12 |
| 발 | 위아래 `space-control-sm` 8 · 좌우 18 · 묶음 사이 `space-control-lg` 16 · 키와 글자 6 · 키 사이 4 · `caption-regular` `fg-tertiary` · 위 헤어라인 |
| 모션 | 열림 `motion-modal-enter` 320ms · 닫힘 `motion-modal-exit` 200ms · 플라이아웃 `motion-overlay-enter` 200ms · 줄인 모션 `motion-reduced` |

## Acceptance tests

`packages/react/test/command-palette.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다.

1. 패널 560 · 1440×900 에서 위 126(14vh) · 375×812 에서 좌우 12 · 위 65(8vh) · 높이 ≤ min(70dvh, 520) · 반경 16.
2. 검색줄 높이 48 · 좌 18 · 우 14 · 간격 6. 검색 글리프 왼쪽 끝 = 행 글리프 왼쪽 끝.
3. 발 높이 38 · 좌우 18 · 묶음 사이 16 · 키 사이 4 · 키와 글자 6.
4. 행 = Menu 항목 계산값(37 · 좌우 12 · 간격 6) · `data-layout="inline"` 에서 `align-items: center` · 설명 `white-space: nowrap` · 말줄임.
5. 대비 — 라이트 · 다크에서 유리 합성 위 `fg-secondary` · `fg-tertiary` · `fg-danger-on-surface` ≥ 4.5(보통 바닥, `fixtures/contrast.ts` 로 잰다).
6. 수명 — opening 에서 패널 `translate` · `scale` 이 변수와 같고 루트 `opacity` 가 1. closing 에서 루트 `transition-duration` 이 modal-exit, 줄인 모션에서 0 · 패널 변형 없음.
7. 층 — 루트 `z-index` 가 `layer-critical` 값.
8. `louis-overlay-panel` 을 함께 단 루트에서 opening `opacity` 1 · `scale` 1 · `overflow` hidden.
9. 하이라이트 행이 아닌 행에 hover 해도 면이 투명, 플라이아웃의 지금 값 행은 hover 해도 12%.
10. 위험 행 잉크 = `fg-danger-on-surface`, 꺼진 위험 행 = `fg-disabled`.
11. 플라이아웃 — 폭 180 · 오른쪽 6 · `max-block-size` = 본문 − 12 · 줄인 모션에서 애니메이션 0.

## Known deviations

1. 열림 시간이 제품 300 · 200(전이) · 220(타이머)과 다르다 — modal 토큰 320 · 200.
2. 두 축 배율이라 펼쳐지는 동안 글자가 납작하다 — 제품과 같은 성격이고 opacity 0 에서 시작해 드러나지 않는다.
3. 라벨 hover 마퀴를 옮기지 않았다 — 말줄임만(DS-D-0095 판정 9).
4. 유리 88% 위에서도 라이트 테마 · 검은 그림 위 「최악」 바닥에서 위험 행 4.43(하이라이트 4.10) — 4.5 아래.
5. 흐림 4 가 이름을 갖지 못한다([Floating Shell](floating-shell.md) Known deviations 1 과 같은 빚).
6. 위험 행 잉크는 팔레트 범위 규칙이다 — Menu 의 같은 결함(「danger item 글자」)이 정해지면 지운다(판정 6).
7. Figma 의 행에는 하위 목록 셰브론(`__chevron`)이 없다 — 행이 `Menu` 인스턴스라 안에 층을 더할 수 없다. 플라이아웃은 예시 보드에서 `MenuPanel` 인스턴스(180)를
   패널 위에 겹쳐 그렸고 그룹 제목이 없다. 유리 면의 그림자 · 헤어라인은 배경 흐림과 함께 걸어야 해서 효과 스타일이 아니라 효과 값으로 옮겼다.

## Migration and changelog

- **제품에서 발견한 것.** 보조 글자 40 · 48% 가 라이트 2.40 ~ 2.96, 키캡 3.60, 위험 행 2.55(`components/navigation/CommandPalette.tsx:207`).
  다이얼로그 이름 · 입력 이름(`components/navigation/CommandPalette.tsx:656-665`) · 목록 의미가 없고, 행이 `<button>` 이라 Tab 이 행을 돌다 패널 밖으로 나간다.
  배경 inert · 포커스 복귀가 없다. 닫힘 타이머 220 이 전이 300 보다 짧아 퇴장 끝이 잘린다(`components/navigation/CommandPalette.tsx:342`).
  Enter 처리에 `isComposing` 확인이 없다(`components/navigation/CommandPalette.tsx:641`). 아래쪽 행에서 연 플라이아웃이 패널 밖으로 잘린다.
  플라이아웃이 지금 값을 보이지 않는다. 닫기 hover 가 `@media (hover: hover)` 밖이다(`components/navigation/CommandPalette.tsx:128-132`).
- **고쳐 올린 값**(DS-D-0084 3항) — 보조 글자 → `fg-secondary` · `fg-tertiary`, 키캡 → `.louis-keycap`, 위험 행 → `fg-danger-on-surface`, 면 72% → 88%,
  숫자 z-index 셋 → `layer-critical` + DOM 순서, 타이머 → 계산된 전이 시간, 접근성 계약.
- 2026-10-14 섰다 — [DS-D-0095](../governance/decisions/DS-D-0095-command-palette.md).
