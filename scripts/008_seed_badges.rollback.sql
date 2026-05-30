-- 008_seed_badges.rollback.sql
-- Rollback: Removes the default badges and any awarded UserBadge entries.
-- Only removes badges that were inserted by this seed script.

DELETE FROM public."UserBadge"
WHERE "badgeId" IN (
  'first_project', 'ten_projects', 'thousand_words', 'ten_thousand_words',
  'seven_day_streak', 'thirty_day_streak', 'first_follower', 'ten_followers',
  'first_goal', 'goal_complete'
);

DELETE FROM public."Badge"
WHERE id IN (
  'first_project', 'ten_projects', 'thousand_words', 'ten_thousand_words',
  'seven_day_streak', 'thirty_day_streak', 'first_follower', 'ten_followers',
  'first_goal', 'goal_complete'
);
