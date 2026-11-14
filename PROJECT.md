# FinanceEdu
Plataforma web que une aprender, simular, planejar e evoluir em finanças pessoais.

## Problem
Jovens, estudantes e adultos aprendem finanças em conteúdos soltos (vídeos, posts) sem aplicar na prática. Sucesso: usuário lê um conteúdo, simula, cria uma meta e vê seu progresso no dashboard — tudo no mesmo app.

## Users
- Jovem/estudante/adulto iniciante em finanças.
- Fluxo repetido: login → registra aporte em meta → confere dashboard; eventualmente lê conteúdo e simula.

## MVP
- Cadastro e login (email + senha, JWT).
- Conteúdos: 6 módulos fixos (seed), leitura, marcar concluído, % por módulo.
- Simuladores: juros compostos, investimento com aportes mensais (projeção mês a mês), parcelamento (Price), economia mensal; histórico salvo.
- Metas: CRUD, aportes, % atingido, valor restante, estimativa de conclusão.
- Dashboard: indicadores, gráfico de aportes por mês (Chart.js), progresso dos conteúdos, últimas simulações.

## Out of scope
- Recuperação de senha, login social, perfis/admin, edição de conteúdos pela UI.
- Quizzes, gamificação, notificações, app mobile nativo.
- Integração com bancos/Open Finance.
- Protótipo Figma detalhado (só wireframe rápido se o professor exigir).

## Architecture
- Monorepo `backend/` + `frontend/` — um repo para entregar e avaliar.
- Backend Java 25 + Spring Boot 4 — exigência do projeto; ecossistema maduro.
- Hexagonal por camada — escolha do aluno; domínio puro testável sem Spring.
- PostgreSQL 17 + Flyway — relacional simples; migrations versionadas; seed de conteúdos.
- Auth JWT HS256 via Spring Security Resource Server — stateless, sem lib extra.
- Frontend Angular + Chart.js — exigência; Chart.js para gráficos do dashboard.
- REST JSON + Swagger (springdoc) — contrato visível para o front.
- Deploy: backend Docker no Render (free), Postgres no Supabase (free, via Session pooler), front no Vercel — grátis, deploy por git push.
- Dinheiro em `BigDecimal`, escala 2, `HALF_EVEN` — evita erro de ponto flutuante.

## Structure
- backend: `backend/src/main/java/br/edu/financeedu/`
  - `domain/model/`, `domain/port/in/`, `domain/port/out/`, `domain/exception/` — Java puro
  - `application/service/` — casos de uso
  - `adapter/in/web/` — controllers, DTOs, handler de erros
  - `adapter/out/persistence/` — entities JPA, repos, mappers
  - `adapter/out/security/` — BCrypt, JWT
  - `config/` — security, CORS, wiring dos beans
- frontend: `frontend/src/app/<dominio>/` holds rotas, service HTTP, componentes, testes
- Domínios: auth, conteudos, simuladores, metas, dashboard
- Shared: `frontend/src/app/core/` só para interceptor JWT, guard, layout

## Risks
- Prazo de 20 dias sozinho — fatias verticais (back+front por domínio); dashboard e polimento por último.
- Render free hiberna (~1 min cold start) — avisar na apresentação; abrir app antes.
- Java 25 + Boot 4 recentes — usar versões já em cache local (Boot 4.0.6); fallback Java 21 se algo quebrar.
- Cálculos financeiros errados — testes unitários com valores de referência.

## Roadmap
- [x] Backend: setup, auth JWT, simuladores, metas/aportes, conteúdos, dashboard (`backend/`)
- [x] Frontend base: Angular em `frontend/`, layout, interceptor JWT, guard, CI com back + front
- [x] Front auth: telas de login e cadastro, logout, rota protegida
- [x] Front simuladores: 4 formulários com resultado e gráfico de evolução do investimento
- [x] Front metas: lista, criar/editar/excluir, detalhe com aportes e progresso
- [x] Front conteúdos: módulos, leitura, marcar concluído, progresso por módulo
- [x] Front dashboard: indicadores e gráfico de aportes por mês (Chart.js)
- [x] Deploy-ready: Dockerfile do backend, render.yaml, vercel.json, README raiz (sem deploy real)
