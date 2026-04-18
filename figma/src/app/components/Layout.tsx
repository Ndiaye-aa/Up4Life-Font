import { Outlet, NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  ClipboardList,
  UserCircle,
  LogOut,
  ChevronRight,
  Home,
  Activity,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../context/AuthContext";

const personalNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/treinos", label: "Treinos", icon: Dumbbell },
  { to: "/avaliacoes", label: "Avaliações", icon: ClipboardList },
  { to: "/perfil", label: "Perfil", icon: UserCircle },
];

const alunoNav = [
  { to: "/aluno/inicio", label: "Início", icon: Home, end: true },
  { to: "/aluno/treinos", label: "Treino", icon: Dumbbell },
  { to: "/avaliacoes/resultados", label: "Avaliações", icon: Activity },
  { to: "/perfil", label: "Perfil", icon: UserCircle },
];

export function Layout() {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === "personal" ? personalNav : alunoNav;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSwitch = (role: UserRole) => {
    switchRole(role);
    navigate(role === "personal" ? "/" : "/aluno/inicio");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <span className="text-white font-semibold text-lg tracking-tight">
              Up4Life
            </span>
            <p className="text-gray-400 text-xs mt-0.5">
              {user?.role === "personal" ? "Personal Trainer" : "Aluno"}
            </p>
          </div>
        </div>
      </div>

      {/* Role Switch */}
      <div className="px-4 py-4 border-b border-white/10">
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-3 px-2">
          Modo de visualização
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handleSwitch("personal")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all cursor-pointer ${
              user?.role === "personal"
                ? "bg-purple-600/25 text-purple-300 border border-purple-500/40"
                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => handleSwitch("aluno")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all cursor-pointer ${
              user?.role === "aluno"
                ? "bg-purple-600/25 text-purple-300 border border-purple-500/40"
                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            Aluno
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-3 px-2">
          Menu
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                isActive
                  ? "bg-purple-600/20 text-purple-300 border-l-2 border-purple-500"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  className={isActive ? "text-purple-400" : ""}
                />
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <ChevronRight
                    size={14}
                    className="ml-auto text-purple-400 opacity-60"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Quick actions for personal */}
        {user?.role === "personal" && (
          <>
            <div className="pt-4 pb-2">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-3 px-2">
                Ações rápidas
              </p>
            </div>
            <NavLink
              to="/treinos/criar"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-purple-600/20 text-purple-300 border-l-2 border-purple-500"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                }`
              }
            >
              <Dumbbell size={18} />
              <span className="text-sm">Criar Treino</span>
            </NavLink>
            <NavLink
              to="/avaliacoes/nova"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-purple-600/20 text-purple-300 border-l-2 border-purple-500"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                }`
              }
            >
              <ClipboardList size={18} />
              <span className="text-sm">Nova Avaliação</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm truncate">{user?.name}</p>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
        >
          <LogOut size={16} />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-gray-900 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-white/10 flex-shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <span className="text-white font-semibold tracking-tight">
              Up4Life
            </span>
          </div>

          {/* Role toggle pill */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5">
            <button
              onClick={() => handleSwitch("personal")}
              className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                user?.role === "personal"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400"
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => handleSwitch("aluno")}
              className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                user?.role === "aluno"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400"
              }`}
            >
              Aluno
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <Outlet />
        </main>

        {/* Mobile Bottom Tab Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center py-2 px-1 transition-all ${
                    isActive ? "text-purple-600" : "text-gray-400"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`relative flex items-center justify-center w-12 h-7 rounded-full transition-all ${
                        isActive ? "bg-purple-100" : ""
                      }`}
                    >
                      <item.icon size={20} />
                    </div>
                    <span
                      className={`text-xs mt-0.5 ${
                        isActive ? "text-purple-600" : "text-gray-400"
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
          {/* iOS safe area */}
          <div className="h-safe-area-inset-bottom bg-white" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
        </nav>
      </div>
    </div>
  );
}