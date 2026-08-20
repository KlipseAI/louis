---
id: handoff-product-parity
status: beta
authority: reference
---

# 인계서 — 제품 실측 대조 (2026-08-19)

이 문서 하나만 읽고 이어받을 수 있게 쓴다. 무엇이 왜 이렇게 됐는지, 지금 어디까지 왔는지,
다음에 무엇을 어떤 순서로 해야 하는지, 그리고 **하지 말아야 할 것**이 들어 있다.

## 한 문장

DS의 값 대부분이 **제품을 확인하지 않고 정해졌고**, Figma와 브라우저 테스트는 그 값과만
맞춰 왔기 때문에 게이트가 초록인 채로 셋 다 제품과 달랐다. 그것을 기계가 잡도록 방향을
뒤집는 중이고, 남은 빚이 **359건**이다.

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
| `scripts/measure-product-components.mjs` | 제품 클래스를 제품 Tailwind로 컴파일해 실브라우저에서 재고 DS와 대조한다. **210축**. 축마다 `same`(같아야) 또는 `deviates`(달라야 하고 사유가 있어야) |
| 같은 파일 · 열거 | 제품이 그 요소에 대해 **선언한 property를 전부 열거**하고 분류되지 않은 것이 있으면 실패. 기본·hover·의사요소 **2,089건 전부 분류** |
| 같은 파일 · 빚 명부 | `figma/unverified-values.json`. 제품 대조도 사유도 없는 DS 값 **359건**. 명부에 없는 새 값도, 해소됐는데 명부에 남은 값도 실패 — **줄기만 한다** |
| `scripts/measure-product-variants.mjs` | 제품의 경쟁 정의를 이름 패턴으로 전부 찾아 렌더하고 값이 같은 것끼리 묶는다. 표본 트리는 **모든 노드**를 잰다 |
| `scripts/verify-figma-parity.mjs` | Figma ↔ 기록. 변조 canary 34종 |

`pnpm verify`는 14단계다. 현재 전부 초록, 테스트 774.

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

## 제품이 움직였다 (2026-08-20) — 다음 세션의 첫 번째 일

**배포본 `origin/main`이 `7e9c3b69` → `6337ad54`로 넘어갔다.** 이 저장소의 모든 실측은
`7e9c3b69` 기준이고 `migration/product-evidence.lock.json`도 그 커밋을 고정하고 있다.

그래서 **지금 `pnpm verify`는 빨갛다.** 커밋한 작업 때문이 아니라 제품이 앞서 나갔기 때문이고,
게이트는 정확히 제 일을 하고 있다.

```
verify-product-evidence    근거 파일이 배포본에서 바뀌었습니다: AppHomeScene.tsx
                           (고정 8b3cc174 ≠ 현재 a7919f51)
verify-product-render      배포본의 렌더 값이 기록과 다릅니다 (기록 7e9c3b69 → 현재 6337ad54)
verify-product-components  같은 사유
```

**드러난 구조적 문제:** 측정 스크립트는 `KLIPSE_PRODUCT_REF ?? "origin/main"` 으로 **움직이는
ref**를 따라가는데, 근거 lock은 **커밋을 고정**한다. 둘이 갈리면 같은 명령이 어제와 다른 값을
낸다. 실제로 `previewZoomBadge` 상수가 새 커밋에서 사라져 표본 측정이 하드 실패했다.

이번에는 `KLIPSE_PRODUCT_REF=7e9c3b69…`로 고정해 재측정했고, 그래서
`migration/product.variants.json`의 `productRef`가 `"origin/main"`이 아니라 **SHA로 박혀 있다.**
어디서 돌려도 같은 값이 나온다.

다음 세션이 정할 것 — 둘 중 하나다.

1. **재기준선.** `6337ad54`로 lock을 갱신하고 전부 다시 잰다. 바뀐 값은 (A3)과 같은 방식으로
   판정한다. 제품을 따라가는 정공법이지만 양이 크다.
2. **측정 스크립트의 기본 ref를 lock의 `productCommit`으로 바꾼다.** 그러면 재기준선이
   **의도한 행위**가 된다 — lock을 갱신해야만 기준이 움직인다. 지금처럼 조용히 어긋나지 않는다.

**2를 먼저 하고 1을 하는 것을 권한다.** 그러지 않으면 재기준선 도중에 제품이 또 움직여도 모른다.

## 중단 지점 (2026-08-20) — 여기서 이어받는다

사용 한도 때문에 두 갈래를 도중에 멈췄다. **둘 다 되돌릴 필요 없이 이어받을 수 있다.**

### (A2) 반증 — 일시정지, 결과 98건 캐시됨

에이전트 106명 중 98명이 결과를 냈고 저널에 남아 있다(1.7MB). 처음부터 다시 돌리지 않는다.

```
Workflow({
  scriptPath: "~/.claude/projects/-Users-sejunki-klipse-design-system/<세션>/workflows/scripts/a2-refute-quoted-wf_af8ccc6c-5d1.js",
  resumeFromRunId: "wf_af8ccc6c-5d1",
  args: [ ...57갈래 라벨... ]
})
```

끝난 에이전트는 캐시에서 즉시 반환되고 안 끝난 것만 새로 돈다. 갈래 목록은 스크립트 파일 옆의
`chunks.json` 생성 로직으로 다시 만들 수 있다 — `migration/unverified-value-map.json`에서
`decision === "product-has" || route === "제품-주장" || route === "DS-내부만"`인 285축을
컴포넌트별로 6개 이하씩 쪼갠 것이다.

**결과를 쓸 때의 원칙:** 에이전트 문장을 진실로 취급하지 않는다. "이 축은 제품의 어느 요소를
재면 되는가"라는 **탐침 주소로만** 쓰고 판정은 (A3)에서 브라우저가 한다. 살아남은 확인은
`migration/product-has-refutation.json`에 쓰고 `scripts/verify-refutation-quotes.mjs`로 인용을
기계 대조한다 — 인용을 못 찾은 확인은 무효다.

### (B) 인벤토리 — 측정까지 끝, Figma 그리기만 남음

끝난 것:

- 표본 **8종 20노드 → 54종 224노드**. 구조는 제품 JSX에서 읽고 값은 브라우저가 쟀다
- 에이전트가 낸 구조를 기계로 검사했다: 인용 46/46 실재 · 상수 46/46 실재 · **값 누출 0건**
- 값 누출로 2종 기각. 둘 다 자리 채움 문구에 **제품에 없는 수치**가 섞인 경우였다
  (`"128 / 1000"` — 실제 상한은 2000)

남은 것 — **Figma Product inventory에 합치기 비교판 그리기**:

- 뼈대는 이미 서 있다. 페이지 `Product inventory`, 루트 노드 **`254:2`**,
  `x=1445 y=0`(기존 프레임과 400 띄움). 종류별 빈 섹션 7개가 `placeholder = true`로 있다
- 섹션 노드 id — badge `254:6`/rows `254:8` · slider `254:9`/`254:11` ·
  text-field `254:12`/`254:14` · selectable-list-row `254:15`/`254:17` ·
  icon-button `254:18`/`254:20` · toast `254:21`/`254:23` · dialog `254:24`/`254:26`
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
`toast`는 4벌 중 2벌(appHome·highlight)이 값이 완전히 같고 사용 156회로 압도적이다.
`badge`는 13벌이 13묶음으로 하나도 안 겹쳐 가장 험하다.

## 다음 순서

### (A) 빚 359건을 0으로 — 가장 중요하다

**(A1) 끝났다.** `migration/unverified-value-map.json`을 읽는다.

**(A2) `product-has` 주장을 반증한다.** 값을 그대로 믿지 않는다. 확인할 것:
상수가 정말 그 파일에 있는가 · 그 선언이 더 구체적인 규칙에 지지 않는가 · 이름만 비슷한
다른 것이 아닌가 · `--spacing: 2px`를 빠뜨리지 않았는가. **확신이 없으면 기각한다.**

**(A3) 살아남은 것마다 탐침과 EXPECT 행을 넣는다.** 값은 에이전트가 아니라 **브라우저가**
판정한다. 같으면 채택, 다르면 **DS를 고친다**(CSS · 기록 · Figma · 테스트 · 규범 문서를
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
  (`apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:1806-1832`,
  `klipse-web` `origin/main`). 극성이 반대이므로 어느 쪽을 정본으로 삼을지 판정이 필요하다.
- `icon-button.states.secondary.Hover.foreground` — 확인했다. 제품 `backButton`은 hover에서
  전경을 올린다(`[&:hover]:[color:var(--palette-gray-900)]`, 다크는
  `[html[data-theme=dark]_&:hover]:[color:var(--palette-gray-000)]`,
  `apps/web/components/scenes/highlightSceneStyles.ts:9-38`). DS는 hover에서 면만 바꾼다.
- `icon-button.states.ghost.Hover.foreground` — 사유에 상수가 빠져 있어 찾아 뒀다.
  `projectImportBackBtn`이다(`apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:2844-2853`).
  평소 `background:transparent` · `color:gray-000 78%`이고 hover에서 전경을 `100%`로 올리면서
  면도 `gray-000 8%`로 함께 얹는다 — DS는 hover에서 면만 바꾸고 전경을 그대로 둔다.
  (같은 파일의 `alignButton`:284과 `assetRailBtnActive`:425도 hover 전경을 100%로 올리지만 둘 다
  평소 면이 채워져 있어 ghost가 아니다. ghost 대응물은 `projectImportBackBtn` 하나다.)
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
| **탐침이 가리키는 그 요소**가 그 property를 선언하지 않는다 | `measure-product-components.mjs`의 선언 열거(2,089건 전부 분류, 탐침 47종) | **이미 강제되고 있다.** 제품이 그 property를 선언했다면 미분류로 걸렸을 것이다 — 사유를 `figma/product-coverage.json`에 옮기면 기계가 지킨다 |
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

Figma **Product inventory** 페이지는 지금 표본 8종(모달 2 · 토스트 2 · 배지 4)만 그린다.
손으로 그렸던 아이콘 버튼 · 입력 · 슬라이더 · 목록 행은 **지웠다** — 상상이 섞인 그림을
남겨 두는 것이 없는 것보다 나쁘다.

넓히는 방법: 소비처 JSX를 읽어 구조를 `figma/product-specimens.json`에 적고
`node scripts/measure-product-variants.mjs`로 재고, 그 값만으로 그린다.

아이콘 버튼은 글리프가 **제품 아트워크**라 아직 안 넣었다. 자리만 그리면 빈 상자이고 모양을
그리면 그것이 상상이다. 판정이 필요하다.

### (C) 이미 끝난 감사에서 나온 확인된 어긋남

`인벤토리 구성 감사`(101 에이전트, 반증까지 완료)가 확인한 것들이 남아 있다. 출력은
세션 tasks 디렉터리의 `wg8ze6ct7.output`이다. 토스트에서만 셋이 확인됐다:

1. **면과 글자가 테마로 반전된다.** 라이트는 어두운 면에 밝은 글자, 다크는 그 반대다.
   실측을 한 테마에서만 하면 반대 테마에서 뒤집힌 그림이 된다.
2. **흐림이 세 갈래다.** — 이미 고쳤다(16 채택).
3. **12/20+반경16과 12/24+반경999는 대안이 아니라 성질이 다른 두 계열이다.**
   앞은 반투명·흐림·그림자, 뒤는 불투명·테두리·흐림 없음이다.

나머지 여섯 종류의 결과는 아직 읽지 않았다.

### (D) 손대지 않은 것

- **사이드바 토글 아이콘** — 카탈로그에 없어 `arrows-left-right`로 대신하고 있다. 제품
  글리프를 넣으려면 provenance를 확정해야 하는데(icon 게이트가 추정을 거부한다) 상용
  아이콘 라이브러리 중 무엇에서 왔는지 확인하지 못했다.
- **허브 템플릿 셋**(노드캔버스 · 비디오에디터 · 하이라이트) — 홈 템플릿만 서 있다.
- **publish** — npm과 Figma 라이브러리 둘 다 owner만 할 수 있다. **parity가 강제되기 전에는
  하지 않는다.** 틀린 값을 퍼뜨린다.

## 환경

- 저장소: `/Users/sejunki/klipse-design-system`
- 배포본: `/Users/sejunki/klipse-web`, `origin/main` `7e9c3b69` — **dev 서버를 띄우지 않는다**
  (`.env.local`이 실제 서비스에 붙는다). 제품 값은 `git show`로 읽고 클래스를 제품 Tailwind로
  컴파일해 Playwright에서 잰다.
- Figma draft: `bxGEp0km5zluMJGulaTvFW`. 페이지 6개 —
  Cover · Foundations · Components · Patterns · Templates · Product inventory
- Node/pnpm이 `~/.local`에 있다. PATH를 잡고 실행한다.
- 인계 전 검증: `pnpm build && pnpm check && pnpm verify && pnpm test && git diff --check`

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
