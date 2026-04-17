import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DollarSign, Plus, Edit, Trash2, Scale, Package } from "lucide-react";
import type { Tarif, CategorieColis } from "@/lib/types";

interface TarifWithCategorie extends Tarif {
  categories_colis: CategorieColis;
}

interface CreateTarifData {
  categorie_id: string;
  prix_par_kg: number | null;
  prix_par_piece: number | null;
  devise: string;
}

export default function TarifManagement() {
  const { profile: currentUser } = useAuth();
  const [tarifs, setTarifs] = useState<TarifWithCategorie[]>([]);
  const [categories, setCategories] = useState<CategorieColis[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTarif, setSelectedTarif] = useState<TarifWithCategorie | null>(
    null,
  );
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [createFormData, setCreateFormData] = useState<CreateTarifData>({
    categorie_id: "",
    prix_par_kg: null,
    prix_par_piece: null,
    devise: "USD",
  });

  const [editFormData, setEditFormData] = useState<
    Omit<Tarif, "id" | "created_at">
  >({
    categorie_id: "",
    prix_par_kg: null,
    prix_par_piece: null,
    devise: "USD",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tarifsResponse, categoriesResponse] = await Promise.all([
        supabase
          .from("tarifs")
          .select("*, categories_colis(*)")
          .order("created_at", { ascending: false }),
        supabase.from("categories_colis").select("*").order("nom"),
      ]);

      if (tarifsResponse.error) throw tarifsResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      setTarifs(tarifsResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTarif = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const { error } = await supabase.from("tarifs").insert({
        categorie_id: createFormData.categorie_id,
        prix_par_kg: createFormData.prix_par_kg,
        prix_par_piece: createFormData.prix_par_piece,
        devise: createFormData.devise,
      });

      if (error) throw error;

      toast.success("Tarif créé avec succès");
      setCreateDialogOpen(false);
      setCreateFormData({
        categorie_id: "",
        prix_par_kg: null,
        prix_par_piece: null,
        devise: "USD",
      });
      fetchData();
    } catch (error: unknown) {
      console.error("Error creating tarif:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la création du tarif";
      toast.error(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditTarif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarif) return;

    setEditLoading(true);

    try {
      const { error } = await supabase
        .from("tarifs")
        .update({
          categorie_id: editFormData.categorie_id,
          prix_par_kg: editFormData.prix_par_kg,
          prix_par_piece: editFormData.prix_par_piece,
          devise: editFormData.devise,
        })
        .eq("id", selectedTarif.id);

      if (error) throw error;

      toast.success("Tarif mis à jour avec succès");
      setEditDialogOpen(false);
      setSelectedTarif(null);
      fetchData();
    } catch (error: unknown) {
      console.error("Error updating tarif:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du tarif";
      toast.error(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteTarif = async (tarifId: string) => {
    setDeleteLoading(true);

    try {
      const { error } = await supabase
        .from("tarifs")
        .delete()
        .eq("id", tarifId);

      if (error) throw error;

      toast.success("Tarif supprimé avec succès");
      fetchData();
    } catch (error: unknown) {
      console.error("Error deleting tarif:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression du tarif";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditDialog = (tarif: TarifWithCategorie) => {
    setSelectedTarif(tarif);
    setEditFormData({
      categorie_id: tarif.categorie_id,
      prix_par_kg: tarif.prix_par_kg,
      prix_par_piece: tarif.prix_par_piece,
      devise: tarif.devise,
    });
    setEditDialogOpen(true);
  };

  const getSelectedCategory = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  const formatPrice = (price: number | null, devise: string) => {
    if (price === null) return "-";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: devise,
    }).format(price);
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Accès Restreint
          </h3>
          <p className="text-gray-600">
            Seuls les administrateurs peuvent accéder à la gestion des tarifs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#0D2545] rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/40">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-white">
                Gestion des Tarifs
              </h1>
              <p className="text-green-200 text-sm">
                Définissez les tarifs par catégorie
              </p>
            </div>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-10 gap-2 font-semibold shadow-lg shadow-green-500/20 transition-all duration-200 shrink-0">
                <Plus className="w-5 h-5" />
                <span>Nouveau Tarif</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader className="bg-gradient-to-r from-green-500 to-emerald-600 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <Plus className="w-5 h-5" />
                  Créer un nouveau tarif
                </DialogTitle>
                <DialogDescription className="text-green-100 mt-1">
                  Ajoutez un tarif pour une catégorie de colis spécifique.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTarif}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="categorie"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Catégorie *
                    </Label>
                    <Select
                      value={createFormData.categorie_id}
                      onValueChange={(value) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          categorie_id: value,
                        }))
                      }
                      required
                    >
                      <SelectTrigger className="border border-gray-200 focus:border-green-500">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              {category.nom}
                              <Badge variant="outline" className="text-xs">
                                {category.type_tarification === "kg"
                                  ? "Au kg"
                                  : "À la pièce"}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {getSelectedCategory(createFormData.categorie_id)
                    ?.type_tarification === "kg" && (
                    <div className="grid gap-2">
                      <Label
                        htmlFor="prix_kg"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Prix par kg (USD) *
                      </Label>
                      <Input
                        id="prix_kg"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="12.00"
                        value={createFormData.prix_par_kg || ""}
                        onChange={(e) =>
                          setCreateFormData((prev) => ({
                            ...prev,
                            prix_par_kg: e.target.value
                              ? parseFloat(e.target.value)
                              : null,
                          }))
                        }
                        className="border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500/20"
                        required
                      />
                    </div>
                  )}

                  {getSelectedCategory(createFormData.categorie_id)
                    ?.type_tarification === "piece" && (
                    <div className="grid gap-2">
                      <Label
                        htmlFor="prix_piece"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Prix par pièce (USD) *
                      </Label>
                      <Input
                        id="prix_piece"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="5.00"
                        value={createFormData.prix_par_piece || ""}
                        onChange={(e) =>
                          setCreateFormData((prev) => ({
                            ...prev,
                            prix_par_piece: e.target.value
                              ? parseFloat(e.target.value)
                              : null,
                          }))
                        }
                        className="border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500/20"
                        required
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label
                      htmlFor="devise"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Devise *
                    </Label>
                    <Select
                      value={createFormData.devise}
                      onValueChange={(value) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          devise: value,
                        }))
                      }
                    >
                      <SelectTrigger className="border border-gray-200 focus:border-green-500">
                        <SelectValue placeholder="Sélectionner une devise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">
                          USD - Dollar Américain
                        </SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="CDF">
                          CDF - Franc Congolais
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="gap-2 mt-4 border-t border-gray-200 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={createLoading}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/20"
                  >
                    {createLoading ? "Création..." : "Créer le tarif"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tarifs List */}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Liste des tarifs{" "}
            <span className="text-green-500">({tarifs.length})</span>
          </h2>
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
        ) : tarifs.length === 0 ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 py-16 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">
              Aucun tarif trouvé
            </p>
            <p className="text-gray-600 text-sm mt-2 mb-4">
              Commencez par créer un premier tarif
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer le premier tarif
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tarifs.map((tarif) => (
              <div
                key={tarif.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-xl hover:border-green-200 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all ${
                      tarif.categories_colis.type_tarification === "kg"
                        ? "bg-gradient-to-br from-purple-400 to-purple-600"
                        : "bg-gradient-to-br from-green-400 to-emerald-600"
                    }`}
                  >
                    {tarif.categories_colis.type_tarification === "kg" ? (
                      <Scale className="w-5 h-5" />
                    ) : (
                      <Package className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditDialog(tarif)}
                      className="px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-all duration-150 flex items-center gap-1.5 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Éditer</span>
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-150 flex items-center gap-1.5 text-sm font-medium">
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Suppr.</span>
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Supprimer le tarif
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le tarif pour{" "}
                            {tarif.categories_colis.nom} ? Cette action est
                            irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTarif(tarif.id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteLoading}
                          >
                            {deleteLoading ? "Suppression..." : "Supprimer"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <h4 className="font-bold text-gray-900 mb-1 text-lg group-hover:text-green-600 transition-colors flex items-center gap-2">
                  {tarif.categories_colis.nom}
                  <Badge variant="outline" className="text-xs bg-gray-50">
                    {tarif.categories_colis.type_tarification === "kg"
                      ? "Au kg"
                      : "À la pièce"}
                  </Badge>
                </h4>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Tarif:</span>
                    <span className="font-bold text-lg text-green-600">
                      {tarif.categories_colis.type_tarification === "kg"
                        ? formatPrice(tarif.prix_par_kg, tarif.devise)
                        : formatPrice(tarif.prix_par_piece, tarif.devise)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Devise:</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 border-green-300"
                    >
                      {tarif.devise}
                    </Badge>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-gray-500 text-xs">
                    📅 Créé le{" "}
                    {format(new Date(tarif.created_at), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="bg-gradient-to-r from-green-500 to-emerald-600 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
            <DialogTitle className="flex items-center gap-2 text-white text-lg">
              <Edit className="w-5 h-5" />
              Modifier le tarif
            </DialogTitle>
            <DialogDescription className="text-green-100 mt-1">
              Mettez à jour le tarif pour {selectedTarif?.categories_colis?.nom}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTarif}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="edit-categorie"
                  className="text-sm font-semibold text-gray-700"
                >
                  Catégorie *
                </Label>
                <Select
                  value={editFormData.categorie_id}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      categorie_id: value,
                    }))
                  }
                  required
                >
                  <SelectTrigger className="border border-gray-200 focus:border-green-500">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          {category.nom}
                          <Badge variant="outline" className="text-xs">
                            {category.type_tarification === "kg"
                              ? "Au kg"
                              : "À la pièce"}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {getSelectedCategory(editFormData.categorie_id)
                ?.type_tarification === "kg" && (
                <div className="grid gap-2">
                  <Label
                    htmlFor="edit-prix_kg"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Prix par kg *
                  </Label>
                  <Input
                    id="edit-prix_kg"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="12.00"
                    value={editFormData.prix_par_kg || ""}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        prix_par_kg: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      }))
                    }
                    className="border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500/20"
                    required
                  />
                </div>
              )}

              {getSelectedCategory(editFormData.categorie_id)
                ?.type_tarification === "piece" && (
                <div className="grid gap-2">
                  <Label
                    htmlFor="edit-prix_piece"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Prix par pièce *
                  </Label>
                  <Input
                    id="edit-prix_piece"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="5.00"
                    value={editFormData.prix_par_piece || ""}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        prix_par_piece: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      }))
                    }
                    className="border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500/20"
                    required
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label
                  htmlFor="edit-devise"
                  className="text-sm font-semibold text-gray-700"
                >
                  Devise *
                </Label>
                <Select
                  value={editFormData.devise}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({ ...prev, devise: value }))
                  }
                >
                  <SelectTrigger className="border border-gray-200 focus:border-green-500">
                    <SelectValue placeholder="Sélectionner une devise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - Dollar Américain</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="CDF">CDF - Franc Congolais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 mt-4 border-t border-gray-200 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={editLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/20"
              >
                {editLoading ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
