-- Smoke checks after applying 20260321000000_clubs_tenancy_ratings.sql
-- Run in Supabase SQL editor while authenticated as a test user via the Dashboard
-- (or replace auth.uid() assumptions by calling RPCs from the app).

-- 1) create_club
-- select public.create_club('Smoke Test Club');

-- 2) create_invite (as owner)
-- select public.create_invite('<club_id>', 'coach');

-- 3) log_match (after inserting players with club_id)
-- select public.log_match(
--   '<club_id>',
--   '<p1>', null,
--   '<p2>', null,
--   21, 15,
--   now()
-- );

-- 4) Verify rating events have player_id
-- select id, player_id, rating_before, rating_after, rating_change
-- from public.match_history
-- where club_id = '<club_id>'
-- order by created_at desc
-- limit 10;

-- 5) Public ladder
-- select public.get_public_ladder('<share_token>');
