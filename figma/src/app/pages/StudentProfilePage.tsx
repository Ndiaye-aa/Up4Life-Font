import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Dumbbell,
  ClipboardList,
  TrendingUp,
  Phone,
  Mail,
  ChevronRight,
  Edit2,
  CheckCircle2,
  Circle,
  Target,
} from "lucide-react";

const RECENT_WORKOUTS = [
  { name: "Treino A – Peito e Tríceps", date: "Hoje", done: true, exercises: 6 },
  { name: "Treino B – Costas e Bíceps", date: "Ontem", done: true, exercises: 7 },
  { name: "Treino C – Pernas", date: "3 dias atrás", done: false, exercises: 8 },
  { name: "Treino D – Ombros", date: "5 dias atrás", done: true, exercises: 5 },
];

export function StudentProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-5 text-sm cursor-pointer py-1"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1732964621790-14164361044d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100"
              alt="Ana Paula"
              className="w-16 h-16 rounded-2xl object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="text-gray-900 text-lg">Ana Paula Santos</h1>
                <p className="text-gray-500 text-sm">
                  26 anos · Desde Jan/2025
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="p-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all cursor-pointer">
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => navigate("/treinos/criar")}
                  className="p-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all cursor-pointer"
                >
                  <Dumbbell size={15} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Mail size={13} />
                ana.paula@email.com
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Phone size={13} />
                (11) 98765-4321
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Target size={13} />
                Emagrecimento
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-gray-100">
          {[
            { label: "Treinos", value: "24", color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Sequência", value: "7 dias", color: "text-orange-500", bg: "bg-orange-50" },
            { label: "% Gordura", value: "24.3%", color: "text-blue-600", bg: "bg-blue-50" },
            { label: "IMC", value: "22.8", color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
              <p className={`text-lg ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hub shortcuts */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button
          onClick={() => navigate("/treinos")}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:border-purple-200 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-2 group-hover:bg-purple-100 transition-colors">
            <Dumbbell size={18} className="text-purple-600" />
          </div>
          <h3 className="text-gray-900 text-sm">Treinos</h3>
          <p className="text-gray-400 text-xs mt-0.5">3 ativos</p>
          <div className="flex items-center gap-1 mt-2 text-purple-600 text-xs">
            Ver <ChevronRight size={11} />
          </div>
        </button>

        <button
          onClick={() => navigate("/avaliacoes")}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:border-purple-200 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-2 group-hover:bg-blue-100 transition-colors">
            <ClipboardList size={18} className="text-blue-600" />
          </div>
          <h3 className="text-gray-900 text-sm">Aval.</h3>
          <p className="text-gray-400 text-xs mt-0.5">Há 30 dias</p>
          <div className="flex items-center gap-1 mt-2 text-blue-600 text-xs">
            Ver <ChevronRight size={11} />
          </div>
        </button>

        <button
          onClick={() => navigate("/avaliacoes/resultados")}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:border-purple-200 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-2 group-hover:bg-emerald-100 transition-colors">
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <h3 className="text-gray-900 text-sm">Evolução</h3>
          <p className="text-gray-400 text-xs mt-0.5">Gráficos</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs">
            Ver <ChevronRight size={11} />
          </div>
        </button>
      </div>

      {/* Recent workouts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-gray-900">Treinos Recentes</h2>
          <button className="text-sm text-purple-600 hover:text-purple-700 cursor-pointer py-1">
            Ver todos
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {RECENT_WORKOUTS.map((w, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <div className={`flex-shrink-0 ${w.done ? "text-emerald-500" : "text-gray-300"}`}>
                {w.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{w.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {w.exercises} ex. · {w.date}
                </p>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${
                  w.done
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {w.done ? "Feito" : "Pendente"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
