import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuotationList from './pages/QuotationList';
import QuotationCreate from './pages/QuotationCreate';
import QuotationEdit from './pages/QuotationEdit';
import QuotationView from './pages/QuotationView';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="quotations" element={<QuotationList />} />
        <Route path="quotations/new" element={<QuotationCreate />} />
        <Route path="quotations/:id" element={<QuotationView />} />
        <Route path="quotations/:id/edit" element={<QuotationEdit />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
