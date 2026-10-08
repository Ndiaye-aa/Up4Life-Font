import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/layout/ErrorBoundary'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AdminAssessmentResultsPage } from './pages/AdminAssessmentResultsPage'
import { AdminAssessmentsPage } from './pages/AdminAssessmentsPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminNewAssessmentPage } from './pages/AdminNewAssessmentPage'
import { AdminProfilePage } from './pages/AdminProfilePage'
import { AdminStudentsPage } from './pages/AdminStudentsPage'
import { AdminWorkoutsPage } from './pages/AdminWorkoutsPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const App = (): ReactElement => (
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
    <Route element={<NotFoundPage />} path="*" />
  </Routes>
)
