CREATE TABLE usuarios (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(120) NOT NULL,
    email       VARCHAR(180) NOT NULL UNIQUE,
    senha_hash  VARCHAR(100) NOT NULL,
    criado_em   TIMESTAMPTZ  NOT NULL
);

CREATE TABLE modulos (
    id         BIGSERIAL PRIMARY KEY,
    titulo     VARCHAR(120) NOT NULL,
    descricao  TEXT         NOT NULL,
    ordem      INT          NOT NULL
);

CREATE TABLE conteudos (
    id         BIGSERIAL PRIMARY KEY,
    modulo_id  BIGINT       NOT NULL REFERENCES modulos (id),
    titulo     VARCHAR(160) NOT NULL,
    corpo      TEXT         NOT NULL,
    ordem      INT          NOT NULL
);

CREATE TABLE progresso_conteudos (
    id           BIGSERIAL PRIMARY KEY,
    usuario_id   BIGINT      NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    conteudo_id  BIGINT      NOT NULL REFERENCES conteudos (id),
    concluido_em TIMESTAMPTZ NOT NULL,
    UNIQUE (usuario_id, conteudo_id)
);

CREATE TABLE simulacoes (
    id          BIGSERIAL PRIMARY KEY,
    usuario_id  BIGINT      NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    tipo        VARCHAR(30) NOT NULL,
    parametros  JSONB       NOT NULL,
    resultado   JSONB       NOT NULL,
    criada_em   TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_simulacoes_usuario ON simulacoes (usuario_id, criada_em DESC);

CREATE TABLE metas (
    id          BIGSERIAL PRIMARY KEY,
    usuario_id  BIGINT         NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    nome        VARCHAR(120)   NOT NULL,
    valor_alvo  NUMERIC(15, 2) NOT NULL,
    prazo       DATE           NOT NULL,
    criada_em   DATE           NOT NULL
);
CREATE INDEX idx_metas_usuario ON metas (usuario_id);

CREATE TABLE aportes (
    id       BIGSERIAL PRIMARY KEY,
    meta_id  BIGINT         NOT NULL REFERENCES metas (id) ON DELETE CASCADE,
    valor    NUMERIC(15, 2) NOT NULL,
    data     DATE           NOT NULL
);
CREATE INDEX idx_aportes_meta ON aportes (meta_id);
