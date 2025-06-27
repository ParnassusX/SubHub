import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import AddSubscriptions from './pages/AddSubscriptions'
import SubscriptionDetails from './pages/SubscriptionDetails'
import Reports from './pages/Reports'
import Categories from './pages/Categories'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import ImportExport from './pages/ImportExport'
import Offers from './pages/Offers'
import Plans from './pages/Plans'
import Help from './pages/Help'
import Contact from './pages/Contact'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="add-subscriptions" element={<AddSubscriptions />} />
            <Route path="subscription-details" element={<SubscriptionDetails />} />
            <Route path="reports" element={<Reports />} />
            <Route path="categories" element={<Categories />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="import-export" element={<ImportExport />} />
            <Route path="offers" element={<Offers />} />
            <Route path="plans" element={<Plans />} />
            <Route path="help" element={<Help />} />
            <Route path="contact" element={<Contact />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
