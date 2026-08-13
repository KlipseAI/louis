# @klipse-design/react

P3에서 접근 가능한 headless behavior와 styled React 컴포넌트를 제공한다. 현재 manifest의 Web
상태가 `not-ready`인 이유는 이 패키지에 배포 가능한 구현과 테스트가 아직 없기 때문이다.

첫 구현 순서는 Button → Menu/Popover → Dialog다. 각 컴포넌트는 pointer, keyboard, focus,
disabled/loading, high contrast, reduced motion 계약을 충족한 뒤 `partial` 또는 `done`으로
승격한다.
