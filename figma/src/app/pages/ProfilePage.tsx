import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Camera, Save, User, Mail, Phone, Calendar, Target, Shield } from "lucide-react";

export function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("(11) 98765-4321");
  const [bio, setBio] = useState(
    user?.role === "personal"
      ? "Personal Trainer certificado CREF 012345-G/SP. Especialista em hipertrofia e emagrecimento funcional."
      : "Aluna focada em emagrecimento e qualidade de vida. Praticante há 6 meses."
  );

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-gray-900">Meu Perfil</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Visualize e edite seus dados
          </p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className={`px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
            editing
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          {editing ? "Cancelar" : "Editar"}
        </button>
      </div>

      {/* Profile card — horizontal on mobile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-white text-2xl">
              {user?.name.charAt(0)}
            </div>
            {editing && (
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-gray-700 transition-all">
                <Camera size={13} />
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-gray-900 text-lg truncate">{user?.name}</h2>
            <p className="text-gray-500 text-sm truncate">{user?.email}</p>
            <span
              className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${
                user?.role === "personal"
                  ? "bg-purple-50 text-purple-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {user?.role === "personal" ? "Personal Trainer" : "Aluno"}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-4 gap-2">
          {(user?.role === "personal"
            ? [
                { label: "Alunos", value: "12" },
                { label: "Treinos", value: "48" },
                { label: "Aval.", value: "34" },
                { label: "Anos exp.", value: "5" },
              ]
            : [
                { label: "Treinos", value: "24" },
                { label: "Sequência", value: "7d" },
                { label: "Aval.", value: "4" },
                { label: "Meses", value: "6" },
              ]
          ).map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-lg text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Personal data */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <h3 className="text-gray-900 text-base mb-4">Dados Pessoais</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
                <User size={13} className="text-gray-400" />
                Nome completo
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editing}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 disabled:text-gray-500 disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
                <Mail size={13} className="text-gray-400" />
                E-mail
              </label>
              <input
                value={user?.email}
                disabled
                className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-default text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
                <Phone size={13} className="text-gray-400" />
                Telefone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!editing}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 disabled:text-gray-500 disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
                <Calendar size={13} className="text-gray-400" />
                Data de nascimento
              </label>
              <input
                type="date"
                defaultValue="1999-05-14"
                disabled={!editing}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 disabled:text-gray-500 disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm transition-all"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
              <Target size={13} className="text-gray-400" />
              Bio / Especialização
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!editing}
              rows={3}
              className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 disabled:text-gray-500 disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <h3 className="text-gray-900 text-base mb-4">
          <div className="flex items-center gap-2">
            <Shield size={17} className="text-purple-500" />
            Segurança
          </div>
        </h3>
        <div className="space-y-3">
          {["Senha atual", "Nova senha", "Confirmar nova senha"].map((label) => (
            <div key={label}>
              <label className="block text-xs text-gray-600 mb-1.5">{label}</label>
              <input
                type="password"
                disabled={!editing}
                placeholder="••••••••"
                className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 disabled:text-gray-500 disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 text-sm transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <button
          onClick={() => setEditing(false)}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-sm cursor-pointer"
        >
          <Save size={16} />
          Salvar alterações
        </button>
      )}
    </div>
  );
}
