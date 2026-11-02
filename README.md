# FinanceEdu

App de educação financeira: simuladores, metas, conteúdos e dashboard de aportes. Backend Java 25 + Spring Boot 4 + PostgreSQL (`backend/`), frontend Angular (`frontend/`). Plano em `PROJECT.md`.

## Rodar local

Veja `AGENTS.md` (comandos de verificação) e `backend/README.md` (API, Swagger, testes).

```bash
cd backend && docker compose up -d && ./mvnw spring-boot:run   # API em :8080
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
2. Preencha as variáveis pedidas:

| Variável | Valor |
|---|---|
| `DB_URL` | URL JDBC do Neon |
| `DB_USER` | usuário do Neon |
| `DB_PASSWORD` | senha do Neon |
| `JWT_SECRET` | gerada automaticamente pelo Render |
| `CORS_ORIGENS` | URL do front na Vercel (preencha após o passo 3) |

3. Anote a URL pública do serviço (ex.: `https://finance-edu-api.onrender.com`).

### 3. Frontend na Vercel

1. Em `frontend/src/environments/environment.ts`, troque `apiUrl` pela URL real do Render e faça commit (o Angular não lê variável de ambiente em runtime).
2. Na [Vercel](https://vercel.com), importe o repositório com **Root Directory** `frontend`. O `vercel.json` define a saída `dist/frontend/browser` e o rewrite das rotas para `index.html`.
3. Com a URL da Vercel em mãos, volte ao Render e preencha `CORS_ORIGENS` com ela (sem barra final).
