# FinanceEdu — Backend

API REST do app de educação financeira. Java 25, Spring Boot 4, PostgreSQL, arquitetura hexagonal.

## Rodar local

Pré-requisitos: JDK 25 e Docker.

```bash
docker compose up -d
./mvnw spring-boot:run
```

- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html
- Banco: `localhost:5433` (usuário/senha/db `financeedu`)

Variáveis de ambiente (todas com padrão de dev): `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` (mín. 32 caracteres), `CORS_ORIGENS`.

## Testes

```bash
./mvnw verify
```

Os testes de integração sobem um Postgres real embutido (zonky embedded-postgres); não precisam de Docker.

## Arquitetura

```
br.edu.financeedu
├── domain/              # regras puras: model, port/in (casos de uso), port/out, exception
├── application/service/ # implementa os casos de uso usando as portas de saída
├── adapter/in/web/      # controllers REST
├── adapter/out/         # persistence (JPA) e security (BCrypt, JWT)
└── config/              # segurança, CORS e wiring dos services
```

O domínio não depende de Spring; os services são registrados em `config/BeanConfig`.

## Endpoints

| Módulo | Endpoints |
|--------|-----------|
| Auth | `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/me` |
| Conteúdos | `GET /api/modulos` · `GET /api/modulos/{id}/conteudos` · `GET /api/conteudos/{id}` · `POST /api/conteudos/{id}/concluir` · `GET /api/progresso/conteudos` |
| Simuladores | `POST /api/simulacoes/{juros-compostos\|investimento\|parcelamento\|economia}` · `GET /api/simulacoes` |
| Metas | `POST/GET /api/metas` · `GET/PUT/DELETE /api/metas/{id}` · `POST/GET /api/metas/{id}/aportes` |
| Dashboard | `GET /api/dashboard` · `GET /api/dashboard/evolucao-aportes?meses=12` |

Taxas dos simuladores são percentuais ao mês (`1` = 1% a.m.). Rotas fora de `/api/auth` exigem `Authorization: Bearer <token>`.
