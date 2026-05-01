import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import './i18n';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Models from './pages/Models';
import Capacity from './pages/Capacity';
import Events from './pages/Events';
import Policies from './pages/Policies';
import DeployWizard from './pages/DeployWizard';
import Login from './pages/Login';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="services" element={<Services />} />
            <Route path="models" element={<Models />} />
            <Route path="capacity" element={<Capacity />} />
            <Route path="events" element={<Events />} />
            <Route path="policies" element={<Policies />} />
            <Route path="deploy" element={<DeployWizard />} />
            <Route path="runtimes" element={<Dashboard />} />
            <Route path="traffic" element={<Dashboard />} />
            <Route path="tenants" element={<Dashboard />} />
            <Route path="integrations" element={<Dashboard />} />
            <Route path="system" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
