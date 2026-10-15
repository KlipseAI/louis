---
id: decision-measure-the-work-branch-integration
status: experimental
authority: normative
---

# DS-D-0079 제품 측정 앵커는 작업 브랜치 통합 판이다

- Status: superseded by [DS-D-0117](DS-D-0117-measure-the-deployed-main.md) (2026-10-15 — 앵커는 운영에 배포된 `main` 이다. 아래는 통합 판 · fixture 2026-10-08, 저녁 갱신으로 갈래 열셋 · 결과 `54b62a8a` 의 기록이다)
- Date: 2026-10-08
- Owners: design system maintainer (소유자 결정)
- Affects: `migration/product-evidence.lock.json`, `migration/product-integration/`, 모든 `measure-product-*` 원장, Figma 화면 보드

## Context

측정 앵커는 제품 `design` 브랜치의 한 커밋(a4125565)이었다. 소유자가 「운영 환경의 디자인은 구식으로 본다 — 지금 작업 중인 모든 브랜치를
기준으로 디자인을 생각한다」고 정했다(2026-10-08). 작업은 `origin/dev`(70afc360) 위의 브랜치들에 있다. 일부는 쌓여 있어 끝 브랜치 일곱이 나머지를 품고, 일부는 `origin/dev` 에서
따로 갈라졌다(아래 「2026-10-08 저녁 갱신」). 앵커만 재면 Figma 보드와 제품 세트가 이미 바뀐 화면의 옛 모습을 굳힌다.

한 갈래씩 재면 보드끼리 판이 섞인다. 반대로 제품 저장소에 병합 커밋을 만들 수는 없다(제품 저장소는 읽기 전용이다).

## Decision

1. **앵커는 「`origin/dev` + 작업 갈래 끝 브랜치 전부」를 차례로 병합한 통합 판이다.** 끝 브랜치는 「`origin/dev` 위 커밋이 있고 다른
   갈래의 조상이 아닌 브랜치」로 전수 조사해 고른다 — 쌓인 줄기의 끝만 보면 따로 갈라진 갈래를 놓친다. 갈래 목록 · 커밋 · 충돌 해소는
   `migration/product-integration/integration.json` 이 갖는다. 해소가 파일 하나로 안 되는 충돌은 해소본(`*.resolved`)을 같은 폴더에 둔다.
2. **병합 커밋은 별도 통합 저장소에만 있다.** `migration/product-integration/build.sh` 가 제품 저장소에서 커밋만 가져와 병합한다. 이름과
   날짜를 고정해 같은 `integration.json` 이면 같은 SHA 가 나온다(2026-10-08 아침 판 `76b6cf15`, 저녁 판 `54b62a8a`, 각각 두 번 만들어 같음). 결과 커밋은 `integration.json` 의
   `result` 에 적고, lock 생성기(`build-product-evidence`)는 원격에 없는 커밋 가운데 이것 하나만 기준선으로 받는다. 그래서
   `KLIPSE_PRODUCT_REPO` 는 통합 저장소를 가리킨다. fixture 는 그 저장소의 작업 트리다.
3. **충돌은 새 판 쪽으로 푼다.** 같은 자리를 두 갈래가 고쳤으면 소유자 지적을 반영한 쪽, 더 늦은 LOUIS 핀, 걷어낸 죽은 코드의 삭제를 택한다.
   두 수정이 겹치지 않으면 둘 다 살린다(예: 문의 관리의 대화상자 포커스 가두기와 보기 상태 기억). 이유는 `integration.json` 의 `why` 에 적는다. 병합은 깨끗해도 갈래끼리 의미가 어긋나 빌드가 실패하면(한 갈래가 더한 키를 다른 갈래의 표가 모른다)
   그 보정은 `fixups/` 의 패치로 병합 뒤에 얹고 이유를 `fixups[].why` 에 적는다.
4. **디자인과 무관한 갈래는 넣지 않는다.** `/docs`(정본은 klipse-docs 저장소)와 오류 보고 지연 로드는 `excluded` 에 이유와 함께 둔다.
5. **LOUIS CSS 는 측정 때 이 저장소의 최신 판으로 덮는다**(측정기의 LOUIS CSS 덮어쓰기). 제품 갈래가 고정한 LOUIS 핀보다 DS 가 앞선다.
6. **갈래가 움직이면 `integration.json` 의 커밋을 올리고 다시 만든다.** `build.sh` 는 고정 커밋을 SHA 로 가져와 기록한 판을 그대로 만들고,
   브랜치 끝이 기록과 다르면 그 갈래와 지금 끝을 한 줄씩 알린다 — 조용히 다른 판을 재지 않는다. 예전에는 다르면 멈췄는데, 갈래가 다시 쌓이면
   (rebase) 기록한 판을 아예 다시 만들 수 없게 돼 바꿨다(2026-10-08 저녁). 올릴지는 소유자가 정한다.

## Consequences

- 원장 · 보드 · 제품 세트가 작업 중인 디자인을 따른다. 운영 판과의 차이는 결함이 아니라 예정된 차이다.
- 제품 저장소만 가진 사람은 `verify:product` 갈래를 돌릴 수 없다 — 먼저 `build.sh` 로 통합 저장소를 만든다. 갈래 브랜치가 원저자 맥에만 있고
  원격에 없으면(2026-10-08 저녁 기준 열셋 가운데 열 — 원격에서 닿는 고정은 하이라이트 · 앰버서더 링크 · 덱 셋뿐) 다른 맥은 통합 판을 재현하지 못한다. `verify:product` 는 원래 제품 저장소가 있는 맥에서만 돈다.
- 통합 판은 제품이 합의한 판이 아니다. 갈래가 합쳐지는 순서나 해소가 제품에서 달라지면 그때 다시 맞춘다.

## 2026-10-08 저녁 갱신 — 빠진 갈래 여섯

- **무엇이 빠졌나.** 아침 판은 「쌓인 끝 브랜치 일곱」만 넣었다. 끝 브랜치를 쌓인 줄기에서만 찾았기 때문에 `origin/dev` 에서 따로 갈라진
  갈래 여섯이 빠졌다 — `feat/highlight-new-screen`(106커밋, 하이라이트 대개편) · `feat/canvas-help-redesign`(126) · `feat/ambassador-page`(93) ·
  `feat/ambassador-links`(124) · `feat/deck`(29) · `fix/video-sound-lock-while-generating`(1). 소유자가 전부 넣기로 정했다.
- **순서.** 하이라이트 → 캔버스 도움말 → 앰버서더 링크 → 앰버서더 페이지 → 덱 → 소리 잠금. 가장 큰 갈래를 먼저 넣고, 겹치는 갈래는 품는
  쪽을 먼저 넣어(링크 갈래가 원격의 페이지 갈래를 품는다) 공통 충돌을 한 번에 푼다. 충돌 없는 두 갈래는 끝에 둔다. 갈래별 충돌과 해소는
  `integration.json` 의 `why` · `resolve` 가 갖는다.
- **캔버스 도움말 갈래는 다시 쌓인 갈래의 조상이다.** `chore/landing-dead-walkthrough` 가 저녁에 다시 쌓여(71b31d7c) 도움말 갈래를 품고, 그 위
  9커밋은 아침 판에 이미 든 워크스루 걷기의 다시 쌓은 판이다. 그래서 도움말 갈래의 충돌은 「아침 고정(d564ed43) 기준으로 통합 판과 새 끝을
  3방향 병합」한 판으로 풀었다.
- **의미 충돌은 보정 0002.** 첫 노드 안내 훅의 지운 인자(embedChrome), 앰버서더 페이지가 부르는 지운 판 푸터.
- **결과** `54b62a8a`(`integration.json` 의 `result`). 같은 정의로 두 번 만들어 같은 SHA. 통합 저장소에서 `pnpm install --frozen-lockfile`
  (lockfile 변화 없음) · 타입 검사 · web 빌드 통과.
- **움직였지만 올리지 않은 갈래 셋.** `feat/landing-hero-scroll`(+14) · `chore/landing-dead-walkthrough`(다시 쌓임, 아침 고정 밖 27) ·
  `feat/focus-ring-none`(다시 쌓임, 아침 고정 밖 19 — 갈래 판에서는 요소별 포커스 링이 0 이다). 이번 갱신의 범위는 빠진 갈래 추가라 고정을
  그대로 두었다. 올릴지는 소유자가 정한다.

## Rollback

`migration/product-evidence.lock.json` 을 `design` 브랜치의 커밋으로 되돌리고, `KLIPSE_PRODUCT_REPO` 를 제품 저장소로 되돌린 뒤 원장을 다시 잰다.
