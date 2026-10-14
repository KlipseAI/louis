---
id: breadcrumb
status: experimental
authority: normative
---

# Breadcrumb

앱 상단 페이지 내비 — single · nested.

| 항목 | 값 |
| --- | --- |
| Figma | `done` — component set 발행됨, 기하 계약 · 기록 · 되재기가 걸려 있다(DS-D-0035 (c)) — 2026-10-14 레시피 · 되재기 `breadcrumb-geometry.browser.test.tsx` 로 done(DS-D-0035) |
| 코드 | CSS 레시피 `packages/css/src/component/breadcrumb.css`(2026-10-14). React 표면은 없다 |

## 왜 있는가

제품 전수 인벤토리(2026-08-26)에서 **재사용되는 시각 패턴인데 디자인 시스템에 없던 것**으로
확인됐다. 적대적 검증을 통과했다 — 인용된 정의와 호출부가 실재하고, 기존 26 종 중 어느 것도
이것을 덮지 않는다.

제품 정본은 `components/navigation/Gnb.tsx` 의 `mainChromePageNav*`(통합 판 kds-integration :313-345 ·
:5395-5420)다. 상단 바 제목 칸(`.louis-app-top-bar__title`) 안에 선다.

## Anatomy

```html
<!-- single -->
<nav class="louis-breadcrumb" aria-label="현재 위치">
  <span class="louis-breadcrumb__current" aria-current="page">대시보드</span>
</nav>

<!-- nested -->
<nav class="louis-breadcrumb" aria-label="현재 위치">
  <span class="louis-breadcrumb__parent">프로젝트</span>
  <span class="louis-breadcrumb__separator" aria-hidden="true">/</span>
  <span class="louis-breadcrumb__current" aria-current="page">대시보드</span>
</nav>
```

부모가 이동할 수 있는 곳이면 `<a class="louis-breadcrumb__parent" href="…">` 로 둔다 — 밑줄 없이, 얹으면
현재 색으로 올라온다.

## Values

| 부분 | 값 |
| --- | --- |
| 칸 | `inline-flex` 가로 · 높이 24(글자 한 줄) · 여백 0 · 모서리 0 · 사이 4(`space-control-xs`) |
| 글자 | body-md medium 16/24/500 — 제품 `--type-body-16-*` |
| 현재 | `fg-primary` · `aria-current="page"` · 넘치면 말줄임 |
| 부모 · 구분자 | `fg-tertiary`. 구분자 「/」 는 `aria-hidden="true"` |

사이 4 는 제품 구분자의 `margin: 0 4px` 를 간격으로 옮긴 값이다(Figma itemSpacing 4 와 같다).

## Known deviations

1. **제품의 잉크 세 단계를 의미 토큰 둘로 접었다.** 제품은 흰 잉크 80%(현재) · 48%(부모) · 32%(구분자)를
   직접 쓴다. 그 알파는 글자 토큰 계단에 없어서 현재는 `fg-primary`, 부모 · 구분자는 `fg-tertiary` 로 둔다.
   구분자가 부모보다 한 단계 흐린 차이는 잃는다. 새 토큰을 세우지 않은 것은 Figma 변수 작업이 함께
   필요하기 때문이다.

## 다음

- [x] LOUIS CSS recipe 작성(2026-10-14)
- [ ] 제품을 그 recipe 로 이관
- [x] parity 계약(`scripts/verify-figma-parity.mjs`) 등재 — 기하 계약 · `figma/components.measured.json` 의
      `breadcrumb` · `packages/react/test/breadcrumb-geometry.browser.test.tsx`
