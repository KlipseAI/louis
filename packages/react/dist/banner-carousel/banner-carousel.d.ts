import type { JSX, Ref } from "react";
/**
 * 사진의 밝기. **테마가 아니다.**
 *
 * 밝은 사진 위에서는 글자가 어두워야 하므로 `bright`가 어두운 전경색을 고른다. 무엇으로
 * 판정할지는 소비처가 갖는다 — 제품은 이미지를 런타임에 샘플링하고 DS는 결과를 받기만 한다.
 */
export type BannerTone = "bright" | "dark";
export interface BannerCarouselSlide {
    readonly id: string;
    /** 배경 이미지 URL. 없으면 면만 남는다. */
    readonly imageUrl?: string;
    readonly tone: BannerTone;
    readonly title: string;
    readonly description?: string;
    /** 톤에 맞춰 소비처가 고른 워드마크. 두 벌을 넣고 CSS로 감추지 않는다 — 하나만 싣는다. */
    readonly wordmark?: {
        readonly src: string;
        readonly alt: string;
    };
}
/** 컨테이너가 반경을 갖는지. `full`은 화면 폭까지 각지게 흘린다. */
export type BannerCarouselBleed = "boxed" | "full";
/**
 * 하단 컨트롤의 배치.
 *
 * `indicator`(기본)는 하단 **가운데**에 인디케이터만 둔다 — 배너 본문이 가운데 정렬이라
 * 컨트롤도 같은 축을 본다. `pill`은 우하단 글래스 알약 안에 이전·다음 화살표까지 넣는 옛 배치로,
 * 화살표가 필요한 소비처가 쓴다.
 *
 * **자동 넘김 정지 버튼은 배치와 무관하다.** 움직이는 것은 멈출 수 있어야 하고(WCAG 2.2.2)
 * 그것은 장식이 아니라 계약이라, `autoAdvanceMs > 0`이면 두 배치 모두에서 그려진다.
 */
export type BannerCarouselControls = "indicator" | "pill";
export interface BannerCarouselProps {
    readonly slides: readonly BannerCarouselSlide[];
    /**
     * 캐러셀 전체의 이름. **필수다.**
     *
     * 배너는 제목이 슬라이드마다 바뀌므로, 영역 자체의 이름이 없으면 스크린 리더에서
     * "무엇의 1/3인지" 알 수 없다.
     */
    readonly label: string;
    /** `boxed`는 카드 반경, `full`은 각지게. 기본은 `boxed`. */
    readonly bleed?: BannerCarouselBleed;
    /** 하단 컨트롤 배치. 기본은 `indicator`(하단 가운데, 화살표 없음). */
    readonly controls?: BannerCarouselControls;
    /** 자동 넘김 간격(ms). `0`이면 넘기지 않는다. */
    readonly autoAdvanceMs?: number;
    readonly index?: number;
    readonly onIndexChange?: (index: number) => void;
    readonly className?: string;
    readonly ref?: Ref<HTMLElement>;
}
export declare function BannerCarousel({ slides, label, bleed, controls, autoAdvanceMs, index, onIndexChange, className, ref, }: BannerCarouselProps): JSX.Element | null;
//# sourceMappingURL=banner-carousel.d.ts.map