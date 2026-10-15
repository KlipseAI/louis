---
id: decision-measure-the-deployed-main
status: experimental
authority: normative
---

# DS-D-0117 제품 측정 앵커는 운영에 배포된 `main` 이다

- Status: accepted (소유자 결정, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Supersedes: [DS-D-0079](DS-D-0079-measure-the-work-branch-integration.md) Decision 1 · 2(작업 브랜치 통합 판을 앵커로 삼는 것)
- Affects: `migration/product-evidence.lock.json`, 모든 `measure-product-*` 원장, 표면 원장, Figma 화면 보드, 늘림 원장

## Context

DS-D-0079 는 2026-10-08 소유자 판단(「운영 환경의 디자인은 구식으로 본다」)에 따라 앵커를 `origin/dev` + 작업 브랜치 끝을 병합한
통합 판으로 두었다. 마지막 판은 `54b62a8a`(10-08)다.

2026-10-15 소유자가 「최신 배포 환경의 UI 및 디자인을 이 디자인 시스템이 잘 알고 있는지가 중요하다」고 했다. 비교해 보니 운영 판
`main` `97d4950e1`(10-14 18:15 배포)은 앵커에 없는 커밋이 755, 앵커에만 있는 커밋이 457 이고, UI 파일(제품 웹 앱의 `components` ·
`app` · `styles` · `messages`) 401 개가 달랐다(+23,100 / −17,864 줄). 제품이 무는 LOUIS 판도 `bab5efdf` →
`ac5beeb6` 로 바뀌었다. 디자인 시스템이 아는 화면은 운영 화면이 아니라 일주일 전 통합 판이었다.

배포 경로: `.github/workflows/deploy.yml` — 운영(prd)은 `main` push 로 자동, 개발(dev)은 `dev` 수동 실행.

## Decision

1. **앵커는 운영에 배포된 `main` 의 커밋이다.** 지금은 `97d4950e1`(2026-10-14 18:15 배포, 「Deploy prd ← main」 성공).
   lock(`migration/product-evidence.lock.json`)의 `productCommit` 이 그 커밋을 가리킨다.
2. **앵커는 운영 배포를 따라간다.** `main` 에 새 운영 배포가 생기면 다음 작업 단위에서 앵커를 옮긴다(측정 → 생성 → Figma 반영 →
   늘림 → 판정, `scripts/regen-figma-at-anchor.sh` 순서). 옮기기 전에는 `verify-product-evidence` 가 앵커 이후 바뀐 UI 파일을 센다.
3. **작업 브랜치는 측정 기준이 아니다.** 작업 중인 제품 변경을 LOUIS 부품으로 먼저 올리는 일(DS-D-0084)은 계속하되, 화면 보드 ·
   표면 원장 · 늘림은 배포된 화면만 잰다. 그래서 보드는 「지금 사용자가 보는 화면」이다.
4. **제품 저장소 체크아웃은 읽기 전용 worktree 다.** `KLIPSE_PRODUCT_REPO` 는 운영 커밋의 체크아웃(`/Users/sejunki/kds-prod`)을,
   fixture 는 같은 커밋의 worktree(`kw-fixture-prod` · `kw-fixture-prod-2`)를 가리킨다. 제품 저장소의 브랜치에는 손대지 않는다.

## Alternatives

| 안 | 버린 이유 |
| --- | --- |
| `dev` 최신 | 아직 배포되지 않은 변경이 섞인다 — 「배포 환경」 요구와 어긋난다 |
| 통합 판 유지(DS-D-0079) | 운영과 UI 파일 401 개가 다르다. 보드가 사용자가 보는 화면이 아니다 |
| 통합 판을 `main` 위로 다시 만들기 | 작업 브랜치가 배포 전 변경을 다시 섞는다. 같은 이유로 버린다 |

## Consequences

- 측정 원장 전부(인증 · 세션 · 공개 · 상태 레시피 · 로캘 · 컴포넌트 · 표류), 표면 원장, 보드 계획, 늘림 원장을 운영 판으로 다시 만든다.
  이미 닫은 화면 대응 22 와 부품 대응은 다시 판정한다 — 운영 판에서 사라졌거나 바뀐 표면은 needed 로 돌아갈 수 있다.
- `migration/product-integration/` 의 통합 판 빌드는 쓰지 않는다. 기록으로 남긴다.
- 앰배서더 · 덱 화면은 운영 판에 레이아웃이 있으면 잴 수 있다.

## Rollback

lock 을 `54b62a8a` 로 되돌리고 DS-D-0079 의 통합 판 절차로 돌아간다. 다시 잰 원장은 git 이력에 남는다.
