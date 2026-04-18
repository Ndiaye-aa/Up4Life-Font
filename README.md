🚀 Up4Life - Frontend
O Up4Life é uma plataforma de gestão fitness desenvolvida para otimizar a conexão entre Personal Trainers e seus alunos. O sistema centraliza a prescrição de treinos, a realização de avaliações físicas e o acompanhamento nutricional, oferecendo uma experiência de alta performance tanto para o gestor quanto para o cliente final.

🛠️ Stack Tecnológica
Framework: ReactJS
Estilização: Tailwind CSS
Autenticação: NextAuth.js
Banco de Dados: PostgreSQL (via API NestJS)
Gráficos:
Relatórios: React-PDF
🗺️ User Flows (Fluxos do Usuário)
O sistema possui inteligência de acesso baseada em Roles (Papéis), adaptando a interface conforme o perfil logado:

👔 Perfil: Personal (Admin)
Foco: Gestão de carteira de clientes e prescrição técnica.

Dashboard: Visão geral da base de alunos.
Módulo Alunos: Listagem e seleção de alunos para ações específicas (criar treino/avaliação).
Módulo Treino: Criação, edição e exportação de planilhas de exercícios.
Módulo Avaliação: Inserção de dados antropométricos e acompanhamento da evolução.
Perfil: Gestão de dados profissionais.
🏋️ Perfil: Aluno (User)
Foco: Autogestão e acompanhamento de resultados.

Dashboard: Acesso rápido ao plano de treino e última avaliação.
Treino: Visualização das séries, marcação de exercícios concluídos e finalização de sessão.
Avaliação: Consulta de histórico por data e download de resultados em PDF.
Perfil: Visualização de dados pessoais.
📱 Telas do Sistema
Tela	Descrição	Acesso
Login	Autenticação e diferenciação de acesso.	Público
Tela Inicial	Dashboard com indicadores e atalhos rápidos.	Ambos
Alunos	Gestão de vínculo e lista de clientes ativos.	Personal
Treino	Construtor e visualizador de planilhas de exercícios.	Ambos
Avaliação	Registro e visualização de evolução física (gráficos).	Ambos
Perfil	Central de informações do usuário.	Ambos
🏗️ Roadmap de Desenvolvimento (Épicos)
 Épico 1: Fundação (Setup + Login + Roles)
 Épico 2: Gestão (Cadastro e Vínculo de Alunos)
 Épico 3: Produto (Módulo de Treinos e Conclusão de Exercícios)
 Épico 4: Análise (Avaliação Física e Gráficos de Evolução)
 Épico 5: Identidade & Entrega (Perfil e Exportação PDF)
⚙️ Instalação e Configuração
Clone o repositório:

git clone https://github.com/Ndiaye-aa/Up4Life-Font.git
Instale as dependências:

npm install
Variáveis de Ambiente: Crie um arquivo .env.local e configure as chaves de API e Autenticação:

NEXT_PUBLIC_API_URL=http://localhost:3333
NEXTAUTH_SECRET=sua_chave_secreta
Rode o projeto:

npm run dev
📝 Padrão de Commits
Este repositório utiliza o padrão Conventional Commits:

feat: Nova funcionalidade.
fix: Correção de erro.
docs: Alteração em documentação.
style: Formatação e estilo visual (Tailwind).
refactor: Mudança no código que não altera funcionalidade.
Desenvolvido por Adama Augusto Nidaye | www.linkedin.com/in/adamaaugusto