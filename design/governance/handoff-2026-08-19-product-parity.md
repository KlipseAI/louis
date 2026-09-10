---
id: handoff-product-parity
status: beta
authority: reference
---

# 인계서 — 제품 실측 대조 (2026-08-19)

> **2026-08-23 검증.** 이 문서의 (A1)~(A5) 절차와 (A2')·(A2") 함정 분석은 다른 어디에도 없는
> 자산이라 그대로 살아 있다. 다만 **날짜가 붙은 절은 그 시점의 기록**이며 그 뒤로 바뀐 것이 있다.
>
> - 측정 기준은 `origin/main` 이 아니라 **`migration/product-evidence.lock.json` 의
>   `productCommit`** 이다. 두 브랜치는 실제로 갈렸다.
> - (A2) 반증은 **끝났고** 결과가 `migration/product-has-refutation.json` 에 있다.
>   워크플로를 resume 하지 마라 — 그 캐시는 저장소 밖이라 사라졌다.
> - 「제품이 움직였다 — 다음 세션의 첫 번째 일」이 제시한 두 갈래는 **둘 다 실행됐다.**
> - Figma 좌표(노드 id · 페이지 목록)와 표본 수는 **본문에서 걷어냈다.** 정본은 생성물과
>   게이트 출력이다.
> - 인계 전 검증 절차는 [계정 이전 인계서 3절](handoff-2026-08-22-account-transfer.md)이 소유한다.
> - **「락에 구멍이 있다」(아래)는 닫혔고, 그 사이 대상 파일 하나가 없어졌다.** 탐침이 읽는 파일을
>   `scripts/lib/product-files.mjs` 가 한곳에 모아 lock 이 함께 걷게 됐다. 그리고 제품이
>   `6602fd24` 에서 `TabBannerCarousel.tsx` 를 삭제했을 때 **그 구멍이 아니라 닫힌 락이 그것을
>   잡았다** — 재기준선을 뜨려는 순간 「배포본에 없는 파일을 인용합니다」로 멈췄다. 아래 인용은
>   그 시점의 기록이므로 좌표를 현재로 옮기지 않는다.
>
> **2026-08-30 갱신 — 본류였던 「빚을 0으로」는 끝났다.** 빚의 정본은
> `figma/unverified-values.json` 의 `$count` 이고 그 수는 **0**이다(`9736ca0`). 아래 「한 문장」과
> (A) 절은 그 소진 과정의 기록으로 읽는다 — 남은 일은 (B) 이후다.

이 문서 하나만 읽고 이어받을 수 있게 쓴다. 무엇이 왜 이렇게 됐는지, 지금 어디까지 왔는지,
다음에 무엇을 어떤 순서로 해야 하는지, 그리고 **하지 말아야 할 것**이 들어 있다.

## 한 문장

DS의 값 대부분이 **제품을 확인하지 않고 정해졌고**, Figma와 브라우저 테스트는 그 값과만
맞춰 왔기 때문에 게이트가 초록인 채로 셋 다 제품과 달랐다. 그것을 기계가 잡도록 방향을
뒤집는 중이었고, **남은 빚의 정본은 `figma/unverified-values.json` 의 `$count`** 다 —
이 문서를 쓰던 2026-08-19 에 359였고 지금은 0이다.

## 왜 이렇게 됐나

```
Figma  ←── figma/components.measured.json ──→  브라우저 테스트
                        ↑
                제품과 대조된 적 없음
```

`components.measured.json`은 Figma가 보고 그리는 원본이자 브라우저 테스트가 맞춰 보는
기준이다. 그래서 그 파일이 스스로와만 일관되면 두 대조가 모두 통과한다 — **그 파일이 제품과
다를 때에도 그렇다.** 모달이 여백 20 · 반경 20 · 액션 여백 16으로 나가고도 모든 게이트가
초록이었던 이유다.

하루 동안 같은 원인으로 나온 것들: mint 업그레이드 버튼(제품에 없음) · 배너 높이 240
(실제 360) · 브랜드 행 24(실제 40) · 내비 여백 8(실제 4) · 상단 바 제목 14(실제 16) ·
스크림이 글자 위에 칠해짐 · AppTopBar 슬롯 없음 · FloatingCreate(랜딩 데모에만 있는 것) ·
모달 액션 여백 · 토스트 흐림 10(실제 16).

## 지금 서 있는 장치

| 게이트 | 무엇을 막나 |
| --- | --- |
| `scripts/measure-product-components.mjs` | 제품 클래스를 제품 Tailwind로 컴파일해 실브라우저에서 재고 DS와 대조한다. 축마다 `same`(같아야) 또는 `deviates`(달라야 하고 사유가 있어야). **축 수는 `pnpm verify-product-components` 출력이 낸다** — 이 자리에 적혀 있던 210은 아래 (A) 첫 배치에서 이미 움직였다 |
| 같은 파일 · 열거 | 제품이 그 요소에 대해 **선언한 property를 전부 열거**하고 분류되지 않은 것이 있으면 실패. 기본·hover·의사요소가 **빠짐없이 분류**돼야 한다 — 건수는 `pnpm verify-product-components` 출력이 낸다 |
| 같은 파일 · 빚 명부 | `figma/unverified-values.json`. 제품 대조도 사유도 없는 DS 값의 명부이며 **건수는 그 파일의 `$count` 가 소유한다**(작성 시점 359 · 지금 0). 명부에 없는 새 값도, 해소됐는데 명부에 남은 값도 실패 — **줄기만 한다** |
| `scripts/measure-product-variants.mjs` | 제품의 경쟁 정의를 이름 패턴으로 전부 찾아 렌더하고 값이 같은 것끼리 묶는다. 표본 트리는 **모든 노드**를 잰다 |
| `scripts/verify-figma-parity.mjs` | Figma ↔ 기록. 변조 canary 34종 |

`pnpm verify`는 `verify:ci` 와 `verify:product` 두 갈래의 합이다. **단계 수를 여기 적지 않는다 —
정본은 `package.json` 의 그 두 스크립트다**(2026-08-30 기준 15 + 25 = 40). hosted CI 는 `verify:ci`
갈래만 돌므로 **CI 초록은 전량 통과가 아니다.** `verify:product` 갈래는 제품 저장소가 있는
로컬에서만 증명된다. 테스트 건수는 `pnpm test` 출력이 낸다.

## 흔들리던 게이트 둘을 고쳤다 (2026-08-19)

인계 시점에 **`pnpm verify`는 이미 빨간 상태였다.** 두 게이트가 애니메이션 도중을 재고 있었다.

| 게이트 | 흔들림 | 고치기 전 |
| --- | --- | --- |
| `verify-product-components` | `skeleton ::after transform` −360 → −359.944 (무한 반짝임 loop 도중) · `toast`·`toast-highlight`·`toast-mypage`의 `transform` Y 10 → 9.8369 (등장 애니메이션 도중) | 3/3 실패 |
| `verify-product-variants` | 표본 노드의 `opacity` | 4회 중 2회 실패 |

이 저장소가 이미 규칙으로 적어 둔 것이다 — "애니메이션 중간에 재지 않는다".
`measure-product-variants.mjs`는 그래서 `animation-duration: 1ms`를 주입하고 있었고
`measure-product-components.mjs`에는 그 처리조차 없었다. 그런데 **1ms는 끝나는 애니메이션만
끝으로 보낸다.** 무한 loop에는 끝이 없어서 1ms 주기 안 아무 지점이나 잡힌다.

**왜 급했나:** 이 인계의 전제가 "값은 에이전트가 아니라 브라우저가 판정한다"인데, 그 브라우저가
동전을 던지고 있었다. (A3)에서 EXPECT 행을 수백 개 넣는 동안 게이트가 무작위로 빨개지면, 다음
사람이 그것을 고치는 가장 쉬운 방법은 **그때 본 애니메이션 중간값을 기록에 붙여 넣는 것**이다.
잡음이 측정으로 세탁된다 — 이 저장소가 뒤집으려던 바로 그 방향이다.

### 고친 방법 — CSS가 아니라 애니메이션 객체

`components`에서 CSS 주입을 두 번 시도했다가 물렀다. 둘 다 **계측 장치의 값이 제품 근거인 척
기록에 남는** 문제가 있었다.

- `animation-duration: 1ms !important` — 이 스크립트는 `skeleton ::after animationDuration`을
  **대조 축으로 재고 있어서** duration을 덮으면 그 대조가 깨진다.
- `animation-play-state: paused !important` — 기하는 결정적이 되지만 이 property는 **제품이
  선언하는 것이라 기록에 이미 들어 있다.** 덮으면 `running`이던 7건이 `paused`로 바뀐다.

그래서 CSS 대신 `setContent` 직후 애니메이션 객체를 직접 세운다. 두 게이트에 같은 것을 넣었다.

```js
await page.evaluate(() => {
  for (const animation of document.getAnimations()) {
    try {
      animation.finish();          // 끝나는 것 → 쉬는 상태
    } catch {
      animation.currentTime = 0;   // 끝나지 않는 것(무한 loop) → 0s
      animation.pause();
    }
  }
});
```

`finish()`는 무한 애니메이션에서 던진다. 그것으로 두 경우를 가른다. 계산된 CSS 값은 제품이
선언한 그대로 읽히고 기하만 결정적이 된다. 의사요소(`::after`)의 애니메이션도
`document.getAnimations()`에 들어온다.

### 고치면서 드러난 것 — 기록이 **쉬기 전** 값을 담고 있었다

같은 근본 원인의 세 번째 사례다. 흔들림만 걷어낸 것이 아니라 **틀린 값 일곱 개가 고쳐졌다.**

```
product.variants.json        토스트 3벌 + myPage modalCard   opacity 0 → 1
product.rendered-components  toast·toast-highlight·toast-mypage  transform Y 10 → 0
```

`appHomeToastIn`은 `from { opacity: 0; translateY(10px) }`에서
`to { opacity: 1; translateY(0) }`로 간다(`apps/web/app/keyframes.css:510`). 즉 기록에 있던
`opacity: 0`과 `translateY(10px)`은 **등장 애니메이션의 시작 값**이지 쉬는 상태가 아니었다.
Figma **Product inventory**의 토스트 표본은 그 값으로 그려져 있었다 — 안 보이는 토스트다.

처음에 `currentTime = 0; pause()`만 넣었을 때는 기록이 한 바이트도 안 바뀌어 "잡음만 걷었다"고
볼 뻔했다. 바뀌지 않은 이유가 **기록된 값이 이미 시작 값이었기 때문**이라는 것을 `variants`의
`opacity 0 → 1`을 보고서야 알았다. 결정적인 것과 옳은 것은 다르다.

### 근거

- `components`: 고침 없이 3/3 실패 → 고친 뒤 6/6 통과
- `variants`: 고침 없이 4회 중 2회 실패 → 고친 뒤 6/6 통과
- 대조 210축 · 일치 181 · 기록된 편차 29 · 제품 선언 2,089건 분류 · 빚 359건 — **전부 그대로**다.
  바뀐 것은 위 일곱 값뿐이고 어느 것도 EXPECT 대조 축이 아니다.

**남은 것:** Figma Product inventory의 토스트 표본을 새 값으로 다시 그려야 한다. (B)에 속한다.

## 절대 하지 말 것

**재지 않은 값을 그리거나 적지 않는다.** 지어낼 수 있는 것은 자리 채움 *내용*뿐이다 —
프로젝트 이름, 사람 이름, 예시 문구. 숫자와 색은 전부 측정에서 와야 한다. 이 규칙은
`AGENTS.md`에 있고, 어긴 사례도 거기 적혀 있다.

구체적으로:
- `figma/product-specimens.json`에는 **구조만** 적는다 — 어떤 상수가 어떤 상수를 감싸는가,
  어떤 태그인가, 자리 채움 문구는 무엇인가. 여백·크기·색·반경은 한 줄도 안 된다.
- 소비처가 인라인 style로 얹는 선언은 **클래스를 이긴다.** 값을 옮겨 적지 말고 상수 이름만
  가리킨다(`inlineFrom`). 토스트 흐림이 그렇게 10으로 굳어 있었다.
- 제품 값을 읽을 때 `--spacing: 2px`를 잊지 않는다(`apps/web/app/tailwind.css`).
  `gap-4`는 8px이고 `h-8`은 16px이다.
- 애니메이션 중간에 재지 않는다. 표본 렌더는 애니메이션을 1ms로 줄여 쉬는 상태를 잰다.

## (A1)은 끝났다 — 결과가 저장소에 있다

`migration/unverified-value-map.json`에 359건 **전부**의 매핑이 들어 있다. 누락 0이다.

| 판정 | 수 | 뜻 |
| --- | ---: | --- |
| `product-has` | 244 | 제품에 대응 선언이 있다는 **주장**. 상수·파일·줄·값·상태조건이 붙어 있다 |
| `derived` | 61 | 다른 축에서 계산되는 값이다. 식이 적혀 있다. **네 갈래로 나뉜다 — 아래 (A2') 참조** |
| `product-none` | 54 | 제품에 그 축이 없다. DS가 세운 값이며 사유가 적혀 있다 |

세 수의 합이 359다. 인계 시점의 표에는 `derived`가 62로 적혀 있었고 파일의 `$counts`도 그랬는데,
실제 항목은 61이었다(합이 360이 되어 359와 맞지 않았다). 둘 다 61로 고쳤다. `$coverage`의
`명부에 없는 항목: 1`도 실제로는 0이다 — 명부 359와 매핑 359를 양방향으로 대조해 확인했다.

**그 파일은 검증되지 않았다.** 반증 단계를 떼어 냈기 때문이다. 파일 안에도 경고로 적어 두었다 —
**적힌 값을 그대로 DS에 옮기지 않는다.** 아래 (A2)와 (A3)이 그 일이다.

## 제품이 움직였다 (2026-08-20) — **해소됐다**

당시 배포본이 앞서 나가 `pnpm verify` 가 빨갰고, 그 원인이 **측정 스크립트는 움직이는 ref 를
따라가는데 근거 락은 커밋을 고정한다**는 구조적 어긋남이었다. 둘이 갈리면 같은 명령이 어제와
다른 값을 냈다.

**두 갈래를 모두 실행해 닫았다.**

- 측정 ref 를 락의 `productCommit` 에 묶었다 — [`scripts/lib/product-ref.mjs`](../../scripts/lib/product-ref.mjs)
  가 `KLIPSE_PRODUCT_REF` > 락의 `productCommit` > `design` 순으로 고른다. `origin/main` 경로는
  없다. 이제 **기준선 이동이 의도한 행위**가 된다 — 락을 갱신해야만 기준이 움직인다.
- 기준선을 정본 `design` 계열로 재기준선했다. 정본은 `origin/main` 이 아니다.

여기에 SHA 를 적지 않는다. 현재 기준선은 언제나 `migration/product-evidence.lock.json` 이
소유하며, 제품이 다시 앞서 나가면 `verify-product-evidence` 가 그 사실을 알린다 —
**그 빨강은 결함이 아니라 알림이다.** 대응은 재기준선이고 절차는 Updates (98)에 있다.

## 중단 지점 (2026-08-20) — 여기서 이어받는다

사용 한도 때문에 두 갈래를 도중에 멈췄다. **둘 다 되돌릴 필요 없이 이어받을 수 있다.**

### (A2) 반증 — **끝났다. 결과는 저장소에 있다 (2026-08-22)**

> **아래 「워크플로를 resume 하라」는 지시는 무효다.** 285축 전부가
> [`migration/product-has-refutation.json`](../../migration/product-has-refutation.json) 에 있고
> `verify-refutation-quotes` 게이트가 매 `pnpm verify` 마다 인용을 다시 연다. 캐시를 찾지 마라 —
> 그 세션 디렉터리는 계정이 바뀌면 사라진다. 전말은 Updates (98) ⑤.

에이전트 106명 중 98명의 결과 285축이 세션 워크플로 캐시(34MB)에만 있었고 저장소에는 사본이
없었다. 2026-08-22에 저장소로 옮기고 기계로 대조했다.

| 판정 | 수 |
| --- | ---: |
| 확인 — 인용이 기준선의 그 파일 그 줄에 그대로 | **231** |
| 기각 — 원래 반증에서 기각 | 39 |
| 기각 — **인용을 파일 어디에서도 못 찾음** | **15** |

좌표만 낡은 161건은 기계가 찾은 줄로 정정했다. **인용문은 한 글자도 고치지 않았다** — 인용이
증거이고 줄 번호는 좌표일 뿐이다.

인용 무효 15건은 `dialog`·`project-card`·`segmented-control` 의 테두리와 `icon-button`·`slider`
의 `VideoEditModal` 인용이다. **인용을 못 찾은 확인은 약한 확인이 아니라 기각이다**(`AGENTS.md`).
이 15축은 (A3)에서 브라우저가 처음부터 다시 판정한다.

**결과를 쓸 때의 원칙:** 에이전트 문장을 진실로 취급하지 않는다. "이 축은 제품의 어느 요소를
재면 되는가"라는 **탐침 주소로만** 쓰고 판정은 (A3)에서 브라우저가 한다. 게이트가 보는 것도
「인용이 실재하는가」이지 「값이 맞는가」가 아니다.

갈래 목록의 정의는 남겨 둔다 — `migration/unverified-value-map.json` 에서
`decision === "product-has" || route === "제품-주장" || route === "DS-내부만"` 인 285축이다.

### (B) 인벤토리 — 측정까지 끝, Figma 그리기만 남음

끝난 것:

- 표본을 크게 넓혔다. 구조는 제품 JSX에서 읽고 값은 브라우저가 쟀다 — **현재 수는
  `pnpm check-figma-inventory` 출력이 낸다**(「종」과 「표본」을 서로 다른 뜻으로 쓴 자리가
  이 문서에 여럿 있었다)
- 에이전트가 낸 구조를 기계로 검사했다: 인용 46/46 실재 · 상수 46/46 실재 · **값 누출 0건**
- 값 누출로 2종 기각. 둘 다 자리 채움 문구에 **제품에 없는 수치**가 섞인 경우였다
  (`"128 / 1000"` — 실제 상한은 2000)

남은 것 — **Figma Product inventory에 합치기 비교판 그리기**:

- 대상은 `Product inventory` 페이지다. **노드 id 와 좌표를 이 문서에 적지 않는다** —
  한때 루트 `254:2` 와 섹션 id 14개가 여기 박혀 있었으나 어느 것도 지금 재현되지 않는다.
  좌표의 정본은 생성물 [`figma/inventory-plan.json`](../../figma/inventory-plan.json)이고,
  그리기 코드는 페이지 이름과 섹션 키로 노드를 찾지 id 로 찾지 않는다
- 폰트는 파일 기존값 **Pretendard Medium**(+Bold 있음)을 따른다. 새 규칙을 만들지 않는다
- 그릴 데이터는 `migration/product.variants.json`의 `kinds`에서 결정적으로 만든다 —
  묶음을 `uses` 내림차순으로 놓고, 묶음끼리 값이 갈리는 축만 `다른 축`으로 표기한다

**변수는 만들지 않기로 했다.** `verify-figma-parity.mjs:1285`가 토큰 소스에 선언되지 않은
collection을 실패로 잡는다(허용: Klipse Primitive 123 · Semantic 75 · Semantic Color 60).
그리고 인벤토리는 계약이 아니라 **합칠 대상을 고르기 위한 증거판**이라, 고르기 전에 변수로
굳히면 제품 부채가 토큰 대접을 받는다. 합치기 결정이 끝난 뒤 **살아남은 값만** 토큰 소스에
올리고 그때 4번째 collection을 정식으로 만든다.

### 합치기 판단에 필요한 수 (실측)

| 종류 | 정의 | 묶음 | 묶음끼리 다른 축 |
| --- | ---: | ---: | ---: |
| badge | 13벌 | 13 | 20 |
| slider | 20벌 | 18 | 9 |
| text-field | 13벌 | 10 | 17 |
| selectable-list-row | 7벌 | 6 | 16 |
| icon-button | 6벌 | 5 | 14 |
| toast | 4벌 | 3 | 12 |
| dialog | 2벌 | 2 | **1** |

읽을 때 바로 보이는 것 셋 — `dialog`는 2벌이 `columnGap` 하나만 달라 사실상 이미 하나다.
`toast`는 4벌 중 2벌(appHome·highlight)이 값이 완전히 같고 사용 **172회**(86+86)로 압도적이다.
(2026-08-21 재실측 — 본문에 156회라고 적혀 있었다.)
`badge`는 13벌이 13묶음으로 하나도 안 겹쳐 가장 험하다.

## 합치기 비교판이 서 있다 (2026-08-20)

Figma **Product inventory** 페이지에 표본이 그려져 있다. 값은 전부 락이 고정한 커밋을 부모
문맥 안에서 브라우저로 잰 것이다. **계획의 현재 수는 `pnpm check-figma-inventory` 출력이
정본이고, Figma 에 실제로 그려진 수는 보드 이전이 끝나기 전까지 미정이다** — 한때 이 문서가
같은 페이지를 두고 「17종 54표본이 전부」와 「지금 8종만」을 동시에 적고 있었다.

**규칙과 실행 코드가 전부 저장소에 있다.** `scripts/build-figma-inventory.mjs`가
`figma/inventory-plan.json`(계획)과 `figma/inventory-draw.*.js`(실행 코드)를 생성하고
`pnpm verify`가 실측과의 어긋남을 잡는다. 다시 그릴 때는 draw 파일을 use_figma에 그대로
넘긴다 — **번호순으로 하나도 빠짐없이 전부** 넘긴다.

> **1번이 RESET 이다.** `figma/inventory-draw.1.js` 가 페이지의 기존 섹션을 지우고 시작하므로,
> 일부만 넘기면 **보드를 비운 채 그 일부만 복구된 상태로 끝난다.** 파일 수는 표본이 늘 때마다
> 늘어나므로 본문에 적지 않는다 — `pnpm check-figma-inventory` 출력의 「그리기 코드 N개」가 정본이다.
> (한때 이 자리가 「1~3.js … 1번 → 2번 → 3번」이라 적혀 있었고 실제 파일은 그보다 많았다.)

크기 정책: 제품이 **선언한 것만** 고정(FIX), `w-full`은 부모가 줌(FILL), 선언 없으면 부모
축으로 가른다(flex 행 자식=HUG, flex 열 자식·block=FILL). **FILL은 FILL로 남긴다** — 성립하지
않는 자리는 hug 부모를 실측폭으로 고정한다. 조립할 때 부모 고정만 풀면 된다(owner 결정).

남은 어긋남과 한계 (지어내지 않고 그대로 둔 것):

- **소수 반올림 1px** — Figma가 hug 폭을 정수로 만든다(44.41→45). 무해하다.
- **행간상자 1~2px** — 제품은 inline 글자를 인라인 상자로, Figma는 행간 상자로 잰다.
- **세그먼트 컨트롤 폭이 좁다**(92.53→84, 340→148) — `PERIOD_BTN`의 안쪽 여백이 측정
  트리에 없다. 표본 구조가 버튼 안쪽 여백을 담지 못했다. 다음 재측정에서 잡는다.
- **프로젝트 카드 2종은 84×0** — 하네스에 썸네일·비디오가 없어 접혔다. 자리 채움 이미지를
  표본에 넣어야 그릴 수 있다. 카드에 그렇게 적혀 있다.
- **컴포넌트화는 아직이다** — 지금은 프레임이다. 합치기 결정이 끝난 종류부터
  COMPONENT_SET으로 올리는 것이 다음 단계다. 확정된 것: 모달=appHome(빨간 삭제 버튼),
  아이콘 버튼=iconButton(Gnb.tsx:197). `migration/consolidation-choices.json`에 있다.

## 다음 순서

### (A) 빚을 0으로 — **끝났다**

> **완료.** `figma/unverified-values.json` 의 `$count` 가 정본이고 지금 **0**이다
> (`9736ca0` 「resolve all unverified debts」). 아래 (A1)~(A3)은 그 소진 절차의 기록이며,
> 같은 부류의 빚이 다시 생기면 그대로 다시 쓴다. 건수는 어느 쪽도 이 문서가 아니라
> 그 JSON 과 `pnpm verify-product-components` 출력이 소유한다.

**(A1) 끝났다.** `migration/unverified-value-map.json`을 읽는다.

**(A2) `product-has` 주장을 반증한다.** 값을 그대로 믿지 않는다. 확인할 것:
상수가 정말 그 파일에 있는가 · 그 선언이 더 구체적인 규칙에 지지 않는가 · 이름만 비슷한
다른 것이 아닌가 · `--spacing: 2px`를 빠뜨리지 않았는가. **확신이 없으면 기각한다.**

**(A3) 살아남은 것마다 탐침과 EXPECT 행을 넣는다.** 값은 에이전트가 아니라 **브라우저가**
판정한다.

> **첫 배치가 끝났다(2026-08-23) — 20축, 빚 359 → 339.** `banner-carousel` full 열 17축 ·
> 접힘 브랜드 2축 · `spinner` sm 높이. 대조 축이 210 → 232, 일치 181 → 203 이 됐다.
> **탐침은 대부분 이미 있다** — 71종이라 남은 일은 새 탐침이 아니라 기존 탐침에 EXPECT 행을
> 붙이는 쪽이 많다.
>
> 그 배치가 드러낸 것 둘을 다음 사람이 알아야 한다.
>
> - **어긋나 보이는 축이 「측정 장치의 부재」일 수 있다.** `sidebar-cta.sizes.{false,true}.width`
>   는 제품 280/56 대 DS 256/32 로 갈려 보이지만 재는 대상이 다르다 — DS 는 부품 자신의
>   border-box 폭, 280/56 은 레일 바깥 폭이고 `256 = 280 − 2×12` 다. 양쪽 소스가 똑같이
>   「부품은 폭을 선언하지 않는다」고 말한다. **하네스가 실제 폭의 레일을 못 세워서 넣지 못했다.**
>   넣었으면 빨개졌을 것이고 그 빨강을 「기록을 고치면 된다」로 읽는 것이 이 저장소가 막으려는
>   실패다. `wrapper` 가 `from` 참조를 받게 하면 폭 4축이 한꺼번에 풀린다.
> - **통과가 증거가 아닐 수 있다.** `sidebar-cta` 의 Hover 4축을 넣었더니 background 2축이
>   빨갰는데, 제품이 낸 값이 hover 가 아니라 **Default** 였다(hover 규칙이
>   `html[data-theme=X] .gnb-…:not(.…Active):hover` 라 하네스가 못 잡는다). 그리고
>   **foreground 2축은 Default 와 Hover 색이 우연히 같아 틀린 상태를 재고도 통과했다.**
>   넷 다 뺐다 — 통과하는 거짓 증거가 실패보다 나쁘다. DS 값 자체는 제품과 맞다.
>
> **하네스 구멍 셋을 고쳤다(2026-08-23).** 셋 다 **통과하는 축 뒤에 숨어 있었다.**
>
> | 구멍 | 증상 | 원인 | 고침 |
> | --- | --- | --- | --- |
> | 락 | 탐침이 읽는 제품 파일 3개가 미고정 | `from` 그룹 경로가 인용문에 안 나타난다 | `scripts/lib/product-files.mjs` 를 측정·락·신선도가 공유 |
> | hover | 상태 축이 Default 를 잰다 | `var()` 든 **단축 속성**을 longhand 로 못 옮긴다(CSSOM pending substitution) | `clone.style.cssText +=` 로 단축째 얹는다 |
> | wrapper | 폭 축이 host 폭을 잰다 | 조상이 클래스만 있고 **기하가 없다** | `wrapperFrom` 이 `from` 과 같은 경로로 조상 상수를 뽑는다 |
>
> `nav-item-hover` 가 멀쩡했던 것은 그쪽이 `background-color` **longhand** 였기 때문이지 장치가
> 옳아서가 아니다. **장치를 의심할 때는 장치가 무엇을 봤는지 먼저 찍어라** — 「선택자를 못
> 잡는다」로 두 번 헤맸고 매칭된 선택자를 출력해 보고서야 방향이 잡혔다.
>
> **남은 빚 333의 구조(2026-08-23).** 다음 사람이 어디를 집을지는 이 표가 정한다.
>
> | 갈래 | 수 | 무엇인가 | 어디로 |
> | --- | ---: | --- | --- |
> | 반증 생존 | 206 | 인용이 확인된 축 | **(A3)** — 탐침·EXPECT. 대부분 기존 탐침에 행만 붙이면 된다 |
> | 반증 기각 | 53 | 「제품에 그 선언이 없다」로 무너진 것 38 + 인용 무효 15 | **(A2")** — 부정 명제라 기계가 세게 해야 한다 |
> | 미조사 | 74 | `product-none` 54 · `제품-없음` 13 · **`충돌-기록됨` 7** | (A4). **7건은 해소 금지** |
>
> `충돌-기록됨` 7건을 `$키` 주석으로 넘기면 **이미 발견된 어긋남이 사유와 함께 영구히 지워진다.**
> `$키` 는 게이트가 내용을 보지 않는 유일한 길이고 되돌릴 고리가 없다.

> **락에 구멍이 있다.** `TabBannerCarousel.tsx` 와 `LoadingSpinner.tsx` 가
> `product-evidence.lock.json` 에 없다. 캐러셀에 17축을 매달았는데 제품이 그 파일을 바꿔도
> 알려 주지 않는다 — 탐침의 `source` 는 인용 수집 경로가 아니라서 신선도 게이트도 못 잡는다. 같으면 채택, 다르면 **DS를 고친다**(CSS · 기록 · Figma · 테스트 · 규범 문서를
같은 변경 단위에서). 다를 수밖에 없는 이유가 있으면 `deviates`로 사유와 함께 기록한다.

**(A2') `derived` 61건을 (A4)로 바로 보내지 않는다 — 함정이 있다.**

게이트가 값을 해소하는 길은 둘인데(`measure-product-components.mjs:1592-1612`), 그중 `$키` 주석
쪽은 **내용을 검사하지 않는다.** `$키`라는 형제 키가 있기만 하면 통과하고, 통과한 다음에는
게이트가 그 항목을 명부에서 지우라고 **요구한다**(남아 있으면 실패다). 즉 `$키` 주석은 되돌릴
고리가 없는 영구 해소다.

그런데 `derived` 사유 중 다수는 **"DS에 그 상태 규칙이 없어서 Default와 같다"** 형태다. 그것은
DS 캐스케이드에 대한 참인 진술이지 **제품을 확인한 진술이 아니다.** 그대로 (A4)를 돌리면 제품을
한 번도 보지 않은 축들이 사유가 붙은 채 영구히 빚에서 빠진다.

61건의 사유 본문을 전부 읽어 네 갈래로 나눴다. `migration/unverified-value-map.json`의 각 항목에
`route` 필드로 들어 있고 `$routes`에 뜻이 적혀 있다.

| route | 수 | 어디로 | 왜 |
| --- | ---: | --- | --- |
| `제품-없음` | 13 | **(A4)** | 제품에 그 상태·기능·축 자체가 없다(공용 Button에 loading prop이 없다, `frameWidth`는 Figma 프레임 전용). 잴 대상이 없다 |
| `제품-주장` | 14 | **(A2) → (A3)** | 사유 안에 제품 상수·파일·줄이 들어 있다. 이름만 `derived`이고 내용은 `product-has`다 |
| `DS-내부만` | 27 | **(A2)** | DS 캐스케이드·기하만 말한다. 제품 선언을 찾아본 뒤 없을 때에만 `제품-없음`으로 내린다 |
| `충돌-기록됨` | 7 | **(A3)** | 사유가 이미 제품과의 어긋남이나 자기모순을 적고 있다. **해소 금지** |

`충돌-기록됨` 7건이 가장 급하다. 지금 상태로 (A4)를 돌리면 **이미 발견된 어긋남**이 사유와 함께
영구히 지워진다.

- `icon-button.states.danger.Hover.{background,foreground}` — 확인했다. DS는 danger에 hover 면
  규칙이 아예 없어(`packages/css/src/component/icon-button.css`의 hover 규칙은 primary와
  secondary·ghost만 덮는다) Default의 `background-danger`가 그대로 남는다. 제품
  `overlayDeleteBtn`은 **반대다** — 평소 `background:transparent` · `color:gray-400 92%`이고
  hover에서만 `accent-red-600 88%`를 채우고 전경을 `palette-gray-000 95%`로 뒤집는다
  (`apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/vemClass.ts:1671`,
  `klipse-web` `origin/design`). 극성이 반대이므로 어느 쪽을 정본으로 삼을지 판정이 필요하다.
- `icon-button.states.secondary.Hover.foreground` — 확인했다. 제품 `backButton`은 hover에서
  전경을 올린다(`[&:hover]:[color:var(--palette-gray-900)]`, 다크는
  `[html[data-theme=dark]_&:hover]:[color:var(--palette-gray-000)]`,
  `apps/web/components/scenes/highlightSceneStyles.ts:9-38`). DS는 hover에서 면만 바꾼다.
- `icon-button.states.ghost.Hover.foreground` — 사유에 상수가 빠져 있어 찾아 뒀다.
  `projectImportBackBtn`이다(`apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/vemClass.ts:2752`).
  평소 `background:transparent` · `color:gray-000 78%`이고 hover에서 전경을 `100%`로 올리면서
  면도 `gray-000 8%`로 함께 얹는다 — DS는 hover에서 면만 바꾸고 전경을 그대로 둔다.
  (같은 파일의 `alignButton`(4행)과 `assetRailBtnActive`(143행)도 hover 전경을 100%로 올리지만
  둘 다 평소 면이 채워져 있어 ghost가 아니다. ghost 대응물은 `projectImportBackBtn` 하나다.)

  > **좌표 주의.** 위 넷은 한때 `VideoEditModal.tsx` 에 있었고 제품이 `videoEditParts/` 로
  > 쪼개면서 옮겨갔다. 그 파일에서 찾으면 0건이 나오고 「제품에 없다」로 잘못 기각하게 된다.
  > **값은 그대로이고 좌표만 죽었던 것이다.**
- `banner-carousel.sizes.{boxed,full}.controlsWidth` — 사유 자체가 DS가 제품보다 36px 넓다고
  적고 있다(정지 버튼 유무). 해소가 아니라 `deviates` 사유이거나 DS 수정 대상이다.
- `skeleton.sizes.text.height` — **사유가 자기를 반증한다.** 기록된 16px이 사유에 적힌 식에서
  나오지 않는다. 생성된 토큰이 단위 없는 `1.5`라 `block-size`가 무효 선언으로 버려지고
  14 × 1.5 = 21px과도 맞지 않는다. `derived` 판정 자체가 성립하지 않는다.

**(A2") `product-none` 54건은 함정이 다르다.** 54건을 다 읽었다 — `derived`보다 근거가 훨씬
낫다. 제품이 대신 무엇을 하는지를 적고 있고(비활성을 `opacity`로만 만든다, 폭을 부모에서 받는다),
파일·줄이나 탐색 범위("21벌 중", "29벌을 훑었을 때", "저장소 전체에 하나도")를 밝힌 것이 많다.
`derived`처럼 DS 캐스케이드만 말하고 마는 것은 없다.

문제는 다른 데 있다. **`product-none`은 전부 부정 존재 명제다** — "제품에 그 축이 없다". 인용은
있는 자리를 가리킬 수는 있어도 **없음을 증명하지는 못한다.** 그리고 이 저장소에는 이미 그것을
증명하는 기계가 둘 있다.

| 주장의 종류 | 증명하는 기계 | 지금 상태 |
| --- | --- | --- |
| **탐침이 가리키는 그 요소**가 그 property를 선언하지 않는다 | `measure-product-components.mjs`의 선언 열거(제품 선언이 빠짐없이 분류된다 — 건수와 탐침 수는 게이트 출력이 낸다) | **이미 강제되고 있다.** 제품이 그 property를 선언했다면 미분류로 걸렸을 것이다 — 사유를 `figma/product-coverage.json`에 옮기면 기계가 지킨다 |
| **제품 정의 전체**에 그런 것이 하나도 없다("29벌을 훑었을 때 강조 채움이 하나도 없다") | `measure-product-variants.mjs`가 이름 패턴으로 경쟁 정의를 전부 찾아 렌더한다 | **아직 이 주장에 연결되지 않았다.** 지금 근거는 에이전트가 한 번 훑은 문장뿐이고, 제품이 30벌째를 더하면 조용히 낡는다 |

그러므로 (A4)에서 `product-none`을 `$키` 주석으로 넘기기 전에, 그 주장이 위 표의 어느 줄인지
먼저 가른다. 첫째 줄이면 사유를 `product-coverage.json`으로 옮겨 기계에 맡긴다. 둘째 줄이면
`measure-product-variants.mjs`에 그 이름 패턴을 넣어 **부정 명제를 기계가 다시 세게** 한다.
주석만 적고 명부에서 지우는 것은 두 경우 모두 마지막 수단이다.

**(A4) `product-none` · `derived`는 `$키` 주석으로 사유를 적는다.** 규범 문서에도 반영한다.
**단 `derived`는 (A2')가 `제품-없음`으로 분류한 13건만 여기로 오고, `product-none`은 (A2")로
갈래를 가른 뒤에 온다.** `$키` 주석은 게이트가 내용을 보지 않는 유일한 길이고 통과하면 되돌릴
고리가 없다 — 기계가 지킬 수 있는 자리를 주석으로 덮지 않는다.

**(A5) 해소된 항목을 `figma/unverified-values.json`에서 지운다.** 게이트가 남아 있는 것을
실패로 잡으므로 잊을 수 없다.

큰 것부터: `icon-button` 52 · `button` 51 · `input` 26 · `dialog` 24 · `banner-carousel` 23 ·
`checkbox` 22 · `segmented-control` 21 · `menu-popover` 19.

### (B) 인벤토리 표본을 넓힌다

**먼저 이미 그려진 것을 다시 그린다.** 게이트를 고치면서 `product.variants.json`의 토스트 3벌과
myPage modalCard의 `opacity`가 `0 → 1`로 바뀌었다(위 「흔들리던 게이트 둘을 고쳤다」). 지금 Figma에
있는 토스트 표본은 **등장 애니메이션 시작 값으로 그려져 있다** — 안 보이는 토스트다. 넓히기 전에
이것부터 새 값으로 다시 그린다.

손으로 그렸던 아이콘 버튼 · 입력 · 슬라이더 · 목록 행은 한때 **지웠다** — 상상이 섞인 그림을
남겨 두는 것이 없는 것보다 나쁘기 때문이다. **Figma 에 지금 무엇이 그려져 있는지를 이 문서에
적지 않는다** — 보드 이전이 끝나기 전까지 확정할 수 없고, 한때 같은 페이지를 두고 「전부
그려져 있다」와 「8종만 그린다」가 이 문서 안에 동시에 있었다.

넓히는 방법: 소비처 JSX를 읽어 구조를 `figma/product-specimens.json`에 적고
`node scripts/measure-product-variants.mjs`로 재고, 그 값만으로 그린다.

아이콘 버튼은 글리프가 **제품 아트워크**라 아직 안 넣었다. 자리만 그리면 빈 상자이고 모양을
그리면 그것이 상상이다. 판정이 필요하다.

### (C) 이미 끝난 감사에서 나온 확인된 어긋남

`인벤토리 구성 감사`(101 에이전트, 반증까지 완료)의 **원본 출력은 소실됐다.** 세션 tasks
디렉터리에 있었고 저장소에 사본이 없었다 — 그 경로는 git 밖이라 계정·컴퓨터가 바뀌면 사라진다.
**아래 요약 셋이 남은 전부이며, 나머지 여섯 종류는 다시 감사해야 한다.** 토스트 셋은 이렇다:

1. **면과 글자가 테마로 반전된다.** 라이트는 어두운 면에 밝은 글자, 다크는 그 반대다.
   실측을 한 테마에서만 하면 반대 테마에서 뒤집힌 그림이 된다.
2. **흐림이 세 갈래다.** — 이미 고쳤다(16 채택).
3. **12/20+반경16과 12/24+반경999는 대안이 아니라 성질이 다른 두 계열이다.**
   앞은 반투명·흐림·그림자, 뒤는 불투명·테두리·흐림 없음이다.

나머지 여섯 종류는 **읽지 않은 것이 아니라 되찾을 수 없는 것**이다. 「이미 확인됨」으로
처리하지 말고 필요하면 다시 감사한다.

### (D) 손대지 않은 것

- **사이드바 토글 아이콘** — 카탈로그에 없어 `arrows-left-right`로 대신하고 있다. 제품
  글리프를 넣으려면 provenance를 확정해야 하는데(icon 게이트가 추정을 거부한다) 상용
  아이콘 라이브러리 중 무엇에서 왔는지 확인하지 못했다.
- **허브 템플릿 셋**(캔버스 · 비디오에디터 · 하이라이트) — 홈 템플릿만 서 있다.
- **publish** — npm과 Figma 라이브러리 둘 다 owner만 할 수 있다. **parity가 강제되기 전에는
  하지 않는다.** 틀린 값을 퍼뜨린다.

## 환경

- 저장소: `/Users/sejunki/klipse-design-system`
- 배포본: `/Users/sejunki/klipse-web` — **dev 서버를 띄우지 않는다**
  (`.env.local`이 실제 서비스에 붙는다). 제품 값은 `git show`로 읽고 클래스를 제품 Tailwind로
  컴파일해 Playwright에서 잰다.
- **측정 기준은 `migration/product-evidence.lock.json` 의 `productRef`/`productCommit` 이다.**
  여기에 SHA 를 적지 않는다 — 락이 움직이면 이 문서만 낡는다. `origin/main` 은 정본이 아니다
  (폐지된 글래스 섀도우가 거기에만 남아 있다).
- Figma: 파일이 셋이고 역할이 다르며 제품 미러는 읽기 전용이다. 어느 파일에 쓰는지는 `figma-sync.md` 「운영 파일」 절이
  소유한다 — 여기에 페이지 목록을 적지 않는다.
- Node/pnpm이 `~/.local`에 있다. PATH를 잡고 실행한다.
- 인계 전 검증: [계정 이전 인계서 3절](handoff-2026-08-22-account-transfer.md)이 소유한다.
  `KLIPSE_PRODUCT_REPO` 를 세우지 않으면 첫 게이트에서 멈추고, `pnpm clean-room` 은 커밋 뒤에 돈다.

## 오늘 커밋 29개

`b5675e0..HEAD`. 큰 줄기만:

- 제품 렌더 대조를 10축 → 210축으로. 컴포넌트 23/23
- 제품 선언 열거를 세워 2,089건 전부 분류(기본 · hover · 의사요소)
- 배너 스크림이 글자 위에 칠해지던 것을 고침
- 모달 반경·여백·액션 여백을 제품 값으로
- 토스트 흐림 10 → 16
- Progress 신설(DS-D-0022로 접근성 계약을 DS가 정함)
- SidebarNavRow 신설 — 두 화면 이상에서 쓰이는 7종이 전부 닫힘
- 홈 템플릿 재조립, 그 뒤 지어낸 부품 하나와 빠뜨린 셋을 고침
- 상상해서 그리는 길을 구조로 막음 · 빚 명부를 얼림
