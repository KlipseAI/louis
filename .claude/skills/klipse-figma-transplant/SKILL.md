---
name: klipse-figma-transplant
description: Klipse 제품 화면을 Figma 보드로 옮기거나 고칠 때 쓴다. 어떤 정본을 읽어야 하는지, Figma Plugin API 로 어떻게 조립해야 하는지, 끝나고 무엇을 기계로 세야 하는지를 정한다. Figma 변수·아이콘·화면 조립·검증이 얽힌 작업이면 먼저 이 스킬을 읽는다.
---

# Klipse Figma 이식

제품 화면을 Figma 보드로 옮기는 일이다. **그림을 잘 그리는 일이 아니라, 제품과 어긋나지 않게
옮기고 그것을 증명하는 일이다.** 값이 맞아도 조립이 틀리면 화면은 틀린다.

## 0-. 다른 계정·다른 컴퓨터에서 시작한다면

이 스킬은 저장소 안에 있으므로 `git clone git@github.com:KlipseAI/louis.git` 하면 따라온다.
따라오지 **않는** 것이 넷이다. 넷 다 없으면 이 스킬대로 못 한다.

| 필요한 것 | 없으면 | 갖추는 법 |
| --- | --- | --- |
| 제품 저장소 `klipse-web` | 제품을 읽을 수 없다 = 값을 지어내게 된다 | clone 한 뒤 `export KLIPSE_PRODUCT_REPO=<경로>`. **`design` 브랜치를 fetch 했는지 확인한다** — 기본 브랜치는 `dev` 다 |
| Figma 파일 접근 권한 | 조립도 검증도 못 한다 | **파일이 셋이고 역할이 다르다.** **LOUIS(현행 작업 파일)** `OlYKERKOkgbxBEEoXGZW2c`(이 스킬의 대상, 쓰기 — 소유자가 「LOUIS 피그마」라 부르는 파일이 이것이다) · 선행 라이브러리 `bxGEp0km5zluMJGulaTvFW`(DS 컴포넌트 26개와 변수 378개가 남아 있고 `verify-figma-parity` 가 아직 이 파일을 가리킨다 — **은퇴 진행 중**) · 제품 미러 `CNORJOONt4z0a4Bl22Kjuu`(**읽기 전용**). 두 파일은 collection 이름 체계가 달라 섞으면 안 된다 — `design/governance/figma-sync.md` 「운영 파일」·「게이트가 은퇴 파일을 가리킨다」 참조 |
| `klipse-docs` 저장소 | `/docs` 화면을 `klipse-web` 기준으로 그리게 된다(틀린다) | `/docs` 를 건드릴 때만 필요하다 |
| Node 22 + pnpm 10 | 게이트를 못 돌린다 | `corepack enable` → `pnpm install --frozen-lockfile` → `pnpm exec playwright install --with-deps chromium`. **브라우저 바이너리는 lockfile 에 없다** — 빠뜨리면 `verify-test-harness` 가 죽는다(`.github/workflows/ci.yml:34-39`) |

**경로를 절대경로로 박지 마라.** 이 저장소의 스크립트는 제품 저장소를
`process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web"` 로 찾는다. 그 기본값은
원저자의 맥에만 있다. 환경변수를 세우지 않으면 **`pnpm verify` 가 `verify:product` 첫 게이트에서
exit 1 로 죽는다**(`fatal: cannot change to …`). 제품을 읽는 게이트 14개 중 6개가 그렇게 죽고,
8개는 `SKIPPED` 를 찍고 exit 0 하지만 앞의 6개가 먼저 죽어 거기까지 가지 않는다.

```bash
export KLIPSE_PRODUCT_REPO=~/klipse-web
pnpm verify            # 27단계 전량. 위 환경변수가 없으면 첫 게이트에서 exit 1 로 죽는다
pnpm verify:ci         # 13단계. 제품 저장소 없이 도는 것만 (hosted CI 가 이걸 돈다)
pnpm clean-room        # 러너 재현: 커밋된 HEAD 만 clone + 새 설치
```

**`pnpm verify` 가 exit 1 이면 제품 저장소부터 의심하라.** 그리고 `pnpm verify:ci` 가 초록인 것은
게이트 13개가 통과했다는 뜻이지 전량 통과가 아니다. 배분과 근거는
`scripts/verify-gate-split.mjs` 헤더에 있다.

## 0. 시작 전에 반드시 읽는다

순서대로 읽는다. 건너뛰면 같은 실수를 반복한다.

1. `design/governance/figma-screen-assembly.md` — **조립 규칙 23조.** Plugin API 의 함정과 조립 원칙.
2. `design/foundations/product-reading-traps.md` — 제품을 읽을 때 속는 7가지.
3. 그리려는 화면의 **제품 컴포넌트**. 문서만 보고 그리지 않는다.

## 1. 정본이 어디인가

| 대상 | 정본 | 주의 |
| --- | --- | --- |
| 제품 값·구조 | `klipse-web` 의 **`design` 브랜치** | `origin/main` 은 구식(폐지된 글래스 섀도우가 남아 있다). 저장소 기본 브랜치는 `dev` 다 |
| `/docs` 화면 | 별도 저장소 `klipse-docs` | `klipse-web` 기준으로 그리면 안 된다 |
| 디자인 시스템 규범 | 이 저장소 `design/**` | 제품과 다를 수 있다 — 다르면 그것이 의도인지 확인한다 |

**제품은 반드시 `git show design:<경로>` 로 읽는다.** 워킹 트리(`cat`/`Read`)는 금지다 — 체크아웃
상태가 무엇이든 정본은 `design` 이다.

```bash
cd ~/klipse-web
git show design:apps/web/components/navigation/Gnb.tsx | sed -n '480,540p'
git grep -n "패턴" design -- 'apps/web/**'
git ls-tree -r --name-only design | grep '^apps/web/public/icons/'
```

절대 write/edit/commit 하지 않는다. 읽기 전용이다.

## 2. 제품을 읽을 때 반드시 아는 값

- Tailwind 간격 격자는 **`--spacing: 2px`** 다 → `p-4`=8px, `h-14`=28px, `gap-14`=28px, `w-19`=38px.
  **곡률(`rounded-12`)은 px 그대로**라 환산하지 않는다.
- 루트 폰트 크기는 **12px** 라 `1rem` = 12px.
- 타입 램프: `caption-12` · `body-14` · `body-16` · `body-20` (150% / -0.01em) ·
  `heading-28` · `heading-36` · `heading-48` (135% / -0.02em). 굵기 400/500/600.
- 아이콘 화면 획 = **표시 크기 / 16** (14px 만 0.88). 단 **단색 선 아이콘에만** 적용한다 —
  다색 브랜드 타일·로고는 원본 비율대로 줄이고 획도 함께 줄어든다(조립 규칙 §16).
- 색은 **바탕색 토큰 + 사용처 알파**로 쓴다(`rgb(var(--gray-000-rgb) / 12%)`). 알파 단계마다 토큰이
  따로 있지 않다.
- 사양서의 `literal:#00c68e` 같은 괄호는 **그 토큰이 지금 푸는 값**일 뿐이다. 제품 코드에 `var(--x)` 가
  보이면 리터럴이 아니라 변수에 묶는다(조립 규칙 §17).
- 랜딩은 램프가 구간마다 뒤집힌다: 본문 `landing-light`(`--gray-000` = 검정) · 푸터 `dark` ·
  `/pricing` 본문은 항등 매핑(= `dark`)인데 `#pricing-faq` 만 다시 반전. 프레임 하나에 모드 하나가
  아니라 **섹션마다 `setExplicitVariableModeForCollection`** 을 건다.
- 아이콘 색은 SVG 파일의 색이 아니다 — `mask` + `currentColor`, `filter`, 에셋 교체 중 하나가 정한다.

## 3. Figma 파일 구조

### 페이지 — 자산과 화면은 절대 같은 페이지에 두지 않는다

`00 START HERE`(규약·라우트 색인) · `01 획득` · `02 가입` · `03 제작` · `04 결제` · `05 운영`
(여기까지 사용자 여정 순 화면) · `90 ASSETS`(컴포넌트 전수) · `99 보류`(정본이 다른 저장소인 것).

화면 배치 상수 — 이 숫자를 바꾸지 않는다(조립 규칙 §20):

```
COL_PITCH 2800 · COLS 4 · MOB_DX 2000 · ROW_GUT 600 · SEC_W 11200 · SEC_GAP_Y 800
x_desktop(i) = 160 + (i mod 4) × 2800      # 허용 x 는 이 8개뿐
x_mobile(i)  = x_desktop(i) + 2000
rowTop(r+1)  = rowTop(r) + ceil100( 그 행 높이 최댓값 ) + 600
```

Section 자식의 x/y 는 **섹션 상대 좌표**다. 프레임 이름은
`<viewport> <W>×<H> — <route> (<상태 판정>)` 이고, 이름이 곧 색인이다(§23).


파일 키는 `design/governance/figma-sync.md` 의 "운영 파일" 절에 있다. 라이브러리 파일에만 쓴다.
제품 미러 파일은 **읽기 전용**이다.

변수는 역할 기준 3계층이다.

| 컬렉션 | 모드 | 담는 것 |
| --- | --- | --- |
| `1 · Palette` | `default` / `sidebar` | 원료 램프. 화면에 직접 쓰지 않는다. `hiddenFromPublishing` |
| `2 · Semantic` | `dark` / `light` / `light-sidebar` / `landing-light` | 역할 이름. Palette 를 별칭으로 가리킨다. **화면에 묶는 건 이쪽** |
| `3 · Scale` | `Base` | 치수·타이포 눈금 |

모드를 늘리기 전에 **열끼리 값을 비교한다.** 값이 같은 열은 모드가 아니다.

## 4. 조립 절차

### 4.1 화면 하나를 그릴 때

1. 그 화면을 렌더하는 **컴포넌트를 먼저 읽는다.** 셸이 무엇인지(앱 셸 / 랜딩 셸 / 인증 2열 /
   상태 결과 / 라우트 경계) 먼저 판정한다.
2. **상태를 하나 고른다.** 빈 상태와 목록 상태처럼 공존할 수 없는 조합을 섞지 않는다.
3. **오토레이아웃으로 조립한다.** 절대배치는 제품이 실제로 `position:absolute/fixed` 인 자리에만.
   항목마다 간격이 다르면 스택을 **중첩**한다.
4. 아이콘은 **라이브러리 컴포넌트의 인스턴스**로 넣는다. 손으로 그리지 않는다.
5. 문구는 `messages/ko.ts` 에서 찾은 **실제 문자열**을 쓴다. 지어내지 않는다.
6. 세로로 긴 화면은 **높이를 hug** 로 둔다(폭만 고정).
7. GNB·블러 판처럼 `position: fixed` 인 레이어는 **프레임의 마지막 자식**으로 넣는다. 절대배치는
   위치만 빼고 칠 순서를 바꾸지 않아, 먼저 넣으면 본문이 그 위를 덮는다.
8. 나란한 카드의 높이를 맞출 때 **양쪽 다 세로 FILL 로 두지 않는다** — 높은 쪽 HUG · 낮은 쪽 FILL.

### 4.2 색을 묶을 때 (가장 자주 사고가 나는 곳)

**`setBoundVariableForPaint` 에 노드에서 읽어온 페인트를 넘기면 불투명도가 1로 초기화된다.**
반드시 새 리터럴을 만들고, `color` 에는 그 변수가 그 모드에서 푸는 **실제 값**을, `opacity` ·
`visible` · `blendMode` 를 모두 명시한다.

```js
// 어느 스크립트에서든 쓰는 해석기 — 별칭을 따라가 실제 색을 얻는다
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const cById = new Map(cols.map((c) => [c.id, c]));
const Pal = cols.find((c) => c.name === "1 · Palette");
const Sem = cols.find((c) => c.name === "2 · Semantic");
const all = await figma.variables.getLocalVariablesAsync();
const byId = new Map(all.map((v) => [v.id, v]));
const V = (n) => all.find((v) => v.name === n);

const resolve = (v, mode) => {
  const c = cById.get(v.variableCollectionId);
  const mn = c.id === Pal.id ? (mode === "light-sidebar" ? "sidebar" : "default") : mode;
  const m = c.modes.find((x) => x.name === mn) || c.modes[0];
  let val = v.valuesByMode[m.modeId], hop = 0;
  while (val && val.type === "VARIABLE_ALIAS" && hop++ < 5) {
    const t = byId.get(val.id); if (!t) return null;
    const tc = cById.get(t.variableCollectionId);
    const tmn = tc.id === Pal.id ? (mode === "light-sidebar" ? "sidebar" : "default") : mode;
    const tm = tc.modes.find((x) => x.name === tmn) || tc.modes[0];
    val = t.valuesByMode[tm.modeId];
  }
  return val && typeof val === "object" && "r" in val ? val : null;
};

const paint = (v, mode) => {
  const c = resolve(v, mode) || { r: 0, g: 0, b: 0, a: 1 };
  return figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: c.r, g: c.g, b: c.b }, opacity: 1, visible: true, blendMode: "NORMAL" },
    "color", v,
  );
};

// 알파는 페인트가 아니라 변수에 담는다 — 제품 표기 `rgb(var(--X-rgb) / N%)` 와 1:1
const tint = (baseName, pct) => {
  const nm = `${baseName} · a${pct}`;
  const hit = V(nm); if (hit) return hit;
  const base = V(baseName);
  const nv = figma.variables.createVariable(nm, Sem, "COLOR");
  nv.description = `제품 표기 \`rgb(var(--${baseName.replace("/", "-")}-rgb) / ${pct}%)\`.`;
  nv.scopes = ["ALL_FILLS", "STROKE_COLOR", "EFFECT_COLOR"];
  for (const m of Sem.modes) {
    const c = resolve(base, m.name) || { r: 1, g: 1, b: 1, a: 1 };
    nv.setValueForMode(m.modeId, { r: c.r, g: c.g, b: c.b, a: pct / 100 });
  }
  all.push(nv); return nv;
};
```

### 4.3 아이콘

제품 아이콘은 세 곳에 흩어져 있다 — 셋 다 가져와야 전수다.

| 출처 | 방법 |
| --- | --- |
| `public/icons/*.svg` | `git show` 로 뽑아 `upload_assets` 로 올린다 · 이름 `icon/` |
| `public/*.svg` (루트) | 브랜드·프로바이더 자산 포함 · 이름 `root/` · 다색 타일은 `tile/` · 브랜드는 `logo/` |
| 컴포넌트 안의 인라인 `<svg>` | `.tsx` 에서 추출해야 한다 (파일이 없다) · 이름 `.glyph/` — `.` 접두라 게시되지 않는다. 출처를 못 찾았으면 `.authored/` 로 격리하고 「이걸로 값을 재지 말 것」을 설명에 적는다 |

인라인 추출 시 **JSX 표현식을 지우면 `d=` · `cx=` 처럼 값이 빈 속성이 남는다.** 그대로 올리면
업로드가 실패하고 **URL 은 실패해도 소비된다.** 올리기 전에 정리한다.

```bash
# 값 없는 속성 제거 + 필수 속성을 잃은 요소 제거
python3 - <<'PY'
import re,glob
for p in glob.glob("out/*.svg"):
    s=open(p).read()
    t=re.sub(r'\b[a-zA-Z-]+=\s*(?=[\s/>])','',s)
    t=re.sub(r'<path(?![^>]*\bd=)[^>]*/>','',t)
    t=re.sub(r'<circle(?![^>]*\bcx=)[^>]*/>','',t)
    open(p,"w").write(t)
PY
```

업로드는 `upload_assets` 로 URL 을 받아 `curl -F "file=@x.svg;type=image/svg+xml"` 로 POST 한다.
병렬로 보내되 20개마다 `wait` 한다.

올린 뒤: 컨테이너 면을 비우고, 단색(`currentColor`)이면 `gray/000` 에 묶고, 다색 브랜드 자산이면
원본 색을 지키고, 획을 **표시 크기/16** 으로 맞추고, `createComponentFromNode` 로 컴포넌트화한다.

**마스터에 잉크가 없으면 안 된다.** 추출된 SVG 는 `fill`/`stroke` 가 비어 있는 경우가 있는데, 그러면
라이브러리에서 빈칸으로 보이고 **색을 덮지 않은 인스턴스가 화면에서 통째로 사라진다.** 이 보드에서
마스터 42개가 비어 있었고 그 탓에 아이콘 90개가 렌더되지 않았다(조립 규칙 §21).

**이름이 같다고 같은 자산이 아니다.** 일괄 추출은 소스 파일 이름으로 명명하므로 한 파일에서 나온
글리프 여러 개가 같은 이름을 갖는다. 합치기 전에 **모양 서명(자식 타입 · 크기 · path 길이)** 으로
묶고, 서명이 다르면 대조표를 렌더해 눈으로 확인한 뒤 각각 제 이름을 준다(§22).

### 4.4 프로그레시브 블러

`backdrop-filter` + `mask-image` 조합은 그라디언트 면으로 흉내 내지 않는다. Figma 의 점진적 배경
블러를 쓴다 — 조립 규칙 §12 에 코드가 있다.

## 5. 끝나면 반드시 센다

눈으로 대신하지 않는다. 아래를 스크립트로 세고 0 이 아니면 끝난 게 아니다.

| 항목 | 통과 |
| --- | --- |
| 안 보이는 글자 (대비 < 2:1) | 0 |
| 끊긴 변수 바인딩 | 0 |
| 아이콘 획 규칙 위반 | 0 |
| 아이콘 슬롯의 비-인스턴스 자식 | 0 |
| 칠해지지 않은 아이콘 인스턴스 (화면에서 안 보임) | 0 |
| 컴포넌트 이름 중복 | 0 |
| 페이지 안 노드 겹침 · 섹션 밖 프레임 · 허용 x 밖 프레임 | 0 |
| 저장색과 변수 값 불일치 | 0 |
| 안 묶인 색 | 제품이 리터럴로 쓰는 자리만 |
| 오토레이아웃 컨테이너의 가로 넘침 | 0 |

**대비를 셀 때는 바인딩된 페인트의 저장색이 아니라 변수가 그 모드에서 푸는 값을 쓴다.**
저장색을 읽으면 오탐과 누락이 함께 생긴다. 그리고 검증기 자체가 틀리기 쉽다 — 실제로 났던 오탐 셋:

- `SPACE_BETWEEN` 컨테이너에 `itemSpacing` 을 더해 가로 넘침 536건 오탐.
- 변수에 묶인 페인트의 알파를 **두 번** 곱해(변수 알파 × `paint.opacity`) 글자를 실제보다 어둡게 계산.
  Figma 가 둘을 동기화하므로 하나만 쓴다.
- 그라디언트 면을 배경으로 합성하지 않아 그라디언트 버튼 위 흰 라벨이 「대비 1.0」으로 잡힘.

조상의 `explicitVariableModes` 를 따라 내려가며 **유효 모드를 갱신**하지 않으면 램프가 뒤집히는
구간이 전부 틀리게 계산된다.

검증 스크립트 원형은 조립 규칙 §11 과 이 저장소의 `scripts/verify-figma-*.mjs` 에 있다.
문서를 고쳤으면 `pnpm run build-llms-docs` 로 생성물을 갱신하고 `pnpm verify` 로 게이트를 돌린다.

## 6. 새로 안 것은 규칙으로 남긴다

지적받아 고친 것으로 끝내지 않는다. 같은 종류가 반복되지 않도록:

1. `design/governance/figma-screen-assembly.md` 에 조항을 추가한다.
2. `design/manifest.json` 의 `documents` 와 `llms-guidelines.sources` 에 등록한다.
3. `pnpm run build-llms-docs` → `pnpm verify`.

이 절차를 건너뛰면 다음 사람(또는 다음 세션의 자신)이 같은 함정에 빠진다. 실제로 알파 뭉개짐 ·
이름 매칭 오탐 · 손으로 그린 아이콘 · 숨은 배경면 살아남이 전부 그렇게 재발했다.
