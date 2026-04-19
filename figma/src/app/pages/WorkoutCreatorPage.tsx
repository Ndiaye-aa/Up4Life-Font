import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Search,
  Plus,
  X,
  GripVertical,
  FileText,
  Save,
  Dumbbell,
} from "lucide-react";

const EXERCISE_CATALOG = [
  { id: "1", name: "Supino Reto com Barra", muscle: "Peito", category: "Compostos" },
  { id: "2", name: "Crucifixo Inclinado", muscle: "Peito", category: "Isolados" },
  { id: "3", name: "Tríceps Pulley", muscle: "Tríceps", category: "Isolados" },
  { id: "4", name: "Tríceps Francês", muscle: "Tríceps", category: "Isolados" },
  { id: "5", name: "Agachamento Livre", muscle: "Quadríceps", category: "Compostos" },
  { id: "6", name: "Leg Press 45°", muscle: "Quadríceps", category: "Compostos" },
  { id: "7", name: "Remada Curvada", muscle: "Costas", category: "Compostos" },
  { id: "8", name: "Puxada Frente", muscle: "Costas", category: "Compostos" },
  { id: "9", name: "Rosca Direta", muscle: "Bíceps", category: "Isolados" },
  { id: "10", name: "Desenvolvimento Ombro", muscle: "Ombros", category: "Compostos" },
  { id: "11", name: "Elevação Lateral", muscle: "Ombros", category: "Isolados" },
  { id: "12", name: "Cadeira Extensora", muscle: "Quadríceps", category: "Isolados" },
];

interface SelectedExercise {
  id: string;
  name: string;
  muscle: string;
  sets: string;
  reps: string;
  load: string;
  rest: string;
}

export function WorkoutCreatorPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SelectedExercise[]>([
    { id: "1", name: "Supino Reto com Barra", muscle: "Peito", sets: "4", reps: "12", load: "60", rest: "90" },
    { id: "3", name: "Tríceps Pulley", muscle: "Tríceps", sets: "3", reps: "15", load: "25", rest: "60" },
  ]);
  const [workoutName, setWorkoutName] = useState("Treino A – Peito e Tríceps");
  const [studentName, setStudentName] = useState("Ana Paula Santos");
  // Mobile: toggle between catalog and planilha view
  const [activeTab, setActiveTab] = useState<"catalog" | "plan">("catalog");

  const filtered = EXERCISE_CATALOG.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.muscle.toLowerCase().includes(search.toLowerCase())
  );

  const addExercise = (ex: (typeof EXERCISE_CATALOG)[0]) => {
    if (!selected.find((s) => s.id === ex.id)) {
      setSelected((prev) => [
        ...prev,
        { ...ex, sets: "3", reps: "12", load: "", rest: "60" },
      ]);
    }
  };

  const removeExercise = (id: string) => {
    setSelected((prev) => prev.filter((e) => e.id !== id));
  };

  const updateField = (id: string, field: keyof SelectedExercise, value: string) => {
    setSelected((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-gray-900">Criar Treino</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Monte a planilha de exercícios
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all cursor-pointer">
            <FileText size={16} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-800 transition-all cursor-pointer">
            <Save size={14} />
            <span className="hidden sm:inline">Salvar</span>
          </button>
        </div>
      </div>

      {/* Workout info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1.5">
              Nome do treino
            </label>
            <input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1.5">Aluno</label>
            <select
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm cursor-pointer"
            >
              <option>Ana Paula Santos</option>
              <option>Roberto Lima</option>
              <option>Jorge Pereira</option>
              <option>Lucas Souza</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile tab toggle */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 lg:hidden">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex-1 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
            activeTab === "catalog"
              ? "bg-white text-gray-900 shadow-sm font-medium"
              : "text-gray-500"
          }`}
        >
          Catálogo
        </button>
        <button
          onClick={() => setActiveTab("plan")}
          className={`flex-1 py-2.5 rounded-lg text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "plan"
              ? "bg-white text-gray-900 shadow-sm font-medium"
              : "text-gray-500"
          }`}
        >
          Planilha
          {selected.length > 0 && (
            <span className="w-5 h-5 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center">
              {selected.length}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Catalog */}
        <div
          className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${
            activeTab === "plan" ? "hidden lg:block" : ""
          }`}
        >
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-gray-900 mb-3">Catálogo de Exercícios</h2>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar exercício ou músculo..."
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
              />
            </div>
          </div>
          <div className="divide-y divide-gray-50 max-h-[60vh] lg:max-h-96 overflow-y-auto">
            {filtered.map((ex) => {
              const isAdded = selected.some((s) => s.id === ex.id);
              return (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Dumbbell size={15} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{ex.name}</p>
                    <p className="text-xs text-gray-400">
                      {ex.muscle} · {ex.category}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      addExercise(ex);
                      // On mobile, switch to plan tab after adding
                      setActiveTab("plan");
                    }}
                    disabled={isAdded}
                    className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isAdded
                        ? "bg-emerald-50 text-emerald-500 cursor-default"
                        : "bg-gray-100 text-gray-500 hover:bg-purple-100 hover:text-purple-600"
                    }`}
                  >
                    {isAdded ? (
                      <span className="text-xs">✓</span>
                    ) : (
                      <Plus size={16} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected exercises */}
        <div
          className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${
            activeTab === "catalog" ? "hidden lg:block" : ""
          }`}
        >
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-gray-900">
              Planilha{" "}
              <span className="text-sm text-gray-400 ml-1">
                ({selected.length} ex.)
              </span>
            </h2>
          </div>

          {selected.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Dumbbell size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Adicione exercícios do catálogo</p>
              <button
                onClick={() => setActiveTab("catalog")}
                className="mt-3 text-purple-600 text-sm lg:hidden cursor-pointer"
              >
                Ver catálogo
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[60vh] lg:max-h-96 overflow-y-auto">
              {selected.map((ex, idx) => (
                <div key={ex.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <GripVertical
                      size={16}
                      className="text-gray-300 flex-shrink-0 cursor-grab"
                    />
                    <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{ex.name}</p>
                      <p className="text-xs text-gray-400">{ex.muscle}</p>
                    </div>
                    <button
                      onClick={() => removeExercise(ex.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Séries", field: "sets" as const },
                      { label: "Reps", field: "reps" as const },
                      { label: "Carga", field: "load" as const },
                      { label: "Desc.(s)", field: "rest" as const },
                    ].map(({ label, field }) => (
                      <div key={field}>
                        <label className="block text-xs text-gray-400 mb-1">
                          {label}
                        </label>
                        <input
                          value={ex[field]}
                          onChange={(e) =>
                            updateField(ex.id, field, e.target.value)
                          }
                          className="w-full px-2 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selected.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {selected.reduce((acc, e) => acc + parseInt(e.sets || "0"), 0)} séries totais
                </span>
                <span className="text-purple-600">~{selected.length * 8} min</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
