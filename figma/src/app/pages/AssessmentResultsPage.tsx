import { useNavigate } from "react-router";
import {
  ArrowLeft,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Scale,
  Heart,
  Dumbbell,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const EVOLUTION_DATA = [
  { month: "Nov", weight: 68.5, bodyFat: 27.2, muscle: 48.1 },
  { month: "Dez", weight: 67.2, bodyFat: 26.1, muscle: 48.8 },
  { month: "Jan", weight: 66.8, bodyFat: 25.5, muscle: 49.2 },
  { month: "Fev", weight: 65.5, bodyFat: 25.0, muscle: 50.1 },
  { month: "Mar", weight: 64.9, bodyFat: 24.8, muscle: 50.8 },
  { month: "Abr", weight: 64.2, bodyFat: 24.3, muscle: 51.2 },
];

const METRICS = [
  {
    label: "IMC",
    value: "22.8",
    unit: "kg/m²",
    status: "Normal",
    statusColor: "text-emerald-600",
    statusBg: "bg-emerald-50",
    icon: Scale,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
    trend: -0.4,
    range: "18.5 – 24.9",
    progress: 62,
    progressColor: "bg-emerald-500",
  },
  {
    label: "% Gordura",
    value: "24.3",
    unit: "%",
    status: "Adequado",
    statusColor: "text-emerald-600",
    statusBg: "bg-emerald-50",
    icon: Activity,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    trend: -2.9,
    range: "20% – 30% (F)",
    progress: 55,
    progressColor: "bg-blue-500",
  },
  {
    label: "IAC",
    value: "28.7",
    unit: "",
    status: "Normal",
    statusColor: "text-emerald-600",
    statusBg: "bg-emerald-50",
    icon: Heart,
    iconColor: "text-pink-600",
    iconBg: "bg-pink-50",
    trend: -1.2,
    range: "21% – 33% (F)",
    progress: 68,
    progressColor: "bg-pink-500",
  },
  {
    label: "Massa Magra",
    value: "51.2",
    unit: "kg",
    status: "Ótimo",
    statusColor: "text-purple-600",
    statusBg: "bg-purple-50",
    icon: Dumbbell,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    trend: +3.1,
    range: "Referência pessoal",
    progress: 80,
    progressColor: "bg-purple-500",
  },
];

const PERIMETROS = [
  { label: "Tórax", value: "92 cm", prev: "95 cm", diff: -3 },
  { label: "Cintura", value: "73 cm", prev: "77 cm", diff: -4 },
  { label: "Abdômen", value: "78 cm", prev: "83 cm", diff: -5 },
  { label: "Quadril", value: "96 cm", prev: "98 cm", diff: -2 },
  { label: "Coxa D", value: "54 cm", prev: "56 cm", diff: -2 },
  { label: "Braço D", value: "31 cm", prev: "30 cm", diff: +1 },
];

export function AssessmentResultsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-gray-900">Resultados</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Ana Paula Santos · 15/04/2026
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-all cursor-pointer flex-shrink-0">
          <FileText size={14} />
          <span className="hidden sm:inline">Exportar PDF</span>
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`${m.iconBg} p-2 rounded-xl`}>
                <m.icon size={16} className={m.iconColor} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs ${
                  m.trend < 0 ? "text-emerald-600" : m.trend > 0 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {m.trend < 0 ? (
                  <TrendingDown size={13} />
                ) : m.trend > 0 ? (
                  <TrendingUp size={13} />
                ) : (
                  <Minus size={13} />
                )}
                {Math.abs(m.trend)}
                {m.unit}
              </div>
            </div>
            <p className="text-2xl text-gray-900">
              {m.value}
              <span className="text-xs text-gray-400 ml-1">{m.unit}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
            <div className="mt-2">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${m.progressColor} rounded-full`}
                  style={{ width: `${m.progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${m.statusBg} ${m.statusColor}`}>
                {m.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts — stacked on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Weight & Body Fat */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-gray-900 mb-0.5 text-base">Peso & % Gordura</h2>
          <p className="text-xs text-gray-400 mb-4">Últimos 6 meses</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={EVOLUTION_DATA} id="chart-weight-fat">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} width={30} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line
                type="monotone"
                dataKey="weight"
                name="Peso (kg)"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3, fill: "#8b5cf6" }}
              />
              <Line
                type="monotone"
                dataKey="bodyFat"
                name="% Gordura"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3, fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Muscle mass */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-gray-900 mb-0.5 text-base">Massa Muscular</h2>
          <p className="text-xs text-gray-400 mb-4">Últimos 6 meses</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={EVOLUTION_DATA} id="chart-muscle">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} width={30} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line
                type="monotone"
                dataKey="muscle"
                name="Massa magra (kg)"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3, fill: "#10b981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Perimeters comparison */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-gray-900 text-base">Comparativo de Perímetros</h2>
          <p className="text-xs text-gray-400 mt-0.5">Atual vs. avaliação anterior</p>
        </div>
        <div className="divide-y divide-gray-50">
          {PERIMETROS.map((p) => (
            <div key={p.label} className="flex items-center gap-3 px-4 py-3">
              <span className="text-sm text-gray-600 w-20 flex-shrink-0">{p.label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full"
                  style={{ width: `${Math.min(100, (parseFloat(p.value) / 120) * 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm text-gray-900">{p.value}</span>
                <span
                  className={`text-xs ${
                    p.diff < 0 ? "text-emerald-600" : "text-blue-600"
                  }`}
                >
                  {p.diff > 0 ? "+" : ""}
                  {p.diff}cm
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}