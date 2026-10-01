---
id: content-overview
status: experimental
authority: normative
---

# Content & Localization

Klipse가 사용자에게 일관되게 말하는 방법을 정의한다. 현재는 최소 계약만 제공하며 `experimental`이다.

카드뉴스, 공지처럼 Klipse 이름으로 밖에 내보내는 글의 어조는 [Voice & Tone](voice-tone.md)이 정한다.

## 기본 원칙

- 사용자가 지금 할 수 있는 행동과 그 결과를 명확하고 간결하게 쓴다.
- 오류는 원인보다 영향과 해결 방법을 우선한다.
- 성공·실패·로딩·빈 상태·파괴적 액션은 동일한 개념에 동일한 용어를 사용한다.
- 사용자 노출 문구는 messages 시스템을 사용하고 KO/EN을 필수로 제공한다. 해당 기능이 일본어를
  지원하면 JA도 같은 변경에 포함한다.
- 버튼은 짧은 동사형, 제목은 결과 중심, 설명은 필요한 맥락만 제공한다.
- 날짜·시간·숫자·통화·단위는 locale formatter를 사용한다.
- `aria-label`도 사용자 노출 문구이며 현재 locale과 일치해야 한다.

## 상태 문구

| 상태        | 원칙                                                  |
| ----------- | ----------------------------------------------------- |
| Loading     | 대상 + 진행 상태, 말줄임표 없음                       |
| Empty       | 왜 비어 있는지 + 가능한 다음 행동                     |
| Error       | 무엇이 실패했는지 + 영향 + 재시도/대안                |
| Success     | 결과가 화면에서 명확하면 중복 Toast 생략              |
| Destructive | 삭제 대상을 구체적으로 명시하고 되돌릴 수 있는지 설명 |

## 남은 작업

- 제품 화면 문구의 Voice & Tone과 writing Do/Don't 확정(밖에 내보내는 글은 [Voice & Tone](voice-tone.md)에 있다)
- KO/EN/JA 길이·줄바꿈 테스트 fixture
- 하드코딩 사용자 문구 게이트
- 숫자·날짜·duration·credit 표기 규칙
- 이메일 콘텐츠 규칙과 앱 디자인 시스템의 관계 정리
