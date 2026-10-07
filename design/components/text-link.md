---
id: text-link
status: experimental
authority: normative
summary: 문장이나 표 칸 안에 놓이는 글자 링크로, 올렸을 때만 밑줄이 서고 면과 여백이 없습니다.
---

# Text Link

글자 링크. 상자 버튼이 아니라 **문장이나 표 칸 안의 글자**다 — 면도 여백도 없고 평소에는 주변 글자와 같은 한 줄이며,
올렸을 때만 밑줄이 서서 눌러 갈 수 있음을 밝힌다. [Button](./button.md) 의 ghost 는 상자 버튼이라 이 자리를 대신하지
못한다.

LOUIS 레시피는 `packages/css/src/component/text-link.css`(2026-10-07)다. React 표면은 없다.

## Availability

| Surface       | 상태           | 근거                                                                          |
| ------------- | -------------- | ----------------------------------------------------------------------------- |
| Web           | `not-ready`    | `packages/css/src/component/text-link.css` 레시피는 있다. 제품 세 곳은 아직 자기 상수로 그린다 — 소비 증거도 브라우저 시험도 없다 |
| Figma         | `not-ready`    | **Figma 변형은 아직 없다**                                                    |
| Documentation | `partial`      | 이 문서 — States · Content · Acceptance tests 절이 아직 없다 |
| Maturity      | `experimental` | 소비처가 이 클래스를 물면 승격을 다시 판정한다                                |

## When to use

- 표 칸의 이메일처럼 **그 자리에서 다른 화면을 여는** 글자, 영수증 · 상세 보기처럼 **칸 끝의 이동** 글자,
  되돌아가기 줄.
- 쓰지 않는 자리: 면이 있는 행동은 [Button](./button.md), 문서 안의 링크는 [Document](../patterns/document.md) 패턴이 소유한다.

**소비처 수 3 모양 · 5곳**(2026-10-07, 제품 작업 브랜치):

| 모양 | 소비처 | 근거 |
| --- | ---: | --- |
| 색 상속 + 호버 밑줄(`data-tone="inherit"`) | 3 | `feat/admin-ops-review` `AdminSection.tsx@0b25d15a3:1118` `USER_LINK` @a47fc4830 — 소비처 `AdAttributionPanel` · `CouponManagement` · `PaymentManagement` 가 `AdminUserLink` 로 문다 |
| `fg-secondary` → `fg-primary` + 호버 밑줄(기본) | 1 | `PaymentManagement.tsx@b57cd1f95:181` `RECEIPT` @ce9af3491 — 파란 밑줄이던 것을 다른 보조 글자와 같은 색에 올렸을 때만 밑줄로 바꿨다(커밋 본문) |
| 같은 색 전환, 밑줄 없음(`data-underline="none"`) | 3 | `feat/deck` `DeckParts.tsx@918133166:37` `BACK_LINK`(링크 둘) · 블로그 · 템플릿 상세 `BACK_LINK_CLASS`. 후자 둘은 `!` 로 전역 `a { color: inherit }` 를 이긴다 |

## API

```html
<!-- 표 칸의 이메일 — 패널을 여는 버튼 -->
<button type="button" class="louis-text-link" data-tone="inherit">gil@example.com</button>

<!-- 영수증 -->
<a class="louis-text-link type-caption-12-regular" href="…">영수증</a>

<!-- 되돌아가기 -->
<a class="louis-text-link type-body-14-medium" data-underline="none" href="/archive">보관함으로</a>
```

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| `.louis-text-link` | — | `fg-secondary`, 호버에 `fg-primary` + 밑줄 |
| `data-tone` | `inherit` | 색을 주변에서 물려받고 호버에 밑줄만 선다 |
| `data-underline` | `none` | 호버에도 밑줄 없이 색만 바뀐다 |

크기 · 굵기는 소비처의 type 클래스가 준다 — 이 클래스는 **글꼴을 쥐지 않는다**([Bare Button](./bare-button.md) 머리말).

## Specification

| 부분 | 값 | 토큰 / 근거 |
| --- | --- | --- |
| 평소 | 밑줄 없음, `fg-secondary` | `color-fg-secondary` |
| 호버 | `fg-primary` + 밑줄 | `color-fg-primary`, `@media (hover: hover)` 안 |
| 밑줄 간격 | 2 | `space-underline-gap`(제품 `underline-offset-2`) |
| 전환 | color | `motion-control-hover` |
| 버튼일 때 | 면 · 테두리 · 여백 0 | 제품 `p-0 bg-transparent` |

## Accessibility

- **포커스 링을 그리지 않는다(DS-D-0074).** 제품 세 곳이 붙이던 `louis-focus-ring` 은 base.css 규칙으로 흡수돼 없어졌다.
  그래서 **호버 밑줄이 유일한 시각 단서**이고 키보드 사용자는 링크라는 단서를 색 · 위치에서만 얻는다 — 소비처가
  링크임을 문맥으로 밝혀야 한다. 고대비 링은 base.css 가 소유한다.
- 호버 가드(`@media (hover: hover)`)로 터치에서 호버 상태가 남지 않는다. 제품 `BACK_LINK_CLASS` 는 가드 없는
  `[&:hover]:` 였다.
- `fg-secondary` 의 대비는 본문 기준을 넘는다(`fg-primary` 가 호버). 색만으로 링크임을 전하지 않도록 밑줄이 호버에 선다.

## Known deviations

- **`BACK_LINK` 의 밑줄 없음이 접근성 단서를 하나 더 줄인다(판정 필요).** 이동 링크가 호버에도 색만 바뀌어, 색을 못
  보는 사람에게 링크의 단서가 없다. 위치(되돌아가기 줄)가 문맥을 대신하는 자리라 `data-underline="none"` 으로만
  열어 두었고, 이 축을 남길지는 소유자 판정이다.
- **영수증이 다른 제품 파일에서는 파란 밑줄이다.** `origin/dev` 의 `RECEIPT` 는 `primary-400` + 항상 밑줄(라이트
  `primary-600`)이고 `feat/admin-ops-review` 가 이것을 이 모양으로 바꿨다 — 후자가 합쳐지면 정본이 된다.
- **소비처가 이 클래스를 물지 않는다.** 브라우저 시험과 Figma 변형이 없다.

## 출처

2026-10-07, 제품 `feat/admin-ops-review` `AdminSection.tsx@0b25d15a3:1118` · `PaymentManagement.tsx@0b25d15a3:181`, `feat/deck`
`DeckParts.tsx@918133166:37`, `app/blog/[slug]/page.tsx@70afc3604:64` · `app/templates/[slug]/page.tsx@70afc3604:75`.
