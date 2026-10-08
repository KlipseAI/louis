---
id: decision-locale-string-collection
status: experimental
authority: normative
---

# DS-D-0080 Figma 보드의 언어는 「Klipse Locale」 변수 모드 한 번으로 바꾼다

- Status: accepted (실측 2026-10-08, 시범 보드 `/inquiry` 진행 중)
- Date: 2026-10-08
- Owners: design system maintainer (소유자 결정 「변수 모드 클릭」)
- Affects: Figma 화면 보드 · 제품 세트, `scripts/measure-product-auth-fixture.mjs`, `scripts/build-figma-app-screens.mjs`, 보드 렌더러

## Context

제품은 en · ko · ja 셋을 낸다(통합 판 `locale.ts`). Figma 보드는 en 측정의 사진이라 글자가 전부 리터럴이었다. 소유자가 「Figma 에서 딸깍하면
언어가 잘 바뀌게」를 요구했고, 방식으로 변수 모드 클릭을 골랐다(로캘별 보드를 따로 세우는 안 대신).

제품 글자의 정본은 하나가 아니다 — 사전 · 함수 잎 · 3항식 · Intl 서식 · 마크다운 고지 · 한국어로 박힌 화면. en 사전을 역으로 맞추면 보드 글자의
64% 만 정확히 맞고, 같은 영어가 키마다 다르게 번역된다(「Search」 → 검색 / 조회). 로캘별 줄바꿈도 얻을 수 없다.

## Decision

1. **값은 제품이 그린 결과에서 얻는다.** 측정기가 같은 화면을 로캘별로 재고(`--locale`, en 원장은 그대로), 같은 DOM 경로의 글자를 짝짓는다.
   사전 역매칭은 변수 이름과 교차 검증에만 쓴다.
2. **STRING 컬렉션 「Klipse Locale」(모드 en · ko · ja, 게시 숨김)에 값이 언어마다 다른 글자만 묶는다.** 세 값이 같으면 리터럴로 둔다.
   언어마다 있다 없다 하는 노드는 `visible` 을 BOOLEAN 변수에 묶는다.
3. **보드 루트에 Locale 모드를 고정하지 않는다.** 페이지(또는 섹션)의 모드 한 번으로 그 아래 보드와 마스터가 함께 바뀐다(실측).
4. **부분 서식이 든 글자는 묶지 않는다(en 고정).** 실측에서 범위 서식 글자를 `characters` 에 묶으면 첫 모드 전환에 서식이 영구히 한 덩어리가 됐고
   마스터까지 무너졌다. 그런 글자는 계획에 「rich-text, en 고정」으로 보고한다.
5. **렌더러 순서: 글자 → 텍스트 스타일 → 바인딩.** `characters` · `visible` 을 직접 쓰면 바인딩이 조용히 풀리므로 다시 그릴 때마다 다시 묶는다.
6. **제품 세트의 치환 서명 · 앵커는 en 으로 둔다.** 마스터 글자를 묶으면 모든 소비처가 따른다.
7. **측정 parity 는 en 뿐이다.** 배치는 en 측정이라 ko/ja 는 「en 배치에 그 언어의 글자 · 줄바꿈」 미리보기다 — 고정 크기 상자에서 넘치거나 빈자리가
   생길 수 있다. 적용 전에 「로캘 rect 차가 큰 글자 + FIXED 조상」 보고를 낸다.

## Consequences

- 일본어 미리보기의 폭은 제품 글꼴(Pretendard JP)이 Figma 에 오를 때까지 믿을 수 없다 — 조직 글꼴 업로드는 소유자 권한이라 `not-ready`.
- 측정 시간이 로캘 수만큼 는다. 되읽기 · 라이브 대조는 en 모드로 푼 값을 읽어야 한다(페이지가 ko 로 남아 있어도 게이트가 빨개지지 않게).

## Rollback

보드 글자의 `characters` · `visible` 바인딩을 풀고(en 값은 그대로 남는다) 「Klipse Locale」 컬렉션을 지운다.
