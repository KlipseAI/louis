# @klipse-design/react

접근 가능한 headless behavior와 styled React 컴포넌트를 제공한다. 각 컴포넌트는 pointer,
keyboard, focus, disabled/loading, high contrast, reduced motion 계약을 실브라우저 테스트로
충족한 뒤 manifest에서 `partial` 또는 `done`으로 승격한다.

## 설치

**npm 레지스트리에 있지 않다.** sha로 고정한 git 설치가 정본 경로다
([DS-D-0036](../../design/governance/decisions/DS-D-0036-git-install-distribution.md)).

```json
"@klipse-design/css": "github:KlipseAI/louis#<sha>&path:/packages/css",
"@klipse-design/react": "github:KlipseAI/louis#<sha>&path:/packages/react"
```

**두 줄의 `<sha>`는 같아야 한다.** git 설치는 semver 범위를 보지 않으므로 css와 react의 호환은
sha 하나로만 표현된다. CSS의 exit duration과 React의 타이머가 갈라지면 Dialog가 닫히는 순간이
어긋난다([DS-D-0006](../../design/governance/decisions/DS-D-0006-versioning-peer-contract.md)).

`@klipse-design/css`는 required peer다. npm은 peer를 자동 설치하려다 레지스트리에서 찾지 못해
죽고, pnpm은 경고만 낸다 — 어느 쪽이든 **css를 함께 적어야 한다**.

배포물은 ESM 전용이다. TypeScript 소비자는 `moduleResolution`이 `bundler`(또는 `node16` +
`"type": "module"`)여야 한다.

## 아이콘 찾기

이름을 모를 때는 `manifest.json`을 읽는다. 한국어와 영어 키워드가 함께 들어 있다.

```ts
import manifest from "@klipse-design/react/icons/manifest.json" with { type: "json" };

const found = manifest.icons.filter((icon) =>
  icon.keywords.some((keyword) => keyword.includes("정지")),
);
// → [{ name: "pause", symbol: "IconPause", keywords: ["정지", "일시정지", ...] }]
```

컴포넌트는 `@klipse-design/react/icons`에서 심볼 이름으로 가져온다.

```ts
import { IconPause } from "@klipse-design/react/icons";
```

## CSS

CSS는 `@klipse-design/css`가 갖는다. **세 줄을 순서대로** 불러야 토큰이 정의된다 —
자세한 것은 [packages/css/README.md](../css/README.md).

```ts
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
```
