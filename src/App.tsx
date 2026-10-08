import { lazy, Suspense, type ComponentType, type ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/layout/ErrorBoundary'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'

// Páginas carregadas sob demanda: o chunk inicial fica só com login + shell.
const lazyPage = (loader: () => Promise<Record<string, unknown>>, name: string) =>
  lazy(() => loader().then((module) => ({ default: module[name] as ComponentType })))

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-canvas">
    <div className="h-6 w-6 animate-spin rounded-full border-4 border-accent border-t-transparent" />
  </div>
)

const AdminDashboardPage = lazyPage(() => import('./pages/AdminDashboardPage'), 'AdminDashboardPage')
const AdminStudentsPage = lazyPage(() => import('./pages/AdminStudentsPage'), 'AdminStudentsPage')
const AdminStudentDetailPage = lazyPage(() => import('./pages/AdminStudentDetailPage'), 'AdminStudentDetailPage')
const AdminWorkoutsPage = lazyPage(() => import('./pages/AdminWorkoutsPage'), 'AdminWorkoutsPage')
const AdminAssessmentsPage = lazyPage(() => import('./pages/AdminAssessmentsPage'), 'AdminAssessmentsPage')
const AdminNewAssessmentPage = lazyPage(() => import('./pages/AdminNewAssessmentPage'), 'AdminNewAssessmentPage')
const AdminAssessmentResultsPage = lazyPage(() => import('./pages/AdminAssessmentResultsPage'), 'AdminAssessmentResultsPage')
const AdminProfilePage = lazyPage(() => import('./pages/AdminProfilePage'), 'AdminProfilePage')
const StudentDashboardPage = lazyPage(() => import('./pages/StudentDashboardPage'), 'StudentDashboardPage')
const StudentWorkoutsPage = lazyPage(() => import('./pages/StudentWorkoutsPage'), 'StudentWorkoutsPage')
const StudentWorkoutSessionPage = lazyPage(() => import('./pages/StudentWorkoutSessionPage'), 'StudentWorkoutSessionPage')
const StudentProgressPage = lazyPage(() => import('./pages/StudentProgressPage'), 'StudentProgressPage')
const StudentAssessmentsPage = lazyPage(() => import('./pages/StudentAssessmentsPage'), 'StudentAssessmentsPage')

export const App = (): ReactElement => (
  <Suspense fallback={<PageFallback />}>
    <Routes>
      <Route element={<Navigate replace to="/login" />} path="/" />
      <Route element={<LoginPage />} path="/login" />
    <Route
      element={
        <ErrorBoundary>
          <ProtectedRoute allowedRoles={['PERSONAL']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        </ErrorBoundary>
      }
      path="/dashboard/admin"
    />
    <Route
      element={
        <ErrorBoundary>
          <ProtectedRoute allowedRoles={['PERSONAL']}>
            <AdminStudentsPage />
          </ProtectedRoute>
        </ErrorBoundary>
      }
      path="/dashboard/admin/alunos"
    />
    <Route
      element={
        <ErrorBoundary>
          <ProtectedRoute allowedRoles={['PERSONAL']}>
            <AdminStudentDetailPage />
          </ProtectedRoute>
        </ErrorBoundary>
      }
      path="/dashboard/admin/alunos/:id"
    />
    <Route
      element={
        <ErrorBoundary>
          <ProtectedRoute allowedRoles={['PERSONAL']}>
            <AdminWorkoutsPage />
          </ProtectedRoute>
        </ErrorBoundary>
      }
      path="/dashboard/admin/treinos"
    />
    <Route
      element={
        <ErrorBoundary>
          <ProtectedRoute allowedRoles={['PERSONAL']}>
            <AdminAssessmentsPage />
          </ProtectedRoute>
        </ErrorBoundary>
      }
      path="/dashboard/admin/avaliacoes"
    />
    <Route
      element={
        <ErrorBoundary>
          <ProtectedRoute allowedRoles={['PERSONAL']}>
            <AdminNewAssessmentPage />
          </ProtectedRoute>
        </ErrorBoundary>
      }
      path="/dashboard/admin/avaliacoes/nova"
    />
    <Route
      element={
        <ErrorBoundary>
          <ProtectedRoute allowedRoles={['PERSONAL']}>
            <AdminAssessmentResultsPage />
          </ProtectedRoute>
        </ErrorBoundary>
      }
      path="/dashboard/admin/avaliacoes/resultados"
    />
    <Route
      element={
        <ErrorBoundary>
          <ProtectedRoute allowedRoles={['PERSONAL']}>
            <AdminProfilePage />
          </ProtectedRoute>
        </ErrorBoundary>
      }
      path="/dashboard/admin/perfil"
    />
    <Route
      element={
        <ErrorBoundary>
          <ProtectedRoute allowedRoles={['ALUNO']}>
            <StudentDashboardPage />
          </ProtectedRoute>
        </ErrorBoundary>
      }
      path="/dashboard/aluno"
    />
    <Route
      element={
        <ErrorBoundary>
          <ProtectedRoute allowedRoles={['ALUNO']}>
            <StudentWorkoutsPage />
          </ProtectedRoute>
        </ErrorBoundary>
      }
      path="/dashboard/aluno/treinos"
    />
    <Route
      element={
        <ErrorBoundary>
          <ProtectedRoute allowedRoles={['ALUNO']}>
            <StudentWorkoutSessionPage />
          </ProtectedRoute>
        </ErrorBoundary>
      }
      path="/dashboard/aluno/treinos/:id/sessao"
    />
    <Route
      element={
        <ErrorBoundary>
          <ProtectedRoute allowedRoles={['ALUNO']}>
            <StudentProgressPage />
          </ProtectedRoute>
        </ErrorBoundary>
      }
      path="/dashboard/aluno/progresso"
    />
    <Route
      element={
        <ErrorBoundary>
          <ProtectedRoute allowedRoles={['ALUNO']}>
            <StudentAssessmentsPage />
          </ProtectedRoute>
        </ErrorBoundary>
      }
      path="/dashboard/aluno/avaliacoes"
    />
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  </Suspense>
)
