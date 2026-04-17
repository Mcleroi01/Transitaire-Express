export type Profile = {
  email: string;
  id: string;
  nom: string;
  telephone: string;
  role: 'admin' | 'agent';
  created_at: string;
};

export type Client = {
  id: string;
  nom: string;
  telephone: string;
  ville: string;
  created_at: string;
};

export type Statut = {
  id: number;
  nom: string;
  ordre: number;
  couleur: string;
  created_at: string;
};

export type CategorieColis = {
  id: string;
  nom: string;
  type_tarification: 'kg' | 'piece';
  created_at: string;
};

export type Tarif = {
  id: string;
  categorie_id: string;
  prix_par_kg: number | null;
  prix_par_piece: number | null;
  devise: string;
  created_at: string;
};

export type Colis = {
  id: string;
  tracking_interne: string;
  tracking_fournisseur: string;
  client_id: string;
  categorie_id: string | null;
  description: string;
  poids: number | null;
  quantite: number | null;
  statut_id: number | null;
  prix_total: number | null;
  devise: string;
  entrepot_actuel: string;
  date_reception_chine: string | null;
  date_arrivee_kinshasa: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  clients?: Client;
  statuts?: Statut;
  categories_colis?: CategorieColis;
};

export type HistoriqueStatut = {
  id: string;
  colis_id: string;
  statut_id: number;
  commentaire: string;
  updated_by: string | null;
  created_at: string;
  statuts?: Statut;
  profiles?: Profile;
};

export type ColisWithRelations = Colis & {
  clients: Client;
  statuts: Statut | null;
  categories_colis: CategorieColis | null;
};

export type TrackingResult = {
  colis: ColisWithRelations;
  historique: (HistoriqueStatut & { statuts: Statut; profiles: Profile | null })[];
};
