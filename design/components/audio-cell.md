---
id: audio-cell
status: experimental
authority: normative
summary: 노드 결과의 오디오 칸 — 재생 원 · 진행 막대 · 시간 줄.
---

# Audio Cell

노드 결과의 오디오 칸이다 — 재생 원 · 진행 막대 · 시간 줄(`.louis-audio-cell`, [DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md)).
TTS 노드와 BGM 노드가 결과 오디오를 카드 위쪽 미디어 띠에 같은 칸으로 보인다. 노드 셸의 하위 부품이 아니다 — 셸은 카드 안을 소유하지 않고, 이 칸은
슬라이더의 키 · 값 계약을 따로 갖는다. [Slider](./slider.md) 와도 다르다 — 네이티브 range 가 아니고 오디오 채널 색으로 칠한다.

| 부분 | 값 |
| --- | --- |
| 칸 | 여백 8 · 반경 16(`radius-overlay`) · 면 `node-audio-accent` 8% · 헤어라인 |
| 재생 원 | 32 원 · `node-audio-accent` · 글리프 14 `node-audio-on-accent` · hover `node-audio-accent-hover`(호버 기기만) |
| 막대 | 높이 4 · 위아래 4 · 반경 2 · 레일 `node-audio-accent` 20% · 채움 · 썸 12 는 `node-audio-accent` · 맞힘 영역 24 |
| 시간 줄 | caption regular · 줄 높이 1 · 숫자 고정폭 · `node-audio-time` · 양끝 정렬 |
| 대기 | `data-state="pending"` — 면 `node-media-pending-surface`, 게이지 `node-audio-pending-fill` 이 왼쪽부터 찬다. 찬 정도(0 ~ 1)는 소비처가 `--louis-audio-cell-pending` 으로 준다 |

```html
<div class="louis-audio-cell" style="--louis-audio-cell-progress: 0.4">
  <div class="louis-audio-cell__content">
    <button type="button" class="louis-audio-cell__play" aria-label="재생">
      <svg viewBox="0 0 24 24" aria-hidden="true">…</svg>
    </button>
    <div class="louis-audio-cell__track">
      <div class="louis-audio-cell__bar" role="slider" tabindex="0" aria-label="재생 위치"
           aria-valuemin="0" aria-valuemax="30" aria-valuenow="12" aria-valuetext="0:12 / 0:30">
        <div class="louis-audio-cell__fill"></div>
        <span class="louis-audio-cell__thumb" aria-hidden="true"></span>
      </div>
      <div class="louis-audio-cell__time">
        <span>0:12</span>
        <span>0:30</span>
      </div>
    </div>
  </div>
</div>

<!-- 대기 -->
<div class="louis-audio-cell" data-state="pending" aria-busy="true">
  <span class="louis-audio-cell__pending" aria-hidden="true"></span>
</div>
```

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/audio-cell.css`. React 표면은 없다 — 소비처(TTS · BGM 노드)가 클래스를 물면 된다 |
| Figma         | `done`      | AudioCell — State(Ready · Playing · Pending), TEXT Current · Duration. 진행률은 40% 정지 그림이다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| `data-state` | 없음 · `pending` | 결과가 있는 칸과 생성 대기 칸 |
| `--louis-audio-cell-progress` | 0 ~ 1 | 재생 위치. 채움 폭과 썸 자리를 정한다 |
| `--louis-audio-cell-pending` | 0 ~ 1 | 대기 게이지가 찬 정도. 시간은 소비처가 갖는다 |

## States

| 상태 | 그림 |
| --- | --- |
| 쉼(정지) | 재생 원에 재생 글리프, 채움이 재생 위치까지 |
| 재생 중 | 재생 원에 멈춤 글리프 — 원의 색은 같다 |
| 호버(재생 원) | `node-audio-accent-hover` — 호버 기기에서만 |
| 대기 | 내용 없이 면과 게이지만 — `aria-busy="true"` |

## Content

글자는 시간 줄 둘(현재 · 전체)뿐이고 숫자 고정폭이다. 재생 원의 이름은 지금 할 행동(「재생」 · 「일시 정지」)이고 상태에 따라 바뀐다.

## Accessibility

- 막대는 `role="slider"` 다. 값은 **초**이고 `aria-valuetext` 가 화면의 시간 줄과 같은 「0:12 / 0:30」을 읽는다 — 진행률 %만 주면 「37」로 읽혀 뜻이 없다.
- 키: ←/↓ −5초 · →/↑ +5초 · PageDown/PageUp ∓10% · Home 처음 · End 끝. 포커스를 받는 슬라이더는 키로 움직여야 한다.
- 이름은 「재생 위치」다. 「길이」는 전체 길이를 말하는 이름이라 조작 대상과 다르다.
- 포커스 링은 그리지 않는다([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)). 강제 색에서만 `base.css` 가 링을 그린다.
- 보이는 막대는 4 이지만 맞힘 영역은 24 다(`::after`).
- **Figma** 는 `AudioCell`(State `Ready` · `Playing` · `Pending`)이다.

## Acceptance tests

레시피 선언은 빌드의 저작 게이트(토큰만 · 숫자 z-index 없음 · 호버 기기 한정)가 지킨다. 실브라우저 시험(32 원 · 막대 4 · 맞힘 영역 24 ·
진행 변수가 채움 폭을 정하는가)은 Figma 부품과 함께 세운다 — 그 전까지 이 칸의 반대편은 이 문서다.
