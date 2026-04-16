export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nom: string;
          telephone: string;
          role: 'admin' | 'agent';
          created_at: string;
        };
        Insert: {
          id: string;
          nom?: string;
          telephone?: string;
          role?: 'admin' | 'agent';
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          telephone?: string;
          role?: 'admin' | 'agent';
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          nom: string;
          telephone: string;
          ville: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          telephone?: string;
          ville?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          telephone?: string;
          ville?: string;
          created_at?: string;
        };
      };
      statuts: {
        Row: {
          id: number;
          nom: string;
          ordre: number;
          couleur: string;
          created_at: string;
        };
        Insert: {
          nom: string;
          ordre?: number;
          couleur?: string;
          created_at?: string;
        };
        Update: {
          nom?: string;
          ordre?: number;
          couleur?: string;
          created_at?: string;
        };
      };
      categories_colis: {
        Row: {
          id: string;
          nom: string;
          type_tarification: 'kg' | 'piece';
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          type_tarification?: 'kg' | 'piece';
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          type_tarification?: 'kg' | 'piece';
          created_at?: string;
        };
      };
      tarifs: {
        Row: {
          id: string;
          categorie_id: string;
          prix_par_kg: number | null;
          prix_par_piece: number | null;
          devise: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          categorie_id: string;
          prix_par_kg?: number | null;
          prix_par_piece?: number | null;
          devise?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          categorie_id?: string;
          prix_par_kg?: number | null;
          prix_par_piece?: number | null;
          devise?: string;
          created_at?: string;
        };
      };
      colis: {
        Row: {
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
        };
        Insert: {
          id?: string;
          tracking_interne: string;
          tracking_fournisseur?: string;
          client_id: string;
          categorie_id?: string | null;
          description?: string;
          poids?: number | null;
          quantite?: number | null;
          statut_id?: number | null;
          prix_total?: number | null;
          devise?: string;
          entrepot_actuel?: string;
          date_reception_chine?: string | null;
          date_arrivee_kinshasa?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tracking_interne?: string;
          tracking_fournisseur?: string;
          client_id?: string;
          categorie_id?: string | null;
          description?: string;
          poids?: number | null;
          quantite?: number | null;
          statut_id?: number | null;
          prix_total?: number | null;
          devise?: string;
          entrepot_actuel?: string;
          date_reception_chine?: string | null;
          date_arrivee_kinshasa?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      historique_statuts: {
        Row: {
          id: string;
          colis_id: string;
          statut_id: number;
          commentaire: string;
          updated_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          colis_id: string;
          statut_id: number;
          commentaire?: string;
          updated_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          colis_id?: string;
          statut_id?: number;
          commentaire?: string;
          updated_by?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      generate_tracking_interne: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
  };
}
