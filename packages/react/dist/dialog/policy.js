export const DIALOG_VARIANT_POLICY = {
    // Variants "primary 또는 가장 안전한 명시적 액션" / Specification "Compact width"
    confirm: {
        initialFocus: { kind: "safe-action" },
        dismissible: true,
        closeOnBackdrop: true,
        size: "compact",
        tone: "neutral",
    },
    // Pointer "danger-confirm은 backdrop click을 취소와 동일시하지 않는다"
    "danger-confirm": {
        initialFocus: { kind: "safe-action" },
        dismissible: true,
        closeOnBackdrop: false,
        size: "compact",
        // **variant 이름 자체가 톤의 근거다.** danger-confirm이 danger 톤을 기본으로 갖지 않으면
        // 파괴적 확인 창을 부르면서 확인 버튼만 중립으로 남는 조합이 기본값이 된다.
        tone: "danger",
    },
    // Variants "첫 유효 필드" / Pointer "데이터 입력 task는 동일시하지 않는다"
    task: {
        initialFocus: { kind: "first-field" },
        dismissible: true,
        closeOnBackdrop: false,
        size: "medium",
        tone: "neutral",
    },
    // 편집 중 backdrop 오클릭은 데이터 손실이다.
    "media-workbench": {
        initialFocus: { kind: "surface" },
        dismissible: true,
        closeOnBackdrop: false,
        size: "large",
        tone: "neutral",
    },
    sheet: {
        initialFocus: { kind: "safe-action" },
        dismissible: true,
        closeOnBackdrop: true,
        size: "medium",
        tone: "neutral",
    },
};
export function resolveDialogPolicy(variant, overrides) {
    const base = DIALOG_VARIANT_POLICY[variant];
    const dismissible = overrides.dismissible ?? base.dismissible;
    const closeOnBackdrop = overrides.closeOnBackdrop ?? base.closeOnBackdrop;
    const busy = overrides.busy ?? false;
    return {
        initialFocus: overrides.initialFocus ?? base.initialFocus,
        dismissible,
        closeOnBackdrop,
        size: overrides.size ?? base.size,
        tone: overrides.tone ?? base.tone,
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
//# sourceMappingURL=policy.js.map