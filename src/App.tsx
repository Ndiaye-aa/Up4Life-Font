import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/layout/ErrorBoundary'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AdminAssessmentResultsPage } from './pages/AdminAssessmentResultsPage'
import { AdminAssessmentsPage } from './pages/AdminAssessmentsPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminNewAssessmentPage } from './pages/AdminNewAssessmentPage'
import { AdminProfilePage } from './pages/AdminProfilePage'
import { AdminWorkoutsPage } from './pages/AdminWorkoutsPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { StudentAssessmentsPage } from './pages/StudentAssessmentsPage'
import { StudentDashboardPage } from './pages/StudentDashboardPage'
import { StudentProfilePage } from './pages/StudentProfilePage'
import { StudentWorkoutsPage } from './pages/StudentWorkoutsPage'
import { StudentWorkoutSessionPage } from './pages/StudentWorkoutSessionPage'

export const App = (): ReactElement => (
  <Routes>
    <Route element={<Navigate replace to="/login" />} path="/" />
    <Route element={<LoginPage />} path="/login" />
    <Route
      element={
        <ProtectedRoute allowedRoles={['PERSONAL']}>
          <AdminDashboardPage />
        </ProtectedRoute>
      }
      path="/dashboard/admin"
    />
    <Route
      element={
        <ProtectedRoute allowedRoles={['PERSONAL']}>
          <AdminWorkoutsPage />
        </ProtectedRoute>
      }
      path="/dashboard/admin/treinos"
    />
    <Route
      element={
        <ProtectedRoute allowedRoles={['PERSONAL']}>
          <AdminAssessmentsPage />
        </ProtectedRoute>
      }
      path="/dashboard/admin/avaliacoes"
    />
    <Route
      element={
        <ProtectedRoute allowedRoles={['PERSONAL']}>
          <AdminNewAssessmentPage />
        </ProtectedRoute>
      }
      path="/dashboard/admin/avaliacoes/nova"
    />
    <Route
      element={
        <ProtectedRoute allowedRoles={['PERSONAL']}>
          <AdminAssessmentResultsPage />
        </ProtectedRoute>
      }
      path="/dashboard/admin/avaliacoes/resultados"
    />
    <Route
      element={
        <ProtectedRoute allowedRoles={['PERSONAL']}>
          <AdminProfilePage />
        </ProtectedRoute>
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
            <StudentAssessmentsPage />
          </ProtectedRoute>
        </ErrorBoundary>
      }
      path="/dashboard/aluno/avaliacoes"
    />
    <Route
      element={
        <ErrorBoundary>
          <ProtectedRoute allowedRoles={['ALUNO']}>
            <StudentProfilePage />
          </ProtectedRoute>
        </ErrorBoundary>
      }
      path="/dashboard/aluno/perfil"
    />
    <Route element={<NotFoundPage />} path="*" />
  </Routes>
)
