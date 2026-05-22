-- 008_seed_badges.sql
-- Seeds the 7 default StoryForge badges for the gamification system.
-- Idempotent: uses ON CONFLICT DO NOTHING.

INSERT INTO public."Badge" (id, name, description, "threshold", "type")
VALUES
  ('badge_quill_bronze',  'Bronze Quill',   'Write 1,000 total words',   1000,   'total_words'),
  ('badge_scroll_silver', 'Silver Scroll',   'Write 5,000 total words',   5000,   'total_words'),
  ('badge_book_gold',     'Golden Book',     'Write 10,000 total words',  10000,  'total_words'),
  ('badge_library_platinum', 'Platinum Library', 'Write 50,000 total words', 50000, 'total_words'),
  ('badge_galaxy_diamond','Diamond Galaxy',  'Write 100,000 total words', 100000, 'total_words'),
  ('badge_fire_streak',   'Fire Streak',     'Maintain a 7-day writing streak', 7, 'streak'),
  ('badge_crown_legend',  'Legendary Crown', 'Reach 500,000 total words written', 500000, 'total_words')
ON CONFLICT (id) DO NOTHING;
