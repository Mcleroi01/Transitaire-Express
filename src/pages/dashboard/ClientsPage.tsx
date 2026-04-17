import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ClientForm = {
  nom: string;
  telephone: string;
  ville: string;
};

const emptyForm: ClientForm = { nom: "", telephone: "", ville: "" };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filtered, setFiltered] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("nom", { ascending: true });
    setClients((data ?? []) as Client[]);
    setFiltered((data ?? []) as Client[]);
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      clients.filter(
        (c) =>
          c.nom.toLowerCase().includes(q) ||
          c.telephone.includes(q) ||
          c.ville.toLowerCase().includes(q),
      ),
    );
  }, [search, clients]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditTarget(client);
    setForm({
      nom: client.nom,
      telephone: client.telephone,
      ville: client.ville,
    });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }
    setSaving(true);
    setError("");

    if (editTarget) {
      const { error } = await supabase
        .from("clients")
        .update({
          nom: form.nom.trim(),
          telephone: form.telephone.trim(),
          ville: form.ville.trim(),
        } as never)
        .eq("id", editTarget.id);
      if (error) {
        setError("Erreur lors de la mise à jour.");
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("clients")
        .insert({
          nom: form.nom.trim(),
          telephone: form.telephone.trim(),
          ville: form.ville.trim(),
        } as never);
      if (error) {
        setError("Erreur lors de la création.");
        setSaving(false);
        return;
      }
    }

    await loadClients();
    setDialogOpen(false);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from("clients").delete().eq("id", deleteId);
    setDeleteId(null);
    await loadClients();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#0D2545] rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-white">
                Gestion des clients
              </h1>
              <p className="text-blue-300 text-sm">
                {filtered.length} client(s) enregistré(s)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher par nom, téléphone ou ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 text-sm border border-gray-200 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all"
          />
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-[#F97316] to-orange-500 hover:from-[#EA6A08] hover:to-orange-600 text-white h-10 gap-2 font-semibold shadow-lg shadow-orange-500/20 transition-all duration-200 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau client</span>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4" />
              <div className="h-5 bg-gray-100 rounded w-32 mb-3" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-40" />
                <div className="h-4 bg-gray-100 rounded w-36" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 py-16 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            Aucun client trouvé
          </p>
          {search && (
            <p className="text-gray-600 text-sm mt-2">
              Essayez un autre terme de recherche
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                  {client.nom.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(client)}
                    className="px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#F97316] transition-all duration-150 flex items-center gap-1.5 text-sm font-medium"
                  >
                    <Pencil className="w-4 h-4" />
                    <span className="hidden sm:inline">Éditer</span>
                  </button>
                  <button
                    onClick={() => setDeleteId(client.id)}
                    className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-150 flex items-center gap-1.5 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Suppr.</span>
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-blue-600 transition-colors">
                {client.nom}
              </h4>

              <div className="space-y-2.5 mb-4">
                {client.telephone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">
                      {client.telephone}
                    </span>
                  </div>
                )}
                {client.ville && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-[#F97316]" />
                    </div>
                    <span className="text-sm font-medium">{client.ville}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-gray-500 text-xs">
                  📅{" "}
                  {format(new Date(client.created_at), "dd MMM yyyy", {
                    locale: fr,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="bg-gradient-to-r from-blue-400 to-blue-600 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
            <DialogTitle className="flex items-center gap-2 text-white text-lg">
              <User className="w-5 h-5" />
              {editTarget ? "Modifier le client" : "Nouveau client"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="space-y-1.5">
              <Label
                htmlFor="nom"
                className="text-sm font-semibold text-gray-700"
              >
                Nom complet *
              </Label>
              <Input
                id="nom"
                placeholder="Jean Mukendi"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="tel"
                className="text-sm font-semibold text-gray-700"
              >
                Téléphone
              </Label>
              <Input
                id="tel"
                placeholder="+243 81 234 5678"
                value={form.telephone}
                onChange={(e) =>
                  setForm({ ...form, telephone: e.target.value })
                }
                className="border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="ville"
                className="text-sm font-semibold text-gray-700"
              >
                Ville
              </Label>
              <Input
                id="ville"
                placeholder="Kinshasa"
                value={form.ville}
                onChange={(e) => setForm({ ...form, ville: e.target.value })}
                className="border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
              />
            </div>
            <DialogFooter className="gap-2 mt-4 border-t border-gray-200 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-semibold gap-2 shadow-lg shadow-blue-500/20"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : editTarget ? (
                  "Mettre à jour"
                ) : (
                  "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le client sera supprimé mais ses
              colis seront conservés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
