import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Users, TrendingUp, Clock, ArrowRight, CircleCheck as CheckCircle2 } from 'lucide-react';
import type { ColisWithRelations } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Stats = {
  totalColis: number;
  totalClients: number;
  colisEnRoute: number;
  colisLivres: number;
};

type Props = {
  onNavigate: (page: 'colis' | 'clients' | 'overview' | 'nouveau-colis') => void;
};

export default function OverviewPage({ onNavigate }: Props) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [stats, setStats] = useState<Stats>({ totalColis: 0, totalClients: 0, colisEnRoute: 0, colisLivres: 0 });
  const [recentColis, setRecentColis] = useState<ColisWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [colisRes, clientsRes, enRouteRes, livresRes, recentRes] = await Promise.all([
        supabase.from('colis').select('id', { count: 'exact', head: true }),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('colis').select('id', { count: 'exact', head: true })
          .in('statut_id', [3, 4]),
        supabase.from('colis').select('id', { count: 'exact', head: true })
          .eq('statut_id', 7),
        supabase.from('colis')
          .select('*, clients(*), statuts(*), categories_colis(*)')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalColis: colisRes.count ?? 0,
        totalClients: clientsRes.count ?? 0,
        colisEnRoute: enRouteRes.count ?? 0,
        colisLivres: livresRes.count ?? 0,
      });
      setRecentColis((recentRes.data ?? []) as ColisWithRelations[]);
      setLoading(false);
    };
    loadData();
  }, []);

  const statCards = isAdmin ? [
    {
      label: 'Total colis',
      value: stats.totalColis,
      icon: Package,
      color: 'bg-blue-500',
      light: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Clients enregistrés',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-[#F97316]',
      light: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'En transit',
      value: stats.colisEnRoute,
      icon: TrendingUp,
      color: 'bg-cyan-500',
      light: 'bg-cyan-50 text-cyan-600',
    },
    {
      label: 'Livrés',
      value: stats.colisLivres,
      icon: CheckCircle2,
      color: 'bg-green-500',
      light: 'bg-green-50 text-green-600',
    },
  ] : [
    {
      label: 'Total colis',
      value: stats.totalColis,
      icon: Package,
      color: 'bg-blue-500',
      light: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'En transit',
      value: stats.colisEnRoute,
      icon: TrendingUp,
      color: 'bg-cyan-500',
      light: 'bg-cyan-50 text-cyan-600',
    },
    {
      label: 'Livrés',
      value: stats.colisLivres,
      icon: CheckCircle2,
      color: 'bg-green-500',
      light: 'bg-green-50 text-green-600',
    },
  ];

  if (loading) {
    const cardCount = isAdmin ? 4 : 3;
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cardCount} gap-4 mb-8`}>
        {[...Array(cardCount)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-100 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${isAdmin ? 4 : 3} gap-4`}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.light}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value.toLocaleString()}</p>
              <p className="text-gray-500 text-sm mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F97316]" />
            <h3 className="font-semibold text-gray-800">Colis récents</h3>
          </div>
          <button
            onClick={() => onNavigate('colis')}
            className="text-[#F97316] text-sm font-medium hover:underline flex items-center gap-1"
          >
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentColis.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun colis enregistré pour l'instant</p>
            <button
              onClick={() => onNavigate('nouveau-colis')}
              className="mt-3 text-[#F97316] text-sm font-medium hover:underline"
            >
              Créer le premier colis
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/70">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Client</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Catégorie</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentColis.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-[#0A1628] text-xs">
                        {c.tracking_interne}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-gray-700">{c.clients?.nom}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-gray-600">{c.categories_colis?.nom ?? '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {c.statuts ? (
                        <span
                          className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: c.statuts.couleur }}
                        >
                          {c.statuts.nom}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-gray-500 text-xs">
                        {format(new Date(c.created_at), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
