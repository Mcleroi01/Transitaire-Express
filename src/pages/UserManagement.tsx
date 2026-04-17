import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { createUserWithoutSession } from "@/lib/createUser";
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
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  User,
  Phone,
} from "lucide-react";
import type { Profile } from "@/lib/types";

interface CreateUserData {
  email: string;
  password: string;
  nom: string;
  telephone: string;
  role: "admin" | "agent";
}

export default function UserManagement() {
  const { profile: currentUser } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [createFormData, setCreateFormData] = useState<CreateUserData>({
    email: "",
    password: "",
    nom: "",
    telephone: "",
    role: "agent",
  });

  const [editFormData, setEditFormData] = useState<
    Omit<Profile, "id" | "created_at">
  >({
    email: "",
    nom: "",
    telephone: "",
    role: "agent",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      // Créer l'utilisateur sans déconnecter l'admin
      await createUserWithoutSession({
        email: createFormData.email,
        password: createFormData.password,
        nom: createFormData.nom,
        telephone: createFormData.telephone,
        role: createFormData.role,
      });

      // Le profil sera créé automatiquement par le trigger
      toast.success("Utilisateur créé avec succès");
      setCreateDialogOpen(false);
      setCreateFormData({
        email: "",
        password: "",
        nom: "",
        telephone: "",
        role: "agent",
      });
      fetchUsers();
    } catch (error: unknown) {
      console.error("Error creating user:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'utilisateur";
      toast.error(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setEditLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nom: editFormData.nom,
          telephone: editFormData.telephone,
          role: editFormData.role,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast.success("Utilisateur mis à jour avec succès");
      setEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: unknown) {
      console.error("Error updating user:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de l'utilisateur";
      toast.error(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeleteLoading(true);

    try {
      // Supprimer l'utilisateur de Supabase Auth (cela supprimera aussi le profil grâce à ON DELETE CASCADE)
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      toast.success("Utilisateur supprimé avec succès");
      fetchUsers();
    } catch (error: unknown) {
      console.error("Error deleting user:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de l'utilisateur";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditDialog = (user: Profile) => {
    setSelectedUser(user);
    setEditFormData({
      email: user.email,
      nom: user.nom,
      telephone: user.telephone,
      role: user.role,
    });
    setEditDialogOpen(true);
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Accès Restreint
          </h3>
          <p className="text-gray-600">
            Seuls les administrateurs peuvent accéder à la gestion des
            utilisateurs.
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
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/40">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-white">
                Gestion des Utilisateurs
              </h1>
              <p className="text-orange-200 text-sm">
                Créez et gérez les comptes agents
              </p>
            </div>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#F97316] to-orange-500 hover:from-[#EA6A08] hover:to-orange-600 text-white h-10 gap-2 font-semibold shadow-lg shadow-orange-500/20 transition-all duration-200 shrink-0">
                <UserPlus className="w-5 h-5" />
                <span>Nouvel Agent</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader className="bg-gradient-to-r from-[#F97316] to-orange-500 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <UserPlus className="w-5 h-5" />
                  Créer un nouvel agent
                </DialogTitle>
                <DialogDescription className="text-orange-100 mt-1">
                  Ajoutez un nouvel agent au système. Un email et mot de passe
                  temporaires seront générés.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="agent@exemple.com"
                      value={createFormData.email}
                      onChange={(e) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Mot de passe temporaire *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mot de passe"
                      value={createFormData.password}
                      onChange={(e) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="nom"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Nom complet *
                    </Label>
                    <Input
                      id="nom"
                      placeholder="Nom de l'agent"
                      value={createFormData.nom}
                      onChange={(e) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          nom: e.target.value,
                        }))
                      }
                      className="border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="telephone"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Téléphone
                    </Label>
                    <Input
                      id="telephone"
                      placeholder="+243 XXX XXX XXX"
                      value={createFormData.telephone}
                      onChange={(e) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          telephone: e.target.value,
                        }))
                      }
                      className="border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="role"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Rôle *
                    </Label>
                    <Select
                      value={createFormData.role}
                      onValueChange={(value: "admin" | "agent") =>
                        setCreateFormData((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger className="border border-gray-200 focus:border-orange-400">
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
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
                    className="bg-gradient-to-r from-[#F97316] to-orange-500 hover:from-[#EA6A08] hover:to-orange-600 text-white font-semibold shadow-lg shadow-orange-500/20"
                  >
                    {createLoading ? "Création..." : "Créer l'agent"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Liste des utilisateurs{" "}
            <span className="text-orange-500">({users.length})</span>
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
        ) : users.length === 0 ? (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 py-16 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">
              Aucun utilisateur trouvé
            </p>
            <p className="text-gray-600 text-sm mt-2 mb-4">
              Commencez par créer un nouvel agent
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-[#F97316] to-orange-500 hover:from-[#EA6A08] hover:to-orange-600 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Créer le premier agent
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all ${
                      user.role === "admin"
                        ? "bg-gradient-to-br from-[#F97316] to-orange-600"
                        : "bg-gradient-to-br from-blue-400 to-blue-600"
                    }`}
                  >
                    {user.role === "admin" ? (
                      <Shield className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditDialog(user)}
                      className="px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-150 flex items-center gap-1.5 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Éditer</span>
                    </button>
                    {user.id !== currentUser?.id && (
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
                              Supprimer l'utilisateur
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer {user.nom} ?
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteLoading}
                            >
                              {deleteLoading ? "Suppression..." : "Supprimer"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-gray-900 mb-1 text-lg group-hover:text-orange-600 transition-colors flex items-center gap-2">
                  {user.nom}
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                    className={
                      user.role === "admin"
                        ? "bg-orange-100 text-orange-800 border-orange-300"
                        : "bg-blue-100 text-blue-800 border-blue-300"
                    }
                  >
                    {user.role === "admin" ? "Admin" : "Agent"}
                  </Badge>
                  {user.id === currentUser?.id && (
                    <Badge variant="outline" className="text-xs bg-gray-50">
                      Vous
                    </Badge>
                  )}
                </h4>

                <div className="space-y-2.5 mb-4">
                  {user.telephone && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">
                        {user.telephone}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-gray-500 text-xs">
                    📅{" "}
                    {format(new Date(user.created_at), "dd MMM yyyy", {
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
          <DialogHeader className="bg-gradient-to-r from-blue-400 to-blue-600 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
            <DialogTitle className="flex items-center gap-2 text-white text-lg">
              <Edit className="w-5 h-5" />
              Modifier l'utilisateur
            </DialogTitle>
            <DialogDescription className="text-blue-100 mt-1">
              Mettez à jour les informations de {selectedUser?.nom}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="edit-nom"
                  className="text-sm font-semibold text-gray-700"
                >
                  Nom complet *
                </Label>
                <Input
                  id="edit-nom"
                  value={editFormData.nom}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      nom: e.target.value,
                    }))
                  }
                  className="border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="edit-telephone"
                  className="text-sm font-semibold text-gray-700"
                >
                  Téléphone
                </Label>
                <Input
                  id="edit-telephone"
                  placeholder="+243 XXX XXX XXX"
                  value={editFormData.telephone}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      telephone: e.target.value,
                    }))
                  }
                  className="border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="edit-role"
                  className="text-sm font-semibold text-gray-700"
                >
                  Rôle *
                </Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value: "admin" | "agent") =>
                    setEditFormData((prev) => ({ ...prev, role: value }))
                  }
                  disabled={selectedUser?.id === currentUser?.id}
                >
                  <SelectTrigger className="border border-gray-200 focus:border-blue-400">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
                {selectedUser?.id === currentUser?.id && (
                  <p className="text-xs text-gray-500">
                    Vous ne pouvez pas modifier votre propre rôle
                  </p>
                )}
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
                className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20"
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
