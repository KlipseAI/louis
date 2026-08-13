# @klipse-design/tokens

P2에서 semantic token의 구조화 원본과 CSS·TypeScript·Figma 변환물을 제공한다.
현재 제품 CSS에서 역생성한 값은 새 정본이 아니므로 이 패키지에 복사하지 않았다.

완료 조건:

- light/dark mode와 alias graph를 schema로 검증한다.
- raw value와 semantic role을 분리한다.
- 모든 생성물이 동일한 구조화 원본에서 결정론적으로 만들어진다.
- breaking token rename에는 migration과 deprecation 기간이 있다.
