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
