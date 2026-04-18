# 🏗️ Architecture - Up4Life Frontend

## 1. Visão Geral do Projeto
O **Up4Life** é uma plataforma de gestão fitness voltada para a conexão entre Personal Trainers e Alunos. O sistema é um ecossistema de alta performance para prescrição de treinos, avaliações físicas e acompanhamento de resultados.

## 2. Stack Tecnológica
* **Framework:** ReactJS (Vite)
* **Estilização:** Tailwind CSS (Arquitetura Utilitária / Mobile-first)
* **Autenticação:** NextAuth.js
* **Consumo de API:** Axios (Base URL configurada via `.env.local`)
* **Banco de Dados:** PostgreSQL (Interface via API NestJS)
* **Gráficos & Relatórios:** Bibliotecas de gráficos dinâmicos e React-PDF para exportação.

## 3. Controle de Acesso (RBAC)
O sistema opera com inteligência de acesso baseada em **Roles**. O contexto da aplicação deve injetar as permissões globalmente:

* **Role [PERSONAL]:** Acesso aos módulos de gestão (Dashboard de Alunos, Construtor de Treinos, Registro de Avaliações).
* **Role [ALUNO]:** Acesso aos módulos de consumo (Visualização de Treino, Check-in de exercícios, Histórico de Avaliações).

## 4. Estrutura de Pastas (Padrão de Projeto)
Para manter a consistência, todos os agentes devem seguir esta árvore:

```text
src/
├── @types/          # Definições de interfaces TypeScript globais
├── assets/          # Recursos estáticos (imagens, svgs)
├── components/      # Componentes React
│   ├── ui/          # Elementos atômicos (Button, Input, Modal)
│   ├── layout/      # Estruturas de página (Sidebar, Navbar, Wrapper)
│   └── modules/     # Componentes complexos (Formulário de Treino, Gráfico de Evolução)
├── hooks/           # Hooks customizados e lógica reutilizável
├── pages/           # Views principais e roteamento
├── services/        # Configurações do Axios e endpoints da API
├── store/           # Context API ou gerenciamento de estado global
└── utils/           # Funções auxiliares (Formatadores, Cálculos de IMC)