---
id: decision-icons-are-an-asset-axis
status: experimental
authority: normative
---

# DS-D-0038 아이콘은 에셋 축이다 — 컴포넌트 커버리지의 분모가 아니다

- Status: accepted
- Date: 2026-09-01
- Owners: repository owner (판단 위임), design system maintainer
- Affects: `decision-product-surface-denominator`, `decision-icon-size-axis`,
  `decision-icon-source`, `governance-figma-sync`

## Context

[DS-D-0037](DS-D-0037-product-surface-denominator.md)이 제품 표면의 **분모**를 세웠다 — 표면 하나 =
모듈 최상위의 PascalCase React 컴포넌트 하나, 앵커에서 400종. 그런데 분모가 서는 것과 **그 분모를
무엇으로 채우는가**는 다른 질문이고, 후자가 미결로 남아 원장의 대량이 네 개의 규칙 질문에
매달려 있었다. 그중 하나가 「아이콘 세트를 컴포넌트 축에 넣는가」다.

이 질문에는 `unclear` 표면이 하나도 걸려 있지 않다. 대신 `scoped` 를 대량으로 움직인다.

```sh
node -e "const j=require('./migration/product.surfaces.json');let i=0,n=0,c=0;
for (const [k,v] of Object.entries(j.surfaces)) { if (v.verdict!=='scoped') continue;
  if (k.includes('node-canvas-v2')) c++;
  if (/아이콘|글리프/.test(v.reason)) { i++; if (k.includes('node-canvas-v2')) n++; } }
console.log(i,n,c)"
# → 74 52 84
```

`scoped` 213 중 **74건**이 「이건 아이콘이라 다른 축이 소유한다」를 사유로 갖고, 그중 **52건**이
캔버스 도메인에 몰려 있다 — 그 도메인 `scoped` 84 의 62%다. 이 질문의 답이 뒤집히면
그 74건이 통째로 `needed` 가 된다.

**소유자가 판단을 위임했다.** 네 축 모두에 대해 「실무적으로 추천해 달라」였고, 그 위임의 결과가
이 문서를 포함한 넷이다. 출처가 실측이 아니라 **위임받은 판정**이라는 것을 남겨 둔다 — 다음
사람이 이것을 뒤집을 때 반박해야 할 대상은 측정값이 아니라 아래의 논거다.

### 왜 넷을 한 문서에 묶지 않았나

위임받은 판정은 넷이고, 문서도 넷이다([DS-D-0038](DS-D-0038-icons-are-an-asset-axis.md) ·
[DS-D-0039](DS-D-0039-pattern-boards-count-as-coverage.md) ·
[DS-D-0040](DS-D-0040-state-is-a-variant-axis.md) ·
[DS-D-0041](DS-D-0041-dialog-tone-axis.md)). 기준은 **되돌릴 때 무엇이 함께 흔들리는가** 하나다.

넷은 서로를 전제하지 않는다. 「패턴 보드를 센다」를 뒤집어도 「아이콘은 에셋이다」는 그대로 서고,
「Dialog 에 톤 축을 연다」를 뒤집어도 표면을 가르는 규칙은 움직이지 않는다. 한 문서에 묶으면
하나를 뒤집을 때 나머지 셋의 근거 문단까지 `superseded` 표시 아래로 들어가고, 그러면 여전히
유효한 판정이 폐기된 문서 안에서만 읽히게 된다. 이 저장소가 그 상태를 이미 한 번 겪었다 —
[DS-D-0035](DS-D-0035-figma-done-without-publish.md)가 [DS-D-0025](DS-D-0025-figma-as-projection.md)
의 결론이 아니라 **거기 붙어 있던 부작용 한 줄**만 뒤집으면서, 두 판단이 한 문장에 묶여 있던
탓에 어느 쪽이 살아 있는지 읽어 내는 데 문서 전체를 다시 읽어야 했다.

①②가 「무엇을 표면 대응으로 세는가」의 두 면이라는 것은 맞다. 그러나 두 면은 **분모의 구성**(①)과
**분자의 자격**(②)이라 움직이는 수가 다르다 — ①을 뒤집으면 `scoped` 74가 `needed` 로 가고
커버리지의 분모(대상 대비)가 커지며, ②를 뒤집으면 분자가 줄어든다. 같이 흔들리지 않는 둘이다.

## Decision

**아이콘은 컴포넌트 축에 넣지 않는다. 현재 구조를 유지하고, 그것을 커버리지 어휘로 못박는다.**

아이콘은 컴포넌트가 아니라 **에셋**이다. 근거 셋.

1. **축이 없다.** 컴포넌트를 컴포넌트로 만드는 것은 variant/state 축이다 — 같은 것이 조건에 따라
   다르게 그려지고, 그 갈래를 계약이 잠근다. 아이콘에는 그 축이 없다.
   [DS-D-0021](DS-D-0021-icon-size-axis.md)이 그것을 이미 판정했다 — 크기 variant조차 만들지 않고
   24 하나를 `rescale` 로 놓는다. 축이 없는 것을 축 있는 것들과 같은 분모에 넣으면 그 분모는
   더 이상 「축을 몇 개나 계약했나」를 재지 못한다.
2. **개수의 자릿수가 다르다.** 지금 파일에 컴포넌트 51 · 아이콘 31 이고, 승격 대기 중인 제품
   글리프만 200 대다. 아이콘을 분모에 넣는 순간 커버리지는 「아이콘을 몇 개 올렸나」가 되고,
   화면 층이 비어 있다는 사실은 그 수 아래로 사라진다. DS-D-0037 이 분모를 고를 때 정본 컴포넌트
   12개 안을 버린 이유가 정확히 이것이다 — **문제가 없는 축만 재게 되는 단위를 고르면 안 된다.**
3. **이미 갈라져 있다.** 이 결정은 새 구조를 만들지 않는다. `figma/readback.json` 이
   `components` 와 `icons` 를 서로 다른 사전에 담고, Figma 페이지도 `DS · Components` 와
   `DS · Icons` 로 다르며, 게이트도 `scripts/verify-figma-parity.mjs`(컴포넌트)와
   `scripts/verify-icon-gates.mjs`(아이콘·출처·고지)로 둘이다. 구조가 이미 그렇게 서 있는데
   커버리지 어휘만 그것을 모르고 있었다.

### Linear 의 선례

참고 파일 `IWohxdWtibbqKNKayhhkLN`("Linear Design System (Community)")도 같은 자리에서 같은
선택을 했다. 페이지는 하나이고 그 안을 section 20개로 나누는데, 아이콘은 **크기별로 section 이
따로다** — `Icons - 16px`(symbol 199개) · `Icons - 24px`(2) · `Icons - Other`(4). 컨트롤
프리미티브 section(Input Fields · Buttons · Toggle & Checkbox · Tooltips · Keys)과 완전히 분리돼
있다. 크기가 variant 축이 아니라 **section 이 다르다.**

수는 2026-09-01 에 그 파일을 `get_metadata` 로 읽어 얻었다. **읽기 전용 참고이며 이 저장소의
어떤 게이트도 그 파일을 재지 않는다** — 다시 확인하려면 그 파일을 직접 열어야 하고, 낡았을
가능성은 여기 적힌 다른 수들과 다르게 아무도 잡아 주지 않는다.

## 이 결정이 덮지 않는 것 — 글리프 스트로크 정리는 별건이다

**여기를 잘못 읽으면 실제 결함이 숨는다.** 「아이콘은 컴포넌트 커버리지 밖」은
「아이콘 쪽에 할 일이 없다」가 **아니다.**

지금 아이콘 축 안에 미결이 둘 있다.

- **제품 글리프의 상자와 획이 갈려 있다.** 24 와 32 두 상자에 스트로크가 2 · 2.2 · 2.25 · 2.4 로
  흩어져 있고, 이 저장소의 정본은 24 상자에 1.5 다(DS-D-0021 이 그 값을 `rescale` 규칙으로
  잠갔다). 즉 제품에서 오는 글리프를 그대로 올리면 정본 규칙을 어긴 아이콘이 세트에 섞인다.
- **`90 · ASSETS` 의 `.glyph/` 계열 중 무엇을 `icon/` 정본으로 승격하는가**가 정해지지 않았다.
  승격 판정은 [DS-D-0008](DS-D-0008-icon-source.md)의 출처·고지 요건을 통과해야 한다.

둘 다 **아이콘 축 안에서** 하는 일이고 이 결정은 그것을 닫지 않는다. 「범위 밖」이 「없어도 된다」로
읽히는 것이 DS-D-0037 이 `needed` 판정을 연 바로 그 이유였다 — 미등록을 사유에 적으면 사유로
둔갑해 범위 밖으로 세어진다. 같은 둔갑을 이 결정이 만들지 않도록, 위 둘은 **아이콘 축의 미결로
남아 있음을 여기 명시한다.**

## Alternatives

- **아이콘을 컴포넌트 축에 넣는다.** 커버리지 한 수로 전부를 재는 단순함이 이득이다. 대가는
  위 실측 그대로다 — `scoped` 74 가 `needed` 로 뒤집히고, 그중 52 가 한 도메인에 몰려 있어
  「무엇을 먼저 그리는가」 목록의 앞자리를 아이콘이 차지한다. 아이콘은 `rescale` 규칙만 지키면
  기계적으로 올라가는 일이라, 그 목록의 앞자리에 있어야 할 이유가 없다.
- **아이콘을 분모에서 아예 지운다**(원장에서 그 표면들을 삭제). 커버리지가 즉시 예뻐진다. 그래서
  `check-figma-surface-coverage` 가 `TOTAL_FLOOR` 로 그 길을 이미 막아 두었다 — 분모를 지워서
  수를 올리는 것은 이 저장소가 명시적으로 금한 동작이다. 그리고 지운 것은 재지 않는 것이다.
- **아이콘용 세 번째 커버리지 수를 만든다.** 표면 축에 아이콘 커버리지를 더 찍는 안이다.
  `verify-icon-gates` 가 이미 아이콘 축을 재고 있으므로 같은 것을 두 곳에서 세게 되고,
  두 수가 갈리는 날 어느 쪽이 참인지 판정할 자가 없다.

## Consequences

- 원장의 아이콘 계열 74건은 `scoped` 로 남는다. 사유는 이미 「다른 축이 소유한다」로 적혀 있으므로
  문구를 고칠 것이 없다.
- 커버리지 두 수(전체 대비 · 대상 대비)는 이 결정으로 움직이지 않는다.
- `verify-icon-gates` 가 아이콘 축의 유일한 게이트로 남는다. 아이콘이 컴포넌트 커버리지에
  세어지지 않는 대신, **그 게이트가 빨개지는 것이 아이콘 축의 유일한 신호**라는 뜻이다.

## Rollout and verification

이 결정은 현행 구조를 문장으로 굳히는 것이라 게이트·원장·Figma 어느 쪽도 바꾸지 않는다.
검증은 문서 축만 돈다.

- `pnpm check` — manifest ↔ 문서 정합, 생성물 최신
- `node ./scripts/verify-doc-paths.mjs` · `node ./scripts/verify-record-citations.mjs`
- `pnpm verify:ci`

**아직 하지 않은 것**(이 결정 밖의 별건이며 아이콘 축이 소유한다):
제품 글리프의 상자·획 정리, `.glyph/` 계열의 `icon/` 승격 판정.
