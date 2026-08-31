import type { CSSProperties, JSX, ReactNode, Ref } from "react";
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

const DEFAULT_AUTO_ADVANCE_MS = 5_500;

/**
 * 자동으로 움직이는 것은 멈출 수 있어야 한다(WCAG 2.2.2).
 *
 * 제품은 멈추지 않는다. 그 부채는 옮기지 않는다 — 이 저장소는 제품의 과거 UI 부채를 공용 규범으로
 * 복사하지 않기로 되어 있다.
 */
function usePaused(root: HTMLElement | null): boolean {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (root === null) return;
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

export function BannerCarousel({
  slides,
  label,
  bleed = "boxed",
  controls = "indicator",
  autoAdvanceMs = DEFAULT_AUTO_ADVANCE_MS,
  index,
  onIndexChange,
  className,
  ref,
}: BannerCarouselProps): JSX.Element | null {
  const generatedId = useId();
  const [internalIndex, setInternalIndex] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const hovering = usePaused(root);
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
  // 움직임을 줄여 달라고 한 사람에게는 **아예 돌리지 않는다.** 느리게 돌리는 것은 답이 아니다.
  const reduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const running = autoAdvanceMs > 0 && count > 1 && !stopped && !hovering && !reduced;

  useEffect(() => {
    if (!running) return;
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

  if (count === 0) return null;

  // `pill` 배치에서만 쓰인다. 기본 배치에는 화살표가 없고 인디케이터가 직접 자리를 지정한다.
  const step = (delta: number) => goTo((activeIndex + delta + count) % count);

  return (
    <section
      ref={(node) => {
        setRoot(node);
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as { current: HTMLElement | null }).current = node;
      }}
      className={["louis-banner-carousel", className].filter(Boolean).join(" ")}
      data-bleed={bleed}
      aria-roledescription="carousel"
      aria-label={label}
    >
      {slides.map((slide, slideIndex) => {
        const active = slideIndex === activeIndex;
        return (
          <div
            key={slide.id}
            className="louis-banner-carousel__slide"
            data-active={active ? "true" : "false"}
            data-tone={slide.tone}
            // 비활성 슬라이드는 DOM에 남아야 전환이 그려진다. 대신 보조기술에서 지운다 —
            // 남겨 두면 읽히지 않아야 할 제목 셋이 한꺼번에 읽힌다.
            aria-hidden={active ? undefined : true}
            role="group"
            aria-roledescription="slide"
            aria-label={`${slideIndex + 1} / ${count}`}
            // 사진을 `background-image`에 직접 넣으면 CSS의 스크림 레이어를 통째로 덮는다.
            // 커스텀 프로퍼티를 경유해 스크림 아래 칸에만 들어가게 한다.
            style={
              slide.imageUrl
                ? ({ "--louis-banner-image": `url(${slide.imageUrl})` } as CSSProperties)
                : undefined
            }
          >
            <div className="louis-banner-carousel__content">
              {slide.wordmark ? (
                <img
                  className="louis-banner-carousel__wordmark louis-banner-carousel__stagger"
                  src={slide.wordmark.src}
                  alt={slide.wordmark.alt}
                />
              ) : null}
              <div className="louis-banner-carousel__text">
                <h2 className="louis-banner-carousel__title louis-banner-carousel__stagger">
                  {slide.title}
                </h2>
                {slide.description ? (
                  <p className="louis-banner-carousel__description louis-banner-carousel__stagger">
                    {slide.description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}

      {count > 1 ? (
        <div className="louis-banner-carousel__controls" data-controls={controls}>
          {controls === "pill" ? (
            <button
              type="button"
              className="louis-banner-carousel__arrow"
              onClick={() => step(-1)}
              aria-label="이전 배너"
            >
              <ArrowGlyph direction="start" />
            </button>
          ) : null}
          {autoAdvanceMs > 0 ? (
            <button
              type="button"
              className="louis-banner-carousel__arrow"
              // 정지 상태는 버튼이 소유한다. hover/focus 일시정지는 **의도가 아니라 부수효과**라
              // 그것으로 aria-pressed를 흔들면 스크린 리더가 커서 움직임마다 상태를 읽는다.
              aria-pressed={stopped}
              aria-label={stopped ? "배너 자동 넘김 시작" : "배너 자동 넘김 정지"}
              onClick={() => setStopped((current) => !current)}
            >
              <PlaybackGlyph stopped={stopped} />
            </button>
          ) : null}
          <div className="louis-banner-carousel__dots" role="tablist" aria-label={label}>
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                id={`${generatedId}-dot-${slideIndex}`}
                className="louis-banner-carousel__dot"
                // 폭이 상태다(DS-D-0019). 그런데 폭은 보조기술이 읽지 않으므로 `aria-selected`가
                // 함께 상태를 갖는다 — 시각과 의미가 각자 자기 축으로 말한다.
                aria-selected={slideIndex === activeIndex}
                aria-current={slideIndex === activeIndex ? "true" : undefined}
                aria-label={`${slideIndex + 1} / ${count}: ${slide.title}`}
                onClick={() => goTo(slideIndex)}
              />
            ))}
          </div>
          {controls === "pill" ? (
            <button
              type="button"
              className="louis-banner-carousel__arrow"
              onClick={() => step(1)}
              aria-label="다음 배너"
            >
              <ArrowGlyph direction="end" />
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function PlaybackGlyph({ stopped }: { readonly stopped: boolean }): JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {stopped ? (
        <path d="M5 3.5 12.5 8 5 12.5Z" />
      ) : (
        <>
          <rect x="4.5" y="3.5" width="2.5" height="9" rx="0.75" />
          <rect x="9" y="3.5" width="2.5" height="9" rx="0.75" />
        </>
      )}
    </svg>
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
