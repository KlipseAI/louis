---
id: inclusive-design
status: beta
authority: normative
target: WCAG 2.2 AA
---

# Inclusive Design

Klipse의 신규 UI와 수정되는 UI는 WCAG 2.2 AA를 기본 목표로 한다. 이 문서는 과거 구현의 평균이
아니라 **앞으로 지켜야 할 최소 계약**이다. 공용 구현 편차는 manifest blocker로, route 통합 편차는
소비 제품의 debt로 기록한다.

기준 문서: [WCAG 2.2](https://www.w3.org/TR/WCAG22/),
[Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum),
[Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html).

## 시각적 명료성

- 색만으로 성공·오류·선택 상태를 구분하지 않는다. 텍스트, 아이콘 또는 형태를 함께 제공한다.
- 일반 텍스트 대비는 4.5:1 이상, 큰 텍스트는 3:1 이상을 목표로 한다.
- 컨트롤 경계·상태·포커스처럼 의미 있는 비텍스트 그래픽은 인접 색과 3:1 이상을 목표로 한다.
- 200% 텍스트 확대와 긴 KO/EN/JA 문구에서 정보나 액션이 잘리지 않아야 한다.

## 키보드와 포커스

- 포인터로 가능한 주요 동작은 키보드로도 가능해야 한다.
- **포커스 링을 그리지 않는다**([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md),
  소유자 결정 2026-10-06). 평상 렌더링의 `:focus-visible`은 링도 번짐도 없고, 강제 색(Windows
  고대비)에서만 시스템 색 `Highlight` 링이 선다. 이 결정으로 WCAG 2.4.7(Focus Visible)은 링으로
  충족되지 않는다 — 소유자가 그 편차를 알고 정한 예외다.
- 포커스 순서는 DOM과 시각 순서가 일치해야 하며, 열린 overlay 뒤의 콘텐츠로 빠지면 안 된다.
- 아이콘 전용 버튼에는 문맥을 설명하는 접근 가능한 이름이 필요하다.
- 드래그가 필수인 기능은 버튼·입력 등 단일 포인터 대체 수단을 제공한다.

## 타깃 크기

- 주요 컨트롤은 44×44px 이상의 히트 영역을 권장한다.
- WCAG 2.2 AA 최소 기준인 24×24px보다 작은 타깃은 허용하지 않는다. 예외가 필요하면 동일 기능의
  충분히 큰 대체 컨트롤과 근거를 해당 구현의 검증 기록에 남긴다.
- 시각 아이콘 크기와 실제 히트 영역을 분리해 작은 아이콘도 쉽게 누를 수 있게 한다.

## Dialog와 overlay

- Dialog는 적절한 이름과 설명을 `aria-labelledby`/`aria-describedby`로 연결한다.
- 열릴 때 의도한 첫 요소로 포커스를 보내고, Tab을 내부에 가두며, 닫힐 때 호출 요소로 돌려보낸다.
- Escape로 닫을 수 있어야 한다. 파괴적 확인 Dialog에서 Enter 기본 확인을 허용하려면 별도 결정이
  필요하다.
- modal이면 배경 상호작용과 body 스크롤을 잠근다.
- Popover·Menu·Tooltip은 각각의 ARIA 역할과 키보드 패턴을 사용한다.

## 비동기 상태와 오류

- 진행 중인 컨트롤은 `aria-busy`와 시각적 로딩 상태를 함께 제공한다.
- 상태 메시지는 `role="status"`/`aria-live="polite"`, 즉시 주의가 필요한 오류는 상황에 맞는 live
  region으로 전달한다.
- 필드 오류는 해당 필드와 프로그램적으로 연결하고, 색 이외의 설명과 해결 방법을 제공한다.
- 로딩·성공·실패·취소 흐름은 [Loading Pattern](../patterns/loading.md)을 따른다.

## 모션과 미디어

- `prefers-reduced-motion: reduce`에서 위치·크기 기반의 비필수 모션을 제거하거나 즉시 전환으로 바꾼다.
- 무한 애니메이션은 로딩·상태 전달처럼 필요한 경우에만 사용한다.
- 장식 이미지는 보조 기술에서 숨기고, 기능성 이미지와 아이콘에는 목적 중심 대체 텍스트를 제공한다.
- 영상은 키보드로 제어할 수 있어야 하며 자동재생·소리·자막 정책을 화면별로 명시한다.

## 완료 조건

컴포넌트를 `stable`로 올리려면 최소한 다음을 확인한다.

- 키보드 탐색과 포커스 표시
- 접근 가능한 이름·역할·상태
- light/dark 및 app-shell 배경에서 대비
- 320px 폭, 200% 확대, KO/EN/JA 긴 문구
- reduced-motion
- 오류·로딩·빈 상태
- axe smoke와 핵심 상호작용 테스트

기존 제품의 outline, Dialog focus, Toast live region 편차는 이 규범의 예외가 아니다. 소비 제품이
새 package를 도입할 때 제품 레포에서 검증하고, 공용 구현 결함이면 이 저장소의 blocker로 올린다.
