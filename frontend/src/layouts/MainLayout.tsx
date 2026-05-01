import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Memory as RuntimeIcon,
  ModelTraining as ModelIcon,
  Cloud as ServiceIcon,
  AltRoute as TrafficIcon,
  Storage as CapacityIcon,
  Policy as PolicyIcon,
  People as TenantIcon,
  EventNote as EventIcon,
  Extension as IntegrationIcon,
  Settings as SystemIcon,
  Notifications as AlertIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;

const MainLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [locale, setLocale] = useState(i18n.language);

  const handleLocaleChange = (_: React.MouseEvent<HTMLElement>, newLocale: string | null) => {
    if (newLocale) {
      setLocale(newLocale);
      i18n.changeLanguage(newLocale);
      localStorage.setItem('locale', newLocale);
    }
  };

  const navItems = [
    { key: 'overview', path: '/', icon: <DashboardIcon /> },
    { key: 'runtimes', path: '/runtimes', icon: <RuntimeIcon /> },
    { key: 'models', path: '/models', icon: <ModelIcon /> },
    { key: 'services', path: '/services', icon: <ServiceIcon /> },
    { key: 'traffic', path: '/traffic', icon: <TrafficIcon /> },
    { key: 'capacity', path: '/capacity', icon: <CapacityIcon /> },
    { key: 'policies', path: '/policies', icon: <PolicyIcon /> },
    { key: 'tenants', path: '/tenants', icon: <TenantIcon /> },
    { key: 'events', path: '/events', icon: <EventIcon /> },
    { key: 'integrations', path: '/integrations', icon: <IntegrationIcon /> },
    { key: 'system', path: '/system', icon: <SystemIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: '#FFFFFF',
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>SL</Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
              Stacklane
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.625rem' }}>
              Enterprise Model Runtime
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Nav */}
        <List sx={{ px: 1, py: 1 }}>
          {navItems.map((item) => (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 1,
                  py: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#fff',
                    '& .MuiListItemIcon-root': { color: '#fff' },
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={t(`nav.${item.key}`)}
                  primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            <Chip label="Production" size="small" color="success" variant="outlined" />
            <Box sx={{ flexGrow: 1 }} />
            <IconButton size="small">
              <SearchIcon />
            </IconButton>
            <IconButton size="small">
              <AlertIcon />
            </IconButton>
            <ToggleButtonGroup
              value={locale}
              exclusive
              onChange={handleLocaleChange}
              size="small"
              sx={{ height: 28 }}
            >
              <ToggleButton value="zh" sx={{ px: 1, py: 0, fontSize: '0.75rem' }}>
                中文
              </ToggleButton>
              <ToggleButton value="en" sx={{ px: 1, py: 0, fontSize: '0.75rem' }}>
                EN
              </ToggleButton>
            </ToggleButtonGroup>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
              A
            </Avatar>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ p: 3, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
