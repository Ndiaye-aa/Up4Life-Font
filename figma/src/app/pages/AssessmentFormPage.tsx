import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, FileText, ChevronDown, ChevronUp } from "lucide-react";

const SECTIONS = [
  {
    id: "dados",
    title: "Dados do Aluno",
    fields: [
      { id: "student", label: "Aluno", type: "select", options: ["Ana Paula Santos", "Roberto Lima", "Jorge Pereira", "Mariana Costa"] },
      { id: "date", label: "Data da avaliação", type: "date" },
      { id: "weight", label: "Peso atual (kg)", type: "number", placeholder: "70.5" },
      { id: "height", label: "Altura (cm)", type: "number", placeholder: "165" },
    ],
  },
  {
    id: "perimetros",
    title: "Perímetros (cm)",
    fields: [
      { id: "chest", label: "Tórax", type: "number", placeholder: "95" },
      { id: "waist", label: "Cintura", type: "number", placeholder: "75" },
      { id: "abdomen", label: "Abdômen", type: "number", placeholder: "80" },
      { id: "hip", label: "Quadril", type: "number", placeholder: "95" },
      { id: "thigh", label: "Coxa (D/E)", type: "number", placeholder: "55" },
      { id: "calf", label: "Panturrilha", type: "number", placeholder: "36" },
      { id: "arm", label: "Braço contraído", type: "number", placeholder: "31" },
      { id: "forearm", label: "Antebraço", type: "number", placeholder: "24" },
    ],
  },
  {
    id: "dobras",
    title: "Dobras Cutâneas (mm)",
    fields: [
      { id: "triceps_fold", label: "Tríceps", type: "number", placeholder: "12" },
      { id: "subscapular", label: "Subescapular", type: "number", placeholder: "14" },
      { id: "suprailiac", label: "Supra-ilíaca", type: "number", placeholder: "16" },
      { id: "abdominal_fold", label: "Abdominal", type: "number", placeholder: "20" },
      { id: "thigh_fold", label: "Coxa", type: "number", placeholder: "18" },
      { id: "chest_fold", label: "Peitoral", type: "number", placeholder: "10" },
      { id: "axillary", label: "Axilar Média", type: "number", placeholder: "13" },
    ],
  },
];

export function AssessmentFormPage() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string[]>(["dados", "perimetros", "dobras"]);
  const [values, setValues] = useState<Record<string, string>>({
    student: "Ana Paula Santos",
    date: "2026-04-15",
  });

  const toggle = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleChange = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-gray-900">Nova Avaliação</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Insira as medidas para calcular os índices
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-5">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-all cursor-pointer flex-1 justify-center">
          <FileText size={14} />
          <span className="hidden sm:inline">Exportar PDF</span>
          <span className="sm:hidden">PDF</span>
        </button>
        <button
          onClick={() => navigate("/avaliacoes/resultados")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-800 transition-all cursor-pointer flex-1 justify-center"
        >
          <Save size={14} />
          Calcular & Salvar
        </button>
      </div>

      {/* Preview badge - 2x2 on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
        {[
          { label: "IMC", value: "22.8", status: "Normal", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
          { label: "% Gordura", value: "24.3%", status: "Adequado", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
          { label: "IAC", value: "28.7", status: "Normal", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
          { label: "Massa Magra", value: "51.2 kg", status: "Calculado", color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} border rounded-xl p-3 text-center`}>
            <p className={`text-lg ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className={`text-xs ${item.color} mt-0.5`}>{item.status}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const isOpen = expanded.includes(section.id);
          return (
            <div
              key={section.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggle(section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <h2 className="text-gray-900 text-base">{section.title}</h2>
                {isOpen ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-50">
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
                    {section.fields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-xs text-gray-600 mb-1.5">
                          {field.label}
                        </label>
                        {field.type === "select" ? (
                          <select
                            value={values[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm cursor-pointer"
                          >
                            {field.options?.map((opt) => (
                              <option key={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={values[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Observation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mt-3">
        <h2 className="text-gray-900 text-base mb-3">Observações</h2>
        <textarea
          rows={3}
          placeholder="Observações gerais sobre a avaliação, condições do dia, etc..."
          className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm resize-none"
        />
      </div>

      <div className="mt-5">
        <button
          onClick={() => navigate("/avaliacoes/resultados")}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-sm cursor-pointer"
        >
          <Save size={16} />
          Calcular & Visualizar Resultados
        </button>
      </div>
    </div>
  );
}
