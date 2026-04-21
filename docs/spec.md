# Functional Specification - Up4Life

## 1. Escopo

O Up4Life gerencia a relação técnica entre Personal Trainers e Alunos com foco em três domínios: **Treinos**, **Avaliações Físicas** e **Dashboards de Acompanhamento**.

---

## 2. Autenticação (RF01)

**Acesso:** Público

- Login via telefone + senha + seleção de role (`PERSONAL` / `ALUNO`)
- Validação com Zod: telefone com máscara `(XX) XXXXX-XXXX`, senha mínima de 6 caracteres
- Endpoint: `POST /auth/login`
- Resposta: `access_token` + dados do usuário
- Armazenamento: JWT em `localStorage` → `up4life.auth.user`
- Redirecionamento pós-login:
  - `PERSONAL` → `/dashboard/admin`
  - `ALUNO` → `/dashboard/aluno`
- Rotas protegidas por `ProtectedRoute` com verificação de role

---

## 3. Dashboard do Personal (RF02)

**Acesso:** `PERSONAL`  
**Rota:** `/dashboard/admin`

- Lista de alunos vinculados com nome, telefone, sexo e data de nascimento
- Campo de busca por nome
- Botão "Novo Aluno" abre `NewStudentModal`
- Clique no card do aluno abre `StudentDetailDrawer` (drawer lateral) com:
  - Dados pessoais do aluno
  - Último treino atribuído
  - Última avaliação
- Métricas do dashboard: total de alunos, total de treinos, total de avaliações

---

## 4. Gestão de Alunos (RF03)

**Acesso:** `PERSONAL`

**Cadastro:**
- Modal `NewStudentModal` com validação Zod
- Campos: nome, telefone, data de nascimento, sexo (`M` / `F`)
- Endpoint: `POST /alunos`

**Listagem:**
- Endpoint: `GET /alunos`
- Retorna apenas os alunos vinculados ao Personal autenticado (JWT)

---

## 5. Módulo de Treinos (RF04)

**Acesso:** `PERSONAL` (criação/edição) e `ALUNO` (visualização)

### Personal — `/dashboard/admin/treinos`

- Grade de cards com todos os treinos criados pelo Personal
- Cada card exibe: objetivo, aluno vinculado, categoria, data de criação
- Ações por card: Editar, Exportar PDF, Excluir
- Botão "Novo Treino" abre `NewWorkoutModal`

**Modal de Treino (`NewWorkoutModal`):**
- Aba **Catálogo**: busca de exercícios por nome, seleção para adicionar ao plano
- Aba **Plano de Treino**: lista de exercícios selecionados com campos editáveis:
  - Séries, Repetições, Carga (kg), Descanso (s), Observação
- Campos do treino: Objetivo, Aluno vinculado, Categoria, Observação
- Suporte a modo de edição (pré-popula os campos)
- Endpoints:
  - `POST /treinos` — criar treino
  - `PATCH /treinos/:id` — editar treino
  - `DELETE /treinos/:id` — excluir treino

**Exportação de PDF:**
- `exportWorkoutPdf(workout)`: gera ficha de treino e aciona impressão no navegador

### Aluno — `/dashboard/aluno/treinos`

- Lista de treinos atribuídos ao aluno logado
- Endpoint: `GET /treinos/meu-treino`
- Modal de visualização com tabela de exercícios (séries, reps, carga, descanso)

---

## 6. Avaliação Física (RF05)

**Acesso:** `PERSONAL` (criar) e `ALUNO` (visualizar)

### Criar Avaliação — `/dashboard/admin/avaliacoes/nova`

**Campos (com validação Zod):**

| Campo | Tipo |
|---|---|
| Aluno | Seleção |
| Data | Data (padrão: hoje) |
| Peso | Número (kg) |
| Altura | Número (cm) |
| Gordura visceral | Número |
| Circunferências | Peito, Cintura, Quadril, Braço D/E, Coxa D/E, Panturrilha D/E |
| Dobras cutâneas | Peitoral, Axilar Média, Tricipital, Subescapular, Abdominal, Supra-ilíaca, Coxa |
| Teste de força | Flexão de braço (reps), Abdominal (reps) |

**Cálculos automáticos em tempo real:**
- **IMC:** `peso / (altura_m²)` — classificação automática (Abaixo do peso → Obeso III)
- **% Gordura:** Protocolo Pollock 7 dobras com equação específica por sexo
- **IAC (Índice de Adiposidade Corporal):** `(quadril_cm / (altura_m^1.5)) - 18`

Endpoint: `POST /avaliacoes`

### Histórico de Avaliações — `/dashboard/admin/avaliacoes`

- Lista de todas as avaliações com filtro por aluno
- Clique em avaliação navega para resultados detalhados

### Resultados da Avaliação — `/dashboard/admin/avaliacoes/resultados`

- Gráficos de linha (Recharts): evolução de peso e % gordura ao longo do tempo
- Tabela comparativa de circunferências (atual vs anterior)
- Indicadores de tendência (melhora/piora)

### Histórico do Aluno — `/dashboard/aluno/avaliacoes`

- Mesma visão de gráficos e comparativos, mas restrita aos dados do aluno logado

---

## 7. Perfis (RF06)

**Personal — `/dashboard/admin/perfil`**
- Visualizar e editar: nome, telefone, bio
- Alterar senha (campo separado)
- Modo de visualização / modo de edição

**Aluno — `/dashboard/aluno/perfil`**
- Visualizar e editar: nome, telefone, data de nascimento, objetivo
- Modo de visualização / modo de edição

---

## 8. Catálogo de Exercícios (RF07)

**Acesso:** `PERSONAL`

- Modal `NewExerciseModal` para adicionar exercício ao catálogo global
- Exercícios usados no construtor de treinos (`NewWorkoutModal`)
- Endpoint: `POST /exercicios`

---

## 9. Endpoints de API

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/auth/login` | Autenticação |
| `GET` | `/alunos` | Lista alunos do Personal |
| `POST` | `/alunos` | Cadastra novo aluno |
| `GET` | `/treinos` | Lista treinos do Personal |
| `POST` | `/treinos` | Cria novo treino |
| `PATCH` | `/treinos/:id` | Atualiza treino |
| `DELETE` | `/treinos/:id` | Remove treino |
| `GET` | `/treinos/meu-treino` | Treinos do aluno logado |
| `POST` | `/avaliacoes` | Registra avaliação |
| `GET` | `/avaliacoes` | Lista avaliações |
| `GET` | `/exercicios` | Catálogo de exercícios |
| `POST` | `/exercicios` | Adiciona exercício ao catálogo |

---

## 10. Regras de Negócio

- **RN01:** Um aluno só visualiza treinos que lhe foram atribuídos pelo Personal.
- **RN02:** Apenas o Personal vinculado ao aluno pode criar, editar ou excluir avaliações desse aluno.
- **RN03:** O backend deve filtrar treinos pelo `id` do Personal autenticado via JWT — o filtro no frontend é uma camada adicional, não a fonte de verdade.
- **RN04:** Cálculos de IMC, % gordura e IAC são realizados no frontend em tempo real durante o preenchimento do formulário.
- **RN05:** A exportação de PDF é gerada inteiramente no cliente (sem chamada ao backend).

---

## 11. Casos de Uso Prioritários

| ID | Ator | Fluxo |
|---|---|---|
| UC01 | Personal | Cria treino "Membros Inferiores" para um aluno via `NewWorkoutModal`, busca exercícios no catálogo, define séries/reps/carga e salva |
| UC02 | Personal | Registra avaliação antropométrica com dobras cutâneas, visualiza IMC e % gordura calculados em tempo real |
| UC03 | Personal | Acessa histórico de avaliações de um aluno e visualiza gráfico de evolução de peso e gordura |
| UC04 | Aluno | Visualiza treino do dia com tabela de exercícios completa |
| UC05 | Personal | Exporta ficha de treino em PDF para entregar ao aluno |
