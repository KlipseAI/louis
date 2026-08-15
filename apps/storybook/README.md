# Klipse Design 컴포넌트 워크샵

코드로 만든 컴포넌트를 **사람이 눈으로 확인하는 곳**이다. 경계와 근거는
[DS-D-0012](../../design/governance/decisions/DS-D-0012-component-workshop.md)가 소유한다.

```sh
pnpm --filter @klipse-design/storybook dev
```

## 이곳이 지키는 두 가지

**공개 package만 소비한다.** `@klipse-design/react`의 `dist`를 읽으므로 export 누락,
`exports` 서브패스 오타, `.d.ts` 생성 실패가 스토리를 여는 순간 드러난다. 그래서 소스를 고치면
`pnpm build:react`를 다시 돌려야 한다 — `tsc` 한 번이라 1초 남짓이고, 검출력과 맞바꾼 값이다.

**시각 회귀가 아니다.** 스냅샷 baseline을 만들지도 커밋하지도 않고 어떤 게이트도 여기 렌더 결과를
검사하지 않는다. "Storybook이 있으니 시각 검증이 됐다"를 승격 근거로 쓸 수 없다.
