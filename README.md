# Up4Life — Frontend

Plataforma de gestão fitness que conecta **Personal Trainers** e **Alunos**. Permite prescrição de treinos, avaliações físicas antropométricas, acompanhamento de evolução e exportação de relatórios.

---

## Stack

| | |
|---|---|
| Framework | React 19 + Vite 8 |
| Linguagem | TypeScript (strict) |
| Roteamento | React Router DOM 7 |
| Estilização | Tailwind CSS 4 |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |
| Ícones | Lucide React |
| HTTP Client | Fetch (wrapper customizado) |

---

## Pré-requisitos

- Node.js 20+
- npm

---

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

---

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz com:

```env
VITE_API_URL=https://localhost:5173/
```

---

## Estrutura do Projeto

```
src/
├── @types/          # Interfaces TypeScript globais
├── components/
│   ├── layout/      # Shell, Navbar, ProtectedRoute, ErrorBoundary
│   ├── modules/     # Modais e drawers por domínio
│   └── ui/          # Componentes atômicos (TextField, etc.)
├── context/         # AuthContext (estado global de autenticação)
├── hooks/           # useAuth e outros hooks customizados
├── pages/           # Uma página por rota
├── services/        # Camada de API (um arquivo por domínio)
└── utils/           # Funções auxiliares puras
```

Consulte [docs/architecture.md](docs/architecture.md) para a documentação completa de arquitetura.

---

## Perfis de Usuário

| Role | Dashboard | Capacidades |
|---|---|---|
| `PERSONAL` | `/dashboard/admin` | Gerenciar alunos, criar treinos, registrar avaliações |
| `ALUNO` | `/dashboard/aluno` | Visualizar treinos atribuídos, histórico de avaliações |

---

## Funcionalidades

- **Autenticação** — Login por telefone + senha com diferenciação de roles
- **Gestão de Alunos** — Cadastro, listagem e drawer de detalhes
- **Treinos** — Construtor com catálogo de exercícios, edição e exportação PDF
- **Avaliações Físicas** — Formulário com cálculo automático de IMC, % gordura (Pollock 7 dobras) e IAC
- **Gráficos de Evolução** — Peso e % gordura ao longo do tempo (Recharts)
- **Perfil** — Edição de dados pessoais para ambas as roles

---

## Documentação

- [Arquitetura](docs/architecture.md) — Stack, estrutura de pastas, padrões de código
- [Especificação](docs/spec.md) — Requisitos funcionais, regras de negócio, endpoints

---

Desenvolvido por Adama Augusto Ndiaye — [LinkedIn](https://www.linkedin.com/in/adamaaugusto)
