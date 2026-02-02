-- Create enum for donation status
CREATE TYPE public.donation_status AS ENUM ('pending', 'approved', 'issued', 'rejected');

-- Create enum for cause types
CREATE TYPE public.cause_type AS ENUM ('orphanage', 'education', 'health', 'women_empowerment', 'environment', 'social_impact', 'general');

-- Create enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'super_admin');

-- Create donations table
CREATE TABLE public.donations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_name TEXT NOT NULL,
    donor_email TEXT,
    donor_phone TEXT,
    amount DECIMAL(10, 2),
    show_amount BOOLEAN DEFAULT false,
    cause cause_type NOT NULL DEFAULT 'general',
    screenshot_url TEXT,
    status donation_status NOT NULL DEFAULT 'pending',
    ai_message TEXT,
    poster_url TEXT,
    poster_issued_at TIMESTAMPTZ,
    issued_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is any admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
  )
$$;

-- RLS Policies for donations

-- Anyone can insert donations (public form)
CREATE POLICY "Anyone can submit donations"
ON public.donations
FOR INSERT
WITH CHECK (true);

-- Only admins can view all donations
CREATE POLICY "Admins can view all donations"
ON public.donations
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Only admins can update donations
CREATE POLICY "Admins can update donations"
ON public.donations
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- RLS Policies for user_roles

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only super_admins can manage roles
CREATE POLICY "Super admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_donations_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for donation screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('donation-screenshots', 'donation-screenshots', false);

-- Create storage bucket for generated posters
INSERT INTO storage.buckets (id, name, public) VALUES ('posters', 'posters', false);

-- Storage policies for donation screenshots
CREATE POLICY "Anyone can upload screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'donation-screenshots');

CREATE POLICY "Admins can view screenshots"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'donation-screenshots' AND public.is_admin(auth.uid()));

-- Storage policies for posters
CREATE POLICY "Admins can manage posters"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'posters' AND public.is_admin(auth.uid()));