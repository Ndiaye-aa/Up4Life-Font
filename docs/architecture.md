# Architecture - Up4Life Frontend

## 1. Visão Geral

O **Up4Life** é uma SPA (Single Page Application) de gestão fitness que conecta Personal Trainers e Alunos. O frontend consome uma API REST (NestJS + PostgreSQL) hospedada em `https://up4life-back.onrender.com`.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | React | 19.x |
| Linguagem | TypeScript (strict) | 6.x |
| Build Tool | Vite | 8.x |
| Roteamento | React Router DOM | 7.x |
| Estilização | Tailwind CSS | 4.x |
| Formulários | React Hook Form + Zod | 7.x / 4.x |
| Gráficos | Recharts | 3.x |
| Ícones | Lucide React | 1.x |
| HTTP Client | Fetch nativo (wrapper customizado) | — |

> **Nota:** O projeto **não usa** Axios, NextAuth, Redux, React Query ou TanStack Query. Gerenciamento de estado assíncrono é feito com `useState` + `useEffect` diretamente nas páginas.

---

## 3. Controle de Acesso (RBAC)

O sistema possui duas roles distintas com rotas e dashboards separados:

| Role | Rota Base | Acesso |
|---|---|---|
| `PERSONAL` | `/dashboard/admin` | Dashboard de alunos, Treinos, Avaliações, Perfil |
| `ALUNO` | `/dashboard/aluno` | Treinos atribuídos, Histórico de avaliações, Perfil |

O componente `ProtectedRoute` verifica a role do usuário autenticado e redireciona para o dashboard correto caso haja acesso não autorizado.

---

## 4. Autenticação

- **Mecanismo:** JWT armazenado em `localStorage` com a chave `up4life.auth.user`
- **Provider:** `AuthContext` (`src/context/AuthContext.tsx`) expõe `user`, `isAuthenticated`, `login()`, `logout()`
- **Hook:** `useAuth()` (`src/hooks/useAuth.ts`) consome o contexto e dispara redirect para `/login` se não autenticado
- **Entry point:** `main.tsx` envolve a aplicação com `<AuthProvider>` dentro de `<BrowserRouter>`

**Fluxo de Login:**
```
LoginPage → loginService() → POST /auth/login → JWT salvo no localStorage → redirect por role
```

---

## 5. Estrutura de Pastas

```
src/
├── @types/              # Interfaces e tipos globais TypeScript
│   ├── auth.ts          # UserRole, AuthUser, LoginPayload
│   ├── student.ts       # StudentRecord, CreateStudentPayload
│   └── workout.ts       # WorkoutRecord, ExerciseEntry, WorkoutCategory
├── assets/              # Recursos estáticos (imagens, SVGs)
├── components/
│   ├── layout/          # Estruturas de página
│   │   ├── AuthSplitLayout.tsx     # Layout de 2 colunas para login
│   │   ├── DashboardShell.tsx      # Sidebar + topbar + outlet
│   │   ├── DashboardNav.tsx        # Navegação desktop/mobile
│   │   ├── ErrorBoundary.tsx       # Error boundary global
│   │   └── ProtectedRoute.tsx      # Guard de role-based access
│   ├── modules/
│   │   └── admin/                  # Modais e drawers do Personal
│   │       ├── NewStudentModal.tsx
│   │       ├── NewWorkoutModal.tsx
│   │       ├── NewExerciseModal.tsx
│   │       └── StudentDetailDrawer.tsx
│   └── ui/              # Componentes atômicos reutilizáveis
│       ├── TextField.tsx
│       └── RoleSegmentedControl.tsx
├── context/
│   └── AuthContext.tsx  # Auth state global + provider
├── hooks/
│   └── useAuth.ts       # Hook de autenticação com auto-redirect
├── pages/               # Páginas (uma por rota)
│   ├── LoginPage.tsx
│   ├── AdminDashboardPage.tsx
│   ├── AdminWorkoutsPage.tsx
│   ├── AdminAssessmentsPage.tsx
│   ├── AdminNewAssessmentPage.tsx
│   ├── AdminAssessmentResultsPage.tsx
│   ├── AdminProfilePage.tsx
│   ├── StudentDashboardPage.tsx
│   ├── StudentWorkoutsPage.tsx
│   ├── StudentAssessmentsPage.tsx
│   ├── StudentProfilePage.tsx
│   └── NotFoundPage.tsx
├── services/            # Camada de API (uma por domínio)
│   ├── api.ts           # HTTP client base com auth e timeout
│   ├── auth.ts          # Login
│   ├── students.ts      # CRUD de alunos
│   ├── workouts.ts      # CRUD de treinos + normalização
│   ├── assessments.ts   # CRUD de avaliações + cálculos
│   └── exercises.ts     # Catálogo de exercícios
├── utils/               # Funções auxiliares puras
│   ├── dashboardNav.ts  # Gerador de itens de menu por role
│   ├── formatDate.ts    # Formatação de datas (BR)
│   ├── workoutPdf.ts    # Exportação de treino para PDF/impressão
│   └── exerciseCatalog.ts
├── App.tsx              # Definição de rotas
└── main.tsx             # Entry point com providers
```

---

## 6. Roteamento

```
/ → redirect /login

/login                               (público)

/dashboard/admin                     (role: PERSONAL)
  ├── /                              AdminDashboardPage
  ├── /treinos                       AdminWorkoutsPage
  ├── /avaliacoes                    AdminAssessmentsPage
  ├── /avaliacoes/nova               AdminNewAssessmentPage
  ├── /avaliacoes/resultados         AdminAssessmentResultsPage
  └── /perfil                        AdminProfilePage

/dashboard/aluno                     (role: ALUNO)
  ├── /                              StudentDashboardPage
  ├── /treinos                       StudentWorkoutsPage
  ├── /avaliacoes                    StudentAssessmentsPage
  └── /perfil                        StudentProfilePage

*                                    NotFoundPage
```

---

## 7. Camada de Serviços

O arquivo `src/services/api.ts` é o HTTP client base:
- Lê o token do `localStorage` e injeta `Authorization: Bearer {token}` em cada requisição
- Timeout de 30 segundos via `AbortController`
- Trata erro 401 → limpa storage e redireciona para `/login`
- Extrai mensagem de erro do corpo da resposta do backend

Cada arquivo de serviço (`workouts.ts`, `assessments.ts`, etc.) usa este cliente e é responsável pela **normalização dos dados** (mapeamento de campos snake_case do backend para os tipos TypeScript do frontend).

---

## 8. Padrões de Código

### Componentes
```tsx
export const ComponentName: React.FC<Props> = ({ prop }) => { ... }
```
- Named exports obrigatórios
- Dividir em sub-componentes se exceder 200 linhas

### Formulários
```tsx
const schema = z.object({ field: z.string().min(1) })
const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) })
```

### Modais e Drawers
- Posicionamento `fixed` com backdrop `bg-black/40`
- Fechar com `Escape` via `useEffect` + `keydown`
- Fechar ao clicar no backdrop

### Exportação de PDF
- `workoutPdf.ts` gera HTML com estilos inline, abre em nova aba e aciona `window.print()`

---

## 9. Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API (`https://up4life-back.onrender.com`) |
