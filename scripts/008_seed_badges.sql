-- 008_seed_badges.rollout.sql
-- Rollout: Inserts default badge definitions and assigns them to eligible users.
-- Safe to re-run; uses ON CONFLICT DO NOTHING.

-- Insert default badges
INSERT INTO public."Badge" (id, name, description, icon, type, requirement, "createdAt", "updatedAt")
VALUES
  ('first_project', 'First Project', 'Create your first project', '📝', 'writing', '{"projectCount": 1}', NOW(), NOW()),
  ('ten_projects', 'Prolific', 'Create 10 projects', '📚', 'writing', '{"projectCount": 10}', NOW(), NOW()),
  ('thousand_words', '1K Words', 'Write 1,000 words', '✍️', 'writing', '{"wordCount": 1000}', NOW(), NOW()),
  ('ten_thousand_words', 'Novelist', 'Write 10,000 words', '📖', 'writing', '{"wordCount": 10000}', NOW(), NOW()),
  ('seven_day_streak', 'Week Streak', '7-day writing streak', '🔥', 'streak', '{"streakDays": 7}', NOW(), NOW()),
  ('thirty_day_streak', 'Monthly Streak', '30-day writing streak', '🌟', 'streak', '{"streakDays": 30}', NOW(), NOW()),
  ('first_follower', 'Audience', 'Get your first follower', '👥', 'social', '{"followerCount": 1}', NOW(), NOW()),
  ('ten_followers', 'Growing Audience', 'Get 10 followers', '🎉', 'social', '{"followerCount": 10}', NOW(), NOW()),
  ('first_goal', 'Goal Setter', 'Set your first writing goal', '🎯', 'goal', '{"goalCount": 1}', NOW(), NOW()),
  ('goal_complete', 'Goal Achiever', 'Complete a writing goal', '✅', 'goal', '{"completedGoals": 1}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Award badges to users who already qualify
INSERT INTO public."UserBadge" ("userId", "badgeId", "earnedAt")
SELECT u.id, 'first_project', u."createdAt"
FROM public."User" u
INNER JOIN public."Project" p ON p."userId" = u.id
WHERE NOT EXISTS (SELECT 1 FROM public."UserBadge" ub WHERE ub."userId" = u.id AND ub."badgeId" = 'first_project')
GROUP BY u.id, u."createdAt"
ON CONFLICT DO NOTHING;