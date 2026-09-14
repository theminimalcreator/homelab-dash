-- Um Node pode existir "rascunho" antes de ter uma stats_url real (ex: a VPS,
-- cadastrada via seed antes de alguem preencher o endereco pelo CRUD/issue 08).
-- Ver .scratch/multi-node/issues/03-seed-initial-nodes.md.

ALTER TABLE nodes ALTER COLUMN stats_url DROP NOT NULL;
