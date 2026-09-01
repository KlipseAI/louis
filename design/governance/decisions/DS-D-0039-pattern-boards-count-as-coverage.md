---
id: decision-pattern-boards-count-as-coverage
status: experimental
authority: normative
---

# DS-D-0039 패턴 보드도 표면 대응으로 센다 — 컴포넌트 대응과 나눠 찍는 조건으로

- Status: accepted
- Date: 2026-09-01
- Owners: repository owner (판단 위임), design system maintainer
- Affects: `decision-product-surface-denominator`, `decision-figma-done-without-publish`,
  `governance-figma-sync`

## Context

[DS-D-0037](DS-D-0037-product-surface-denominator.md)의 `figma` 판정은 「그 Figma 컴포넌트 「인」
표면」이다. 그 문장에 **컴포넌트만** 적혀 있어서, Figma 에 이미 서 있는데 컴포넌트가 아닌 것으로
서 있는 표면은 적을 자리가 없었다.

원장의 `unclear` 12건 중 셋이 그 자리에서 멈춰 있다.

```sh
node -e "const j=require('./migration/product.surfaces.json');
for (const [k,v] of Object.entries(j.surfaces))
  if (v.verdict==='unclear' && /template|템플릿|패턴 보드/.test(v.reason)) console.log(k)"
# → components/auth/AuthStatusCard.tsx#AuthStatusCard
#   components/landing/system/SectionShell.tsx#SectionShell
#   components/navigation/Gnb.tsx#Gnb          (식별자에서 제품 트리 접두는 뗐다)
```

`Gnb.tsx#Gnb` 는 앱 셸 전체다 — 5,639줄에 레일·브랜드 행·내비 행·업그레이드 CTA·상단 바·프로필
팝오버·저장 상태가 다 들어 있다. **이것을 「컴포넌트 하나」로 세울 수는 없다.** 그런데 Figma 에는
이미 있다 — `figma/readback.json` 의 `templates` 에 `app-shell` 이 상태 프레임과 `requiredParts`
목록을 갖고 서 있고, 그 부품 열은 SidebarBrand · SidebarCta · SidebarNavItem 처럼 컴포넌트로
따로 서 있다. `AuthStatusCard` 는 한 발 더 나가 있다 — `scripts/lib/product-files.mjs` 가 그 파일을
`auth-two-panel` 패턴의 **실측 정본**으로 고정한다. 디자인은 이미 Figma 에 있는데
`figma` 필드에 적을 수 있는 이름이 없어서 세 표면이 `unclear` 에 앉아 있었다.

**그리고 게이트는 이미 그것을 허용하고 있었다.** `scripts/check-figma-surface-coverage.mjs` 의
판정 어휘는 되읽기의 `components` 와 `templates` 의 **합집합**이고, 주석이 「컴포넌트 51 +
템플릿 9」라고 적는다. 규칙이 문서 어디에도 없어서 아무도 쓰지 않았을 뿐이다. 세 표면이
이미 열려 있는 문 앞에서 기다리고 있었다.

**소유자가 판단을 위임했다** — 「실무적으로 추천해 달라」. 출처가 측정이 아니라 위임받은
판정이라는 것을 남겨 둔다.

## Decision

**패턴 보드를 `figma` 판정의 정당한 대상으로 인정한다. 단, 커버리지를 컴포넌트 대응과 패턴
대응으로 나눠 찍는 것을 조건으로 한다.**

세지 않으면 `Gnb.tsx#Gnb` 같은 표면은 영원히 `needed` 로 남는다. 그런데 그 자리의 진실은
「그려야 한다」가 아니라 「이미 그려져 있는데 셈할 어휘가 없다」이고, `needed` 목록은 전자로
읽힌다. **읽는 사람을 틀리게 만드는 판정은 판정이 아니다.**

### 나눠 찍지 않으면 안 되는 이유 — 패턴 대응은 컴포넌트 대응보다 약한 증거다

셋이 다르다.

1. **닫히는 방향이 하나뿐이다.** 컴포넌트 대응은 `scripts/verify-figma-parity.mjs` 의
   `COMPONENT_CONTRACTS` 가 계약 ↔ Figma 를 양방향으로 잠그고,
   [DS-D-0035](DS-D-0035-figma-done-without-publish.md)의 (a)(b)(c) 를 통과하면 `done` 까지 간다.
   패턴은 **여덟 전부 `figma: partial`** 이다.

   ```sh
   node -e "const m=require('./design/manifest.json');
   console.log(m.patterns.map(p=>p.id+':'+p.figma).join(' '))"
   ```

   DS-D-0035 가 그 이유를 이미 적었다 — 패턴의 대조 상대인 `figma/templates.measured.json` 은
   제품을 고정 커밋에서 잰 값인데 그 앵커가 제품보다 낙후돼 있어 (c)의 「지금 코드가 그 값을
   만든다」가 서지 않는다. **패턴 대응은 지금 구조상 `done` 에 도달할 수 없는 대응이다.**
2. **부품에 key 가 없다.** 패턴 보드가 계약하는 것은 `requiredParts` — 부품 **이름의 목록**이다.
   `auth-two-panel` 은 「이 화면에 Form card 가 있다」를 말하지만 「그 Form card 가 어느
   컴포넌트인가」는 말하지 않는다. 인스턴스로 집어다 쓸 대상이 없으므로, 그 자리를 다시 그리는
   사람은 매번 새로 그린다. 컴포넌트 대응이 주는 것 — **재사용** — 이 여기에는 없다.
3. **n:1 이다.** 컴포넌트 대응은 표면 하나가 세트 하나를 가리키는 1:1 이지만, 패턴 보드 하나는
   여러 표면이 가리킬 수 있다. 그러면 대응 수는 오르는데 **그려진 것은 하나도 늘지 않는다.**

셋을 합치면 결론 하나다 — 패턴 대응은 「Figma 에 있다」를 말할 자격은 있지만
「컴포넌트로 서 있다」와 같은 무게로 세면 커버리지가 실제보다 두껍게 보인다. 그래서
**한 수로 합치지 않는다.**

### 어떻게 나눠 찍는가

`figma` 판정 안에서 **어느 사전의 이름인가**로 가른다. 게이트가 이미 두 사전을 합집합으로 만들고
있으므로, 합치기 전에 어느 쪽에서 왔는지를 기억하면 된다 — 새 판정값도, 사람이 적는 새 필드도
필요 없다.

인쇄는 이렇게 갈린다.

    Figma 표면 커버리지: 표면 N종 · 대응 M (컴포넌트 a · 패턴 b) · 전체 대비 …% · 대상 대비 …%

`mapped` 래칫(정확히 일치)은 합계에 그대로 걸고, **컴포넌트 대응 수에도 같은 래칫을 건다.**
합계만 잠그면 컴포넌트 대응을 패턴 대응으로 바꿔치기해도 수가 유지되어 후퇴가 보이지 않는다.

### 「9종」이 두 수다 — 판정 어휘는 되읽기 쪽 9다

이 결정을 쓰다가 드러난 별건의 결손을 함께 적는다.

```sh
node -e "const r=require('./figma/readback.json'), m=require('./design/manifest.json');
const t=Object.keys(r.templates), p=m.patterns.map(x=>x.id);
console.log(t.length, p.length, t.filter(x=>!p.includes(x)))"
# → 9 8 [ 'home' ]
```

되읽기의 `templates` 는 아홉인데 `design/manifest.json` 의 `patterns` 는 여덟이고, `home` 이
카탈로그에 없다. 어느 수를 쓰느냐로 「패턴 커버리지」의 분모가 달라지므로 **판정의 어휘는
되읽기 쪽 아홉**으로 못박는다 — 게이트가 실제로 읽는 사전이 그것이고, 여기서 카탈로그 쪽을
정본으로 삼으면 게이트가 통과시키는 이름을 규범이 금하는 상태가 된다.

`home` 이 카탈로그에 없는 것은 이 결정이 드러낸 결손이지 이 결정이 만든 것이 아니다.
아래 「아직 하지 않은 것」에 남긴다.

## Alternatives

- **51 컴포넌트만 센다(현행 문언).** 「대응」의 뜻이 하나로 유지되는 것이 이득이다. 대가는
  `Gnb.tsx#Gnb` 를 비롯한 화면 표면이 `needed` 에 영구히 앉는 것이고, 그것은 할 일 목록을
  **틀린 항목으로 오염시킨다.** 「무엇을 그려야 하는가」의 답에 이미 그려진 것이 섞이면 목록의
  신뢰가 통째로 깎인다.
- **패턴을 억지로 `scoped` 로 넘긴다.** 원장이 `Gnb` 사유에서 이미 반박했다 — 「정하기 전에 억지로
  scoped 로 넘기면 제품에서 가장 큰 화면 표면이 원장에서 사라진다.」 분모에서 빠지는 것이 아니라
  **재지 않는 것으로 바뀐다.**
- **앱 셸을 컴포넌트 하나로 세운다.** `figma-component-authoring` §9 가 이미 반대 방향을 정했다 —
  부품 먼저, 조립은 그다음. 그리고 부품 열 종은 실제로 이미 서 있다. 남은 것은 조립이고,
  조립을 담는 그릇이 패턴 보드다.
- **새 판정값 `pattern` 을 연다.** 판정 어휘가 다섯이 되고 래칫이 하나 늘며,
  `figma`(정확히 일치) 래칫이 둘로 갈린다. 얻는 것은 같은데 어휘 표와 게이트와 원장 머리말이
  전부 움직인다. `figma` 안에서 이름의 출처로 가르는 쪽이 작다 — **그 정보는 이미 되읽기가
  갖고 있고 사람이 새로 적을 것이 없다.**
- **합계 한 수만 찍는다.** 게이트 변경이 거의 없어 싸다. 그런데 그러면 「패턴으로 퉁쳤다」가
  정확히 숨는다 — 이 저장소가 손으로 센 원장에서 당한 실패, 그리고 DS-D-0037 이 판정 축을
  넷으로 연 이유가 같은 모양이다. **한 수는 언제나 두 가지를 섞을 자리를 만든다.**

## Consequences

- `Gnb.tsx#Gnb` 는 `app-shell` 로, `AuthStatusCard` 는 `auth-two-panel` 로 확정된다. 셋째인
  `SectionShell` 은 **이 결정으로 풀리지 않는다** — 원장이 요구한 「landing-section」 규격이
  되읽기의 `templates` 에 없기 때문이다. 규격을 세우면 `figma`, 세우지 않기로 하면 `needed` 이며
  그 판정은 여기 없다.
- 두 표면이 옮겨 가면 `mapped` 가 오르고 `unclear` 가 준다. `check-figma-surface-coverage` 의
  `MAPPED_BASELINE` 은 **오를 때도 실패**하도록 되어 있으므로(이득을 잠그라는 요구다) 같은
  변경에서 함께 올려야 한다.
- 「대상 대비」 비율이 두 방향으로 움직인다 — 분자가 오르고, `unclear` 가 줄어도 분모는 그대로다
  (`scoped` 만 분모에서 빠진다). 두 수를 함께 읽는 습관이 여기서 실제로 필요해진다.

## Rollout and verification

**이 변경에서 한 것은 결정을 문서로 세운 것뿐이다.** 아래는 이 결정이 요구하지만 아직 하지 않은
일이고, 지어내지 않고 그대로 적는다.

1. 원장 `migration/product.surfaces.json` 의 `$verdictRule`·`$howToUse` 에 「패턴 보드 이름도
   `figma` 에 적을 수 있다」를 더한다. 그 두 문자열은 게이트가 존재와 길이를 검사하는 자리이므로,
   규칙이 파일 밖에만 있으면 다음 사람은 규칙을 보지 못한다.
2. `scripts/check-figma-surface-coverage.mjs` 가 대응을 컴포넌트/패턴으로 갈라 세고 갈라 찍게
   한다. 컴포넌트 대응 수에 래칫을 함께 건다.
3. `Gnb.tsx#Gnb` · `AuthStatusCard` 를 `figma` 로 재판정하고 `MAPPED_BASELINE` 을 올린다.
4. 되읽기에 있는 `home` 이 `design/manifest.json` 의 `patterns` 에 없는 것을 해소한다 —
   카탈로그에 세우거나, 왜 패턴이 아닌지를 적는다.

검증은 그때 `pnpm check` · `node ./scripts/verify-doc-paths.mjs` ·
`node ./scripts/verify-record-citations.mjs` · `pnpm verify:ci` 로 돈다. 이 문서만 들어간 지금은
같은 넷이 문서 축에서만 돈다.

### 2026-09-01 후속 — 1·2·3 이 들어갔다. 4 는 남는다

같은 날 뒤이은 변경이 위 목록의 1·2·3 을 실행했다. **위 Context 의 `node -e` 출력은 그 이전
상태이고, 지금 다시 돌리면 세 이름 중 `SectionShell` 하나만 남는다** — 나머지 둘이 `figma` 로
내려갔기 때문이다. 출력을 고치지 않고 남기는 이유는 그것이 이 결정을 만든 실측이기 때문이다.

- 원장에 규칙이 들어갔다. `$verdictRule` 이 어휘가 components 51 **와** templates 9 둘 다임을
  적고, `$howToUse` 가 「되읽기에 없는 이름은 실패한다」를 적는다.
- 게이트가 갈라 센다. `componentVocabulary` / `patternVocabulary` 를 따로 들고
  `mappedComponent` / `mappedPattern` 을 따로 세며, 두 사전에 같은 이름이 나타나면 멈춘다
  (지금은 PascalCase ↔ kebab-case 라 겹치지 않는다). `MAPPED_COMPONENT_BASELINE = 15` 가
  합계와 **따로** 걸려, 컴포넌트 대응을 패턴 대응으로 바꿔치기해 합계를 유지하는 길을 막는다.
  카나리아 셋이 `verify-gates` 에 들어갔다(없는 패턴 이름 · 컴포넌트→패턴 바꿔치기 ·
  `$stateRule` 삭제).
- 재판정은 **셋**이다. 이 문서가 이름을 댄 둘(`Gnb#Gnb` → `app-shell` ·
  `AuthStatusCard` → `auth-two-panel`)에 더해
  `components/landing/navigation/Gnb.tsx#Gnb` → `landing-shell` 이 함께 내려갔다. 셋째는 이
  문서가 예상하지 못한 자리다 — 그 표면은 `unclear` 가 아니라 `needed`(high) 였고, 「Figma 에
  서 있는 것은 GnbMenuItem 하나뿐이라 바 자체가 없다」가 사유였다. 그 사유가 성립한 것은
  **어휘가 컴포넌트 51 뿐이던 동안**이다. `design/patterns/landing-shell.md` 의 Anatomy 여섯이
  그 파일의 구성 그대로이고, 되읽기 값도 그 문서의 Layout contract 와 축마다 일치하며
  (headerHeight 56 · compactHeaderHeight 62 · railColumnCount 3 → compact 2 · menuGap 16 ·
  menuItemCount 5 · menuLinkHeight 28 · menuLinkRadius 999 · actionsGap 8 · hamburgerSize 38 ·
  blurPlateHeight 120), `measure-product-components.mjs` 의 landing-shell 탐침 여덟이 전부
  `from: ["landingGnb", …]` 로 같은 파일을 읽는다. **이름이 닮아서가 아니라 같은 파일을 재고
  있어서 옮겼다.**
- `MAPPED_BASELINE` 은 15 → **18**, `MAPPED_COMPONENT_BASELINE` 은 **15**(움직이지 않았다).
  게이트 요약: 표면 400종 · 대응 18 = 컴포넌트 15 + 패턴 3 · 전체 대비 4.5% · 대상 대비
  9.5%(대상 189) · 범위 밖 211 · 필요 161 · 판단 대기 10 · 사유 없음 0.

**4 는 하지 않았다.** 되읽기의 `home` 이 `design/manifest.json` 의 `patterns` 에 없는 것은
그대로다. 이 변경이 그것을 건드리지 않은 이유는 판정 어휘가 **되읽기 쪽 아홉**으로 이미
못박혀 있어 게이트가 통과시키는 이름과 규범이 금하는 이름이 갈리지 않기 때문이다 —
카탈로그의 결손은 남지만 거짓 초록을 만들지는 않는다.

`SectionShell` 은 예고대로 `unclear` 에 남았다. 「landing-section」 규격이 되읽기의 `templates`
에 없고, 그 규격을 세울지는 이 결정이 답하지 않는다.
