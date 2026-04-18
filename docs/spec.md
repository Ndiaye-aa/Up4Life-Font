# 📝 Functional Specification - Up4Life

## 1. Escopo do Sistema
O Up4Life deve gerenciar a relação técnica entre Personal e Aluno, focando em três pilares: Treino, Avaliação e Dashboard de Resultados.

---

## 2. Requisitos Funcionais (RF)

### RF01: Autenticação e Autorização (Épico 1)
* **Descrição:** Login via NextAuth.js com diferenciação de papéis.
* **Critérios de Aceite:**
    * Se `user.role === 'PERSONAL'`, redirecionar para `/dashboard/admin`.
    * Se `user.role === 'ALUNO'`, redirecionar para `/dashboard/aluno`.
    * Rotas `/alunos` e `/avaliacoes/nova` devem ser bloqueadas para a role `ALUNO`.

### RF02: Gestão de Alunos (Épico 2)
* **Acesso:** Apenas `PERSONAL`.
* **Funcionalidades:**
    * Listar alunos vinculados (Cards com foto, nome e última atividade).
    * Vincular novo aluno (via busca por e-mail ou convite).
    * Visualizar perfil individual do aluno com histórico de treinos.

### RF03: Módulo de Treinos (Épico 3)
* **Criação (Personal):** * Construtor de planilhas com: Nome do Exercício, Séries, Repetições, Carga e Descanso.
    * Botão para "Salvar e Enviar para o Aluno".
* **Execução (Aluno):**
    * Lista de exercícios do dia.
    * Checkbox de "Concluído" para cada exercício.
    * Timer de descanso integrado entre as séries.

### RF04: Avaliação Física e Gráficos (Épico 4)
* **Entrada de Dados:** Formulário para Peso, Altura, e Dobras Cutâneas (Peitoral, Axilar Média, Tricipital, Subescapular, Abdominal, Supra-ilíaca e Coxa).
* **Processamento:** * Cálculo automático de IMC.
    * Cálculo de % de Gordura (Protocolo Pollock 7 dobras).
* **Visualização:** Gráficos de linha mostrando a evolução do peso e % de gordura ao longo do tempo.

### RF05: Exportação de Resultados (Épico 5)
* **Descrição:** Gerar PDF profissional com o resumo da última avaliação.
* **Componente:** Usar `react-pdf` para montar o template com o logotipo Up4Life e os dados do aluno.

---

## 3. Regras de Negócio (RN)
* **RN01:** Um aluno só pode visualizar treinos que foram marcados como "Ativos" pelo Personal.
* **RN02:** Apenas o Personal vinculado ao aluno pode editar ou excluir os dados de avaliação desse aluno.
* **RN03:** Ao finalizar um treino, o sistema deve registrar a data e hora da conclusão para alimentar o gráfico de assiduidade do Dashboard.

---

## 4. Endpoints de API (Referência para Agentes)
* `POST /auth/login` - Autenticação de usuário.
* `GET /alunos` - Lista alunos do Personal logado.
* `POST /treinos` - Salva nova planilha de exercícios.
* `GET /treinos/meu-treino` - Retorna o treino atual do aluno logado.
* `POST /avaliacoes` - Registra dados antropométricos.

---

## 5. Casos de Uso Prioritários (UI/UX)
1. **UC01:** Personal cria um treino de "Membros Inferiores" para o Aluno X.
2. **UC02:** Aluno marca todas as séries como concluídas e clica em "Finalizar Treino".
3. **UC03:** Personal gera PDF da evolução mensal para apresentar ao Aluno durante a consultoria.