-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, total_xp, current_streak, longest_streak, lootbox_available_at)
  VALUES (
    new.id,
    new.email,
    0,
    0,
    0,
    NOW()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also handle case where user already exists but has no profile
INSERT INTO public.user_profiles (user_id, email, total_xp, current_streak, longest_streak, lootbox_available_at)
SELECT 
  id,
  email,
  0,
  0,
  0,
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_profiles)
ON CONFLICT (user_id) DO NOTHING;