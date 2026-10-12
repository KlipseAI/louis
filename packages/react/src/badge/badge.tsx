import type { HTMLAttributes, JSX, ReactNode, Ref } from "react";

/**
 * 배지의 의미 축.
 *
 * 제품은 상태 어휘가 최소 17벌이고 화면마다 다르다. 그 어휘를 그대로 옮기면 DS가 제품의 도메인을
 * 떠안는다. 대신 **네 상태 + 중립**으로 접고, 어느 도메인 값이 어느 tone인지는 호출부가 정한다.
 */
export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

/**
 * 배지가 놓이는 밑면. 기본은 페이지 면(테마를 따르는 status 쌍)이고, `media` 는 사진 · 썸네일 위다 —
 * 면이 테마와 무관한 고정 `gray-800` 이 되고 tone 은 글자색만 바꾼다(DS-D-0083).
 */
export type BadgeSurface = "page" | "media";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly tone?: BadgeTone;
  readonly surface?: BadgeSurface;
  /** 라벨 앞 아이콘. 크기는 글자를 따라간다(`1em`). */
  readonly icon?: ReactNode;
  /**
   * 라벨 앞 점. 아이콘보다 약한 신호다.
   *
   * `icon`과 함께 쓰지 않는다 — 둘 다 두면 같은 자리에서 두 신호가 경쟁한다.
   */
  readonly dot?: boolean;
  readonly ref?: Ref<HTMLSpanElement>;
}

function join(...values: readonly (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}

/**
 * design/components/badge.md의 계약을 구현한다.
 *
 * **대화형이 아니다.** `<span>`이며 hover·focus·press 상태를 갖지 않고 44px hit target 규범의
 * 대상도 아니다. 누를 수 있는 배지가 필요하면 그것은 Button이거나 Chip이며 다른 컴포넌트다.
 *
 * **tone은 색만 바꾼다.** 색각 이상에서 tone이 전달되지 않으므로, 색이 유일한 신호가 되지 않도록
 * 라벨이 상태를 말해야 한다 — "완료"라고 쓰고 초록을 입히는 것이지 초록만으로 완료를 뜻하게
 * 하지 않는다. 그 책임은 호출부에 있고 문서가 그것을 요구한다.
 */
export function Badge({
  tone = "neutral",
  surface = "page",
  icon,
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps): JSX.Element {
  return (
    <span
      {...rest}
      className={join("louis-badge", className)}
      data-tone={tone}
      data-surface={surface === "media" ? "media" : undefined}
    >
      {icon === undefined ? null : (
        // 아이콘은 라벨이 말하는 것을 반복하는 장식이다.
        <span className="louis-badge__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {icon === undefined && dot ? <span className="louis-badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
