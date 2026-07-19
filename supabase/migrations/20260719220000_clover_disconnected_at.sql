-- Mark Clover connection inactive when merchant uninstalls the app (App webhook DELETE).

ALTER TABLE clover_connections
  ADD COLUMN IF NOT EXISTS disconnected_at TIMESTAMPTZ;

COMMENT ON COLUMN clover_connections.disconnected_at IS
  'Set when Clover App webhook reports uninstall; null means the connection is active.';
