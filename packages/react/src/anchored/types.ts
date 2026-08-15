import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

/**
 * 두 recipe(ActionMenu·CompositePopover)가 공유하는 public 타입.
 *
 * 한 곳에 모으는 이유는 드리프트를 타입으로 막기 위해서다. 두 컴포넌트가 각자 `placement`를
 * 선언하면 기본값이 갈리는 순간 아무도 모른다.
 */

export type OverlayPlacement = "top" | "right" | "bottom" | "left";
export type OverlayAlign = "start" | "center" | "end";

/**
 * 규범 어휘 5종 + `programmatic`.
 *
 * `backdrop`은 non-modal에 존재할 수 없어 이 union에 없다 — primitive는 발행할 수 있지만
 * 이 recipe가 modal을 쓰지 않으므로 도달하지 않는다.
 */
export type OverlayCloseReason =
  | "trigger"
  | "select"
  | "escape"
  | "outside"
  | "route"
  | "programmatic";

export type OverlayOpenChangeHandler = (
  open: boolean,
  reason: OverlayCloseReason,
) => void;

/** disabled item 표기를 한 menu 안에서 섞지 않기 위한 **menu 단위** 정책. */
export type DisabledItemStrategy = "skip" | "announce";

export interface OverlayHandle {
  /** 규범의 `route`처럼 소비자만 아는 reason을 발행하는 유일한 통로. */
  readonly close: (reason: "route" | "programmatic") => void;
}

/** 두 Root가 공유하는 부분. */
export interface AnchoredRootProps {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: OverlayOpenChangeHandler;
  readonly placement?: OverlayPlacement;
  readonly align?: OverlayAlign;
  readonly disabled?: boolean;
  readonly closeOnSelect?: boolean;
  readonly children?: ReactNode;
  readonly ref?: Ref<OverlayHandle>;
}

export interface AnchoredTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled"> {
  /**
   * 단일 자식을 trigger로 쓴다. 자식은 tabbable interactive element여야 하고 props와 ref를
   * 그대로 전달해야 한다. 그러지 않으면 aria 배선과 anchor 등록이 조용히 사라진다.
   */
  readonly asChild?: boolean;
  readonly ref?: Ref<HTMLElement>;
}

/** panel의 accessible name을 어디서 가져올지. */
export type AnchoredPanelLabel =
  | string
  | { readonly labelledBy: string }
  | { readonly from: "trigger" }
  | { readonly from: "title" };

/** React 트리 밖에서 만든 nested overlay를 이 branch의 내부로 등록한다. */
export interface OverlayBranch {
  readonly branchId: string;
  readonly panelId: string;
  readonly registerMember: (node: Element | null) => void;
  readonly close: (reason: OverlayCloseReason) => void;
}
