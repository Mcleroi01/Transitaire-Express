import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  Package,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  CircleCheck as CheckCircle2,
  Plus,
} from "lucide-react";
import type { ColisWithRelations } from "@/lib/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Stats = {
  totalColis: number;
  totalClients: number;
  colisEnRoute: number;
  colisLivres: number;
};

type Props = {
  onNavigate: (
    page: "colis" | "clients" | "overview" | "nouveau-colis",
  ) => void;
};

export default function OverviewPage({ onNavigate }: Props) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [stats, setStats] = useState<Stats>({
    totalColis: 0,
    totalClients: 0,
    colisEnRoute: 0,
    colisLivres: 0,
  });
  const [recentColis, setRecentColis] = useState<ColisWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [colisRes, clientsRes, enRouteRes, livresRes, recentRes] =
        await Promise.all([
          supabase.from("colis").select("id", { count: "exact", head: true }),
          supabase.from("clients").select("id", { count: "exact", head: true }),
          supabase
            .from("colis")
            .select("id", { count: "exact", head: true })
            .in("statut_id", [3, 4]),
          supabase
            .from("colis")
            .select("id", { count: "exact", head: true })
            .eq("statut_id", 7),
          supabase
            .from("colis")
            .select("*, clients(*), statuts(*), categories_colis(*)")
            .order("created_at", { ascending: false })
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

  const statCards = isAdmin
    ? [
        {
          label: "Total colis",
          value: stats.totalColis,
          icon: Package,
          color: "bg-blue-500",
          light: "bg-blue-50 text-blue-600",
        },
        {
          label: "Clients enregistrés",
          value: stats.totalClients,
          icon: Users,
          color: "bg-[#F97316]",
          light: "bg-orange-50 text-orange-600",
        },
        {
          label: "En transit",
          value: stats.colisEnRoute,
          icon: TrendingUp,
          color: "bg-cyan-500",
          light: "bg-cyan-50 text-cyan-600",
        },
        {
          label: "Livrés",
          value: stats.colisLivres,
          icon: CheckCircle2,
          color: "bg-green-500",
          light: "bg-green-50 text-green-600",
        },
      ]
    : [
        {
          label: "Total colis",
          value: stats.totalColis,
          icon: Package,
          color: "bg-blue-500",
          light: "bg-blue-50 text-blue-600",
        },
        {
          label: "En transit",
          value: stats.colisEnRoute,
          icon: TrendingUp,
          color: "bg-cyan-500",
          light: "bg-cyan-50 text-cyan-600",
        },
        {
          label: "Livrés",
          value: stats.colisLivres,
          icon: CheckCircle2,
          color: "bg-green-500",
          light: "bg-green-50 text-green-600",
        },
      ];

  if (loading) {
    const cardCount = isAdmin ? 4 : 3;
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cardCount} gap-4 mb-8`}
      >
        {[...Array(cardCount)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse shadow-sm"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4" />
            <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-100 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${isAdmin ? 4 : 3} gap-4`}
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          const gradients: Record<string, string> = {
            "bg-blue-500": "from-blue-400 to-blue-600",
            "bg-[#F97316]": "from-orange-400 to-orange-600",
            "bg-cyan-500": "from-cyan-400 to-cyan-600",
            "bg-green-500": "from-emerald-400 to-emerald-600",
          };
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all bg-gradient-to-br ${gradients[card.color]}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {card.value.toLocaleString()}
              </p>
              <p className="text-gray-600 text-sm font-medium">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 px-6 py-4 border-b border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-white" />
              <h3 className="font-bold text-white text-lg">Colis Récents</h3>
            </div>
            <button
              onClick={() => onNavigate("colis")}
              className="text-blue-100 hover:text-white text-sm font-medium hover:underline flex items-center gap-1 transition-colors"
            >
              Voir tout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {recentColis.length === 0 ? (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-16 text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
              <Package className="w-7 h-7 text-blue-400" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">
              Aucun colis enregistré
            </p>
            <p className="text-gray-600 text-sm mt-1 mb-4">
              Commencez par créer votre premier colis
            </p>
            <button
              onClick={() => onNavigate("nouveau-colis")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Créer le premier colis
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Tracking
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                    Client
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    Catégorie
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentColis.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-blue-600 text-xs px-2.5 py-1 bg-blue-50 rounded-lg">
                        {c.tracking_interne}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-gray-800 font-medium">
                        {c.clients?.nom}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-gray-700">
                        {c.categories_colis?.nom ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {c.statuts ? (
                        <span
                          className="inline-flex px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                          style={{ backgroundColor: c.statuts.couleur }}
                        >
                          {c.statuts.nom}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-gray-600 text-xs font-medium">
                        {format(new Date(c.created_at), "dd MMM yyyy", {
                          locale: fr,
                        })}
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
