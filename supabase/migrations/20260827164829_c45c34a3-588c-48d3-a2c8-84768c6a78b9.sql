CREATE TABLE public.role_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  role public.app_role NOT NULL,
  label text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.role_access_codes TO service_role;

ALTER TABLE public.role_access_codes ENABLE ROW LEVEL SECURITY;
-- no policies: codes are never readable from the app; only the security definer function below uses them

INSERT INTO public.role_access_codes (code, role, label) VALUES
  ('ECOQUEST-STAFF-2026', 'admin', 'School / college staff'),
  ('ECOQUEST-DEVTEAM-2026', 'dev', 'Internal dev team');

CREATE OR REPLACE FUNCTION public.redeem_role_code(_code text)
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.app_role;
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role INTO _role
  FROM public.role_access_codes
  WHERE code = btrim(_code) AND is_active = true;

  IF _role IS NULL THEN
    RAISE EXCEPTION 'Invalid access code';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN _role;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_role_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_role_code(text) TO authenticated;