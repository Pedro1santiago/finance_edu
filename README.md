# FinanceEdu

App de educação financeira: simuladores, metas, conteúdos e dashboard de aportes. Backend Java 25 + Spring Boot 4 + PostgreSQL (`backend/`), frontend Angular (`frontend/`). Plano em `PROJECT.md`.

## Rodar tudo com Docker

```bash
docker compose up --build
```

Sobe Postgres (`localhost:5433`), API (`http://localhost:8080`, Swagger em `/swagger-ui.html`) e frontend (`http://localhost:4200`). A API usa o profile `dev` só para uso local; em produção defina `JWT_SECRET` e `DB_*` (seção Deploy).

## Rodar local sem Docker para a API

Veja `AGENTS.md` (comandos de verificação) e `backend/README.md` (API, Swagger, testes).

```bash
cd backend && docker compose up -d && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev   # API em :8080
cd frontend && npm install && npm start                        # app em :4200
```

## Deploy (Neon, Render, Vercel)

Tudo no plano gratuito. Siga a ordem.

### 1. Banco no Neon

1. Crie um projeto no [Neon](https://neon.tech) e copie host, banco, usuário e senha.
2. Monte a URL JDBC: `jdbc:postgresql://<host>/<db>?sslmode=require`.

O Flyway cria as tabelas na primeira subida; não há passo de migration.

### 2. Backend no Render

1. No Render, escolha **New > Blueprint** e conecte este repositório (usa o `render.yaml` da raiz).
   Alternativa manual: **New > Web Service**, runtime **Docker**, branch com o código, sem Root Directory (o `Dockerfile` da raiz builda a API).
2. Preencha as variáveis pedidas:

| Variável | Valor |
|---|---|
| `DB_URL` | URL JDBC do Neon, ex.: `jdbc:postgresql://ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require` (sem usuário/senha na URL) |
| `DB_USER` | usuário do Neon |
| `DB_PASSWORD` | senha do Neon |
| `JWT_SECRET` | gerada automaticamente pelo Blueprint; no modo manual, gere uma com 32+ caracteres (ex.: `openssl rand -base64 48`) |
| `CORS_ORIGENS` | URL do front na Vercel, sem barra final (preencha após o passo 3); várias separadas por vírgula |

Não defina `SPRING_PROFILES_ACTIVE`: o profile `dev` só serve para rodar local. `PORT` é injetada pelo próprio Render. Health check: `/v3/api-docs`.

3. Anote a URL pública do serviço (ex.: `https://finance-edu-api.onrender.com`).

### 3. Frontend na Vercel

1. Em `frontend/src/environments/environment.ts`, troque `apiUrl` pela URL real do Render e faça commit (o Angular não lê variável de ambiente em runtime).
2. Na [Vercel](https://vercel.com), importe o repositório com **Root Directory** `frontend`. O `vercel.json` define a saída `dist/frontend/browser` e o rewrite das rotas para `index.html`.
3. Com a URL da Vercel em mãos, volte ao Render e preencha `CORS_ORIGENS` com ela (sem barra final).
