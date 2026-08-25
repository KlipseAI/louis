"use client";

import {
  useCallback,
  useEffect,
  type HTMLAttributes,
  type JSX,
  type Ref,
} from "react";
import { AnchoredRoot } from "../anchored/root.js";
import { AnchoredTrigger } from "../anchored/trigger.js";
import { useAnchoredContext } from "../anchored/context.js";
import { resolvePanelLabel } from "../anchored/label.js";
import type {
  AnchoredPanelLabel,
  AnchoredRootProps,
  AnchoredTriggerProps,
} from "../anchored/types.js";

/**
 * CompositePopover — `role="dialog"` recipe.
 *
 * action menu와 달리 roving을 쓰지 않는다. 자손이 자연 Tab 순서로 tabbable이고, 초기 focus는
 * panel root다. panel이 focus를 가지면 다음 Tab이 실제로 자손으로 들어가고 그때 패널 이름이
 * 먼저 읽힌다 — 비모달 dialog에서 패널 내용에 도달하는 가장 신뢰 가능한 경로다.
 */

export type CompositePopoverPanelLabel = AnchoredPanelLabel;

export interface CompositePopoverProps extends AnchoredRootProps {
  /** 기본값은 `{ from: "title" }`이며 Title을 사실상 필수로 만든다. */
  readonly panelLabel?: CompositePopoverPanelLabel;
}

export function CompositePopover({
  panelLabel = { from: "title" },
  ...rest
}: CompositePopoverProps): JSX.Element {
  // §Focus: composite popover의 초기 focus는 panel root다.
  const resolveInitialFocus = useCallback((panel: HTMLElement) => panel, []);
  return (
    <AnchoredRoot
      {...rest}
      kind="composite-popover"
      panelLabel={panelLabel}
      resolveInitialFocus={resolveInitialFocus}
    />
  );
}

export interface CompositePopoverTriggerProps extends AnchoredTriggerProps {}

export function CompositePopoverTrigger(
  props: CompositePopoverTriggerProps,
): JSX.Element {
  return <AnchoredTrigger {...props} part="CompositePopoverTrigger" />;
}

export interface CompositePopoverContentProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "id" | "role" | "tabIndex" | "aria-label" | "aria-labelledby"
  > {}

export function CompositePopoverContent({
  className,
  children,
  ...rest
}: CompositePopoverContentProps): JSX.Element | null {
  const context = useAnchoredContext("CompositePopoverContent");
  const { overlay, panelRef, triggerId, panelLabel } = context;
  const { Surface, ids, state } = overlay;

  // dangling aria-labelledby는 조용히 "이름 없는 dialog"가 된다. 스크린리더 사용자에게는
  // 패널이 무엇인지 알 방법이 사라지는데 화면상으로는 아무 이상이 없다.
  const labelsFromTitle = typeof panelLabel === "object" && "from" in panelLabel
    ? panelLabel.from === "title"
    : false;
  useEffect(() => {
    if (!labelsFromTitle || state !== "open") return;
    if (document.getElementById(ids.title) !== null) return;
    console.error(
      `CompositePopover: panelLabel이 title을 가리키는데 CompositePopoverTitle이 렌더되지 않았습니다. ` +
        `패널에 접근 가능한 이름이 없습니다 (aria-labelledby="${ids.title}").`,
    );
  }, [labelsFromTitle, state, ids.title]);

  if (!overlay.mounted) return null;

  const label = resolvePanelLabel(panelLabel, ids, triggerId);
  const classes = ["louis-popover", className].filter(Boolean).join(" ");

  return (
    <Surface
      {...rest}
      {...label}
      ref={panelRef}
      role="dialog"
      data-kind="composite-popover"
      className={classes}
    >
      {children}
    </Surface>
  );
}

export interface CompositePopoverTitleProps
  extends Omit<HTMLAttributes<HTMLElement>, "id"> {
  readonly as?: "h2" | "h3" | "h4";
  readonly ref?: Ref<HTMLHeadingElement>;
}

export function CompositePopoverTitle({
  as: Tag = "h2",
  className,
  children,
  ref,
  ...rest
}: CompositePopoverTitleProps): JSX.Element {
  const { overlay } = useAnchoredContext("CompositePopoverTitle");
  return (
    <Tag
      {...rest}
      ref={ref}
      id={overlay.ids.title}
      className={["louis-popover__title", className].filter(Boolean).join(" ")}
    >
      {children}
    </Tag>
  );
}
