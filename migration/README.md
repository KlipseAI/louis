# Migration

이 디렉터리는 제품 monolith에서 디자인 시스템을 추출할 때의 비규범 근거를 보존한다.
여기의 내용은 package API나 새 UI의 정본이 아니다.

- [Product baseline](product-baseline.md): 2026-08-11 추출 경계와 evidence ID
- [Product token mapping](token-mapping.md): P2 DTCG source 선정 근거, legacy 매핑, 단계적 이관과 rollback
- [Product Adoption](../design/governance/migration.md): 소비 제품이 따라야 할 규범 절차
- [제품 화면 사양](product-screens/README.md): 라우트별 화면 사양 22,522줄. 제품 저장소의 추적되지
  않는 작업 트리에만 있던 것을 옮겨 보존한다. **정적 분석 산물이며 실측이 이긴다.**
- [Figma 이관 기록](figma-transfer/README.md): 문서만 읽고 그리다 막힌 자리의 22차 왕복 기록.
  **값이 아니라 어디서 막혔는지를 읽는다.**
- [장표 규약](deck/README.md): 1920×1080 발표 장표의 판형·여백·마스터. 제품 UI가 아니다.
- [legacy-design-system.md](legacy-design-system.md): 제품 저장소의 단일 파일 디자인 문서
  4,331줄. `design/`의 분해된 규범 문서가 이것을 대체한다.

제품 route audit과 debt registry 원본은 Klipse product repository에 남는다.
