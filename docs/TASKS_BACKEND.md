# Tasks — Backend (Java 25 · Arquitetura Hexagonal)

App de Educação Financeira · Front: Angular · Banco: PostgreSQL · Auth: email + senha (JWT)

## Stack
- Java 25 + Spring Boot 4 (WebMVC, Data JPA, Security/OAuth2 Resource Server, Validation)
- PostgreSQL 17 (docker-compose) + Flyway
- springdoc-openapi (Swagger para integração com o Angular)
- Testes: JUnit 5, Mockito, embedded-postgres

## Estrutura de pacotes
```
br.edu.financeedu
├── domain/                 # Java puro — sem Spring/JPA
│   ├── model/              # Usuario, Modulo, Conteudo, Meta, Aporte, Simulacao, CalculadoraFinanceira
│   ├── port/in/            # casos de uso (interfaces)
│   ├── port/out/           # repositórios e serviços externos (interfaces)
│   └── exception/          # RegraNegocioException, NaoEncontradoException, CredenciaisInvalidasException
├── application/service/    # implementa port/in usando port/out
├── adapter/in/web/         # @RestController, DTOs, GlobalExceptionHandler
├── adapter/out/persistence/# @Entity, Spring Data repos, adapters, mappers entity <-> domain
├── adapter/out/security/   # BCrypt e JWT implementando ports
└── config/                 # SecurityConfig, BeanConfig (wiring dos services), CORS
```
**Regras:** `domain` não importa nada de Spring/adapter · Entity JPA ≠ modelo de domínio · services recebem ports por construtor.

---

## T0 — Setup do projeto
| # | Task | Camada | Critério de aceite |
|---|------|--------|--------------------|
| 0.1 | Criar projeto Maven Spring Boot 4 / Java 25 em `backend/` | config | `./mvnw package` compila |
| 0.2 | `docker-compose.yml` com Postgres 17 | infra | `docker compose up -d` sobe banco |
| 0.3 | `application.yml` (datasource por env, `ddl-auto: validate`, `open-in-view: false`) | config | app conecta no banco |
| 0.4 | Migration `V1__init.sql` com todas as tabelas | persistence | Flyway roda sem erro |
| 0.5 | springdoc + CORS para `http://localhost:4200` | config | Swagger em `/swagger-ui.html` |
| 0.6 | `GlobalExceptionHandler` com `ProblemDetail` (400, 401, 404, 422) | web | erros retornam JSON padronizado |

## T1 — Usuário & Autenticação
| # | Task | Camada |
|---|------|--------|
| 1.1 | Model `Usuario` (id, nome, email, senhaHash, criadoEm) — email normalizado em minúsculas | domain |
| 1.2 | Ports out: `UsuarioRepositoryPort`, `PasswordHasherPort`, `TokenPort` | domain |
| 1.3 | Port in `AuthUseCase` (registrar, autenticar, buscarPorId) | domain |
| 1.4 | `AuthService`: email único (422), hash BCrypt, login inválido (401), gera token | application |
| 1.5 | `UsuarioEntity` + `UsuarioJpaRepository` + `UsuarioPersistenceAdapter` | persistence |
| 1.6 | `BCryptPasswordHasherAdapter`, `JwtTokenAdapter` (HS256, expiração configurável) | security |
| 1.7 | `SecurityConfig`: stateless, `/api/auth/**` e swagger públicos, resto autenticado | config |
| 1.8 | `AuthController`: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/me` | web |

**Aceite:** registrar → login retorna token → `/api/me` com token 200, sem token 401.

## T2 — Conteúdos educativos
| # | Task | Camada |
|---|------|--------|
| 2.1 | Models `Modulo`, `Conteudo`, `ProgressoModulo` (total, concluídos, %) | domain |
| 2.2 | Ports out: `ConteudoRepositoryPort`, `ProgressoRepositoryPort` | domain |
| 2.3 | Port in `ConteudoUseCase` (listar módulos, conteúdos do módulo, detalhar, concluir, progresso) | domain |
| 2.4 | `ConteudoService` — concluir é idempotente; % por módulo | application |
| 2.5 | Entities `ModuloEntity`, `ConteudoEntity`, `ProgressoConteudoEntity` (unique usuário+conteúdo) | persistence |
| 2.6 | Seed `V2__seed_conteudos.sql` com os 6 módulos e conteúdos iniciais | persistence |
| 2.7 | `ConteudoController`: `GET /api/modulos`, `GET /api/modulos/{id}/conteudos`, `GET /api/conteudos/{id}`, `POST /api/conteudos/{id}/concluir`, `GET /api/progresso/conteudos` | web |

**Módulos:** Organização financeira · Orçamento · Juros simples/compostos · Cartão e endividamento · Investimentos · Reserva de emergência.

## T3 — Simuladores financeiros
| # | Task | Camada |
|---|------|--------|
| 3.1 | `CalculadoraFinanceira` (BigDecimal, `MathContext.DECIMAL128`, resultado escala 2 `HALF_EVEN`) | domain |
| 3.2 | Juros compostos: `M = C·(1+i)^n` | domain |
| 3.3 | Investimento com aportes mensais: série mês a mês (saldo, total investido, juros) | domain |
| 3.4 | Parcelamento (Price): `PMT = PV·i / (1-(1+i)^-n)`; taxa 0 → PV/n; total pago e juros | domain |
| 3.5 | Economia mensal: meses para atingir objetivo e valor mensal necessário para um prazo | domain |
| 3.6 | Model `Simulacao` (tipo enum, parâmetros, resultado, criadaEm) + `SimulacaoRepositoryPort` | domain |
| 3.7 | `SimulacaoService`: calcula, salva histórico do usuário, lista | application |
| 3.8 | `SimulacaoEntity` com colunas `jsonb` para parâmetros e resultado | persistence |
| 3.9 | `SimulacaoController`: `POST /api/simulacoes/{juros-compostos\|investimento\|parcelamento\|economia}`, `GET /api/simulacoes` | web |
| 3.10 | **Teste unitário da calculadora** com valores conhecidos | test |

**Valores de referência para testes:** R$1.000 a 1% a.m. por 12 meses = R$1.126,83 · R$100/mês a 1% por 12 meses = R$1.268,25 · R$1.000 em 12x a 2% a.m. = parcela R$94,56.

## T4 — Metas financeiras
| # | Task | Camada |
|---|------|--------|
| 4.1 | Model `Meta` (nome, valorAlvo, prazo, criadaEm, aportes) e `Aporte` (valor, data) | domain |
| 4.2 | Regras no model: `totalEconomizado()`, `percentualAtingido()` (máx. 100), `valorRestante()`, `status()` (ATIVA/CONCLUIDA derivado), `estimativaConclusao()` pela média mensal de aportes | domain |
| 4.3 | Validações: nome obrigatório, valorAlvo > 0, prazo ≥ hoje, aporte > 0 (422) | domain |
| 4.4 | `MetaRepositoryPort` (salvar, salvarAporte, buscar por id+usuário, listar, excluir) | domain |
| 4.5 | Port in `MetaUseCase` + `MetaService` (CRUD + registrar/listar aportes) | application |
| 4.6 | `MetaEntity`, `AporteEntity` (FK `ON DELETE CASCADE`), adapter com mapper | persistence |
| 4.7 | `MetaController`: `POST/GET /api/metas`, `GET/PUT/DELETE /api/metas/{id}`, `POST/GET /api/metas/{id}/aportes` | web |
| 4.8 | Isolamento por usuário: toda busca filtra pelo `usuarioId` do token; meta de outro usuário → 404 | application |

## T5 — Evolução / Dashboard
| # | Task | Camada |
|---|------|--------|
| 5.1 | Model `Dashboard` (total economizado, metas ativas/concluídas, % médio, progresso de conteúdos, últimas simulações) | domain |
| 5.2 | Port in `DashboardUseCase` + `DashboardService` agregando os ports existentes (sem tabela nova) | application |
| 5.3 | Série mensal de aportes dos últimos N meses (formato pronto para Chart.js) | application |
| 5.4 | `DashboardController`: `GET /api/dashboard`, `GET /api/dashboard/evolucao-aportes?meses=12` | web |

## T6 — Qualidade e entrega
| # | Task |
|---|------|
| 6.1 | Testes unitários do domínio (`CalculadoraFinanceira`, `Meta`) |
| 6.2 | Testes dos services com ports mockados (Mockito) |
| 6.3 | Teste de integração com Postgres embutido: fluxo register → login → meta → aporte → simulação → dashboard |
| 6.4 | Teste de segurança: rota sem token 401, meta de outro usuário 404 |
| 6.5 | README: como subir banco, rodar app e acessar Swagger |

---

## Ordem sugerida
T0 → T1 → T3 → T4 → T2 → T5 → T6 (testes acompanham cada task)

## Resumo de endpoints
| Módulo | Endpoints |
|--------|-----------|
| Auth | `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/me` |
| Conteúdos | `GET /api/modulos` · `GET /api/modulos/{id}/conteudos` · `GET /api/conteudos/{id}` · `POST /api/conteudos/{id}/concluir` · `GET /api/progresso/conteudos` |
| Simuladores | `POST /api/simulacoes/{tipo}` · `GET /api/simulacoes` |
| Metas | `POST/GET /api/metas` · `GET/PUT/DELETE /api/metas/{id}` · `POST/GET /api/metas/{id}/aportes` |
| Dashboard | `GET /api/dashboard` · `GET /api/dashboard/evolucao-aportes` |
