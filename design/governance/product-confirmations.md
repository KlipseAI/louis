---
id: governance-product-confirmations
status: experimental
authority: normative
---

# 제품 확인 대기 목록

**이 저장소가 단독으로 정할 수 없는 것들**을 한 곳에 모은다. 각 항목은 실측 근거와 「무엇을 정해야
하는가」를 함께 갖는다. 흩어져 있으면 제품 쪽에서 무엇을 봐야 하는지 보이지 않는다.

기준은 배포본 `KlipseAI/klipse-web`의 `origin/main`이다. 값이 바뀌면
[product-evidence.lock.json](../../migration/product-evidence.lock.json)이 잡는다.

## 1 — 노드 비활성 핸들의 라이트 값

**증상.** 라이트에서 **비활성 핸들이 활성보다 훨씬 눈에 띈다.**

제품의 라이트 오버라이드는 `--node-handle-bg-{channel}` **하나만** 재정의한다
(다크 `{ramp}-800` → 라이트 `{ramp}-200`). `icon`과 `disabled` 계열 넷은 재정의가 없어 다크 값을
그대로 물려받으므로, 라이트 페이지에서 비활성 면이 `{ramp}-900`(거의 검정)이 된다.

**정해야 할 것.** `--node-handle-bg-disabled-*`와 `--node-handle-icon-disabled-*`의 라이트 값.
정해지면 [DS-D-0010](decisions/DS-D-0010-token-coverage.md) Open question 3이 닫히고 채널 semantic
12종이 올라간다.

## 2 — `180ms`가 어느 모션인가

**증상.** 배포본에서 **가장 많이 쓰이는 모션 길이 180ms(240회 · 55파일)에 대응하는 DS 모션이 없다.**
DS의 duration·motion이 제품의 58단 중 56.9%만 덮는다.

**정해야 할 것.** 180ms가 어떤 동작에 붙는가. 길이만 보고 `motion-*` 이름을 붙이면 근거 없는
토큰이 되므로, **무엇이 움직이는지**를 알아야 역할이 정해진다. 같은 이유로 `150ms`(68회)와
`280ms`(44회)도 미정이다.

## 3 — 제품의 자유값 축을 접을 것인가

[product.drift.json](../../migration/product.drift.json)이 매 `verify`마다 다섯 축을 잰다.

| 축 | 제품 | DS가 덮는 비율 | 결손 상위 |
| --- | ---: | ---: | --- |
| alpha | 73단 | 46.1% | 최다 `10%`에 토큰 없음 |
| duration | 58단 | 56.9% | 최다 `180ms`에 토큰 없음 |
| spacing | 43단 | 76.1% | 홀수 `1·3·5·7·9·11px` 197회 |
| radius | 24단 | 83.5% | 홀수 `1·3·5·7·9px` 45회 |
| border-width | 8단 | 92.1% | `1.5px` 6회 |

**셋 다 「스케일이 아니라 그때그때 넣은 값」의 자국이다.** 최다 사용값조차 전체의 한 자릿수 %를
차지하는 축(alpha)은 설계된 스케일이 아니다.

**정해야 할 것.** 접을 것인가. alpha는 매핑표와 확인 대상 79자리가
[alpha-consolidation.json](../../migration/alpha-consolidation.json)에 준비돼 있다. radius와
spacing의 홀수 계단은 **전부 이웃과 1px 차**라 화면에서 구분되지 않으므로 확인할 자리가 없다.
접는 것은 제품 저장소 변경이므로 이 저장소가 하지 않는다.

## 4 — `--palette-gray-200-rgb` 미러가 hex와 어긋난다

**증상.** 앱 셸 램프에서 **같은 색이 소비 경로에 따라 다르게 렌더된다.**

    var(--palette-gray-200)                 → #eeeef1 = 238 238 241
    rgb(var(--palette-gray-200-rgb) / n%)   → 238 239 241        ← G 채널 1 차이

`palette-gray-100`·`150`·`300`은 모두 일치하고 **`200` 하나만** 어긋난다.

**정해야 할 것.** 미러를 `238 238 241`로 고칠 것인가. DS는 hex를 정본으로 삼아 **238**을 쓰기로
했으므로([실행 인계서](execution-handoff.md)의 DS-P3-014 절) 제품이 미러를 맞추면 정합이 선다.

## 5 — 기존 알파 토큰 9개가 사다리와 어긋난다

`ink-alpha-5` · `paper-alpha-14` · `paper-alpha-45` · `paper-alpha-72` · `paper-alpha-86` ·
`ink-alpha-86` · `black-alpha-28` · `black-alpha-56` · `black-alpha-72`.

**지금 고치지 않는다.** 제품이 아직 그 값을 쓰고 있어서 지금 접으면 DS가 제품과 갈린다 — 실측
게이트가 막으려는 바로 그 상태다. **3번이 정해지면 제품과 함께 접는다.** semantic 바인딩 12건이
걸려 있고 그중 `color-foreground-menu-item`(86%→80%)과 `color-scrim-modal`이 눈에 띈다.
