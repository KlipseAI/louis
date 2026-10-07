---
id: decision-icon-provenance-per-set
status: experimental
authority: normative
---

# DS-D-0078 아이콘 출처는 세트마다 한 번, 글리프마다 한 줄

- Status: accepted (provenance · 빌드 · 게이트 · 문서 2026-10-08)
- Date: 2026-10-08
- Owners: design system maintainer (소유자 결정)
- Affects: `foundation-iconography`, `decision-icon-source`, `@klipse-design/react`

## Context

[DS-D-0008](DS-D-0008-icon-source.md) 3항은 `provenance.json` 의 글리프마다 일곱 칸(`project` · `icon` · `license` ·
`licenseFile` · `sourceUrl` · `retrievedAt` · `modifications`)을 적게 했다. 글리프 47개 중 upstream 36개가 같은 세 프로젝트
(Phosphor · Lucide · Iconoir)에서 왔고, 칸의 대부분은 글리프마다 같은 값이었다. `modifications` 의 앞머리 — 256 격자를 24 격자로
한 번 스케일, 선 16 → 1.5, 배경 rect 제거 — 는 36번 되풀이되는 전역 규칙이었다. 소유자가 이 구조가 무겁다고 했다.

글리프마다 다른 정보는 둘뿐이다. 어느 세트에서 왔는가, 그 세트 안에서 원래 이름이 무엇인가. 나머지는 세트의 속성이거나(프로젝트 ·
라이선스 · 라이선스 원문 · 주소) 이미 전역 규칙이다(24 격자 · 선 1.5 · 배경 rect 제거 — [iconography](../../foundations/iconography.md)
Geometry contract).

## Decision

DS-D-0008 3항의 항목 형식을 아래로 **바꾼다.** 3항의 나머지 — 출처 없는 글리프는 채택하지 않는다 · 추정 출처와 `unknown` 류 상투어는
빌드 실패 · 같은 그림을 두 이름으로 두지 않는다 · 같은 React 심볼로 방출되지 않는다 — 는 그대로다. 4항(고지문 동봉)도 그대로다.

1. **`provenance.json` 은 `sets` 와 `glyphs` 둘이다.**
   - `sets.<세트 이름>` = `{ project, license, licenseFile, url }`. 쓰이는 세트마다 한 번 적는다. `licenseFile` 은
     `packages/react/src/icons/licenses/` 아래 원문이고, `url` 은 세트의 https 저장소 주소다.
   - `glyphs.<글리프 이름>` = `"세트:세트 안의 원래 파일 이름"` 한 줄, 직접 그린 것은 `"original"`.
     예: `"x-circle": "phosphor:x-circle"`, `"question-circle": "lucide:circle-question-mark"`, `"nodes-linked": "original"`.
     `(regular)` 같은 꼬리표는 적지 않고 세트의 원래 파일 이름만 적는다.
2. **`retrievedAt` · `modifications` · 글리프별 `sourceUrl` 을 없앤다.** 좌표 정규화(24 격자 · 선 1.5 · 색 슬롯 · 배경 rect 제거)와
   이름 변경은 전역 규칙이라 글리프마다 적지 않는다. 그 밖의 손질이 필요한 글리프는 upstream 을 주장하지 않고 `"original"` 로
   다시 그린 것으로 선언한다(3항의 「출처를 대조할 수 없으면 upstream 이라 적지 않는다」가 그대로 적용된다).
3. **빌드 실패 조건.** 글리프에 항목이 없다 · 항목이 「세트:이름」 도 `"original"` 도 아니다 · 알 수 없는 세트 · 세트 정의의 네 칸 중
   하나가 비었거나 상투어다 · `url` 이 https 가 아니다 · `licenseFile` 이 `licenses/` 에 없다 · 고지문 구조를 깨는 개행 · 코드펜스 ·
   어떤 글리프도 쓰지 않는 세트 · 어떤 세트도 가리키지 않는 라이선스 원문 · 최상위에 `sets` · `glyphs` · `$` 주석 밖의 키.
4. **고지문은 쓰인 세트마다 한 절이다.** 절 제목은 세트의 `project — license`, 본문은 `url` · 그 세트에서 온 글리프 목록 ·
   `licenseFile` 원문 **전체**다. Lucide 원문은 ISC 본문 뒤에 Feather 파생 목록과 MIT 고지(Cole Bemis)를 함께 담고 있으므로 원문 전체를
   싣는 것이 곧 두 라이선스를 모두 싣는 것이다. 그래서 Lucide 세트의 `license` 는 `ISC AND MIT` 다 — 한 세트의 글리프 중 일부만 Feather
   파생이어도(`copy` · `copy-check` 는 ISC 만) 원문은 하나이고 의무는 좁히지 않는다.
5. **manifest(`formatVersion` 2).** 최상위 `sets` 는 쓰이는 세트의 `{ project, license, licenseFile, url }` 이고, 글리프의
   `provenance` 는 `{ origin: "original" }` 또는 `{ origin: "upstream", set, icon }` 이다.

## Alternatives

- **일곱 칸을 그대로 두고 값을 복붙한다.** 기각. 같은 값이 36번 적혀 라이선스 표기가 글리프마다 갈라질 여지만 만들고(이전에도 Lucide
  글리프의 `license` 가 `ISC` 와 `ISC AND MIT` 로 갈렸다), 읽는 사람에게 새 정보가 없다.
- **세트 항목도 없애고 글리프 줄에 URL 을 직접 적는다.** 기각. 라이선스 원문 · 프로젝트 이름의 자리가 없어져 고지문을 만들 수 없다.
- **`modifications` 만 남겨 예외를 적는다.** 기각. 전역 규칙에서 벗어나는 글리프는 upstream 이 아니라 직접 그린 것으로 선언하는 편이
  정직하다 — 출처 칸이 「거의 upstream 인데 조금 고쳤다」를 담기 시작하면 추정 출처의 문이 다시 열린다.

## Consequences

- `provenance.json` 은 글리프당 한 줄이 된다. 새 upstream 글리프는 줄 하나, 새 세트는 `sets` 항목과 `licenses/<파일>` 원문 하나다.
- 글리프별 취득일과 원본 URL 은 사라진다. 원본은 세트 URL 과 원래 이름으로 다시 찾는다 — 세트 저장소의 같은 이름 파일이다.
- 이전 `modifications` 에 있던 글리프별 설명(예: arrow-elbow-down-left 가 제품의 `KeyEnterGlyph` 와 다른 이유)은 이 파일에서 사라지고
  git 이력에만 남는다. 필요한 판단은 아이콘 문서나 Updates 로 옮긴다.
- 게이트의 변조 canary 는 같은 사고를 새 형태로 잡는다 — 항목 삭제 · 알 수 없는 세트 · 형식 이탈 · 세트 정의 상투어 · `licenseFile`
  누락과 부재 · 쓰이지 않는 세트 · 고아 원문 · 고지문 위조 · url 형태. 혼합 라이선스 positive 는 `AND` 로 나눈 조각마다 고지문과 원문에
  그 이름이 있는지, 원문 전체가 고지문에 실렸는지 본다.

## Rollback

`git revert` 로 `provenance.json` · `scripts/lib/icon-model.mjs` · `scripts/verify-icon-gates.mjs` · 고지문 · manifest 를 한 단위로
되돌린다. 옛 일곱 칸은 이력에 남는다.
