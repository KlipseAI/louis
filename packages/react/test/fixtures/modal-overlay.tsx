import { useCallback, useEffect, useRef, useState, type CSSProperties, type JSX } from "react";

import {
  OverlayProvider,
  useOverlay,
  useOverlayContext,
  type OverlayDismissReason,
} from "../../dist/overlay/index.js";

/**
 * Fixture B — modal overlay.
 *
 * 담는 것: 배경(button·link·긴 스크롤 문서), backdrop, modal panel, **중첩 2번째 modal**,
 * 그리고 **modal 안에서 여는 non-modal popover**(별도 host로 portal된다).
 *
 * 마지막 항목이 이 fixture의 핵심이다. inert 경계를 너무 넓게 잡으면 그 popover가 함께 죽어
 * "열리지만 선택되지 않음"이 되고, 너무 좁게 잡으면 배경 격리가 깨진다. 두 실패가 서로를
 * 가리므로 반드시 쌍으로 측정한다.
 */

export type ModalOverlayViolation = "inert-all-roots" | "backdrop-any-target";

export interface ModalOverlayProps {
  readonly violate?: ModalOverlayViolation;
  readonly onBackground?: () => void;
  readonly onOpenChange?: (open: boolean, reason: OverlayDismissReason) => void;
  readonly onPopoverSelect?: () => void;
  readonly dismissLocked?: boolean;
  readonly closeOnEscape?: boolean;
  readonly defaultOpen?: boolean;
}

const OVERLAY_ROOT_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgb(0 0 0 / 40%)",
};

const SURFACE_STYLE: CSSProperties = {
  background: "white",
  padding: "16px",
  minWidth: "200px",
};

// z-index는 positioned 요소에만 적용된다. static인 채로 두면 layer 토큰이 계산에 들어가지 않고,
// 긴 배경 문서 아래로 밀려 화면 밖에 놓인다. 실제 anchored popover도 항상 positioned다.
const POPOVER_STYLE: CSSProperties = {
  ...SURFACE_STYLE,
  position: "fixed",
  top: "8px",
  left: "8px",
};

/** modal 안에서 여는 non-modal popover. 별도 host로 portal되지만 branch는 modal의 자식이다. */
function InnerPopover({ onSelect }: { readonly onSelect?: () => void }): JSX.Element {
  const [open, setOpen] = useState(false);
  const overlay = useOverlay({
    open,
    mode: "non-modal",
    layer: "popover",
    onOpenChange: (next) => {
      if (!next) setOpen(false);
    },
    initialFocus: { kind: "none" },
  });
  const { Surface } = overlay;
  return (
    <>
      <button
        type="button"
        data-testid="open-popover"
        onClick={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
      >
        팝오버 열기
      </button>
      {overlay.mounted ? (
        <Surface data-testid="inner-popover" style={POPOVER_STYLE}>
          <button
            type="button"
            data-testid="popover-item"
            onClick={(event) => {
              overlay.activate(event.nativeEvent, () => onSelect?.(), true);
            }}
          >
            팝오버 항목
          </button>
        </Surface>
      ) : null}
    </>
  );
}

function SecondModal({
  open,
  onClose,
}: {
  readonly open: boolean;
  readonly onClose: (reason: OverlayDismissReason) => void;
}): JSX.Element | null {
  const overlay = useOverlay({
    open,
    mode: "modal",
    layer: "modal",
    onOpenChange: (next, reason) => {
      if (!next) onClose(reason);
    },
  });
  const { Surface, requestClose } = overlay;
  if (!overlay.mounted) return null;
  return (
    <Surface
      data-testid="modal-2-root"
      style={OVERLAY_ROOT_STYLE}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose("backdrop");
      }}
    >
      <div data-testid="modal-2" role="dialog" aria-modal="true" style={SURFACE_STYLE}>
        <button type="button" data-testid="modal-2-action">
          두 번째 확인
        </button>
      </div>
    </Surface>
  );
}

function FirstModal({
  open,
  setOpen,
  triggerRef,
  violate,
  onPopoverSelect,
  dismissLocked = false,
  closeOnEscape = true,
}: {
  readonly open: boolean;
  readonly setOpen: (open: boolean, reason: OverlayDismissReason) => void;
  readonly triggerRef: React.RefObject<HTMLButtonElement | null>;
  readonly violate?: ModalOverlayViolation;
  readonly onPopoverSelect?: () => void;
  readonly dismissLocked?: boolean;
  readonly closeOnEscape?: boolean;
}): JSX.Element | null {
  const [secondOpen, setSecondOpen] = useState(false);
  const context = useOverlayContext();
  const overlay = useOverlay({
    open,
    mode: "modal",
    layer: "modal",
    onOpenChange: setOpen,
    triggerRef,
    dismissLocked,
    closeOnEscape,
  });
  const { Surface, requestClose } = overlay;

  // violate="inert-all-roots" — non-modal host의 면제를 취소한다.
  // 규범이 요구하는 "Dialog 안 Popover는 inert 되지 않는다"의 정확한 반대 상태다.
  useEffect(() => {
    if (violate !== "inert-all-roots" || !overlay.mounted) return undefined;
    const host = context.hosts["non-modal"];
    if (host === null) return undefined;
    const target = host as HTMLElement & { inert: boolean };
    target.inert = true;
    return () => {
      target.inert = false;
    };
  }, [violate, overlay.mounted, context.hosts]);

  if (!overlay.mounted) return null;

  return (
    <Surface
      data-testid="modal-1-root"
      style={OVERLAY_ROOT_STYLE}
      onClick={(event) => {
        // backdrop은 자기 자신이 target일 때만 dismiss한다.
        if (violate === "backdrop-any-target" || event.target === event.currentTarget) {
          requestClose("backdrop");
        }
      }}
    >
      <div data-testid="modal-1" role="dialog" aria-modal="true" style={SURFACE_STYLE}>
        <button type="button" data-testid="modal-1-action">
          확인
        </button>
        <button
          type="button"
          data-testid="open-modal-2"
          onClick={(event) => {
            event.preventDefault();
            setSecondOpen(true);
          }}
        >
          두 번째 열기
        </button>
        <InnerPopover {...(onPopoverSelect === undefined ? {} : { onSelect: onPopoverSelect })} />
        <SecondModal open={secondOpen} onClose={() => setSecondOpen(false)} />
      </div>
    </Surface>
  );
}

export function ModalOverlay(props: ModalOverlayProps): JSX.Element {
  const { defaultOpen = false, onBackground, onOpenChange } = props;
  const [open, setOpenState] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const setOpen = useCallback(
    (next: boolean, reason: OverlayDismissReason) => {
      setOpenState(next);
      onOpenChange?.(next, reason);
    },
    [onOpenChange],
  );

  return (
    <OverlayProvider>
      <div data-testid="app-root">
        <button type="button" data-testid="background" onClick={() => onBackground?.()}>
          배경 액션
        </button>
        <a href="#none" data-testid="background-link">
          배경 링크
        </a>
        <button
          type="button"
          ref={triggerRef}
          data-testid="trigger"
          onClick={() => setOpen(true, "trigger")}
        >
          모달 열기
        </button>
        <div data-testid="long-document" style={{ height: "3000px" }}>
          긴 문서
        </div>
        <FirstModal {...props} open={open} setOpen={setOpen} triggerRef={triggerRef} />
      </div>
    </OverlayProvider>
  );
}
