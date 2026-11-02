# AGENTS.md

FinanceEdu: app de educação financeira. Plano e roadmap em `PROJECT.md`.

## Layout
- `backend/` — Java 25, Spring Boot 4, hexagonal por camada (`domain/`, `application/service/`, `adapter/in/web/`, `adapter/out/{persistence,security}/`, `config/`). Domínio sem Spring; services registrados em `config/BeanConfig`.
- `frontend/` — Angular, pastas por domínio em `src/app/<dominio>/`; `src/app/core/` só para interceptor, guard e layout.
- API: contrato em `backend/README.md` (tabela de endpoints) e Swagger em `/swagger-ui.html`.

## Verify
Backend (JDK 25 em `~/.jdks/graalvm-jdk-25`):
```bash
cd backend && JAVA_HOME=~/.jdks/graalvm-jdk-25 sh ./mvnw -q verify
```
Testes de integração usam Testcontainers e são pulados sem Docker.

Frontend (Angular 21, Vitest; `npm start` sobe em `localhost:4200`):
```bash
cd frontend && npm run lint && npx tsc --noEmit -p tsconfig.app.json && npm test -- --watch=false
```

## Regras do repositório
- Trabalho na branch `dev`; branches de fatia saem da `dev` e voltam por merge local.
- Nunca fazer push.
- Commits sem `Co-Authored-By` e sem mencionar Claude ou IA.
- Mensagens de commit em português, estilo `feat: ...`, `fix: ...`, `test: ...`.
