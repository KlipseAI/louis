/**
 * **제품 SVG 글리프 ↔ LOUIS 아이콘 조인표 (손으로 읽은 판정).**
 *
 * ## 왜 이 표가 있는가
 *
 * 보드 원장은 2026-09-02 까지 `<svg>` 자리를 전부 `blocked` 로 세었다. 사유는 「LOUIS 아이콘
 * 31종이 컴포넌트로 서 있는데 draw payload 가 아이콘의 정체를 버려서 어느 것인지 고를 수 없다」
 * 였고, 그 진단의 절반은 맞았다 — 정체를 버린 곳이 있었다. 다만 그 자리는 축약(`slim`)이 아니라
 * **트리 변환**이다: `<path>` 는 배경도 테두리도 글자도 없어서 `toFigmaTreeSpec` 이
 * 「스스로 그릴 것이 없는 노드」로 보아 지운다(`droppedEmpty`). 측정 fixture 에는 `d` 가
 * **그대로 살아 있다**(`vectorAttributes` 가 담는다). 그래서 이 축은 측정을 고칠 것이 아니라
 * 잇기만 하면 되고, 서명을 잇는 일은 `glyphSignature`(figma-tree-spec.mjs)가 한다.
 *
 * ## 이 표가 하는 일 — 이름 붙이기, 그리고 그 이름의 임자
 *
 * 서명은 기계가 뜨지만 **「이 그림은 caret-left 다」는 사람이 읽어야 안다.** 경로 데이터 비교로는
 * 닿지 않는다: LOUIS 아이콘 31종은 `<line>`·`<polyline>`·`<circle>`·`<rect>` 로 그려져 있고
 * (`packages/react/src/icons/svg/*.svg`) 제품 글리프는 전부 `<path d=…>` 다. 두 벌 사이에
 * **문자열이 같은 기하는 0 건**이다. 이름으로 잇는 길도 없다 — 측정 트리에 아이콘 이름·클래스·
 * `aria-label` 이 있는 자리는 svg 가 아니라 그것을 감싼 버튼이고, 버튼 라벨은 「이전 배너」처럼
 * 자리의 이름이지 그림의 이름이 아니다. 크기+획으로 가르는 길은 더 나쁘다 — 24 상자 1.8px 획인
 * 글리프가 여덟 중 넷이라 서로 구분되지 않는다.
 *
 * 그래서 `LOUIS_PRIMITIVE_EXCLUSIONS` 와 같은 결로 간다: **판정은 자동(서명 완전 일치), 이름과
 * 사유는 손으로 읽은 것을 인용.** 서명이 표에 없으면 생성기가 던진다 — 판정 없이 넘어가는 길을
 * 두면 새로 들어온 아이콘이 조용히 이름 없는 상자가 된다.
 *
 * ## 왜 `replaceable` 이 하나도 없는가 (이 표의 실제 결론)
 *
 * 여덟 서명 중 **LOUIS 아이콘을 그대로 무는 것은 0 건이다.** 둘(chevron-left/right)은 LOUIS 에
 * 같은 뜻의 아이콘이 있지만 제품이 그것을 물지 않고 제 글리프를 인라인으로 그린다 — 정본은
 * 24 상자 1.5 획인데(DS-D-0021 의 `rescale` 규칙) 제품은 24 상자 1.8 획이고 팔 길이도 다르다
 * (LOUIS `caret-left` 는 꼭짓점 x=7.5, 제품은 x=9). 그 자리를 Figma 에서만 인스턴스로 바꾸면
 * Figma 가 제품보다 더 「정본」이 되어 두 축이 어긋난다 — DS-D-0043·DS-D-0046 이 `bespoke` 를
 * 연 것과 **정확히 같은 상황**이므로 같은 낱말을 쓴다. 나머지 여섯은 LOUIS 31종에 대응 그림이
 * 아예 없다 → `missing`.
 *
 * 이 갈림은 DS-D-0038 이 이미 예고했다: 「제품 글리프의 상자와 획이 갈려 있다」 ·
 * 「`.glyph/` 계열 중 무엇을 `icon/` 정본으로 승격하는가가 정해지지 않았다」. 이 표는 그 미결을
 * 푸는 것이 아니라 **어느 자리가 그 미결에 매달려 있는지를 센다.**
 *
 * ## 이름을 짐작하지 않는다
 *
 * `louis` 칸은 **되읽기(`figma/readback.json` 의 `icons`)에 실재하는 이름**만 적는다. 게이트가
 * 그 사전과 대조하므로 없는 이름은 통과하지 못한다. 확신이 없으면 `null` 이다 — 틀린 아이콘을
 * 놓는 것이 이름 없는 도형으로 두는 것보다 나쁘다. 그래서 「비슷하다」로는 적지 않았다:
 * 제품의 왼쪽 화살표(`arrow-left`)는 LOUIS `arrow-up` 을 90° 돌린 모양에 가깝지만 LOUIS 는
 * 방향을 variant 축으로 두지 않고 별개 아이콘으로 세운다(caret-left/right/down 이 각각 있다).
 * 회전은 그림을 고르는 일이 아니라 새로 만드는 일이라 여기서 하지 않는다.
 */

/**
 * 각 항목:
 *   id        payload 에 실리는 짧은 이름(`slim()` 의 `v`). Figma 노드 이름에도 그대로 쓴다.
 *   signature `glyphSignature()` 가 뜬 측정 서명. **완전 일치로만** 조인한다.
 *   louis     대응하는 LOUIS 아이콘 이름(`figma/readback.json` 의 `icons` 키) 또는 null.
 *   verdict   보드 원장이 쓸 판정. bespoke(대응은 있는데 제품이 안 문다) · missing(대응이 없다).
 *   why       사유. 보드 원장이 그대로 인용하므로 여기 한 벌만 있다.
 */
export const PRODUCT_GLYPHS = Object.freeze([
  {
    id: "sidebar-panel",
    signature:
      "0 0 32 32|path(d=M4 12.5333C4 9.54667 4 8.05333 4.58133 6.912C5.09265 5.90851 5.90851 " +
      "5.09265 6.912 4.58133C8.05333 4 9.54667 4 12.5333 4H19.4667C22.4533 4 23.9467 4 25.088 " +
      "4.58133C26.0915 5.09265 26.9073 5.90851 27.4187 6.912C28 8.05333 28 9.54667 28 12.5333V19.4667C28 " +
      "22.4533 28 23.9467 27.4187 25.088C26.9073 26.0915 26.0915 26.9073 25.088 27.4187C23.9467 28 " +
      "22.4533 28 19.4667 28H12.5333C9.54667 28 8.05333 28 6.912 27.4187C5.90851 26.9073 5.09265 " +
      "26.0915 4.58133 25.088C4 23.9467 4 22.4533 4 19.4667V12.5333Z)",
    louis: null,
    verdict: "missing",
    why:
      "사이드바를 접고 여는 버튼(`aria-label` 이 「Collapse sidebar」·「Open navigation menu」)의 " +
      "글리프 — 32 상자에 모서리를 둥글린 사각 하나다. LOUIS 아이콘 31종에 패널·사이드바 계열 " +
      "그림이 없다(`house`·`folder`·`graph` 가 가장 가깝지만 다른 그림이다). 세워야 할 것은 " +
      "새 아이콘이지 기존 아이콘의 축이 아니다.",
  },
  {
    id: "arrow-left",
    signature: "0 0 24 24|path(d=M19 12H5M5 12L11 6M5 12L11 18)",
    louis: null,
    verdict: "missing",
    why:
      "뒤로 가기 버튼(`aria-label` 이 「Back to subscription」·「Highlight」)의 왼쪽 화살표 — " +
      "선 하나에 화살촉이 붙은 그림이다. LOUIS 31종의 화살표는 `arrow-up` 하나뿐이고, 이 저장소는 " +
      "방향을 variant 축으로 두지 않고 별개 아이콘으로 세운다(`caret-left`·`caret-right`·" +
      "`caret-down` 이 각각 있다 — DS-D-0021). `arrow-up` 을 돌려 놓는 것은 있는 그림을 고르는 " +
      "일이 아니라 없는 그림을 만드는 일이므로 여기서 하지 않는다.",
  },
  {
    id: "chevron-left",
    signature: "0 0 24 24|path(d=M15 18L9 12L15 6)",
    louis: "icon/caret-left",
    verdict: "bespoke",
    why:
      "배너 캐러셀의 「이전」 화살표(`aria-label` 이 「Previous banner」). LOUIS 에 같은 뜻의 " +
      "`icon/caret-left` 가 서 있지만 **제품이 그것을 물지 않는다** — 제품은 인라인 `<path>` 로 " +
      "제 글리프를 그리고, 측정된 획이 1.8px 다(`/archive` desktop `body.1.0.0.1.0.0.1.1.0.0` 의 " +
      "`strokeWidth`). 정본은 24 상자에 1.5 획이고(DS-D-0021 의 `rescale` 규칙) 꼭짓점도 " +
      "x=7.5 대 x=9 로 다르다. Figma 에서만 정본 아이콘을 심으면 Figma 가 제품보다 더 「정본」이 " +
      "되어 두 축이 어긋난다(DS-D-0043·DS-D-0046). 이 칸은 제품 글리프가 정본으로 승격되면 " +
      "열린다 — DS-D-0038 이 미결로 남겨 둔 그 판정이다.",
  },
  {
    id: "chevron-right",
    signature: "0 0 24 24|path(d=M9 6L15 12L9 18)",
    louis: "icon/caret-right",
    verdict: "bespoke",
    why:
      "배너 캐러셀의 「다음」 화살표(`aria-label` 이 「Next banner」). `chevron-left` 와 같은 " +
      "자리·같은 근거다 — LOUIS `icon/caret-right` 가 있지만 제품은 24 상자 1.8 획의 인라인 " +
      "글리프를 그린다. 승격 판정(DS-D-0038)이 나야 열린다.",
  },
  {
    id: "chevron-down-10",
    signature: "0 0 10 10|path(d=M2.5 4l2.5 2.5L7.5 4)",
    louis: "icon/caret-down",
    verdict: "bespoke",
    why:
      "`/subscription` 크레딧 사용 내역의 「Sort」 드롭다운 트리거가 여는 꺾쇠(`aria-label` 이 " +
      "「Sort」, 라벨이 「Newest first」). **제품 5a67d692 에서 새로 생긴 자리다** — 옛 앵커 " +
      "ae8fd627 의 같은 `CustomDropdown` 에는 `caretIcon` 이 없어 기본 꺾쇠가 나왔고, 이제 " +
      "`<ToolbarChevronDown size={10} strokeScreenPx={1.4} />` 를 명시로 넘긴다 " +
      "(SubscriptionScene.tsx:1118-1123). LOUIS 에 같은 뜻의 `icon/caret-down` 이 서 있지만 " +
      "**제품이 그것을 물지 않는다** — 정본은 24 상자이고 제품 글리프는 10 상자에 1.4px 획이다. " +
      "제품 자신이 그 값을 「드롭다운 꺾쇠 두께 정본(HighlightScene 테마 셀렉트)과 같은 " +
      "10px · 1.4px 스트로크」라고 적어 두었고, 실제로 두 자리가 같은 `d` 를 쓴다 " +
      "(HighlightScene.tsx:985 · nodeToolbarGlyphs.tsx:66). `chevron-left`·`chevron-right` 와 " +
      "같은 갈림이라 같은 낱말을 쓴다 — Figma 에서만 정본 아이콘을 심으면 Figma 가 제품보다 더 " +
      "「정본」이 된다(DS-D-0043·DS-D-0046). 승격 판정(DS-D-0038)이 나야 열린다.",
  },
  {
    id: "user-circle-fill",
    signature:
      "0 0 20 20|path(d=M10 0C4.477 0 0 4.477 0 10C0 15.523 4.477 20 10 20C15.523 20 20 15.523 " +
      "20 10C20 4.477 15.523 0 10 0ZM6.5 7.5C6.5 7.04037 6.59053 6.58525 6.76642 6.16061C6.94231 " +
      "5.73597 7.20012 5.35013 7.52513 5.02513C7.85013 4.70012 8.23597 4.44231 8.66061 " +
      "4.26642C9.08525 4.09053 9.54037 4 10 4C10.4596 4 10.9148 4.09053 11.3394 4.26642C11.764 " +
      "4.44231 12.1499 4.70012 12.4749 5.02513C12.7999 5.35013 13.0577 5.73597 13.2336 " +
      "6.16061C13.4095 6.58525 13.5 7.04037 13.5 7.5C13.5 8.42826 13.1313 9.3185 12.4749 " +
      "9.97487C11.8185 10.6313 10.9283 11 10 11C9.07174 11 8.1815 10.6313 7.52513 9.97487C6.86875 " +
      "9.3185 6.5 8.42826 6.5 7.5ZM16.258 14.984C15.5092 15.9253 14.5575 16.6855 13.4739 " +
      "17.2077C12.3904 17.7299 11.2029 18.0008 10 18C8.79715 18.0008 7.60965 17.7299 6.52607 " +
      "17.2077C5.44249 16.6855 4.49081 15.9253 3.742 14.984C5.363 13.821 7.575 13 10 13C12.425 " +
      "13 14.637 13.821 16.258 14.984Z fill-rule=evenodd clip-rule=evenodd)",
    louis: null,
    verdict: "missing",
    why:
      "프로필 사진이 없을 때 나오는 아바타 대체 글리프 — 채워진 원 안의 사람 실루엣이다(선이 " +
      "아니라 면으로 그려진 유일한 글리프다). LOUIS 31종에 사람 그림은 `user-sound` 하나뿐이고 " +
      "그것은 사람 옆에 소리 파형이 붙은 다른 아이콘이다. 감싸는 원은 `Avatar` 컴포넌트가 이미 " +
      "소유하므로, 세워야 할 것은 그 안에 들어갈 대체 글리프다.",
  },
  {
    id: "monitor",
    // 2026-09-30 — 측정기가 폭이나 높이가 0 인 선(받침 · 화면 가름선 · 목)을 싣게 되어 서명에 선 셋이 들어왔다(옛 서명은 둥근 사각 하나).
    signature:
      "0 0 14 14|path(d=M2.625 10.5L11.375 10.5C11.8582 10.5 12.25 10.1082 12.25 9.625V3.5C12.25 " +
      "3.01675 11.8582 2.625 11.375 2.625L2.625 2.625C2.14175 2.625 1.75 3.01675 1.75 3.5V9.625C1.75 " +
      "10.1082 2.14175 10.5 2.625 10.5Z)|path(d=M8.75 12.25H5.25)|path(d=M1.75 8.3125H12.25)|path(d=M7 10.5V12.25)",
    louis: null,
    verdict: "missing",
    why:
      "`/settings` 테마 토글의 「System」 칸 글리프 — 14 상자에 가로로 누운 둥근 사각(모니터)에 가름선 · 목 · 받침 선이 붙었다. " +
      "LOUIS 에 가장 가까운 것은 `monitor-arrow-up` 인데 그것은 모니터 «위에 위쪽 화살표가 얹힌» 업로드 아이콘이라 다른 그림이다. " +
      "화살표를 지우는 것은 있는 그림을 고르는 일이 아니다. (LOUIS 에 지금 `icon/desktop` 이 있다 — 판정을 다시 볼 일이다.)",
  },
  {
    id: "moon",
    signature:
      "0 0 14 14|path(d=M5.9123 1.53613C5.63727 2.44617 5.61426 3.41377 5.84573 4.33585C6.0772 " +
      "5.25793 6.55448 6.09994 7.22672 6.77218C7.89896 7.44442 8.74097 7.9217 9.66305 " +
      "8.15317C10.5851 8.38464 11.5527 8.36164 12.4628 8.0866C12.1989 8.95405 11.715 9.73839 " +
      "11.058 10.3632C10.401 10.9881 9.59333 11.4321 8.71374 11.6521C7.83415 11.8721 6.91258 " +
      "11.8605 6.03878 11.6185C5.16499 11.3766 4.36875 10.9124 3.72763 10.2713C3.08651 9.63015 " +
      "2.62235 8.83392 2.38037 7.96012C2.13839 7.08633 2.12683 6.16475 2.34681 5.28516C2.5668 " +
      "4.40557 3.01084 3.59795 3.63568 2.94094C4.26051 2.28394 5.04485 1.79996 5.9123 1.53613Z)",
    louis: null,
    verdict: "missing",
    why:
      "`/settings` 테마 토글의 「Dark」 칸 글리프 — 초승달이다. 해(`sun-with-rays`)와 같은 이유로 LOUIS 에 " +
      "대응이 없다. 셋(monitor·sun·moon)은 한 토글의 세 칸이라 함께 서야 하는 묶음이다.",
  },
  // ── 2026-09-29 — 세션 원장(허브) · 공개 원장(약관 · 문의 · 요금 · 템플릿 · 블로그)으로 들어온 글리프. 자리는 측정 트리의 버튼 라벨 · 주변 글자로 읽었다.
  {
    id: "sparkle-fill-256",
    signature: "0 0 256 256|path(d=M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z)",
    louis: null,
    verdict: "missing",
    why: "하이라이트 허브의 「Generate」 버튼 앞 반짝임(Phosphor Sparkle 채움, 256 상자). LOUIS 31종에 반짝임 계열이 없다.",
  },
  {
    id: "chevron-left-lucide",
    signature: "0 0 24 24|path(d=M15 18l-6-6 6-6)",
    louis: "icon/caret-left",
    verdict: "bespoke",
    why: "약관 · 개인정보처리방침 머리의 「Back」 버튼 화살(lucide chevron-left, 상대 좌표 표기). 뜻은 LOUIS `caret-left` 와 같지만 제품이 제 글리프를 인라인으로 그린다 — 위 `chevron-left` 와 같은 판정이다.",
  },
  {
    id: "mail",
    signature: "0 0 24 24|path(d=m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7)|rect(rx=2 x=2 y=4 width=20 height=16)",
    louis: null,
    verdict: "missing",
    why: "문의 화면 안내 칸의 편지(lucide mail) — 「이메일로 답한다」 줄. LOUIS 31종에 편지 그림이 없다.",
  },
  {
    id: "clock",
    signature: "0 0 24 24|circle(cx=12 cy=12 r=10)|path(d=M12 6v6h4)",
    louis: null,
    verdict: "missing",
    why: "문의 화면 안내 칸의 시계(lucide clock) — 답변 시간 줄. LOUIS 31종에 시계가 없다.",
  },
  {
    id: "chevron-down-lucide",
    signature: "0 0 24 24|path(d=m6 9 6 6 6-6)",
    louis: "icon/caret-down",
    verdict: "bespoke",
    why: "문의 유형 선택 버튼(`aria-label` 「Inquiry type」, 「Bug report」)의 아래 화살(lucide chevron-down, 12). 뜻은 LOUIS `caret-down` 과 같지만 제품이 제 글리프를 그린다.",
  },
  {
    id: "image-attach",
    signature: "0 0 24 24|path(d=M3 9.4C3 7.16 3 6.04 3.436 5.184C3.81949 4.43139 4.43139 3.81949 5.184 3.436C6.04 3 7.16 3 9.4 3H14.6C16.84 3 17.96 3 18.816 3.436C19.5686 3.81949 20.1805 4.43139 20.564 5.184C21 6.04 21 7.16 21 9.4V14.6C21 16.84 21 17.96 20.564 18.816C20.1805 19.5686 19.5686 20.1805 18.816 20.564C17.96 21 16.84 21 14.6 21H9.4C7.16 21 6.04 21 5.184 20.564C4.43139 20.1805 3.81949 19.5686 3.436 18.816C3 17.96 3 16.84 3 14.6V9.4Z)|path(d=M20.927 9.99C14.317 9.082 8.617 13.99 9 20.5M6.5 8C6.5 8.53043 6.71071 9.03914 7.08579 9.41421C7.46086 9.78929 7.96957 10 8.5 10C9.03043 10 9.53914 9.78929 9.91421 9.41421C10.2893 9.03914 10.5 8.53043 10.5 8C10.5 7.46957 10.2893 6.96086 9.91421 6.58579C9.53914 6.21071 9.03043 6 8.5 6C7.96957 6 7.46086 6.21071 7.08579 6.58579C6.71071 6.96086 6.5 7.46957 6.5 8Z)|path(d=M3 13.0659C5.78 12.6809 8.275 14.0239 9.624 16.1659)",
    louis: "icon/image",
    verdict: "bespoke",
    why: "문의 화면 「Attach images」 버튼의 그림(둥근 사각 · 해 · 능선). 뜻은 LOUIS `image` 와 같지만 기하가 다르고 제품이 인라인으로 그린다.",
  },
  {
    id: "shield-check",
    signature: "0 0 24 24|path(d=M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z)|path(d=m9 12 2 2 4-4)",
    louis: null,
    verdict: "missing",
    why: "문의 폼의 개인정보 안내(「Please leave out passwords…」) 앞 방패(lucide shield-check). LOUIS 31종에 방패가 없다.",
  },
  {
    id: "send",
    signature: "0 0 24 24|path(d=M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z)|path(d=m21.854 2.147-10.94 10.939)",
    louis: null,
    verdict: "missing",
    why: "문의 폼 보내기 버튼의 종이비행기(lucide send). LOUIS 31종에 보내기 그림이 없다.",
  },
  {
    id: "klipse-wordmark-footer",
    signature: "0 0 73 28|path(d=M0 21.746V0.782227H3.70631V9.84531H3.85109L11.4953 0.782227H16.1861L7.55739 10.7429L16.4467 21.746H11.698L3.88004 11.8722H3.70631V21.746H0Z)|path(d=M17.3676 21.746V0.782227H20.9001V21.746H17.3676Z)|path(d=M23.066 21.7456V6.80455H26.5986V21.7456H23.066ZM24.8323 4.28542C23.6017 4.2999 22.6606 3.37332 22.6606 2.14271C22.6606 0.926577 23.6017 0.0144778 24.8323 0C26.0629 0.0144778 27.004 0.926577 27.004 2.14271C27.004 3.37332 26.0629 4.2999 24.8323 4.28542Z)|path(d=M28.7644 28.0002V6.80479H32.297V8.9475H32.4418C33.3973 7.2536 34.9464 6.39941 36.9878 6.39941C41.0995 6.39941 44.024 9.78721 44.024 14.2753C44.024 18.7634 41.0995 22.1512 36.9878 22.1512C34.9464 22.1512 33.3973 21.297 32.4418 19.6031H32.297V28.0002H28.7644ZM36.2928 18.8792C38.7396 18.8648 40.4335 16.9537 40.4335 14.2753C40.4335 11.5969 38.7396 9.68587 36.2928 9.67139C33.9185 9.68587 32.1956 11.568 32.1812 14.2753C32.1956 16.9827 33.9185 18.8648 36.2928 18.8792Z)|path(d=M50.5622 22.1512C48.1444 22.1512 46.0596 21.2681 44.6263 19.6031L46.827 17.4604C47.9562 18.6476 49.0565 19.1398 50.6201 19.1398C52.3285 19.1398 53.2985 18.4883 53.284 17.4025C53.2985 16.4904 52.6615 16.0706 50.6491 15.5783L49.8962 15.3756C46.7111 14.6228 45.1331 13.1895 45.1475 11.0613C45.1331 8.38287 47.6088 6.39941 50.9097 6.39941C53.0669 6.39941 55.0648 7.28256 56.4981 8.83168L54.3264 10.9744C53.342 9.93199 52.2416 9.41079 50.9097 9.41079C49.4764 9.41079 48.5209 10.0333 48.5353 10.9744C48.5209 11.6838 49.0276 12.0168 50.678 12.4222L51.4598 12.6249C55.0648 13.4935 56.7008 14.9558 56.7008 17.3157C56.7008 20.1822 54.2251 22.1512 50.5622 22.1512Z)|path(d=M65.3816 22.1512C60.6474 22.1512 57.3754 18.7924 57.361 14.2753C57.3754 9.70034 60.6474 6.39941 65.0921 6.39941C69.5368 6.39941 72.606 9.70034 72.5916 14.2753C72.606 14.6662 72.5771 15.0571 72.5337 15.4335H60.9804C61.3134 17.6921 63.0797 19.1398 65.4106 19.1398C67.119 19.1398 68.3496 18.3436 68.9721 17.0261L72.0704 18.2422C70.8832 20.6311 68.5523 22.1512 65.3816 22.1512ZM61.0673 12.5669H68.9142C68.7115 10.7717 67.2203 9.41079 65.0921 9.41079C63.0652 9.41079 61.5306 10.6559 61.0673 12.5669Z)",
    louis: null,
    verdict: "missing",
    why: "공개 페이지 푸터의 Klipse 워드마크(`aria-label` 「Klipse」, 73×28 인라인 SVG). 아이콘이 아니라 로고다 — 자산 축의 로고 컴포넌트와 잇는 일은 여기서 하지 않는다.",
  },
  {
    id: "instagram-logo-256",
    signature: "0 0 256 256|path(d=M176,32H80A48.05,48.05,0,0,0,32,80v96a48.05,48.05,0,0,0,48,48h96a48.05,48.05,0,0,0,48-48V80A48.05,48.05,0,0,0,176,32ZM128,168a40,40,0,1,1,40-40A40,40,0,0,1,128,168Zm56-96a12,12,0,1,1,12-12A12,12,0,0,1,184,72Zm-32,56a24,24,0,1,1-24-24A24,24,0,0,1,152,128Z)",
    louis: null,
    verdict: "missing",
    why: "공개 페이지 푸터의 인스타그램 링크(`aria-label` 「Instagram」, Phosphor InstagramLogo 채움). 브랜드 로고라 LOUIS 아이콘 축의 몫이 아니다.",
  },
  {
    id: "youtube-logo",
    signature: "0 0 24 24|path(d=M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.546 15.568V8.432L15.818 12l-6.272 3.568z)",
    louis: null,
    verdict: "missing",
    why: "공개 페이지 푸터의 유튜브 링크(`aria-label` 「YouTube」, simple-icons YouTube). 브랜드 로고라 LOUIS 아이콘 축의 몫이 아니다.",
  },
  {
    id: "lightning-fill-256",
    signature: "0 0 256 256|path(d=M213.85,125.46l-112,120a8,8,0,0,1-13.69-7l14.66-73.33L45.19,143.49a8,8,0,0,1-3-13l112-120a8,8,0,0,1,13.69,7L153.18,90.9l57.63,21.61a8,8,0,0,1,3,12.95Z)",
    louis: null,
    verdict: "missing",
    why: "요금 화면 크레딧 충전 카드(「Bronze」 · 「₩ 4,900」)의 번개(Phosphor Lightning 채움). LOUIS 31종에 번개가 없다.",
  },
  {
    id: "check-stroke",
    signature: "0 0 24 24|path(d=M5 12.5L10 17.5L19 7)",
    louis: null,
    verdict: "missing",
    why: "요금 화면 요금제 기능 목록의 포함 표시(`aria-label` 「included」, 선 체크 하나). LOUIS 에는 원 안의 체크(`check-circle`)뿐이라 같은 그림이 없다.",
  },
  {
    id: "plus-lines",
    signature: "0 0 24 24|path(d=M3.75 12H20.25)|path(d=M12 3.75V20.25)",
    louis: "icon/plus",
    verdict: "bespoke",
    why: "허브의 「New Canvas」 · 「New Composition」 버튼 앞 더하기(제품 `node-canvas/primitives.tsx` PlusIcon — 가로선 · 세로선 path 둘, 획 2). 뜻은 LOUIS `plus` 와 같지만 제품이 제 글리프를 그린다. 두 선은 상자의 한 변이 0 이라 2026-09-29 전 측정기가 버려 서명이 비었다.",
  },
  // 선 도형을 싣게 된 측정기(2026-09-29)로 잰 원장의 서명. 옛 서명(선이 빠진 `globe` · `sun`)은 인증 · 로그아웃 원장을 다시 잴 때까지 남기고,
  // 다시 잰 뒤 옛 항목을 걷는다(그 원장들에서 옛 서명이 사라진다).
  {
    id: "globe-with-equator",
    signature: "0 0 24 24|circle(cx=12 cy=12 r=9)|path(d=M3 12h18)|ellipse(cx=12 cy=12 rx=3.5 ry=9)",
    louis: "icon/globe",
    verdict: "bespoke",
    why: "공개 페이지 푸터의 언어 선택(8곳)과 `/aws/signup` 언어 버튼의 지구본 — 제품 `GlobeIcon.tsx` (`:19-21`)의 원(r 9) · 적도(`M3 12h18`) · 자오선 타원(rx 3.5 · ry 9), 획 1.5. 측정기가 높이 0 인 적도 선을 싣게 되어 서명에 그 선이 들어왔다(옛 `globe` 항목은 선 없는 서명이라 2026-09-30 에 걷었다). LOUIS `icon/globe` 와 기하가 같지만 제품이 제 컴포넌트를 인라인으로 그린다 — chevron 과 같은 `bespoke` 다.",
  },
  {
    id: "sun-with-rays",
    signature: "0 0 14 14|path(d=M7 2.1875V0.875)|path(d=M7 10.0625C8.69137 10.0625 10.0625 8.69137 10.0625 7C10.0625 5.30863 8.69137 3.9375 7 3.9375C5.30863 3.9375 3.9375 5.30863 3.9375 7C3.9375 8.69137 5.30863 10.0625 7 10.0625Z)|path(d=M3.5 3.5L2.625 2.625)|path(d=M3.5 10.5L2.625 11.375)|path(d=M10.5 3.5L11.375 2.625)|path(d=M10.5 10.5L11.375 11.375)|path(d=M2.1875 7H0.875)|path(d=M7 11.8125V13.125)|path(d=M11.8125 7H13.125)",
    louis: null,
    verdict: "missing",
    why: "테마 토글 「Light」 칸의 해(공개 페이지 푸터 8곳 · `/settings`) — 가운데 원에 광선 여덟이다. 가로 · 세로 광선(폭이나 높이가 0 인 선)이 측정에 들어와 서명이 길어졌다(옛 `sun` 항목은 대각선 넷만 든 서명이라 2026-09-30 에 걷었다). 판정은 옛 항목대로 `missing` 이다 — 다만 LOUIS 에 지금 `icon/sun` · `icon/moon` 이 있으므로 `bespoke` 로 다시 볼 일이다(인계서).",
  },
  // ── 2026-09-30 — 세션 원장의 부스 체험(행사 없음).
  {
    id: "menu-lines",
    signature: "0 0 24 24|path(d=M4 7h16)|path(d=M4 12h16)|path(d=M4 17h16)",
    louis: null,
    verdict: "missing",
    why: "부스 체험(`/creative-media`) 머리글의 메뉴 버튼 — 가로선 셋(`components/creative-media/CreativeMediaClient.tsx:1095`). 폭이 있고 높이가 0 인 선이라 측정기가 선 도형을 싣게 된 뒤에야 서명이 섰다. LOUIS 에 목록 · 햄버거 그림이 없다.",
  },
  // ── 2026-09-30 — 공개 원장의 랜딩(`/`).
  {
    id: "text-t-32",
    signature: "0 0 32 32|path(d=M5.3335 9.33301V5.33301H26.6668V9.33301M16.0002 5.33301V26.6663M12.0002 26.6663H20.0002)",
    louis: "icon/text",
    verdict: "bespoke",
    why: "랜딩 개요의 노드 캔버스 목업 — 텍스트 노드의 「T」 글리프(`components/scenes/create/node-canvas-v2/icons/TextIcon.tsx`, 32 상자). LOUIS `icon/text` 와 뜻은 같지만 제품이 제 인라인 그림을 그린다.",
  },
  {
    id: "trash-lucide",
    signature: "0 0 24 24|path(d=M3 6h18)|path(d=M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2)|path(d=M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6)|path(d=M10 11v6)|path(d=M14 11v6)",
    louis: "icon/trash-simple",
    verdict: "bespoke",
    why: "랜딩 개요의 노드 캔버스 목업 — 노드 도구 막대의 삭제(`components/scenes/create/node-canvas-v2/lib/nodeToolbarGlyphs.tsx`, lucide 모양 휴지통). LOUIS `icon/trash-simple` 과 뜻은 같지만 뚜껑 · 안쪽 선이 있는 다른 그림이다.",
  },
  // **편집기 화면 셋의 글리프 41(2026-10-07).** 노드캔버스 편집기 · 영상 편집기 · 하이라이트 완료를 자리표시 시드로 재며 드러났다.
  // 출처 · 대응 · 사유는 제품 원문(a4125565)을 읽어 붙였다(조사 워크플로 name-editor-glyphs, 번호로 서명과 짝지었다 — 손으로 옮기지 않았다).
  {
    id: "cloud-check-32",
    signature: "0 0 32 32|path(d=M9.99918 16C9.99918 14.0222 10.5857 12.0888 11.6845 10.4443C12.7833 8.79981 14.3451 7.51809 16.1723 6.76121C17.9996 6.00433 20.0103 5.8063 21.9501 6.19215C23.8899 6.578 25.6717 7.53041 27.0702 8.92894C28.4688 10.3275 29.4212 12.1093 29.807 14.0491C30.1929 15.9889 29.9949 17.9996 29.238 19.8268C28.4811 21.6541 27.1994 23.2159 25.5549 24.3147C23.9104 25.4135 21.977 26 19.9992 26H8.99918C8.00663 25.9988 7.02568 25.7865 6.12144 25.3772C5.2172 24.968 4.41033 24.3711 3.75437 23.6262C3.09841 22.8813 2.60837 22.0054 2.31675 21.0566C2.02514 20.1079 1.93862 19.108 2.06294 18.1232C2.18726 17.1385 2.51957 16.1915 3.03783 15.345C3.55609 14.4985 4.24845 13.7719 5.06896 13.2134C5.88946 12.6549 6.81936 12.2772 7.79695 12.1055C8.77454 11.9338 9.77746 11.972 10.7392 12.2175)|path(d=M15 17L18 20L24 14)",
    louis: "icon/cloud-check",
    verdict: "bespoke",
    why: "노드캔버스 GNB의 프로젝트 저장 버튼(`aria-label` 「messages.create.save」, `components/navigation/ProjectSaveCloudGlyph.tsx`의 `CloudCheckSvg`)이 32 viewBox·획 2로 구름+체크를 직접 그린다. 같은 의미의 LOUIS `icon/cloud-check`(Phosphor regular)가 이미 있다. (출처 apps/web/components/navigation/ProjectSaveCloudGlyph.tsx:32)",
  },
  {
    id: "video-camera-32",
    signature: "0 0 32 32|path(d=M20.5 13L27.3295 9.586C27.5581 9.47175 27.8122 9.41782 28.0675 9.42932C28.3228 9.44082 28.571 9.51737 28.7884 9.65171C29.0058 9.78605 29.1853 9.97371 29.3099 10.1969C29.4344 10.4201 29.4999 10.6714 29.5 10.927V21.073C29.4999 21.3286 29.4344 21.5799 29.3099 21.8031C29.1853 22.0263 29.0058 22.214 28.7884 22.3483C28.571 22.4826 28.3228 22.5592 28.0675 22.5707C27.8122 22.5822 27.5581 22.5282 27.3295 22.414L20.5 19)|path(d=M5.5 25H17.5C18.2956 25 19.0587 24.6839 19.6213 24.1213C20.1839 23.5587 20.5 22.7956 20.5 22V10C20.5 9.20435 20.1839 8.44129 19.6213 7.87868C19.0587 7.31607 18.2956 7 17.5 7H5.5C4.70435 7 3.94129 7.31607 3.37868 7.87868C2.81607 8.44129 2.5 9.20435 2.5 10V22C2.5 22.7956 2.81607 23.5587 3.37868 24.1213C3.94129 24.6839 4.70435 25 5.5 25Z)",
    louis: null,
    verdict: "missing",
    why: "노드캔버스의 비디오 노드 제목·사이드 버튼·레이어 패널 행·빈 비디오 자리표시(52px)가 쓰는 비디오 카메라 글리프다(`node-canvas-v2/icons/VideoCameraIcon.tsx`, `/public/icons/video.svg`와 같은 패스). LOUIS의 `icon/video-stack`은 영상 모음(갤러리) 의미라 단일 비디오 카메라 아이콘은 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/icons/VideoCameraIcon.tsx:40)",
  },
  {
    id: "align-left-simple-start-frame",
    signature: "0 0 32 32|path(d=M4 7V25)|path(d=M28 11H9C8.44772 11 8 11.4477 8 12V20C8 20.5523 8.44772 21 9 21H28C28.5523 21 29 20.5523 29 20V12C29 11.4477 28.5523 11 28 11Z)",
    louis: null,
    verdict: "missing",
    why: "이미지 노드 헤더에서 「시작 프레임」(`tNC.sideButtonsV2.startFrame`) 제목 앞에 붙는 세로축+왼쪽 정렬 막대 글리프다(`node-canvas-v2/icons/AlignLeftSimpleIcon.tsx`, `ImageNode.tsx`·`NodeSideButtons.tsx`에서 사용). LOUIS 세트에 정렬·시작 프레임 의미의 아이콘이 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/icons/AlignLeftSimpleIcon.tsx:27)",
  },
  {
    id: "align-right-simple-end-frame",
    signature: "0 0 32 32|path(d=M28 7V25)|path(d=M23 11H4C3.44772 11 3 11.4477 3 12V20C3 20.5523 3.44772 21 4 21H23C23.5523 21 24 20.5523 24 20V12C24 11.4477 23.5523 11 23 11Z)",
    louis: null,
    verdict: "missing",
    why: "이미지 노드 헤더에서 「끝 프레임」(`tNC.sideButtonsV2.endFrame`) 제목 앞에 붙는, 시작 프레임 글리프를 좌우 대칭한 세로축+막대 글리프다(`node-canvas-v2/icons/AlignRightSimpleIcon.tsx`). LOUIS 세트에 정렬·끝 프레임 의미의 아이콘이 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/icons/AlignRightSimpleIcon.tsx:27)",
  },
  {
    id: "volume-2-lucide",
    signature: "0 0 24 24|path(d=M16 8.99807C16.6491 9.86356 17 10.9162 17 11.9981C17 13.0799 16.6491 14.1326 16 14.9981M19.364 18.3621C20.1997 17.5263 20.8627 16.5342 21.315 15.4423C21.7673 14.3503 22.0001 13.18 22.0001 11.9981C22.0001 10.8162 21.7673 9.64584 21.315 8.5539C20.8627 7.46196 20.1997 6.4698 19.364 5.63407M11 4.70007C10.9998 4.56079 10.9583 4.42468 10.8809 4.30893C10.8034 4.19318 10.6934 4.10298 10.5647 4.0497C10.436 3.99643 10.2944 3.98247 10.1577 4.00958C10.0211 4.0367 9.89559 4.10368 9.797 4.20207L6.413 7.58507C6.2824 7.71645 6.12703 7.8206 5.95589 7.8915C5.78475 7.96239 5.60124 7.99862 5.416 7.99808H3C2.73478 7.99808 2.48043 8.10343 2.29289 8.29097C2.10536 8.4785 2 8.73286 2 8.99808V14.9981C2 15.2633 2.10536 15.5176 2.29289 15.7052C2.48043 15.8927 2.73478 15.9981 3 15.9981H5.416C5.60124 15.9975 5.78475 16.0338 5.95589 16.1047C6.12703 16.1755 6.2824 16.2797 6.413 16.4111L9.796 19.7951C9.8946 19.8939 10.0203 19.9612 10.1572 19.9885C10.2941 20.0157 10.436 20.0018 10.5649 19.9483C10.6939 19.8949 10.804 19.8044 10.8815 19.6883C10.959 19.5721 11.0002 19.4357 11 19.2961V4.70007Z)",
    louis: null,
    verdict: "missing",
    why: "비디오 노드 메타 툴바의 소리 켜짐 표시(`VideoNode.tsx`의 `IconSpeakerHigh`, 11px)와 비디오 편집기 인스펙터·타임라인의 볼륨 아이콘(`videoEditParts/volumeIcons.tsx`의 `VolumeOnIcon`, 14px)이 Lucide `volume-2` 패스를 인라인으로 그린다. LOUIS의 `icon/user-sound`는 화자·내레이션 의미라 볼륨(스피커) 아이콘은 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoNode.tsx:903)",
  },
  {
    id: "canvas-dot-grid-background",
    signature: "|rect(x=0 y=0 width=100% height=100%)",
    louis: null,
    verdict: "missing",
    why: "아이콘이 아니라 노드캔버스 전체(1920×1080, 402×874)를 덮는 React Flow `<Background variant=Dots gap=24 size=2>`의 패턴 채움 사각형이다(`node-canvas-v2/components/CanvasBackground.tsx`). 캔버스 배경 패턴이므로 LOUIS 아이콘 대응 대상이 아니다. (출처 apps/web/components/scenes/create/node-canvas-v2/components/CanvasBackground.tsx:15)",
  },
  {
    id: "sidebar-panel-toggle-32",
    signature: "0 0 32 32|path(d=M12 4.66667V27.3333)|path(d=M4 12.5333C4 9.54667 4 8.05333 4.58133 6.912C5.09265 5.90851 5.90851 5.09265 6.912 4.58133C8.05333 4 9.54667 4 12.5333 4H19.4667C22.4533 4 23.9467 4 25.088 4.58133C26.0915 5.09265 26.9073 5.90851 27.4187 6.912C28 8.05333 28 9.54667 28 12.5333V19.4667C28 22.4533 28 23.9467 27.4187 25.088C26.9073 26.0915 26.0915 26.9073 25.088 27.4187C23.9467 28 22.4533 28 19.4667 28H12.5333C9.54667 28 8.05333 28 6.912 27.4187C5.90851 26.9073 5.09265 26.0915 4.58133 25.088C4 23.9467 4 22.4533 4 19.4667V12.5333Z)",
    louis: null,
    verdict: "missing",
    why: "노드캔버스 레이어 패널의 접기/펼치기 버튼(`aria-label` `L.collapseAria`/`L.expandAria`, `NodeLayersPanel.tsx`의 `SidebarToggleIcon`)이 둥근 사각+세로 구분선 패널 글리프를 그리며, 대시보드 GNB 사이드바 토글(`Gnb.tsx:5261`)도 같은 패스다. LOUIS 세트에 사이드바·패널 토글 아이콘이 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/components/NodeLayersPanel.tsx:389)",
  },
  {
    id: "magnifying-glass-32",
    signature: "0 0 32 32|circle(cx=14 cy=14 r=10)|path(d=M21.0703 21.0703L28.0004 28.0004)",
    louis: "icon/magnifying-glass",
    verdict: "bespoke",
    why: "노드 캔버스 레이어 패널의 검색 입력 앞 돋보기(`aria-label` 「레이어 검색」, `components/scenes/create/node-canvas-v2/components/NodeLayersPanel.tsx:752` 에서 `MagnifyingGlassIcon` 을 쓴다)로, 32 격자 원과 대각선 손잡이를 제품이 따로 그린다. LOUIS 에 같은 뜻의 `icon/magnifying-glass` 가 있다. (출처 apps/web/components/scenes/create/node-canvas-v2/icons/MagnifyingGlassIcon.tsx:40)",
  },
  {
    id: "info-circle-32",
    signature: "0 0 32 32|path(d=M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z)|path(d=M15 15C15.2652 15 15.5196 15.1054 15.7071 15.2929C15.8946 15.4804 16 15.7348 16 16V21C16 21.2652 16.1054 21.5196 16.2929 21.7071C16.4804 21.8946 16.7348 22 17 22)|path(d=M15.5 12C16.3284 12 17 11.3284 17 10.5C17 9.67157 16.3284 9 15.5 9C14.6716 9 14 9.67157 14 10.5C14 11.3284 14.6716 12 15.5 12Z)",
    louis: "icon/info",
    verdict: "bespoke",
    why: "노드 캔버스 툴바 오른쪽의 도움말 토글 버튼(`aria-label` 「캔버스 도움말」, `components/scenes/create/node-canvas-v2/index.tsx:11631`)이 쓰는 `InfoCircleIcon` 으로, 원 안에 i 를 32 격자로 직접 그린다. LOUIS 에 같은 뜻의 `icon/info` 가 있다. (출처 apps/web/components/navigation/InfoCircleIcon.tsx:21)",
  },
  {
    id: "arrow-back-rotated-arrow-right",
    signature: "0 0 24 24|path(d=M3.75 12H20.25)|path(d=M13.5 5.25L20.25 12L13.5 18.75)",
    louis: "icon/arrow-right",
    verdict: "bespoke",
    why: "편집기 상단 GNB 의 뒤로 가기 버튼(`aria-label` 「Back to Canvas」, `components/navigation/Gnb.tsx`)으로, 오른쪽 화살표 패스를 인라인으로 그린 뒤 `rotate(180deg)` 로 뒤집어 왼쪽을 가리킨다. 글리프 자체는 LOUIS `icon/arrow-right` 와 같은 화살표라 회전으로 대체할 수 있다. (출처 apps/web/components/navigation/Gnb.tsx:4183)",
  },
  {
    id: "text-t-add-subtitle",
    signature: "0 0 24 24|path(d=M5 6h14M12 6v13M9 19h6)",
    louis: "icon/text",
    verdict: "bespoke",
    why: "편집기 에셋 패널의 텍스트 자막 추가 버튼(`aria-label` 「텍스트 자막 추가」, `components/scenes/create/node-canvas-v2/nodes/videoEditParts/AssetPanel.tsx`)이 쓰는 14px T 글자 획이다. LOUIS 에 같은 뜻의 `icon/text` 가 있다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/AssetPanel.tsx:312)",
  },
  {
    id: "upload-arrow-tray",
    signature: "0 0 24 24|path(d=M12 16V4M7 9l5-5 5 5M5 20h14)",
    louis: null,
    verdict: "missing",
    why: "편집기 에셋 패널 머리의 파일 업로드 아이콘 버튼(`aria-label` 「파일 업로드」, `components/scenes/create/node-canvas-v2/nodes/videoEditParts/AssetPanel.tsx`)이 쓰는 위 화살표와 밑줄(트레이) 모양이다. LOUIS 에는 `icon/arrow-up` 과 `icon/cloud-arrow-up` 만 있고, 로컬 파일 업로드를 뜻하는 트레이 화살표는 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/AssetPanel.tsx:454)",
  },
  {
    id: "play-triangle-lucide",
    signature: "0 0 24 24|path(d=M5 3v18l16-9Z)",
    louis: "icon/play",
    verdict: "bespoke",
    why: "편집기 미리보기 하단 바의 재생 버튼(`aria-label` 「재생」, `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx`)이 쓰는 lucide 계열 스트로크 삼각형이다. LOUIS 에 같은 뜻의 `icon/play` 가 있다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:11636)",
  },
  {
    id: "chevron-down-lucide-12",
    signature: "0 0 24 24|path(d=M6 9l6 6 6-6)",
    louis: "icon/caret-down",
    verdict: "bespoke",
    why: "편집기 미리보기 확대 배율 드롭다운(`aria-label` 「프리뷰 확대 배율」, `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx`)의 `caretIcon` 으로 넘기는 12px lucide chevron-down 이다. LOUIS 에 같은 뜻의 `icon/caret-down` 이 있다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:11705)",
  },
  {
    id: "fullscreen-maximize-lucide",
    signature: "0 0 24 24|path(d=M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3)",
    louis: null,
    verdict: "missing",
    why: "편집기 미리보기 컨트롤의 전체화면 토글 버튼(`aria-label` 「전체화면」, `nodes/VideoEditModal.tsx`)이 꺼진 상태에서 그리는 lucide maximize 네 모서리 괄호다. LOUIS 세트에는 전체화면이나 확대 아이콘이 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:11758)",
  },
  {
    id: "square-split-horizontal-lucide",
    signature: "0 0 24 24|path(d=M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3)|path(d=M16 5h3c1 0 2 1 2 2v10c0 1-1 2-2 2h-3)|path(d=M12 4v16)",
    louis: null,
    verdict: "missing",
    why: "편집기 도구줄의 분할 버튼(툴팁 「재생헤드 위치에서 클립 분할」, `nodes/VideoEditModal.tsx`)이 그리는 lucide square-split-horizontal로, 사각형 양쪽 반과 가운데 세로줄이다. LOUIS 세트에는 분할 아이콘이 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:10945)",
  },
  {
    id: "align-start-horizontal-bars",
    signature: "0 0 24 24|path(d=M2 2v20)|rect(rx=2 x=6 y=4 width=16 height=6)|rect(rx=2 x=6 y=14 width=9 height=6)",
    louis: null,
    verdict: "missing",
    why: "편집기 도구줄의 왼쪽 붙이기 버튼(`aria-label` 「왼쪽으로 붙이기」, `nodes/VideoEditModal.tsx`)이 그린다. 왼쪽 세로 기준선에 긴 막대와 짧은 막대를 붙인 정렬 글리프다. LOUIS 세트에는 정렬 아이콘이 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:10978)",
  },
  {
    id: "align-end-horizontal-bars",
    signature: "0 0 24 24|path(d=M22 2v20)|rect(rx=2 x=2 y=4 width=16 height=6)|rect(rx=2 x=9 y=14 width=9 height=6)",
    louis: null,
    verdict: "missing",
    why: "편집기 도구줄의 오른쪽 붙이기 버튼(`aria-label` 「오른쪽으로 붙이기」, `nodes/VideoEditModal.tsx`)이 그린다. 오른쪽 세로 기준선에 막대 둘을 붙인 정렬 글리프다. LOUIS 세트에는 정렬 아이콘이 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:11010)",
  },
  {
    id: "trash-lucide-with-lines",
    signature: "0 0 24 24|path(d=M3 6h18)|path(d=M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6)|path(d=M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2)|path(d=M10 11v6)|path(d=M14 11v6)",
    louis: "icon/trash-simple",
    verdict: "bespoke",
    why: "편집기 도구줄의 클립 삭제 버튼(`aria-label` 「클립 삭제」, `nodes/VideoEditModal.tsx`)이 그리는 lucide trash-2로, 뚜껑과 세로줄 둘이 있는 휴지통이다. 같은 뜻의 LOUIS `icon/trash-simple`가 있는데도 제품은 이 글리프를 따로 인라인으로 그린다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:11044)",
  },
  {
    id: "crop-lucide",
    signature: "0 0 24 24|path(d=M6 2v14a2 2 0 0 0 2 2h14)|path(d=M2 6h14a2 2 0 0 1 2 2v14)",
    louis: null,
    verdict: "missing",
    why: "편집기 도구줄의 자르기 버튼(`aria-label` 「선택한 클립 자르기」, `nodes/VideoEditModal.tsx`)이 그리는 lucide crop으로, 엇갈린 꺾쇠 두 개다. LOUIS 세트에는 자르기 아이콘이 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:11092)",
  },
  {
    id: "video-frame-extract-current",
    signature: "0 0 24 24|rect(x=10 y=7 width=4 height=10)|rect(rx=2 x=3 y=5 width=18 height=14)|path(d=M9 5v14M15 5v14)",
    louis: null,
    verdict: "missing",
    why: "편집기 도구줄의 프레임 추출 버튼(`aria-label` 「프레임 추출」)이 `ToolbarIconVideoFrame side=\"current\"`(`lib/nodeToolbarGlyphs.tsx`)로 그리는 필름 세 칸 글리프다. 가운데 칸을 면으로 채워 뽑을 프레임을 보여 준다. LOUIS에는 `icon/video-stack`과 `icon/image`만 있고 프레임 추출 아이콘은 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/lib/nodeToolbarGlyphs.tsx:200)",
  },
  {
    id: "undo-curved-arrow",
    signature: "0 0 24 24|path(d=M3 10h13a4 4 0 010 8H9)|path(d=M7 14L3 10l4-4)",
    louis: null,
    verdict: "missing",
    why: "편집기 미리보기 조작 막대의 실행 취소 버튼(툴팁 「Undo」 · ⌘Z, `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx`) — 왼쪽으로 꺾여 돌아가는 곡선 화살표다. LOUIS 42종에 실행 취소 아이콘이 없고 `icon/arrow-elbow-down-left`는 엔터 의미라 대응하지 않는다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:11141)",
  },
  {
    id: "redo-curved-arrow",
    signature: "0 0 24 24|path(d=M21 10H8a4 4 0 000 8h7)|path(d=M17 14l4-4-4-4)",
    louis: null,
    verdict: "missing",
    why: "편집기 미리보기 조작 막대의 다시 실행 버튼(툴팁 「Redo」 · ⌘⇧Z, `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx`) — 실행 취소 글리프의 좌우 반전 곡선 화살표다. LOUIS 42종에 다시 실행 아이콘이 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:11180)",
  },
  {
    id: "cloud-arrow-up-32",
    signature: "0 0 32 32|path(d=M13.9992 26H8.99918C8.00663 25.9988 7.02568 25.7865 6.12144 25.3772C5.2172 24.9679 4.41033 24.3711 3.75437 23.6262C3.09841 22.8813 2.60837 22.0054 2.31675 21.0566C2.02514 20.1079 1.93862 19.108 2.06294 18.1232C2.18726 17.1385 2.51957 16.1915 3.03783 15.345C3.55609 14.4985 4.24845 13.7718 5.06896 13.2133C5.88946 12.6548 6.81936 12.2772 7.79695 12.1055C8.77454 11.9338 9.77746 11.972 10.7392 12.2175)|path(d=M15 20L19 16L23 20)|path(d=M19 26V16)|path(d=M10 16C10.0004 14.1972 10.4882 12.428 11.4117 10.8797C12.3352 9.33142 13.6601 8.06157 15.2461 7.20455C16.8322 6.34752 18.6205 5.9352 20.4216 6.01121C22.2228 6.08723 23.97 6.64875 25.4782 7.63636C26.9864 8.62398 28.1996 10.0009 28.9894 11.6215C29.7791 13.2421 30.1161 15.0461 29.9646 16.8425C29.8132 18.639 29.1789 20.361 28.1289 21.8265C27.0789 23.292 25.6523 24.4464 24 25.1675)",
    louis: "icon/cloud-arrow-up",
    verdict: "bespoke",
    why: "편집기 미리보기 조작 막대의 저장 버튼(`aria-label` 「Save」)이 `components/navigation/ProjectSaveCloudGlyph.tsx`의 `CloudArrowUpSvg`를 32 viewBox · 획 2로 인라인 작도한 구름 업로드 글리프다. LOUIS `icon/cloud-arrow-up`이 같은 실루엣과 같은 의미(업로드 저장)를 가지므로 대응하지만 제품은 자체 32 박스 사본을 그린다. (출처 apps/web/components/navigation/ProjectSaveCloudGlyph.tsx:59)",
  },
  {
    id: "keyboard-shortcuts",
    signature: "0 0 24 24|rect(rx=2 x=2 y=6 width=20 height=12)|path(d=M7 10h.01M11 10h.01M15 10h.01M8 14h8)",
    louis: null,
    verdict: "missing",
    why: "편집기 미리보기 조작 막대의 단축키 도움말 토글(`aria-label` 「Open keyboard shortcuts」, `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx`) — 둥근 사각형 안에 점 셋과 스페이스바 선을 둔 키보드 글리프다. LOUIS 42종에 키보드 아이콘이 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:11254)",
  },
  {
    id: "zoom-out-magnifier",
    signature: "0 0 24 24|circle(cx=11 cy=11 r=7)|path(d=M21 21l-4.35-4.35)|path(d=M8 11h6)",
    louis: null,
    verdict: "missing",
    why: "편집기 타임라인 줌 컨트롤의 축소 버튼(`aria-label` 「Zoom out timeline」, `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx`) — 돋보기 안에 빼기 가로선이 있다. LOUIS `icon/magnifying-glass`는 검색 의미의 맨 돋보기라 축소 의미의 아이콘은 LOUIS에 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:10833)",
  },
  {
    id: "zoom-in-magnifier",
    signature: "0 0 24 24|circle(cx=11 cy=11 r=7)|path(d=M21 21l-4.35-4.35)|path(d=M11 8v6M8 11h6)",
    louis: null,
    verdict: "missing",
    why: "편집기 타임라인 줌 컨트롤의 확대 버튼(`aria-label` 「Zoom in timeline」, `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx`) — 돋보기 안에 더하기 십자가 있다. LOUIS `icon/magnifying-glass`는 검색 의미의 맨 돋보기라 확대 의미의 아이콘은 LOUIS에 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:10896)",
  },
  {
    id: "transition-bowtie-marker",
    signature: "0 0 24 24|path(d=M4 5l8 7-8 7V5zM20 5l-8 7 8 7V5z)",
    louis: null,
    verdict: "missing",
    why: "편집기 시퀀스 타임라인에서 두 클립 사이에 놓이는 전환 마커 버튼(`aria-label` 「Add transition」, `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx`) — 마주 보는 두 삼각형을 채워 그린 10px 나비넥타이 글리프다. LOUIS 42종에 전환 아이콘이 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:13068)",
  },
  {
    id: "drag-handle-dots-six",
    signature: "0 0 6 12|circle(cx=1.5 cy=1.5 r=1)|circle(cx=4.5 cy=1.5 r=1)|circle(cx=1.5 cy=6 r=1)|circle(cx=4.5 cy=6 r=1)|circle(cx=1.5 cy=10.5 r=1)|circle(cx=4.5 cy=10.5 r=1)",
    louis: null,
    verdict: "missing",
    why: "편집기 타임라인 비디오 트랙 레일의 트랙 드래그 핸들(`VEM_CLASS.trackDragHandle`, `aria-hidden`, `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx`) — 6×12 상자에 점 여섯 개를 2열 3행으로 찍은 그립이다. LOUIS에는 `icon/dots-three-vertical`(더보기 메뉴)만 있고 끌어 옮기기 손잡이 의미의 아이콘은 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:13291)",
  },
  {
    id: "eye-lucide",
    signature: "0 0 24 24|path(d=M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z)|circle(cx=12 cy=12 r=3)",
    louis: "icon/eye",
    verdict: "bespoke",
    why: "편집기 타임라인 비디오 트랙 레일의 트랙 숨기기 토글(`aria-label` 「Hide track」/「트랙 숨기기」, `VideoEditModal.tsx`) — 주석대로 lucide eye 경로를 인라인으로 그린다. 같은 의미의 LOUIS `icon/eye`(숨김 상태는 `icon/eye-slash`)가 있는데 제품이 따로 그린다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:13381)",
  },
  {
    id: "lock-open-lucide",
    signature: "0 0 24 24|rect(rx=2 x=5 y=11 width=14 height=9)|path(d=M8 11V7a4 4 0 017.7-1.5)",
    louis: null,
    verdict: "missing",
    why: "편집기 타임라인 비디오 트랙 레일의 트랙 잠금 토글(`aria-label` 「Lock track」/「트랙 잠금」, `VideoEditModal.tsx`)이 잠기지 않은 상태에 그리는 열린 자물쇠(lucide lock-open 형)다. LOUIS 42종에 자물쇠·잠금 아이콘이 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:13478)",
  },
  {
    id: "view-grid-four-squares-16",
    signature: "0 0 16 16|rect(rx=1.2 x=1.5 y=1.5 width=5 height=5)|rect(rx=1.2 x=9.5 y=1.5 width=5 height=5)|rect(rx=1.2 x=1.5 y=9.5 width=5 height=5)|rect(rx=1.2 x=9.5 y=9.5 width=5 height=5)",
    louis: null,
    verdict: "missing",
    why: "하이라이트 완료 화면 보기 방식 세그먼트 컨트롤의 그리드 칸(`aria-label` 「그리드 보기」, `components/scenes/HighlightProjectScene.tsx`) — 16 상자에 둥근 사각형 네 개를 2×2로 놓은 그리드 글리프다. LOUIS에는 격자 보기 아이콘이 없다. (출처 apps/web/components/scenes/HighlightProjectScene.tsx:2538)",
  },
  {
    id: "view-list-thumb-rows-16",
    signature: "0 0 16 16|rect(rx=1 x=1.5 y=2 width=4.5 height=3.5)|rect(rx=1 x=1.5 y=10.5 width=4.5 height=3.5)|line(x1=8.5 y1=4 x2=14.5 y2=4)|line(x1=8.5 y1=12.2 x2=14.5 y2=12.2)",
    louis: null,
    verdict: "missing",
    why: "하이라이트 완료 화면 보기 방식 세그먼트 컨트롤의 상세 칸(`aria-label` 「목록 보기」, `HighlightProjectScene.tsx`) — 작은 썸네일 사각형 둘과 가로선 둘로 그린 목록 글리프다. LOUIS에는 목록 보기 아이콘이 없다. (출처 apps/web/components/scenes/HighlightProjectScene.tsx:2601)",
  },
  {
    id: "undo-arrow-lucide",
    signature: "0 0 24 24|path(d=M9 14 4 9l5-5)|path(d=M4 9h10a6 6 0 0 1 0 12h-3)",
    louis: null,
    verdict: "missing",
    why: "모바일 편집기 미리보기 컨트롤의 실행취소 버튼(`aria-label` 「실행취소」/「Undo」, `VideoEditModal.tsx` 11664)이 쓰는 `GlyphUndo`(`videoEditParts/mobileActionGlyphs.tsx`) — 왼쪽으로 꺾여 돌아가는 화살표(lucide undo-2 형)다. LOUIS의 `icon/arrow-elbow-down-left`는 입력·줄바꿈 의미이고 실행취소 아이콘은 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/mobileActionGlyphs.tsx:179)",
  },
  {
    id: "redo-arrow-lucide",
    signature: "0 0 24 24|path(d=m15 14 5-5-5-5)|path(d=M20 9H10a6 6 0 0 0 0 12h3)",
    louis: null,
    verdict: "missing",
    why: "모바일 편집기 미리보기 컨트롤의 다시실행 버튼(`aria-label` 「다시실행」/「Redo」, `VideoEditModal.tsx` 11673)이 쓰는 `GlyphRedo`(`videoEditParts/mobileActionGlyphs.tsx`) — 오른쪽으로 꺾여 돌아가는 화살표(lucide redo-2 형)다. LOUIS 42종에 다시실행 아이콘이 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/mobileActionGlyphs.tsx:185)",
  },
  {
    id: "scissors-lucide",
    signature: "0 0 24 24|circle(cx=6 cy=6 r=3)|circle(cx=6 cy=18 r=3)|path(d=M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12)",
    louis: null,
    verdict: "missing",
    why: "모바일 편집기 루트 액션 바의 「편집」 버튼(`vem.mobileRootEdit`, `videoEditParts/mobileActionGlyphs.tsx` 의 `GlyphEdit`)이 쓰는 lucide 결 가위 글리프다. LOUIS 세트에 가위·자르기 아이콘이 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/mobileActionGlyphs.tsx:32)",
  },
  {
    id: "music-note-double-lucide",
    signature: "0 0 24 24|path(d=M9 18V5l12-2v13)|circle(cx=6 cy=18 r=3)|circle(cx=18 cy=16 r=3)",
    louis: "icon/music-notes-simple",
    verdict: "bespoke",
    why: "모바일 편집기 루트 액션 바의 「오디오」 버튼(`vem.mobileRootAudio`, `mobileActionGlyphs.tsx` 의 `GlyphAudio`)이 쓰는 두 음표 글리프다. LOUIS 에 같은 뜻의 `icon/music-notes-simple` 이 있는데 제품은 lucide 결 음표를 따로 그린다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/mobileActionGlyphs.tsx:40)",
  },
  {
    id: "text-t-lucide",
    signature: "0 0 24 24|path(d=M4 7V4h16v3M9 20h6M12 4v16)",
    louis: "icon/text",
    verdict: "bespoke",
    why: "모바일 편집기 루트 액션 바의 「텍스트」 버튼(`vem.mobileActionText`, `mobileActionGlyphs.tsx` 의 `GlyphText`)이 쓰는 T 글리프다. LOUIS 에 같은 뜻의 `icon/text` 가 있는데 제품은 lucide type 모양을 따로 그린다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/mobileActionGlyphs.tsx:48)",
  },
  {
    id: "image-frame-mountain-lucide",
    signature: "0 0 24 24|rect(rx=2 x=3 y=3 width=18 height=18)|circle(cx=9 cy=9 r=2)|path(d=m21 15-5-5L5 21)",
    louis: "icon/image",
    verdict: "bespoke",
    why: "모바일 편집기 루트 액션 바의 「이미지」 버튼(`vem.mobileActionImage`, `mobileActionGlyphs.tsx` 의 `GlyphImage`)이 쓰는 액자와 산 글리프다. LOUIS 에 같은 뜻의 `icon/image` 가 있는데 제품은 lucide image 를 따로 그린다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/mobileActionGlyphs.tsx:54)",
  },
  {
    id: "plus-lucide-mobile-action",
    signature: "0 0 24 24|path(d=M12 5v14M5 12h14)",
    louis: "icon/plus",
    verdict: "bespoke",
    why: "모바일 편집기 루트 액션 바의 「에셋」 버튼(`vem.mobileTabAssets`, `mobileActionGlyphs.tsx` 의 `GlyphPlus`, 모바일 타임라인 끝 추가에도 쓰임)이 쓰는 더하기 글리프다. LOUIS 에 같은 뜻의 `icon/plus` 가 있는데 제품은 따로 그린다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/mobileActionGlyphs.tsx:198)",
  },
  {
    id: "aspect-ratio-corners-lucide",
    signature: "0 0 24 24|path(d=M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3)",
    louis: null,
    verdict: "missing",
    why: "모바일 편집기 루트 액션 바의 「비율」 버튼(`vem.mobileRootRatio`, `mobileActionGlyphs.tsx` 의 `GlyphRatio`, 같은 모양이 `VideoEditModal.tsx:11758` 에도 있음)이 쓰는 네 모서리 프레임(lucide scan/maximize) 글리프다. LOUIS 세트에 비율·모서리 프레임 아이콘이 없다. (출처 apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/mobileActionGlyphs.tsx:62)",
  },
  // **LOUIS 문서 예시의 추이 차트 둘(2026-10-07, 생성기 `--louis-examples`).** 아이콘이 아니라 데이터 그림이다 — `.louis-document-trend` 의
  // 선(`polyline`, 0~100 상자에 늘인다)이 예시 문서 `packages/css/examples/document-report.html` 의 수치로 그려진다. 대응할 LOUIS 아이콘이 없고
  // 있어서도 안 된다. 서명은 예시의 좌표라 예시 수치가 바뀌면 함께 바뀐다.
  {
    id: "document-trend-boards",
    signature: "0 0 100 100|polyline(points=0,47.37 92.31,47.37 92.31,71.05 100,71.05 100,100)",
    louis: null,
    verdict: "missing",
    why: "LOUIS 문서 예시(document-report) 01 절의 「측정 생성 보드」 추이 선 — 9월 2일 36장 → 9월 28일 76장. 데이터 그림이지 아이콘이 아니다.",
  },
  {
    id: "document-trend-instances",
    signature: "0 0 100 100|polyline(points=0,34.82 11.54,33.93 34.62,37.5 46.15,45.09 88.46,45.09 92.31,91.96 100,100)",
    louis: null,
    verdict: "missing",
    why: "LOUIS 문서 예시(document-report) 01 절의 「컴포넌트 인스턴스」 추이 선 — 78개 → 224개. 데이터 그림이지 아이콘이 아니다.",
  },
  {
    id: "download-lucide",
    signature: "0 0 24 24|path(d=M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4)|path(d=M7 10l5 5 5-5)|path(d=M12 15V3)",
    louis: "icon/download-simple",
    verdict: "bespoke",
    why: "랜딩 개요의 노드 캔버스 목업 — 노드 도구 막대의 다운로드(`aria-label` 「Download」, `components/scenes/create/node-canvas-v2/lib/nodeToolbarGlyphs.tsx:366-368` 의 lucide 모양 세 획). 앵커 a4125565 에서 랜딩 목업에 처음 섰다. LOUIS `icon/download-simple` 과 뜻은 같지만 제품은 인라인 `<path>` 로 제 글리프를 그린다 — `trash-lucide` 와 같은 판정이다.",
  },
  {
    id: "sparkle-plus-32",
    signature:
      "0 0 32 32|path(d=M10.5339 21.4659L3.64767 18.9284C3.45779 18.8583 3.29396 18.7317 3.17824 18.5657C3.06253 18.3996 3.00049 18.2021 3.00049 17.9997C3.00049 17.7973 3.06253 17.5997 3.17824 17.4337C3.29396 17.2676 3.45779 17.141 3.64767 17.0709L10.5339 14.5334L13.0714 7.64718C13.1415 7.4573 13.2681 7.29347 13.4342 7.17775C13.6002 7.06204 13.7978 7 14.0002 7C14.2026 7 14.4001 7.06204 14.5662 7.17775C14.7322 7.29347 14.8588 7.4573 14.9289 7.64718L17.4664 14.5334L24.3527 17.0709C24.5426 17.141 24.7064 17.2676 24.8221 17.4337C24.9378 17.5997 24.9999 17.7973 24.9999 17.9997C24.9999 18.2021 24.9378 18.3996 24.8221 18.5657C24.7064 18.7317 24.5426 18.8583 24.3527 18.9284L17.4664 21.4659L14.9289 28.3522C14.8588 28.5421 14.7322 28.7059 14.5662 28.8216C14.4001 28.9373 14.2026 28.9994 14.0002 28.9994C13.7978 28.9994 13.6002 28.9373 13.4342 28.8216C13.2681 28.7059 13.1415 28.5421 13.0714 28.3522L10.5339 21.4659Z)|path(d=M22 2V8)|path(d=M28 9V13)|path(d=M19 5H25)|path(d=M26 11H30)",
    louis: null,
    verdict: "missing",
    why: "랜딩 개요의 노드 캔버스 목업 — 노드 메뉴 · 생성 버튼의 반짝임(`components/scenes/create/node-canvas-v2/icons/SparkleIcon.tsx`, `public/icons/Sparkle.svg` 의 선 그림을 `currentColor` 로). 별 하나에 더하기 표 둘, 32 상자. 앵커 a4125565 에서 랜딩 목업에 처음 섰다. 채운 Phosphor 반짝임(`sparkle-fill-256`)과 다른 그림이고 LOUIS 31종에 반짝임 계열이 없다.",
  },
  {
    id: "copy-rounded",
    signature: "0 0 24 24|path(d=M4 16C2.9 16 2 15.1 2 14V4C2 2.9 2.9 2 4 2H14C15.1 2 16 2.9 16 4M10 8H20C21.1046 8 22 8.89543 22 10V20C22 21.1046 21.1046 22 20 22H10C8.89543 22 8 21.1046 8 20V10C8 8.89543 8.89543 8 10 8Z)",
    louis: "icon/copy",
    verdict: "bespoke",
    why: "랜딩 개요의 노드 캔버스 목업 — 글자 칸의 복사(`components/scenes/create/node-canvas-v2/lib/nodeToolbarGlyphs.tsx`, 둥근 두 사각형). LOUIS `icon/copy` 와 뜻은 같지만 제품이 제 인라인 그림을 그린다.",
  },
  {
    id: "chevron-left-16",
    signature: "0 0 16 16|path(d=M10 3L5 8l5 5)",
    louis: "icon/caret-left",
    verdict: "bespoke",
    why: "랜딩 캐러셀의 이전 화살표(`components/landing/system/CarouselArrows.tsx:65`, 16 상자). LOUIS `icon/caret-left` 와 뜻은 같지만 제품이 제 인라인 그림을 그린다.",
  },
  {
    id: "chevron-right-16",
    signature: "0 0 16 16|path(d=M6 3l5 5-5 5)",
    louis: "icon/caret-right",
    verdict: "bespoke",
    why: "랜딩 캐러셀의 다음 화살표(`components/landing/system/CarouselArrows.tsx:65`, 16 상자). LOUIS `icon/caret-right` 와 뜻은 같지만 제품이 제 인라인 그림을 그린다.",
  },
  // 2026-10-07 — 쇼츠 렌더 완료 결과(`/highlight/[projectId]/shorts/[shortId]`)의 결과 플레이어 · 동작 버튼.
  {
    id: "play-filled-video-player",
    signature: "0 0 24 24|path(d=M7 4.5l15 7.5L7 19.5V4.5z)",
    louis: "icon/play",
    verdict: "bespoke",
    why: "공용 영상 플레이어의 가운데 재생 버튼(`components/ui/VideoPlayer.tsx:846`, 34 상자 채운 삼각형)이다. LOUIS `icon/play` 와 뜻은 같지만 제품이 제 인라인 그림을 그린다.",
  },
  // 2026-10-14 — 랜딩 개요 장면(끈적 장면 측정이 캔버스 프레임을 싣게 된 뒤 처음 보인다)의 TTS · BGM 노드 재생 버튼.
  {
    id: "play-filled-audio-node",
    signature: "0 0 24 24|path(d=M8 5v14l11-7z)",
    louis: "icon/play",
    verdict: "bespoke",
    why: "노드 캔버스 TTS · BGM 노드의 재생 버튼 글리프(`components/scenes/create/node-canvas-v2/nodes/TtsNode.tsx:676` · `BgmNode.tsx:720`, 24 상자 채운 삼각형)다. LOUIS `icon/play` 와 뜻은 같지만 제품이 제 인라인 그림을 그린다.",
  },
  {
    id: "x-remove-edit-source",
    signature: "0 0 12 12|path(d=M2 2l8 8M10 2l-8 8)",
    louis: "icon/x",
    verdict: "bespoke",
    why: "노드 캔버스 편집 노드의 소스 썸네일 제거 버튼 글리프(`components/scenes/create/node-canvas-v2/nodes/EditNode.tsx:1053`, 12 상자 · 10 표시 X 획)다. LOUIS `icon/x` 와 뜻은 같지만 제품이 제 인라인 그림을 그린다. 툴팁 감싸개(크기 0)를 측정기가 건너뛰게 된 뒤(조립 규칙 15조의 21) 랜딩 개요 장면에서 처음 잡혔다.",
  },
  {
    id: "volume-high-video-player",
    signature: "0 0 24 24|path(d=M11 5L6 9H3v6h3l5 4V5z)|path(d=M15.5 8.5a5 5 0 010 7M18 6a8 8 0 010 12)",
    louis: null,
    verdict: "missing",
    why: "공용 영상 플레이어의 음량 버튼(`components/ui/VideoPlayer.tsx:912-916`, 음량 0.5 초과의 두 물결)이다. LOUIS 세트에 스피커 · 음량 아이콘이 없다.",
  },
  {
    id: "expand-corners-video-player",
    signature: "0 0 24 24|path(d=M9 3H3v6M15 3h6v6M3 15v6h6M21 15v6h-6)",
    louis: null,
    verdict: "missing",
    why: "공용 영상 플레이어의 크게 보기 버튼(`components/ui/VideoPlayer.tsx:955-957`, 네 모서리 꺾쇠)이다. LOUIS 세트에 전체 화면 · 펼치기 아이콘이 없다.",
  },
  {
    id: "youtube-brand-16",
    signature: "0 0 24 24|path(d=M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z)|path(d=M9.75 15.02l5.75-3.27-5.75-3.27v6.54z)",
    louis: null,
    verdict: "missing",
    why: "쇼츠 결과의 「Upload to YouTube」 버튼 왼쪽 아이콘(`app/highlight/[projectId]/shorts/[shortId]/page.tsx:1339-1342`, 빨간 면 · 흰 삼각형의 브랜드 표식)이다. LOUIS 아이콘 세트는 브랜드 표식을 두지 않는다.",
  },
  {
    id: "footer-track-product",
    signature: "0 0 24 24|rect(rx=2 x=3 y=4 width=7.5 height=6)|rect(rx=2 x=13.5 y=14 width=7.5 height=6)|path(d=M10.5 7c3.6 0-.6 10 3 10)",
    louis: "icon/nodes-linked",
    verdict: "bespoke",
    why: "공개 화면 타임라인 푸터의 「Product」 트랙 아이콘(`components/landing/sections/footerTrackIcons.tsx`)이다. 좌표가 LOUIS `icon/nodes-linked`(packages/react/src/icons/svg/nodes-linked.svg)와 같지만 제품은 아직 `@klipse-design/react` 를 소비하지 않아 같은 좌표의 사본을 인라인으로 그린다(같은 파일 머리 주석). 통합 판 앵커(2026-10-08, DS-D-0079)에서 들어왔다.",
  },
  {
    id: "footer-track-resources",
    signature: "0 0 24 24|path(d=M12 6.75C10.25 5.4 7.75 4.75 4.5 4.75v13c3.25 0 5.75.65 7.5 2 1.75-1.35 4.25-2 7.5-2v-13c-3.25 0-5.75.65-7.5 2z)|path(d=M12 6.75v13)",
    louis: "icon/book-open",
    verdict: "bespoke",
    why: "공개 화면 타임라인 푸터의 「Resources」 트랙 아이콘(`components/landing/sections/footerTrackIcons.tsx`)이다. 좌표가 LOUIS `icon/book-open`(packages/react/src/icons/svg/book-open.svg)와 같지만 제품은 아직 `@klipse-design/react` 를 소비하지 않아 같은 좌표의 사본을 인라인으로 그린다(같은 파일 머리 주석). 통합 판 앵커(2026-10-08, DS-D-0079)에서 들어왔다.",
  },
  {
    id: "footer-track-social",
    signature: "0 0 24 24|path(d=M14.5 8.5V6.25a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5.25a2 2 0 0 0 2 2h1V16l3-2.5)|path(d=M10.5 11.5a2 2 0 0 1 2-2H19a2 2 0 0 1 2 2v4.25a2 2 0 0 1-2 2h-1v2.5l-3-2.5h-2.5a2 2 0 0 1-2-2z)",
    louis: "icon/chat-bubbles",
    verdict: "bespoke",
    why: "공개 화면 타임라인 푸터의 「Social」 트랙 아이콘(`components/landing/sections/footerTrackIcons.tsx`)이다. 좌표가 LOUIS `icon/chat-bubbles`(packages/react/src/icons/svg/chat-bubbles.svg)와 같지만 제품은 아직 `@klipse-design/react` 를 소비하지 않아 같은 좌표의 사본을 인라인으로 그린다(같은 파일 머리 주석). 통합 판 앵커(2026-10-08, DS-D-0079)에서 들어왔다.",
  },
  {
    id: "footer-track-trust",
    signature: "0 0 24 24|path(d=M12 3.5l7 2.6v5.4c0 4.25-2.9 7.6-7 9-4.1-1.4-7-4.75-7-9V6.1l7-2.6z)|path(d=M9 12.25l2.1 2.1L15.25 10)",
    louis: "icon/shield-check",
    verdict: "bespoke",
    why: "공개 화면 타임라인 푸터의 「Trust」 트랙 아이콘(`components/landing/sections/footerTrackIcons.tsx`)이다. 좌표가 LOUIS `icon/shield-check`(packages/react/src/icons/svg/shield-check.svg)와 같지만 제품은 아직 `@klipse-design/react` 를 소비하지 않아 같은 좌표의 사본을 인라인으로 그린다(같은 파일 머리 주석). 통합 판 앵커(2026-10-08, DS-D-0079)에서 들어왔다.",
  },
  {
    id: "admin-refresh-16",
    signature: "0 0 16 16|path(d=M12.95 9.75a5.25 5.25 0 1 1-1.24-5.46L14.42 6.83)|path(d=M14.42 3.33v3.5h-3.5)",
    louis: null,
    verdict: "missing",
    why: "어드민 머리의 새로고침 아이콘 버튼(`app/admin/AdminSection.tsx` AdminRefreshButton — 사용자 · 고객 문의 · 청약철회가 같은 글리프)이 16 상자 1.5 획으로 그리는 시계 방향 화살 고리다. LOUIS 아이콘 세트에 새로고침 · 회전 화살표가 없다. 통합 판 앵커(2026-10-08, DS-D-0079)에서 들어왔다.",
  },
  {
    id: "magnifying-glass-phosphor-256",
    signature: "0 0 256 256|path(d=M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z)",
    louis: "icon/magnifying-glass",
    verdict: "bespoke",
    why: "어드민 검색 칸 앞 돋보기(`app/admin/AdminSearch.tsx:26` — `@phosphor-icons/react` 의 `MagnifyingGlass` 16px, 256 격자 채운 패스)다. LOUIS 에 같은 뜻의 `icon/magnifying-glass` 가 있지만 제품은 그것을 물지 않고 Phosphor 를 직접 쓴다. 통합 판 앵커(2026-10-08, DS-D-0079)에서 들어왔다.",
  },
  {
    id: "volume-high-video-player-split",
    signature: "0 0 24 24|g()|path(d=M11 4.70007C10.9998 4.56079 10.9583 4.42468 10.8809 4.30893C10.8034 4.19318 10.6934 4.10298 10.5647 4.0497C10.436 3.99643 10.2944 3.98247 10.1577 4.00958C10.0211 4.0367 9.89559 4.10368 9.797 4.20207L6.413 7.58507C6.2824 7.71645 6.12703 7.8206 5.95589 7.8915C5.78475 7.96239 5.60124 7.99862 5.416 7.99808H3C2.73478 7.99808 2.48043 8.10343 2.29289 8.29097C2.10536 8.4785 2 8.73286 2 8.99808V14.9981C2 15.2633 2.10536 15.5176 2.29289 15.7052C2.48043 15.8927 2.73478 15.9981 3 15.9981H5.416C5.60124 15.9975 5.78475 16.0338 5.95589 16.1047C6.12703 16.1755 6.2824 16.2797 6.413 16.4111L9.796 19.7951C9.8946 19.8939 10.0203 19.9612 10.1572 19.9885C10.2941 20.0157 10.436 20.0018 10.5649 19.9483C10.6939 19.8949 10.804 19.8044 10.8815 19.6883C10.959 19.5721 11.0002 19.4357 11 19.2961V4.70007Z)|path(d=M16 8.99807C16.6491 9.86356 17 10.9162 17 11.9981C17 13.0799 16.6491 14.1326 16 14.9981)|path(d=M19.364 18.3621C20.1997 17.5263 20.8627 16.5342 21.315 15.4423C21.7673 14.3503 22.0001 13.18 22.0001 11.9981C22.0001 10.8162 21.7673 9.64584 21.315 8.5539C20.8627 7.46196 20.1997 6.4698 19.364 5.63407)",
    louis: null,
    verdict: "missing",
    why: "공용 영상 플레이어의 음량 단추(`components/ui/VideoPlayerVolume.tsx` VolumeGlyph level=high — Lucide `volume-2` 패스를 몸통 · 안 물결 · 바깥 물결 셋으로 나눠 `<g>` 에 담았다)다. LOUIS 세트에 스피커 · 음량 아이콘이 없다(같은 그림의 한 패스 판은 `volume-2-lucide`). 통합 판 앵커(2026-10-08, DS-D-0079)에서 들어왔다.",
  },
  // 2026-10-08 — 셸 상태 레시피 `/archive seeded`(홈에 최근 프로젝트가 있을 때만 서는 자리)에서 처음 잰 글리프 둘.
  {
    id: "chevron-down-12",
    signature: "0 0 12 12|path(d=M3 4.5L6 7.5L9 4.5)",
    louis: "icon/caret-down",
    verdict: "bespoke",
    why: "홈 최근 프로젝트 머리의 「새로 만들기」 버튼 오른쪽 꺾쇠(`components/scenes/HomeCreateNewMenu.tsx:123-138` — `rightIcon` 의 12 상자 1.5 획, 열리면 뒤집힌다)다. LOUIS 에 같은 뜻의 `icon/caret-down` 이 있지만 제품이 제 인라인 그림을 그린다(정본은 24 상자 polyline).",
  },
  {
    id: "dots-three-vertical-circles",
    signature: "0 0 24 24|circle(cx=12 cy=5.625 r=1.125)|circle(cx=12 cy=12 r=1.125)|circle(cx=12 cy=18.375 r=1.125)",
    louis: "icon/dots-three-vertical",
    verdict: "bespoke",
    why: "홈 최근 프로젝트 카드의 더보기 버튼(`components/scenes/AppHomeScene.tsx:1371-1400` — `archiveMoreButton`, 20 으로 그리는 24 상자 원 셋)이다. 원 셋의 좌표가 LOUIS `icon/dots-three-vertical`(packages/react/src/icons/svg/dots-three-vertical.svg)과 같지만 순서가 다르고(위 · 가운데 · 아래) 제품은 그것을 물지 않고 인라인으로 그린다.",
  },
  // 같은 날 — 셸 상태 레시피의 겹침(커맨드 팔레트 `/archive palette*` · 연체 배너 `/subscription past-due`)에서 처음 잰 글리프 여섯.
  {
    id: "magnifying-glass-32-group",
    signature: "0 0 32 32|g()|circle(cx=14 cy=14 r=10)|path(d=M21.0703 21.0703L28.0004 28.0004)",
    louis: "icon/magnifying-glass",
    verdict: "bespoke",
    why: "커맨드 팔레트 검색 칸 앞 돋보기(`components/navigation/CommandPalette.tsx:858` SearchGlyph — 16 으로 그리는 32 격자, 획 2 를 `<g>` 에 둔다)다. 기하는 `magnifying-glass-32` 와 같고 `<g>` 한 겹만 다르다. LOUIS 에 같은 뜻의 `icon/magnifying-glass` 가 있지만 제품이 제 인라인 그림을 그린다.",
  },
  {
    id: "x-close-group",
    signature: "0 0 24 24|g()|path(d=M18.75 5.25L5.25 18.75)|path(d=M18.75 18.75L5.25 5.25)",
    louis: "icon/x",
    verdict: "bespoke",
    why: "커맨드 팔레트 머리의 닫기 단추(`components/navigation/CommandPalette.tsx:939` CloseGlyph — 16 으로 그리는 24 상자, 획 2.25 를 `<g>` 에 둔다)다. 좌표가 LOUIS `icon/x`(packages/react/src/icons/svg/x.svg)와 같지만 제품이 제 인라인 그림을 그린다.",
  },
  {
    id: "chevron-right-lucide-12",
    signature: "0 0 24 24|path(d=m9 6 6 6-6 6)",
    louis: "icon/caret-right",
    verdict: "bespoke",
    why: "커맨드 팔레트에서 하위 목록이 있는 행(「Change theme」 등) 오른쪽 꺾쇠(`components/navigation/CommandPalette.tsx:882` ChevronGlyph — 12 로 그리는 24 상자 lucide chevron-right, 획 2)다. LOUIS 에 같은 뜻의 `icon/caret-right` 가 있지만 제품이 제 인라인 그림을 그린다.",
  },
  {
    id: "key-arrow-up",
    signature: "0 0 24 24|g()|path(d=M12 19V5)|path(d=m6 11 6-6 6 6)",
    louis: "icon/arrow-up",
    verdict: "bespoke",
    why: "커맨드 팔레트 바닥 힌트의 ↑ · ↓ 키캡(`components/navigation/CommandPalette.tsx:905` KeyArrowGlyph — 12 로 그리는 24 상자, 획 2.2. 아래 화살은 같은 `<g>` 에 `rotate(180 12 12)` 를 걸 뿐이라 서명이 같다)이다. LOUIS 에 같은 뜻의 `icon/arrow-up` 이 있지만 제품이 제 인라인 그림을 그린다.",
  },
  {
    id: "key-enter",
    signature: "0 0 24 24|g()|path(d=M20 6v6a3 3 0 0 1-3 3H5)|path(d=m9 11-4 4 4 4)",
    louis: "icon/arrow-elbow-down-left",
    verdict: "bespoke",
    why: "커맨드 팔레트 바닥 힌트의 ⏎ 키캡(`components/navigation/CommandPalette.tsx:922` KeyEnterGlyph — 12 로 그리는 24 상자 둥근 꺾임 화살, 획 2.2)이다. LOUIS 에 같은 뜻의 `icon/arrow-elbow-down-left` 가 있지만 꺾임이 각지고 제품은 제 인라인 그림을 그린다.",
  },
  {
    id: "x-close-node-canvas",
    signature: "0 0 24 24|path(d=M18.75 5.25L5.25 18.75)|path(d=M18.75 18.75L5.25 5.25)",
    louis: "icon/x",
    verdict: "bespoke",
    why: "연체 배너의 닫기 단추(`aria-label` 「Dismiss」, `components/PastDueBanner.tsx:67` 이 `components/scenes/create/node-canvas/primitives.tsx:100` XIcon 을 20 으로 그린다)다. 좌표가 LOUIS `icon/x` 와 같지만 제품이 제 인라인 그림을 그린다.",
  },
  // 2026-10-08 — 오류 경계였던 세션 화면(`/nodecanvas?project=` · `/highlight/[projectId]/shorts/[shortId]`)을 fixture CDN 주소를 세워 다시 잰 뒤 처음 잰 글리프 셋.
  {
    id: "question-circle-lucide",
    signature: "0 0 24 24|path(d=M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20Z)|path(d=M9.1 9a3 3 0 0 1 5.8 1c0 2-2.9 3-2.9 3)|path(d=M12 17h.01)",
    louis: "icon/question-circle",
    verdict: "bespoke",
    why: "노드 머리의 도움말 단추(`aria-label` 「Help for Text node」, `components/scenes/create/node-canvas-v2/components/NodeHeaderActions.tsx:104-125` NodeHelpAction 이 `ToolbarIconQuestion` 으로 `icons/nodeGlyphs.ts:240-248` 의 lucide `circle-help` 경로를 그린다 — 원도 `<path>` 다)다. LOUIS 에 같은 뜻의 `icon/question-circle` 이 있지만 좌표가 조금 다르고(9.09 · 5.83 대 9.1 · 5.8) 제품은 그것을 물지 않고 제 인라인 그림을 그린다.",
  },
  {
    id: "check-stroke-badge",
    signature: "0 0 24 24|path(d=M5 12.5l4.5 4.5L19 7.5)",
    louis: null,
    verdict: "missing",
    why: "쇼츠 결과 머리의 「완료」 배지 아이콘(`app/highlight/[projectId]/shorts/[shortId]/page.tsx:1856-1860` — `louis-badge__icon` 안 24 상자 획 2.2 선 체크 하나)이다. 요금 화면의 `check-stroke` 와 같은 결의 다른 좌표다. LOUIS 에는 원 안의 체크(`check-circle`)뿐이라 같은 그림이 없다.",
  },
  {
    id: "download-tray-line",
    signature: "0 0 24 24|g()|path(d=M12 4v11)|path(d=M7.5 10.5L12 15l4.5-4.5)|path(d=M5 19.5h14)",
    louis: "icon/download-simple",
    verdict: "bespoke",
    why: "쇼츠 결과 내보내기 목록의 「저장」 행 아이콘(`app/highlight/[projectId]/shorts/[shortId]/page.tsx:1899-1907` — 20 으로 그리는 24 상자, 획 1.7 을 `<g>` 에 둔 아래 화살표와 바닥 선)이다. LOUIS 에 같은 뜻의 `icon/download-simple` 이 있지만 그쪽은 열린 트레이고 제품은 바닥 선 하나를 제 인라인 그림으로 그린다.",
  },
  // 2026-10-08 밤 — 앵커 54b62a8a(하이라이트 새 화면 갈래)에서 처음 잰 글리프.
  {
    id: "alert-circle-studio",
    signature: "0 0 24 24|g()|circle(cx=12 cy=12 r=8.5)|path(d=M12 7.5v5.5)|path(d=M12 16.3v.2)",
    louis: null,
    verdict: "missing",
    why: "하이라이트 스튜디오 판의 느낌표 원(`components/scenes/highlight/HighlightStudioBoard.tsx:200-202` StudioAlert 의 danger 아이콘 · `:994-996` 무대 아래 막대의 멈춤 안내 — 16 으로 그리는 24 상자, 획 1.8 을 `<g>` 에 둔 원 · 세로 선 · 점)이다. LOUIS 에는 점이 위 · 선이 아래인 `icon/info` 뿐이고 선이 위 · 점이 아래인 경고 원은 없다.",
  },
  {
    id: "waveform-32",
    signature: "0 0 32 32|path(d=M6 12V20)|path(d=M11 4V28)|path(d=M16 8V24)|path(d=M21 12V20)|path(d=M26 10V22)",
    louis: "icon/waveform",
    verdict: "bespoke",
    why: "노드캔버스 오디오 채널의 파형 글리프(`components/scenes/create/node-canvas-v2/icons/nodeGlyphs.ts:149-160` `waveform` — 32 상자 세로 막대 다섯)다. TTS · 사운드 노드의 오른쪽 출력 연결 버튼과 편집 노드의 왼쪽 오디오 입력 연결 버튼이 쓴다. LOUIS `icon/waveform` 이 같은 그림(24 상자 `<line>`)이지만 제품은 그것을 물지 않고 제 인라인 경로를 그린다.",
  },
  {
    id: "youtube-logo-32",
    signature: "0 0 32 32|path(d=M2.6665 16.0003C2.6665 11.6003 2.6665 9.40033 4.6185 8.03366C6.57317 6.66699 9.7145 6.66699 15.9998 6.66699C22.2852 6.66699 25.4278 6.66699 27.3798 8.03366C29.3318 9.40033 29.3332 11.6003 29.3332 16.0003C29.3332 20.4003 29.3332 22.6003 27.3798 23.967C25.4292 25.3337 22.2852 25.3337 15.9998 25.3337C9.7145 25.3337 6.57184 25.3337 4.6185 23.967C2.66517 22.6003 2.6665 20.4003 2.6665 16.0003Z)|path(d=M14 13.2112V18.7898C14.0004 18.8616 14.0148 18.9326 14.0426 18.9988C14.0704 19.065 14.111 19.1251 14.162 19.1756C14.213 19.2261 14.2735 19.2661 14.3399 19.2933C14.4064 19.3204 14.4775 19.3342 14.5493 19.3338C14.6575 19.3352 14.7635 19.3035 14.8533 19.2432L19.0867 16.4778C19.162 16.4291 19.224 16.3623 19.267 16.2836C19.3101 16.2049 19.3328 16.1167 19.3332 16.0269C19.3336 15.9372 19.3116 15.8488 19.2693 15.7697C19.227 15.6906 19.1656 15.6233 19.0907 15.5738L14.8573 12.7605C14.7363 12.6795 14.5882 12.6495 14.4452 12.6769C14.3022 12.7044 14.1758 12.7871 14.0933 12.9072C14.032 12.9967 13.9995 13.1027 14 13.2112Z)",
    louis: "icon/youtube-logo",
    verdict: "bespoke",
    why: "YouTube 노드 머리의 로고 글리프(`components/scenes/create/node-canvas-v2/icons/nodeGlyphs.ts:119-131` `youtube` — 32 상자 둥근 화면 · 재생 삼각형 획)다. LOUIS `icon/youtube-logo` 와 같은 그림이지만 제품이 제 인라인 경로를 그린다. 분석 화면의 채워진 브랜드 로고(`youtube-logo`)와는 다른 그림이다.",
  },
  {
    id: "instagram-logo-32",
    signature: "0 0 32 32|path(d=M16 21C18.7614 21 21 18.7614 21 16C21 13.2386 18.7614 11 16 11C13.2386 11 11 13.2386 11 16C11 18.7614 13.2386 21 16 21Z)|path(d=M22 4H10C6.68629 4 4 6.68629 4 10V22C4 25.3137 6.68629 28 10 28H22C25.3137 28 28 25.3137 28 22V10C28 6.68629 25.3137 4 22 4Z)|path(d=M22.5 11C23.3284 11 24 10.3284 24 9.5C24 8.67157 23.3284 8 22.5 8C21.6716 8 21 8.67157 21 9.5C21 10.3284 21.6716 11 22.5 11Z)",
    louis: "icon/instagram-logo",
    verdict: "bespoke",
    why: "Instagram 노드 머리의 로고 글리프(`components/scenes/create/node-canvas-v2/icons/nodeGlyphs.ts:132-148` `instagram` — 32 상자 둥근 사각 · 렌즈 원 · 점)다. LOUIS `icon/instagram-logo` 와 같은 그림이지만 제품이 제 인라인 경로를 그린다. 256 상자로 채운 브랜드 로고(`instagram-logo-256`)와는 다른 그림이다.",
  },
  {
    id: "music-notes-32",
    signature: "0 0 32 32|path(d=M22.5 24C24.433 24 26 22.433 26 20.5C26 18.567 24.433 17 22.5 17C20.567 17 19 18.567 19 20.5C19 22.433 20.567 24 22.5 24Z)|path(d=M6.5 28C8.433 28 10 26.433 10 24.5C10 22.567 8.433 21 6.5 21C4.567 21 3 22.567 3 24.5C3 26.433 4.567 28 6.5 28Z)|path(d=M10 24.5V7L26 3V20.5)",
    louis: "icon/music-notes-simple",
    verdict: "bespoke",
    why: "사운드(BGM) 노드 머리의 두 음표 글리프(`components/scenes/create/node-canvas-v2/icons/nodeGlyphs.ts:178-194` `musicNotes` — 32 상자)다. LOUIS `icon/music-notes-simple` 과 같은 그림이지만 제품이 제 인라인 경로를 그린다. 모바일 편집기의 lucide 결 음표(`music-note-double-lucide`)와는 다른 그림이다.",
  },
  {
    id: "film-slate-32",
    signature: "0 0 32 32|path(d=M4 14H28V24.5C28 26.4 26.4 28 24.5 28H7.5C5.6 28 4 26.4 4 24.5V14Z)|path(d=M4.34 8.79L24.8 4.07A1.5 1.5 0 0 1 26.6 5.19L27.05 7.14A1.5 1.5 0 0 1 25.92 8.94L5.46 13.66A1.5 1.5 0 0 1 3.66 12.54L3.21 10.59A1.5 1.5 0 0 1 4.34 8.79Z)|path(d=M9.83 8.14L13.22 11.26M16.85 6.52L20.23 9.64)",
    louis: "icon/film-slate",
    verdict: "bespoke",
    why: "편집(Composition) 노드 머리의 슬레이트 글리프(`components/scenes/create/node-canvas-v2/icons/nodeGlyphs.ts:104-118` `filmSlate` — 32 상자 본체 · 13° 들린 윗판 · 줄무늬)다. LOUIS `icon/film-slate` 와 같은 그림이지만 제품이 제 인라인 경로를 그린다.",
  },
  {
    id: "user-sound-32",
    signature: "0 0 32 32|path(d=M6 13.5C6 17.6421 9.35786 21 13.5 21C16.4262 21 18.961 19.3242 20.1971 16.8799L15.7754 13.3799L20.1837 10.0937C18.9428 7.66379 16.4157 6 13.5 6C9.35786 6 6 9.35786 6 13.5Z)|path(d=M3 26C5.56875 22.9437 9.195 21 13.5 21C17.805 21 21.4313 22.9437 24 26)|path(d=M25 8.59277C25.6599 10.1447 26 11.8138 26 13.5003C26 15.1867 25.6599 16.8558 25 18.4078)|path(d=M28.6699 7C29.5475 9.05467 29.9999 11.2658 29.9999 13.5C29.9999 15.7342 29.5475 17.9453 28.6699 20)",
    louis: "icon/user-sound",
    verdict: "bespoke",
    why: "TTS 노드 머리의 말하는 사람 글리프(`components/scenes/create/node-canvas-v2/icons/nodeGlyphs.ts:161-177` `userSound` — 32 상자 머리 · 어깨 · 음파 둘)다. LOUIS `icon/user-sound` 와 같은 그림이지만 제품이 제 인라인 경로를 그린다.",
  },
  {
    id: "monitor-arrow-up-32",
    signature: "0 0 32 32|path(d=M6 24L26 24C27.1046 24 28 23.1046 28 22L28 8C28 6.89543 27.1046 6 26 6L6 6C4.89543 6 4 6.89543 4 8L4 22C4 23.1046 4.89543 24 6 24Z)|path(d=M20 28H12)|path(d=M13 14L16 11L19 14)|path(d=M16 11V19)",
    louis: "icon/monitor-arrow-up",
    verdict: "bespoke",
    why: "YouTube 노드의 「Upload」 · Instagram 노드의 「Post to Instagram」 게시 단추 아이콘(`components/scenes/create/node-canvas-v2/icons/MonitorArrowUpIcon.tsx:24-40` — 32 상자 화면 · 받침 · 위 화살표)이다. LOUIS `icon/monitor-arrow-up` 과 같은 그림이지만 제품이 제 인라인 경로를 그린다.",
  },
  {
    id: "upload-simple-32",
    signature: "0 0 32 32|path(d=M16 21V5)|path(d=M9 12L16 5L23 12)|path(d=M5 27H27)",
    louis: null,
    verdict: "missing",
    why: "사운드(BGM) 노드 탭 줄의 「Upload」 탭 아이콘(`components/scenes/create/node-canvas-v2/icons/UploadSimpleIcon.tsx:27-57` — 32 상자 위 화살표 · 바닥선)이다. LOUIS 에는 `icon/arrow-up` · `icon/cloud-arrow-up` 만 있고 바닥선이 있는 업로드 화살표는 없다(편집기 에셋 패널의 `upload-arrow-tray` 와 같은 결의 다른 좌표).",
  },
  {
    id: "microphone-lucide",
    signature: "0 0 24 24|path(d=M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z)|path(d=M19 10v2a7 7 0 0 1-14 0v-2)|line(x1=12 y1=19 x2=12 y2=22)",
    louis: null,
    verdict: "missing",
    why: "사운드(BGM) 노드 메타 줄의 보컬 칩(「Instrumental」) 아이콘(`components/scenes/create/node-canvas-v2/nodes/BgmNode.tsx:698-713` MicIcon — lucide `mic` 결 24 상자 캡슐 · 받침 호 · 세로 선)이다. LOUIS 아이콘에 마이크 그림이 없다.",
  },
  // 2026-10-15 — 분석 화면 연결 상태(상태 레시피 analytics, 앵커 54b62a8a)에서 처음 잰 글리프. 스파크라인 · 도넛은 아이콘이 아니라 시드 값으로 그린
  // 데이터 그림이다 — 서명이 시드에 묶여 시드를 바꾸면 이 줄도 바뀐다(이름 없이 두면 보드에서 빈 상자가 된다).
  {
    id: "kpi-sparkline-overview-1",
    signature: "0 0 800 200|path(d=M0,88.8 C9.88,84.53 19.75,80.47 29.63,76.64 C39.51,72.81 49.38,69.04 59.26,65.76 C69.14,62.48 79.01,59.21 88.89,56.8 C98.77,54.39 108.64,51.97 118.52,50.72 C128.4,49.47 138.27,48 148.15,48 C158.02,48 167.9,48.36 177.78,48.8 C187.65,49.24 197.53,51.14 207.41,52.8 C217.28,54.46 227.16,56.89 237.04,59.36 C246.91,61.83 256.79,64.86 266.67,67.84 C276.54,70.82 286.42,74.22 296.3,77.28 C306.17,80.34 316.05,83.48 325.93,86.24 C335.8,89 345.68,91.83 355.56,93.92 C365.43,96.01 375.31,98.1 385.19,99.2 C395.06,100.3 404.94,101.6 414.81,101.6 C424.69,101.6 434.57,101.08 444.44,100.48 C454.32,99.88 464.2,97.87 474.07,96 C483.95,94.13 493.83,91.37 503.7,88.48 C513.58,85.59 523.46,81.88 533.33,78.24 C543.21,74.6 553.09,70.53 562.96,66.56 C572.84,62.59 582.72,58.37 592.59,54.4 C602.47,50.43 612.35,46.33 622.22,42.72 C632.1,39.11 641.98,35.48 651.85,32.64 C661.73,29.8 671.6,27.14 681.48,25.28 C691.36,23.42 701.23,21.25 711.11,20.8 C720.99,20.35 730.86,20 740.74,20 C750.62,20 760.49,21.29 770.37,22.4 C780.25,23.51 790.12,25.52 800,27.84 L800,172 L0,172 Z)|path(d=M0,88.8 C9.88,84.53 19.75,80.47 29.63,76.64 C39.51,72.81 49.38,69.04 59.26,65.76 C69.14,62.48 79.01,59.21 88.89,56.8 C98.77,54.39 108.64,51.97 118.52,50.72 C128.4,49.47 138.27,48 148.15,48 C158.02,48 167.9,48.36 177.78,48.8 C187.65,49.24 197.53,51.14 207.41,52.8 C217.28,54.46 227.16,56.89 237.04,59.36 C246.91,61.83 256.79,64.86 266.67,67.84 C276.54,70.82 286.42,74.22 296.3,77.28 C306.17,80.34 316.05,83.48 325.93,86.24 C335.8,89 345.68,91.83 355.56,93.92 C365.43,96.01 375.31,98.1 385.19,99.2 C395.06,100.3 404.94,101.6 414.81,101.6 C424.69,101.6 434.57,101.08 444.44,100.48 C454.32,99.88 464.2,97.87 474.07,96 C483.95,94.13 493.83,91.37 503.7,88.48 C513.58,85.59 523.46,81.88 533.33,78.24 C543.21,74.6 553.09,70.53 562.96,66.56 C572.84,62.59 582.72,58.37 592.59,54.4 C602.47,50.43 612.35,46.33 622.22,42.72 C632.1,39.11 641.98,35.48 651.85,32.64 C661.73,29.8 671.6,27.14 681.48,25.28 C691.36,23.42 701.23,21.25 711.11,20.8 C720.99,20.35 730.86,20 740.74,20 C750.62,20 760.49,21.29 770.37,22.4 C780.25,23.51 790.12,25.52 800,27.84 pathLength=100)",
    louis: null,
    verdict: "missing",
    why: "분석 KPI 카드의 스파크라인(`components/scenes/analytics/shared.tsx:463-512` KpiSparkline — 800×200 viewBox 에 일별 시계열을 곡선으로 그린 데이터 그림)이다. 아이콘이 아니라 측정 시드(`migration/measure-states/data/analytics/channel-core.json`)의 값으로 그려지는 모양이라 LOUIS 대응이 없다. overview 탭 KPI 줄의 1번째 카드.",
  },
  {
    id: "kpi-sparkline-overview-2",
    signature: "0 0 800 200|path(d=M0,87.91 C9.88,83.59 19.75,79.55 29.63,75.88 C39.51,72.21 49.38,68.59 59.26,65.73 C69.14,62.86 79.01,59.99 88.89,58.27 C98.77,56.55 108.64,54.38 118.52,54.32 C128.4,54.26 138.27,54.23 148.15,54.23 C158.02,54.23 167.9,56.21 177.78,57.73 C187.65,59.25 197.53,61.82 207.41,64.29 C217.28,66.76 227.16,69.8 237.04,72.82 C246.91,75.85 256.79,79.26 266.67,82.52 C276.54,85.79 286.42,89.3 296.3,92.41 C306.17,95.51 316.05,98.57 325.93,101.21 C335.8,103.85 345.68,106.51 355.56,108.4 C365.43,110.28 375.31,112.14 385.19,113.07 C395.06,113.99 404.94,115.04 414.81,115.04 C424.69,115.04 434.57,114.44 444.44,113.79 C454.32,113.13 464.2,111.16 474.07,109.3 C483.95,107.43 493.83,104.73 503.7,101.84 C513.58,98.95 523.46,95.25 533.33,91.51 C543.21,87.76 553.09,83.49 562.96,79.2 C572.84,74.91 582.72,70.23 592.59,65.73 C602.47,61.22 612.35,56.5 622.22,52.16 C632.1,47.83 641.98,43.37 651.85,39.67 C661.73,35.98 671.6,32.42 681.48,29.7 C691.36,26.98 701.23,24.11 711.11,22.78 C720.99,21.46 730.86,20 740.74,20 C750.62,20 760.49,20.59 770.37,21.26 C780.25,21.93 790.12,23.98 800,26.29 L800,172 L0,172 Z)|path(d=M0,87.91 C9.88,83.59 19.75,79.55 29.63,75.88 C39.51,72.21 49.38,68.59 59.26,65.73 C69.14,62.86 79.01,59.99 88.89,58.27 C98.77,56.55 108.64,54.38 118.52,54.32 C128.4,54.26 138.27,54.23 148.15,54.23 C158.02,54.23 167.9,56.21 177.78,57.73 C187.65,59.25 197.53,61.82 207.41,64.29 C217.28,66.76 227.16,69.8 237.04,72.82 C246.91,75.85 256.79,79.26 266.67,82.52 C276.54,85.79 286.42,89.3 296.3,92.41 C306.17,95.51 316.05,98.57 325.93,101.21 C335.8,103.85 345.68,106.51 355.56,108.4 C365.43,110.28 375.31,112.14 385.19,113.07 C395.06,113.99 404.94,115.04 414.81,115.04 C424.69,115.04 434.57,114.44 444.44,113.79 C454.32,113.13 464.2,111.16 474.07,109.3 C483.95,107.43 493.83,104.73 503.7,101.84 C513.58,98.95 523.46,95.25 533.33,91.51 C543.21,87.76 553.09,83.49 562.96,79.2 C572.84,74.91 582.72,70.23 592.59,65.73 C602.47,61.22 612.35,56.5 622.22,52.16 C632.1,47.83 641.98,43.37 651.85,39.67 C661.73,35.98 671.6,32.42 681.48,29.7 C691.36,26.98 701.23,24.11 711.11,22.78 C720.99,21.46 730.86,20 740.74,20 C750.62,20 760.49,20.59 770.37,21.26 C780.25,21.93 790.12,23.98 800,26.29 pathLength=100)",
    louis: null,
    verdict: "missing",
    why: "분석 KPI 카드의 스파크라인(`components/scenes/analytics/shared.tsx:463-512` KpiSparkline — 800×200 viewBox 에 일별 시계열을 곡선으로 그린 데이터 그림)이다. 아이콘이 아니라 측정 시드(`migration/measure-states/data/analytics/channel-core.json`)의 값으로 그려지는 모양이라 LOUIS 대응이 없다. overview 탭 KPI 줄의 2번째 카드.",
  },
  {
    id: "kpi-sparkline-overview-3",
    signature: "0 0 800 200|path(d=M0,85.14 C9.88,81.52 19.75,77.9 29.63,74.29 C39.51,70.67 49.38,68.25 59.26,63.43 C69.14,58.6 79.01,46.54 88.89,41.71 C98.77,36.89 108.64,34.48 118.52,30.86 C128.4,27.24 138.27,20 148.15,20 C158.02,20 167.9,20 177.78,20 C187.65,20 197.53,20 207.41,20 C217.28,20 227.16,30.86 237.04,30.86 C246.91,30.86 256.79,30.86 266.67,30.86 C276.54,30.86 286.42,47.75 296.3,52.57 C306.17,57.4 316.05,58.6 325.93,63.43 C335.8,68.25 345.68,80.32 355.56,85.14 C365.43,89.97 375.31,92.38 385.19,96 C395.06,99.62 404.94,103.24 414.81,106.86 C424.69,110.48 434.57,114.1 444.44,117.71 C454.32,121.33 464.2,128.57 474.07,128.57 C483.95,128.57 493.83,117.71 503.7,117.71 C513.58,117.71 523.46,117.71 533.33,117.71 C543.21,117.71 553.09,110.48 562.96,106.86 C572.84,103.24 582.72,99.62 592.59,96 C602.47,92.38 612.35,88.76 622.22,85.14 C632.1,81.52 641.98,77.9 651.85,74.29 C661.73,70.67 671.6,63.43 681.48,63.43 C691.36,63.43 701.23,63.43 711.11,63.43 C720.99,63.43 730.86,52.57 740.74,52.57 C750.62,52.57 760.49,52.57 770.37,52.57 C780.25,52.57 790.12,52.57 800,52.57 L800,172 L0,172 Z)|path(d=M0,85.14 C9.88,81.52 19.75,77.9 29.63,74.29 C39.51,70.67 49.38,68.25 59.26,63.43 C69.14,58.6 79.01,46.54 88.89,41.71 C98.77,36.89 108.64,34.48 118.52,30.86 C128.4,27.24 138.27,20 148.15,20 C158.02,20 167.9,20 177.78,20 C187.65,20 197.53,20 207.41,20 C217.28,20 227.16,30.86 237.04,30.86 C246.91,30.86 256.79,30.86 266.67,30.86 C276.54,30.86 286.42,47.75 296.3,52.57 C306.17,57.4 316.05,58.6 325.93,63.43 C335.8,68.25 345.68,80.32 355.56,85.14 C365.43,89.97 375.31,92.38 385.19,96 C395.06,99.62 404.94,103.24 414.81,106.86 C424.69,110.48 434.57,114.1 444.44,117.71 C454.32,121.33 464.2,128.57 474.07,128.57 C483.95,128.57 493.83,117.71 503.7,117.71 C513.58,117.71 523.46,117.71 533.33,117.71 C543.21,117.71 553.09,110.48 562.96,106.86 C572.84,103.24 582.72,99.62 592.59,96 C602.47,92.38 612.35,88.76 622.22,85.14 C632.1,81.52 641.98,77.9 651.85,74.29 C661.73,70.67 671.6,63.43 681.48,63.43 C691.36,63.43 701.23,63.43 711.11,63.43 C720.99,63.43 730.86,52.57 740.74,52.57 C750.62,52.57 760.49,52.57 770.37,52.57 C780.25,52.57 790.12,52.57 800,52.57)",
    louis: null,
    verdict: "missing",
    why: "분석 KPI 카드의 스파크라인(`components/scenes/analytics/shared.tsx:463-512` KpiSparkline — 800×200 viewBox 에 일별 시계열을 곡선으로 그린 데이터 그림)이다. 아이콘이 아니라 측정 시드(`migration/measure-states/data/analytics/channel-core.json`)의 값으로 그려지는 모양이라 LOUIS 대응이 없다. overview 탭 KPI 줄의 3번째 카드.",
  },
  {
    id: "kpi-sparkline-overview-4",
    signature: "0 0 800 200|path(d=M0,88.88 C9.88,84.52 19.75,80.52 29.63,77 C39.51,73.48 49.38,70.67 59.26,67.5 C69.14,64.33 79.01,60.71 88.89,58 C98.77,55.29 108.64,52.06 118.52,50.88 C128.4,49.69 138.27,48.5 148.15,48.5 C158.02,48.5 167.9,48.5 177.78,48.5 C187.65,48.5 197.53,51.35 207.41,53.25 C217.28,55.15 227.16,58 237.04,60.38 C246.91,62.75 256.79,64.79 266.67,67.5 C276.54,70.21 286.42,73.83 296.3,77 C306.17,80.17 316.05,83.79 325.93,86.5 C335.8,89.21 345.68,91.25 355.56,93.63 C365.43,96 375.31,99.56 385.19,100.75 C395.06,101.94 404.94,103.13 414.81,103.13 C424.69,103.13 434.57,101.81 444.44,100.75 C454.32,99.69 464.2,97.9 474.07,96 C483.95,94.1 493.83,91.59 503.7,88.88 C513.58,86.16 523.46,82.89 533.33,79.38 C543.21,75.86 553.09,71.46 562.96,67.5 C572.84,63.54 582.72,59.58 592.59,55.63 C602.47,51.67 612.35,47.27 622.22,43.75 C632.1,40.23 641.98,36.96 651.85,34.25 C661.73,31.54 671.6,29.03 681.48,27.13 C691.36,25.23 701.23,23.43 711.11,22.38 C720.99,21.32 730.86,20 740.74,20 C750.62,20 760.49,21.19 770.37,22.38 C780.25,23.56 790.12,26.33 800,29.5 L800,172 L0,172 Z)|path(d=M0,88.88 C9.88,84.52 19.75,80.52 29.63,77 C39.51,73.48 49.38,70.67 59.26,67.5 C69.14,64.33 79.01,60.71 88.89,58 C98.77,55.29 108.64,52.06 118.52,50.88 C128.4,49.69 138.27,48.5 148.15,48.5 C158.02,48.5 167.9,48.5 177.78,48.5 C187.65,48.5 197.53,51.35 207.41,53.25 C217.28,55.15 227.16,58 237.04,60.38 C246.91,62.75 256.79,64.79 266.67,67.5 C276.54,70.21 286.42,73.83 296.3,77 C306.17,80.17 316.05,83.79 325.93,86.5 C335.8,89.21 345.68,91.25 355.56,93.63 C365.43,96 375.31,99.56 385.19,100.75 C395.06,101.94 404.94,103.13 414.81,103.13 C424.69,103.13 434.57,101.81 444.44,100.75 C454.32,99.69 464.2,97.9 474.07,96 C483.95,94.1 493.83,91.59 503.7,88.88 C513.58,86.16 523.46,82.89 533.33,79.38 C543.21,75.86 553.09,71.46 562.96,67.5 C572.84,63.54 582.72,59.58 592.59,55.63 C602.47,51.67 612.35,47.27 622.22,43.75 C632.1,40.23 641.98,36.96 651.85,34.25 C661.73,31.54 671.6,29.03 681.48,27.13 C691.36,25.23 701.23,23.43 711.11,22.38 C720.99,21.32 730.86,20 740.74,20 C750.62,20 760.49,21.19 770.37,22.38 C780.25,23.56 790.12,26.33 800,29.5)",
    louis: null,
    verdict: "missing",
    why: "분석 KPI 카드의 스파크라인(`components/scenes/analytics/shared.tsx:463-512` KpiSparkline — 800×200 viewBox 에 일별 시계열을 곡선으로 그린 데이터 그림)이다. 아이콘이 아니라 측정 시드(`migration/measure-states/data/analytics/channel-core.json`)의 값으로 그려지는 모양이라 LOUIS 대응이 없다. overview 탭 KPI 줄의 4번째 카드.",
  },
  {
    id: "kpi-sparkline-overview-5",
    signature: "0 0 800 200|path(d=M0,20 C9.88,20 19.75,20 29.63,20 C39.51,20 49.38,50.4 59.26,50.4 C69.14,50.4 79.01,50.4 88.89,50.4 C98.77,50.4 108.64,70.67 118.52,80.8 C128.4,90.93 138.27,111.2 148.15,111.2 C158.02,111.2 167.9,111.2 177.78,111.2 C187.65,111.2 197.53,141.6 207.41,141.6 C217.28,141.6 227.16,141.6 237.04,141.6 C246.91,141.6 256.79,141.6 266.67,141.6 C276.54,141.6 286.42,141.6 296.3,141.6 C306.17,141.6 316.05,111.2 325.93,111.2 C335.8,111.2 345.68,111.2 355.56,111.2 C365.43,111.2 375.31,90.93 385.19,80.8 C395.06,70.67 404.94,50.4 414.81,50.4 C424.69,50.4 434.57,50.4 444.44,50.4 C454.32,50.4 464.2,20 474.07,20 C483.95,20 493.83,20 503.7,20 C513.58,20 523.46,20 533.33,20 C543.21,20 553.09,50.4 562.96,50.4 C572.84,50.4 582.72,50.4 592.59,50.4 C602.47,50.4 612.35,70.67 622.22,80.8 C632.1,90.93 641.98,111.2 651.85,111.2 C661.73,111.2 671.6,111.2 681.48,111.2 C691.36,111.2 701.23,141.6 711.11,141.6 C720.99,141.6 730.86,141.6 740.74,141.6 C750.62,141.6 760.49,141.6 770.37,141.6 C780.25,141.6 790.12,141.6 800,141.6 L800,172 L0,172 Z)|path(d=M0,20 C9.88,20 19.75,20 29.63,20 C39.51,20 49.38,50.4 59.26,50.4 C69.14,50.4 79.01,50.4 88.89,50.4 C98.77,50.4 108.64,70.67 118.52,80.8 C128.4,90.93 138.27,111.2 148.15,111.2 C158.02,111.2 167.9,111.2 177.78,111.2 C187.65,111.2 197.53,141.6 207.41,141.6 C217.28,141.6 227.16,141.6 237.04,141.6 C246.91,141.6 256.79,141.6 266.67,141.6 C276.54,141.6 286.42,141.6 296.3,141.6 C306.17,141.6 316.05,111.2 325.93,111.2 C335.8,111.2 345.68,111.2 355.56,111.2 C365.43,111.2 375.31,90.93 385.19,80.8 C395.06,70.67 404.94,50.4 414.81,50.4 C424.69,50.4 434.57,50.4 444.44,50.4 C454.32,50.4 464.2,20 474.07,20 C483.95,20 493.83,20 503.7,20 C513.58,20 523.46,20 533.33,20 C543.21,20 553.09,50.4 562.96,50.4 C572.84,50.4 582.72,50.4 592.59,50.4 C602.47,50.4 612.35,70.67 622.22,80.8 C632.1,90.93 641.98,111.2 651.85,111.2 C661.73,111.2 671.6,111.2 681.48,111.2 C691.36,111.2 701.23,141.6 711.11,141.6 C720.99,141.6 730.86,141.6 740.74,141.6 C750.62,141.6 760.49,141.6 770.37,141.6 C780.25,141.6 790.12,141.6 800,141.6)",
    louis: null,
    verdict: "missing",
    why: "분석 KPI 카드의 스파크라인(`components/scenes/analytics/shared.tsx:463-512` KpiSparkline — 800×200 viewBox 에 일별 시계열을 곡선으로 그린 데이터 그림)이다. 아이콘이 아니라 측정 시드(`migration/measure-states/data/analytics/channel-core.json`)의 값으로 그려지는 모양이라 LOUIS 대응이 없다. overview 탭 KPI 줄의 5번째 카드.",
  },
  {
    id: "kpi-sparkline-overview-6",
    signature: "0 0 800 200|path(d=M0,70.67 C9.88,70.67 19.75,70.67 29.63,70.67 C39.51,70.67 49.38,20 59.26,20 C69.14,20 79.01,20 88.89,20 C98.77,20 108.64,20 118.52,20 C128.4,20 138.27,20 148.15,20 C158.02,20 167.9,20 177.78,20 C187.65,20 197.53,20 207.41,20 C217.28,20 227.16,20 237.04,20 C246.91,20 256.79,20 266.67,20 C276.54,20 286.42,20 296.3,20 C306.17,20 316.05,20 325.93,20 C335.8,20 345.68,20 355.56,20 C365.43,20 375.31,20 385.19,20 C395.06,20 404.94,20 414.81,20 C424.69,20 434.57,70.67 444.44,70.67 C454.32,70.67 464.2,70.67 474.07,70.67 C483.95,70.67 493.83,70.67 503.7,70.67 C513.58,70.67 523.46,121.33 533.33,121.33 C543.21,121.33 553.09,121.33 562.96,121.33 C572.84,121.33 582.72,121.33 592.59,121.33 C602.47,121.33 612.35,121.33 622.22,121.33 C632.1,121.33 641.98,121.33 651.85,121.33 C661.73,121.33 671.6,121.33 681.48,121.33 C691.36,121.33 701.23,121.33 711.11,121.33 C720.99,121.33 730.86,121.33 740.74,121.33 C750.62,121.33 760.49,121.33 770.37,121.33 C780.25,121.33 790.12,121.33 800,121.33 L800,172 L0,172 Z)|path(d=M0,70.67 C9.88,70.67 19.75,70.67 29.63,70.67 C39.51,70.67 49.38,20 59.26,20 C69.14,20 79.01,20 88.89,20 C98.77,20 108.64,20 118.52,20 C128.4,20 138.27,20 148.15,20 C158.02,20 167.9,20 177.78,20 C187.65,20 197.53,20 207.41,20 C217.28,20 227.16,20 237.04,20 C246.91,20 256.79,20 266.67,20 C276.54,20 286.42,20 296.3,20 C306.17,20 316.05,20 325.93,20 C335.8,20 345.68,20 355.56,20 C365.43,20 375.31,20 385.19,20 C395.06,20 404.94,20 414.81,20 C424.69,20 434.57,70.67 444.44,70.67 C454.32,70.67 464.2,70.67 474.07,70.67 C483.95,70.67 493.83,70.67 503.7,70.67 C513.58,70.67 523.46,121.33 533.33,121.33 C543.21,121.33 553.09,121.33 562.96,121.33 C572.84,121.33 582.72,121.33 592.59,121.33 C602.47,121.33 612.35,121.33 622.22,121.33 C632.1,121.33 641.98,121.33 651.85,121.33 C661.73,121.33 671.6,121.33 681.48,121.33 C691.36,121.33 701.23,121.33 711.11,121.33 C720.99,121.33 730.86,121.33 740.74,121.33 C750.62,121.33 760.49,121.33 770.37,121.33 C780.25,121.33 790.12,121.33 800,121.33)",
    louis: null,
    verdict: "missing",
    why: "분석 KPI 카드의 스파크라인(`components/scenes/analytics/shared.tsx:463-512` KpiSparkline — 800×200 viewBox 에 일별 시계열을 곡선으로 그린 데이터 그림)이다. 아이콘이 아니라 측정 시드(`migration/measure-states/data/analytics/channel-core.json`)의 값으로 그려지는 모양이라 LOUIS 대응이 없다. overview 탭 KPI 줄의 6번째 카드.",
  },
  {
    id: "visibility-public-globe-16",
    signature: "0 0 16 16|circle(cx=8 cy=8 r=5.5)|path(d=M2.9 8h10.2M8 2.5c1.4 1.5 2.2 3.4 2.2 5.5S9.4 12 8 13.5M8 2.5C6.6 4 5.8 5.9 5.8 8s0.8 4 2.2 5.5)",
    louis: null,
    verdict: "missing",
    why: "분석 콘텐츠 표의 공개 상태 아이콘(`components/scenes/analytics/ContentTable.tsx:384-394` renderVisibilityIcon public — 16 상자 원 · 경선 · 적도)이다. LOUIS 아이콘에 지구 그림이 없다.",
  },
  {
    id: "visibility-unlisted-link-16",
    signature: "0 0 16 16|path(d=M6.2 9.8 4.7 11.3a2.1 2.1 0 1 1-3-3l1.8-1.8a2.1 2.1 0 0 1 3 0)|path(d=m9.8 6.2 1.5-1.5a2.1 2.1 0 1 1 3 3l-1.8 1.8a2.1 2.1 0 0 1-3 0)|path(d=m6.1 9.9 3.8-3.8)",
    louis: null,
    verdict: "missing",
    why: "분석 콘텐츠 표의 일부 공개 상태 아이콘(`components/scenes/analytics/ContentTable.tsx:396-416` renderVisibilityIcon unlisted — 16 상자 사슬 고리 둘)이다. LOUIS 아이콘에 링크 그림이 없다.",
  },
  {
    id: "content-thumb-fallback-play-24",
    signature: "0 0 24 24|rect(rx=2 x=2 y=2 width=20 height=20)|path(d=M10 8l6 4-6 4V8z)",
    louis: null,
    verdict: "missing",
    why: "분석 콘텐츠 표에서 썸네일이 없는 행의 대체 그림(`components/scenes/analytics/ContentTable.tsx:625-638` — 24 상자 둥근 사각 획 · 채운 재생 삼각형)이다. LOUIS 에는 둥근 사각 안 재생 그림이 없다.",
  },
  {
    id: "visibility-private-lock-16",
    signature: "0 0 16 16|rect(rx=1.8 x=3 y=7 width=10 height=6)|path(d=M5.5 7V5.8A2.5 2.5 0 0 1 8 3.3a2.5 2.5 0 0 1 2.5 2.5V7)",
    louis: null,
    verdict: "missing",
    why: "분석 콘텐츠 표의 비공개 상태 아이콘(`components/scenes/analytics/ContentTable.tsx:418-438` renderVisibilityIcon private — 16 상자 자물쇠 몸통 · 고리)이다. LOUIS 아이콘에 자물쇠 그림이 없다.",
  },
  {
    id: "visibility-draft-pencil-16",
    signature: "0 0 16 16|path(d=m4 11.7 6.6-6.6 1.7 1.7L5.7 13.4 3 14l.6-2.3Z)|path(d=m9.9 4.4 1.7-1.7 1.7 1.7-1.7 1.7)",
    louis: null,
    verdict: "missing",
    why: "분석 콘텐츠 표의 초안 상태 아이콘(`components/scenes/analytics/ContentTable.tsx:439-449` renderVisibilityIcon draft — 16 상자 연필)이다. LOUIS 아이콘에 연필 그림이 없다.",
  },
  {
    id: "kpi-sparkline-performance-1",
    signature: "0 0 800 200|path(d=M0,20.02 C9.88,20.02 19.75,20.22 29.63,20.42 C39.51,20.61 49.38,21.09 59.26,21.57 C69.14,22.06 79.01,22.8 88.89,23.54 C98.77,24.28 108.64,25.15 118.52,26.08 C128.4,27.01 138.27,28.1 148.15,29.17 C158.02,30.24 167.9,31.36 177.78,32.52 C187.65,33.67 197.53,34.93 207.41,36.11 C217.28,37.29 227.16,38.48 237.04,39.59 C246.91,40.71 256.79,41.82 266.67,42.82 C276.54,43.82 286.42,44.8 296.3,45.63 C306.17,46.46 316.05,47.24 325.93,47.87 C335.8,48.5 345.68,49.15 355.56,49.5 C365.43,49.85 375.31,50.22 385.19,50.27 C395.06,50.31 404.94,50.34 414.81,50.34 C424.69,50.34 434.57,49.94 444.44,49.6 C454.32,49.26 464.2,48.57 474.07,47.93 C483.95,47.29 493.83,46.5 503.7,45.67 C513.58,44.84 523.46,43.9 533.33,42.9 C543.21,41.9 553.09,40.78 562.96,39.65 C572.84,38.52 582.72,37.28 592.59,36.1 C602.47,34.93 612.35,33.75 622.22,32.6 C632.1,31.45 641.98,30.28 651.85,29.21 C661.73,28.14 671.6,27.08 681.48,26.15 C691.36,25.22 701.23,24.34 711.11,23.59 C720.99,22.85 730.86,22.1 740.74,21.62 C750.62,21.13 760.49,20.69 770.37,20.47 C780.25,20.25 790.12,20.04 800,20 L800,172 L0,172 Z)|path(d=M0,20.02 C9.88,20.02 19.75,20.22 29.63,20.42 C39.51,20.61 49.38,21.09 59.26,21.57 C69.14,22.06 79.01,22.8 88.89,23.54 C98.77,24.28 108.64,25.15 118.52,26.08 C128.4,27.01 138.27,28.1 148.15,29.17 C158.02,30.24 167.9,31.36 177.78,32.52 C187.65,33.67 197.53,34.93 207.41,36.11 C217.28,37.29 227.16,38.48 237.04,39.59 C246.91,40.71 256.79,41.82 266.67,42.82 C276.54,43.82 286.42,44.8 296.3,45.63 C306.17,46.46 316.05,47.24 325.93,47.87 C335.8,48.5 345.68,49.15 355.56,49.5 C365.43,49.85 375.31,50.22 385.19,50.27 C395.06,50.31 404.94,50.34 414.81,50.34 C424.69,50.34 434.57,49.94 444.44,49.6 C454.32,49.26 464.2,48.57 474.07,47.93 C483.95,47.29 493.83,46.5 503.7,45.67 C513.58,44.84 523.46,43.9 533.33,42.9 C543.21,41.9 553.09,40.78 562.96,39.65 C572.84,38.52 582.72,37.28 592.59,36.1 C602.47,34.93 612.35,33.75 622.22,32.6 C632.1,31.45 641.98,30.28 651.85,29.21 C661.73,28.14 671.6,27.08 681.48,26.15 C691.36,25.22 701.23,24.34 711.11,23.59 C720.99,22.85 730.86,22.1 740.74,21.62 C750.62,21.13 760.49,20.69 770.37,20.47 C780.25,20.25 790.12,20.04 800,20)",
    louis: null,
    verdict: "missing",
    why: "분석 KPI 카드의 스파크라인(`components/scenes/analytics/shared.tsx:463-512` KpiSparkline — 800×200 viewBox 에 일별 시계열을 곡선으로 그린 데이터 그림)이다. 아이콘이 아니라 측정 시드(`migration/measure-states/data/analytics/channel-core.json`)의 값으로 그려지는 모양이라 LOUIS 대응이 없다. performance 탭 KPI 줄의 1번째 카드.",
  },
  {
    id: "kpi-sparkline-performance-2",
    signature: "0 0 800 200|path(d=M0,33.51 C9.88,32.33 19.75,31.2 29.63,30.13 C39.51,29.07 49.38,28.05 59.26,27.09 C69.14,26.14 79.01,25.23 88.89,24.39 C98.77,23.55 108.64,22.6 118.52,22.03 C128.4,21.45 138.27,20.98 148.15,20.68 C158.02,20.38 167.9,20 177.78,20 C187.65,20 197.53,20.17 207.41,20.34 C217.28,20.51 227.16,20.93 237.04,21.35 C246.91,21.77 256.79,22.38 266.67,23.04 C276.54,23.7 286.42,24.52 296.3,25.4 C306.17,26.29 316.05,27.43 325.93,28.44 C335.8,29.46 345.68,30.42 355.56,31.48 C365.43,32.55 375.31,33.74 385.19,34.86 C395.06,35.99 404.94,37.17 414.81,38.24 C424.69,39.31 434.57,40.39 444.44,41.28 C454.32,42.17 464.2,42.92 474.07,43.64 C483.95,44.37 493.83,45.22 503.7,45.67 C513.58,46.12 523.46,46.52 533.33,46.68 C543.21,46.85 553.09,47.02 562.96,47.02 C572.84,47.02 582.72,46.65 592.59,46.35 C602.47,46.05 612.35,45.54 622.22,45 C632.1,44.46 641.98,43.74 651.85,42.97 C661.73,42.2 671.6,41.22 681.48,40.27 C691.36,39.31 701.23,38.29 711.11,37.23 C720.99,36.16 730.86,34.97 740.74,33.85 C750.62,32.72 760.49,31.54 770.37,30.47 C780.25,29.4 790.12,28.39 800,27.43 L800,172 L0,172 Z)|path(d=M0,33.51 C9.88,32.33 19.75,31.2 29.63,30.13 C39.51,29.07 49.38,28.05 59.26,27.09 C69.14,26.14 79.01,25.23 88.89,24.39 C98.77,23.55 108.64,22.6 118.52,22.03 C128.4,21.45 138.27,20.98 148.15,20.68 C158.02,20.38 167.9,20 177.78,20 C187.65,20 197.53,20.17 207.41,20.34 C217.28,20.51 227.16,20.93 237.04,21.35 C246.91,21.77 256.79,22.38 266.67,23.04 C276.54,23.7 286.42,24.52 296.3,25.4 C306.17,26.29 316.05,27.43 325.93,28.44 C335.8,29.46 345.68,30.42 355.56,31.48 C365.43,32.55 375.31,33.74 385.19,34.86 C395.06,35.99 404.94,37.17 414.81,38.24 C424.69,39.31 434.57,40.39 444.44,41.28 C454.32,42.17 464.2,42.92 474.07,43.64 C483.95,44.37 493.83,45.22 503.7,45.67 C513.58,46.12 523.46,46.52 533.33,46.68 C543.21,46.85 553.09,47.02 562.96,47.02 C572.84,47.02 582.72,46.65 592.59,46.35 C602.47,46.05 612.35,45.54 622.22,45 C632.1,44.46 641.98,43.74 651.85,42.97 C661.73,42.2 671.6,41.22 681.48,40.27 C691.36,39.31 701.23,38.29 711.11,37.23 C720.99,36.16 730.86,34.97 740.74,33.85 C750.62,32.72 760.49,31.54 770.37,30.47 C780.25,29.4 790.12,28.39 800,27.43)",
    louis: null,
    verdict: "missing",
    why: "분석 KPI 카드의 스파크라인(`components/scenes/analytics/shared.tsx:463-512` KpiSparkline — 800×200 viewBox 에 일별 시계열을 곡선으로 그린 데이터 그림)이다. 아이콘이 아니라 측정 시드(`migration/measure-states/data/analytics/channel-core.json`)의 값으로 그려지는 모양이라 LOUIS 대응이 없다. performance 탭 KPI 줄의 2번째 카드.",
  },
  {
    id: "kpi-sparkline-audience-1",
    signature: "0 0 800 200|path(d=M0,60.53 C9.88,57.16 19.75,53.78 29.63,50.4 C39.51,47.02 49.38,43.64 59.26,40.27 C69.14,36.89 79.01,33.51 88.89,30.13 C98.77,26.76 108.64,20 118.52,20 C128.4,20 138.27,20 148.15,20 C158.02,20 167.9,20 177.78,20 C187.65,20 197.53,20 207.41,20 C217.28,20 227.16,30.13 237.04,30.13 C246.91,30.13 256.79,30.13 266.67,30.13 C276.54,30.13 286.42,36.89 296.3,40.27 C306.17,43.64 316.05,47.02 325.93,50.4 C335.8,53.78 345.68,57.16 355.56,60.53 C365.43,63.91 375.31,67.29 385.19,70.67 C395.06,74.04 404.94,77.42 414.81,80.8 C424.69,84.18 434.57,87.56 444.44,90.93 C454.32,94.31 464.2,101.07 474.07,101.07 C483.95,101.07 493.83,101.07 503.7,101.07 C513.58,101.07 523.46,101.07 533.33,101.07 C543.21,101.07 553.09,101.07 562.96,101.07 C572.84,101.07 582.72,94.31 592.59,90.93 C602.47,87.56 612.35,84.18 622.22,80.8 C632.1,77.42 641.98,74.04 651.85,70.67 C661.73,67.29 671.6,63.91 681.48,60.53 C691.36,57.16 701.23,53.78 711.11,50.4 C720.99,47.02 730.86,43.64 740.74,40.27 C750.62,36.89 760.49,30.13 770.37,30.13 C780.25,30.13 790.12,30.13 800,30.13 L800,172 L0,172 Z)|path(d=M0,60.53 C9.88,57.16 19.75,53.78 29.63,50.4 C39.51,47.02 49.38,43.64 59.26,40.27 C69.14,36.89 79.01,33.51 88.89,30.13 C98.77,26.76 108.64,20 118.52,20 C128.4,20 138.27,20 148.15,20 C158.02,20 167.9,20 177.78,20 C187.65,20 197.53,20 207.41,20 C217.28,20 227.16,30.13 237.04,30.13 C246.91,30.13 256.79,30.13 266.67,30.13 C276.54,30.13 286.42,36.89 296.3,40.27 C306.17,43.64 316.05,47.02 325.93,50.4 C335.8,53.78 345.68,57.16 355.56,60.53 C365.43,63.91 375.31,67.29 385.19,70.67 C395.06,74.04 404.94,77.42 414.81,80.8 C424.69,84.18 434.57,87.56 444.44,90.93 C454.32,94.31 464.2,101.07 474.07,101.07 C483.95,101.07 493.83,101.07 503.7,101.07 C513.58,101.07 523.46,101.07 533.33,101.07 C543.21,101.07 553.09,101.07 562.96,101.07 C572.84,101.07 582.72,94.31 592.59,90.93 C602.47,87.56 612.35,84.18 622.22,80.8 C632.1,77.42 641.98,74.04 651.85,70.67 C661.73,67.29 671.6,63.91 681.48,60.53 C691.36,57.16 701.23,53.78 711.11,50.4 C720.99,47.02 730.86,43.64 740.74,40.27 C750.62,36.89 760.49,30.13 770.37,30.13 C780.25,30.13 790.12,30.13 800,30.13)",
    louis: null,
    verdict: "missing",
    why: "분석 KPI 카드의 스파크라인(`components/scenes/analytics/shared.tsx:463-512` KpiSparkline — 800×200 viewBox 에 일별 시계열을 곡선으로 그린 데이터 그림)이다. 아이콘이 아니라 측정 시드(`migration/measure-states/data/analytics/channel-core.json`)의 값으로 그려지는 모양이라 LOUIS 대응이 없다. audience 탭 KPI 줄의 1번째 카드.",
  },
  {
    id: "kpi-sparkline-audience-2",
    signature: "0 0 800 200|path(d=M0,20 C9.88,20 19.75,20 29.63,20 C39.51,20 49.38,20 59.26,20 C69.14,20 79.01,70.67 88.89,70.67 C98.77,70.67 108.64,70.67 118.52,70.67 C128.4,70.67 138.27,121.33 148.15,121.33 C158.02,121.33 167.9,121.33 177.78,121.33 C187.65,121.33 197.53,121.33 207.41,121.33 C217.28,121.33 227.16,121.33 237.04,121.33 C246.91,121.33 256.79,121.33 266.67,121.33 C276.54,121.33 286.42,70.67 296.3,70.67 C306.17,70.67 316.05,70.67 325.93,70.67 C335.8,70.67 345.68,20 355.56,20 C365.43,20 375.31,20 385.19,20 C395.06,20 404.94,20 414.81,20 C424.69,20 434.57,20 444.44,20 C454.32,20 464.2,20 474.07,20 C483.95,20 493.83,70.67 503.7,70.67 C513.58,70.67 523.46,70.67 533.33,70.67 C543.21,70.67 553.09,121.33 562.96,121.33 C572.84,121.33 582.72,121.33 592.59,121.33 C602.47,121.33 612.35,121.33 622.22,121.33 C632.1,121.33 641.98,121.33 651.85,121.33 C661.73,121.33 671.6,121.33 681.48,121.33 C691.36,121.33 701.23,70.67 711.11,70.67 C720.99,70.67 730.86,70.67 740.74,70.67 C750.62,70.67 760.49,20 770.37,20 C780.25,20 790.12,20 800,20 L800,172 L0,172 Z)|path(d=M0,20 C9.88,20 19.75,20 29.63,20 C39.51,20 49.38,20 59.26,20 C69.14,20 79.01,70.67 88.89,70.67 C98.77,70.67 108.64,70.67 118.52,70.67 C128.4,70.67 138.27,121.33 148.15,121.33 C158.02,121.33 167.9,121.33 177.78,121.33 C187.65,121.33 197.53,121.33 207.41,121.33 C217.28,121.33 227.16,121.33 237.04,121.33 C246.91,121.33 256.79,121.33 266.67,121.33 C276.54,121.33 286.42,70.67 296.3,70.67 C306.17,70.67 316.05,70.67 325.93,70.67 C335.8,70.67 345.68,20 355.56,20 C365.43,20 375.31,20 385.19,20 C395.06,20 404.94,20 414.81,20 C424.69,20 434.57,20 444.44,20 C454.32,20 464.2,20 474.07,20 C483.95,20 493.83,70.67 503.7,70.67 C513.58,70.67 523.46,70.67 533.33,70.67 C543.21,70.67 553.09,121.33 562.96,121.33 C572.84,121.33 582.72,121.33 592.59,121.33 C602.47,121.33 612.35,121.33 622.22,121.33 C632.1,121.33 641.98,121.33 651.85,121.33 C661.73,121.33 671.6,121.33 681.48,121.33 C691.36,121.33 701.23,70.67 711.11,70.67 C720.99,70.67 730.86,70.67 740.74,70.67 C750.62,70.67 760.49,20 770.37,20 C780.25,20 790.12,20 800,20)",
    louis: null,
    verdict: "missing",
    why: "분석 KPI 카드의 스파크라인(`components/scenes/analytics/shared.tsx:463-512` KpiSparkline — 800×200 viewBox 에 일별 시계열을 곡선으로 그린 데이터 그림)이다. 아이콘이 아니라 측정 시드(`migration/measure-states/data/analytics/channel-core.json`)의 값으로 그려지는 모양이라 LOUIS 대응이 없다. audience 탭 KPI 줄의 2번째 카드.",
  },
  {
    id: "audience-subscribed-donut",
    signature: "0 0 100 100|path(d=M 50 2.5 A 47.5 47.5 0 0 1 94.16438307969193 67.48591625252222)|path(d=M 94.16438307969193 67.48591625252222 A 47.5 47.5 0 1 1 49.999999999999986 2.5)",
    louis: null,
    verdict: "missing",
    why: "분석 시청자 탭의 구독 여부 도넛(`components/scenes/analytics/AudienceTab.tsx:698-730` — 100 상자에 비율만큼 그린 호 둘)이다. 아이콘이 아니라 측정 시드(`migration/measure-states/data/analytics/channel-extended.json`)의 비율로 그려지는 데이터 그림이라 LOUIS 대응이 없다.",
  },
  {
    id: "insufficient-notice-alert-20",
    signature: "0 0 20 20|circle(cx=10 cy=10 r=9)|path(d=M10 6v5)|circle(cx=10 cy=14 r=0.75)",
    louis: null,
    verdict: "missing",
    why: "분석 「데이터 부족」 안내의 느낌표 원(`components/scenes/analytics/shared.tsx:531-541` InsufficientNotice — 20 상자 원 · 세로 선 · 점)이다. LOUIS 에는 점이 위 · 선이 아래인 `icon/info` 뿐이고 선이 위 · 점이 아래인 경고 원은 없다(하이라이트 스튜디오의 `alert-circle-studio` 와 같은 뜻의 다른 좌표).",
  },
  {
    id: "admin-sort-arrow-down-10",
    signature: "0 0 10 10|path(d=M5 1.5v7M2 5.5l3 3 3-3)",
    louis: null,
    verdict: "missing",
    why: "어드민 사용자 표 머리의 정렬 단추(`aria-label` 「Sort by Joined, descending」)가 활성 열 옆에 그리는 내림차순 화살표다 — 10 상자에 세로 선 하나와 아래 화살촉, 1.4 획(`app/admin/AdminClient.tsx:626-633`, 오름차순이면 같은 자리에 위 화살표). 표에 사용자가 한 명이라도 있어야 머리가 서므로 프로필 시드(2026-10-15)부터 재졌다. LOUIS 화살표는 `arrow-up` 뿐이고 방향을 축으로 두지 않는다(위 `arrow-left` 와 같은 판정).",
  },
]);

const bySignature = new Map(PRODUCT_GLYPHS.map((glyph) => [glyph.signature, glyph]));
if (bySignature.size !== PRODUCT_GLYPHS.length) {
  throw new Error("[figma-glyph-identity] 서명이 중복됐습니다 — 한 그림이 두 이름을 가질 수 없습니다.");
}
const byId = new Map(PRODUCT_GLYPHS.map((glyph) => [glyph.id, glyph]));
if (byId.size !== PRODUCT_GLYPHS.length) {
  throw new Error("[figma-glyph-identity] id 가 중복됐습니다 — payload 의 `v` 는 유일해야 합니다.");
}

/**
 * 측정 서명으로 글리프를 찾는다. **없으면 null 을 돌려준다** — 던지는 것은 부르는 쪽의 일이다.
 * 생성기는 던지고(새 아이콘이 이름 없이 보드에 들어가는 것을 막는다), 원장은 그 판정을 인용한다.
 */
export const glyphBySignature = (signature) => bySignature.get(signature) ?? null;
export const glyphById = (id) => byId.get(id) ?? null;
