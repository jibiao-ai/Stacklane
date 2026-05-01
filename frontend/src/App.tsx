import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import './i18n';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import ModelManagement from './pages/ModelManagement';
import GPUManagement from './pages/GPUManagement';
import Capacity from './pages/Capacity';
import Events from './pages/Events';
import Policies from './pages/Policies';
import DeployWizard from './pages/DeployWizard';
import Runtimes from './pages/Runtimes';
import Integrations from './pages/Integrations';
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
            <Route path="runtimes" element={<Runtimes />} />
            <Route path="models" element={<ModelManagement />} />
            <Route path="services" element={<Services />} />
            <Route path="gpu" element={<GPUManagement />} />
            <Route path="capacity" element={<Capacity />} />
            <Route path="policies" element={<Policies />} />
            <Route path="events" element={<Events />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="deploy" element={<DeployWizard />} />
            <Route path="traffic" element={<Dashboard />} />
            <Route path="tenants" element={<Dashboard />} />
            <Route path="system" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
