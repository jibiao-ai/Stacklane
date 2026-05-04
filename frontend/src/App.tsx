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
import Traffic from './pages/Traffic';
import Tenants from './pages/Tenants';
import System from './pages/System';
import Agents from './pages/Agents';
import Channels from './pages/Channels';
import Skills from './pages/Skills';
import Dify from './pages/Dify';
import Chat from './pages/Chat';
import Workflow from './pages/Workflow';
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
            <Route path="chat" element={<Chat />} />
            <Route path="agents" element={<Agents />} />
            <Route path="workflow" element={<Workflow />} />
            <Route path="skills" element={<Skills />} />
            <Route path="scheduled-tasks" element={<Skills />} />
            <Route path="gpu" element={<GPUManagement />} />
            <Route path="runtimes" element={<Runtimes />} />
            <Route path="models" element={<ModelManagement />} />
            <Route path="services" element={<Services />} />
            <Route path="channels" element={<Channels />} />
            <Route path="dify" element={<Dify />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="traffic" element={<Traffic />} />
            <Route path="capacity" element={<Capacity />} />
            <Route path="policies" element={<Policies />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="events" element={<Events />} />
            <Route path="system" element={<System />} />
            <Route path="deploy" element={<DeployWizard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
