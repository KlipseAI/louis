---
id: decision-figma-as-projection
status: experimental
authority: normative
---

# DS-D-0025 Figma는 참조용 projection이다 — 라이브러리를 발행하지 않는다

- Status: accepted
- Date: 2026-08-26
- Owners: repository owner
- Affects: `governance-figma-sync`, `governance-execution-playbook`, 정본 라이브러리
  `bxGEp0km5zluMJGulaTvFW`, 제품 화면 이식 보드 `OlYKERKOkgbxBEEoXGZW2c`

## Context

Figma를 두 가지로 쓸 수 있는데 문서가 어느 쪽인지 확정하지 않은 채 양쪽 규칙을 함께 적고 있었다.

- **A. 참조용 projection** — 코드가 정본이고, Figma는 "지금 시스템이 이렇게 생겼다"를 사람이 보는 곳.
- **B. 작업 도구** — 디자이너가 DS 컴포넌트를 끌어다 제품 화면을 조립하는 곳.

B는 **library publish 없이는 성립하지 않는다.** Figma에서 미발행 파일의 컴포넌트·변수·스타일은
다른 파일이 소비할 수 없다. 2026-08-26 실측으로 그 결과가 확인됐다.

| | `OlYKERKOkgbxBEEoXGZW2c` ("LOUIS") | `bxGEp0km5zluMJGulaTvFW` (정본 라이브러리) |
| --- | --- | --- |
| DS 컴포넌트 | **0개** | 26개 |
| 있는 컴포넌트 | logo·tile·icon 326 + `Product/*` 화면 조립 27세트 | — |
| 변수 | 643 = 보드 고유 299 + **Klipse\* 수동 복사본 344** | 378 |
| 구독 라이브러리 | Material 3 · Simple DS · Apple UI kit **8종** | — |

`get_libraries`의 `libraries_available_to_add`가 **빈 배열**이다 — 미발행이라 추가 목록에 뜨지도
않는다. 그래서 보드는 자기 DS를 구독하지 못하고 변수만 손으로 복사해 두었으며, 그 복사본이
정본보다 34개 뒤처져 있다(2026-08-26 세션에서 정본에만 추가된 분).

publish를 미뤄 온 근거는 타당했다 — 미발행이라 rename 99건(DS-D-0024 색 마이그레이션)을 무비용으로
할 수 있었다. 발행하는 순간 변수 이름이 계약이 되고 이후 rename·삭제가 구독 파일의 바인딩을 깬다.

## Decision

**A를 채택한다. 라이브러리를 발행하지 않는다.**

정본은 저장소다. Figma 라이브러리는 그 정본의 projection이며, `verify-figma-parity`가 양방향으로
대조하는 대상으로만 존재한다. 사람이 "지금 시스템이 이렇게 생겼는지" 보러 오는 곳이다.

따라서:

1. **`figma: done` 승격을 추구하지 않는다.** 승격 조건이 published library를 요구하므로 이 결정과
   양립하지 않는다. 상태는 의도적으로 `not-ready`에 머문다 — 미달이 아니라 **선택**이다.
   catalog·문서에서 publish를 남은 과제로 적지 않는다.
2. **「제품 screen은 published library component instance를 소비한다」 규칙은 목표에서 내린다.**
   보드의 화면 조립은 보드 고유 컴포넌트와 `1 · Palette`/`2 · Semantic`/`3 · Scale`로 계속한다.
3. **보드의 Klipse\* 복사본은 삭제하지 않고 동결한다.** 처음에는 "쓰지 않는 사본이면 지운다"로
   갈 생각이었으나 실측이 그 전제를 뒤집었다.

   2026-08-26 페이지 8개 전수 스캔(페이지당 use_figma 1회, 병렬):

   | 페이지 | 총 노드 | Klipse\* 바인딩 | 보드 고유 바인딩 |
   | --- | ---: | ---: | ---: |
   | 00 · START HERE | 498 | 0 | 0 |
   | 01 · 획득 | 9,211 | **1,144** | 5,420 |
   | 02 · 가입 | 487 | 0 | 237 |
   | 03 · 제작 | 10,709 | **237** | 8,635 |
   | 04 · 결제 | 4,598 | **264** | 2,451 |
   | 05 · 운영 | 1,193 | 0 | 686 |
   | 90 · ASSETS | 9,436 | **932** | 5,959 |
   | 99 · 보류 | 50 | 0 | 22 |

   **2,577개 노드가 Klipse\* 에 바인딩돼 있고 컬렉션 3개가 모두 쓰인다.** Primitive 는 spacing·radius
   골격으로 네 페이지에 박혀 있고, Semantic·Semantic Color 는 01·90 의 `color/bg-canvas` 등 배경
   근간에 물려 있다. 삭제하면 그 바인딩이 끊기고 raw 값으로 detach 된다.

   측정의 한계를 함께 남긴다 — 독립 재확인을 돌린 두 페이지에서 실측치가 스캔값보다 각각 12건
   많았다(paint 단위 바인딩 일부 누락). **0으로 나온 네 페이지는 재검증하지 않았으므로 진짜 0이라는
   보장이 없다.** 실제 삭제는 이 둘을 해소하고 2,601건을 보드 고유 컬렉션으로 재매핑한 뒤에만 가능하다.

   그래서 **34개를 맞추지도, 지우지도 않는다.** 코드가 정본인 A 모델에서 수동 재동기화는 무기한
   반복되는 순수 비용이고, 삭제는 지금 위험하다. 컬렉션 이름에 동결 표식을 달아 "이 값을 보고
   구현하지 말 것"만 명시한다 — 비용 0, 위험 0.

## Alternatives

- **발행한다(B).** 컴포넌트 26개를 보드에서 바로 쓸 수 있고 변수 수동 복사가 사라진다. 대가는
  이름이 계약이 되는 것 — 아키텍처가 아직 experimental인 지금은 이르다. 나중에 디자이너가
  Figma에서 화면을 조립할 필요가 실제로 생기면 이 결정을 superseded로 바꾸고 발행한다.
- **현상 유지.** A라고 말하면서 사본을 방치하는 상태. 이번에 34개가 조용히 어긋난 것이 그 비용을
  이미 보여 줬다.
