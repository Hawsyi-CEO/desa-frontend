import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

// Import placeholder components (akan dibuat)
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import JenisSurat from './pages/SuperAdmin/JenisSurat';
import FormJenisSurat from './pages/SuperAdmin/FormJenisSurat';
import KonfigurasiSurat from './pages/SuperAdmin/KonfigurasiSurat';
import AdminSurat from './pages/SuperAdmin/Surat';
import Users from './pages/SuperAdmin/Users';
import DataWarga from './pages/SuperAdmin/DataWarga';

import VerifikatorDashboard from './pages/Verifikator/Dashboard';
import VerifikatorSurat from './pages/Verifikator/Surat';
import VerifikatorRiwayat from './pages/Verifikator/Riwayat';

import WargaDashboard from './pages/Warga/Dashboard';
import WargaSurat from './pages/Warga/Surat';
import WargaHistory from './pages/Warga/History';
import WargaProfile from './pages/Warga/Profile';
import ChangePassword from './pages/Warga/ChangePassword';

import WargaUniversalDashboard from './pages/WargaUniversal/Dashboard';
import WargaUniversalHistory from './pages/WargaUniversal/History';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Super Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute roles={['super_admin']}>
                <SuperAdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/jenis-surat"
            element={
              <PrivateRoute roles={['super_admin']}>
                <JenisSurat />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/jenis-surat/tambah"
            element={
              <PrivateRoute roles={['super_admin']}>
                <FormJenisSurat />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/jenis-surat/edit/:id"
            element={
              <PrivateRoute roles={['super_admin']}>
                <FormJenisSurat />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/konfigurasi"
            element={
              <PrivateRoute roles={['super_admin']}>
                <KonfigurasiSurat />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/surat"
            element={
              <PrivateRoute roles={['super_admin']}>
                <AdminSurat />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute roles={['super_admin']}>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/data-warga"
            element={
              <PrivateRoute roles={['super_admin']}>
                <DataWarga />
              </PrivateRoute>
            }
          />

          {/* Verifikator (Admin RT/RW) Routes */}
          <Route
            path="/verifikator/dashboard"
            element={
              <PrivateRoute roles={['admin', 'verifikator']}>
                <VerifikatorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/verifikator/surat"
            element={
              <PrivateRoute roles={['admin', 'verifikator']}>
                <VerifikatorSurat />
              </PrivateRoute>
            }
          />
          <Route
            path="/verifikator/riwayat"
            element={
              <PrivateRoute roles={['admin', 'verifikator']}>
                <VerifikatorRiwayat />
              </PrivateRoute>
            }
          />
          <Route
            path="/verifikator/data-warga"
            element={
              <PrivateRoute roles={['admin']}>
                <DataWarga />
              </PrivateRoute>
            }
          />

          {/* Warga Routes */}
          <Route
            path="/warga/dashboard"
            element={
              <PrivateRoute roles={['warga']}>
                <WargaDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/warga/surat"
            element={
              <PrivateRoute roles={['warga']}>
                <WargaSurat />
              </PrivateRoute>
            }
          />
          <Route
            path="/warga/history"
            element={
              <PrivateRoute roles={['warga']}>
                <WargaHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/warga/profile"
            element={
              <PrivateRoute roles={['warga']}>
                <WargaProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/warga/change-password"
            element={
              <PrivateRoute roles={['warga']}>
                <ChangePassword />
              </PrivateRoute>
            }
          />

          {/* Warga Universal Routes */}
          <Route
            path="/warga-universal/dashboard"
            element={
              <PrivateRoute roles={['warga_universal']}>
                <WargaUniversalDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/warga-universal/history"
            element={
              <PrivateRoute roles={['warga_universal']}>
                <WargaUniversalHistory />
              </PrivateRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
}

export default App;
