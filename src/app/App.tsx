import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Providers } from './providers'
import { DashboardLayout } from '@/dashboard-layout'
import { LoginPage } from '@/features/auth/login-page'
import { OverviewPage } from '@/features/dashboard/overview-page'
import { DoctorsPage } from '@/features/doctors/doctors-page'
import { DoctorDetailsPage } from '@/features/doctors/doctor-details-page'
import { DoctorFormPage } from '@/features/doctors/doctor-form-page'
import { BranchesPage } from '@/features/doctors/branches-page'
import { DoctorBranchFormPage } from '@/features/doctors/branch-form-page'
import { DoctorBranchDetailPage } from '@/features/doctors/branch-detail-page'
import { PharmaciesPage } from '@/features/pharmacies/pharmacies-page'
import { PharmacyDetailsPage } from '@/features/pharmacies/pharmacy-details-page'
import { PharmacyFormPage } from '@/features/pharmacies/pharmacy-form-page'
import { PharmacyBranchesPage } from '@/features/pharmacies/pharmacy-branches-page'
import { PharmacyBranchFormPage } from '@/features/pharmacies/pharmacy-branch-form-page'
import { PharmacyBranchDetailPage } from '@/features/pharmacies/pharmacy-branch-detail-page'
import { LabsPage } from '@/features/labs/labs-page'
import { LabDetailsPage } from '@/features/labs/lab-details-page'
import { LabFormPage } from '@/features/labs/lab-form-page'
import { LabBranchesPage } from '@/features/labs/lab-branches-page'
import { LabBranchFormPage } from '@/features/labs/lab-branch-form-page'
import { LabBranchDetailPage } from '@/features/labs/lab-branch-detail-page'
import { RadiologyPage } from '@/features/radiology/radiology-page'
import { RadiologyDetailsPage } from '@/features/radiology/radiology-details-page'
import { RadiologyFormPage } from '@/features/radiology/radiology-form-page'
import { RadiologyBranchesPage } from '@/features/radiology/radiology-branches-page'
import { RadiologyBranchFormPage } from '@/features/radiology/radiology-branch-form-page'
import { RadiologyBranchDetailPage } from '@/features/radiology/radiology-branch-detail-page'
import { CitiesPage } from '@/features/cities/cities-page'
import { SpecializationsPage } from '@/features/specializations/specializations-page'
import { UsersPage } from '@/features/users/users-page'
import { ProfilePage } from '@/features/profile/profile-page'
import { useAuthStore, useHydrated } from '@/auth-store'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hydrated = useHydrated()

  // Wait for zustand to rehydrate from localStorage before making routing decisions.
  if (!hydrated) return null

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
            <Route path="doctors/new" element={<DoctorFormPage />} />
            <Route path="doctors/:id" element={<DoctorDetailsPage />} />
            <Route path="doctors/:id/edit" element={<DoctorFormPage />} />
            <Route path="doctors/:id/branches" element={<BranchesPage />} />
            <Route path="doctors/:id/branches/new" element={<DoctorBranchFormPage />} />
            <Route path="doctors/:id/branches/:branchId" element={<DoctorBranchDetailPage />} />
            <Route path="doctors/:id/branches/:branchId/edit" element={<DoctorBranchFormPage />} />
            <Route path="pharmacies" element={<PharmaciesPage />} />
            <Route path="pharmacies/new" element={<PharmacyFormPage />} />
            <Route path="pharmacies/:id" element={<PharmacyDetailsPage />} />
            <Route path="pharmacies/:id/edit" element={<PharmacyFormPage />} />
            <Route path="pharmacies/:id/branches" element={<PharmacyBranchesPage />} />
            <Route path="pharmacies/:id/branches/new" element={<PharmacyBranchFormPage />} />
            <Route path="pharmacies/:id/branches/:branchId" element={<PharmacyBranchDetailPage />} />
            <Route path="pharmacies/:id/branches/:branchId/edit" element={<PharmacyBranchFormPage />} />
            <Route path="labs" element={<LabsPage />} />
            <Route path="labs/new" element={<LabFormPage />} />
            <Route path="labs/:id" element={<LabDetailsPage />} />
            <Route path="labs/:id/edit" element={<LabFormPage />} />
            <Route path="labs/:id/branches" element={<LabBranchesPage />} />
            <Route path="labs/:id/branches/new" element={<LabBranchFormPage />} />
            <Route path="labs/:id/branches/:branchId" element={<LabBranchDetailPage />} />
            <Route path="labs/:id/branches/:branchId/edit" element={<LabBranchFormPage />} />
            <Route path="radiology" element={<RadiologyPage />} />
            <Route path="radiology/new" element={<RadiologyFormPage />} />
            <Route path="radiology/:id" element={<RadiologyDetailsPage />} />
            <Route path="radiology/:id/edit" element={<RadiologyFormPage />} />
            <Route path="radiology/:id/branches" element={<RadiologyBranchesPage />} />
            <Route path="radiology/:id/branches/new" element={<RadiologyBranchFormPage />} />
            <Route path="radiology/:id/branches/:branchId" element={<RadiologyBranchDetailPage />} />
            <Route path="radiology/:id/branches/:branchId/edit" element={<RadiologyBranchFormPage />} />
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
