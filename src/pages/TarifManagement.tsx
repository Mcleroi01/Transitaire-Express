import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Scale,
  Package,
  Calculator,
} from "lucide-react";
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-[#F97316]" />
            Gestion des Tarifs
          </h1>
          <p className="text-gray-600 mt-1">
            Définissez et gérez les tarifs par catégorie de colis
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#F97316] hover:bg-[#F97316]/90">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Tarif
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Créer un nouveau tarif</DialogTitle>
              <DialogDescription>
                Ajoutez un tarif pour une catégorie de colis spécifique.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTarif}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="categorie">Catégorie *</Label>
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
                    <SelectTrigger>
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
                    <Label htmlFor="prix_kg">Prix par kg (USD) *</Label>
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
                      required
                    />
                  </div>
                )}

                {getSelectedCategory(createFormData.categorie_id)
                  ?.type_tarification === "piece" && (
                  <div className="grid gap-2">
                    <Label htmlFor="prix_piece">Prix par pièce (USD) *</Label>
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
                      required
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="devise">Devise *</Label>
                  <Select
                    value={createFormData.devise}
                    onValueChange={(value) =>
                      setCreateFormData((prev) => ({ ...prev, devise: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">
                        USD - Dollar Américain
                      </SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="CDF">CDF - Franc Congolais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? "Création..." : "Créer le tarif"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tarifs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Liste des Tarifs ({tarifs.length})
          </CardTitle>
          <CardDescription>
            Tarifs actuels par catégorie de colis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316] mx-auto"></div>
              <p className="text-gray-600 mt-2">Chargement des tarifs...</p>
            </div>
          ) : tarifs.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun tarif
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par créer un premier tarif
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-[#F97316] hover:bg-[#F97316]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer le premier tarif
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tarifs.map((tarif) => (
                <div
                  key={tarif.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      {tarif.categories_colis.type_tarification === "kg" ? (
                        <Scale className="w-5 h-5 text-white" />
                      ) : (
                        <Package className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {tarif.categories_colis.nom}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {tarif.categories_colis.type_tarification === "kg"
                            ? "Au kg"
                            : "À la pièce"}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {tarif.devise}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">
                          {tarif.categories_colis.type_tarification === "kg"
                            ? formatPrice(tarif.prix_par_kg, tarif.devise)
                            : formatPrice(tarif.prix_par_piece, tarif.devise)}
                        </span>
                        <span className="text-gray-400 ml-2">
                          {tarif.categories_colis.type_tarification === "kg"
                            ? "par kilogramme"
                            : "par pièce"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(tarif)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le tarif</DialogTitle>
            <DialogDescription>
              Mettez à jour le tarif pour {selectedTarif?.categories_colis?.nom}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTarif}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-categorie">Catégorie *</Label>
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
                  <SelectTrigger>
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
                  <Label htmlFor="edit-prix_kg">Prix par kg *</Label>
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
                    required
                  />
                </div>
              )}

              {getSelectedCategory(editFormData.categorie_id)
                ?.type_tarification === "piece" && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-prix_piece">Prix par pièce *</Label>
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
                    required
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="edit-devise">Devise *</Label>
                <Select
                  value={editFormData.devise}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({ ...prev, devise: value }))
                  }
                >
                  <SelectTrigger>
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
