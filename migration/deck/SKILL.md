---
name: klipse-design
description: Klipse 디자인 기준을 적용해 결과물을 만들 때 쓴다. 제품 UI 화면·컴포넌트, 기존 화면의 디자인 시스템 준수 점검, PPT·사업계획서·제안서 장표, 마케팅 이미지, 개발 전달용 컴포넌트 설명이 대상이다. 컬러·타이포·간격·컴포넌트를 고르는 모든 작업에서 값을 지어내지 말고 이 Skill 이 가리키는 원본을 먼저 조회한다.
---

# Klipse Design Skill

Klipse 의 디자인 기준을 **조회해서** 적용한다. 이 파일에 값을 복사해 두지 않는다 —
값은 바뀌고, 복사본은 조용히 낡는다. 여기 있는 것은 **어디를 어떤 순서로 보고, 무엇을 검수하는가** 뿐이다.

## 1. 먼저 상황을 분류한다

| 상황 | 조회 | 산출물 |
| --- | --- | --- |
| A. 제품 UI 를 새로 만든다 | 2절 전부 | 코드 또는 Figma 프레임 |
| B. 기존 화면이 시스템을 지키는지 본다 | 2절 + 대상 파일 | 위반 목록과 근거 |
| C. PPT · 사업계획서 · 제안서 | 2절 + `references/deck-structure.md` | 장표 |
| D. 마케팅 · 프로모션 이미지 | 2절 + `references/imagery.md` | 이미지 |
| E. 개발 전달용 컴포넌트 설명 | 2절 + Figma 노드 | 문서 |

## 2. 조회 순서 — 위에서부터, 필요한 만큼만

1. **`design/llms/llms.txt`** — 인덱스. 어떤 문서에 무엇이 있는지.
2. **`design/llms/foundations.txt`** — 컬러 · 타이포 · 간격 · 라운드 · 아이콘 **값 목록**.
   거의 모든 작업이 여기서 끝난다.
3. **`design/llms/components.txt`** — 컴포넌트와 배리언트 · 속성. 새로 그리기 전에 여기서 찾는다.
4. **`design/llms/patterns.txt`** — 화면·인터랙션 패턴(GNB · 드롭다운 · 팝오버 · Auth 등).
5. **`design/llms/guidelines.txt`** — 작업 순서와 금지 사항.
6. **`design/tokens.yaml`** — 토큰 원본. 위 문서로 부족할 때만.
7. **Figma MCP** — 실물 확인이 필요할 때 **해당 노드만** 조회한다.
   파일 `Klipse 3.0`, 페이지 `Overview / Foundations / Components / Patterns / Guidelines / Updates`.
   페이지 전체를 읽으면 응답 한도를 넘긴다.

문서와 Figma 가 어긋나면 **코드(`apps/web/app/globals.css`)가 기준**이다.
어긋난 것을 발견하면 결과물에 반영하지 말고 사용자에게 알린다.

## 3. 결과물 종류와 무관하게 지키는 것

- **값을 지어내지 않는다.** 컬러·크기·간격·반경은 조회한 토큰에서만 고른다.
  필요한 값이 없으면 임의로 만들지 말고 가장 가까운 단계를 쓰고 그 선택을 밝힌다.
- **컬러는 역할로 고르되, 산출물이 코드인지 Figma 인지 먼저 구분한다.**
  - **Figma 작업** — `surface/*` `content/*` `border/*` `interaction/*` `status/*` `brand/*` 역할로 고른다.
  - **코드 작업** — 역할 층은 **아직 착지하지 않았다.** Figma 가 광고하는 35개 중 CSS 변수로 존재하는 것은
    9개뿐이고 그 9개조차 소비처가 0 이다. `foundations.txt` 의 `## Color — roles` 에서
    `[코드]` 표시가 있는 것만 실재한다. 표시가 없는 이름을 코드에 쓰면 **정의되지 않은 토큰 참조**가 된다.
    실재하는 것으로 고른다 — semantic gray · 팔레트 · 컴포넌트 토큰(`--node-*` · `--app-*` · `--dropdown-*` 등).
  - 숫자 스케일(`gray-000…1000`)은 테마에 따라 의미가 뒤집히므로 **의미를 알고** 쓴다.
    (역할 층이 착지하기 전까지는 이것이 코드의 현실이다 — `DESIGN_SYSTEM.md` §7.5)
- **타이포는 스케일 안에서만.** heading 48/36/28 · body 20/16/14 · caption 12. 그 외 크기는 없다.
  bold(700) 없음 — 강조는 semibold.
- **문구는 i18n 체계를 따른다.** 제품 UI 문구는 `messages` 에 KOR/ENG/JPN 세 언어로 넣는다.
  톤은 `references/copy-tone.md`.
- **레이아웃은 2px 그리드.** `--spacing: 2px` 이므로 Tailwind 유틸 숫자는 절반이다(`p-4` = 8px).
- **박스 스트로크는 0.5px.** 노드 카드 최외곽만 2px.

## 4. 실행 순서

1. 상황을 분류한다(1절).
2. 필요한 문서만 조회한다(2절). **조회하지 않고 값을 쓰지 않는다.**
3. 기존 컴포넌트·패턴으로 해결되는지 먼저 본다. 새로 만드는 것은 마지막 수단이다.
4. 만든다.
5. 5절 검수를 돌린다.
6. 규칙이 없어서 임의로 판단한 지점을 **결과물과 함께 보고**한다. 그게 다음에 시스템에 추가될 항목이다.

## 5. 검수 항목

**모든 결과물**
- [ ] 쓰인 색이 전부 조회한 토큰/역할에 있는가. 임의 hex 가 섞이지 않았는가
- [ ] 글자 크기가 스케일 안에 있는가. 없는 크기를 쓰지 않았는가
- [ ] 간격이 2px 그리드 위에 있는가
- [ ] 아이콘 선 두께가 `크기 ÷ 16` 인가
- [ ] 라이트/다크 양쪽에서 성립하는가 (테마 무관 면 위 전경은 `content/on-light` · `on-brand`)

**제품 UI 추가**
- [ ] 기존 컴포넌트로 대체 가능하지 않은가
- [ ] 사용자 노출 문구가 `messages` 에 3개 언어로 있는가
- [ ] `pnpm check-types` · `pnpm lint` · `pnpm check-typography` 통과
- [ ] 토큰을 건드렸다면 `pnpm check-design-tokens` · `pnpm check-design-system` 통과

**문서·장표·이미지**
- [ ] 정보 위계가 `references/information-hierarchy.md` 를 따르는가
- [ ] 판형·여백이 `references/layout-rules.md` 를 따르는가
- [ ] 차트가 있다면 `references/chart-style.md` 를 따르는가
- [ ] 브랜드 자산(로고·심볼)을 규정 경로에서 가져왔는가

## 6. 참조 파일

- `references/copy-tone.md` — 카피와 문서 표현 원칙
- `references/layout-rules.md` — 문서 유형별 판형·그리드·여백
- `references/information-hierarchy.md` — 정보 위계
- `references/chart-style.md` — 차트 스타일
- `references/imagery.md` — 이미지·그래픽 사용
- `references/deck-structure.md` — PPT·사업계획서 구성

## 7. 이 Skill 이 아직 답하지 못하는 것

아래는 **팀의 결정이 필요해 비어 있다.** 해당 작업을 만나면 임의로 정하지 말고 사용자에게 묻는다.

- **z-index 체계** — 레이어 순서를 정한 곳이 없다. 모달·드롭다운·툴팁·토스트가 겹칠 때 기준이 없다.
- **포커스 링 규격** — `border/focus` 색만 있고 두께·오프셋·`:focus-visible` 적용 범위가 없다.
- **그림자 elevation 단계화** — 지금은 용도별 4개(dropdown · tooltip · menu · glass frame)뿐이다.
  단계로 올릴지는 정해지지 않았다.
- **`interaction/selected` · `interaction/disabled`** — Figma 에만 있고 코드에 대응 토큰이 없다.
- **Highlight standalone(hl-\*)** — 자체 브랜드 자산을 쓰고 앱 컴포넌트를 공유하지 않는다.
  이 시스템 범위 밖이며, 통합할지는 결정되지 않았다.

> 폼 컨트롤 · 모달 · 토스트 · 스켈레톤 · 빈 상태는 **2026-08 에 Primitives 로 정의됐다.**
> `design/llms/components.txt` 에서 찾아 쓴다.
