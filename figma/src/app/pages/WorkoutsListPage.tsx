import { useNavigate } from "react-router";
import {
  Dumbbell,
  Plus,
  Search,
  ChevronRight,
  Clock,
  FileText,
  MoreVertical,
  Play,
} from "lucide-react";
import { useState } from "react";

const WORKOUTS = [
  {
    id: "1",
    name: "Treino A – Peito e Tríceps",
    student: "Ana Paula Santos",
    exercises: 6,
    duration: "~45 min",
    category: "Musculação",
    color: "from-pink-500 to-rose-600",
    initials: "AP",
  },
  {
    id: "2",
    name: "Treino Full Body",
    student: "Roberto Lima",
    exercises: 8,
    duration: "~60 min",
    category: "Funcional",
    color: "from-blue-500 to-indigo-600",
    initials: "RL",
  },
  {
    id: "3",
    name: "Treino C – Pernas e Glúteos",
    student: "Ana Paula Santos",
    exercises: 7,
    duration: "~50 min",
    category: "Musculação",
    color: "from-pink-500 to-rose-600",
    initials: "AP",
  },
  {
    id: "4",
    name: "Mobilidade e Alongamento",
    student: "Jorge Pereira",
    exercises: 5,
    duration: "~30 min",
    category: "Mobilidade",
    color: "from-emerald-500 to-teal-600",
    initials: "JP",
  },
  {
    id: "5",
    name: "Treino Hipertrofia – Costas",
    student: "Lucas Souza",
    exercises: 9,
    duration: "~55 min",
    category: "Musculação",
    color: "from-cyan-500 to-sky-600",
    initials: "LS",
  },
];

export function WorkoutsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = WORKOUTS.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.student.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-gray-900">Treinos</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Gerencie e crie planilhas de treino
          </p>
        </div>
        <button
          onClick={() => navigate("/treinos/criar")}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-sm cursor-pointer flex-shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Criar Treino</span>
          <span className="sm:hidden">Criar</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar treino ou aluno..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 shadow-sm"
        />
      </div>

      {/* Workout cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((workout) => (
          <div
            key={workout.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
          >
            {/* Card header */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full">
                  {workout.category}
                </span>
                <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer -mr-1">
                  <MoreVertical size={16} />
                </button>
              </div>
              <h3 className="text-gray-900 text-base leading-snug mb-2">
                {workout.name}
              </h3>
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full bg-gradient-to-br ${workout.color} flex items-center justify-center text-white text-xs flex-shrink-0`}
                >
                  {workout.initials}
                </div>
                <span className="text-sm text-gray-500 truncate">{workout.student}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="px-4 pb-3 flex gap-4">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Dumbbell size={13} />
                <span className="text-xs">{workout.exercises} exercícios</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock size={13} />
                <span className="text-xs">{workout.duration}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex gap-2 border-t border-gray-50 pt-3">
              <button
                onClick={() => navigate("/treinos/player")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 text-white text-xs hover:bg-gray-800 transition-all cursor-pointer"
              >
                <Play size={13} />
                Iniciar
              </button>
              <button className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 transition-all cursor-pointer">
                <FileText size={13} />
              </button>
              <button
                onClick={() => navigate("/treinos/criar")}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 transition-all cursor-pointer"
              >
                Editar
              </button>
            </div>
          </div>
        ))}

        {/* Create new card */}
        <button
          onClick={() => navigate("/treinos/criar")}
          className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center gap-3 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer min-h-[180px] group"
        >
          <div className="w-11 h-11 rounded-xl bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
            <Plus size={20} className="text-gray-400 group-hover:text-purple-600" />
          </div>
          <span className="text-sm text-gray-400 group-hover:text-purple-600 transition-colors">
            Criar novo treino
          </span>
        </button>
      </div>
    </div>
  );
}
