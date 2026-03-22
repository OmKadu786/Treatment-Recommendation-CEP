-- Create a trigger that automatically inserts a profile whenever a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (new.id, 'Patient', 'User');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill existing users (like the one you just created) who do not have a profile yet
INSERT INTO public.profiles (id, first_name, last_name)
SELECT id, 'Patient', 'User'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
