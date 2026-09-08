import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Storefront } from './pages/Storefront';
import { AdminDashboard } from './pages/AdminDashboard';

interface AppProps {
  /** Treatment of the "Order via WhatsApp" button on every product card. */
  whatsappButtonStyle?: 'soft' | 'solid';
}

export function App({ whatsappButtonStyle = 'soft' }: AppProps) {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Storefront actionStyle={whatsappButtonStyle} />} />
        
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>);

}