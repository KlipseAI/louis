// Timeline Footer 시험 두 벌(timeline-footer · timeline-footer-geometry)이 함께 쓰는 클래스 마크업 — design/components/timeline-footer.md 의 예시와 같다.
import type { JSX } from "react";

type Item = { readonly label: string; readonly soon?: boolean; readonly note?: string };
const TRACKS: readonly { readonly tone: string; readonly title: string; readonly items: readonly Item[] }[] = [
  { tone: "product", title: "프로덕트", items: [{ label: "모델" }, { label: "문서", note: "↗" }, { label: "가격" }] },
  { tone: "resources", title: "리소스", items: [{ label: "블로그" }, { label: "뉴스룸", soon: true, note: "공개 예정" }, { label: "앰버서더", soon: true, note: "공개 예정" }] },
  { tone: "social", title: "소셜", items: [{ label: "인스타그램", note: "↗" }, { label: "스레드", note: "↗" }, { label: "유튜브", note: "↗" }] },
  { tone: "trust", title: "신뢰", items: [{ label: "문의" }, { label: "개인정보처리방침" }, { label: "서비스 이용약관" }] },
];

export function TimelineFooterMarkup({ lead = false }: { readonly lead?: boolean }): JSX.Element {
  return (
    <div style={{ paddingBlockStart: 200 }}>
      <footer className="louis-timeline-footer" data-theme="dark" data-testid="footer">
        {lead ? <div className="louis-timeline-footer__lead" aria-hidden="true" data-testid="lead" /> : null}
        <div className="louis-timeline-footer__bar" data-testid="bar">
          <div className="louis-timeline-footer__brand" data-testid="brand">
            <svg className="louis-timeline-footer__wordmark" viewBox="0 0 65 24" role="img" aria-label="Klipse" data-testid="wordmark">
              <rect width="65" height="24" />
            </svg>
            <p className="louis-timeline-footer__tagline" data-testid="tagline">
              AI 영상 제작의 모든 순간을 하나의 워크스페이스로.
            </p>
          </div>
          <div className="louis-timeline-footer__social" data-testid="social">
            <a className="louis-timeline-footer__social-link" href="#instagram" aria-label="인스타그램" data-testid="social-link">
              <svg width="20" height="20" aria-hidden="true" />
            </a>
            <a className="louis-timeline-footer__social-link" href="#youtube" aria-label="유튜브">
              <svg width="20" height="20" aria-hidden="true" />
            </a>
          </div>
        </div>
        <nav className="louis-timeline-footer__timeline" aria-label="프로덕트" data-testid="timeline">
          <div className="louis-timeline-footer__ruler-head" aria-hidden="true" data-testid="ruler-head">
            <span>00:00:08</span>
          </div>
          <div className="louis-timeline-footer__ruler" aria-hidden="true" data-testid="ruler">
            {[0, 1, 2, 3].map((index) => (
              <span key={index} className="louis-timeline-footer__ruler-label" style={{ left: `${index * 60}px` }} data-testid={`ruler-label-${index}`}>
                00:0{index}
              </span>
            ))}
          </div>
          {TRACKS.map((track) => (
            <div key={track.tone} className="louis-timeline-footer__track" data-tone={track.tone}>
              <h2 className="louis-timeline-footer__track-head" data-testid={`head-${track.tone}`}>
                <svg className="louis-timeline-footer__track-icon" viewBox="0 0 24 24" aria-hidden="true" />
                <span className="louis-timeline-footer__track-name" data-testid={`name-${track.tone}`}>
                  {track.title}
                </span>
              </h2>
              <ul className="louis-timeline-footer__lane" data-testid={`lane-${track.tone}`}>
                {track.items.map((item, index) => (
                  <li key={item.label} style={{ display: "contents" }}>
                    {item.soon ? (
                      <span className="louis-timeline-footer__clip" aria-disabled="true" data-testid={`clip-${track.tone}-${index}`}>
                        <span className="louis-timeline-footer__clip-text">{item.label}</span>
                        <span className="louis-timeline-footer__clip-note">{item.note}</span>
                      </span>
                    ) : (
                      <a className="louis-timeline-footer__clip" href={`#${track.tone}-${index}`} data-testid={`clip-${track.tone}-${index}`}>
                        <span className="louis-timeline-footer__clip-text">{item.label}</span>
                        {item.note ? (
                          <span className="louis-timeline-footer__clip-note" aria-hidden="true" data-testid={`note-${track.tone}-${index}`}>
                            {item.note}
                          </span>
                        ) : null}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="louis-timeline-footer__playhead" aria-hidden="true" data-testid="playhead">
            <span className="louis-timeline-footer__timecode" data-testid="timecode">
              00:08
            </span>
          </div>
        </nav>
        <div className="louis-timeline-footer__status" data-testid="status">
          <ul className="louis-timeline-footer__biz" data-testid="biz">
            <li>
              <span className="louis-timeline-footer__biz-label" data-testid="biz-label">
                상호명
              </span>
              <span data-testid="biz-value">(주)스팩스페이스</span>
            </li>
            <li>
              <span className="louis-timeline-footer__biz-label">대표자명</span>
              염민호
            </li>
          </ul>
          <p className="louis-timeline-footer__copyright" data-testid="copyright">
            © SFACSPACE 2026. All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
