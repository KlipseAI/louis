---
id: decision-select-is-not-a-menu
status: experimental
authority: normative
---

# DS-D-0053 값 목록은 명령 메뉴가 아니다 — Select 트리거를 연다

- Status: accepted
- Date: 2026-09-07
- Owners: design system maintainer
- Affects: `select`, `menu-popover`, `input`,
  `governance-figma-component-authoring`, `decision-control-size-ladder`

## Context

2026-08-18 에 이 저장소는 **「고르기는 Menu 가 소유한다」** 고 판정하고 `select` 를
`not-planned` 로 닫았다. manifest 의 그 항목이 근거를 이렇게 적었다 —
네이티브 `<select>` 는 14벌 / 5파일이고 전부 `/admin` 계열이며, 배포 화면(Home · Highlight ·
Editor)에는 0벌이다. 관리자 도구는 이 저장소의 소비 surface 가 아니다.

**그 문장의 마지막 절이 세는 대상을 좁혀 놓았다.** 판정은 `<select>` **엘리먼트**를 셌는데,
제품이 값을 고르는 방식은 그것이 아니다. 같은 항목이 바로 다음 문장에서 스스로 그 사실을
적고 있다 — 「제품은 트리거 + 메뉴 패널로 고르며 그 파일이 11개다」. 그리고 그 11개를
DS 의 `ActionMenu`·`CompositePopover` 가 덮는다고 결론지었다.

앵커(제품 `5a67d692`)에서 그 11개의 정체를 확인했다. 하나의 공유 컴포넌트다 —
`components/scenes/create/CustomDropdown.tsx`. JSX 로 **아홉 자리 / 여덟 파일**이 쓴다.
(**저장소 접두사를 떼고 적는다.** 규범 문서는 제품 저장소 전용 경로를 본문에 직접 쓸 수 없다 —
`build-design-docs` 의 저장소 경계 규칙이고, 아래 표와 이 저장소의 다른 결정 문서가 모두 같은
형태를 쓴다. 좌표를 그 저장소의 트리에 고정하는 일은 문서가 아니라 앵커 커밋과
`migration/product-evidence.lock.json` 이 한다.)

| 자리 | 높이 | 곡률 | 좌우 여백 | 간격 | 캐럿 |
| --- | ---: | --- | --- | ---: | --- |
| `app/aws/signup/page.tsx:397` 언어 | 36 | 8 | 정사각 | — | 없음(`hideCaret`) |
| `components/navigation/Gnb.tsx:3314` 언어 | 32 | 10 | 12 · 12 | 6 | 6px 테두리 셰브론 |
| `SubscriptionScene.tsx:1092` 정렬 | 28(min) | 8 | 10 · 10 | 6 | 10 |
| `create/ComposerBar.tsx:519` 모델 | 32 | 알약 | 12 · 32 | — | `▼` 12 |
| `VideoEditModal.tsx:10838` 프리뷰 줌 | 24 | 8 | 8 · 6 | 4 | 12 |
| `videoEditParts/CompositionInspector.tsx:207` 비율 | 내용 | 12 | 14 · 14 | 10 | 셰브론 |
| `videoEditParts/EditorSettingsPanel.tsx:83` 비율 | 내용 | 12 | 14 · 14 | 10 | 셰브론 |
| `videoEditParts/OverlayInspector.tsx:937` 글꼴 | 내용 | 12 | 14 · 14 | 10 | 셰브론 |
| `videoEditParts/OverlayInspector.tsx:1109` 굵기 | 내용 | 12 | 14 · 14 | 10 | 셰브론 |

`Gnb` 가 물기 때문에 **사실상 전 라우트**에 뜬다. 관리자 도구가 아니라 배포 화면이고,
0벌이 아니라 아홉이다.

## Decision

1. **`select` 를 `not-planned` 에서 연다.** 2026-08-18 판정을 뒤집는다 — 그 항목 자신이
   「수요가 생기면 Decision 으로 이 판정을 뒤집고 다시 연다」고 적어 둔 절차다.
2. **여는 것은 트리거 하나다.** `SelectTrigger` component set 과 `.louis-select-trigger`
   레시피가 그것이다.
3. **패널·항목·선택 표시·검색 필드는 새로 세우지 않는다.** 2026-08-18 판정의 절반은
   여전히 맞다 — 표면은 Menu 가 소유한다. 아래 「무엇이 맞았고 무엇이 틀렸나」를 본다.
4. **크기 축은 `sm`(24) · `md`(32) 둘이다.** 둘 다 [DS-D-0027](DS-D-0027-control-size-ladder.md)
   의 사다리 칸이고 각각 제품 실측 자리를 갖는다. 위 표의 28 · 36 · 「내용 높이」는 칸을 만들지
   않는다 — 사유는 `figma/components.measured.json` 의 `select.$note` 가 갖는다.
5. **제품에는 이 회차에 채택 자리를 만들지 않는다.** 제품 저장소는 소유자가 작업 중이라
   읽기만 했다. 물게 하는 diff 는 절차서로 남긴다.

## 무엇이 맞았고 무엇이 틀렸나

**맞은 절반.** 「고르기의 **표면**은 Menu 가 소유한다」는 지금도 참이고, 이번에 그것을 실측으로
확인했다. 앵커의 `CustomDropdown` 은 패널에 `louis-popover` 를, 옵션에 `louis-menu__item` 을
이미 물고 있다(그 파일의 `MENU_BASE`·`OPTION` 상수가 그 두 클래스뿐이다). 값 목록의 「지금 값」
표시도 2026-09-06 에 `menu-popover.css` 의 `[aria-selected="true"]` 로 이미 섰다. 검색 필드도
`TextField` 가 이미 갖는다 — 그 컴포넌트의 `HasLabel` 축 사유가 글자 그대로 「라벨 없는 필드가
실재한다 — 검색창이 그것이다」다.

**틀린 절반.** 그 표면을 **여는 컨트롤**은 어디에도 없었다. `menu-popover.css` 의
`.louis-menu-trigger` 가 2026-09-06 에 서면서 그 자리를 절반만 채웠고, **자기 문서에 나머지
절반이 자기 몫이 아님을 적어 두었다** — 「셰브론이 있는 트리거는 `CustomDropdown`(Select 계열)의
몫이며 그것은 다른 벌이다」. 이 결정이 그 「다른 벌」이다.

## `MenuTrigger` 로 접지 않은 이유

같은 이름 아래 두면 세 값이 서로를 이긴다.

1. **면.** `MenuTrigger` 는 투명이고 hover 에서만 ghost 8% 가 뜬다. Select 트리거는 쉼 상태에서
   면을 갖는다 — 제품 여섯 자리 중 넷이 채워진 상자를 그린다. 값 목록은 「지금 무엇이 골라져
   있는가」를 늘 보여야 하므로 눌러야 나타나는 컨트롤이 아니다. 접으면 둘 중 하나가 거짓이 된다.
2. **캐럿.** `MenuTrigger` 에는 없고, 없는 것이 그 컴포넌트의 명시된 계약이다(앵커의 랜딩
   `LanguageSelector` 가 셰브론을 렌더하지 않는다). BOOLEAN 으로 켜고 끌 수도 없다 — 캐럿이
   붙으면 열림에서 180° 도는 상태가 함께 따라와, 「계속 보이는 레이어의 변형이 달라지는가」라는
   시험 1 에 걸린다(figma-component-authoring.md §2).
3. **크기.** `MenuTrigger` 는 「크기 축을 열지 않는다」를 계약으로 적었다. 여기에 축을 더하면
   그 문장이 거짓이 되고, 열지 않은 이유(제품이 32 하나만 쓴다)도 함께 무너진다.

## Alternatives

- **`TextField` 에 얹는다.** 트리거가 값을 보여 주므로 입력처럼 보일 수 있다. 채택하지 않았다 —
  `TextField` 의 박스는 `cursor: text` 이고 `bg-canvas`(파고든 자리)를 쓰는데, Select 트리거는
  누르는 컨트롤이고 면이 `bg-inset` 이다. 같은 상자에 두 커서와 두 면을 두면 축이 하나 더 는다.
- **네이티브 `<select>` 를 정본으로 삼는다.** 채택하지 않았다 — 제품의 아홉 자리 중 하나도
  네이티브가 아니고, 검색·leading 글리프·포털 배치를 네이티브가 담지 못한다. `/admin` 의 14벌은
  그대로 두고, 그 자리의 판정은 이 결정의 범위 밖이다.
- **`sm`·`md` 에 더해 28 을 연다.** 채택하지 않았다 — 28 은 사다리 밖 값이고, 그 값의 두 주인이
  따로 있다(비디오 에디터 인스펙터 **행**의 높이와 `SubscriptionScene` 의 `min-height`).
  figma-component-authoring.md 의 「사다리 밖 값은 쓰임새로 부른다」가 요구하는 세 조건 중
  2(사다리로 표현되지 않는다)를 만족하지 못한다 — 28 자리는 md 로 대신할 수 있다.

## Consequences

- `select` 가 `not-planned` 에서 나온다. manifest 의 그 항목이 이 결정을 가리킨다.
- `State` 축의 어휘에 `Open` 이 필요해진다. figma-component-authoring.md §2 의 표에 그 값이
  없었고 `MenuTrigger` 가 이미 쓰고 있었다 — 이 결정이 그 빚을 함께 갚는다.
- 제품 원장(`migration/product.surfaces.json`)의 `CustomDropdown` 항은 **이 회차에 움직이지
  않는다.** 그 판정은 「제품이 무엇을 무는가」이고, 제품은 아직 이 트리거를 물지 않았다.
  커버리지가 오르는 것은 채택하는 회차다.
