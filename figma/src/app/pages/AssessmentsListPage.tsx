import { useNavigate } from "react-router";
import { Plus, ClipboardList, ChevronRight, Calendar, User } from "lucide-react";

const ASSESSMENTS = [
  {
    id: "1",
    student: "Ana Paula Santos",
    date: "15/03/2026",
    bmi: "22.8",
    bodyFat: "24.3%",
    status: "Normal",
    statusColor: "bg-emerald-50 text-emerald-600",
    initials: "AP",
    avatarColor: "from-pink-500 to-rose-600",
  },
  {
    id: "2",
    student: "Roberto Lima",
    date: "10/03/2026",
    bmi: "27.2",
    bodyFat: "18.7%",
    status: "Sobrepeso",
    statusColor: "bg-amber-50 text-amber-600",
    initials: "RL",
    avatarColor: "from-blue-500 to-indigo-600",
  },
  {
    id: "3",
    student: "Jorge Pereira",
    date: "02/03/2026",
    bmi: "24.1",
    bodyFat: "22.1%",
    status: "Normal",
    statusColor: "bg-emerald-50 text-emerald-600",
    initials: "JP",
    avatarColor: "from-emerald-500 to-teal-600",
  },
  {
    id: "4",
    student: "Mariana Costa",
    date: "28/02/2026",
    bmi: "20.5",
    bodyFat: "27.8%",
    status: "Normal",
    statusColor: "bg-emerald-50 text-emerald-600",
    initials: "MC",
    avatarColor: "from-violet-500 to-purple-600",
  },
];

export function AssessmentsListPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-gray-900">Avaliações</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Histórico e gestão de avaliações
          </p>
        </div>
        <button
          onClick={() => navigate("/avaliacoes/nova")}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-sm cursor-pointer flex-shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nova Avaliação</span>
          <span className="sm:hidden">Nova</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Este mês", value: "8", icon: ClipboardList, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Avaliados", value: "6", icon: User, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pendentes", value: "4", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`${s.bg} p-2 rounded-lg`}>
                <s.icon size={15} className={s.color} />
              </div>
            </div>
            <p className="text-2xl text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Assessments list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-gray-900">Avaliações Recentes</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {ASSESSMENTS.map((a) => (
            <div
              key={a.id}
              onClick={() => navigate("/avaliacoes/resultados")}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors group active:bg-gray-100"
            >
              <div
                className={`w-11 h-11 rounded-full bg-gradient-to-br ${a.avatarColor} flex items-center justify-center text-white text-sm flex-shrink-0`}
              >
                {a.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium truncate">{a.student}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Calendar size={11} className="text-gray-400" />
                  <p className="text-xs text-gray-400">{a.date}</p>
                </div>
              </div>
              {/* Metrics - show on sm+ */}
              <div className="hidden sm:flex gap-4 flex-shrink-0">
                <div className="text-center">
                  <p className="text-sm text-gray-900">{a.bmi}</p>
                  <p className="text-xs text-gray-400">IMC</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-900">{a.bodyFat}</p>
                  <p className="text-xs text-gray-400">Gordura</p>
                </div>
              </div>
              {/* Status pill */}
              <span className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${a.statusColor}`}>
                {a.status}
              </span>
              <ChevronRight
                size={16}
                className="text-gray-300 group-hover:text-purple-400 transition-colors flex-shrink-0"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
