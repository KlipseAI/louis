/**
 * **상태 레시피 영역 「canvas-panels」의 가짜 Supabase 시드(2026-10-15).**
 *
 * 영역 파일(`migration/measure-states/canvas-panels.json`)은 노드캔버스 편집기의 모달 · 패널 넷(도움말 · 분석 · 이미지 편집 ·
 * 카메라 각도)을 데스크톱 · 모바일 보드로 세우려고 따로 둔 영역이다 — `nodecanvas` 영역의 레시피는 다른 작업이 다시 재고 있어
 * 고치지 않는다. 레시피 검사(`state-recipes.mjs` validateRecipes)는 `supabase.module` 이 **자기 영역 시드 파일**이기를 요구하므로,
 * 시드 본문은 `nodecanvas.mjs` 의 것을 그대로 다시 내보낸다 — 프로젝트 id · 문서 · 행 모양이 한 곳에 머문다.
 */
export { analysisCanvas, imageEditCanvas } from "./nodecanvas.mjs";
