---
id: form-message
status: experimental
authority: normative
---

# FormMessage

폼 아래 한 줄 메시지 — error · neutral.

| 항목 | 값 |
| --- | --- |
| Figma | `partial` — component set 발행됨, 기하 계약 · 기록 · 되재기가 걸려 있다(DS-D-0035 (c)) |
| 코드 | CSS 레시피 `packages/css/src/component/form-message.css`(2026-10-14). React 표면은 없다 |

## 왜 있는가

제품 전수 인벤토리(2026-08-26)에서 **재사용되는 시각 패턴인데 디자인 시스템에 없던 것**으로
확인됐다. 적대적 검증을 통과했다 — 인용된 정의와 호출부가 실재하고, 기존 26 종 중 어느 것도
이것을 덮지 않는다.

제품 정본은 로그인 화면의 인라인 `<p>` 다(`app/(auth-brand)/login/page.tsx` 의 `ERROR_TEXT` ·
`type-caption-12-regular`).

## Anatomy

```html
<!-- error -->
<p class="louis-form-message" data-tone="error" role="alert" id="email-error">
  이메일 또는 비밀번호가 올바르지 않습니다.
</p>

<!-- neutral -->
<p class="louis-form-message" id="password-help">8자 이상 입력하세요.</p>
```

칸과는 `aria-describedby` 로 잇는다. error 는 `role="alert"` 로 나타날 때 읽힌다.

## Values

| 부분 | 값 |
| --- | --- |
| 칸 | 블록(폭은 폼이 정한다) · 높이 18(한 줄) · 시작 여백 4(`space-control-xs`) · 끝 · 위아래 0 · 모서리 0 |
| 글자 | caption regular 12/18/400 |
| error | `fg-danger`(제품 `accent-red-500`) — `data-tone="error"` |
| neutral | `fg-secondary`(기본) |

시작 여백 4 는 제품 `pl-2` 다 — 제품 Tailwind 간격 격자가 `--spacing: 2px` 라 2 × 2 = 4.

## 다음

- [x] LOUIS CSS recipe 작성(2026-10-14)
- [ ] 제품을 그 recipe 로 이관
- [x] parity 계약(`scripts/verify-figma-parity.mjs`) 등재 — 기하 계약 · `figma/components.measured.json` 의
      `form-message` · `packages/react/test/form-message-geometry.browser.test.tsx`
