/**
 * modal isolation — topmost modal 밖을 `inert`로 만들되 branch subtree는 면제한다.
 *
 * 이 파일의 두 실패는 서로를 가린다.
 *
 * - 너무 넓게 걸면: Dialog 안에서 연 Popover가 별도 host에 있으므로 함께 죽는다.
 *   증상은 "열리지만 선택되지 않음" — 규범이 차단급 회귀로 지정한 바로 그것이다(F12, W-7).
 * - 너무 좁게 걸면: 배경이 살아 있어 modal 격리가 깨진다(D-4).
 *
 * 그래서 면제 판정을 "요소 일치"가 아니라 "**포함 관계**"로 한다. 면제 대상이 어느 형제 root
 * 안에 있으면 그 root 전체를 건너뛴다. non-modal overlay host가 정확히 이 경우다.
 *
 * `inert`는 네이티브 속성이라 pointer·keyboard·accessibility tree 세 축을 한 번에 막는다.
 * `aria-hidden`이나 `pointer-events: none`을 조합해 흉내 내지 않는다 — 세 축 중 하나가 반드시
 * 새고, 어느 축이 샜는지는 테스트가 셋을 모두 보지 않는 한 드러나지 않는다.
 */
export interface InertController {
    /**
     * `container`의 자식 중 `keep`을 포함하지 않는 것 전부에 inert를 건다.
     * 반환된 함수가 복원이며, 원래 inert였던 요소는 그대로 둔다.
     */
    isolate(container: Element, keep: readonly Element[]): () => void;
    /** 닫히는 subtree 자체를 inert로 만든다. 남은 focusable child를 즉시 제거한다. */
    markSubtree(node: HTMLElement): () => void;
}
export declare function createInertController(): InertController;
//# sourceMappingURL=inert-controller.d.ts.map