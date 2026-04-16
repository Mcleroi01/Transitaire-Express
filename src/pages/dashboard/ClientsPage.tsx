import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Client } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Users, Plus, Search, Pencil, Trash2, Phone, MapPin, User
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type ClientForm = {
  nom: string;
  telephone: string;
  ville: string;
};

const emptyForm: ClientForm = { nom: '', telephone: '', ville: '' };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filtered, setFiltered] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('nom', { ascending: true });
    setClients((data ?? []) as Client[]);
    setFiltered((data ?? []) as Client[]);
    setLoading(false);
  };

  useEffect(() => { loadClients(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(clients.filter(
      (c) => c.nom.toLowerCase().includes(q) || c.telephone.includes(q) || c.ville.toLowerCase().includes(q)
    ));
  }, [search, clients]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditTarget(client);
    setForm({ nom: client.nom, telephone: client.telephone, ville: client.ville });
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) { setError('Le nom est obligatoire.'); return; }
    setSaving(true);
    setError('');

    if (editTarget) {
      const { error } = await supabase
        .from('clients')
        .update({ nom: form.nom.trim(), telephone: form.telephone.trim(), ville: form.ville.trim() } as never)
        .eq('id', editTarget.id);
      if (error) { setError('Erreur lors de la mise à jour.'); setSaving(false); return; }
    } else {
      const { error } = await supabase
        .from('clients')
        .insert({ nom: form.nom.trim(), telephone: form.telephone.trim(), ville: form.ville.trim() } as never);
      if (error) { setError('Erreur lors de la création.'); setSaving(false); return; }
    }

    await loadClients();
    setDialogOpen(false);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('clients').delete().eq('id', deleteId);
    setDeleteId(null);
    await loadClients();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Clients</h3>
            <p className="text-gray-500 text-xs">{filtered.length} client(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button onClick={openCreate} className="bg-[#F97316] hover:bg-[#EA6A08] text-white h-9 gap-1.5 shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-32 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-24 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-20" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucun client trouvé</p>
          {search && <p className="text-gray-400 text-sm mt-1">Essayez un autre terme de recherche</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div key={client.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-[#0A1628] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  {client.nom.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(client)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#F97316] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(client.id)}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="font-semibold text-gray-800 mb-2">{client.nom}</h4>

              <div className="space-y-1.5">
                {client.telephone && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {client.telephone}
                  </div>
                )}
                {client.ville && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {client.ville}
                  </div>
                )}
              </div>

              <p className="text-gray-400 text-xs mt-3">
                Inscrit le {format(new Date(client.created_at), 'dd MMM yyyy', { locale: fr })}
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#F97316]" />
              {editTarget ? 'Modifier le client' : 'Nouveau client'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="nom">Nom complet *</Label>
              <Input
                id="nom"
                placeholder="Jean Mukendi"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tel">Téléphone</Label>
              <Input
                id="tel"
                placeholder="+243 81 234 5678"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ville">Ville</Label>
              <Input
                id="ville"
                placeholder="Kinshasa"
                value={form.ville}
                onChange={(e) => setForm({ ...form, ville: e.target.value })}
              />
            </div>
            <DialogFooter className="gap-2 mt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving} className="bg-[#F97316] hover:bg-[#EA6A08] text-white">
                {saving ? 'Enregistrement...' : editTarget ? 'Mettre à jour' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le client sera supprimé mais ses colis seront conservés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
