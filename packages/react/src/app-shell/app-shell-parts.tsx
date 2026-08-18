import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, JSX, ReactNode, Ref } from "react";

interface SidebarNavItemBase {
  /** 행 앞의 아이콘. 접힘에서는 이것만 남는다. */
  readonly icon?: ReactNode;
  /** 행 끝의 배지나 개수. 접힘에서는 사라진다. */
  readonly trailing?: ReactNode;
  /**
   * 현재 화면인가.
   *
   * `aria-current="page"`가 되며 **선택 상태를 이것이 소유한다.** 시각 전용 속성을 따로 두면
   * 화면에는 선택으로 보이는데 보조기술에는 아무것도 전달되지 않는 상태를 만들 수 있다.
   */
  readonly current?: boolean;
  /** rail이 접혔는가. 라벨이 시각에서만 숨고 DOM에는 남는다. */
  readonly collapsed?: boolean;
}

export interface SidebarNavItemLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    SidebarNavItemBase {
  readonly href: string;
  readonly ref?: Ref<HTMLAnchorElement>;
}

export interface SidebarNavItemButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">,
    SidebarNavItemBase {
  readonly href?: undefined;
  readonly ref?: Ref<HTMLButtonElement>;
}

export type SidebarNavItemProps = SidebarNavItemLinkProps | SidebarNavItemButtonProps;

function join(...values: readonly (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}

/**
 * design/components/app-shell-parts.md의 계약을 구현한다.
 *
 * **목적지가 있으면 링크다.** 제품의 앱 셸 소비처 25곳이 전부 `onNavigate`를 넘겨 `<button>`
 * 분기를 타는데, 그 결과 새 탭·링크 복사·미들클릭이 전부 죽는다. 여기서는 `href`가 있으면
 * `<a>`이고, 라우터 가로채기는 호출부가 `onClick`에서 한다.
 */
export function SidebarNavItem(props: SidebarNavItemProps): JSX.Element {
  const { icon, trailing, current = false, collapsed = false, className, children } = props;

  const shared = {
    className: join("kds-sidebar-nav-item", "kds-focus-ring", className),
    "aria-current": current ? ("page" as const) : undefined,
    "data-collapsed": collapsed ? "true" : undefined,
  };
  const body = (
    <>
      {icon === undefined ? null : (
        // 라벨이 이름을 소유하므로 아이콘은 장식이다.
        <span className="kds-sidebar-nav-item__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="kds-sidebar-nav-item__label">{children}</span>
      {trailing === undefined ? null : (
        <span className="kds-sidebar-nav-item__trailing">{trailing}</span>
      )}
    </>
  );

  if (props.href !== undefined) {
    const { icon: _i, trailing: _t, current: _c, collapsed: _co, className: _cl, children: _ch, ...rest } = props;
    return (
      <a {...rest} {...shared}>
        {body}
      </a>
    );
  }
  const { icon: _i, trailing: _t, current: _c, collapsed: _co, className: _cl, children: _ch, ...rest } = props;
  return (
    <button {...rest} {...shared} type="button">
      {body}
    </button>
  );
}

export interface AppTopBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 앞쪽 슬롯 — 보통 사이드바 토글이다. */
  readonly leading?: ReactNode;
  /** 가운데. 남는 자리를 먹고 한 줄로 잘린다. */
  readonly title?: ReactNode;
  /** 뒤쪽 슬롯 — 컨텍스트 액션과 프로필 트리거. */
  readonly trailing?: ReactNode;
  /**
   * 아래 경계선을 그린다.
   *
   * 기본이 꺼짐인 이유는 제품의 경계선이 스크롤 진행률에 따라 색이 연속으로 변하는 **런타임
   * 계약**이기 때문이다. 컴포넌트가 소유할 수 없고, 필요한 소비처가 켠다.
   */
  readonly divider?: boolean;
  readonly ref?: Ref<HTMLDivElement>;
}

/**
 * 셸의 top chrome 한 줄.
 *
 * **레이아웃은 이 컴포넌트의 것이 아니다.** 어디에 붙는지, 스크롤 루트가 어디인지,
 * 본문과 좌우 inset을 어떻게 맞추는지는 design/patterns/app-shell.md가 소유한다.
 */
export function AppTopBar({
  leading,
  title,
  trailing,
  divider = false,
  className,
  children,
  ...rest
}: AppTopBarProps): JSX.Element {
  return (
    <div
      {...rest}
      className={join("kds-app-top-bar", className)}
      data-divider={divider ? "true" : undefined}
    >
      {leading === undefined ? null : (
        <span className="kds-app-top-bar__leading">{leading}</span>
      )}
      {title === undefined ? null : <span className="kds-app-top-bar__title">{title}</span>}
      {children}
      {trailing === undefined ? null : (
        <span className="kds-app-top-bar__trailing">{trailing}</span>
      )}
    </div>
  );
}
