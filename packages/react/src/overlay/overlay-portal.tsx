"use client";

import { Portal } from "@radix-ui/react-portal";
import type { JSX, ReactNode } from "react";
import { useOverlayContext } from "./overlay-provider.js";
import type { OverlayHostKind } from "./types.js";

/**
 * 해석된 host로만 portal한다.
 *
 * 하부 portal 유틸은 `container`가 falsy면 조용히 `document.body`로 폴백한다. 그 폴백은
 * 여기서 반드시 막아야 한다 — body로 떨어진 overlay는 Provider가 만든 host 밖에 있으므로
 * inert 경계와 stacking 기준에서 동시에 벗어나고, 아무 에러도 나지 않는다.
 * host가 없으면 **아무것도 렌더하지 않는다.**
 */

export interface OverlayPortalProps {
  readonly kind: OverlayHostKind;
  readonly children: ReactNode;
}

export function OverlayPortal({ kind, children }: OverlayPortalProps): JSX.Element | null {
  const { hosts, hostContainer } = useOverlayContext();
  const host = hosts[kind];
  // host가 아직 문서에 붙지 않았다면 렌더하지 않는다. 붙기 전에 렌더하면 위치 계산이
  // 분리된 트리에서 일어나 전부 0이 된다.
  if (host === null || hostContainer === null) return null;
  return <Portal container={host}>{children}</Portal>;
}
