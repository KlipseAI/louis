/**
 * **상태 레시피 영역 「canvas-analysis」의 가짜 Supabase 시드(2026-10-15, R2).**
 *
 * 영역 파일(`migration/measure-states/canvas-analysis.json`)은 노드캔버스 편집기(/nodecanvas?project=)의 패널 상태 하나를 데스크톱 · 모바일 화면 보드로 세우려고 따로 둔 영역이다.
 * 레시피 검사(`state-recipes.mjs` validateRecipes)가 `supabase.module` 을 **자기 영역 시드 파일**로 요구하므로, 시드 본문은
 * `nodecanvas.mjs` 의 내보내기를 그대로 다시 내보낸다 — 프로젝트 id · 문서 · 행 모양이 한 곳에 머문다.
 */
export { analysisCanvas } from "./nodecanvas.mjs";
