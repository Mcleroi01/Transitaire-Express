import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  User,
  Shield,
  Mail,
  Phone,
  Edit,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ProfilePage() {
  const { profile: currentUser, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        nom: currentUser.nom,
        telephone: currentUser.telephone,
      });
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nom: formData.nom,
          telephone: formData.telephone,
        })
        .eq("id", currentUser.id);

      if (error) throw error;

      toast.success("Profil mis à jour avec succès");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setPasswordLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) throw updateError;

      toast.success("Mot de passe mis à jour avec succès");
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Erreur lors de la mise à jour du mot de passe");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Utilisateur non trouvé
          </h3>
          <p className="text-gray-600">
            Veuillez vous connecter pour accéder à votre profil
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6">
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              {currentUser.role === "admin" ? (
                <Shield className="w-8 h-8 text-white" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="font-bold text-3xl text-white">Mon Profil</h1>
              <p className="text-blue-100 text-sm mt-1">
                {currentUser.role === "admin"
                  ? "Administrateur"
                  : "Agent de Suivi"}
              </p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 text-base px-4 py-2">
            {currentUser.role === "admin" ? "Admin" : "Agent"}
          </Badge>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 px-6 md:px-8 py-5 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">
                  Informations Personnelles
                </h2>
                <p className="text-blue-100 text-xs mt-0.5">
                  Vos données de profil
                </p>
              </div>
            </div>
            {!editMode ? (
              <Button
                onClick={() => setEditMode(true)}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            ) : (
              <Button
                onClick={() => setEditMode(false)}
                size="sm"
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10"
              >
                Annuler
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8">
          {!editMode ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nom complet
                  </Label>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-900 font-medium">
                      {formData.nom}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Téléphone
                  </Label>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-900 font-medium">
                      {formData.telephone || "Non renseigné"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rôle
                  </Label>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <Badge
                      className={
                        currentUser.role === "admin"
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : "bg-gray-100 text-gray-800 border border-gray-300"
                      }
                    >
                      {currentUser.role === "admin"
                        ? "Administrateur"
                        : "Agent"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </Label>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-900 font-medium truncate">
                      {currentUser.email || "Non disponible"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="nom"
                    className="text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Nom complet *
                  </Label>
                  <Input
                    id="nom"
                    type="text"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nom: e.target.value,
                      }))
                    }
                    className="border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 bg-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="telephone"
                    className="text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Téléphone
                  </Label>
                  <Input
                    id="telephone"
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        telephone: e.target.value,
                      }))
                    }
                    placeholder="+243 XXX XXX XXX"
                    className="border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditMode(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20"
                >
                  {loading ? "Mise à jour..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-orange-400 to-orange-600 px-6 md:px-8 py-5 border-b border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Sécurité</h2>
              <p className="text-orange-100 text-xs mt-0.5">
                Gérez votre mot de passe
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Key className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Mot de passe
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Protégez votre compte avec un mot de passe sécurisé
                  </p>
                </div>
              </div>
              <Dialog
                open={showPasswordDialog}
                onOpenChange={setShowPasswordDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Changer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader className="bg-gradient-to-r from-orange-400 to-orange-600 -mx-6 -mt-6 px-6 py-5 rounded-t-lg">
                    <DialogTitle className="flex items-center gap-2 text-white text-lg">
                      <Key className="w-5 h-5" />
                      Changer le mot de passe
                    </DialogTitle>
                    <DialogDescription className="text-orange-100 mt-2">
                      Créez un nouveau mot de passe sécurisé pour votre compte
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={handleChangePassword}
                    className="space-y-5 px-6 pt-6"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="currentPassword"
                        className="text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        Mot de passe actuel *
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 pr-10 bg-white"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="newPassword"
                        className="text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        Nouveau mot de passe *
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          className="border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 pr-10 bg-white"
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Minimum 6 caractères
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        Confirmer le mot de passe *
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className="border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 pr-10 bg-white"
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <DialogFooter className="gap-2 mt-6 border-t border-gray-200 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPasswordDialog(false)}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={passwordLoading}
                        className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-semibold shadow-lg shadow-orange-500/20"
                      >
                        {passwordLoading
                          ? "Mise à jour..."
                          : "Changer le mot de passe"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-red-400 to-red-600 px-6 md:px-8 py-5 border-b border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">
                Actions du Compte
              </h2>
              <p className="text-red-100 text-xs mt-0.5">Gérez votre session</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="space-y-4">
            <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-red-300 transition-colors">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-semibold shadow-lg shadow-red-500/20">
                    <Shield className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-lg">
                      <Shield className="w-5 h-5 text-red-600" />
                      Confirmer la déconnexion
                    </AlertDialogTitle>
                    <AlertDialogDescription className="mt-3">
                      Êtes-vous sûr de vouloir vous déconnecter de votre compte
                      ? Vous devrez vous reconnecter pour accéder à votre
                      profil.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2 mt-6">
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => signOut()}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Se déconnecter
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
