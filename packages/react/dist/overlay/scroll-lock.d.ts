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
export declare function createScrollLock(): ScrollLock;
//# sourceMappingURL=scroll-lock.d.ts.map