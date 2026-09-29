/**
 * **측정 노드에서 「그릴 글자」를 낸다(2026-09-29).**
 *
 * 인증 · 로그아웃 측정기는 글자를 둘로 싣는다. `ownText` 는 직계 글자 노드를 이은 글자(`<br>` 만 줄바꿈)이고, 매칭 ·
 * 서명 · 라벨 대조의 열쇠다. `wrapLines` 는 제품 글꼴로 **보이는 줄**마다의 글자다 — 폭 때문에 감긴 자리가 `<br>` 보다
 * 많을 때만 실린다. 보드 글꼴은 제품 글꼴(`system-ui` = 맥 Chrome 의 SF Pro 등)과 너비가 달라 폭만 옮기면 줄이 다른
 * 자리에서 꺾이므로(데이터 삭제 상태 첫 문단: 제품 두 줄 · 보드 한 줄 → 아래가 25.6 위), 그리는 자리는 감긴 줄을
 * 줄바꿈으로 이어 쓴다. `ownText` 는 바꾸지 않는다 — 매칭 열쇠가 흔들리면 인스턴스 치환이 끊긴다.
 * 요금제 장면 생성기는 쓰지 않는다 — 그 생성기는 감긴 행 글자를 고정 폭 상자와 Figma 에서 잰 줄 폭 표(`lines`, 원래 글자가 열쇠)로
 * 이미 같은 자리에서 꺾는다.
 */
export const drawnText = (entry) =>
  (Array.isArray(entry?.wrapLines) && entry.wrapLines.length > 1 ? entry.wrapLines.join("\n") : entry?.ownText ?? null);
