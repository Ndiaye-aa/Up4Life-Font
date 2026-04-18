import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { PersonalDashboard } from "./pages/PersonalDashboard";
import { StudentProfilePage } from "./pages/StudentProfilePage";
import { WorkoutCreatorPage } from "./pages/WorkoutCreatorPage";
import { WorkoutPlayerPage } from "./pages/WorkoutPlayerPage";
import { AssessmentFormPage } from "./pages/AssessmentFormPage";
import { AssessmentResultsPage } from "./pages/AssessmentResultsPage";
import { StudentDashboardPage } from "./pages/StudentDashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { WorkoutsListPage } from "./pages/WorkoutsListPage";
import { AssessmentsListPage } from "./pages/AssessmentsListPage";
import { StudentWorkoutsPage } from "./pages/StudentWorkoutsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: PersonalDashboard },
      { path: "alunos/:id", Component: StudentProfilePage },
      { path: "treinos", Component: WorkoutsListPage },
      { path: "treinos/criar", Component: WorkoutCreatorPage },
      { path: "treinos/player", Component: WorkoutPlayerPage },
      { path: "avaliacoes", Component: AssessmentsListPage },
      { path: "avaliacoes/nova", Component: AssessmentFormPage },
      { path: "avaliacoes/resultados", Component: AssessmentResultsPage },
      { path: "aluno/inicio", Component: StudentDashboardPage },
      { path: "aluno/treinos", Component: StudentWorkoutsPage },
      { path: "perfil", Component: ProfilePage },
    ],
  },
]);