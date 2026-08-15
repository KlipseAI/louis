import type { RefObject } from "react";

/**
 * overlay primitive의 공통 어휘.
 *
 * DS-D-0011: 이 모듈은 `packages/react`의 public 표면이 아니다. Menu·Dialog recipe가
 * 상대 경로로 소비하며 `src/index.ts`에서 재export하지 않는다.
 */

/** modal은 배경을 차단하고, non-modal은 배경과 공존한다. */
export type OverlayMode = "modal" | "non-modal";

/**
 * stacking rank. elevation과 독립이다 — elevation은 그림자의 시각 단계이고
 * layer는 누가 위인지의 정책이다.
 */
export type OverlayLayer = "popover" | "modal" | "critical";

export type OverlayPresenceState = "closed" | "opening" | "open" | "closing";

export type OverlayHostKind = "modal" | "non-modal";

/**
 * primitive가 생산할 수 있는 reason만 담는다. confirm·cancel은 Dialog recipe의 어휘다.
 *
 * DS-D-0011 결정 4: non-modal에서 Tab으로 focus가 빠져나가 닫히는 경로는 새 reason을
 * 만들지 않고 `outside`로 매핑한다. focus 정책이 같기 때문이다 — 둘 다 포커스를 옮기지 않는다.
 */
export type OverlayDismissReason =
  | "escape"
  | "outside"
  | "select"
  | "trigger"
  | "route"
  | "backdrop"
  | "programmatic";

/**
 * 초기 focus 대상. primitive는 7종을 전부 제공하고 **기본값을 정하지 않는다** —
 * 어느 variant가 무엇을 받는지는 컴포넌트 규범이 소유한다.
 */
export type OverlayInitialFocus =
  | { readonly kind: "ref"; readonly target: RefObject<HTMLElement | null> }
  | { readonly kind: "first" }
  | { readonly kind: "last" }
  | { readonly kind: "first-field" }
  | { readonly kind: "safe-action" }
  | { readonly kind: "surface" }
  | { readonly kind: "none" };
