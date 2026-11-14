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
Rodar a API local: `cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` (ou `SPRING_PROFILES_ACTIVE=dev`); sem o profile `dev`, `JWT_SECRET` e `DB_*` são obrigatórios. Os testes de integração ativam `dev`.
Testes de integração sobem um Postgres real embutido (zonky embedded-postgres), sem Docker.

Frontend (Angular 21, Vitest; `npm start` sobe em `localhost:4200`):
```bash
cd frontend && npm run lint && npx tsc --noEmit -p tsconfig.app.json && npm test -- --no-watch
```

Artefatos de deploy (Dockerfile, render.yaml, vercel.json, README), na raiz:
```bash
node scripts/verificar-deploy.mjs
```

## Regras do repositório
- Trabalho na branch `dev`; branches de fatia saem da `dev` e voltam por merge local.
- Nunca fazer push.
- Commits sem linha `Co-Authored-By`.
- Mensagens de commit em português, estilo `feat: ...`, `fix: ...`, `test: ...`.
