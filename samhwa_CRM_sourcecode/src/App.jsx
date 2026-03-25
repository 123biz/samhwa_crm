import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import CustomerDB from './pages/admin/CustomerDB';
import BroadcastMgmt from './pages/admin/BroadcastMgmt';
import Analytics from './pages/admin/Analytics';
import ASStats from './pages/admin/ASStats';
import QRStats from './pages/admin/QRStats';
import ChatbotMgmt from './pages/admin/ChatbotMgmt';
import ProductDetail from './pages/mobile/ProductDetail';
import Registration from './pages/mobile/Registration';
import Chatbot from './pages/mobile/Chatbot';
import EventLanding from './pages/mobile/EventLanding';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<CustomerDB />} />
          <Route path="broadcast" element={<BroadcastMgmt />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="as-stats" element={<ASStats />} />
          <Route path="qr-stats" element={<QRStats />} />
          <Route path="chatbot" element={<ChatbotMgmt />} />
        </Route>
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/register/:eventId" element={<Registration />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/chatbot/:productId" element={<Chatbot />} />
        <Route path="/landing/:eventId" element={<EventLanding />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
