import type {
  DialogConfirmVariant,
  DialogInitialFocus,
  DialogSize,
  DialogVariant,
} from "./types.js";

export interface DialogVariantPolicy {
  readonly initialFocus: DialogInitialFocus;
  readonly dismissible: boolean;
  readonly closeOnBackdrop: boolean;
  readonly size: DialogSize;
  readonly confirmVariant: DialogConfirmVariant;
}

export const DIALOG_VARIANT_POLICY: Readonly<
  Record<DialogVariant, DialogVariantPolicy>
> = {
  // Variants "primary 또는 가장 안전한 명시적 액션" / Specification "Compact width"
  confirm: {
    initialFocus: { kind: "safe-action" },
    dismissible: true,
    closeOnBackdrop: true,
    size: "compact",
    confirmVariant: "primary",
  },
  // Pointer "danger-confirm은 backdrop click을 취소와 동일시하지 않는다"
  "danger-confirm": {
    initialFocus: { kind: "safe-action" },
    dismissible: true,
    closeOnBackdrop: false,
    size: "compact",
    confirmVariant: "danger",
  },
  // Variants "첫 유효 필드" / Pointer "데이터 입력 task는 동일시하지 않는다"
  task: {
    initialFocus: { kind: "first-field" },
    dismissible: true,
    closeOnBackdrop: false,
    size: "medium",
    confirmVariant: "primary",
  },
  // 편집 중 backdrop 오클릭은 데이터 손실이다.
  "media-workbench": {
    initialFocus: { kind: "surface" },
    dismissible: true,
    closeOnBackdrop: false,
    size: "large",
    confirmVariant: "primary",
  },
  sheet: {
    initialFocus: { kind: "safe-action" },
    dismissible: true,
    closeOnBackdrop: true,
    size: "medium",
    confirmVariant: "primary",
  },
};

export interface DialogPolicyOverrides {
  readonly initialFocus?: DialogInitialFocus;
  readonly dismissible?: boolean;
  readonly closeOnBackdrop?: boolean;
  readonly size?: DialogSize;
  readonly confirmVariant?: DialogConfirmVariant;
  readonly busy?: boolean;
}

export interface DialogEffectivePolicy extends DialogVariantPolicy {
  /** primitive `closeOnEscape`로 그대로 간다. busy는 `dismissLocked`가 따로 막는다. */
  readonly escapeCloses: boolean;
  /** recipe 게이트. primitive에 backdrop 경로가 없다. */
  readonly backdropCloses: boolean;
  readonly closeButtonVisible: boolean;
  readonly closeButtonEnabled: boolean;
  readonly busy: boolean;
}

export function resolveDialogPolicy(
  variant: DialogVariant,
  overrides: DialogPolicyOverrides,
): DialogEffectivePolicy {
  const base = DIALOG_VARIANT_POLICY[variant];
  const dismissible = overrides.dismissible ?? base.dismissible;
  const closeOnBackdrop = overrides.closeOnBackdrop ?? base.closeOnBackdrop;
  const busy = overrides.busy ?? false;
  return {
    initialFocus: overrides.initialFocus ?? base.initialFocus,
    dismissible,
    closeOnBackdrop,
    size: overrides.size ?? base.size,
    confirmVariant: overrides.confirmVariant ?? base.confirmVariant,
    // dismissible은 영구 정책이므로 primitive closeOnEscape에 그대로 간다.
    // busy는 일시 잠금이라 dismissLocked가 따로 막는다 — 두 축을 여기서 합치면
    // busy가 풀렸을 때 closeOnEscape가 되돌아오지 않는 경로가 생긴다.
    escapeCloses: dismissible,
    backdropCloses: closeOnBackdrop && dismissible && !busy,
    closeButtonVisible: dismissible,
    closeButtonEnabled: dismissible && !busy,
    busy,
  };
}
