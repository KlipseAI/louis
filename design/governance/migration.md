---
id: governance-product-adoption
status: beta
authority: normative
---

# Product Adoption

소비 제품이 Klipse Design을 도입하는 절차다. 이관 단위는 파일 복사가 아니라 version, manifest ID,
행동 계약과 검증 evidence다.

## 경계

디자인 시스템 저장소가 소유하는 것:

- normative foundations, components, patterns와 governance
- token, CSS, React package와 Figma library
- public docs, AI docs, release와 deprecation

제품 저장소가 소유하는 것:

- route/scene composition과 business workflow
- legacy CSS와 화면별 예외
- route audit, E2E/visual regression, 제품 접근성 evidence
- 디자인 시스템 package version과 integration adapter

## 도입 순서

1. 제품 baseline을 캡처하고 영향 route를 목록화한다.
2. 사용할 DS release와 manifest ID를 고정한다.
3. legacy 값을 semantic token으로 매핑하되 모호한 값은 decision으로 올린다.
4. leaf component부터 교체하고 App Shell 같은 composition pattern은 별도 단계로 적용한다.
5. 제품의 pointer, keyboard, focus, responsive, visual regression을 실행한다.
6. integration PR에 DS release/PR과 test evidence를 링크한다.
7. rollback version과 legacy 제거 조건을 기록한다.

## 상태 매핑

- `not-ready`: 제품에서 사용할 수 없다.
- `partial`: 명시된 제한과 adapter를 integration PR에 기록해야 한다.
- `done`: public API와 package evidence가 준비됐다는 뜻이며 제품 route 검증을 면제하지 않는다.
- `deprecated`: 신규 사용 금지, 대체 경로와 제거 기한이 필요하다.

## Cutover gate

- 새 checkout에서 `pnpm verify` 통과
- DS package version 고정
- 영향 route의 keyboard/focus/responsive/visual evidence 통과
- deprecated legacy 신규 참조 0건
- rollback과 owner 확인

현재 monolith 추출 당시의 비규범 근거는
[`migration/product-baseline.md`](../../migration/product-baseline.md)에 별도로 보존한다.
