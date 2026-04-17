import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { ColisWithRelations, HistoriqueStatut, Statut } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Package,
  Truck,
  MapPin,
  CircleCheck as CheckCircle2,
  Clock,
  ChevronRight,
  CircleAlert as AlertCircle,
  Calendar,
  Weight,
  Hash,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type TrackingData = {
  colis: ColisWithRelations;
  historique: (HistoriqueStatut & { statuts: Statut })[];
};

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Mise à jour des horloges
  useEffect(() => {
    const updateClocks = () => {
      // Guangzhou (UTC+8)
      const guangzhouTime = new Date().toLocaleString("fr-FR", {
        timeZone: "Asia/Shanghai",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Kinshasa (UTC+2)
      const kinshasaTime = new Date().toLocaleString("fr-FR", {
        timeZone: "Africa/Kinshasa",
        hour: "2-digit",
        minute: "2-digit",
      });

      const guangzhouEl = document.getElementById("time-guangzhou");
      const kinshasaEl = document.getElementById("time-kinshasa");

      if (guangzhouEl) guangzhouEl.textContent = guangzhouTime;
      if (kinshasaEl) kinshasaEl.textContent = kinshasaTime;
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);

    const query = trackingNumber.trim().toUpperCase();

    const { data: colisRaw, error: colisError } = await supabase
      .from("colis")
      .select(
        `
        *,
        clients(*),
        statuts(*),
        categories_colis(*)
      `,
      )
      .or(`tracking_interne.eq.${query},tracking_fournisseur.eq.${query}`)
      .maybeSingle();

    const colis = colisRaw as ColisWithRelations | null;

    if (colisError || !colis) {
      setResult(null);
      setError(
        "Aucun colis trouvé avec ce numéro de suivi. Vérifiez le numéro et réessayez.",
      );
      setLoading(false);
      return;
    }

    const { data: historique } = await supabase
      .from("historique_statuts")
      .select(`*, statuts(*)`)
      .eq("colis_id", colis.id)
      .order("created_at", { ascending: true });

    setResult({
      colis: colis as ColisWithRelations,
      historique: (historique || []) as (HistoriqueStatut & {
        statuts: Statut;
      })[],
    });
    setLoading(false);
  };

  const allStatuts = [
    { nom: "Reçu en Chine", ordre: 1 },
    { nom: "En préparation", ordre: 2 },
    { nom: "Expédié", ordre: 3 },
    { nom: "En transit", ordre: 4 },
    { nom: "Arrivé à Kinshasa", ordre: 5 },
    { nom: "Disponible", ordre: 6 },
    { nom: "Livré", ordre: 7 },
  ];

  const currentOrdre = result?.colis.statuts?.ordre ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-[#0A1628]/95 via-[#0D2545]/95 to-[#051033]/95 border-b border-[#F97316]/20 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          {/* Logo et titre */}
          <a href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-11 h-11 bg-gradient-to-br from-[#F97316] to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/50 group-hover:shadow-orange-500/80 transition-all duration-300 group-hover:scale-110 transform">
              <Truck className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </div>
            <div className="group-hover:translate-x-1 transition-transform duration-300">
              <h1 className="text-white font-bold text-lg leading-tight">
                Transitaire Express
              </h1>
              <p className="text-blue-300 text-xs font-medium">
                Chine → Kinshasa (RDC)
              </p>
            </div>
          </a>

          {/* Horloges - Heures actuelles */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <Clock className="w-4 h-4 text-[#F97316]" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-blue-300 font-semibold">
                  Guangzhou
                </span>
                <span
                  className="text-sm text-white font-mono font-bold"
                  id="time-guangzhou"
                >
                  --:--
                </span>
              </div>
            </div>
            <div className="w-0.5 h-8 bg-gradient-to-b from-transparent via-[#F97316]/50 to-transparent"></div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <Clock className="w-4 h-4 text-blue-400" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-blue-300 font-semibold">
                  Kinshasa
                </span>
                <span
                  className="text-sm text-white font-mono font-bold"
                  id="time-kinshasa"
                >
                  --:--
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de progression subtile en bas */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F97316]/50 to-transparent"></div>
      </header>

      <section className="relative py-24 px-4 overflow-hidden">
        {/* Arrière-plan avec image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628]/95 via-[#0D2545]/90 to-[#051033]/95"></div>
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            preserveAspectRatio="none"
            viewBox="0 0 1200 600"
          >
            <defs>
              <pattern
                id="dots"
                x="40"
                y="40"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="40" cy="40" r="2" fill="#F97316" opacity="0.4" />
              </pattern>
              <pattern
                id="grid"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 100 0 L 0 0 0 100"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="0.5"
                  opacity="0.1"
                />
              </pattern>
            </defs>
            <rect width="1200" height="600" fill="url(#grid)" />
            <rect width="1200" height="600" fill="url(#dots)" />
            {/* Éléments de camion stylisés */}
            <g opacity="0.15">
              <rect
                x="100"
                y="80"
                width="200"
                height="120"
                rx="10"
                fill="#F97316"
              />
              <circle cx="140" cy="220" r="20" fill="#F97316" />
              <circle cx="260" cy="220" r="20" fill="#F97316" />
              <rect
                x="320"
                y="100"
                width="80"
                height="100"
                rx="5"
                fill="#F97316"
              />
            </g>
            <g opacity="0.1">
              <path
                d="M 900 150 Q 950 100 1000 150 T 1100 150"
                stroke="#F97316"
                strokeWidth="3"
                fill="none"
              />
              <circle cx="920" cy="350" r="60" fill="#F97316" />
              <circle cx="1050" cy="320" r="45" fill="#F97316" />
            </g>
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge animé */}
          <div className="inline-flex items-center gap-2 bg-[#F97316]/20 text-[#F97316] text-sm font-semibold px-5 py-2 rounded-full mb-6 border border-[#F97316]/30 backdrop-blur-sm hover:bg-[#F97316]/30 transition-all duration-300 animate-pulse">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F97316]"></span>
            </div>
            Suivi de colis en temps réel
          </div>

          {/* Titre principal */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Où est votre{" "}
            <span className="bg-gradient-to-r from-[#F97316] to-orange-400 bg-clip-text text-transparent">
              colis
            </span>{" "}
            ?
          </h2>

          {/* Description */}
          <p className="text-blue-200 mb-10 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Entrez votre numéro de suivi et suivez votre livraison de la Chine
            jusqu'à Kinshasa en temps réel
          </p>

          {/* Formulaire amélioré */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <div className="flex-1 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#F97316] to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative flex items-center bg-white/95 backdrop-blur-sm rounded-2xl">
                <Search className="absolute left-5 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="TE-2024-1001 ou numéro fournisseur"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="pl-14 pr-4 h-14 text-base border-0 bg-transparent focus:outline-none focus:ring-0"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#F97316] to-orange-400 hover:from-[#EA6A08] hover:to-orange-500 text-white h-14 px-8 rounded-2xl shadow-xl shadow-orange-500/40 font-bold whitespace-nowrap transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/60 transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Recherche...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Rechercher</span>
                  <ChevronRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          {/* Informations utiles */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-center gap-2 text-blue-300 backdrop-blur-sm bg-white/5 px-4 py-3 rounded-xl border border-white/10">
              <Truck className="w-4 h-4 text-[#F97316]" />
              <span>Chine → Kinshasa</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-blue-300 backdrop-blur-sm bg-white/5 px-4 py-3 rounded-xl border border-white/10">
              <Clock className="w-4 h-4 text-[#F97316]" />
              <span>Mises à jour temps réel</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-blue-300 backdrop-blur-sm bg-white/5 px-4 py-3 rounded-xl border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-[#F97316]" />
              <span>Livraison sécurisée</span>
            </div>
          </div>
        </div>
      </section>

      <main className="bg-gray-50">
        {/* Section Résultats de recherche */}
        <div className="max-w-4xl mx-auto px-4 py-10">
          {error && searched && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800 mb-1">
                  Colis introuvable
                </h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header avec gradient */}
                <div className="bg-gradient-to-r from-[#0A1628] to-[#0D2545] px-6 py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                          <Hash className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[#F97316] font-mono font-bold text-xl">
                          {result.colis.tracking_interne}
                        </span>
                      </div>
                      {result.colis.tracking_fournisseur && (
                        <p className="text-blue-200 text-sm ml-13">
                          Réf. fournisseur:{" "}
                          <span className="font-mono font-semibold">
                            {result.colis.tracking_fournisseur}
                          </span>
                        </p>
                      )}
                    </div>
                    {result.colis.statuts && (
                      <span
                        className="px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg whitespace-nowrap"
                        style={{
                          backgroundColor: result.colis.statuts.couleur,
                        }}
                      >
                        {result.colis.statuts.nom}
                      </span>
                    )}
                  </div>
                </div>

                {/* Grille d'informations - Améliorée */}
                <div className="px-6 py-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 border-b border-gray-100 bg-gray-50/30">
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      Client
                    </p>
                    <p className="font-bold text-gray-900 text-sm">
                      {result.colis.clients?.nom}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      Catégorie
                    </p>
                    <p className="font-bold text-gray-900 text-sm">
                      {result.colis.categories_colis?.nom ?? "—"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Weight className="w-3 h-3" /> Poids / Qté
                    </p>
                    <p className="font-bold text-gray-900 text-sm">
                      {result.colis.poids
                        ? `${result.colis.poids} kg`
                        : result.colis.quantite
                          ? `${result.colis.quantite} pcs`
                          : "—"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      Entrepôt
                    </p>
                    <p className="font-bold text-gray-900 text-sm">
                      {result.colis.entrepot_actuel || "—"}
                    </p>
                  </div>
                  <div className="space-y-1.5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                    <p className="text-xs text-green-700 font-bold uppercase tracking-wider">
                      Prix à Payer
                    </p>
                    <p className="font-bold text-green-900 text-lg">
                      {result.colis.prix_total
                        ? `${new Intl.NumberFormat("fr-FR", { style: "currency", currency: result.colis.devise || "USD" }).format(result.colis.prix_total)}`
                        : "—"}
                    </p>
                    {result.colis.devise && (
                      <span className="text-xs text-green-600 font-medium">
                        {result.colis.devise}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dates importantes */}
                {(result.colis.date_reception_chine ||
                  result.colis.date_arrivee_kinshasa) && (
                  <div className="px-6 py-4 flex flex-wrap gap-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                    {result.colis.date_reception_chine && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-[#F97316]" />
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs font-semibold">
                            Réception Chine
                          </p>
                          <span className="font-bold text-gray-900">
                            {format(
                              new Date(result.colis.date_reception_chine),
                              "dd MMM yyyy",
                              { locale: fr },
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                    {result.colis.date_arrivee_kinshasa && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs font-semibold">
                            Arrivée Kinshasa
                          </p>
                          <span className="font-bold text-gray-900">
                            {format(
                              new Date(result.colis.date_arrivee_kinshasa),
                              "dd MMM yyyy",
                              { locale: fr },
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline - Progression du colis */}
                <div className="px-6 py-8">
                  <h3 className="font-bold text-gray-900 mb-8 text-sm uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#F97316] to-blue-500 rounded-full"></div>
                    Progression du colis
                  </h3>
                  <div className="relative">
                    {allStatuts.map((s, idx) => {
                      const isDone = s.ordre <= currentOrdre;
                      const isCurrent = s.ordre === currentOrdre;
                      const isLast = idx === allStatuts.length - 1;

                      return (
                        <div key={s.nom} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 shrink-0 font-bold text-sm ${
                                isCurrent
                                  ? "bg-gradient-to-br from-[#F97316] to-orange-600 text-white shadow-lg shadow-orange-300 scale-110 ring-4 ring-orange-100"
                                  : isDone
                                    ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                                    : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              {idx + 1}
                            </div>
                            {!isLast && (
                              <div
                                className={`w-1 h-12 mt-2 ${isDone ? "bg-gradient-to-b from-blue-500 to-blue-400" : "bg-gray-200"}`}
                              />
                            )}
                          </div>
                          <div
                            className={`pb-8 ${isLast ? "pb-0" : ""} pt-1.5`}
                          >
                            <p
                              className={`font-bold text-sm ${
                                isCurrent
                                  ? "text-[#F97316]"
                                  : isDone
                                    ? "text-gray-800"
                                    : "text-gray-400"
                              }`}
                            >
                              {s.nom}
                              {isCurrent && (
                                <span className="ml-3 inline-flex bg-[#F97316] text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                                  ● En cours
                                </span>
                              )}
                            </p>
                            {isCurrent &&
                              result.historique.length > 0 &&
                              (() => {
                                const lastHistorique = result.historique
                                  .filter((h) => h.statuts?.nom === s.nom)
                                  .at(-1);
                                return lastHistorique ? (
                                  <p className="text-xs text-gray-600 mt-2 font-medium">
                                    <span className="text-blue-600 font-bold">
                                      {format(
                                        new Date(lastHistorique.created_at),
                                        "dd MMM yyyy 'à' HH:mm",
                                        { locale: fr },
                                      )}
                                    </span>
                                    {lastHistorique.commentaire && (
                                      <span className="block mt-1 text-gray-600 italic">
                                        💬 {lastHistorique.commentaire}
                                      </span>
                                    )}
                                  </p>
                                ) : null;
                              })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Historique des mises à jour */}
              {result.historique.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Historique des mises à jour ({result.historique.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {[...result.historique].reverse().map((h) => (
                      <div
                        key={h.id}
                        className="px-6 py-4 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex gap-4">
                          <div
                            className="w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-sm border-2 border-white"
                            style={{
                              backgroundColor: h.statuts?.couleur ?? "#6B7280",
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-sm">
                                {h.statuts?.nom}
                              </span>
                              <span className="text-gray-500 text-xs font-medium bg-gray-100 px-2 py-1 rounded">
                                {format(
                                  new Date(h.created_at),
                                  "dd MMM yyyy 'à' HH:mm",
                                  { locale: fr },
                                )}
                              </span>
                            </div>
                            {h.commentaire && (
                              <p
                                className="text-gray-700 text-sm mt-2 bg-gray-50 px-3 py-2 rounded-lg border-l-2"
                                style={{ borderColor: h.statuts?.couleur }}
                              >
                                💬 {h.commentaire}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!searched && (
            <>
              {/* Cartes d'avantages */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                {[
                  {
                    icon: <Package className="w-10 h-10 text-[#F97316]" />,
                    title: "Suivi en temps réel",
                    desc: "Suivez votre colis à chaque étape du trajet",
                    color: "from-orange-50 to-white",
                    borderColor: "border-orange-200",
                    accentColor: "[#F97316]",
                  },
                  {
                    icon: <MapPin className="w-10 h-10 text-blue-500" />,
                    title: "Chine → Kinshasa",
                    desc: "Service de fret direct depuis la Chine vers la RDC",
                    color: "from-blue-50 to-white",
                    borderColor: "border-blue-200",
                    accentColor: "blue-500",
                  },
                  {
                    icon: <CheckCircle2 className="w-10 h-10 text-green-500" />,
                    title: "Livraison assurée",
                    desc: "Vos marchandises livrées en toute sécurité",
                    color: "from-green-50 to-white",
                    borderColor: "border-green-200",
                    accentColor: "green-500",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`group relative rounded-2xl border-2 ${item.borderColor} bg-gradient-to-br ${item.color} p-7 shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden`}
                  >
                    {/* Fond animé en arrière-plan */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Ligne de soulignement animée */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-1 bg-${item.accentColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
                    ></div>

                    {/* Contenu */}
                    <div className="relative z-10 space-y-4">
                      {/* Icône avec animation */}
                      <div
                        className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}
                      >
                        <div className="transform group-hover:scale-125 transition-transform duration-500">
                          {item.icon}
                        </div>
                      </div>

                      {/* Titre */}
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#F97316] transition-colors duration-300">
                          {item.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                        {item.desc}
                      </p>

                      {/* Lien caché qui apparaît au hover */}
                      <div className="pt-2 flex items-center gap-2 text-[#F97316] font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span>En savoir plus</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>

                    {/* Point d'accent dans le coin */}
                    <div
                      className={`absolute top-4 right-4 w-2 h-2 bg-${item.accentColor} rounded-full opacity-30 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500`}
                    ></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Section Tarifs */}
        <section className="bg-white border-t border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Nos tarifs compétitifs
              </h2>
              <p className="text-gray-600 text-lg">
                Tarification transparente selon la catégorie de marchandises
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  nom: "Téléphone/Tablette",
                  icon: "📱",
                  calcul: "Par pièce × 15$",
                  prix: "$15",
                  unite: "par pièce",
                  desc: "Tarif standard pour les appareils électroniques mobiles",
                  features: [
                    "Suivi en temps réel",
                    "Assurance complète",
                    "Emballage renforcé",
                    "Livraison rapide",
                  ],
                  color: "border-blue-300",
                  bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
                  accentBg: "bg-blue-500",
                },
                {
                  nom: "Normal",
                  icon: "📦",
                  calcul: "Poids × 18$",
                  prix: "$18",
                  unite: "par kg",
                  desc: "Tarif standard pour marchandises générales",
                  features: [
                    "Suivi en temps réel",
                    "Assurance incluse",
                    "Emballage adapté",
                    "Support disponible",
                  ],
                  color: "border-green-300",
                  bg: "bg-gradient-to-br from-green-50 to-green-100/50",
                  accentBg: "bg-green-500",
                  popular: true,
                },
                {
                  nom: "Batterie / Liquide",
                  icon: "⚡",
                  calcul: "Poids × 20$",
                  prix: "$20",
                  unite: "par kg",
                  desc: "Tarif premium pour articles dangereux/sensibles",
                  features: [
                    "Suivi sécurisé 24/7",
                    "Assurance premium",
                    "Emballage spécialisé",
                    "Traçabilité complète",
                  ],
                  color: "border-red-300",
                  bg: "bg-gradient-to-br from-red-50 to-red-100/50",
                  accentBg: "bg-red-500",
                },
                {
                  nom: "Kabelo",
                  icon: "🎁",
                  calcul: "Poids × 22$",
                  prix: "$22",
                  unite: "par kg",
                  desc: "Tarif premium pour articles précieux",
                  features: [
                    "Suivi premium 24/7",
                    "Assurance complète",
                    "Emballage premium",
                    "Livraison prioritaire",
                  ],
                  color: "border-purple-300",
                  bg: "bg-gradient-to-br from-purple-50 to-purple-100/50",
                  accentBg: "bg-purple-500",
                },
              ].map((plan) => (
                <div
                  key={plan.nom}
                  className={`group relative rounded-2xl border-2 ${plan.color} ${plan.bg} p-8 transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 overflow-hidden ${
                    plan.popular
                      ? "ring-2 ring-[#F97316]/40 md:col-span-2 lg:col-span-1"
                      : ""
                  }`}
                >
                  {/* Badge populaire */}
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-gradient-to-r from-[#F97316] to-orange-400 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                        MEILLEUR CHOIX
                      </span>
                    </div>
                  )}

                  {/* Fond dégradé au hover */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>

                  {/* Contenu */}
                  <div className="relative z-10 space-y-5">
                    {/* En-tête avec icône */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-[#F97316] transition-colors duration-300">
                          {plan.nom}
                        </h3>
                        <p className="text-sm text-gray-600">{plan.desc}</p>
                      </div>
                      <div className="text-4xl">{plan.icon}</div>
                    </div>

                    {/* Séparateur */}
                    <div
                      className={`h-0.5 bg-gradient-to-r ${plan.accentBg} opacity-30 group-hover:opacity-60 transition-opacity duration-300`}
                    ></div>

                    {/* Pricing */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                      <p className="text-xs text-gray-600 mb-1">Tarification</p>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-bold text-gray-900`}>
                          {plan.prix}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {plan.unite}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 italic">
                        Calcul: {plan.calcul}
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${plan.accentBg}`}
                          ></div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      className={`w-full rounded-xl font-semibold py-3 transition-all duration-300 transform group-hover:scale-105 ${
                        plan.popular
                          ? "bg-gradient-to-r from-[#F97316] to-orange-400 hover:from-[#EA6A08] hover:to-orange-500 text-white shadow-lg shadow-orange-500/30"
                          : `${plan.accentBg} hover:opacity-90 text-white`
                      }`}
                    >
                      Demander un devis
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-[#F97316] mb-2">
                    10-15
                  </div>
                  <p className="text-gray-700 font-semibold">
                    Jours de livraison
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Délai standard Chine → Kinshasa
                  </p>
                </div>
                <div className="border-l border-r border-blue-300">
                  <div className="text-3xl font-bold text-[#F97316] mb-2">
                    100%
                  </div>
                  <p className="text-gray-700 font-semibold">Assurance</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Couverture complète incluse
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#F97316] mb-2">
                    24/7
                  </div>
                  <p className="text-gray-700 font-semibold">Support</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Assistance client disponible
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Agent et Colis */}
        <section className="bg-gradient-to-br from-[#0A1628] to-[#0D2545] py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Illustration Colis */}
              <div className="flex justify-center">
                <div className="relative w-64 h-64">
                  {/* Boîte */}
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 300 300"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Ombre */}
                    <ellipse
                      cx="150"
                      cy="260"
                      rx="80"
                      ry="20"
                      fill="#F97316"
                      opacity="0.2"
                    />

                    {/* Boîte principale */}
                    <rect
                      x="50"
                      y="80"
                      width="200"
                      height="150"
                      fill="#F97316"
                      rx="8"
                    />

                    {/* Couvercle */}
                    <rect
                      x="50"
                      y="60"
                      width="200"
                      height="30"
                      fill="#EA6A08"
                      rx="6"
                    />

                    {/* Bande sur la boîte */}
                    <rect
                      x="50"
                      y="140"
                      width="200"
                      height="20"
                      fill="rgba(255,255,255,0.3)"
                    />

                    {/* Étiquette */}
                    <rect
                      x="80"
                      y="100"
                      width="140"
                      height="80"
                      fill="white"
                      rx="4"
                    />
                    <text
                      x="150"
                      y="125"
                      textAnchor="middle"
                      fontSize="16"
                      fontWeight="bold"
                      fill="#0A1628"
                    >
                      TE-2024-1001
                    </text>
                    <circle
                      cx="95"
                      cy="150"
                      r="8"
                      fill="#F97316"
                      opacity="0.6"
                    />
                    <circle
                      cx="95"
                      cy="150"
                      r="5"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
              </div>

              {/* Contenu */}
              <div className="text-white space-y-6">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Comment ça marche ?
                  </h2>
                  <p className="text-blue-200 text-lg leading-relaxed">
                    Notre équipe expérimentée gère chaque étape de votre
                    expédition avec professionnalisme et rigueur.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      num: "1",
                      titre: "Emballage sécurisé",
                      desc: "Vos marchandises sont emballées avec soin",
                    },
                    {
                      num: "2",
                      titre: "Transport optimisé",
                      desc: "Itinéraire le plus rapide et sûr",
                    },
                    {
                      num: "3",
                      titre: "Suivi complet",
                      desc: "Mise à jour en temps réel à chaque étape",
                    },
                    {
                      num: "4",
                      titre: "Livraison garantie",
                      desc: "Assurance complète jusqu'à la porte",
                    },
                  ].map((step) => (
                    <div key={step.num} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#F97316] to-orange-400 rounded-xl flex items-center justify-center font-bold text-lg">
                        {step.num}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-1">
                          {step.titre}
                        </h4>
                        <p className="text-blue-300 text-sm">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Équipe/Agent */}
        <section className="bg-gradient-to-b from-white to-gray-50 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Notre équipe dévouée
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Une équipe d'experts dédiée à la réussite de vos expéditions,
                avec plus de 50 ans d'expérience combinée
              </p>
              <div className="mt-6 h-1 w-16 bg-gradient-to-r from-[#F97316] to-orange-400 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  nom: "Jean Kasongo",
                  role: "Agent Chine",
                  desc: "Expert en logistique Chine avec 20 ans d'expérience",
                  initials: "JK",
                  bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
                  borderColor: "border-blue-200",
                },
                {
                  nom: "Marie Muamba",
                  role: "Coordinatrice Logistics",
                  desc: "Spécialiste en coordination de fret express",
                  initials: "MM",
                  bgColor: "bg-gradient-to-br from-[#F97316] to-orange-500",
                  borderColor: "border-orange-200",
                },
                {
                  nom: "Pierre Tshikumbu",
                  role: "Responsable Kinshasa",
                  desc: "Manager opérationnel avec expertise RDC",
                  initials: "PT",
                  bgColor: "bg-gradient-to-br from-green-500 to-green-600",
                  borderColor: "border-green-200",
                },
              ].map((member) => (
                <div
                  key={member.nom}
                  className={`group relative overflow-hidden rounded-2xl border-2 ${member.borderColor} bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2`}
                >
                  {/* Fond dégradé en haut */}
                  <div
                    className={`h-24 ${member.bgColor} opacity-90 group-hover:opacity-100 transition-opacity duration-500`}
                  ></div>

                  {/* Contenu */}
                  <div className="px-6 pb-6 pt-0 text-center">
                    {/* Avatar */}
                    <div
                      className={`w-20 h-20 ${member.bgColor} rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto -mt-10 mb-4 shadow-lg border-4 border-white group-hover:scale-110 transition-transform duration-300`}
                    >
                      {member.initials}
                    </div>

                    {/* Nom */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#F97316] transition-colors duration-300">
                      {member.nom}
                    </h3>

                    {/* Rôle */}
                    <div className="inline-block bg-gradient-to-r from-[#F97316]/10 to-orange-400/10 text-[#F97316] font-semibold text-sm px-3 py-1 rounded-full mb-3 border border-[#F97316]/20">
                      {member.role}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-5">
                      {member.desc}
                    </p>

                    {/* Contacts */}
                    <div className="flex justify-center gap-3 pt-4 border-t border-gray-100">
                      <a
                        href="mailto:#"
                        className="flex-1 h-10 bg-gradient-to-r from-[#F97316]/10 to-orange-400/10 hover:from-[#F97316]/20 hover:to-orange-400/20 rounded-xl flex items-center justify-center text-[#F97316] font-semibold text-sm transition-all duration-300 border border-[#F97316]/20 hover:border-[#F97316]/40 group-hover:shadow-md"
                        title="Email"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="ml-1">Email</span>
                      </a>
                      <a
                        href="tel:#"
                        className="flex-1 h-10 bg-gradient-to-r from-[#F97316]/10 to-orange-400/10 hover:from-[#F97316]/20 hover:to-orange-400/20 rounded-xl flex items-center justify-center text-[#F97316] font-semibold text-sm transition-all duration-300 border border-[#F97316]/20 hover:border-[#F97316]/40 group-hover:shadow-md"
                        title="Téléphone"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="ml-1">Appel</span>
                      </a>
                    </div>
                  </div>

                  {/* Bordure animée au bottom */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${member.bgColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
                  ></div>
                </div>
              ))}
            </div>

            {/* Section de statistiques */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { stat: "50+", label: "Années d'expérience" },
                { stat: "24/7", label: "Support disponible" },
                { stat: "100%", label: "Satisfaction client" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-3xl font-bold text-[#F97316] mb-2">
                    {item.stat}
                  </div>
                  <p className="text-gray-700 font-semibold">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Pourquoi nous */}
        <section className="bg-gradient-to-br from-[#0A1628]/95 via-[#0D2545]/90 to-[#051033]/95 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Pourquoi choisir Transitaire Express ?
              </h2>
              <p className="text-blue-200 text-lg max-w-2xl mx-auto">
                Nos avantages clés pour garantir votre satisfaction
              </p>
              <div className="mt-6 h-1 w-16 bg-gradient-to-r from-[#F97316] to-orange-400 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  ),
                  title: "Rapide",
                  desc: "Livraison en 10-15 jours",
                  color: "border-orange-500/20",
                  bgGradient: "from-orange-500/10 to-transparent",
                },
                {
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  title: "Sécurisé",
                  desc: "Assurance complète incluse",
                  color: "border-green-500/20",
                  bgGradient: "from-green-500/10 to-transparent",
                },
                {
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  title: "Économique",
                  desc: "Tarifs compétitifs du marché",
                  color: "border-blue-500/20",
                  bgGradient: "from-blue-500/10 to-transparent",
                },
                {
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ),
                  title: "Support 24/7",
                  desc: "Assistance toujours disponible",
                  color: "border-purple-500/20",
                  bgGradient: "from-purple-500/10 to-transparent",
                },
                {
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20H7m6-4h6a2 2 0 002-2v-2.5"
                      />
                    </svg>
                  ),
                  title: "Expérience",
                  desc: "20+ ans dans le secteur",
                  color: "border-indigo-500/20",
                  bgGradient: "from-indigo-500/10 to-transparent",
                },
                {
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  title: "Fiable",
                  desc: "10,000+ clients satisfaits",
                  color: "border-cyan-500/20",
                  bgGradient: "from-cyan-500/10 to-transparent",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`group relative rounded-2xl border-2 ${item.color} bg-gradient-to-br ${item.bgGradient} bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden`}
                >
                  {/* Fond animé */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#F97316]/5 to-transparent"></div>

                  {/* Contenu */}
                  <div className="relative z-10 space-y-3">
                    {/* Icône */}
                    <div className="w-12 h-12 bg-gradient-to-br from-[#F97316]/20 to-orange-500/10 rounded-xl flex items-center justify-center text-[#F97316] group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      {item.icon}
                    </div>

                    {/* Titre */}
                    <h3 className="text-white font-bold text-lg group-hover:text-[#F97316] transition-colors duration-300">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-blue-300 text-sm leading-relaxed group-hover:text-blue-200 transition-colors duration-300">
                      {item.desc}
                    </p>
                  </div>

                  {/* Bordure animée */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F97316] to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-16 bg-gradient-to-r from-[#F97316]/20 to-orange-500/20 border border-[#F97316]/40 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">
                Prêt à faire confiance à Transitaire Express ?
              </h3>
              <p className="text-blue-300 mb-6">
                Commencez votre suivi ou demandez un devis personnalisé
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-[#F97316] to-orange-400 hover:from-[#EA6A08] hover:to-orange-500 text-white px-8 py-3 rounded-xl font-semibold">
                  Commencer le suivi
                </Button>
                <Button className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300">
                  Demander un devis
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative bg-gradient-to-t from-[#0A1628] via-[#0D2545] to-[#0A1628] border-t border-[#F97316]/20 ">
        {/* Décoration SVG en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <svg
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 1200 400"
          >
            <defs>
              <pattern
                id="footer-grid"
                x="0"
                y="0"
                width="200"
                height="200"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 200 0 L 0 0 0 200"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="1200" height="400" fill="url(#footer-grid)" />
          </svg>
        </div>

        {/* Contenu principal */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 pb-8 border-b border-white/10">
            {/* Colonne 1: Logo et description */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-[#F97316] to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/50">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">
                  Transitaire Express
                </span>
              </div>
              <p className="text-blue-300 text-sm leading-relaxed">
                Service de fret express de la Chine vers la RDC avec suivi en
                temps réel et livraison assurée.
              </p>
            </div>

            {/* Colonne 2: Routes */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F97316]" />
                Routes
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-blue-300 hover:text-[#F97316] text-sm transition-colors duration-200"
                  >
                    Chine → Kinshasa
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-300 hover:text-[#F97316] text-sm transition-colors duration-200"
                  >
                    Suivi en direct
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-300 hover:text-[#F97316] text-sm transition-colors duration-200"
                  >
                    Tarifs
                  </a>
                </li>
              </ul>
            </div>

            {/* Colonne 3: Support */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#F97316]" />
                Support
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-blue-300 hover:text-[#F97316] text-sm transition-colors duration-200"
                  >
                    Centre d'aide
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-300 hover:text-[#F97316] text-sm transition-colors duration-200"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-300 hover:text-[#F97316] text-sm transition-colors duration-200"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Colonne 4: Réseaux sociaux */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F97316]" />
                Suivez-nous
              </h4>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-gradient-to-br from-[#F97316]/20 to-orange-500/20 hover:from-[#F97316]/40 hover:to-orange-500/40 rounded-lg flex items-center justify-center text-[#F97316] hover:text-orange-400 transition-all duration-300 border border-[#F97316]/30 hover:border-[#F97316]/60 transform hover:scale-110"
                >
                  <span className="text-sm font-bold">f</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gradient-to-br from-[#F97316]/20 to-orange-500/20 hover:from-[#F97316]/40 hover:to-orange-500/40 rounded-lg flex items-center justify-center text-[#F97316] hover:text-orange-400 transition-all duration-300 border border-[#F97316]/30 hover:border-[#F97316]/60 transform hover:scale-110"
                >
                  <span className="text-sm font-bold">𝕏</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gradient-to-br from-[#F97316]/20 to-orange-500/20 hover:from-[#F97316]/40 hover:to-orange-500/40 rounded-lg flex items-center justify-center text-[#F97316] hover:text-orange-400 transition-all duration-300 border border-[#F97316]/30 hover:border-[#F97316]/60 transform hover:scale-110"
                >
                  <span className="text-sm font-bold">in</span>
                </a>
              </div>
            </div>
          </div>

          {/* Ligne inférieure */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap gap-4 text-blue-300">
              <a
                href="#"
                className="hover:text-[#F97316] transition-colors duration-200"
              >
                Politique de confidentialité
              </a>
              <span className="text-white/20">·</span>
              <a
                href="#"
                className="hover:text-[#F97316] transition-colors duration-200"
              >
                Conditions d'utilisation
              </a>
              <span className="text-white/20">·</span>
              <a
                href="#"
                className="hover:text-[#F97316] transition-colors duration-200"
              >
                Mentions légales
              </a>
            </div>
            <p className="text-blue-400 font-medium">
              © 2024 Transitaire Express · Kinshasa, RDC
            </p>
          </div>

          {/* Barre de progression subtile en haut */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F97316]/50 to-transparent"></div>
        </div>
      </footer>
    </div>
  );
}
