---
id: governance-contributing
status: beta
authority: normative
---

# Contributing

디자인 시스템 변경은 catalog 상태, 규범, 배포 자산, 검증과 사용자 안내를 같은 디자인 시스템
PR에서 일치시킨다. 제품 적용은 별도 integration PR로 진행하고 두 PR을 상호 링크한다.

## 변경 흐름

1. [manifest](../manifest.json)에서 대상 ID와 현재 maturity를 확인한다.
2. 행동, 상태, 접근성, 반응형, 콘텐츠 계약을 규범 문서에 먼저 명시한다.
3. 제품 의미가 갈리면 [Design Decision](decisions/README.md)을 작성한다.
4. package와 Figma 구현을 추가하고 status를 근거에 맞게 갱신한다.
5. 테스트와 예제를 추가한다.
6. [Updates](../updates/README.md)에 사용자 영향과 migration을 기록한다.
7. 생성물을 갱신하고 모든 게이트를 통과시킨다.

## 완료 정의

- manifest와 문서 frontmatter가 일치한다.
- component의 `docs: done` 문서에는 Availability, public contract, states, content,
  accessibility와 acceptance tests가 있다.
- pattern의 `docs: done` 문서에는 선택 기준, ownership/state lifecycle, responsive,
  accessibility와 acceptance tests가 있다.
- `web: done`은 public export, tests, accessibility와 release evidence가 있을 때만 사용한다.
- `figma: done`은 published library component와 code parity 검증이 있을 때만 사용한다.
- breaking change는 migration과 deprecation window를 제공한다.
- 생성 파일과 source가 일치한다.

## 필수 검증

```sh
pnpm build
pnpm check
pnpm verify
```

CI는 생성물 drift와 추적되지 않은 catalog input을 추가로 차단한다.

## 제품 통합

소비 제품의 route audit과 visual/E2E evidence는 제품 레포가 소유한다. 제품 이슈는 이 저장소의
안정적인 manifest ID와 release version을 참조하며, 제품 결함을 normative status로 섞지 않는다.
