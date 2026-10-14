---
id: content-card
status: experimental
authority: normative
summary: 커버 그림과 그 밖의 제목 · 설명을 통째로 누르는 링크 카드. 블로그 글 행과 템플릿 카드입니다.
---

# Content Card

읽을 거리 하나를 커버 그림과 제목 · 설명으로 소개하고, 카드 전체를 눌러 그 글로 간다(`.louis-content-card`,
[DS-D-0088](../governance/decisions/DS-D-0088-content-card.md)). 제목이 그림 **밖**에 서는 것이 [Project Card](project-card.md) ·
[Media Card](media-card.md)(제목이 그림 위)와 다르다. 갈래는 둘 — 글 목록의 가로 행 `row` 와 격자의 세로 카드 `stack`. 짝 블록
`.louis-content-card-list` 가 두 목록의 줄 간격을 갖는다.

제품 정본은 공개 블로그 인덱스(`app/blog/page.tsx:78-176` 의 상수, `app/blog/page.tsx:221-257` 의 마크업)와 템플릿 인덱스
(`app/templates/page.tsx:77-130` 의 상수, `app/templates/page.tsx:168-210` 의 마크업)다(통합 판 `54b62a8aa`). 두 화면이 같은 해부를 각자 상수로 들고 있었다.

```html
<!-- row — 블로그. data-layout 없음 = row. DOM 은 본문이 먼저, 커버가 나중이다 -->
<ul class="louis-content-card-list">
  <li>
    <a class="louis-content-card" href="/blog/slug">
      <div class="louis-content-card__body">
        <h2 class="louis-content-card__title">글 제목</h2>
        <p class="louis-content-card__description">발췌 두 줄…</p>
        <span class="louis-content-card__meta"><time datetime="2026-10-13">2026.10.13</time></span>
      </div>
      <div class="louis-content-card__cover">
        <img class="louis-content-card__media" src="…" alt="" loading="lazy" />
      </div>
      <!-- 커버 없음: <div class="louis-content-card__cover" data-empty="true" aria-hidden="true"></div> -->
    </a>
  </li>
</ul>

<!-- stack — 템플릿 격자. 커버가 먼저다 -->
<ul class="louis-content-card-list" data-layout="grid">
  <li>
    <a class="louis-content-card" data-layout="stack" href="/templates/slug">
      <div class="louis-content-card__cover">
        <video class="louis-content-card__media" src="…" muted playsinline preload="metadata"></video>
        <span class="louis-badge louis-content-card__badge" data-surface="media" aria-label="미디어 3개">3</span>
      </div>
      <div class="louis-content-card__body">
        <h2 class="louis-content-card__title">템플릿 이름</h2>
        <p class="louis-content-card__description">설명 두 줄…</p>
      </div>
    </a>
  </li>
</ul>
```

제품은 목록을 `<div>` 로 쌓는다. 계약은 `<ul>`/`<li>` 를 권하지만 클래스는 `<div>` 에서도 같다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/content-card.css` · 실브라우저 시험 `content-card.browser.test.tsx`. React 표면은 없다 — 소비처가 클래스와 마크업 계약을 문다(DS-D-0088) |
| Figma         | `done`      | 2026-10-14 — `ContentCard` 세트(Layout `row` · `stack` × State `Default` · `Hover` = 4, TEXT `Title` · `Description` · `Meta`, BOOLEAN `HasDescription` · `HasMeta`(row) · `HasBadge`(stack, 기본 끔) · `EmptyCover`). row 720 · stack 300 은 표본 폭이다. 배지는 Badge 인스턴스의 칠 · 글자를 `media-badge` 변수로 덮었고(DS-D-0088 판단 8), 빈 커버는 랜딩 바닥 + 잉크 4% + 강조 20%(135° 휘도 마스크) 근사다. 움직임(그림 105% · 4 떠오름) · 719 접힘 · 랜딩 제목 계단 · 줄인 모션은 그리지 않는다(규칙). 기록 `content-card` 와 parity 기하 계약, 실브라우저 되재기(`content-card-geometry.browser.test.tsx`). 제품 렌더 대조는 없다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Anatomy

| 부분 | 값 |
| --- | --- |
| 카드 `.louis-content-card` | `<a href>` 하나. row — 가로 · 세로 가운데 · 사이 24 · 면 없음. stack — 세로 · 잉크 4% 면(`gray-000-alpha-04`) + 1px 선(`gray-000-alpha-08`) · 반경 16(`radius-overlay`) |
| 커버 `__cover` | 비율 상자(`--louis-content-card-ratio`). row 폭 320 · 반경 12(`radius-card`) · 16:9, stack 카드 폭 · 4:3 · 바닥 `media-stage-surface`(영상 레터박스). 빈 커버 `data-empty="true"` 는 강조 20% → 잉크 4% 그라디언트 |
| 그림 `__media` | `<img>` · `<video>`. 커버를 채운다(`object-fit: cover`) |
| 배지 `.louis-badge` + `__badge` | `data-surface="media"`. 커버 오른쪽 위 12(`space-control-md`). 면 · 글자는 [Badge](badge.md) 가 갖는다 |
| 본문 `__body` | 세로 · 사이 8(`space-control-sm`). row 는 남는 폭을 먹고 세로 가운데, stack 은 여백 18 · 18 · 20 |
| 제목 `__title` | row heading-sm medium 28 / 1.35 · 두 줄 자름, stack body-lg medium 20 / 1.5 · 자르지 않음. `fg-primary` · `text-wrap: balance` |
| 설명 `__description` | row body-md regular 16, stack body-sm regular 14. `landing-text-soft` · 두 줄 자름 |
| 메타 `__meta` | caption regular 12 · `landing-text-muted` · 위 2 더 |
| 목록 `.louis-content-card-list` | 세로 줄 · 사이 32(719 아래 40). `data-layout="grid"` 는 최소 300 트랙 · 줄 28 · 열 24 |

## Properties

React 를 만들지 않는다 — 이 마크업 계약이 공개 계약이다.

| 속성 · 요소 | 값 | 기본 | 누가 단다 |
| --- | --- | --- | --- |
| `data-layout`(카드) | `row` · `stack` | 없음 = `row` | 소비처 |
| `--louis-content-card-ratio` | CSS `aspect-ratio` | row `16 / 9` · stack `4 / 3` | 소비처(덮을 때만) |
| `data-empty="true"`(커버) | 빈 커버 그라디언트 | 없음 | 소비처 — 그림이 없을 때(`aria-hidden="true"` 함께) |
| `__description` · `__meta` · `__badge` 요소 | 생략 가능 | — | 소비처 |
| `data-layout="grid"`(목록) | 격자 | 없음 = 세로 줄 | 소비처 |

## States

| 상태 | row | stack |
| --- | --- | --- |
| 쉼 | — | 선 8% |
| 호버(호버 기기에서만) | 제목 `content-card-title-hover` · 그림 105%(320ms) | 선 16% · 4 떠오름(220ms) |
| 줄인 모션 | 색만 바뀐다 — 확대 없음 | 선만 바뀐다 — 떠오름 없음 |
| 포커스 | 전역 규칙이 소유한다([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)) | 같다 |
| 1023 아래(랜딩 제목 계단) | 제목 18 · 자간 −0.01em | 제목 18(767 아래 16) |
| 719 아래 | 그림 위 · 글 아래(`column-reverse`), 사이 12, 커버 폭 채움. 목록 줄 사이 40 | 그대로 |

움직임은 `scale` · `translate` 속성으로 건다 — 랜딩 리빌의 `transform: none` 과 다투지 않는다. 곡선은 토큰(`cubic-bezier(0.22, 1, 0.36, 1)`)이고
길이 320 · 220 은 제품 리터럴이다(DS-D-0088 판단 6).

## Content

- 제목은 한 문장. row 는 두 줄에서 자른다 — 전체 제목은 글 머리에 있다. stack 은 자르지 않는다.
- 설명은 두 줄. 없으면 요소를 뺀다(빈 `<p>` 금지).
- 메타는 날짜 하나(`<time>`). 서식(`YYYY.MM.DD`)은 소비처 몫이다.
- 커버 그림은 장식이라 `alt=""` — 링크 이름은 제목이다. 영상 커버는 소리 없이 첫 프레임(`muted playsinline preload="metadata"`).
- 배지는 숫자 하나. 보조기술에는 `aria-label` 로 무엇의 수인지 적는다.

## Accessibility

- 카드 하나 = 링크 하나. 접근 이름은 안의 글자 전부(제목 · 설명 · 날짜)가 된다 — 제목만 이름으로 하려면 소비처가 `aria-labelledby` 를 제목에 건다.
- 안에 버튼 · 링크를 두지 않는다(대화형 자손 금지). 메뉴가 필요하면 [Project Card](project-card.md) 다.
- row 의 `column-reverse` 는 시각 순서만 바꾼다 — 그림이 장식이라 읽는 순서(1.3.2)는 제목 먼저 그대로다.
- 호버 잉크는 큰 글자가 아닐 때도 4.5 를 넘는 값이다 — `contrastPairs` 에 랜딩 바닥 위 4.5 로 올렸다.
- 대비(실브라우저 실측, 바닥 `landing-page-bg`): 제목 4.5 이상(시험이 두 테마에서 잰다), 호버 제목 라이트 5.00 · 다크 5.97, 발췌 6.69 · 10.13,
  날짜 5.10 · 8.03. stack 면 위 설명 6.40 · 9.85.

## Acceptance tests

`packages/react/test/content-card.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다.

1. row — 커버 320 × 180 · 반경 12 · 카드 사이 24 · 본문 사이 8 · 메타 위 2 · 커버가 오른쪽.
2. stack — 반경 16 · 선 1 · 본문 18 / 18 / 20 · 커버 4:3 · 카드 폭 · 배지 오른쪽 위 12.
3. 719 접힘 — 375 에서 row 커버가 위 · 폭 채움 · 사이 12, 목록 줄 사이 40. 720 에서는 가로.
4. 랜딩 제목 계단 — 1024 에서 row 28 · stack 20, 1023 에서 18 · 18, 767 에서 18 · 16.
5. 비율 덮기 — `--louis-content-card-ratio: 1 / 1` 이면 row 커버가 320 × 320.
6. 격자 — `data-layout="grid"` 가 최소 300 트랙 · 줄 28 · 열 24.
7. 호버 — 제목 잉크가 `content-card-title-hover`, stack 선 16%. 호버 규칙이 `(hover: hover)` 밖에 없다.
8. 대비는 실제로 잰다 — 제목 · 호버 제목 · 발췌 · 날짜 · stack 설명, 두 테마.

`packages/react/test/content-card-geometry.browser.test.tsx` 는 기록 `figma/components.measured.json` 의 `content-card` 네 칸(Layout × State)을 코드가 만드는지 되잰다.

## Known deviations

1. **stack 테두리(8% · 호버 16%)의 그래픽 대비가 3:1 미만이다** — 카드 전체가 링크이고 이름이 글자로 서므로 경계는 식별에 필요한 그래픽이 아니다.
2. **호버 박자 320 · 220 은 motion 토큰에 없는 제품 리터럴이다**(곡선은 토큰). 제목 색 전환은 제품 180ms 대신 `control-hover` 토큰 160ms 다.
3. **제품의 450 이하 본문 16 → 14 규칙(`app/globals.css:829-833`)은 옮기지 않았다** — 제품 전체 `:root` 규칙이라 타이포 기초의 몫이다.
4. **템플릿 배지가 Badge 정본(상하 4 · regular, 높이 26)으로 접혔다** — 제품은 상하 3 · medium · 검정 56% 덮어쓰기(`app/templates/page.tsx:110-115`)였다.
5. **날짜 잉크가 40% 에서 `landing-text-muted`(64%)로, 라이트 호버 제목이 `blue-500` 에서 `blue-620` 으로** 고쳐 올라갔다(DS-D-0084 3항).
6. **제목 잉크가 제품 `gray-000`(라이트 `#000`)에서 `fg-primary` 로** — `gray-000` 직접 소비는 게이트가 막는다.

## 제품에서 발견한 것

- 랜딩 제목 계단 주석(`app/globals.css:838-841` 「heading-28: 28 → 20 → 18」)과 계산값(28 → 18 → 18)이 다르다 — `var(--type-body-20-size)` 가
  같은 규칙에서 덮인 18 을 읽는다(`app/globals.css:848-851`).
- 템플릿 카드가 두 벌이다 — 랜딩 `TemplateGrid` 는 MediaCard, `/templates` 는 이 카드다. 데이터 표가 달라 한 부품으로 모으지 않는다.
- 블로그 본문 링크도 같은 `--primary-500`(`app/globals.css:1392-1393`, 라이트 3.37)이다 — 밑줄이 있어 식별은 되지만 글자 대비는 미달이다. 이 회차 밖.
- 죽은 선언 셋 — 템플릿 호버 면 4%(`app/templates/page.tsx:92`, 쉼과 같다) · 블로그 본문 719 이하 `p-0`(`app/blog/page.tsx:151`, 쉼에 패딩이 없다) ·
  블로그 목록 위 auto-fill 주석(`app/blog/page.tsx:71-72`, 목록은 이제 세로 줄).
