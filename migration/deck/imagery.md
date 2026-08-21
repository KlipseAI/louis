# 이미지 · 그래픽 · 브랜드 자산

원천: `DESIGN_SYSTEM.md` 7절, `apps/web/public/`.

## 로고 · 심볼

| 자산 | 경로 | 언제 |
| --- | --- | --- |
| 전체 로고 (라이트 배경) | `public/klipse-light.svg` | 밝은 면 위 |
| 전체 로고 (다크 배경) | `public/klipse-dark.svg` | 어두운 면 위 |
| 워드마크만 | `public/klipse-wordmark-text-dark.svg` | 로고 폭이 부족할 때 |
| 심볼 원본 | `public/symbol.png` | favicon · 앱 아이콘 생성 기준 |
| 평면 심볼 | `components/ui/BrandSymbolMark.tsx` | `fill="currentColor"` — CSS `color` 만으로 톤 제어 |
| 풋터·auth 배경 | `public/footer-logo-bg.svg` | auth brandPanel, footer |

- **배경 밝기에 따라 자산을 바꾼다.** 로고 자체의 색을 고쳐 쓰지 않는다.
  랜딩 GNB 는 스크롤 위치에 따라 `klipse-light.svg` ↔ `klipse-dark.svg` 를 자동 스왑한다.
- **auth 브랜드 패널에서는 그라디언트 큐브 심볼을 쓰지 않는다.** 평면 마크(`BrandSymbolMark`)를 `--gray-000` 톤으로 쓴다. 이건 의도된 선택이다.
- 로고 높이: 앱 사이드바 28px, 랜딩 GNB 24px.

## 이미지

- 배경·히어로 이미지는 `public/images/hero/*`, 기능 스테이지는 `public/images/capabilities/stages/*`.
- 웹용은 **webp** 를 기본으로 한다(`hero-main-bg.webp`, `stage-00~03.webp`).
- 화면 캡처를 문서·장표에 넣을 때 **비율을 바꾸지 않는다.** 자르되 늘이지 않는다.
  제품 목업 판형이 16:9 이므로 그대로 얹으면 맞는다.
- 이미지 위에 얹는 텍스트·컨트롤의 전경은 `content/on-light` 처럼 **테마와 무관한 고정 토큰**을 쓴다.
  이미지는 테마를 따라 바뀌지 않기 때문이다.

## 아이콘

- 소스는 **lucide**. UI 아이콘 SVG 는 `public/icons/*.svg`.
- 선 두께 = **글리프 크기 ÷ 16** (16px → 1px).
- 아이콘 색은 `content/*` 역할을 쓴다.
- **아이콘 래퍼 프레임에 흰색 배경을 두지 않는다.** 임포트 잔재이며 다크 면에서 흰 사각형으로 드러난다.
- 코드에서 참조되지 않는 legacy SVG 는 남기지 않는다.

## 하지 않는 것

- 로고·심볼을 늘이거나 기울이거나 그림자를 넣지 않는다.
- 브랜드 블루(`primary-500 #0088FF`)와 auth 패널 블루(`#0093FF`)는 **다른 값**이다. 섞어 쓰지 않는다.
- 팔레트에 없는 색으로 그래픽을 만들지 않는다. 필요하면 역할을 먼저 추가한다.
