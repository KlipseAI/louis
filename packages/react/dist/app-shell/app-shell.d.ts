import type { HTMLAttributes, JSX, ReactNode, Ref } from "react";
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
export declare function AppShell({ rail, chrome, variant, collapsed, drawerOpen, onDrawerClose, className, children, ref, ...rest }: AppShellProps): JSX.Element;
//# sourceMappingURL=app-shell.d.ts.map