# 8around SNS

생각을 짧게 나누는 SNS.

- 배포: _(Day 1 PM에 기입)_
- 계획: [docs/PLAN.md](docs/PLAN.md)
- 디자인 토큰: [docs/DESIGN.md](docs/DESIGN.md)
- 개발 규칙: [CLAUDE.md](CLAUDE.md)

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # Supabase 값 채우기
npm run dev
```

## 검증

```bash
npm run verify   # lint + typecheck + test
```
