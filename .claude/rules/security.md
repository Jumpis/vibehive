# Security Guidelines

## Input Validation
- 모든 사용자 입력은 서버 사이드에서 검증
- SQL 쿼리는 반드시 파라미터화 (Prepared Statements)
- HTML 출력 시 XSS 방지를 위한 이스케이프 처리

## Authentication & Authorization
- JWT 토큰에 민감 정보 포함 금지
- 세션 타임아웃 설정 필수
- 권한 체크는 미들웨어/데코레이터 레벨에서 수행

## Secrets Management
- API 키, 비밀번호 등 하드코딩 절대 금지
- 환경변수 또는 시크릿 매니저 사용
- .env 파일은 .gitignore에 포함
- .env.example에 필요한 변수 목록 문서화

## Dependencies
- 새 의존성 추가 시 라이센스 및 취약점 확인
- 정기적으로 `npm audit` / `pip audit` 실행
- 사용하지 않는 의존성 즉시 제거

## Error Handling
- 에러 메시지에 내부 정보(스택 트레이스, DB 구조) 노출 금지
- 프로덕션 환경에서는 사용자 친화적 에러 메시지만 표시
- 모든 에러는 로깅 시스템에 기록

## Logging
- 민감 정보(비밀번호, 토큰, 개인정보) 로그에 기록 금지
- 로그 레벨 적절히 구분 (DEBUG, INFO, WARN, ERROR)
