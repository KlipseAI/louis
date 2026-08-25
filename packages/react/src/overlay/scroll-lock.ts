/**
 * scroll lock — 지정된 owner를 refcount로 잠그고 인라인 style을 **원래대로** 복원한다.
 *
 * dialog.md D-5: "기존 inline style을 보존하고 닫힌 뒤 복원한다."
 * 그래서 `style.overflow = ""`로 지우지 않는다. 소비자가 원래 인라인 overflow를 갖고 있었다면
 * 그 값을 되돌려야 하고, 갖고 있지 않았다면 속성 자체가 없던 상태로 돌아가야 한다. 두 경우를
 * 구분하지 않으면 "복원"이 조용히 값을 지우는 동작이 된다.
 *
 * 잠금 자체는 CSS가 표현한다(base.css의 `[data-louis-scroll-locked="true"]`). JS는 속성과
 * 복원만 소유한다 — 잠금 여부가 DOM에서 그대로 읽히므로 테스트가 상태를 직접 볼 수 있다.
 */

export interface ScrollLock {
  /** 반환된 함수가 해제다. 마지막 소유자가 놓을 때만 실제로 복원한다. */
  acquire(owner: HTMLElement): () => void;
  /** 현재 이 owner를 잠그고 있는 layer 수. 테스트와 진단용이다. */
  countFor(owner: HTMLElement): number;
}

interface LockEntry {
  count: number;
  /** 인라인 속성이 원래 있었는지. 없었다면 복원은 "속성 제거"다. */
  readonly hadInlineStyle: boolean;
  readonly previousStyle: string;
  readonly previousScrollLeft: number;
  readonly previousScrollTop: number;
}

const SCROLL_LOCK_ATTRIBUTE = "data-louis-scroll-locked";
const GUTTER_PROPERTY = "--louis-overlay-scrollbar-gutter";

/**
 * 스크롤 **위치**를 들고 있는 요소.
 *
 * `body`를 잠가도 표준 모드에서 뷰포트의 스크롤 오프셋은 `document.scrollingElement`(= `html`)에
 * 있고 `body.scrollTop`은 항상 0이다. 그래서 owner를 그대로 읽고 쓰면 0을 저장했다가 0을
 * 복원하는 no-op이 된다 — 복원하는 것처럼 보이지만 아무 일도 하지 않는다. 실측으로 확인했다.
 *
 * `overflow: hidden`은 위치를 잃지 않으므로 기본 경로에서는 이 복원이 대개 필요 없다. 필요해지는
 * 것은 잠긴 동안 코드가 스스로 스크롤을 옮긴 경우이고, 그때 정확한 대상을 쓰기 위해 남긴다.
 */
function scrollPositionOwner(owner: HTMLElement): HTMLElement {
  if (owner !== owner.ownerDocument.body) return owner;
  const scrolling = owner.ownerDocument.scrollingElement;
  return scrolling instanceof HTMLElement ? scrolling : owner;
}

export function createScrollLock(): ScrollLock {
  const entries = new Map<HTMLElement, LockEntry>();

  return {
    acquire(owner) {
      const existing = entries.get(owner);
      if (existing !== undefined) {
        existing.count += 1;
      } else {
        const scrollbarWidth = Math.max(
          0,
          owner.getBoundingClientRect().width - owner.clientWidth,
        );
        const positionOwner = scrollPositionOwner(owner);
        entries.set(owner, {
          count: 1,
          hadInlineStyle: owner.hasAttribute("style"),
          previousStyle: owner.getAttribute("style") ?? "",
          previousScrollLeft: positionOwner.scrollLeft,
          previousScrollTop: positionOwner.scrollTop,
        });
        // 폭 보정은 primitive가 직접 padding을 건드리지 않고 변수로만 알린다.
        // 어떤 요소가 그 폭을 흡수할지는 앱 레이아웃의 결정이다.
        owner.style.setProperty(GUTTER_PROPERTY, `${scrollbarWidth}px`);
        owner.setAttribute(SCROLL_LOCK_ATTRIBUTE, "true");
      }

      let released = false;
      return () => {
        if (released) return;
        released = true;
        const entry = entries.get(owner);
        if (entry === undefined) return;
        entry.count -= 1;
        if (entry.count > 0) return;
        entries.delete(owner);
        owner.removeAttribute(SCROLL_LOCK_ATTRIBUTE);
        if (entry.hadInlineStyle) {
          owner.setAttribute("style", entry.previousStyle);
        } else {
          owner.removeAttribute("style");
        }
        const positionOwner = scrollPositionOwner(owner);
        positionOwner.scrollLeft = entry.previousScrollLeft;
        positionOwner.scrollTop = entry.previousScrollTop;
      };
    },

    countFor(owner) {
      return entries.get(owner)?.count ?? 0;
    },
  };
}
