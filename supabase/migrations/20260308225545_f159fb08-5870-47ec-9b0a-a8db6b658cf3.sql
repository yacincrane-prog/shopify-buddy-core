
CREATE TABLE public.shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wilaya_code text NOT NULL UNIQUE,
  wilaya_name text NOT NULL,
  home_delivery_price numeric NOT NULL DEFAULT 0,
  stop_desk_price numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  stop_desk_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active shipping rates" ON public.shipping_rates FOR SELECT USING (true);
CREATE POLICY "Auth users manage shipping rates" ON public.shipping_rates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed with all 58 wilayas from hardcoded data
INSERT INTO public.shipping_rates (wilaya_code, wilaya_name, home_delivery_price, stop_desk_price) VALUES
('01','Adrar',1200,800),('02','Chlef',700,400),('03','Laghouat',900,600),('04','Oum El Bouaghi',800,500),
('05','Batna',700,400),('06','Béjaïa',700,400),('07','Biskra',800,500),('08','Béchar',1200,800),
('09','Blida',500,300),('10','Bouira',600,400),('11','Tamanrasset',1500,1000),('12','Tébessa',800,500),
('13','Tlemcen',800,500),('14','Tiaret',800,500),('15','Tizi Ouzou',600,400),('16','Alger',400,250),
('17','Djelfa',800,500),('18','Jijel',700,400),('19','Sétif',600,400),('20','Saïda',900,600),
('21','Skikda',700,400),('22','Sidi Bel Abbès',800,500),('23','Annaba',700,400),('24','Guelma',700,400),
('25','Constantine',600,400),('26','Médéa',600,400),('27','Mostaganem',700,400),('28','M''sila',700,400),
('29','Mascara',800,500),('30','Ouargla',1000,700),('31','Oran',600,400),('32','El Bayadh',1100,700),
('33','Illizi',1500,1000),('34','Bordj Bou Arréridj',700,400),('35','Boumerdès',500,300),('36','El Tarf',800,500),
('37','Tindouf',1500,1000),('38','Tissemsilt',800,500),('39','El Oued',900,600),('40','Khenchela',800,500),
('41','Souk Ahras',800,500),('42','Tipaza',500,300),('43','Mila',700,400),('44','Aïn Defla',600,400),
('45','Naâma',1100,700),('46','Aïn Témouchent',800,500),('47','Ghardaïa',1000,700),('48','Relizane',700,400),
('49','El M''ghair',1000,700),('50','El Meniaa',1100,700),('51','Ouled Djellal',900,600),
('52','Bordj Badji Mokhtar',1500,1000),('53','Béni Abbès',1300,900),('54','In Salah',1500,1000),
('55','In Guezzam',1500,1000),('56','Touggourt',900,600),('57','Djanet',1500,1000),('58','El Meghaier',1000,700);
