# @klipse-design/react

P3에서 접근 가능한 headless behavior와 styled React 컴포넌트를 제공한다. 현재 manifest의 Web
상태가 `not-ready`인 이유는 이 패키지에 배포 가능한 구현과 테스트가 아직 없기 때문이다.

첫 구현 순서는 Button → Menu/Popover → Dialog다. 각 컴포넌트는 pointer, keyboard, focus,
disabled/loading, high contrast, reduced motion 계약을 충족한 뒤 `partial` 또는 `done`으로
승격한다.

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
