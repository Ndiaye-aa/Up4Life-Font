import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Search,
  Plus,
  Dumbbell,
  ClipboardList,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

const STUDENTS = [
  {
    id: "1",
    name: "Ana Paula Santos",
    age: 26,
    goal: "Emagrecimento",
    lastWorkout: "Hoje",
    progress: 78,
    status: "ativo",
    initials: "AP",
    color: "from-pink-500 to-rose-600",
    workouts: 24,
    img: "https://images.unsplash.com/photo-1732964621790-14164361044d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  },
  {
    id: "2",
    name: "Roberto Lima",
    age: 34,
    goal: "Hipertrofia",
    lastWorkout: "Ontem",
    progress: 91,
    status: "ativo",
    initials: "RL",
    color: "from-blue-500 to-indigo-600",
    workouts: 31,
    img: "https://images.unsplash.com/photo-1628935291759-bbaf33a66dc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  },
  {
    id: "3",
    name: "Jorge Pereira",
    age: 58,
    goal: "Saúde & Condicionamento",
    lastWorkout: "3 dias",
    progress: 62,
    status: "ativo",
    initials: "JP",
    color: "from-emerald-500 to-teal-600",
    workouts: 18,
    img: "https://images.unsplash.com/photo-1619870448322-3eef96ce6cd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  },
  {
    id: "4",
    name: "Mariana Costa",
    age: 22,
    goal: "Condicionamento",
    lastWorkout: "Hoje",
    progress: 55,
    status: "ativo",
    initials: "MC",
    color: "from-violet-500 to-purple-600",
    workouts: 12,
    img: null,
  },
  {
    id: "5",
    name: "Fernanda Alves",
    age: 41,
    goal: "Reabilitação",
    lastWorkout: "1 semana",
    progress: 30,
    status: "inativo",
    initials: "FA",
    color: "from-orange-500 to-amber-600",
    workouts: 8,
    img: null,
  },
  {
    id: "6",
    name: "Lucas Souza",
    age: 29,
    goal: "Hipertrofia",
    lastWorkout: "2 dias",
    progress: 84,
    status: "ativo",
    initials: "LS",
    color: "from-cyan-500 to-sky-600",
    workouts: 27,
    img: null,
  },
];

const stats = [
  {
    label: "Alunos Ativos",
    value: "12",
    icon: Users,
    change: "+2 este mês",
    accent: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Treinos/Semana",
    value: "38",
    icon: Dumbbell,
    change: "+15% vs anterior",
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Avaliações",
    value: "4",
    icon: ClipboardList,
    change: "Vencem em 7 dias",
    accent: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Engajamento",
    value: "87%",
    icon: TrendingUp,
    change: "+3% esta semana",
    accent: "text-blue-600",
    bg: "bg-blue-50",
  },
];

interface NewStudentModalProps {
  onClose: () => void;
}

function NewStudentModal({ onClose }: NewStudentModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="text-gray-900">Cadastrar Novo Aluno</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Preencha os dados demográficos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                Nome completo
              </label>
              <input
                className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm"
                placeholder="Nome do aluno"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                Data de nascimento
              </label>
              <input
                type="date"
                className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                Telefone
              </label>
              <input
                className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                Sexo
              </label>
              <select className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm">
                <option>Masc.</option>
                <option>Fem.</option>
                <option>Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                Altura (cm)
              </label>
              <input
                type="number"
                className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm"
                placeholder="170"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                Peso (kg)
              </label>
              <input
                type="number"
                className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm"
                placeholder="70"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">
              Objetivo principal
            </label>
            <select className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm">
              <option>Emagrecimento</option>
              <option>Hipertrofia</option>
              <option>Condicionamento</option>
              <option>Saúde & Qualidade de vida</option>
              <option>Reabilitação</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">
              Observações
            </label>
            <textarea
              rows={2}
              className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm resize-none"
              placeholder="Restrições, lesões, histórico médico..."
            />
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-6 pt-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all text-sm cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all text-sm cursor-pointer"
          >
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  );
}

export function PersonalDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [showModal, setShowModal] = useState(false);

  const filtered = STUDENTS.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.goal.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "todos" || s.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {showModal && <NewStudentModal onClose={() => setShowModal(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Terça-feira, 15 de Abril de 2026
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-sm cursor-pointer flex-shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Novo Aluno</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon size={15} className={stat.accent} />
              </div>
            </div>
            <p className="text-2xl text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">
              {stat.label}
            </p>
            <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Students section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-gray-900">Meus Alunos</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 cursor-pointer"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar aluno ou objetivo..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.map((student) => (
            <div
              key={student.id}
              onClick={() => navigate(`/alunos/${student.id}`)}
              className="flex items-center gap-3 p-4 hover:bg-gray-50/80 cursor-pointer transition-colors group active:bg-gray-100"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {student.img ? (
                  <img
                    src={student.img}
                    alt={student.name}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${student.color} flex items-center justify-center text-white text-sm font-semibold`}
                  >
                    {student.initials}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-900 font-medium truncate">
                    {student.name}
                  </p>
                  <span
                    className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${
                      student.status === "ativo"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {student.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-400 truncate">
                    {student.age} anos · {student.goal}
                  </p>
                </div>
                {/* Mobile progress bar */}
                <div className="flex items-center gap-2 mt-1.5 sm:hidden">
                  <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {student.progress}%
                  </span>
                </div>
              </div>

              {/* Progress (desktop) */}
              <div className="hidden sm:flex flex-col items-end gap-1.5 w-28">
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">
                    {student.progress}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={11} className="text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {student.lastWorkout}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={16}
                className="text-gray-300 group-hover:text-purple-400 transition-colors flex-shrink-0"
              />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <Users size={32} className="mx-auto mb-3 opacity-40" />
            <p>Nenhum aluno encontrado</p>
          </div>
        )}

        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {filtered.length} aluno(s) exibido(s)
          </span>
          <button className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer py-1">
            Ver todos <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* FAB for mobile - quick actions */}
      <div className="fixed bottom-24 right-4 lg:hidden flex flex-col gap-3 z-30">
        <button
          onClick={() => navigate("/avaliacoes/nova")}
          className="w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-all"
          title="Nova Avaliação"
        >
          <ClipboardList size={20} />
        </button>
        <button
          onClick={() => navigate("/treinos/criar")}
          className="w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-all"
          title="Criar Treino"
        >
          <Dumbbell size={20} />
        </button>
      </div>
    </div>
  );
}
