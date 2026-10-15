---
id: avatar
status: experimental
authority: normative
summary: 사람을 나타내는 작은 원형 표식입니다.
---

# Avatar

사람을 나타내는 작은 원형 표식이다.

**제품은 이제 이 레시피의 박스를 문다(제품 앵커 `6f6282c1` 기준).** 프로필 아바타 박스 `profileImage`가
`.louis-avatar`를 달고(`Gnb.tsx:1054-1056`) 크기만 `--profile-avatar-size`로 덮으며(`:1056-1057`) 면은
투명으로 둔다(`:1058`). 기본 아바타 `UserCircleDefaultAvatar.tsx`는 **자기 크기를 갖지 않는 폴백 슬롯**이다
— `louis-avatar__fallback`에 제품 색 유틸리티만 얹고(`UserCircleDefaultAvatar.tsx:20-26`) SVG는 `currentColor` ·
`aria-hidden`이다. 이 문서가 예전에 적은 「공용 구현이 부분만 있다 — 기본 아바타 SVG 하나(28×28)만 분리돼 있고
본체는 셸 파일에 인라인」은 그 뒤 제품이 루트의 `w-14 h-14`를 걷고 박스를 LOUIS로 넘기면서 낡았다
(`Gnb.tsx:1043-1046`의 주석이 그 경위를 적는다). 크기 24·28은 제품의 `--profile-avatar-size`가 두 값이던 때
(기본 28 · ProjectHeader 슬롯 24) 그대로 옮겼다. 40(`lg`)은 설정 화면의 프로필 사진 칸이다 — 제품이 `.louis-avatar` 를 물고
크기만 `[width:40px]` · `[height:40px]` 로 덮는다(`myPageSceneStyles.ts settingsAvatarFigure`). **`--profile-avatar-size` 는 이제 한 값이다** — `profileTrigger` 한 곳이
24px로 갖고(`Gnb.tsx:1471`) 슬롯의 덮어쓰기는 걷혔다. 그래서 프로필 트리거에 맞는 칸은 `sm`이다(아래 Known
deviations). 판정은 [`product.measured.json`](../../migration/product.measured.json)이 갖는다.

## Availability

| Surface       | 상태           | 근거                                                                     |
| ------------- | -------------- | ------------------------------------------------------------------------ |
| Web           | `partial`      | public export와 실브라우저 acceptance test 10건이 두 motion context에서 각각 돈다; visual regression 없음. 제품은 박스(`.louis-avatar`)와 폴백 슬롯을 물지만 크기 · 면 · 폴백 색을 호출부에서 덮는다(위) |
| Figma         | `done`      | component set(Size). 계약이 모든 property 를 pin 하고 Fallback 을 자손으로 대조하며 **stroke·effect 0 을 요구한다** — 링이 새어 들어오면 잡힌다. 기하는 양방향이다 — `avatar.browser.test.tsx` 가 코드 쪽에서 같은 실측을 되잰다. 게시 없이 판정한다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)) |
| Documentation | `done`         | 이 문서                                                                  |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                               |

## When to use

- 사람을 **작게** 가리킬 때 — 프로필 트리거, 목록 행, 댓글 머리, 멘션.
- 이미지가 없을 수 있는 자리. 폴백이 기본 동작이다.

쓰지 않는 자리.

- 프로젝트·파일·팀 같은 **사물**의 썸네일. 그것은 Project Card의 미디어다.
- 상태나 수를 나타내는 표식. 그것은 [Badge](badge.md)다.
- **진행률을 두르는 링.** 아래 Known deviations.

## API

```tsx
<Avatar name="기세준" src={profile.avatarUrl} />

{/* 옆에 이름이 이미 적혀 있으면 장식이다 */}
<li><Avatar src={u.avatarUrl} /> <span>{u.name}</span></li>
```

## Anatomy

1. **Root** — `<span>`. 원, 면, 크기를 소유하고 접근성 이름을 갖는다.
2. **Image** — `src`가 있을 때. 원을 채운다.
3. **Fallback** — `src`가 없을 때의 글리프. 항상 장식이다.

## Properties

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `src` | string | 없음 | 없으면 폴백 글리프를 그린다 |
| `name` | string | 없음 | 접근성 이름. **생략하면 장식으로 본다** |
| `size` | `lg` \| `md` \| `sm` | `md` | 40px / 28px / 24px |

**`name`을 생략하는 것이 기본 오용이 아니다.** 목록 행이나 댓글 머리처럼 옆에 이름이 이미 적혀
있는 자리에서 아바타를 다시 읽으면 **같은 이름이 두 번 들린다.** 그 자리에서는 생략이 옳다.

## States

상태 축이 없다. 대화형이 아니고 hover/focus를 갖지 않는다 — 아바타가 버튼 안에 놓이면 **그
버튼이** 상태를 소유한다.

| state | 표현 |
| --- | --- |
| Default | 면 `color-bg-inset`, 폴백 글리프 `color-fg-tertiary` |

면은 이미지가 뜨기 전과 깨졌을 때 그대로 보인다. 그래서 빈 원이 아니라 **자리를 가진 원**이 된다.

## Interaction and responsive behavior

- 크기는 세 값 중 하나로 고정이다. 부모에 따라 늘거나 줄지 않는다 — 목록에서 행마다 크기가
  달라지면 줄이 어긋난다.
- 이미지는 `object-fit: cover`다. 비율이 맞지 않아도 원을 채운다 — 여백이 생기면 원이 깨져 보인다.

## Content

- `name`은 **표시되는 이름 그대로** 준다. "기세준의 프로필 사진"이 아니라 "기세준"이다. 역할은
  `role="img"`이 이미 말한다.

## Accessibility

- 이름이 있으면 root가 `role="img"` + `aria-label`을 갖고, **안의 `<img>`는 `alt=""`다.** 둘 다
  이름을 가지면 같은 이름이 두 번 읽힌다.
- 이름이 없으면 root가 `aria-hidden`이다. 폴백 글리프는 어느 경우에도 장식이다.
- 아바타 자신은 포커스를 받지 않는다. 누를 수 있어야 하면 버튼이나 링크로 감싼다.

## Specification

| 축 | lg | md | sm | 토큰 |
| --- | ---: | ---: | ---: | --- |
| 지름 | 40px | 28px | 24px | 리터럴 — 제품 값 채택 |
| 반경 | 999px | 999px | 999px | `radius-pill` |
| 면 | — | — | — | `color-bg-inset` |
| 폴백 글리프 | — | — | — | `color-fg-tertiary` · 원을 가득 채운다 |

**크기가 control 계단(40/32)을 따르지 않는다.** `lg` 40 이 Button `lg` 와 같은 것은 우연이다. 아바타는 컨트롤이 아니라 표식이라 나란히 서도
줄이 어긋나지 않는다 — 계단을 따를 이유가 없어 제품 값을 그대로 옮겼다. 리터럴로 둔 이유는
소비처가 이 컴포넌트 하나뿐이기 때문이며 Spinner·Slider와 같은 판정이다.

## Effects

없다. 테두리도 그림자도 링도 쓰지 않는다. 테스트가 그 셋이 0인지 확인한다.

## Implementation

- 폴백 글리프는 제품 `UserCircleDefaultAvatar.tsx` 의 그림 그대로다 — 원을 가득 채운 사람 실루엣(`user-circle-fill`,
  viewBox 20, evenodd). `currentColor` 를 물어 아바타가 놓이는 자리마다 색을 덮을 수 있다.
- `overflow: hidden`이 이미지를 원으로 자른다. 이미지에 반경을 따로 주지 않는 이유는 `cover`가
  넘치는 쪽을 잘라내기 때문이다.

## Known deviations

- **진행률 링을 소유하지 않는다.** 제품은 프로필 트리거에 링을 겹친다
  (`--profile-ring-width: 2px` · `-gap: 2px` · `-progress`). **아바타는 신원 표식이고 링은
  사용량이라 뜻이 다르다.** 흡수하면 목록·댓글·멘션의 모든 아바타가 쓰지 않을 progress API를
  갖고, 링을 아바타 밖에서 쓸 수 없게 되며, 무엇보다 실행 인계서 (1c)의 미결 판정(determinate
  진행률의 접근성 계약 — 제품 전체에 `role="progressbar"`가 1곳뿐이다)이 이 컴포넌트의 API로
  새어 들어온다. **링은 이미 별개 컴포넌트로 섰다** — `Progress` 의 `ProgressRing` 이고 접근성
  계약은 [DS-D-0022](../governance/decisions/DS-D-0022-determinate-progress-a11y.md)가 소유한다.
  Avatar 는 링을 감싸지 않는다.
- **기본 `md`(28)가 제품 프로필 트리거와 다르다.** 제품 앵커 `6f6282c1`이 모든 페이지의 프로필
  버튼을 캔버스 에디터 헤더와 같은 크기로 맞추면서 아바타가 24 한 값이 됐다(`Gnb.tsx:1471`, 그 전 기본
  28). `--profile-avatar-size`에서 옮겨 온 두 칸 중 지금 프로필 트리거에 남은 것은 `sm`뿐이다. 기본을
  `sm`으로 옮기면 크기를 적지 않은 모든 소비처가 줄어드는 breaking이라 앵커 이동에서 하지 않는다 —
  프로필 트리거를 그릴 때는 `size="sm"`을 주고 [Progress](progress.md)의 `ProgressRing`으로 감싼다 — 지름은
  `sm` 에 (링 간격 + 링 두께) × 2 가 더해진 값이고 수는 `figma/components.measured.json` 의
  `progress-ring.sizes.base.size` 가 갖는다.
- ~~**폴백 글리프가 제품과 같은 그림이 아니다.**~~ **해소됐다(2026-09-26).** 저장소가 따로 그린 작은 사람 그림을
  제품 그림(원을 채운 사람 실루엣)으로 바꿨다. 보드의 설정 화면 아바타를 인스턴스로 옮기려다 드러났다 — 그림이 다르면
  인스턴스가 제품과 다르게 보인다.
- **폴백 글리프 색이 제품과 반대다.** LOUIS 는 `color-fg-tertiary`(라이트 #777D89 · 다크 #BCC0C9)이고 제품은
  라이트 `palette-gray-400`(#BCC0C9) · 다크 `palette-gray-600`(#777D89)이다 — 제품이 유틸리티로 덮는다
  (`UserCircleDefaultAvatar.tsx:16-18` 가 그 사유를 적는다). 이 색을 옮기는 것은 토큰 선택이라 이 변경의 범위가 아니다.
- **설정 화면 프로필 사진 칸은 bespoke 다.** 크기는 `lg` 가 받지만 제품이 그 자리에서 면을 `gray-000` 12% 로, 폴백 글리프를
  78%(40 안의 31.2)로 덮는다(`myPageSceneStyles.ts settingsAvatarFigure` · `settingsAvatarFigureDefault`). 그래서 보드는 그 자리를
  인스턴스로 바꾸지 않는다 — 판정은 `scripts/lib/figma-component-substitution.mjs` 의 제외 목록(`avatar-settings`)이 갖는다.
- **이니셜 폴백이 없다.** 제품에는 1벌 있다(앵커 `6f6282c1`) — 관리자 사용자 상세 머리의 아바타가 `.louis-avatar`
  루트에 이름 첫 글자를 직접 담는다. 레시피는 `AdminClient.tsx:263-273`(크기 · 글자 크기 · 관리자 전용 면과 글자색을
  호출부가 덮는다), 글자는 `AdminClient.tsx@54b62a8a:1083`(사용자 이름 첫 글자를 대문자로, 없으면 「?」), 렌더는
  `AdminClient.tsx:1640` 이다. 제품 주석이 「이니셜 글자가 곧 폴백이라 별도 슬롯 없이 루트에 담는다」고 적는다.
  소비처가 내부 관리자 화면 한 곳이라 이번 범위가 아니다 — DS `Avatar` 는 `children` 을 받지 않으므로 그 자리는
  컴포넌트가 아니라 레시피 클래스를 직접 문다.
- **그룹(겹친 아바타)이 없다.** 제품에 0벌이다.

## Acceptance tests

1. lg/md/sm의 지름이 `components.measured.json`과 같고 원이다.
2. Default의 면과 폴백 글리프 색이 states 표와 같다.
3. `src`가 없으면 폴백 글리프를 그리고 이미지는 없다.
4. `src`가 있으면 이미지를 그리고 `object-fit: cover`이며 폴백은 없다.
5. `name`이 있으면 root가 `role="img"` + `aria-label`을 갖고 **안의 `<img>`는 `alt=""`다.**
6. `name`이 없으면 root가 `aria-hidden`이고 role·label을 갖지 않는다.
7. **테두리·그림자·`::after` 층이 모두 없다** — 링이 새어 들어오면 여기서 걸린다.
8. 조합 모두 자동 접근성 검사에 위반이 없다.
