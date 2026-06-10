import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Providers } from './providers'
import { DashboardLayout } from '@/dashboard-layout'
import { LoginPage } from '@/features/auth/login-page'
import { OverviewPage } from '@/features/dashboard/overview-page'
import { DoctorsPage } from '@/features/doctors/doctors-page'
import { BranchesPage } from '@/features/doctors/branches-page'
import { PharmaciesPage } from '@/features/pharmacies/pharmacies-page'
import { LabsPage } from '@/features/labs/labs-page'
import { RadiologyPage } from '@/features/radiology/radiology-page'
import { CitiesPage } from '@/features/cities/cities-page'
import { SpecializationsPage } from '@/features/specializations/specializations-page'
import { UsersPage } from '@/features/users/users-page'
import { ProfilePage } from '@/features/profile/profile-page'
import { useAuthStore } from '@/auth-store'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="doctors" element={<DoctorsPage />} />
            <Route path="doctors/:id/branches" element={<BranchesPage />} />
            <Route path="pharmacies" element={<PharmaciesPage />} />
            <Route path="labs" element={<LabsPage />} />
            <Route path="radiology" element={<RadiologyPage />} />
            <Route path="cities" element={<CitiesPage />} />
            <Route path="specializations" element={<SpecializationsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Providers>
    </BrowserRouter>
  )
}
