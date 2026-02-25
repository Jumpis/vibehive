# Coding Style Guide

## Naming Conventions
- 변수/함수: camelCase (JS/TS) 또는 snake_case (Python)
- 클래스/타입: PascalCase
- 상수: UPPER_SNAKE_CASE
- 불리언: is/has/can 접두사 (예: isActive, hasPermission)
- 이벤트 핸들러: handle 접두사 (예: handleClick)

## Function Rules
- 한 함수는 하나의 책임만 (단일 책임 원칙)
- 함수 길이 30줄 이하 권장
- 매개변수 3개 이하 권장, 초과 시 객체로 묶기
- 매직 넘버 금지 → 상수로 정의

## Comments
- "Why"를 설명하는 주석만 작성 (What은 코드로 표현)
- TODO/FIXME는 이슈 번호와 함께 작성
- outdated 주석은 즉시 삭제

## File Organization
- 한 파일당 하나의 주요 export
- import 순서: 외부 라이브러리 → 내부 모듈 → 상대 경로
