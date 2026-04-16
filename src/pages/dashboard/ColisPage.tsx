import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { ColisWithRelations, Statut, HistoriqueStatut } from "@/lib/types";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Package,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Clock,
  Hash,
  CircleCheck as CheckCircle2,
  ChevronDown,
  Plus,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import NouveauColisPage from "./NouveauColisPage";

type DetailedColis = ColisWithRelations & {
  historique?: (HistoriqueStatut & { statuts: Statut })[];
};

export default function ColisPage() {
  const { user } = useAuth();
  const [colis, setColis] = useState<ColisWithRelations[]>([]);
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [viewColis, setViewColis] = useState<DetailedColis | null>(null);
  const [editColis, setEditColis] = useState<ColisWithRelations | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updateStatutTarget, setUpdateStatutTarget] =
    useState<ColisWithRelations | null>(null);
  const [newStatutId, setNewStatutId] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [updatingStatut, setUpdatingStatut] = useState(false);

  const loadColis = useCallback(async () => {
    const { data } = await supabase
      .from("colis")
      .select("*, clients(*), statuts(*), categories_colis(*)")
      .order("created_at", { ascending: false });
    setColis((data ?? []) as ColisWithRelations[]);
    setLoading(false);
  }, []);

  const loadStatuts = useCallback(async () => {
    const { data } = await supabase.from("statuts").select("*").order("ordre");
    setStatuts((data ?? []) as Statut[]);
  }, []);

  useEffect(() => {
    loadColis();
    loadStatuts();
  }, [loadColis, loadStatuts]);

  const filtered = colis.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.tracking_interne.toLowerCase().includes(q) ||
      c.tracking_fournisseur?.toLowerCase().includes(q) ||
      c.clients?.nom?.toLowerCase().includes(q);
    const matchStatut =
      filterStatut === "all" || c.statut_id?.toString() === filterStatut;
    return matchSearch && matchStatut;
  });

  const openView = async (c: ColisWithRelations) => {
    const { data: historique } = await supabase
      .from("historique_statuts")
      .select("*, statuts(*)")
      .eq("colis_id", c.id)
      .order("created_at", { ascending: false });
    setViewColis({
      ...c,
      historique: (historique ?? []) as (HistoriqueStatut & {
        statuts: Statut;
      })[],
    });
  };

  const openUpdateStatut = (c: ColisWithRelations) => {
    setUpdateStatutTarget(c);
    setNewStatutId(c.statut_id?.toString() ?? "");
    setCommentaire("");
  };

  const handleUpdateStatut = async () => {
    if (!updateStatutTarget || !newStatutId) return;
    setUpdatingStatut(true);

    await supabase
      .from("colis")
      .update({ statut_id: parseInt(newStatutId) } as never)
      .eq("id", updateStatutTarget.id);

    await supabase.from("historique_statuts").insert({
      colis_id: updateStatutTarget.id,
      statut_id: parseInt(newStatutId),
      commentaire: commentaire.trim(),
      updated_by: user?.id ?? null,
    } as never);

    setUpdateStatutTarget(null);
    setCommentaire("");
    await loadColis();
    setUpdatingStatut(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from("colis").delete().eq("id", deleteId);
    setDeleteId(null);
    await loadColis();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#0D2545] rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/40">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-white">
                Gestion des colis
              </h1>
              <p className="text-blue-300 text-sm">
                {filtered.length} colis trouvé(s)
              </p>
            </div>
          </div>
          <button
            onClick={loadColis}
            className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-blue-300 hover:text-white transition-all duration-200 group"
            title="Actualiser la liste"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
        <div className="flex gap-3 items-start flex-col sm:flex-row">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par N° tracking, client, référence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-sm border border-gray-200 bg-white focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-500 shrink-0" />
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger className="h-10 text-sm border border-gray-200 bg-white focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20 w-full sm:w-56">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {statuts.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: s.couleur }}
                      />
                      {s.nom}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="h-4 bg-gray-100 rounded w-28" />
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-4 bg-gray-100 rounded w-20 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 py-16 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
            <Package className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            Aucun colis trouvé
          </p>
          {(search || filterStatut !== "all") && (
            <p className="text-gray-600 text-sm mt-2">
              Essayez d'ajuster vos critères de recherche ou vos filtres
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-widest">
                    Tracking
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-widest hidden sm:table-cell">
                    Client
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-widest hidden md:table-cell">
                    Catégorie
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-widest hidden lg:table-cell">
                    Poids/Qté
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-widest">
                    Statut
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-widest hidden xl:table-cell">
                    Prix
                  </th>
                  <th className="text-right px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-colors duration-150"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <span className="font-mono font-bold text-[#0A1628] text-sm">
                          {c.tracking_interne}
                        </span>
                        {c.tracking_fournisseur && (
                          <p className="text-gray-400 text-xs mt-1 truncate max-w-[140px]">
                            {c.tracking_fournisseur}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-gray-800 font-semibold block">
                        {c.clients?.nom}
                      </span>
                      {c.clients?.ville && (
                        <p className="text-gray-500 text-xs mt-0.5">
                          {c.clients.ville}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell text-gray-700 font-medium">
                      {c.categories_colis?.nom ?? "—"}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-gray-700 font-medium">
                      {c.poids
                        ? `${c.poids} kg`
                        : c.quantite
                          ? `${c.quantite} pcs`
                          : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => openUpdateStatut(c)}
                        className="group flex items-center gap-1.5 hover:scale-105 transition-transform"
                        title="Cliquer pour changer le statut"
                      >
                        {c.statuts ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm group-hover:shadow-md transition-all"
                            style={{ backgroundColor: c.statuts.couleur }}
                          >
                            {c.statuts.nom}
                            <ChevronDown className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Définir
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 hidden xl:table-cell">
                      {c.prix_total ? (
                        <span className="font-bold text-gray-900">
                          ${c.prix_total.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openView(c)}
                          className="px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-150 group flex items-center gap-1.5 text-sm font-medium"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Voir</span>
                        </button>
                        <button
                          onClick={() => setEditColis(c)}
                          className="px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#F97316] hover:text-orange-700 transition-all duration-150 group flex items-center gap-1.5 text-sm font-medium"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="hidden sm:inline">Éditer</span>
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-150 group flex items-center gap-1.5 text-sm font-medium"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Suppr.</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog
        open={!!viewColis}
        onOpenChange={(open) => !open && setViewColis(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="bg-gradient-to-r from-[#0A1628] to-[#0D2545] -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
            <DialogTitle className="flex items-center gap-3 font-mono text-white text-lg">
              <Hash className="w-5 h-5 text-[#F97316]" />
              {viewColis?.tracking_interne}
            </DialogTitle>
          </DialogHeader>

          {viewColis && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Client", value: viewColis.clients?.nom },
                  { label: "Ville", value: viewColis.clients?.ville || "—" },
                  {
                    label: "Téléphone",
                    value: viewColis.clients?.telephone || "—",
                  },
                  {
                    label: "Catégorie",
                    value: viewColis.categories_colis?.nom ?? "—",
                  },
                  {
                    label: "Poids/Qté",
                    value: viewColis.poids
                      ? `${viewColis.poids} kg`
                      : viewColis.quantite
                        ? `${viewColis.quantite} pcs`
                        : "—",
                  },
                  {
                    label: "Prix total",
                    value: viewColis.prix_total
                      ? `$${viewColis.prix_total.toFixed(2)}`
                      : "—",
                  },
                  {
                    label: "Entrepôt",
                    value: viewColis.entrepot_actuel || "—",
                  },
                  {
                    label: "Réf. fournisseur",
                    value: viewColis.tracking_fournisseur || "—",
                  },
                  { label: "Statut", value: viewColis.statuts?.nom ?? "—" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-3"
                  >
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {viewColis.description && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Description
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {viewColis.description}
                  </p>
                </div>
              )}

              {viewColis.historique && viewColis.historique.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-[#F97316]" />
                    Historique des statuts
                  </h4>
                  <div className="space-y-3">
                    {viewColis.historique &&
                      viewColis.historique.map((h, idx) => (
                        <div
                          key={h.id}
                          className="flex gap-3 items-start relative"
                        >
                          {idx < (viewColis.historique?.length ?? 0) - 1 && (
                            <div
                              className="absolute left-1 top-5 w-0.5 h-8 bg-gradient-to-b"
                              style={{
                                backgroundImage: `linear-gradient(to bottom, ${h.statuts?.couleur ?? "#6B7280"}, ${viewColis.historique?.[idx + 1]?.statuts?.couleur ?? "#6B7280"})`,
                              }}
                            />
                          )}
                          <div
                            className="w-3 h-3 rounded-full mt-1.5 shrink-0 ring-2 ring-white shadow-md"
                            style={{
                              backgroundColor: h.statuts?.couleur ?? "#6B7280",
                            }}
                          />
                          <div className="flex-1 min-w-0 bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-800 text-sm">
                                {h.statuts?.nom}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {format(
                                  new Date(h.created_at),
                                  "dd MMM yyyy HH:mm",
                                  { locale: fr },
                                )}
                              </span>
                            </div>
                            {h.commentaire && (
                              <p className="text-gray-600 text-sm mt-1.5 border-l-2 border-gray-300 pl-2.5 italic">
                                \"{h.commentaire}\"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!updateStatutTarget}
        onOpenChange={(open) => !open && setUpdateStatutTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader className="bg-gradient-to-r from-[#F97316] to-orange-500 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
            <DialogTitle className="flex items-center gap-2 text-white">
              <CheckCircle2 className="w-5 h-5" />
              Mettre à jour le statut
            </DialogTitle>
          </DialogHeader>

          {updateStatutTarget && (
            <div className="space-y-4 mt-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  Colis
                </p>
                <p className="font-mono font-bold text-[#0A1628] text-base">
                  {updateStatutTarget.tracking_interne}
                </p>
                <p className="text-gray-600 text-sm mt-1 font-semibold">
                  {updateStatutTarget.clients?.nom}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">
                  Nouveau statut
                </Label>
                <Select value={newStatutId} onValueChange={setNewStatutId}>
                  <SelectTrigger className="border border-gray-200 focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20">
                    <SelectValue placeholder="Choisir un statut..." />
                  </SelectTrigger>
                  <SelectContent>
                    {statuts.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: s.couleur }}
                          />
                          {s.nom}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">
                  Commentaire (optionnel)
                </Label>
                <Textarea
                  placeholder="Ex: Colis chargé sur vol CA978, départ 14h..."
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={3}
                  className="resize-none border border-gray-200 focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setUpdateStatutTarget(null)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleUpdateStatut}
                  disabled={updatingStatut || !newStatutId}
                  className="flex-1 bg-gradient-to-r from-[#F97316] to-orange-500 hover:from-[#EA6A08] hover:to-orange-600 text-white font-semibold gap-2 shadow-lg shadow-orange-500/20"
                >
                  {updatingStatut ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    "Confirmer"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editColis}
        onOpenChange={(open) => !open && setEditColis(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {editColis && (
            <NouveauColisPage
              editColis={editColis}
              onSuccess={() => {
                setEditColis(null);
                loadColis();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce colis ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le colis et tout son historique
              seront définitivement supprimés.
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
