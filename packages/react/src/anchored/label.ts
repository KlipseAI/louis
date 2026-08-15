import type { AnchoredPanelLabel } from "./types.js";

export interface PanelLabelAttributes {
  readonly "aria-label"?: string;
  readonly "aria-labelledby"?: string;
}

/**
 * `panelLabel` union을 실제 aria 속성으로 바꾼다.
 *
 * sentinel(`{ from: "trigger" }` / `{ from: "title" }`)을 두는 이유는, 호출부가 id를 직접
 * 만들어 넘기면 같은 화면에 두 인스턴스가 있을 때 id가 겹치기 때문이다. id는 primitive가
 * 인스턴스별로 발급하고 여기서는 어느 것을 가리킬지만 고른다.
 */
export function resolvePanelLabel(
  label: AnchoredPanelLabel,
  ids: { readonly title: string },
  triggerId: string,
): PanelLabelAttributes {
  if (typeof label === "string") return { "aria-label": label };
  if ("labelledBy" in label) return { "aria-labelledby": label.labelledBy };
  if (label.from === "trigger") return { "aria-labelledby": triggerId };
  return { "aria-labelledby": ids.title };
}
