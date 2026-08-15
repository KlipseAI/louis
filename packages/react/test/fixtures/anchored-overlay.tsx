import { useCallback, useEffect, useRef, useState, type JSX } from "react";

import {
  OverlayAnchor,
  OverlayPositioner,
  OverlayProvider,
  useOverlay,
  type OverlayDismissReason,
  type OverlayInitialFocus,
} from "../../dist/overlay/index.js";

/**
 * Fixture A — anchored non-modal overlay.
 *
 * 규범이 지목한 실패 좌표를 전부 담는다.
 *
 * - 다른 subtree로 portal된 submenu (자식 branch)
 * - React 트리 밖에서 명령형으로 만든 Listbox (branch member 등록만이 "내부"를 표현한다)
 * - 패널 내부 스크롤 영역
 * - disabled item과 busy item
 * - 배경 버튼 — 바깥 클릭이 배경 액션을 실행하면 안 된다
 *
 * `violate`는 **fixture 자신의 DOM과 핸들러만** 바꾼다. `src`에는 테스트 전용 분기를 만들지
 * 않는다 — 그렇게 하면 검출력 테스트가 "구현이 테스트를 알아본다"는 것만 증명하게 된다.
 */

export type AnchoredOverlayViolation =
  | "pointerdown-close"
  | "unregister-members"
  | "closing-keeps-pointer"
  | "escape-all"
  | "flat-branch"
  | "fixed-ids";

export interface AnchoredOverlayProps {
  readonly violate?: AnchoredOverlayViolation;
  readonly onSelect?: (value: string) => void;
  readonly onBackground?: () => void;
  readonly onOpenChange?: (open: boolean, reason: OverlayDismissReason) => void;
  readonly closeOnSelect?: boolean;
  readonly outsidePointerPassthrough?: boolean;
  readonly initialFocus?: OverlayInitialFocus;
  readonly defaultOpen?: boolean;
  /** 부모와 자식을 같은 commit에 함께 연다. Escape 역전을 재현하는 조건이다. */
  readonly openSubmenuWithPanel?: boolean;
}

interface PanelProps extends AnchoredOverlayProps {
  readonly open: boolean;
  readonly setOpen: (open: boolean, reason: OverlayDismissReason) => void;
  readonly triggerRef: React.RefObject<HTMLButtonElement | null>;
  /** Trigger가 "닫기"를 요청할 수 있게 recipe가 넘겨받는 통로다. */
  readonly closeRef: React.RefObject<((reason: OverlayDismissReason) => void) | null>;
}

function Submenu({
  open,
  onClose,
  onSelect,
}: {
  readonly open: boolean;
  readonly onClose: (reason: OverlayDismissReason) => void;
  readonly onSelect?: (value: string) => void;
}): JSX.Element | null {
  const overlay = useOverlay({
    open,
    mode: "non-modal",
    layer: "popover",
    onOpenChange: (next, reason) => {
      if (!next) onClose(reason);
    },
  });
  const { Surface } = overlay;
  if (!overlay.mounted) return null;
  return (
    <Surface data-testid="submenu" role="menu" aria-label="하위 메뉴">
      <button
        type="button"
        role="menuitem"
        data-testid="submenu-item"
        onClick={(event) => {
          overlay.activate(event.nativeEvent, () => onSelect?.("submenu-item"), true);
        }}
      >
        하위 항목
      </button>
    </Surface>
  );
}

/**
 * 앱이 **React 트리 밖에서** 직접 만든 Listbox.
 *
 * `createPortal`로 만든 노드는 하부 유틸이 React 트리 기준으로 자동 내부 판정하므로
 * branch registry의 효과를 측정하지 못한다. 여기서는 명령형 DOM으로 만들어 React 트리와의
 * 연결을 끊는다 — 패널이 띄운 색 선택기, 서드파티 콤보박스, 명령형 tooltip이 실제로 이 모양이다.
 * 이 노드에 대해 "내부"를 표현할 수단은 branch member 등록뿐이다.
 */
function DetachedListbox({
  registerMember,
  onSelect,
  skipRegister,
}: {
  readonly registerMember: (node: Element | null) => void;
  readonly onSelect: () => void;
  readonly skipRegister: boolean;
}): null {
  const handler = useRef(onSelect);
  handler.current = onSelect;

  useEffect(() => {
    const container = document.createElement("div");
    container.setAttribute("data-testid", "listbox");
    container.setAttribute("role", "listbox");
    const option = document.createElement("button");
    option.type = "button";
    option.setAttribute("data-testid", "listbox-option");
    option.setAttribute("role", "option");
    option.textContent = "옵션";
    option.addEventListener("click", () => handler.current());
    container.append(option);
    document.body.append(container);

    if (!skipRegister) registerMember(container);
    return () => {
      container.remove();
    };
  }, [registerMember, skipRegister]);

  return null;
}

function Panel({
  open,
  setOpen,
  triggerRef,
  violate,
  onSelect,
  closeOnSelect = true,
  outsidePointerPassthrough = false,
  initialFocus,
  openSubmenuWithPanel = false,
  closeRef,
}: PanelProps): JSX.Element | null {
  const [submenuOpen, setSubmenuOpen] = useState(openSubmenuWithPanel);
  const overlay = useOverlay({
    open,
    mode: "non-modal",
    layer: "popover",
    onOpenChange: setOpen,
    outsidePointerPassthrough,
    triggerRef,
    anchored: true,
    side: "bottom",
    align: "start",
    ...(initialFocus === undefined ? {} : { initialFocus }),
  });
  const { Surface, activate, registerMember, requestClose, state } = overlay;

  // Trigger를 이 branch의 member로 등록한다. 그래야 Trigger 클릭이 바깥으로 판정되지 않고,
  // 닫힘 reason이 outside가 아니라 trigger가 된다 — 규범의 reason 어휘와 일치한다.
  useEffect(() => {
    registerMember(triggerRef.current);
  }, [registerMember, triggerRef]);

  useEffect(() => {
    closeRef.current = requestClose;
    return () => {
      closeRef.current = null;
    };
  }, [closeRef, requestClose]);

  // violate="escape-all" — fixture가 자체 document 리스너로 전부 닫는다.
  // 우리 store가 "한 단계만"을 소유하는지 확인하는 검출력 짝이다.
  useEffect(() => {
    if (violate !== "escape-all") return undefined;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      setSubmenuOpen(false);
      setOpen(false, "escape");
    };
    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", onKeyDown, { capture: true });
    };
  }, [violate, setOpen]);

  // 명령형 노드의 click은 React 이벤트가 아니다. activate에는 preventDefault만 필요하다.
  const detachedSelect = useCallback(() => {
    activate({ preventDefault: () => {} }, () => onSelect?.("listbox-option"), closeOnSelect);
  }, [activate, onSelect, closeOnSelect]);

  const handleItem = useCallback(
    (value: string) => (event: React.MouseEvent) => {
      activate(event.nativeEvent, () => onSelect?.(value), closeOnSelect);
    },
    [activate, onSelect, closeOnSelect],
  );

  if (!overlay.mounted) return null;

  return (
    <>
      <Surface
        data-testid="panel"
        role="menu"
        aria-label="액션"
        {...(violate === "pointerdown-close"
          ? {
              // 규범이 금지한 순서. pointerdown에서 닫으면 후속 click의 착지점이 사라진다.
              onPointerDown: () => setOpen(false, "outside"),
            }
          : {})}
        {...(violate === "closing-keeps-pointer"
          ? { style: { pointerEvents: "auto" as const } }
          : {})}
      >
        <button
          type="button"
          role="menuitem"
          data-testid="item-run"
          onClick={handleItem("run")}
        >
          실행
        </button>
        <button
          type="button"
          role="menuitem"
          data-testid="item-disabled"
          aria-disabled="true"
          onClick={(event) => {
            // disabled item은 메뉴를 닫지 않는다. activate 자체를 부르지 않는다.
            event.preventDefault();
          }}
        >
          비활성
        </button>
        <button
          type="button"
          role="menuitem"
          data-testid="item-busy"
          aria-busy="true"
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          진행 중
        </button>

        {/* uncontrolled 입력. presence 전이가 패널을 재마운트하면 값이 사라진다 —
            노드 정체성 단언이 놓치는 축을 사용자 관점에서 한 번 더 잡는다. */}
        <input data-testid="panel-input" defaultValue="" aria-label="패널 입력" />

        <div data-testid="scroll-area" style={{ maxHeight: "40px", overflow: "auto" }}>
          <div style={{ height: "200px" }} data-testid="scroll-content">
            긴 목록
          </div>
        </div>

        <button
          type="button"
          data-testid="drag-control"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
        >
          드래그
        </button>

        {/* exit 창 안에서 재오픈을 요청한다. microtask라 closing 상태에 확정적으로 착지한다 —
            사용자 클릭 타이밍에 의존하면 120ms 창을 놓쳐 회귀를 재현하지 못한다. */}
        <button
          type="button"
          data-testid="close-then-reopen"
          onClick={(event) => {
            event.preventDefault();
            setOpen(false, "programmatic");
            queueMicrotask(() => setOpen(true, "programmatic"));
          }}
        >
          닫았다 다시 열기
        </button>

        <button
          type="button"
          data-testid="close-programmatic"
          onClick={(event) => {
            // activate를 거치지 않고 소비자가 open을 직접 내린다.
            event.preventDefault();
            setOpen(false, "programmatic");
          }}
        >
          외부에서 닫기
        </button>

        <button
          type="button"
          data-testid="open-submenu"
          onClick={(event) => {
            // 열기는 activation이 아니다. 메뉴를 닫지 않는다.
            event.preventDefault();
            setSubmenuOpen(true);
          }}
        >
          하위 메뉴 열기
        </button>

        {violate === "flat-branch" ? null : (
          <Submenu
            open={submenuOpen}
            onClose={() => setSubmenuOpen(false)}
            {...(onSelect === undefined ? {} : { onSelect })}
          />
        )}

        <DetachedListbox
          registerMember={registerMember}
          skipRegister={violate === "unregister-members"}
          onSelect={detachedSelect}
        />
      </Surface>

      {violate === "flat-branch" ? (
        // branch lineage를 끊는다. 형제 branch가 되면 "현재 branch만 닫는다"가 성립하지 않는다.
        <Submenu
          open={submenuOpen}
          onClose={() => setSubmenuOpen(false)}
          {...(onSelect === undefined ? {} : { onSelect })}
        />
      ) : null}

      <span data-testid="panel-state" hidden>
        {state}
      </span>
    </>
  );
}

export function AnchoredOverlay(props: AnchoredOverlayProps): JSX.Element {
  const { defaultOpen = false, onBackground, onOpenChange } = props;
  const [open, setOpenState] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<((reason: OverlayDismissReason) => void) | null>(null);

  const setOpen = useCallback(
    (next: boolean, reason: OverlayDismissReason) => {
      setOpenState(next);
      onOpenChange?.(next, reason);
    },
    [onOpenChange],
  );

  return (
    <OverlayProvider>
      <div>
        <button type="button" data-testid="background" onClick={() => onBackground?.()}>
          배경 액션
        </button>
        {/* Positioner가 anchor와 panel을 같은 문맥에 둔다. portal을 건너도 유지된다. */}
        <OverlayPositioner>
          <OverlayAnchor asChild>
            <button
              type="button"
              ref={triggerRef}
              data-testid="trigger"
              onClick={() => {
                if (open) closeRef.current?.("trigger");
                else setOpen(true, "trigger");
              }}
            >
              열기
            </button>
          </OverlayAnchor>
          <Panel
            {...props}
            open={open}
            setOpen={setOpen}
            triggerRef={triggerRef}
            closeRef={closeRef}
          />
        </OverlayPositioner>
      </div>
    </OverlayProvider>
  );
}
