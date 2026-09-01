import type { DialogInitialFocus, DialogSize, DialogTone, DialogVariant } from "./types.js";
export interface DialogVariantPolicy {
    readonly initialFocus: DialogInitialFocus;
    readonly dismissible: boolean;
    readonly closeOnBackdrop: boolean;
    readonly size: DialogSize;
    readonly tone: DialogTone;
}
export declare const DIALOG_VARIANT_POLICY: Readonly<Record<DialogVariant, DialogVariantPolicy>>;
export interface DialogPolicyOverrides {
    readonly initialFocus?: DialogInitialFocus;
    readonly dismissible?: boolean;
    readonly closeOnBackdrop?: boolean;
    readonly size?: DialogSize;
    readonly tone?: DialogTone;
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
export declare function resolveDialogPolicy(variant: DialogVariant, overrides: DialogPolicyOverrides): DialogEffectivePolicy;
//# sourceMappingURL=policy.d.ts.map