import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Client, CategorieColis, Tarif, Statut } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  DollarSign,
  CircleCheck as CheckCircle2,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";

type Props = {
  onSuccess?: () => void;
  editColis?: {
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
    entrepot_actuel: string;
    date_reception_chine: string | null;
    date_arrivee_kinshasa: string | null;
  } | null;
};

type FormData = {
  client_id: string;
  categorie_id: string;
  tracking_fournisseur: string;
  description: string;
  type_mesure: "poids" | "quantite";
  poids: string;
  quantite: string;
  statut_id: string;
  entrepot_actuel: string;
  date_reception_chine: string;
  date_arrivee_kinshasa: string;
};

type ClientForm = {
  nom: string;
  telephone: string;
  ville: string;
};

const emptyClientForm: ClientForm = {
  nom: "",
  telephone: "",
  ville: "",
};

const emptyForm: FormData = {
  client_id: "",
  categorie_id: "",
  tracking_fournisseur: "",
  description: "",
  type_mesure: "poids",
  poids: "",
  quantite: "",
  statut_id: "1",
  entrepot_actuel: "",
  date_reception_chine: "",
  date_arrivee_kinshasa: "",
};

export default function NouveauColisPage({ onSuccess, editColis }: Props) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<CategorieColis[]>([]);
  const [tarifs, setTarifs] = useState<Record<string, Tarif>>({});
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [prixCalcule, setPrixCalcule] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [newTrackingNum, setNewTrackingNum] = useState("");
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [newClientForm, setNewClientForm] =
    useState<ClientForm>(emptyClientForm);
  const [creatingClient, setCreatingClient] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [clientsRes, catRes, tarifsRes, statutsRes] = await Promise.all([
        supabase.from("clients").select("*").order("nom"),
        supabase.from("categories_colis").select("*").order("nom"),
        supabase.from("tarifs").select("*"),
        supabase.from("statuts").select("*").order("ordre"),
      ]);
      setClients((clientsRes.data ?? []) as Client[]);
      setCategories((catRes.data ?? []) as CategorieColis[]);
      const tarifsMap: Record<string, Tarif> = {};
      ((tarifsRes.data ?? []) as Tarif[]).forEach((t) => {
        tarifsMap[t.categorie_id] = t;
      });
      setTarifs(tarifsMap);
      setStatuts((statutsRes.data ?? []) as Statut[]);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (editColis) {
      const cat = categories.find((c) => c.id === editColis.categorie_id);
      const typeMesure =
        cat?.type_tarification === "piece" ? "quantite" : "poids";
      setForm({
        client_id: editColis.client_id,
        categorie_id: editColis.categorie_id ?? "",
        tracking_fournisseur: editColis.tracking_fournisseur,
        description: editColis.description,
        type_mesure: typeMesure,
        poids: editColis.poids?.toString() ?? "",
        quantite: editColis.quantite?.toString() ?? "",
        statut_id: editColis.statut_id?.toString() ?? "1",
        entrepot_actuel: editColis.entrepot_actuel,
        date_reception_chine: editColis.date_reception_chine ?? "",
        date_arrivee_kinshasa: editColis.date_arrivee_kinshasa ?? "",
      });
    }
  }, [editColis, categories]);

  useEffect(() => {
    if (!form.categorie_id) {
      setPrixCalcule(null);
      return;
    }
    const tarif = tarifs[form.categorie_id];
    if (!tarif) {
      setPrixCalcule(null);
      return;
    }

    const cat = categories.find((c) => c.id === form.categorie_id);
    if (cat?.type_tarification === "kg" && form.poids && tarif.prix_par_kg) {
      setPrixCalcule(parseFloat(form.poids) * tarif.prix_par_kg);
    } else if (
      cat?.type_tarification === "piece" &&
      form.quantite &&
      tarif.prix_par_piece
    ) {
      setPrixCalcule(parseInt(form.quantite) * tarif.prix_par_piece);
    } else {
      setPrixCalcule(null);
    }
  }, [form.categorie_id, form.poids, form.quantite, tarifs, categories]);

  const handleCategorieChange = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    const typeMesure =
      cat?.type_tarification === "piece" ? "quantite" : "poids";
    setForm({
      ...form,
      categorie_id: catId,
      type_mesure: typeMesure,
      poids: "",
      quantite: "",
    });
  };

  const handleCreateClient = async () => {
    if (!newClientForm.nom.trim()) {
      setError("Le nom du client est requis.");
      return;
    }
    if (!newClientForm.telephone.trim()) {
      setError("Le téléphone du client est requis.");
      return;
    }
    if (!newClientForm.ville.trim()) {
      setError("La ville du client est requise.");
      return;
    }

    setCreatingClient(true);
    setError("");

    // Vérifier si le client existe déjà
    const existingClient = clients.find(
      (c) =>
        c.nom.toLowerCase() === newClientForm.nom.toLowerCase() &&
        c.telephone === newClientForm.telephone,
    );

    if (existingClient) {
      setForm({ ...form, client_id: existingClient.id });
      setShowCreateClient(false);
      setNewClientForm(emptyClientForm);
      setCreatingClient(false);
      return;
    }

    // Créer le nouveau client
    const { data: newClient, error: createError } = await supabase
      .from("clients")
      .insert({
        nom: newClientForm.nom.trim(),
        telephone: newClientForm.telephone.trim(),
        ville: newClientForm.ville.trim(),
      })
      .select()
      .single();

    if (createError) {
      setError("Erreur lors de la création du client: " + createError.message);
      setCreatingClient(false);
      return;
    }

    // Ajouter le client à la liste et l'assigner
    if (newClient) {
      setClients([...clients, newClient as Client]);
      setForm({ ...form, client_id: (newClient as Client).id });
    }

    setShowCreateClient(false);
    setNewClientForm(emptyClientForm);
    setCreatingClient(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id) {
      setError("Veuillez sélectionner un client.");
      return;
    }
    if (form.type_mesure === "poids" && !form.poids) {
      setError("Veuillez saisir le poids.");
      return;
    }
    if (form.type_mesure === "quantite" && !form.quantite) {
      setError("Veuillez saisir la quantité.");
      return;
    }

    setSaving(true);
    setError("");

    if (editColis) {
      const { error } = await supabase
        .from("colis")
        .update({
          client_id: form.client_id,
          categorie_id: form.categorie_id || null,
          tracking_fournisseur: form.tracking_fournisseur.trim(),
          description: form.description.trim(),
          poids:
            form.type_mesure === "poids" && form.poids
              ? parseFloat(form.poids)
              : null,
          quantite:
            form.type_mesure === "quantite" && form.quantite
              ? parseInt(form.quantite)
              : null,
          statut_id: form.statut_id ? parseInt(form.statut_id) : null,
          prix_total: prixCalcule,
          entrepot_actuel: form.entrepot_actuel.trim(),
          date_reception_chine: form.date_reception_chine || null,
          date_arrivee_kinshasa: form.date_arrivee_kinshasa || null,
        } as never)
        .eq("id", editColis.id);

      if (error) {
        setError("Erreur lors de la mise à jour.");
        setSaving(false);
        return;
      }
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onSuccess?.();
      }, 1500);
    } else {
      const { data: trackingData } = await supabase.rpc(
        "generate_tracking_interne",
      );
      const tracking = (trackingData ?? "") as string;

      const { error } = await supabase.from("colis").insert({
        tracking_interne: tracking,
        client_id: form.client_id,
        categorie_id: form.categorie_id || null,
        tracking_fournisseur: form.tracking_fournisseur.trim(),
        description: form.description.trim(),
        poids:
          form.type_mesure === "poids" && form.poids
            ? parseFloat(form.poids)
            : null,
        quantite:
          form.type_mesure === "quantite" && form.quantite
            ? parseInt(form.quantite)
            : null,
        statut_id: form.statut_id ? parseInt(form.statut_id) : null,
        prix_total: prixCalcule,
        entrepot_actuel: form.entrepot_actuel.trim(),
        date_reception_chine: form.date_reception_chine || null,
        date_arrivee_kinshasa: form.date_arrivee_kinshasa || null,
        created_by: user?.id ?? null,
      } as never);

      if (error) {
        setError("Erreur lors de la création: " + error.message);
        setSaving(false);
        return;
      }

      const statut1 = parseInt(form.statut_id);
      if (!isNaN(statut1)) {
        const { data: newColis } = await supabase
          .from("colis")
          .select("id")
          .eq("tracking_interne", tracking)
          .maybeSingle();

        const colisId = (newColis as { id?: string } | null)?.id;
        if (colisId) {
          await supabase.from("historique_statuts").insert({
            colis_id: colisId,
            statut_id: statut1,
            commentaire: "Création du colis",
            updated_by: user?.id ?? null,
          } as never);
        }
      }

      setNewTrackingNum(tracking);
      setSaved(true);
      setTimeout(() => {
        setForm(emptyForm);
        setPrixCalcule(null);
        setSaved(false);
        setNewTrackingNum("");
        onSuccess?.();
      }, 3000);
    }
    setSaving(false);
  };

  const selectedCat = categories.find((c) => c.id === form.categorie_id);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#0D2545] px-6 py-6 mb-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/40">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl">
              {editColis ? "Modifier le colis" : "Nouveau colis"}
            </h1>
            <p className="text-blue-300 text-sm">
              {editColis
                ? `Tracking: ${editColis.tracking_interne}`
                : "Le numéro de tracking sera généré automatiquement"}
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-6 py-4 mb-6 rounded-xl flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="text-green-800 font-semibold text-sm">
              {editColis
                ? "Colis mis à jour avec succès !"
                : "Colis créé avec succès !"}
            </p>
            {newTrackingNum && (
              <p className="text-green-700 text-xs mt-0.5">
                Numéro de suivi :{" "}
                <strong className="font-mono">{newTrackingNum}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 px-6 py-4 mb-6 rounded-xl">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Form */}
      {!showCreateClient ? (
        <>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
                Informations client
              </h3>
              <div className="space-y-1.5">
                <Label>Client *</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      value={form.client_id}
                      onValueChange={(v) => setForm({ ...form, client_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nom} — {c.telephone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateClient(true)}
                    className="gap-2 whitespace-nowrap border-[#F97316]/20 hover:bg-orange-50"
                  >
                    <Plus className="w-4 h-4" />
                    Nouveau client
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Colonne 1 */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
                    Détails du colis
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Catégorie</Label>
                      <Select
                        value={form.categorie_id}
                        onValueChange={handleCategorieChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une catégorie..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nom} (
                              {c.type_tarification === "kg"
                                ? "au kg"
                                : "à la pièce"}
                              )
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Réf. fournisseur</Label>
                      <Input
                        placeholder="Ex: CN-2024-99887"
                        value={form.tracking_fournisseur}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            tracking_fournisseur: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Description du contenu du colis..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedCat?.type_tarification === "piece" ? (
                      <div className="space-y-1.5">
                        <Label>Quantité (pièces) *</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            min="1"
                            placeholder="Ex: 50"
                            value={form.quantite}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                quantite: e.target.value,
                                poids: "",
                              })
                            }
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
                            PCS
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Label>
                          Poids (kg){" "}
                          {selectedCat?.type_tarification === "kg" ? "*" : ""}
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            min="0.001"
                            step="0.001"
                            placeholder="Ex: 12.5"
                            value={form.poids}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                poids: e.target.value,
                                quantite: "",
                              })
                            }
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
                            KG
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label>Prix total calculé</Label>
                      <div
                        className={`flex items-center gap-2 h-9 px-3 rounded-md border text-sm font-semibold ${
                          prixCalcule
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-gray-50 border-gray-200 text-gray-400"
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        {prixCalcule != null
                          ? `${prixCalcule.toFixed(2)} USD`
                          : "Calcul automatique"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
                    Logistique & Statut
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Statut initial</Label>
                      <Select
                        value={form.statut_id}
                        onValueChange={(v) =>
                          setForm({ ...form, statut_id: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut..." />
                        </SelectTrigger>
                        <SelectContent>
                          {statuts.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Entrepôt actuel</Label>
                      <Input
                        placeholder="Ex: Entrepôt Guangzhou"
                        value="Entrepôt Guangzhou" disabled
                        onChange={(e) =>
                          setForm({ ...form, entrepot_actuel: e.target.value }) 
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Date réception Chine</Label>
                      <Input
                        type="date"
                        value={form.date_reception_chine}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            date_reception_chine: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Date arrivée Kinshasa</Label>
                      <Input
                        type="date"
                        value={form.date_arrivee_kinshasa}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            date_arrivee_kinshasa: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne 2 - Résumé */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 shadow-sm">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Résumé du colis
                  </h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Client:</span>
                      <span className="font-semibold text-gray-900 text-right">
                        {clients.find((c) => c.id === form.client_id)?.nom ||
                          "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Catégorie:</span>
                      <span className="font-semibold text-gray-900 text-right">
                        {categories.find((c) => c.id === form.categorie_id)
                          ?.nom || "—"}
                      </span>
                    </div>
                    {form.poids && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Poids:</span>
                        <span className="font-semibold text-gray-900">
                          {form.poids} kg
                        </span>
                      </div>
                    )}
                    {form.quantite && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Quantité:</span>
                        <span className="font-semibold text-gray-900">
                          {form.quantite} pcs
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-blue-200">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Prix total:</span>
                        <span
                          className={`font-bold text-lg ${prixCalcule ? "text-green-600" : "text-gray-400"}`}
                        >
                          {prixCalcule != null
                            ? `$${prixCalcule.toFixed(2)}`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForm(emptyForm);
                  setError("");
                  setPrixCalcule(null);
                }}
                className="gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Réinitialiser
              </Button>
              <Button
                type="submit"
                disabled={saving || saved}
                className="flex-1 bg-gradient-to-r from-[#F97316] to-orange-500 hover:from-[#EA6A08] hover:to-orange-600 text-white font-semibold gap-2 shadow-lg shadow-orange-500/20"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {editColis ? "Mis à jour !" : "Colis créé !"}
                  </>
                ) : editColis ? (
                  "Mettre à jour"
                ) : (
                  "Créer le colis"
                )}
              </Button>
            </div>
          </form>
        </>
      ) : (
        /* New Client Form */
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F97316] to-orange-500 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">
                Créer un nouveau client
              </h2>
              <p className="text-sm text-gray-600">
                Remplissez les informations du nouveau client
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowCreateClient(false);
                setNewClientForm(emptyClientForm);
                setError("");
              }}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 px-4 py-3 mb-4 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nom du client *</Label>
              <Input
                placeholder="Ex: Jean Kasongo"
                value={newClientForm.nom}
                onChange={(e) =>
                  setNewClientForm({ ...newClientForm, nom: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Téléphone *</Label>
              <Input
                placeholder="Ex: +243 812 345 678"
                value={newClientForm.telephone}
                onChange={(e) =>
                  setNewClientForm({
                    ...newClientForm,
                    telephone: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Ville *</Label>
              <Input
                placeholder="Ex: Kinshasa"
                value={newClientForm.ville}
                onChange={(e) =>
                  setNewClientForm({ ...newClientForm, ville: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-blue-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateClient(false);
                setNewClientForm(emptyClientForm);
                setError("");
              }}
              className="gap-2"
            >
              <X className="w-3.5 h-3.5" />
              Annuler
            </Button>
            <Button
              type="button"
              disabled={creatingClient}
              onClick={handleCreateClient}
              className="flex-1 bg-gradient-to-r from-[#F97316] to-orange-500 hover:from-[#EA6A08] hover:to-orange-600 text-white font-semibold gap-2 shadow-lg shadow-orange-500/20"
            >
              {creatingClient ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Créer et assigner
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
