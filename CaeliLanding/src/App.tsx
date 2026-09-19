import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Storefront } from './pages/Storefront';
import { AdminDashboard } from './pages/AdminDashboard';
import { CartProvider } from './hooks/useCart';

interface AppProps {
  /** Treatment of the "Order via WhatsApp" button on every product card. */
  whatsappButtonStyle?: 'soft' | 'solid';
}

export function App({ whatsappButtonStyle = 'soft' }: AppProps) {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Storefront actionStyle={whatsappButtonStyle} />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>);

}