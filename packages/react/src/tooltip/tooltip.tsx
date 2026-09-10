"use client";

import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type JSX,
  type ReactElement,
  type ReactNode,
} from "react";
import { OverlayPortal } from "../overlay/overlay-portal.js";
import { useOverlayContext } from "../overlay/overlay-provider.js";
import {
  OverlayAnchor,
  OverlayPositioned,
  OverlayPositioner,
  type OverlayAlign,
  type OverlaySide,
} from "../overlay/positioner.js";

/**
 * 표면에 담기는 것이 달라지는 축. 크기 사다리가 아니다.
 *
 * `base` 는 포인터를 따라다니는 한 줄 설명이고, `coachmark` 는 대상에 붙어 함께 움직이는
 * 제목/본문 두 줄 안내다. 제품 정본은 캔버스의 `CanvasFirstNodeHint` 로, React Flow 의
 * `ViewportPortal` 안에서 flow 좌표로 놓여 캔버스와 함께 팬·줌된다.
 */
export type TooltipLayout = "base" | "coachmark";

export interface TooltipProps {
  /** 설명. 상호작용 요소를 넣지 않는다 — tooltip 표면은 포인터를 받지 않는다. */
  readonly content: ReactNode;
  /** 표면 구성. 기본은 `base` 이며, `title` 을 주면 `coachmark` 가 된다. */
  readonly layout?: TooltipLayout;
  /**
   * coachmark 의 제목. 주면 `content` 가 본문이 된다.
   *
   * `base` 에서는 무시한다 — 한 줄 설명에 제목을 얹으면 두 줄이 되고, 그것은 이미 coachmark 다.
   */
  readonly title?: ReactNode;
  /** 선호 방향. 공간이 없으면 뒤집힌다. */
  readonly side?: OverlaySide;
  readonly align?: OverlayAlign;
  /** 포인터 진입 후 열리기까지. focus로 열 때는 지연하지 않는다. */
  readonly openDelay?: number;
  /** tooltip을 띄우지 않는다. trigger의 동작은 그대로다. */
  readonly disabled?: boolean;
  /** 상호작용 가능한 요소 하나. tooltip은 감싸지 않고 속성만 붙인다. */
  readonly children: ReactElement<Record<string, unknown>>;
}

/**
 * design/components/tooltip.md의 계약을 구현한다.
 *
 * overlay primitive에서 **위치 계산과 portal만** 쓴다. focus scope·inert·scroll lock·dismissable
 * layer는 쓰지 않는다 — tooltip은 focus를 가져가지 않고 바깥 클릭을 삼키지도 않으므로, 그것들을
 * 붙이면 없는 문제를 위해 배경을 잠그게 된다.
 *
 * trigger를 감싸지 않고 `cloneElement`로 속성만 붙인다. 래퍼를 두면 그 래퍼가 레이아웃에 끼어들어
 * 호출부의 flex/grid 계산이 조용히 달라진다.
 */
export function Tooltip({
  content,
  layout,
  title,
  side = "top",
  align = "center",
  openDelay = 300,
  disabled = false,
  children,
}: TooltipProps): JSX.Element {
  // offset과 collision padding은 overlay 표면 CSS가 소유하고 Provider가 1회 측정한다.
  // 여기서 숫자를 다시 쓰면 Menu·Dialog와 tooltip이 서로 다른 간격을 갖게 된다.
  const { metrics } = useOverlayContext();
  const [open, setOpen] = useState(false);
  const surfaceId = useId();
  const timer = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  // 언마운트 시 타이머가 남으면 사라진 컴포넌트의 setState가 호출된다.
  useEffect(() => clearTimer, [clearTimer]);

  const close = useCallback(() => {
    clearTimer();
    setOpen(false);
  }, [clearTimer]);

  /** 포인터는 지연해서, focus는 즉시 연다. 지연은 "지나가는 포인터"를 거르기 위한 것이다. */
  const openAfterDelay = useCallback(() => {
    if (disabled) return;
    clearTimer();
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setOpen(true);
    }, openDelay);
  }, [clearTimer, disabled, openDelay]);

  const openNow = useCallback(() => {
    if (disabled) return;
    clearTimer();
    setOpen(true);
  }, [clearTimer, disabled]);

  // Escape는 열려 있을 때만 문서 수준에서 듣는다. focus는 trigger에 남아 있으므로
  // trigger의 keydown만 봐서는 표면이 열린 채 남는 경우를 놓친다.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") close();
    };
    const onScroll = (): void => close();
    document.addEventListener("keydown", onKeyDown);
    // capture로 듣는다. 스크롤은 버블하지 않는 컨테이너가 많다.
    document.addEventListener("scroll", onScroll, { capture: true });
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [close, open]);

  // 제목이 있으면 두 줄이고, 두 줄이면 coachmark 다. 명시 prop 이 그것을 이긴다 —
  // Figma 의 `Layout` variant 와 이름이 1:1로 맞아야 계약이 대조할 타입이 생긴다.
  const resolvedLayout: TooltipLayout =
    layout ?? (title === undefined ? "base" : "coachmark");

  const describedBy = open ? surfaceId : undefined;
  const trigger = cloneElement(children, {
    ...(describedBy === undefined ? {} : { "aria-describedby": describedBy }),
    onPointerEnter: (event: React.PointerEvent) => {
      (children.props["onPointerEnter"] as ((e: React.PointerEvent) => void) | undefined)?.(event);
      // 터치에는 열지 않는다. hover가 없고, 길게 누르기는 컨텍스트 메뉴와 충돌한다.
      if (event.pointerType === "touch") return;
      openAfterDelay();
    },
    onPointerLeave: (event: React.PointerEvent) => {
      (children.props["onPointerLeave"] as ((e: React.PointerEvent) => void) | undefined)?.(event);
      close();
    },
    onPointerDown: (event: React.PointerEvent) => {
      (children.props["onPointerDown"] as ((e: React.PointerEvent) => void) | undefined)?.(event);
      // 누르는 순간 닫는다. 누른 뒤에도 설명이 떠 있으면 결과를 가린다.
      close();
    },
    onFocus: (event: React.FocusEvent) => {
      (children.props["onFocus"] as ((e: React.FocusEvent) => void) | undefined)?.(event);
      openNow();
    },
    onBlur: (event: React.FocusEvent) => {
      (children.props["onBlur"] as ((e: React.FocusEvent) => void) | undefined)?.(event);
      close();
    },
  });

  return (
    <OverlayPositioner>
      <OverlayAnchor asChild>{trigger}</OverlayAnchor>
      {open ? (
        <OverlayPortal kind="non-modal">
          <OverlayPositioned
            side={side}
            align={align}
            sideOffset={metrics.offset}
            collisionPadding={metrics.collisionPadding}
            className="louis-tooltip-positioner"
          >
            <div
              id={surfaceId}
              role="tooltip"
              className="louis-tooltip"
              data-layout={resolvedLayout}
            >
              {resolvedLayout === "coachmark" ? (
                <>
                  {title === undefined ? null : (
                    <p className="louis-tooltip__title">{title}</p>
                  )}
                  <p className="louis-tooltip__body">{content}</p>
                </>
              ) : (
                content
              )}
            </div>
          </OverlayPositioned>
        </OverlayPortal>
      ) : null}
    </OverlayPositioner>
  );
}
