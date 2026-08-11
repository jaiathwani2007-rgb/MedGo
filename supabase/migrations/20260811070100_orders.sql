CREATE TABLE public.delivery_charge_rules (
  id integer PRIMARY KEY DEFAULT 1,
  min_order_value_for_free_delivery numeric(10,2) NOT NULL DEFAULT 500,
  flat_delivery_fee numeric(10,2) NOT NULL DEFAULT 50,
  max_delivery_radius_km double precision NOT NULL DEFAULT 5.0,
  shop_latitude double precision,
  shop_longitude double precision
);

INSERT INTO public.delivery_charge_rules (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE public.delivery_charge_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rules viewable by everyone" ON public.delivery_charge_rules FOR SELECT USING (true);

CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id),
  address_id uuid NOT NULL REFERENCES public.addresses(id),
  status text NOT NULL DEFAULT 'pending_verification',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text,
  payment_status text DEFAULT 'pending',
  payment_reference text,
  delivery_otp text,
  pharmacist_note text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  medicine_id uuid REFERENCES public.medicines(id),
  medicine_name text,
  quantity integer NOT NULL,
  price_at_time numeric(10,2) NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = profile_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE profile_id = auth.uid())
);
CREATE POLICY "Users insert own order items" ON public.order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE profile_id = auth.uid())
);
