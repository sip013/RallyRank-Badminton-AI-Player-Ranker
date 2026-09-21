# Deprecated: `update-ratings`

This edge function is superseded by the transactional Postgres RPC `log_match`
and the authenticated wrapper at `supabase/functions/log-match`.

Do not deploy or expose `update-ratings` without fixing auth and write bugs.
