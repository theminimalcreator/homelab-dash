-- Seed inicial: os 2 Nodes que ja existem hoje (dados vindos do .env atual)
-- mais a VPS, cadastrada em rascunho (sem stats_url/ssh/token ainda -- ver
-- .scratch/multi-node/issues/08-nodes-crud-ui.md, sao preenchidos pelo CRUD).

INSERT INTO nodes
  (name, subtitle, kind, stats_url, ssh_user, ssh_port, tracks_claude_code, tracks_wake_lock, services_runtime, is_self)
VALUES
  ('Master', 'Poco X3 GT', 'termux-master', 'http://192.168.15.43:3000', 'u0_a348', 8022, false, false, 'pm2', true),
  ('Dev Node', 'Redmi Note 12 5G', 'termux-dev', 'http://192.168.15.52:3001', 'u0_a348', 8022, true, true, 'pm2', false);

INSERT INTO nodes
  (name, subtitle, kind, stats_url, services_runtime, is_self)
VALUES
  ('VPS', NULL, 'linux-vps', NULL, 'docker', false);
