import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  Ref,
  RefObject,
} from "react";

export type DialogVariant =
  | "confirm"
  | "danger-confirm"
  | "task"
  | "media-workbench"
  | "sheet";

export type DialogSize = "compact" | "medium" | "large" | "fullscreen";
export type DialogConfirmVariant = "primary" | "danger";

/**
 * 규범 어휘 5종. Menu의 `OverlayCloseReason`과 **의도적으로 별개**다.
 *
 * 합치면 양쪽 소비자가 각자에게 영원히 오지 않는 값을 switch에서 다루게 되고, 그 죽은 분기가
 * menu-popover.md가 경고한 "포커스 정책이 갈린다"의 다음 판본이 된다. Dialog에서 `select`·
 * `trigger`·`outside`는 구조적으로 도달 불가이고(§Implementation), `route`는 Trigger가 없어
 * 발행 지점이 없다.
 */
export type DialogCloseReason =
  | "confirm"
  | "cancel"
  | "escape"
  | "backdrop"
  | "programmatic";

/** `open === false`일 때만 호출된다. 열림은 소비자가 이미 아는 사실이라 되돌려 알리지 않는다. */
export type DialogOpenChangeHandler = (
  open: boolean,
  reason: DialogCloseReason,
) => void;

/** 닫히지 않고 안내만 하는 경로. `escape`는 primitive 경유, `backdrop`은 recipe가 발행한다. */
export type DialogDismissBlockedReason = "escape" | "backdrop";

/** 규범 Properties의 4형태. primitive 7종 중 first·last·none은 노출하지 않는다. */
export type DialogInitialFocus =
  | { readonly kind: "ref"; readonly target: RefObject<HTMLElement | null> }
  | { readonly kind: "surface" }
  | { readonly kind: "safe-action" }
  | { readonly kind: "first-field" };

export interface DialogHandle {
  /** escape·backdrop은 각자의 경로가 소유한다. 여기선 명시 결정만 발행한다. */
  readonly close: (reason: "confirm" | "cancel" | "programmatic") => void;
}

export interface DialogProps {
  /** controlled 전용. `defaultOpen`은 존재하지 않는다. */
  readonly open: boolean;
  readonly onOpenChange: DialogOpenChangeHandler;
  readonly variant?: DialogVariant;
  readonly size?: DialogSize;
  readonly initialFocus?: DialogInitialFocus;
  readonly returnFocus?: RefObject<HTMLElement | null>;
  readonly dismissible?: boolean;
  readonly closeOnBackdrop?: boolean;
  readonly busy?: boolean;
  readonly confirmVariant?: DialogConfirmVariant;
  /** 기본 안내는 Dialog가 스스로 낸다. 이것은 소비자의 **추가** 훅이다. */
  readonly onDismissBlocked?: (reason: DialogDismissBlockedReason) => void;
  /** 차단 안내 문구. 생략하면 Dialog의 기본 문구를 쓴다. */
  readonly dismissBlockedMessage?: string;
  readonly children?: ReactNode;
  readonly ref?: Ref<DialogHandle>;
}

/**
 * `style`·`role`·aria를 Omit하는 것이 Workspace 오용 방지의 타입 수단이다.
 * `ActionMenuContentProps`의 Omit 선례를 따르되 `style`을 추가로 막는다 — inline
 * `position: absolute`가 Dialog를 host 안에 도킹하는 가장 짧은 경로이기 때문이다.
 */
export interface DialogSurfaceProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    | "id"
    | "role"
    | "tabIndex"
    | "style"
    | "aria-label"
    | "aria-labelledby"
    | "aria-describedby"
    | "aria-modal"
    | "aria-busy"
  > {}

export interface DialogTitleProps extends Omit<HTMLAttributes<HTMLElement>, "id"> {
  /** 페이지 outline은 호출부가 안다. `CompositePopoverTitle`의 `as`와 같은 선례다. */
  readonly as?: "h1" | "h2" | "h3";
  readonly ref?: Ref<HTMLHeadingElement>;
}

export interface DialogDescriptionProps
  extends Omit<HTMLAttributes<HTMLParagraphElement>, "id"> {
  readonly ref?: Ref<HTMLParagraphElement>;
}

export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export interface DialogBodyProps extends HTMLAttributes<HTMLDivElement> {}
export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {}

type DialogButtonBase = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "aria-busy"
>;

/** icon-only. `label`은 필수이며 locale-aware accessible name이 된다. */
export interface DialogCloseProps extends DialogButtonBase {
  readonly label: string;
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLButtonElement>;
}

/** `data-kds-safe-action="true"`를 자동으로 찍는다 → primitive safe-action이 이것을 고른다. */
export interface DialogCancelProps extends DialogButtonBase {
  readonly closeOnActivate?: boolean;
  readonly ref?: Ref<HTMLButtonElement>;
}

/** variant는 Root의 `confirmVariant`가, loading은 `busy`가 정한다. */
export interface DialogConfirmProps extends DialogButtonBase {
  /** 기본 false. async action은 소비자가 완료 후 `close("confirm")`한다. */
  readonly closeOnActivate?: boolean;
  readonly ref?: Ref<HTMLButtonElement>;
}
