import type { HTMLAttributes, JSX, ReactNode, Ref } from "react";
import { useEffect, useId, useRef } from "react";

/**
 * page는 main surface 안에서 구르고, workspace는 고정 host를 채운다.
 *
 * **하나의 composition에 variant로 둔다**(app-shell.md). 둘을 다른 컴포넌트로 가르면
 * `<main>`과 시각 panel의 소유권이 variant마다 달라지고, 그것이 규범이 금지하는 것이다.
 */
export type AppShellVariant = "page" | "workspace";

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** 사이드바(navigation rail)에 놓이는 것. 브랜드 · 내비 · 하단 CTA. */
  readonly rail: ReactNode;
  /** 상단 크롬. scroll root **안에** sticky로 붙는다. */
  readonly chrome?: ReactNode;
  readonly variant?: AppShellVariant;
  /** 접힘 상태. 셸이 아니라 **소비처가 소유한다** — 라우트가 정하는 경우가 있다. */
  readonly collapsed?: boolean;
  /** compact에서 drawer가 열렸는지. */
  readonly drawerOpen?: boolean;
  readonly onDrawerClose?: () => void;
  readonly children: ReactNode;
  readonly ref?: Ref<HTMLDivElement>;
}

export function AppShell({
  rail,
  chrome,
  variant = "page",
  collapsed = false,
  drawerOpen = false,
  onDrawerClose,
  className,
  children,
  ref,
  ...rest
}: AppShellProps): JSX.Element {
  const contentId = useId();
  const railRef = useRef<HTMLElement | null>(null);

  // drawer가 열린 동안 Escape로 닫고 focus를 안으로 옮긴다. 뒤 콘텐츠의 비활성화는
  // `inert`가 소유하며 아래 렌더에서 건다 — 두 곳에서 같은 일을 하지 않는다.
  useEffect(() => {
    if (!drawerOpen) return;
    const rail = railRef.current;
    rail?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDrawerClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, onDrawerClose]);

  return (
    <div
      {...rest}
      ref={ref}
      className={["louis-app-shell", className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-collapsed={collapsed ? "true" : "false"}
      data-drawer={drawerOpen ? "open" : "closed"}
    >
      {/* 건너뛰기 링크가 anatomy의 첫 항목이다. 내비를 지나 본문으로 가는 유일한 키보드 경로다. */}
      <a className="louis-app-shell__skip" href={`#${contentId}`}>
        본문으로 건너뛰기
      </a>

      <nav
        ref={railRef}
        className="louis-app-shell__rail"
        aria-label="주 메뉴"
        tabIndex={-1}
      >
        {rail}
      </nav>

      {/* scrim은 compact에서만 보인다. 눌러서 닫는 것이 규범이다. */}
      <div
        className="louis-app-shell__scrim"
        onClick={onDrawerClose}
        aria-hidden="true"
        data-testid="louis-app-shell-scrim"
      />

      <div
        className="louis-app-shell__main"
        // drawer가 열리면 뒤 콘텐츠는 pointer와 focus 양쪽에서 비활성화된다.
        inert={drawerOpen ? true : undefined}
      >
        {chrome === undefined ? null : (
          <div className="louis-app-shell__chrome">{chrome}</div>
        )}
        <main id={contentId} className="louis-app-shell__content">
          {children}
        </main>
      </div>
    </div>
  );
}
