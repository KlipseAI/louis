import type { OverlayDismissReason } from "../overlay/types.js";
import type { DialogCloseReason } from "./types.js";

/**
 * primitive 7종 중 Dialog에 도달 가능한 것은 escape·backdrop·programmatic 셋뿐이다.
 * 나머지 넷은 구조적으로 발생할 수 없지만 **통지를 버리지 않는다** — 버리면 controlled
 * 소비자의 `open`이 true로 남아 "닫혔는데 열려 있음"이 된다.
 */
export function toDialogCloseReason(
  reason: OverlayDismissReason,
): DialogCloseReason {
  if (reason === "escape" || reason === "backdrop" || reason === "programmatic") {
    return reason;
  }
  // 항상 알린다. `process.env`를 보지 않는 이유는 이 패키지가 Node 타입에 의존하지 않기
  // 때문이고, 이 분기는 구조가 깨졌을 때만 도달하므로 정상 경로에서 소음이 되지 않는다.
  console.error(
    `Dialog: 도달 불가능한 dismiss reason "${reason}"입니다. overlay 구조가 깨졌습니다.`,
  );
  return "programmatic";
}
