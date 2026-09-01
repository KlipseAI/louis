import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useRef, useState } from "react";
const DEFAULT_AUTO_ADVANCE_MS = 5_500;
/**
 * 자동으로 움직이는 것은 멈출 수 있어야 한다(WCAG 2.2.2).
 *
 * 제품은 멈추지 않는다. 그 부채는 옮기지 않는다 — 이 저장소는 제품의 과거 UI 부채를 공용 규범으로
 * 복사하지 않기로 되어 있다.
 */
function usePaused(root) {
    const [paused, setPaused] = useState(false);
    useEffect(() => {
        if (root === null)
            return;
        const pause = () => setPaused(true);
        const resume = () => setPaused(false);
        root.addEventListener("pointerenter", pause);
        root.addEventListener("pointerleave", resume);
        root.addEventListener("focusin", pause);
        root.addEventListener("focusout", resume);
        return () => {
            root.removeEventListener("pointerenter", pause);
            root.removeEventListener("pointerleave", resume);
            root.removeEventListener("focusin", pause);
            root.removeEventListener("focusout", resume);
        };
    }, [root]);
    return paused;
}
export function BannerCarousel({ slides, label, bleed = "boxed", controls = "indicator", autoAdvanceMs = DEFAULT_AUTO_ADVANCE_MS, index, onIndexChange, className, ref, }) {
    const generatedId = useId();
    const [internalIndex, setInternalIndex] = useState(0);
    const [stopped, setStopped] = useState(false);
    const [root, setRoot] = useState(null);
    const hovering = usePaused(root);
    const controlled = index !== undefined;
    const activeIndex = controlled ? index : internalIndex;
    // 최신 콜백을 타이머가 보게 한다. 의존성에 넣으면 렌더마다 타이머가 다시 선다.
    const changeRef = useRef(onIndexChange);
    changeRef.current = onIndexChange;
    const goTo = useCallback((next) => {
        if (!controlled)
            setInternalIndex(next);
        changeRef.current?.(next);
    }, [controlled]);
    const count = slides.length;
    // 움직임을 줄여 달라고 한 사람에게는 **아예 돌리지 않는다.** 느리게 돌리는 것은 답이 아니다.
    const reduced = typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const running = autoAdvanceMs > 0 && count > 1 && !stopped && !hovering && !reduced;
    useEffect(() => {
        if (!running)
            return;
        const timer = window.setInterval(() => {
            // 제어 여부와 무관하게 **현재 값**에서 다음을 계산해야 한다. activeIndex를 의존성에 넣으면
            // 넘길 때마다 타이머가 재시작해 간격이 들쭉날쭉해진다.
            setInternalIndex((current) => {
                const next = (current + 1) % count;
                changeRef.current?.(next);
                return next;
            });
        }, autoAdvanceMs);
        return () => window.clearInterval(timer);
    }, [autoAdvanceMs, count, running]);
    if (count === 0)
        return null;
    // `pill` 배치에서만 쓰인다. 기본 배치에는 화살표가 없고 인디케이터가 직접 자리를 지정한다.
    const step = (delta) => goTo((activeIndex + delta + count) % count);
    return (_jsxs("section", { ref: (node) => {
            setRoot(node);
            if (typeof ref === "function")
                ref(node);
            else if (ref)
                ref.current = node;
        }, className: ["louis-banner-carousel", className].filter(Boolean).join(" "), "data-bleed": bleed, "aria-roledescription": "carousel", "aria-label": label, children: [slides.map((slide, slideIndex) => {
                const active = slideIndex === activeIndex;
                return (_jsx("div", { className: "louis-banner-carousel__slide", "data-active": active ? "true" : "false", "data-tone": slide.tone, "aria-hidden": active ? undefined : true, role: "group", "aria-roledescription": "slide", "aria-label": `${slideIndex + 1} / ${count}`, 
                    // 사진을 `background-image`에 직접 넣으면 CSS의 스크림 레이어를 통째로 덮는다.
                    // 커스텀 프로퍼티를 경유해 스크림 아래 칸에만 들어가게 한다.
                    style: slide.imageUrl
                        ? { "--louis-banner-image": `url(${slide.imageUrl})` }
                        : undefined, children: _jsxs("div", { className: "louis-banner-carousel__content", children: [slide.wordmark ? (_jsx("img", { className: "louis-banner-carousel__wordmark louis-banner-carousel__stagger", src: slide.wordmark.src, alt: slide.wordmark.alt })) : null, _jsxs("div", { className: "louis-banner-carousel__text", children: [_jsx("h2", { className: "louis-banner-carousel__title louis-banner-carousel__stagger", children: slide.title }), slide.description ? (_jsx("p", { className: "louis-banner-carousel__description louis-banner-carousel__stagger", children: slide.description })) : null] })] }) }, slide.id));
            }), count > 1 ? (_jsxs("div", { className: "louis-banner-carousel__controls", "data-controls": controls, children: [controls === "pill" ? (_jsx("button", { type: "button", className: "louis-banner-carousel__arrow", onClick: () => step(-1), "aria-label": "\uC774\uC804 \uBC30\uB108", children: _jsx(ArrowGlyph, { direction: "start" }) })) : null, autoAdvanceMs > 0 ? (_jsx("button", { type: "button", className: "louis-banner-carousel__arrow", "aria-pressed": stopped, "aria-label": stopped ? "배너 자동 넘김 시작" : "배너 자동 넘김 정지", onClick: () => setStopped((current) => !current), children: _jsx(PlaybackGlyph, { stopped: stopped }) })) : null, _jsx("div", { className: "louis-banner-carousel__dots", role: "tablist", "aria-label": label, children: slides.map((slide, slideIndex) => (_jsx("button", { type: "button", role: "tab", id: `${generatedId}-dot-${slideIndex}`, className: "louis-banner-carousel__dot", "aria-selected": slideIndex === activeIndex, "aria-current": slideIndex === activeIndex ? "true" : undefined, "aria-label": `${slideIndex + 1} / ${count}: ${slide.title}`, onClick: () => goTo(slideIndex) }, slide.id))) }), controls === "pill" ? (_jsx("button", { type: "button", className: "louis-banner-carousel__arrow", onClick: () => step(1), "aria-label": "\uB2E4\uC74C \uBC30\uB108", children: _jsx(ArrowGlyph, { direction: "end" }) })) : null] })) : null] }));
}
function PlaybackGlyph({ stopped }) {
    return (_jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": "true", focusable: "false", children: stopped ? (_jsx("path", { d: "M5 3.5 12.5 8 5 12.5Z" })) : (_jsxs(_Fragment, { children: [_jsx("rect", { x: "4.5", y: "3.5", width: "2.5", height: "9", rx: "0.75" }), _jsx("rect", { x: "9", y: "3.5", width: "2.5", height: "9", rx: "0.75" })] })) }));
}
/** 화살표는 아이콘 카탈로그에 없다. 두 방향뿐이라 여기서 그린다. */
function ArrowGlyph({ direction }) {
    return (_jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false", children: _jsx("path", { d: direction === "start" ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5" }) }));
}
//# sourceMappingURL=banner-carousel.js.map