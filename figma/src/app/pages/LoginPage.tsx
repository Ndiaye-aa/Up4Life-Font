import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Zap, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<UserRole>("personal");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    login(email, password, role);
    setLoading(false);
    navigate(role === "personal" ? "/" : "/aluno/inicio");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left panel - image (desktop only) */}
      <div
        className="hidden lg:flex flex-1 relative items-end pb-16 px-12"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1603665409265-bdc00027c217?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBmaXRuZXNzJTIwdHJhaW5pbmclMjBkYXJrfGVufDF8fHx8MTc3NjI3Mjc3N3ww&ixlib=rb-4.1.0&q=80&w=1080)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-white text-2xl font-semibold tracking-tight">
              Up4Life
            </span>
          </div>
          <h1 className="text-white text-4xl font-semibold leading-snug max-w-sm">
            Transforme treinos em resultados reais.
          </h1>
          <p className="text-gray-400 mt-3 max-w-xs">
            Plataforma completa para Personal Trainers e Alunos gerenciarem
            treinos e avaliações físicas.
          </p>
          <div className="flex gap-4 mt-8">
            {["500+ Alunos", "98% Satisfação", "Avaliações em tempo real"].map(
              (s) => (
                <div
                  key={s}
                  className="bg-white/10 backdrop-blur px-3 py-2 rounded-lg border border-white/15"
                >
                  <span className="text-white text-xs">{s}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile top hero */}
      <div
        className="lg:hidden h-48 relative flex items-end px-6 pb-6"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1603665409265-bdc00027c217?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBmaXRuZXNzJTIwdHJhaW5pbmclMjBkYXJrfGVufDF8fHx8MTc3NjI3Mjc3N3ww&ixlib=rb-4.1.0&q=80&w=800)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <span className="text-white text-xl font-semibold tracking-tight block">
              Up4Life
            </span>
            <span className="text-gray-400 text-xs">
              Treinos & Avaliações Físicas
            </span>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-start lg:items-center justify-center px-5 py-8 lg:px-8 lg:py-12 bg-white">
        <div className="w-full max-w-sm">
          <h2 className="text-gray-900 text-2xl lg:text-3xl font-semibold mb-1">
            Bem-vindo de volta
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Faça login para acessar sua conta.
          </p>

          {/* Role toggle */}
          <div className="flex gap-2 mb-5 bg-gray-100 rounded-xl p-1">
            {(["personal", "aluno"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm transition-all cursor-pointer capitalize ${
                  role === r
                    ? "bg-white text-gray-900 shadow-sm font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r === "personal" ? "Personal Trainer" : "Aluno"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-700 mb-2">E-mail</label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-700">Senha</label>
                <button
                  type="button"
                  className="text-sm text-purple-600 hover:text-purple-700 cursor-pointer"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all text-gray-900 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>

            <p className="text-center text-sm text-gray-500 pt-1">
              Não tem conta?{" "}
              <span className="text-purple-600 hover:text-purple-700 cursor-pointer">
                Fale com seu Personal
              </span>
            </p>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-4 bg-purple-50 border border-purple-100 rounded-xl">
            <p className="text-xs text-purple-700 font-medium mb-1">
              🚀 Acesso de demonstração
            </p>
            <p className="text-xs text-purple-600">
              Use qualquer e-mail e senha para acessar o sistema de demo.
              Escolha o perfil acima.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
