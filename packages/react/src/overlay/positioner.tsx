"use client";

import {
  Popper,
  PopperAnchor,
  PopperContent,
  type PopperContentProps,
} from "@radix-ui/react-popper";
import type { ComponentPropsWithoutRef, JSX, Ref } from "react";

/**
 * anchor 기준 배치·collision·크기 계산.
 *
 * 기하 계산은 하부 유틸에서 가져온다. DS-D-0003이 "우리가 소유해야 하는 것은 순서와 정책이지
 * 기하 계산이 아니다"라고 못박았고, flip/shift/size/autoUpdate는 정확히 그 기하다.
 *
 * 우리가 소유하는 것은 **seam**이다. 하부 유틸이 발행하는 `--radix-popper-*`는
 * `overlay.css`의 한 블록에서만 `--louis-overlay-*`로 재발행되고, 나머지 CSS와 컴포넌트는
 * `--louis-*`만 본다. 유틸을 교체하면 그 블록 5줄만 바뀐다.
 */

export type OverlaySide = "top" | "right" | "bottom" | "left";
export type OverlayAlign = "start" | "center" | "end";

export interface OverlayPositionerProps {
  readonly children: React.ReactNode;
}

/** anchor와 panel을 같은 문맥에 둔다. Trigger와 Surface를 모두 감싼다. */
export function OverlayPositioner({ children }: OverlayPositionerProps): JSX.Element {
  return <Popper>{children}</Popper>;
}

export interface OverlayAnchorProps extends ComponentPropsWithoutRef<typeof PopperAnchor> {
  readonly ref?: Ref<HTMLDivElement>;
}

export function OverlayAnchor(props: OverlayAnchorProps): JSX.Element {
  return <PopperAnchor {...props} />;
}

export interface OverlayPositionedProps extends PopperContentProps {
  readonly ref?: Ref<HTMLDivElement>;
}

export function OverlayPositioned(props: OverlayPositionedProps): JSX.Element {
  return <PopperContent {...props} />;
}

export interface OverlayMetrics {
  /** anchor와 panel 사이 거리. CSS의 `--louis-overlay-offset`에서 온다. */
  readonly offset: number;
  /** viewport 가장자리와의 최소 여백. CSS의 `--louis-overlay-collision-padding`에서 온다. */
  readonly collisionPadding: number;
}

export const DEFAULT_OVERLAY_METRICS: OverlayMetrics = {
  offset: 8,
  collisionPadding: 8,
};

/**
 * 배치 상수를 **CSS에서 읽는다.** JS 상수로 두지 않는 이유는 DS-P3-014가 semantic spacing
 * 토큰을 추가할 때 API 변경 없이 값만 갈아끼울 수 있어야 하기 때문이다. primitive 토큰
 * (`--louis-space-4`)을 CSS에서 직접 소비하면 저작 게이트에 걸린다.
 *
 * panel이 존재하기 전에 값이 필요하므로 같은 클래스를 가진 보이지 않는 probe로 1회 측정한다.
 */
export function measureOverlayMetrics(host: HTMLElement): OverlayMetrics {
  const probe = document.createElement("div");
  probe.className = "louis-overlay-panel";
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  host.append(probe);
  const style = getComputedStyle(probe);
  const offset = Number.parseFloat(style.getPropertyValue("--louis-overlay-offset"));
  const collisionPadding = Number.parseFloat(
    style.getPropertyValue("--louis-overlay-collision-padding"),
  );
  probe.remove();
  return {
    offset: Number.isNaN(offset) ? DEFAULT_OVERLAY_METRICS.offset : offset,
    collisionPadding: Number.isNaN(collisionPadding)
      ? DEFAULT_OVERLAY_METRICS.collisionPadding
      : collisionPadding,
  };
}
