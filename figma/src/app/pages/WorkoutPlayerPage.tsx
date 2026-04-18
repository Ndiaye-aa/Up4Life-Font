import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Timer,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Dumbbell,
  Flame,
} from "lucide-react";

const EXERCISES = [
  { id: 1, name: "Supino Reto com Barra", muscle: "Peito", sets: 4, reps: 12, load: "60kg", rest: 90 },
  { id: 2, name: "Crucifixo Inclinado", muscle: "Peito", sets: 3, reps: 15, load: "14kg", rest: 60 },
  { id: 3, name: "Tríceps Pulley", muscle: "Tríceps", sets: 3, reps: 15, load: "25kg", rest: 60 },
  { id: 4, name: "Tríceps Francês", muscle: "Tríceps", sets: 3, reps: 12, load: "20kg", rest: 60 },
  { id: 5, name: "Peck Deck", muscle: "Peito", sets: 3, reps: 15, load: "40kg", rest: 60 },
];

export function WorkoutPlayerPage() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<number, number>>({});
  const [timer, setTimer] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [finished, setFinished] = useState(false);

  const current = EXERCISES[currentIdx];
  const doneExercises = EXERCISES.filter(
    (e) => (completedSets[e.id] || 0) >= e.sets
  ).length;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timer !== null && timer > 0) {
      interval = setInterval(() => setTimer((t) => (t !== null ? t - 1 : null)), 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const completeSet = () => {
    const newCount = (completedSets[current.id] || 0) + 1;
    setCompletedSets((prev) => ({ ...prev, [current.id]: newCount }));
    if (newCount < current.sets) {
      setTimer(current.rest);
      setTimerActive(true);
    }
  };

  const allDone = doneExercises === EXERCISES.length;

  if (finished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
            <Trophy size={40} className="text-white" />
          </div>
          <h1 className="text-gray-900 text-3xl mb-3">Treino Concluído!</h1>
          <p className="text-gray-500 mb-2">
            Você completou todos os {EXERCISES.length} exercícios.
          </p>
          <p className="text-purple-600 mb-8">Excelente trabalho, Ana Paula! 💪</p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Exercícios", value: EXERCISES.length },
              { label: "Séries", value: EXERCISES.reduce((a, e) => a + e.sets, 0) },
              { label: "Minutos", value: "48" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <p className="text-2xl text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/aluno/inicio")}
            className="w-full py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-sm cursor-pointer"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">Treino A – Peito e Tríceps</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${(doneExercises / EXERCISES.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {doneExercises}/{EXERCISES.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-orange-500 flex-shrink-0">
            <Flame size={16} />
            <span className="text-sm">48 kcal</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Exercise navigation pills */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 -mx-4 px-4">
          {EXERCISES.map((ex, i) => {
            const done = (completedSets[ex.id] || 0) >= ex.sets;
            const isCurrent = i === currentIdx;
            return (
              <button
                key={ex.id}
                onClick={() => setCurrentIdx(i)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-gray-900 text-white"
                    : done
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-white text-gray-500 border border-gray-200"
                }`}
              >
                {done ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Current exercise card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-start justify-between mb-5">
            <div>
              <span className="text-xs text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                {current.muscle}
              </span>
              <h2 className="text-gray-900 mt-2 text-xl">{current.name}</h2>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Dumbbell size={22} className="text-gray-400" />
            </div>
          </div>

          {/* Sets info */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="text-center bg-gray-50 rounded-xl p-3">
              <p className="text-2xl text-gray-900">{current.sets}</p>
              <p className="text-xs text-gray-400 mt-0.5">Séries</p>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-3">
              <p className="text-2xl text-gray-900">{current.reps}</p>
              <p className="text-xs text-gray-400 mt-0.5">Reps</p>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-3">
              <p className="text-xl text-gray-900">{current.load}</p>
              <p className="text-xs text-gray-400 mt-0.5">Carga</p>
            </div>
          </div>

          {/* Sets checkboxes */}
          <div className="mb-5">
            <p className="text-sm text-gray-500 mb-3">Séries concluídas:</p>
            <div className="flex gap-2">
              {Array.from({ length: current.sets }).map((_, i) => {
                const done = i < (completedSets[current.id] || 0);
                return (
                  <div
                    key={i}
                    className={`flex-1 py-4 rounded-xl border-2 flex items-center justify-center transition-all ${
                      done
                        ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                        : "border-gray-200 text-gray-300"
                    }`}
                  >
                    {done ? <CheckCircle2 size={20} /> : <span className="text-sm">{i + 1}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rest timer */}
          {timer !== null && (
            <div
              className={`mb-5 rounded-xl p-4 text-center ${
                timerActive ? "bg-amber-50 border border-amber-200" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Timer
                  size={16}
                  className={timerActive ? "text-amber-500" : "text-gray-400"}
                />
                <span
                  className={`text-sm ${timerActive ? "text-amber-600" : "text-gray-500"}`}
                >
                  {timerActive ? "Descansando..." : "Descanso concluído"}
                </span>
              </div>
              <p
                className={`text-4xl font-mono ${timerActive ? "text-amber-600" : "text-gray-400"}`}
              >
                {timer}s
              </p>
            </div>
          )}

          {/* Action button */}
          {(completedSets[current.id] || 0) >= current.sets ? (
            <div className="w-full py-4 rounded-xl bg-emerald-500 text-white flex items-center justify-center gap-2 text-sm">
              <CheckCircle2 size={18} />
              Exercício Concluído!
            </div>
          ) : (
            <button
              onClick={completeSet}
              disabled={timerActive}
              className="w-full py-4 rounded-xl bg-gray-900 text-white flex items-center justify-center gap-2 text-sm hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <CheckCircle2 size={18} />
              Concluir Série {(completedSets[current.id] || 0) + 1} de {current.sets}
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          {currentIdx < EXERCISES.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((i) => Math.min(EXERCISES.length - 1, i + 1))}
              className="flex-1 py-3.5 rounded-xl bg-gray-100 text-sm text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Próximo
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => setFinished(true)}
              className={`flex-1 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                allDone
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <Trophy size={16} />
              Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
