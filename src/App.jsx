import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import CustomerDB from './pages/admin/CustomerDB';
import BroadcastMgmt from './pages/admin/BroadcastMgmt';
import Analytics from './pages/admin/Analytics';
import ASStats from './pages/admin/ASStats';
import QRStats from './pages/admin/QRStats';
import ChatbotMgmt from './pages/admin/ChatbotMgmt';
import ProductDetail from './pages/mobile/ProductDetail';
import Catalog from './pages/mobile/Catalog';
import Registration from './pages/mobile/Registration';
import Chatbot from './pages/mobile/Chatbot';
import EventLanding from './pages/mobile/EventLanding';
import QrRedirect from './pages/mobile/QrRedirect';
import StaffVerify from './pages/staff/StaffVerify';
import Login from './pages/Login';
import { useAuth } from './hooks/useAuth';

/** Vite `base: './'`일 때 프로덕션 BASE_URL이 `./`가 되어 라우터와 불일치 → 빈 화면 방지 */
function routerBasename() {
  const base = import.meta.env.BASE_URL;
  if (!base || base === './') return '/';
  return base.endsWith('/') && base.length > 1 ? base.slice(0, -1) : base;
}

function ProtectedRoute() {
  const session = useAuth();
  if (session === undefined) return null; // 인증 상태 확인 중
  if (!session) return <Navigate to="/login" replace />;
  return <AdminLayout />;
}

export default function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<CustomerDB />} />
          <Route path="broadcast" element={<BroadcastMgmt />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="as-stats" element={<ASStats />} />
          <Route path="qr-stats" element={<QRStats />} />
          <Route path="chatbot" element={<ChatbotMgmt />} />
        </Route>
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/register/:eventId" element={<Registration />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/chatbot/:productId" element={<Chatbot />} />
        <Route path="/go/:qrId" element={<QrRedirect />} />
        <Route path="/landing/:eventId" element={<EventLanding />} />
        <Route path="/staff/verify" element={<StaffVerify />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
