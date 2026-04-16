import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Package,
  Users,
  LayoutDashboard,
  LogOut,
  Menu,
  ChevronRight,
  Search,
  Bell,
  Shield,
} from "lucide-react";

type Page = "overview" | "clients" | "colis" | "nouveau-colis";

type Props = {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

const navItems = [
  { id: "overview" as Page, label: "Tableau de bord", icon: LayoutDashboard },
  { id: "colis" as Page, label: "Gestion des colis", icon: Package },
  { id: "clients" as Page, label: "Clients", icon: Users },
];

export default function DashboardLayout({
  children,
  currentPage,
  onNavigate,
}: Props) {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#0A1628] via-[#0D2545] to-[#051033] flex flex-col shadow-2xl border-r border-[#F97316]/10
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:inset-auto
        `}
      >
        {/* Logo Section */}
        <div className="p-5 border-b border-[#F97316]/20 bg-gradient-to-r from-[#0A1628]/50 to-[#0D2545]/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-10 h-10 bg-gradient-to-br from-[#F97316] to-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/40 group-hover:shadow-orange-500/60 transition-all duration-300 group-hover:scale-110">
              <Truck className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div className="group-hover:translate-x-1 transition-transform duration-300">
              <h1 className="text-white font-bold text-sm leading-tight">
                Transitaire Express
              </h1>
              <p className="text-blue-400 text-xs font-medium">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 group relative overflow-hidden
                  ${
                    isActive
                      ? "bg-gradient-to-r from-[#F97316] to-orange-400 text-white shadow-lg shadow-orange-500/30"
                      : "text-blue-300 hover:bg-white/5 hover:text-blue-200"
                  }
                `}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                )}
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            );
          })}

          {/* Actions Section */}
          <div className="pt-4">
            <p className="text-[#F97316] text-xs font-semibold uppercase tracking-wider px-4 mb-2">
              Actions
            </p>
            <button
              onClick={() => {
                onNavigate("nouveau-colis");
                setMobileOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 group relative overflow-hidden
                ${
                  currentPage === "nouveau-colis"
                    ? "bg-gradient-to-r from-[#F97316] to-orange-400 text-white shadow-lg shadow-orange-500/30"
                    : "text-blue-300 hover:bg-white/5 hover:text-blue-200"
                }
              `}
            >
              {currentPage === "nouveau-colis" && (
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              )}
              <Package className="w-4.5 h-4.5 shrink-0" />
              <span className="flex-1 text-left">Nouveau colis</span>
            </button>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-[#F97316]/20 space-y-3 bg-gradient-to-t from-[#0A1628]/50 to-transparent">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-[#F97316]/10 to-orange-500/5 border border-[#F97316]/20 hover:border-[#F97316]/40 transition-all duration-300">
            <div className="w-8 h-8 bg-gradient-to-br from-[#F97316] to-orange-500 rounded-full flex items-center justify-center shrink-0 shadow-md">
              {isAdmin ? (
                <Shield className="w-4 h-4 text-white" />
              ) : (
                <span className="text-white font-bold text-xs">
                  {profile?.nom?.charAt(0)?.toUpperCase() ?? "A"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {profile?.nom || "Agent"}
              </p>
              <p className="text-blue-400 text-xs capitalize font-medium">
                {profile?.role ?? "agent"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full text-blue-300 hover:text-white hover:bg-white/5 justify-start gap-2 h-9 text-sm transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-gradient-to-r from-white via-white to-gray-50 border-b border-gray-200 shadow-sm backdrop-blur-md bg-opacity-95">
          <div className="flex items-center gap-4 px-4 sm:px-6 py-4 h-auto">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page Title with Icon */}
            <div className="flex-1 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#F97316]/10 to-orange-500/5">
                {currentPage === "overview" && (
                  <LayoutDashboard className="w-5 h-5 text-[#F97316]" />
                )}
                {currentPage === "colis" && (
                  <Package className="w-5 h-5 text-[#F97316]" />
                )}
                {currentPage === "clients" && (
                  <Users className="w-5 h-5 text-[#F97316]" />
                )}
                {currentPage === "nouveau-colis" && (
                  <Package className="w-5 h-5 text-[#F97316]" />
                )}
              </div>
              <h2 className="font-bold text-gray-900 text-lg">
                {currentPage === "overview" && "Tableau de bord"}
                {currentPage === "colis" && "Gestion des colis"}
                {currentPage === "clients" && "Gestion des clients"}
                {currentPage === "nouveau-colis" && "Nouveau colis"}
              </h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                className="p-2.5 rounded-lg text-gray-500 hover:text-[#F97316] hover:bg-orange-50 transition-all duration-200"
                title="Rechercher"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                className="p-2.5 rounded-lg text-gray-500 hover:text-[#F97316] hover:bg-orange-50 transition-all duration-200 relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#F97316] rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
