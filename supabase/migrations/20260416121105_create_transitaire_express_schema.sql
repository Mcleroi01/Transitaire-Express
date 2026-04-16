
/*
  # Transitaire Express - Complete Database Schema

  ## Overview
  Freight logistics management system for shipments between China and Kinshasa (DRC).

  ## Tables Created
  1. **profiles** - Extended user profiles linked to Supabase auth
     - id (uuid, linked to auth.users)
     - nom, telephone, role (admin|agent)

  2. **clients** - Customer records
     - id, nom, telephone, ville, created_at

  3. **statuts** - Package status definitions (ordered)
     - id (serial), nom, ordre

  4. **categories_colis** - Package categories
     - id, nom, type_tarification (kg|piece)

  5. **tarifs** - Pricing per category
     - id, categorie_id, prix_par_kg, prix_par_piece, devise

  6. **colis** - Package/shipment records
     - id, tracking_interne (unique, auto-generated TE-YYYY-XXXX)
     - tracking_fournisseur, client_id, categorie_id
     - description, poids, quantite, statut_id
     - entrepot_actuel, date_reception_chine, date_arrivee_kinshasa
     - created_by, created_at

  7. **historique_statuts** - Status change audit trail
     - id, colis_id, statut_id, commentaire, updated_by, created_at

  ## Security
  - RLS enabled on all tables
  - Authenticated agents/admins can manage data
  - Public tracking access for colis via tracking numbers
  - Profiles auto-created on user signup

  ## Seed Data
  - Default statuts (ordered workflow)
  - Sample categories and tarifs
*/

-- ================================================
-- PROFILES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom text NOT NULL DEFAULT '',
  telephone text DEFAULT '',
  role text NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ================================================
-- CLIENTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  telephone text NOT NULL DEFAULT '',
  ville text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (true);

-- ================================================
-- STATUTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS statuts (
  id serial PRIMARY KEY,
  nom text NOT NULL,
  ordre int NOT NULL DEFAULT 0,
  couleur text NOT NULL DEFAULT '#6B7280',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE statuts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view statuts"
  ON statuts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage statuts"
  ON statuts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update statuts"
  ON statuts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ================================================
-- CATEGORIES COLIS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS categories_colis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  type_tarification text NOT NULL DEFAULT 'kg' CHECK (type_tarification IN ('kg', 'piece')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories_colis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories_colis FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories_colis FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories_colis FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories_colis FOR DELETE
  TO authenticated
  USING (true);

-- ================================================
-- TARIFS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS tarifs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categorie_id uuid NOT NULL REFERENCES categories_colis(id) ON DELETE CASCADE,
  prix_par_kg numeric(10, 2) DEFAULT NULL,
  prix_par_piece numeric(10, 2) DEFAULT NULL,
  devise text NOT NULL DEFAULT 'USD',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tarifs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tarifs"
  ON tarifs FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage tarifs"
  ON tarifs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tarifs"
  ON tarifs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tarifs"
  ON tarifs FOR DELETE
  TO authenticated
  USING (true);

-- ================================================
-- COLIS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS colis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_interne text UNIQUE NOT NULL,
  tracking_fournisseur text DEFAULT '',
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  categorie_id uuid REFERENCES categories_colis(id) ON DELETE SET NULL,
  description text DEFAULT '',
  poids numeric(10, 3) DEFAULT NULL,
  quantite int DEFAULT NULL,
  statut_id int REFERENCES statuts(id) ON DELETE SET NULL,
  prix_total numeric(10, 2) DEFAULT NULL,
  devise text NOT NULL DEFAULT 'USD',
  entrepot_actuel text DEFAULT '',
  date_reception_chine date DEFAULT NULL,
  date_arrivee_kinshasa date DEFAULT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE colis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view colis by tracking number"
  ON colis FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert colis"
  ON colis FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update colis"
  ON colis FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete colis"
  ON colis FOR DELETE
  TO authenticated
  USING (true);

-- ================================================
-- HISTORIQUE STATUTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS historique_statuts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colis_id uuid NOT NULL REFERENCES colis(id) ON DELETE CASCADE,
  statut_id int NOT NULL REFERENCES statuts(id) ON DELETE RESTRICT,
  commentaire text DEFAULT '',
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE historique_statuts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view historique"
  ON historique_statuts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert historique"
  ON historique_statuts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ================================================
-- AUTO-UPDATE UPDATED_AT FOR COLIS
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_colis_updated_at
  BEFORE UPDATE ON colis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', NEW.email, 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================================
-- TRACKING NUMBER SEQUENCE
-- ================================================
CREATE SEQUENCE IF NOT EXISTS tracking_sequence START 1000;

CREATE OR REPLACE FUNCTION generate_tracking_interne()
RETURNS text AS $$
DECLARE
  year_part text;
  seq_part text;
  tracking text;
BEGIN
  year_part := to_char(now(), 'YYYY');
  seq_part := lpad(nextval('tracking_sequence')::text, 4, '0');
  tracking := 'TE-' || year_part || '-' || seq_part;
  RETURN tracking;
END;
$$ language 'plpgsql';

-- ================================================
-- SEED DATA: STATUTS
-- ================================================
INSERT INTO statuts (nom, ordre, couleur) VALUES
  ('Reçu en Chine', 1, '#F97316'),
  ('En préparation', 2, '#EAB308'),
  ('Expédié', 3, '#3B82F6'),
  ('En transit', 4, '#8B5CF6'),
  ('Arrivé à Kinshasa', 5, '#06B6D4'),
  ('Disponible', 6, '#10B981'),
  ('Livré', 7, '#22C55E')
ON CONFLICT DO NOTHING;

-- ================================================
-- SEED DATA: CATEGORIES AND TARIFS
-- ================================================
INSERT INTO categories_colis (id, nom, type_tarification) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Électronique', 'kg'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Vêtements / Textiles', 'kg'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Alimentation', 'kg'),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'Pièces automobiles', 'kg'),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'Cosmétiques', 'piece'),
  ('f6a7b8c9-d0e1-2345-fabc-456789012345', 'Téléphones', 'piece'),
  ('a7b8c9d0-e1f2-3456-abcd-567890123456', 'Accessoires divers', 'piece')
ON CONFLICT DO NOTHING;

INSERT INTO tarifs (categorie_id, prix_par_kg, prix_par_piece, devise) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 12.00, NULL, 'USD'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 8.00, NULL, 'USD'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 5.00, NULL, 'USD'),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 10.00, NULL, 'USD'),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', NULL, 3.50, 'USD'),
  ('f6a7b8c9-d0e1-2345-fabc-456789012345', NULL, 5.00, 'USD'),
  ('a7b8c9d0-e1f2-3456-abcd-567890123456', NULL, 2.00, 'USD')
ON CONFLICT DO NOTHING;
