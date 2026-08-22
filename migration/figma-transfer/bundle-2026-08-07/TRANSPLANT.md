# 디자인 시스템 이식 절차 (구 레포 → AWS 전환 레포)

이 폴더는 구 레포(`~/klipse`)에서 진행한 디자인 시스템 작업의 이식 번들이다.
**레포 밖에 있으므로 이사 과정에서 유실되지 않는다.**

만든 시점의 구 레포 상태: `DESIGN_SYSTEM.md` 2872줄 · `design/llms/foundations.txt` 1091줄 ·
게이트 4개 전부 통과.

---

## 0. 가장 중요한 원칙 — 생성물은 옮기지 않는다

`design/tokens.yaml` 과 `design/llms/*.txt` **6개 파일은 이식 대상이 아니다.**
구 레포의 `globals.css` 에서 나온 산출물이라, 복사해서 옮기면 새 레포 CSS 와 맞지 않아
게이트가 즉시 실패한다.

생성기만 옮기고 **새 레포에서 다시 만든다.** 그것이 이 시스템의 설계 의도다 —
원천은 `globals.css` 이고 나머지는 전부 파생물이다.

`reference-generated-artifacts.tgz` 는 이식용이 아니라 **대조용**이다.
이식 후 재생성한 결과와 비교해 "무엇이 달라졌는지" 를 볼 때만 푼다.

---

## 1. 신규 파일 복사 (충돌 없음)

```bash
cd <새-레포-루트>
tar xzf ~/klipse-design-transplant/design-system-new-files.tgz
```

들어가는 것:

| 파일 | 역할 |
| --- | --- |
| `apps/web/scripts/lib/design-tokens.mjs` | **파서 본체.** 이게 없으면 나머지 스크립트가 전부 죽는다 |
| `apps/web/scripts/build-design-tokens.mjs` | `globals.css` → `design/tokens.yaml` |
| `apps/web/scripts/build-llms-docs.mjs` | → `design/llms/*.txt` |
| `apps/web/scripts/check-doc-identifiers.mjs` | 문서가 인용한 식별자가 코드에 실재하는지 검사 |
| `apps/web/scripts/doc-identifiers-baseline.json` | 위 검사의 **의도된 예외 3건**. 새 레포에서 안 맞으면 `--update-baseline` 로 다시 잡는다 |
| `design/figma/components.json` | Figma 보드 스냅샷. 유일하게 코드에서 파생되지 않는 입력 |

외부 npm 의존성 0. `node:fs` · `node:path` 만 쓴다. 경로는 전부 `process.cwd()` 상대.

---

## 2. 배선 병합

```bash
git apply --3way ~/klipse-design-transplant/design-system-wiring-and-source.patch
```

이 패치에 든 것:

| 파일 | 내용 | 충돌 가능성 |
| --- | --- | --- |
| `package.json` · `apps/web/package.json` | 스크립트 6개 (`build/check-design-tokens` · `build/check-llms-docs` · `check-design-system` · `check-doc-identifiers`) | 낮음 (추가만) |
| `turbo.json` | 위 태스크 정의 | 낮음 |
| `.github/workflows/ci.yml` | 게이트 4스텝 | **CI 를 CodeBuild 등으로 바꿨다면 수동 재작성.** 명령은 그대로다 |
| `apps/web/scripts/check-design-system.mjs` | 기존 파일 대폭 수정 | **중간** — 새 레포에도 이 파일이 있다 |
| `apps/web/app/globals.css` | 역할 토큰 18개 (`--surface-*` 9 × 라이트/다크) | **먼저 확인**: 새 레포에 이미 있으면 건너뛴다 |

### CI 를 옮길 때

명령은 그대로 쓰면 된다.

```bash
pnpm check-design-tokens
pnpm check-llms-docs
pnpm check-design-system
pnpm check-doc-identifiers
```

**이 4개를 CI 에 안 걸면 파이프라인은 살아 있지만 드리프트를 아무도 잡지 않는다.**
이번에 고친 문제들(문서가 존재하지 않는 토큰을 쓰라고 지시하던 상태 등)이 그대로 재발한다.

---

## 3. 문서 병합

```bash
git apply --3way ~/klipse-design-transplant/design-system-doc.patch
```

`DESIGN_SYSTEM.md` +2655줄. 충돌이 나면 아래를 기준으로 판단한다.

### 손으로 병합할 필요가 없는 부분

전체 2872줄 중 **505줄은 `<!-- GENERATED:<id> -->` 마커 사이**다.
이 구간은 `pnpm check-design-system --write` 가 새 레포의 `globals.css` 기준으로 다시 만든다.
**충돌이 나면 그냥 아무 쪽이나 두고 넘어간 뒤 재생성하면 된다.**

### 통째로 붙이면 되는 새 절

기존 문서에 없던 절이라 충돌하지 않는다.

- `§6.9 Node Anatomy` — 노드 부품·쌓임 순서·동심원 곡률·세로 리듬·사이드 핸들·줌 역보정
- `§6.10 공용 Button` · `§6.11 모달 셸` · `§6.12 툴팁·피드백(노드)`
- `§6.13 앱 페이지 셸` · `§6.14 상태·결과 템플릿` · `§6.15 Auth 폼 컨트롤` · `§6.16 페이지 레벨 피드백`
- `§7.5 미결정` — 결정 대기 **69건**, 각각 관측 분포와 추천안 포함

### 기존 절 수정 — 충돌하면 여기만 본다

| 절 | 무엇을 고쳤나 |
| --- | --- |
| `§1 적용 범위` | `app/(highlight-standalone)/` (hl-*) 를 **범위 밖**으로 명시 (2026-08 결정) |
| `§4.4 기본 배경` | `app: --background = --gray-900 (현재 고정)` 이 **틀렸다.** 앱 화면은 `--app-page-bg` 를 쓰고, `--background` 는 법적고지·에러·404 전용이며, "고정" 이 아니다 |
| `§6.5 Dropdown` | 값 6개가 실제 소비자와 전부 달랐다 (패딩 8→4 · 행 8/12→6/10 · 곡률 8→동심 12 · body-16→14 · 모션 260ms 단일→열림 200/260·닫힘 130 비대칭 · scale 0.94→0.92) |
| `§6.7 곡률 규약` | "하단 툴바 알약 999px" 오지시 → 실제 `Toolbar.tsx` 는 `rounded-16` |

---

## 4. 재생성 + 검증

```bash
cd apps/web
node ./scripts/build-design-tokens.mjs
node ./scripts/build-llms-docs.mjs
node ./scripts/check-design-system.mjs --write

cd <새-레포-루트>
pnpm check-design-tokens && pnpm check-llms-docs \
  && pnpm check-design-system && pnpm check-doc-identifiers
```

네 개가 전부 초록이면 이식 완료다.

### `check-doc-identifiers` 가 실패하면

이게 **가장 유용한 신호**다. 새 레포의 `globals.css` 가 구 레포와 갈렸다면,
문서 산문이 인용한 식별자 중 실재하지 않는 것을 이 게이트가 정확히 짚어준다.
실패 목록이 곧 "새 레포 기준으로 고쳐야 할 문장" 목록이다.

의도된 예외라면 `node ./scripts/check-doc-identifiers.mjs --update-baseline`.
**단, 실제로 문서가 틀린 경우에는 베이스라인을 늘리지 말고 문장을 고칠 것.**

---

## 5. 이식 후 남는 일

문서는 동기화되지만 **완성되지는 않았다.** 이식 시점 기준 상태:

- 53개 라우트를 문서만으로 구현 가능한지 측정했을 때 **불가 61%** 였고,
  그 뒤 `§6.13–6.16` 이 28개 라우트를 겨냥해 들어갔다. **재측정이 필요하다.**
- `§7.5` 에 결정 대기 **69건**. Figma 작업을 본격화하기 전에 최소한 아래 4건은 정해야 한다.
  결정 안 된 항목은 Figma 가 임의로 하나를 골라 굳히고, 그러면 권위가 둘이 된다.

| 결정 | 왜 먼저 |
| --- | --- |
| 역할 토큰 층 A/B (착지 vs 미구현 표시) | 9개 라우트 차단 + `components.txt` 오염의 원인 |
| 앱 셸 형태 A/B (`appMainCardChrome` vs `…Surface`) | 한쪽만 그리면 나머지 절반이 시스템 밖 |
| 토스트 글래스/솔리드 | 6:2 로 갈려 있음 |
| 포커스 링 | **코드 결정.** `globals.css` 의 레이어 밖 outline 리셋을 두면 어떤 토큰도 `!` 없이 안 먹힌다 |

### Figma 와의 관계

- **토큰 층** — 코드가 원천. Figma Variables 는 `design/tokens.yaml` 을 **import 만** 하고 새로 저작하지 않는다.
- **컴포넌트 층** — `design/llms/components.txt` 만 유일하게 Figma → 문서 방향이다.
  그래서 코드에만 있는 것은 안 보이고 Figma 에만 있는 것이 권위를 갖는다.
  대량 Figma 작업 전에 코드 레지스트리를 만들어 양방향 대조를 붙이는 것이 좋다.
