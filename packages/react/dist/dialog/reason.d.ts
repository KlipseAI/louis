import type { OverlayDismissReason } from "../overlay/types.js";
import type { DialogCloseReason } from "./types.js";
/**
 * primitive 7종 중 Dialog에 도달 가능한 것은 escape·backdrop·programmatic 셋뿐이다.
 * 나머지 넷은 구조적으로 발생할 수 없지만 **통지를 버리지 않는다** — 버리면 controlled
 * 소비자의 `open`이 true로 남아 "닫혔는데 열려 있음"이 된다.
 */
export declare function toDialogCloseReason(reason: OverlayDismissReason): DialogCloseReason;
//# sourceMappingURL=reason.d.ts.map