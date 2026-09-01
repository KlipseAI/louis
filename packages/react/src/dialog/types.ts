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

/**
 * 확인 대화상자의 **의미 톤**. 값은 둘뿐이다 (DS-D-0041).
 *
 * 제품이 쓰는 것이 둘이다 — 앵커 `ae8fd627`의 `ConfirmModal.tsx:31`과
 * `node-canvas-v2/components/GlassConfirmModal.tsx:34`가 둘 다
 * `confirmVariant?: "primary" | "danger"`를 갖는다. `Tone` 어휘의 나머지 셋
 * (`info`·`success`·`warning`)은 확인 창에 쓰이는 자리가 없다 — 쓰지 않는 계단은
 * 사다리가 아니다(DS-D-0027·DS-D-0030).
 *
 * **이름이 `confirmVariant`가 아니라 `tone`인 이유.** 이 축은 Figma에 `Tone`으로 서고,
 * `figma-component-authoring.md` §2의 닫힌 어휘가 `Tone`의 값을
 * `neutral`·`info`·`success`·`warning`·`danger`로 못박는다. `primary`는 그 표에서
 * `Variant`(강조 단계)의 낱말이다. 그리고 `verify-figma-parity`는 variant 축의 옵션 집합을
 * **이 union과 글자 그대로 대조**하므로, 코드가 `"primary"`라고 적으면 Figma도 `Tone=primary`가
 * 되어 어휘 표와 어긋난다. `ToastTone = "neutral" | "danger"`가 같은 자리의 선례다.
 *
 * **톤이 소유하는 선언은 하나다** — `DialogConfirm`이 그리는 Button의 `variant`.
 * 제품의 두 확인 모달에서도 그 prop이 바꾸는 것은 확인 버튼의 `variant` 하나뿐이고,
 * 표면 색·아이콘·배치는 갈리지 않는다. `neutral`은 Button의 `primary`로 내려간다.
 */
export type DialogTone = "neutral" | "danger";

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
  readonly tone?: DialogTone;
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

/** `data-louis-safe-action="true"`를 자동으로 찍는다 → primitive safe-action이 이것을 고른다. */
export interface DialogCancelProps extends DialogButtonBase {
  readonly closeOnActivate?: boolean;
  readonly ref?: Ref<HTMLButtonElement>;
}

/** Button의 variant는 Root의 `tone`이, loading은 `busy`가 정한다. */
export interface DialogConfirmProps extends DialogButtonBase {
  /** 기본 false. async action은 소비자가 완료 후 `close("confirm")`한다. */
  readonly closeOnActivate?: boolean;
  readonly ref?: Ref<HTMLButtonElement>;
}
