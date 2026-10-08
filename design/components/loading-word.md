---
id: loading-word
status: experimental
authority: normative
summary: 스피너 없이 글자 자체를 쉬머로 흘려 문구형 로딩을 말합니다.
---

# Loading Word

**스피너를 붙이지 않고 글자 자체를 쉬머로 흘리는** 로딩 표시. 진행 상태를 글자로 말하는 자리 —
화면·패널·표 본문의 블록 로딩, 진행 중에 라벨을 진행 문구로 갈아 끼우는 버튼 — 가 이것을 쓴다.

**정본은 제품이다.** 2026-10-07 제품 하이라이트 새 화면 작업 브랜치(`feat/highlight-new-screen`)의
`components/ui/LoadingWord.tsx` 가 구현이고 **문구형 로딩의 정본이라고 스스로 선언했다.**
같은 브랜치에서 9개 파일이 가져다 쓴다 — 하이라이트 보드가 12자리(상단 바 · 목록 · 진행 단계 ·
버튼), 그 밖에 홈 · 캔버스 노드 · 구독 해지 · 결제 창 · 확인 창 · 관리자 화면이다. 그 전에는 같은
스윕 keyframe 을 이름만 바꿔 네 벌, 소비처마다 한 벌씩 복제해 쓰고 있었다
([Loading](../patterns/loading.md) 의 「시머 텍스트 — 관측 기준선」). **LOUIS 레시피는 이 문서와 같은
변경 단위에서 선다** — `packages/css/src/component/loading-word.css`. React 표면은 없고 소비처가
클래스를 직접 쓰는 형태이며 [Alert](./alert.md) · [Skeleton](./skeleton.md) 이 같다.

**[Inline Loading Label](./inline-loading-label.md) 의 변형이 아니라 따로 선 컴포넌트다.** 둘은 같은
질문(「컨트롤이 도는 동안 무엇을 보이는가」)에 서로 다른 답을 한다.

| | Inline Loading Label | Loading Word |
| --- | --- | --- |
| 진행을 말하는 것 | 라벨 옆에서 열리는 **스피너 슬롯** | **글자 자체** |
| 구조 | Root · Label · Slot · 링 (슬롯이 폭을 연다) | 글자 하나(`<span>`) — 슬롯이 없다 |
| 문구 처리 | 로딩 문구의 꼬리 말줄임표를 런타임에 떼어낸다 | 하지 않는다 — 호출부가 말줄임표 없는 문구를 낸다 |
| 축 | `size` · `loading` | 없다 |
| 쓰는 자리 | 스피너가 이미 붙은 기존 버튼 20곳 | 글자만 있던 자리, 블록 로딩, 새 버튼 진행 상태 |

변형으로 두지 않은 이유는 셋이다. 슬롯과 링이 이 표시의 정체인 쪽에 이쪽은 **그것이 정체가 아니다**
— 변형 축이 하나도 겹치지 않는다. 쓰는 자리도 겹치지 않는다 — 제품이 「글자만 있던 자리에 스피너를
새로 붙이지 않는다」고 정했다. 그리고 한 컴포넌트에 넣으면 「스피너를 쓸 것인가 글자를 쓸 것인가」가
prop 으로 숨어 [Loading](../patterns/loading.md) 의 선택 기준이 컴포넌트 안으로 들어간다.

## Availability

| Surface       | 상태           | 근거                                                                                                                                                                  |
| ------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web           | `partial`      | `packages/css/src/component/loading-word.css` 레시피가 선다. **acceptance test 0건 · React 표면 없음 · 제품이 이 클래스를 무는 증거 없음** — 제품은 아직 자기 Tailwind 리터럴로 그린다 |
| Figma         | `partial`      | component set `LoadingWord`(2026-10-08) — `Motion=flow`(흐름의 0프레임) · `reduced`(단색 88%) 두 정지 상태, `Label` 텍스트 속성. 되읽기 등재 + parity 계약(축 · 바인딩)이 있다. 흐름 자체는 표현하지 못하고([Skeleton](./skeleton.md) 과 같은 한계) 기하 계약이 없어(크기와 글꼴은 호출부 몫) `done` 이 아니다 |
| Documentation | `done`         | 이 문서                                                                                                                                                               |
| Maturity      | `experimental` | 레시피와 문서가 처음 선다. 승격 조건은 되재기(Acceptance tests)가 서고 제품이 이 클래스를 무는 것이다                                                                  |

## When to use

- **진행 상태를 글자로 말하는 자리.** 글자만 있던 자리에 스피너를 새로 붙이지 않고 이것으로 흘린다.
  - **블록 로딩** — 화면 · 패널 · 표 본문이 통째로 기다릴 때 가운데에 한 줄. 결제 상태 화면은 로딩
    동안 제목 · 설명 · 오류 · 메타 · 액션을 렌더하지 않고 이 단어 하나만 남긴다.
  - **버튼의 진행 상태** — 「결제하기」 → 「결제 진행 중」처럼 **라벨을 진행 문구로 갈아 끼우고** 그
    문구를 흘린다. 아래 「버튼 진행 상태」.
  - **한 줄 상태 문구** — 구간 목록의 「올리는 중」 · 「분석 중」, 트랙 블록의 제목처럼 상태가 글자로
    서 있는 자리.
- 쓰지 않는 자리:
  - **이미 [Inline Loading Label](./inline-loading-label.md)(스피너)이 붙은 버튼** — 그대로 둔다.
    일괄로 뜯어 고치지 않는다. 두 표현을 한 버튼에 겹치지 않는다.
  - **구조가 정해진 콘텐츠의 첫 로드** — [Skeleton](./skeleton.md) 이다. 올 내용의 모양을 아는 곳이다.
  - **독립된 작은 영역** — [Spinner](./spinner.md) 와 짧은 문구다.
  - **진행률을 아는 작업** — [Progress](./progress.md) 다. 흐르는 글자는 남은 정도에 대해 아무것도
    말하지 않는다.
  - **글자가 없는 자리** — 이 표시는 글자가 정체다. 문구 없는 로딩은 만들 수 없다.

## Anatomy

1. **Word** — `<span class="louis-loading-word">`. 글자 한 줄 또는 짧은 구. `inline-block`.

그것이 전부다 — 슬롯도 아이콘도 면도 반경도 여백도 없다. 크기와 글꼴은 **호출부가 정한다**: 블록
로딩은 타이포 클래스(`type-heading-28-medium` 등)를 얹고, 버튼 안에서는 클래스 없이 버튼의 글자
크기를 그대로 받는다.

## Properties

prop 이 없다. 레시피는 클래스 하나이고 지역 변수가 하나다.

| 이름 | 종류 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `.louis-loading-word` | 클래스 | — | 글자를 쉬머로 흐르게 한다 |
| `--louis-loading-word-ink` | 지역 변수 | `var(--louis-color-fg-primary)` | 그라디언트와 정지 잉크의 색. 다른 면 위에 놓을 때 이것만 덮는다 |

## Variants, sizes, and states

**변형 축도 크기 축도 없다.** 크기는 글자가 정하고 글자는 호출부가 정한다. Skeleton 의 `data-shape`
같은 축을 만들지 않는다 — 블록 로딩과 버튼 안은 **감싸는 자리**가 다를 뿐 이 표시가 다른 것이
아니다.

**상호작용 상태 축이 없다.** hover · focus · active · disabled 는 전부 감싸는 컨트롤이 받는다 —
`<span>` 이라 포인터도 키보드도 받지 않는다.

## States

| 상태 | 글자 | 배경 |
| --- | --- | --- |
| 흐름 | `transparent` | 9정지점 그라디언트를 글자 모양으로 자른다. `-100%` 를 `2.2s` 등속으로 민다 |
| `prefers-reduced-motion: reduce` | 잉크 88% 하나 | 그라디언트가 없다. **글자가 읽힌다** |
| `forced-colors: active` | `CanvasText` | 없다 |

## Interaction and responsive behavior

### 버튼 진행 상태

제품이 버튼의 진행 상태를 스피너에서 이것으로 바꿨다(작업 브랜치 커밋 `f9006364c` 외). 규칙은 셋이다.

1. **라벨을 진행 문구로 갈아 끼우고 그 문구를 흘린다.** 평소 「클립 추출」은 진행 중 「N개 추출
   중」(`statusExtracting`)이 되고 그 문자열이 Loading Word 로 감싸진다. 스피너를 더하지 않는다.
2. **초점을 지키기 위해 네이티브 `disabled` 가 아니라 `aria-disabled` 를 쓴다.** 눌린 버튼이
   `disabled` 가 되면 브라우저가 초점을 버려 키보드 사용자는 어디에 있었는지 잃는다. 대신
   `aria-disabled="true"` 로 알리고 **activation 을 명시적으로 막는다**(핸들러를 빼거나 첫 줄에서
   돌려보낸다). LOUIS [Button](./button.md) 은 이미 `aria-disabled` 를 `disabled` 와 같은 모양으로
   그리고 hover · active 를 끈다(`button.css` 의 `[aria-disabled="true"]` 규칙).
3. **중복 실행을 막는다.** 문구만 바꾸고 핸들러를 살려 두면 진행 중에 또 눌린다.

단 **확인 창의 확인 버튼은 아직 네이티브 `disabled` 를 쓴다**(`ConfirmModal.tsx` — `disabled={confirmDisabled}`
로 두고 `confirmLoading` 이 문구만 흘린다). 제품 안에서도 두 갈래가 남아 있고 이 문서가 어느 쪽을
정본으로 세우는지는 Known deviations 에 적는다.

### 그 밖

- **버튼 폭이 문구에 따라 움직인다.** 라벨이 평소 문구에서 진행 문구로 즉시 갈아 끼워진다. 평소
  폭을 미리 잡아 두는 장치가 없다 — 이 컴포넌트는 폭을 스스로 정하지 않는다.
- 줄바꿈 · 축소 · 말줄임은 감싸는 컨트롤이 정한다. 긴 문구에서 무엇이 일어나는지는 **이 저장소에서
  실측하지 않았다**(결손).
- `prefers-reduced-motion` 에서 흐름이 사라지고 글자가 하나의 잉크로 정지한다. 로딩이라는 뜻은 문구와
  감싸는 영역이 유지한다.

## Content

[Loading](../patterns/loading.md) 의 문구 규칙을 그대로 따른다.

- **진행 문구는 끝에 `...` · `…` 를 붙이지 않는다.** [Inline Loading Label](./inline-loading-label.md)
  은 꼬리 말줄임표를 런타임에 떼어내지만 **이 컴포넌트는 그 방어를 갖지 않는다.** 문구를 넘기는
  호출부가 말줄임표 없는 문구를 내야 한다 — 흐르는 글자가 이미 「진행 중」을 말하고 있어 점이 같은
  말을 두 번 한다.
- 「무엇이 도는가」를 말한다. `로딩` 이 아니라 `추출 중` · `분석 중` · `결제 진행 중`.
- 평소 문구와 진행 문구는 **서로 다른 글자**다. 같은 라벨에 쉬머만 입히면 무엇이 시작됐는지
  전해지지 않는다.

| | KO | EN | JA |
| --- | --- | --- | --- |
| 추출 · 평소 | `클립 추출` | `Extract clips` | `クリップを抽出` |
| 추출 · 진행 | `클립 추출 중` | `Extracting clips` | `クリップを抽出中` |
| 업로드 · 진행 | `올리는 중` | `Uploading` | `アップロード中` |
| 분석 · 진행 | `분석 중` | `Analyzing` | `分析中` |

위 표는 문구 **방식**의 예이고 제품 i18n 의 정본 문자열이 아니다.

## Accessibility

- **이 컴포넌트는 상태를 전달하지 않는다.** `<span>` 하나이고 `role` 도 `aria-live` 도 `aria-busy` 도
  갖지 않는다. 진행을 알리는 일은 **감싸는 영역이나 컨트롤**이 한다.
  - 블록 로딩 — 영역이 `role="status"` · `aria-live="polite"` 와 문맥 이름(`aria-label`)을 갖는다.
    제품이 그렇게 한다(`CreateScene.tsx` 의 프로젝트 로딩 막). **Skeleton 의 「자리표시는 장식이다」를
    그대로 적용하면 안 된다** — 글자가 **자리표시가 아니라 읽히는 텍스트**이고 `aria-hidden` 으로
    숨기면 로딩 문구가 통째로 사라진다.
  - 버튼 — 바뀐 문구가 접근 가능한 이름이 되고 `aria-disabled="true"` 가 상태를 말한다. 눌린 버튼이
    초점을 유지하므로 스크린리더가 바뀐 이름을 다시 읽을 수 있다. **그 읽기가 실제로 일어나는지는
    이 저장소에서 실측하지 않았다**(결손).
- **글자가 읽힌다.** 투명 글자라도 DOM 텍스트가 그대로 있어 스크린리더는 읽는다. 시각적으로는 흐르는
  그라디언트의 가장 옅은 구간이 20% 알파이고 그 구간에서 글자 대비는 낮다. 봉우리(88%)가 지나가며
  읽히게 하는 표현이라 **어느 한 순간에도 AA 를 요구하지 않는다** — 흐름이 멈추는 reduced-motion 과
  forced-colors 에서만 대비가 계약이다.
- **reduced-motion 에서 흐름이 없고 글자는 잉크 88% 로 읽힌다.** loop 는 짧아지는 것이 아니라
  사라진다([DS-D-0016](../governance/decisions/DS-D-0016-loop-motion.md)). 제품은 0프레임에서 멈춘
  그라디언트를 그대로 두어 글자가 얼룩진 채 남았다 — Known deviations 3.
- **강제 색상 모드에서 `CanvasText`.** 시스템이 배경 이미지를 지우는데 글자가 `transparent` 면 글자까지
  사라진다. 제품에는 이 분기가 없다.
- 타깃 크기와 포커스 표시는 감싸는 컨트롤이 소유한다.

## Specification

| 축 | 값 | 근거 |
| --- | --- | --- |
| 표시 | `inline-block` · `color: transparent` | 제품 값 그대로 |
| 클립 | `background-clip: text` + `-webkit-background-clip: text` | 사파리가 접두 속성 없이 글자 클리핑을 하지 않는다 |
| 잉크 | `fg-primary` 의 알파 변주 — 지역 변수 `--louis-loading-word-ink` | 제품의 `--gray-000`(테마마다 뒤집히는 전경색)과 같은 색. 리터럴 `rgb(var(--gray-000-rgb)/NN%)` 를 토큰으로 옮겼다 |
| 그라디언트 | 90deg · 9정지점 · 20 · 28 · **88** · 32 · 20 · 28 · **88** · 32 · 20 % (0 · 12 · 24 · 36 · 50 · 62 · 74 · 86 · 100%) | 제품 값. 36% 정지점은 작업 브랜치가 34 에서 32 로 옮겼다 |
| 배경 크기 · 시작 위치 | `200% 100%` · `0% 50%` | 제품 값 |
| 흐름 | keyframe `louis-loading-word-sweep` · `0% 50%` → `-100% 50%` · 한 칸 이동 | `louis-shimmer` 와 다른 순환이다(아래) |
| 주기 | `motion-loading-word` 2200ms · `linear` | 제품 값. 글자 쉬머 전용 loop 토큰이다 — Known deviations 1 |
| easing | `linear` | 한 칸마다 이어 붙는 순환이라 가감속이 맥박이 된다. 제품 아홉 곳이 전부 등속 |
| reduced-motion | 그라디언트 없음 · 잉크 88% 단색 · duration `motion-reduced` · 반복 1회 | 글자가 읽혀야 한다 |
| forced-colors | `CanvasText` · 그라디언트 없음 | 투명 글자가 사라지는 것을 막는다 |

**keyframe 은 `louis-shimmer` 를 쓰지 못한다.** 그쪽은 `200%` → `-200%` 로 네 칸을 밀어 면 자리표시의
하이라이트 하나를 건너보내는 한 번짜리 쓸림이다. 여기는 파형이 되풀이되는 그라디언트를 한 칸(`-100%`)
밀어 시작 모양으로 돌아오게 하는 순환이다. 같은 keyframe 을 쓰면 한 주기에 네 칸이 지나가 속도가
네 배가 된다. 같은 **기법**(`background-position`)이고 motion 토큰은 글자 쉬머 전용 `motion-loading-word`(`background-position` 한 property 의 loop 로 선언했다,
[DS-D-0017](../governance/decisions/DS-D-0017-keyframe-contract.md))를 쓰고 keyframe 도 하나 더 둔다.

**「더 불러오기」 시머와 합쳐진다.** 제품의 목록 하단 「더 불러오기」 문구는 라이트에서
`--palette-gray-900-rgb`, 다크에서 `--palette-gray-000-rgb` 로 갈아 끼우는 별도 구현이었다. `fg-primary`
가 라이트에서 어두운 잉크, 다크에서 밝은 잉크로 같은 방향이라 이 컴포넌트 하나가 둘 다 덮는다
(작업 브랜치의 `LoadingWord` 는 아직 그 자리를 옮기지 않았다).

## Implementation

- Web source: `packages/css/src/component/loading-word.css` — `.louis-loading-word`. React 표면 없음.
- Public import: 없음. 소비처가 클래스를 직접 쓴다.
- Figma component: `LoadingWord`(DS · Components 의 「4 · 피드백」 구획). `Motion=flow | reduced`, 텍스트 속성 `Label`. 표본 크기는 버튼 안(`typography/body-sm-medium`)이다.
- 제품 정본: `feat/highlight-new-screen:components/ui/LoadingWord.tsx` (17-26행 부근의 그라디언트
  리터럴과 `animate-[projectLoadingSweep_2.2s_linear_infinite]` · `motion-reduce:animate-none`).
- Tests/visual evidence: **없다.** 아래 Acceptance tests 는 선 뒤에 붙일 목록이다.

## Known deviations

1. **주기는 제품 값 2.2s 다 — 소유자 결정(2026-10-07).** 제품의 시머 글자 아홉 곳은 `2.2s linear` 이고
   [Loading](../patterns/loading.md) 이 「하나를 골라야 한다」고 남겨 둔 값이었다. 소유자가 제품 2.2s 를
   정본으로 정했다. 면 자리표시의 `motion-shimmer`(1.6s)에 얹지 않고 **글자 쉬머 전용 loop 토큰
   `motion-loading-word`(2200ms · `linear` · `background-position`)를 새로 열었다** — gate(DS-D-0017)가 요구하는
   keyframe 과 motion 토큰의 묶음은 그대로 지킨다. 같은 화면에서 Skeleton(1.6s)과 글자(2.2s)가 다른 속도로 도는 것은
   의도다.
2. **`LoadingWord` 에 제품이 갖는 `will-change: background-position` 을 옮기지 않았다.** `background-position`
   은 합성 레이어로 올라가는 property 가 아니라 힌트가 효과를 내지 못한다.
3. **reduced-motion 에서 제품과 다르다.** 제품은 애니메이션만 끄고 그라디언트를 0프레임에 세워 글자가
   20%~88% 알파로 얼룩진 채 남았다. 이 레시피는 그라디언트를 걷고 단색으로 읽히게 했다
   ([Loading](../patterns/loading.md) 이 판정을 남겨 둔 자리).
4. **`forced-colors` 분기는 제품에 없다.** 이 레시피가 더했다.
5. **잉크가 `fg-primary` 하나다.** 제품의 `--gray-000` 과 같은 색이지만 **채워진 버튼(primary · danger)
   안에서의 대비는 실측하지 않았다** — 제품은 버튼 안에서도 같은 `--gray-000` 알파 잉크를 쓴다. 채워진
   버튼 위에서 읽히지 않으면 `--louis-loading-word-ink` 를 덮는다.
6. **제품 안에서 버튼 진행 상태가 두 갈래다.** 하이라이트 보드의 두 버튼은 `aria-disabled` 로 초점을
   지키고, 확인 창의 확인 버튼은 `disabled` 를 그대로 둔 채 문구만 흘린다. 이 문서는 `aria-disabled`
   쪽을 규칙으로 적었다 — [Button](./button.md) 의 `aria-disabled` 계약이 그쪽이다.
7. **Figma 는 흐름을 표현하지 못한다(2026-10-08 세트가 섰다).** 그래서 CSS 가 실제로 그리는 두 정지 상태를
   Figma 전용 축 `Motion` 으로 열었다 — 코드에는 이 축이 없다.
   - `flow` — 흐름의 0프레임(`background-position: 0% 50%`). 200% 폭 그라디언트의 앞 절반이 글자 상자에 보이므로
     정지점 0 · 12 · 24 · 36 · 50% 가 상자의 0 · 24 · 48 · 72 · 100% 에 서고 알파는 20 · 28 · 88 · 32 · 20% 다.
     **Figma 는 변수에 묶은 정지점의 알파를 변수 값(불투명)으로 덮는다** — 정지점마다 알파를 달리 줄 수 없다.
     그래서 `color/fg-primary` 20% 단색 위에 `fg-primary`(불투명) / 투명 정지점 그라디언트(0 · 0.208 · **0.48** · 0.771 · 1)를
     85% 로 얹었다. 합성 알파 `0.2 + 0.8 × 0.85 × g` 가 다섯 점에서 20 · 28 · 88 · 32 · 20% 로 정확히 맞고, 점 사이 곡선만 CSS 의
     직선 보간과 조금 다르다(최대 알파 차 0.07 안팎). 투명 정지점은 색을 나르지 않아 바인딩 검사에서 세지 않는다(ProgressBar 와 같은 기법).
   - `reduced` — `prefers-reduced-motion` 의 모양. `color/fg-primary` 88% 단색.
   - `forced-colors`(`CanvasText`)는 시스템 색이라 변형을 두지 않는다. 주기 `motion/loading-word`(2200ms) 변수는 있지만
     캔버스에 흐름이 없어 어디에도 묶이지 않는다.
8. **문구 방어가 없다.** Inline Loading Label 처럼 꼬리 말줄임표를 떼지 않는다. 제품 i18n 에 남은
   `가입 중...` 류 문구를 이 컴포넌트에 그대로 넘기면 점이 화면에 나간다.

## Acceptance tests

선 뒤에 되재야 할 목록이다 — 지금은 하나도 돌지 않는다.

1. 글자가 `transparent` 이고 `background-clip: text` 가 선다(접두 속성 포함).
2. 그라디언트가 9정지점이고 알파가 20 · 28 · 88 · 32 로 대칭이며 **한 색의 변주**다.
3. **light · dark 두 테마 모두에서** 잉크가 배경과 다르다(`fg-primary` 가 뒤집힌다).
4. 흐름이 `louis-loading-word-sweep` 이고 `motion-loading-word` 토큰(2200ms)을 쓰며 `background-position` 만
   움직인다. easing 이 `linear` 다.
5. **시작과 끝의 모양이 같다** — `0% 50%` 와 `-100% 50%` 에서 같은 렌더(이음새가 없다).
6. reduced-motion 에서 그라디언트가 없고 글자 색이 불투명하며 반복이 1회다.
7. forced-colors 에서 글자 색이 `CanvasText` 이다.
8. 이 요소에 `role` · `aria-live` · `aria-busy` 가 없다 — 감싸는 영역이 소유한다.
9. 버튼 안에서 `aria-disabled` 가 걸려도 초점이 유지되고 activation 이 막힌다.

## Migration and changelog

새로 선 컴포넌트다. 이전 LOUIS API 가 없다. 제품의 `LoadingWord.tsx` 와 네 벌의 복제 keyframe
(`archiveLoadingSweep` · `archiveLoadingMoreShimmer` · `projectLoadingSweep` · `statusLoadingSweep`)은
이 클래스를 무는 날 함께 정리 대상이 된다. 사용자 영향 변경은 [Updates](../updates/README.md) 에 적는다.
