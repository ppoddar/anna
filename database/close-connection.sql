-- ==================================================
-- Delete all active connection to ANNA database
-- ==================================================
SET client_min_messages TO 'ERROR';

SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'anna'
  AND pid <> pg_backend_pid();