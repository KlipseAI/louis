import type { JSX, ReactNode, Ref } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

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
  readonly wordmark?: { readonly src: string; readonly alt: string };
}

/** 컨테이너가 반경을 갖는지. `full`은 화면 폭까지 각지게 흘린다. */
export type BannerCarouselBleed = "boxed" | "full";

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
  /** 자동 넘김 간격(ms). `0`이면 넘기지 않는다. */
  readonly autoAdvanceMs?: number;
  readonly index?: number;
  readonly onIndexChange?: (index: number) => void;
  readonly className?: string;
  readonly ref?: Ref<HTMLElement>;
}

const DEFAULT_AUTO_ADVANCE_MS = 5_500;

export function BannerCarousel({
  slides,
  label,
  bleed = "boxed",
  autoAdvanceMs = DEFAULT_AUTO_ADVANCE_MS,
  index,
  onIndexChange,
  className,
  ref,
}: BannerCarouselProps): JSX.Element | null {
  const generatedId = useId();
  const [internalIndex, setInternalIndex] = useState(0);
  const controlled = index !== undefined;
  const activeIndex = controlled ? index : internalIndex;

  // 최신 콜백을 타이머가 보게 한다. 의존성에 넣으면 렌더마다 타이머가 다시 선다.
  const changeRef = useRef(onIndexChange);
  changeRef.current = onIndexChange;

  const goTo = useCallback(
    (next: number) => {
      if (!controlled) setInternalIndex(next);
      changeRef.current?.(next);
    },
    [controlled],
  );

  const count = slides.length;
  useEffect(() => {
    if (autoAdvanceMs <= 0 || count <= 1) return;
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
  }, [autoAdvanceMs, count]);

  if (count === 0) return null;

  const step = (delta: number) => goTo((activeIndex + delta + count) % count);

  return (
    <section
      ref={ref}
      className={["kds-banner-carousel", className].filter(Boolean).join(" ")}
      data-bleed={bleed}
      aria-roledescription="carousel"
      aria-label={label}
    >
      {slides.map((slide, slideIndex) => {
        const active = slideIndex === activeIndex;
        return (
          <div
            key={slide.id}
            className="kds-banner-carousel__slide"
            data-active={active ? "true" : "false"}
            data-tone={slide.tone}
            // 비활성 슬라이드는 DOM에 남아야 전환이 그려진다. 대신 보조기술에서 지운다 —
            // 남겨 두면 읽히지 않아야 할 제목 셋이 한꺼번에 읽힌다.
            aria-hidden={active ? undefined : true}
            role="group"
            aria-roledescription="slide"
            aria-label={`${slideIndex + 1} / ${count}`}
            style={slide.imageUrl ? { backgroundImage: `url(${slide.imageUrl})` } : undefined}
          >
            <div className="kds-banner-carousel__content">
              {slide.wordmark ? (
                <img
                  className="kds-banner-carousel__wordmark kds-banner-carousel__stagger"
                  src={slide.wordmark.src}
                  alt={slide.wordmark.alt}
                />
              ) : null}
              <div className="kds-banner-carousel__text">
                <h2 className="kds-banner-carousel__title kds-banner-carousel__stagger">
                  {slide.title}
                </h2>
                {slide.description ? (
                  <p className="kds-banner-carousel__description kds-banner-carousel__stagger">
                    {slide.description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}

      {count > 1 ? (
        <div className="kds-banner-carousel__controls">
          <button
            type="button"
            className="kds-banner-carousel__arrow"
            onClick={() => step(-1)}
            aria-label="이전 배너"
          >
            <ArrowGlyph direction="start" />
          </button>
          <div className="kds-banner-carousel__dots" role="tablist" aria-label={label}>
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                id={`${generatedId}-dot-${slideIndex}`}
                className="kds-banner-carousel__dot"
                // 폭이 상태다(DS-D-0019). 그런데 폭은 보조기술이 읽지 않으므로 `aria-selected`가
                // 함께 상태를 갖는다 — 시각과 의미가 각자 자기 축으로 말한다.
                aria-selected={slideIndex === activeIndex}
                aria-current={slideIndex === activeIndex ? "true" : undefined}
                aria-label={`${slideIndex + 1} / ${count}: ${slide.title}`}
                onClick={() => goTo(slideIndex)}
              />
            ))}
          </div>
          <button
            type="button"
            className="kds-banner-carousel__arrow"
            onClick={() => step(1)}
            aria-label="다음 배너"
          >
            <ArrowGlyph direction="end" />
          </button>
        </div>
      ) : null}
    </section>
  );
}

/** 화살표는 아이콘 카탈로그에 없다. 두 방향뿐이라 여기서 그린다. */
function ArrowGlyph({ direction }: { readonly direction: "start" | "end" }): JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={direction === "start" ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"} />
    </svg>
  );
}
