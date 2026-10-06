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
    className: join("louis-sidebar-nav-item", className),
    "aria-current": current ? ("page" as const) : undefined,
    "data-collapsed": collapsed ? "true" : undefined,
  };
  const body = (
    <>
      {icon === undefined ? null : (
        // 라벨이 이름을 소유하므로 아이콘은 장식이다.
        <span className="louis-sidebar-nav-item__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="louis-sidebar-nav-item__label">{children}</span>
      {trailing === undefined ? null : (
        <span className="louis-sidebar-nav-item__trailing">{trailing}</span>
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

export interface SidebarNavRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * 행이 감싸는 내비 항목. 하나만 넣는다.
   *
   * **`SidebarNavItem`을 그대로 쓴다.** 다른 컴포넌트를 만들면 선택 색·높이·반경이 두 곳에서
   * 갈린다.
   */
  readonly children: ReactNode;
  /**
   * 행 안쪽 끝에 붙는 보조 액션. 배포본은 캔버스 · 컴포지션 행에 「+」 생성 버튼을 두었으나
   * 제품 `658ece13` 에서 걷었다 — 지금 이 슬롯을 쓰는 배포본 화면은 없고, DS 역량으로 남긴다.
   *
   * **행 자체는 버튼이 아니다.** 버튼 안에 버튼을 넣으면 HTML이 깨지고 키보드 순회가 무너진다 —
   * 배포본도 「+」를 두던 때 같은 이유로 행을 `<div>`로 두고 내비와 액션을 형제로 놓았다.
   */
  readonly action?: ReactNode;
  /** rail이 접혔는가. 접히면 액션이 사라진다 — 아이콘 하나 자리에 둘이 들어갈 수 없다. */
  readonly collapsed?: boolean;
  readonly ref?: Ref<HTMLDivElement>;
}

/**
 * 내비 항목 하나와 보조 액션을 한 줄에 놓는다.
 *
 * 행 전체가 하나의 히트 영역인 보통 항목과 달리, 여기서는 **두 개의 목적지가 한 줄을 나눠
 * 쓴다** — 왼쪽은 "그 화면으로", 오른쪽 액션은 "새로 만들기" 같은 보조 동작이다. 배포본의
 * 캔버스 · 컴포지션 행이 「+」로 이 형태를 썼으나 제품 `658ece13` 에서 걷혀, 지금은 쓰는 배포본
 * 화면이 없다.
 */
export function SidebarNavRow({
  children,
  action,
  collapsed = false,
  className,
  ...rest
}: SidebarNavRowProps): JSX.Element {
  return (
    <div
      {...rest}
      className={join("louis-sidebar-nav-row", className)}
      data-collapsed={collapsed ? "true" : undefined}
    >
      {children}
      {action === undefined || collapsed ? null : (
        <span className="louis-sidebar-nav-row__action">{action}</span>
      )}
    </div>
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
      className={join("louis-app-top-bar", className)}
      data-divider={divider ? "true" : undefined}
    >
      {leading === undefined ? null : (
        <span className="louis-app-top-bar__leading">{leading}</span>
      )}
      {title === undefined ? null : <span className="louis-app-top-bar__title">{title}</span>}
      {children}
      {trailing === undefined ? null : (
        <span className="louis-app-top-bar__trailing">{trailing}</span>
      )}
    </div>
  );
}

/**
 * 사이드바 맨 위의 로고 행.
 *
 * **접힘은 소비처가 소유한다.** 셸이 접혔는지 아는 것은 셸이고, 이 부품은 결과를 받는다.
 * 워드마크는 폭이 줄어들며 잘린다 — 폭이 상태이므로 layout-change lifecycle이다(DS-D-0019).
 */
export interface SidebarBrandProps extends HTMLAttributes<HTMLDivElement> {
  /** 로고 자리. 24px 글리프나 이미지가 온다. */
  readonly mark: ReactNode;
  /** 접히면 사라지는 글자. */
  readonly wordmark: ReactNode;
  readonly collapsed?: boolean;
  readonly ref?: Ref<HTMLDivElement>;
}

export function SidebarBrand({
  mark,
  wordmark,
  collapsed = false,
  className,
  ref,
  ...rest
}: SidebarBrandProps): JSX.Element {
  return (
    <div
      {...rest}
      ref={ref}
      className={["louis-sidebar-brand", className].filter(Boolean).join(" ")}
      data-collapsed={collapsed ? "true" : "false"}
    >
      <span className="louis-sidebar-brand__mark" aria-hidden="true">
        {mark}
      </span>
      <span className="louis-sidebar-brand__wordmark">{wordmark}</span>
    </div>
  );
}

/**
 * 사이드바 맨 아래에 붙는 행동 유도.
 *
 * `margin-block-start: auto`가 자리를 만들므로 **내비 항목이 몇 개든 바닥에 남는다.**
 * 접히면 라벨이 사라지고 아이콘만 남는다.
 */
export interface SidebarCtaProps extends HTMLAttributes<HTMLDivElement> {
  readonly label: ReactNode;
  /**
   * **아이콘 슬롯을 두지 않는다.** 제품의 업그레이드 버튼은 라벨 하나뿐이고, 처음에 plus를 넣은
   * 것은 제품을 읽지 않고 지어낸 것이었다(2026-08-18 정정).
   */
  readonly collapsed?: boolean;
  /**
   * 이미 그 목적지에 있을 때 켠다. 배포본은 `aria-current="page"`가 붙으면 pill을 한 단계 더
   * 뒤집는다 — SidebarNavItem과 같은 규칙이며 시각 전용 속성을 따로 두지 않는다.
   */
  readonly current?: boolean;
  readonly onActivate?: () => void;
  readonly ref?: Ref<HTMLDivElement>;
}

export function SidebarCta({
  label,
  collapsed = false,
  current = false,
  onActivate,
  className,
  ref,
  ...rest
}: SidebarCtaProps): JSX.Element {
  return (
    <div
      {...rest}
      ref={ref}
      className={["louis-sidebar-cta", className].filter(Boolean).join(" ")}
      data-collapsed={collapsed ? "true" : "false"}
    >
      <button
        type="button"
        className="louis-sidebar-cta__button"
        aria-current={current ? "page" : undefined}
        onClick={onActivate}
      >
        {/* 접히면 라벨이 54px까지 줄고 말줄임한다. **지우지 않는다** — 아이콘이 없는 버튼이라
            라벨을 지우면 접힌 레일에 아무 단서도 남지 않고, 접근 가능한 이름도 사라진다. */}
        <span className="louis-sidebar-cta__label">{label}</span>
      </button>
    </div>
  );
}
