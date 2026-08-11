-- Create profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'customer',
  full_name text,
  age integer,
  language_preference text NOT NULL DEFAULT 'en',
  phone_number text,
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create addresses table
CREATE TABLE public.addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  address_text text NOT NULL,
  latitude double precision,
  longitude double precision,
  is_default boolean NOT NULL DEFAULT false,
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Profiles are viewable by owner."
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Addresses Policies
CREATE POLICY "Users can view own addresses."
  ON public.addresses FOR SELECT
  USING ( auth.uid() = profile_id );

CREATE POLICY "Users can insert own addresses."
  ON public.addresses FOR INSERT
  WITH CHECK ( auth.uid() = profile_id );

CREATE POLICY "Users can update own addresses."
  ON public.addresses FOR UPDATE
  USING ( auth.uid() = profile_id );

CREATE POLICY "Users can delete own addresses."
  ON public.addresses FOR DELETE
  USING ( auth.uid() = profile_id );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number, role)
  VALUES (
    new.id,
    new.phone,
    'customer'
  );
  RETURN new;
END;
$$;

-- Trigger to call the function on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
