-- 20260404010001_fix_auth_trigger.sql
-- Force the backend authentication trigger to dynamically respect the requested 'role'

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, email, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.email, -- Ensures the email is also securely piped over to profiles immediately
    COALESCE(new.raw_user_meta_data->>'role', 'patient') -- Dynamically pulls 'doctor' or defaults to 'patient'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
