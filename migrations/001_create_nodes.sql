-- Multi-node: tabela que substitui o .env hardcoded de Nodes.
-- Ver .scratch/multi-node/spec.md, secao "Armazenamento dos Nodes".

CREATE TABLE nodes (
  id                  SERIAL PRIMARY KEY,
  name                TEXT NOT NULL,
  subtitle            TEXT,
  kind                TEXT NOT NULL,
  stats_url           TEXT NOT NULL,
  ssh_user            TEXT,
  ssh_port            INTEGER,
  auth_token          TEXT,
  tracks_claude_code  BOOLEAN NOT NULL DEFAULT false,
  tracks_wake_lock    BOOLEAN NOT NULL DEFAULT false,
  services_runtime    TEXT NOT NULL DEFAULT 'none'
                      CHECK (services_runtime IN ('pm2', 'docker', 'none')),
  is_self             BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No maximo um Node marcado como "sou eu" (o Master que esta rodando o agregador).
CREATE UNIQUE INDEX nodes_single_self ON nodes (is_self) WHERE is_self = true;
