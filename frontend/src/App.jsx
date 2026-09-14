import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { DataProvider } from '@/context/DataContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { InsightsPage } from '@/pages/InsightsPage'
import { ListingDetailPage } from '@/pages/ListingDetailPage'
import { ListingsPage } from '@/pages/ListingsPage'
import { LoginPage } from '@/pages/LoginPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { RentalDetailPage } from '@/pages/RentalDetailPage'
import { RentalsPage } from '@/pages/RentalsPage'
import { SavedPage } from '@/pages/SavedPage'

function Protected() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <DataProvider>
      <AppLayout />
    </DataProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Protected />}>
            <Route path="/" element={<InsightsPage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/rentals" element={<RentalsPage />} />
            <Route path="/rentals/:id" element={<RentalDetailPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  )
}
