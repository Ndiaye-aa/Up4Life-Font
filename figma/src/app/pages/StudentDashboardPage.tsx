import { useNavigate } from "react-router";
import {
  Dumbbell,
  TrendingUp,
  Flame,
  ChevronRight,
  CheckCircle2,
  Circle,
  Trophy,
  Calendar,
  Target,
  Zap,
} from "lucide-react";

const TODAY_WORKOUT = {
  name: "Treino A – Peito e Tríceps",
  exercises: 6,
  duration: "~45 min",
  done: 2,
  total: 6,
};

const LAST_ASSESSMENT = {
  date: "15/03/2026",
  bmi: "22.8",
  bodyFat: "24.3%",
  status: "Normal",
};

const WEEK_PROGRESS = [
  { day: "Seg", done: true },
  { day: "Ter", done: true },
  { day: "Qua", done: false },
  { day: "Qui", done: false },
  { day: "Sex", done: false },
  { day: "Sáb", done: false },
  { day: "Dom", done: false },
];

const WORKOUT_HISTORY = [
  { name: "Treino A – Peito e Tríceps", date: "Ontem", duration: "48 min", done: true },
  { name: "Treino B – Costas e Bíceps", date: "3 dias atrás", duration: "52 min", done: true },
  { name: "Treino C – Pernas", date: "5 dias atrás", duration: "55 min", done: false },
  { name: "Treino D – Ombros", date: "1 semana atrás", duration: "40 min", done: true },
];

export function StudentDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-gray-900">Olá, Ana Paula! 👋</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Terça-feira, 15 de Abril · Pronta para treinar?
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Treinos", value: "24", icon: Dumbbell, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Sequência", value: "7d", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Esta semana", value: "2/5", icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Conquistas", value: "8", icon: Trophy, color: "text-amber-500", bg: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className={`${s.bg} w-9 h-9 rounded-xl flex items-center justify-center mb-2`}>
              <s.icon size={17} className={s.color} />
            </div>
            <p className="text-2xl text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Today's workout - highlight card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">
                Treino de hoje
              </p>
              <h3 className="text-white text-base">{TODAY_WORKOUT.name}</h3>
            </div>
            <div className="w-11 h-11 bg-purple-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Dumbbell size={20} className="text-purple-300" />
            </div>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-gray-400 text-sm">
              {TODAY_WORKOUT.exercises} exercícios
            </span>
            <span className="text-gray-400 text-sm">{TODAY_WORKOUT.duration}</span>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{
                  width: `${(TODAY_WORKOUT.done / TODAY_WORKOUT.total) * 100}%`,
                }}
              />
            </div>
            <span className="text-gray-300 text-sm">
              {TODAY_WORKOUT.done}/{TODAY_WORKOUT.total}
            </span>
          </div>
        </div>
        <div className="p-4">
          <button
            onClick={() => navigate("/treinos/player")}
            className="w-full py-3.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap size={16} />
            Continuar Treino
          </button>
        </div>
      </div>

      {/* Week progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-900 text-base">Semana Atual</h3>
          <span className="text-xs text-gray-400">2/5 treinos</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEK_PROGRESS.map((day) => (
            <div key={day.day} className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{day.day}</span>
              <div
                className={`w-full aspect-square rounded-lg flex items-center justify-center ${
                  day.done
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 text-gray-300"
                }`}
              >
                {day.done ? <CheckCircle2 size={13} /> : <Circle size={13} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Workout history */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-gray-900 text-base">Histórico de Treinos</h2>
            <button className="text-sm text-purple-600 hover:text-purple-700 cursor-pointer py-1">
              Ver todos
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {WORKOUT_HISTORY.map((w, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className={w.done ? "text-emerald-500" : "text-gray-300"}>
                  {w.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{w.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {w.date} · {w.duration}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    w.done
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {w.done ? "✓" : "Perdido"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Last assessment */}
          <div
            onClick={() => navigate("/avaliacoes/resultados")}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:border-purple-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-900 text-base">Última Avaliação</h3>
              <ChevronRight
                size={16}
                className="text-gray-300 group-hover:text-purple-400 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400">{LAST_ASSESSMENT.date}</span>
            </div>
            <div className="space-y-2">
              {[
                { label: "IMC", value: LAST_ASSESSMENT.bmi },
                { label: "% Gordura", value: LAST_ASSESSMENT.bodyFat },
                { label: "Classificação", value: LAST_ASSESSMENT.status },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <span
                    className={`text-xs font-medium ${
                      item.label === "Classificação"
                        ? "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"
                        : "text-gray-900"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/avaliacoes/resultados");
              }}
              className="w-full mt-4 py-2.5 rounded-xl border border-purple-200 text-purple-600 text-xs hover:bg-purple-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <TrendingUp size={13} />
              Ver evolução completa
            </button>
          </div>

          {/* Motivational banner */}
          <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={18} className="text-yellow-300" />
              <span className="text-sm">Conquista desbloqueada!</span>
            </div>
            <p className="text-purple-100 text-xs leading-relaxed">
              Você completou 7 dias consecutivos de treino. Continue assim! 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
