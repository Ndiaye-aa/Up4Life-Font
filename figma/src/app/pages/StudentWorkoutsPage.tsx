import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Dumbbell,
  Play,
  Clock,
  CheckCircle2,
  ChevronRight,
  Flame,
  Calendar,
  RotateCcw,
  Star,
  Lock,
  Zap,
} from "lucide-react";

const PERSONAL_NAME = "Carlos Mendes";

const WORKOUT_SHEETS = [
  {
    id: "A",
    name: "Ficha A – Peito e Tríceps",
    focus: "Musculação",
    exercises: 6,
    duration: "~45 min",
    lastDone: "Ontem",
    daysAgo: 1,
    color: "from-rose-500 to-pink-600",
    colorLight: "bg-rose-50",
    colorText: "text-rose-600",
    colorBorder: "border-rose-200",
    muscles: ["Peito", "Tríceps", "Ombro"],
    isToday: true,
    completed: false,
    locked: false,
  },
  {
    id: "B",
    name: "Ficha B – Costas e Bíceps",
    focus: "Musculação",
    exercises: 7,
    duration: "~50 min",
    lastDone: "3 dias atrás",
    daysAgo: 3,
    color: "from-blue-500 to-indigo-600",
    colorLight: "bg-blue-50",
    colorText: "text-blue-600",
    colorBorder: "border-blue-200",
    muscles: ["Costas", "Bíceps", "Antebraço"],
    isToday: false,
    completed: false,
    locked: false,
  },
  {
    id: "C",
    name: "Ficha C – Pernas e Glúteos",
    focus: "Musculação",
    exercises: 8,
    duration: "~55 min",
    lastDone: "5 dias atrás",
    daysAgo: 5,
    color: "from-violet-500 to-purple-600",
    colorLight: "bg-violet-50",
    colorText: "text-violet-600",
    colorBorder: "border-violet-200",
    muscles: ["Quadríceps", "Glúteos", "Panturrilha"],
    isToday: false,
    completed: false,
    locked: false,
  },
  {
    id: "D",
    name: "Ficha D – Ombros e Abdômen",
    focus: "Musculação",
    exercises: 6,
    duration: "~40 min",
    lastDone: "1 semana atrás",
    daysAgo: 7,
    color: "from-amber-500 to-orange-600",
    colorLight: "bg-amber-50",
    colorText: "text-amber-600",
    colorBorder: "border-amber-200",
    muscles: ["Ombros", "Abdômen", "Core"],
    isToday: false,
    completed: false,
    locked: false,
  },
  {
    id: "E",
    name: "Cardio HIIT",
    focus: "Cardio",
    exercises: 5,
    duration: "~30 min",
    lastDone: "Nunca",
    daysAgo: 999,
    color: "from-emerald-500 to-teal-600",
    colorLight: "bg-emerald-50",
    colorText: "text-emerald-600",
    colorBorder: "border-emerald-200",
    muscles: ["Corpo inteiro", "Cardio"],
    isToday: false,
    completed: false,
    locked: true,
  },
];

const FILTERS = ["Todos", "Musculação", "Cardio", "Funcional"];

const RECENT_HISTORY = [
  { sheet: "Ficha B – Costas e Bíceps", date: "Terça-feira", duration: "52 min", xp: 120 },
  { sheet: "Ficha A – Peito e Tríceps", date: "Segunda-feira", duration: "48 min", xp: 110 },
  { sheet: "Ficha C – Pernas e Glúteos", date: "Sábado passado", duration: "57 min", xp: 130 },
];

export function StudentWorkoutsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    filter === "Todos"
      ? WORKOUT_SHEETS
      : WORKOUT_SHEETS.filter((w) => w.focus === filter);

  const todayWorkout = WORKOUT_SHEETS.find((w) => w.isToday);

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto pb-28 lg:pb-8">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-gray-900">Minhas Fichas</h1>
        <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5">
          <span>Montadas por</span>
          <span className="text-purple-600">{PERSONAL_NAME}</span>
        </p>
      </div>

      {/* Today highlight card */}
      {todayWorkout && (
        <div className="mb-5 bg-gray-900 rounded-2xl overflow-hidden shadow-lg shadow-gray-900/20">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-purple-600/30 flex items-center justify-center">
                <Star size={13} className="text-purple-300" />
              </div>
              <span className="text-purple-300 text-xs uppercase tracking-widest">
                Treino de hoje
              </span>
            </div>
            <h2 className="text-white text-xl mb-1">{todayWorkout.name}</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Dumbbell size={13} />
                <span className="text-sm">{todayWorkout.exercises} exercícios</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock size={13} />
                <span className="text-sm">{todayWorkout.duration}</span>
              </div>
            </div>

            {/* Muscle tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {todayWorkout.muscles.map((m) => (
                <span
                  key={m}
                  className="text-xs px-2.5 py-1 bg-white/10 text-gray-300 rounded-full"
                >
                  {m}
                </span>
              ))}
            </div>

            <button
              onClick={() => navigate("/treinos/player")}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Zap size={16} />
              Iniciar Agora
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-all cursor-pointer ${
              filter === f
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Workout sheet cards */}
      <div className="space-y-3 mb-6">
        {filtered.map((sheet) => {
          const isExpanded = expandedId === sheet.id;
          return (
            <div
              key={sheet.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                sheet.isToday
                  ? "border-purple-200 shadow-purple-100/60"
                  : "border-gray-100"
              } ${sheet.locked ? "opacity-60" : ""}`}
            >
              {/* Card main row */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer active:bg-gray-50"
                onClick={() => !sheet.locked && setExpandedId(isExpanded ? null : sheet.id)}
              >
                {/* Color indicator + letter */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sheet.color} flex items-center justify-center flex-shrink-0 shadow-sm`}
                >
                  <span className="text-white font-semibold text-lg">
                    {sheet.id}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-gray-900 text-sm truncate">{sheet.name}</p>
                    {sheet.isToday && (
                      <span className="flex-shrink-0 text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">
                        Hoje
                      </span>
                    )}
                    {sheet.locked && (
                      <Lock size={13} className="text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Dumbbell size={11} />
                      {sheet.exercises} exerc.
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={11} />
                      {sheet.duration}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <RotateCcw size={11} />
                      {sheet.lastDone}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {sheet.locked ? (
                  <div className="flex-shrink-0 px-3 py-2 rounded-xl bg-gray-100 text-gray-400 text-xs flex items-center gap-1.5">
                    <Lock size={13} />
                    Bloqueado
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/treinos/player");
                      }}
                      className="w-10 h-10 bg-gray-900 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <Play size={15} />
                    </button>
                    <ChevronRight
                      size={16}
                      className={`text-gray-300 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </div>
                )}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-50">
                  <div className="pt-3">
                    {/* Focus tag */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full ${sheet.colorLight} ${sheet.colorText}`}
                      >
                        {sheet.focus}
                      </span>
                      {sheet.muscles.map((m) => (
                        <span
                          key={m}
                          className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                        >
                          {m}
                        </span>
                      ))}
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: "Exercícios", value: sheet.exercises },
                        { label: "Duração", value: sheet.duration },
                        { label: "Último", value: sheet.lastDone },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="bg-gray-50 rounded-xl p-3 text-center"
                        >
                          <p className="text-gray-900 text-sm">{s.value}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => navigate("/treinos/player")}
                      className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Play size={15} />
                      Iniciar Ficha {sheet.id}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-50">
          <h2 className="text-gray-900 text-base">Histórico Recente</h2>
          <Calendar size={16} className="text-gray-300" />
        </div>
        <div className="divide-y divide-gray-50">
          {RECENT_HISTORY.map((h, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={15} className="text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{h.sheet}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {h.date} · {h.duration}
                </p>
              </div>
              <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                <Flame size={13} />
                <span className="text-xs">+{h.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
