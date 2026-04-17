import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  CircleAlert as AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError("Email ou mot de passe incorrect. Veuillez réessayer.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0D1F3C] to-[#0A1628] flex items-center justify-center p-4 overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3), 0 0 60px rgba(59, 130, 246, 0.1); }
          50% { box-shadow: 0 0 30px rgba(249, 115, 22, 0.5), 0 0 80px rgba(59, 130, 246, 0.2); }
        }
        @keyframes blob-move {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes blob-move-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 40px) scale(1.05); }
          66% { transform: translate(20px, -20px) scale(0.95); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-blob-move { animation: blob-move 15s ease-in-out infinite; }
        .animate-blob-move-reverse { animation: blob-move-reverse 18s ease-in-out infinite; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-[#F97316] to-[#EA6A08] rounded-full blur-3xl opacity-10 animate-blob-move" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full blur-3xl opacity-5 animate-blob-move-reverse" />
        <div className="absolute top-0 right-1/3 w-72 h-72 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full blur-3xl opacity-5 animate-pulse-slow" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="animate-slide-up">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:border-white/20 transition-all duration-500 animate-glow">
            <div className="text-center mb-8 space-y-4">
              <div
                className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg animate-float"
                style={{ animation: "float 4s ease-in-out infinite" }}
              >
                {/* Logo Image */}
                <img
                  src="./logo.png"
                  alt="Transitaire Express"
                  className="w-20 h-20 object-contain relative z-10 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="animate-slide-up delay-100">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent tracking-tight">
                  Transitaire Express
                </h1>
              </div>
              <div className="animate-slide-up delay-200">
                <p className="text-blue-200/80 text-sm font-medium">
                  Portail de gestion intégré
                </p>
                <p className="text-blue-300/60 text-xs mt-1">
                  Chine / Kinshasa
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="animate-slide-up delay-300">
                  <Alert className="bg-red-500/15 border border-red-500/40 text-red-200 rounded-xl backdrop-blur">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="space-y-3 animate-slide-up delay-300">
                <Label
                  htmlFor="email"
                  className="text-blue-200 text-xs font-semibold uppercase tracking-wider"
                >
                  Adresse email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="agent@transitaire.cd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/8 border border-white/15 text-white placeholder:text-white/30 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/30 h-12 rounded-xl transition-all duration-200 hover:bg-white/10"
                />
              </div>

              <div className="space-y-3 animate-slide-up delay-400">
                <Label
                  htmlFor="password"
                  className="text-blue-200 text-xs font-semibold uppercase tracking-wider"
                >
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/8 border border-white/15 text-white placeholder:text-white/30 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/30 h-12 rounded-xl transition-all duration-200 pr-10 hover:bg-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-[#F97316] to-[#EA6A08] hover:from-[#EA6A08] hover:to-[#DC5C08] text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105 active:scale-95 animate-slide-up delay-500 uppercase tracking-wider text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connexion...</span>
                  </span>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center animate-slide-up delay-600">
              <div className="flex items-center justify-center gap-2 text-blue-300/60 text-xs">
                <Package className="w-4 h-4" />
                <span>Accès réservé aux agents et administrateurs</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-8 animate-slide-up delay-700">
          © 2026 Transitaire Express · Tous droits réservés
        </p>
      </div>
    </div>
  );
}
