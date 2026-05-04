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
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Memory as RuntimeIcon,
  ModelTraining as ModelIcon,
  Cloud as ServiceIcon,
  AltRoute as TrafficIcon,
  Storage as StorageIcon,
  DeveloperBoard as CapacityIcon,
  Policy as PolicyIcon,
  People as TenantIcon,
  EventNote as EventIcon,
  Extension as IntegrationIcon,
  Settings as SystemIcon,
  Notifications as AlertIcon,
  Search as SearchIcon,
  SmartToy as AgentIcon,
  Forum as ChannelIcon,
  AutoFixHigh as SkillIcon,
  Hub as DifyIcon,
  Chat as ChatIcon,
  AccountTree as WorkflowIcon,
  Timer as TimerIcon,
  Logout as LogoutIcon,
  MenuOpen as CollapseIcon,
  Menu as ExpandIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 248;
const DRAWER_COLLAPSED_WIDTH = 68;

interface NavSection {
  category: string;
  items: { key: string; path: string; icon: React.ReactNode }[];
}

const MainLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [locale, setLocale] = useState(i18n.language);
  const [collapsed, setCollapsed] = useState(false);

  const handleLocaleChange = (_: React.MouseEvent<HTMLElement>, newLocale: string | null) => {
    if (newLocale) {
      setLocale(newLocale);
      i18n.changeLanguage(newLocale);
      localStorage.setItem('locale', newLocale);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const drawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  const navSections: NavSection[] = [
    {
      category: 'navCategory.workbench',
      items: [
        { key: 'overview', path: '/', icon: <DashboardIcon /> },
        { key: 'chat', path: '/chat', icon: <ChatIcon /> },
        { key: 'agents', path: '/agents', icon: <AgentIcon /> },
      ],
    },
    {
      category: 'navCategory.workflow',
      items: [
        { key: 'workflow', path: '/workflow', icon: <WorkflowIcon /> },
        { key: 'skills', path: '/skills', icon: <SkillIcon /> },
        { key: 'scheduledTasks', path: '/scheduled-tasks', icon: <TimerIcon /> },
      ],
    },
    {
      category: 'navCategory.resource',
      items: [
        { key: 'gpu', path: '/gpu', icon: <RuntimeIcon /> },
        { key: 'runtimes', path: '/runtimes', icon: <CapacityIcon /> },
        { key: 'models', path: '/models', icon: <ModelIcon /> },
        { key: 'services', path: '/services', icon: <ServiceIcon /> },
      ],
    },
    {
      category: 'navCategory.channel',
      items: [
        { key: 'channels', path: '/channels', icon: <ChannelIcon /> },
        { key: 'dify', path: '/dify', icon: <DifyIcon /> },
        { key: 'integrations', path: '/integrations', icon: <IntegrationIcon /> },
      ],
    },
    {
      category: 'navCategory.governance',
      items: [
        { key: 'traffic', path: '/traffic', icon: <TrafficIcon /> },
        { key: 'capacity', path: '/capacity', icon: <StorageIcon /> },
        { key: 'policies', path: '/policies', icon: <PolicyIcon /> },
        { key: 'tenants', path: '/tenants', icon: <TenantIcon /> },
      ],
    },
    {
      category: 'navCategory.system',
      items: [
        { key: 'events', path: '/events', icon: <EventIcon /> },
        { key: 'system', path: '/system', icon: <SystemIcon /> },
      ],
    },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          transition: 'width 0.25s ease',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.25s ease',
            overflowX: 'hidden',
          },
        }}
      >
        {/* Logo area with collapse toggle */}
        <Box sx={{
          p: collapsed ? 1.5 : 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 64,
        }}>
          {/* Collapse/Expand button on left side of logo */}
          <IconButton
            size="small"
            onClick={() => setCollapsed(!collapsed)}
            sx={{
              width: 28, height: 28,
              color: '#86909C',
              '&:hover': { bgcolor: '#F2F3F5', color: '#165DFF' },
            }}
          >
            {collapsed ? <ExpandIcon sx={{ fontSize: 18 }} /> : <CollapseIcon sx={{ fontSize: 18 }} />}
          </IconButton>

          {/* Logo icon */}
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #165DFF 0%, #0E42D2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(22, 93, 255, 0.25)',
              flexShrink: 0,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18">
              <g fill="white">
                <path d="M 88 180 L 190 180 L 190 212 L 88 212 Z"/>
                <path d="M 322 180 L 424 180 L 424 212 L 322 212 Z"/>
                <path d="M 88 300 L 190 300 L 190 332 L 88 332 Z"/>
                <path d="M 322 300 L 424 300 L 424 332 L 322 332 Z"/>
                <path d="M 178 180 L 202 180 L 258 236 L 310 180 L 334 180 L 270 248 L 256 248 L 242 248 Z"/>
                <path d="M 178 332 L 202 332 L 258 276 L 310 332 L 334 332 L 270 264 L 256 264 L 242 264 Z"/>
              </g>
              <path d="M 215 268 L 233 250 L 221 238 L 203 256 Z" fill="#165DFF"/>
              <path d="M 279 244 L 297 262 L 309 250 L 291 232 Z" fill="#165DFF"/>
            </svg>
          </Box>

          {/* Brand text (hidden when collapsed) */}
          {!collapsed && (
            <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2, color: '#1D2129' }}>
                Stacklane
              </Typography>
              <Typography sx={{ color: '#86909C', fontSize: '0.62rem', lineHeight: 1.3 }}>
                AI {t('navCategory.platformSubtitle')}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Navigation sections */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: collapsed ? 0.8 : 1.5, py: 0.5 }}>
          {navSections.map((section, sIdx) => (
            <Box key={sIdx} sx={{ mb: 1.5 }}>
              {/* Section header (hidden when collapsed) */}
              {!collapsed && (
                <Typography
                  sx={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: '#C9CDD4',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    px: 1,
                    py: 0.5,
                    mb: 0.3,
                  }}
                >
                  {t(section.category)}
                </Typography>
              )}
              {/* Divider for collapsed mode */}
              {collapsed && sIdx > 0 && (
                <Box sx={{ height: 1, bgcolor: '#F2F3F5', mx: 1, my: 0.5 }} />
              )}

              {/* Section items */}
              <List disablePadding>
                {section.items.map((item) => {
                  const isActive = item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);
                  return (
                    <ListItem key={item.key} disablePadding sx={{ mb: 0.25 }}>
                      <Tooltip title={collapsed ? t(`nav.${item.key}`) : ''} placement="right" arrow>
                        <ListItemButton
                          onClick={() => navigate(item.path)}
                          selected={isActive}
                          sx={{
                            borderRadius: 2,
                            py: 0.85,
                            px: collapsed ? 1.5 : 1.5,
                            minHeight: 38,
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            transition: 'all 0.15s ease',
                            '&.Mui-selected': {
                              bgcolor: 'rgba(22, 93, 255, 0.08)',
                              color: '#165DFF',
                              '& .MuiListItemIcon-root': { color: '#165DFF' },
                              '&:hover': { bgcolor: 'rgba(22, 93, 255, 0.12)' },
                              borderLeft: collapsed ? 'none' : '3px solid #165DFF',
                            },
                            '&:hover': { bgcolor: '#F7F8FA' },
                          }}
                        >
                          <ListItemIcon sx={{
                            minWidth: collapsed ? 0 : 32,
                            color: isActive ? '#165DFF' : '#86909C',
                            justifyContent: 'center',
                            '& .MuiSvgIcon-root': { fontSize: '1.2rem' },
                          }}>
                            {item.icon}
                          </ListItemIcon>
                          {!collapsed && (
                            <ListItemText
                              primary={t(`nav.${item.key}`)}
                              primaryTypographyProps={{
                                fontSize: '0.82rem',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? '#165DFF' : '#4E5969',
                              }}
                            />
                          )}
                        </ListItemButton>
                      </Tooltip>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ))}
        </Box>

        {/* User section at bottom */}
        <Box sx={{
          p: collapsed ? 1 : 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 1.5,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <Avatar sx={{
            width: 34, height: 34,
            bgcolor: '#165DFF',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}>
            A
          </Avatar>
          {!collapsed && (
            <>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1D2129', lineHeight: 1.3 }}>
                  admin
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#86909C', lineHeight: 1.3 }}>
                  {t('navCategory.administrator')}
                </Typography>
              </Box>
              <IconButton size="small" onClick={handleLogout} sx={{ color: '#86909C' }}>
                <LogoutIcon sx={{ fontSize: '1.1rem' }} />
              </IconButton>
            </>
          )}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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
          <Toolbar sx={{ gap: 2, minHeight: '52px !important' }}>
            <Chip
              label="Production"
              size="small"
              sx={{
                bgcolor: 'rgba(0, 180, 42, 0.08)',
                color: '#00B42A',
                fontWeight: 600,
                fontSize: '0.72rem',
                height: 24,
                '& .MuiChip-label': { px: 1 },
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00B42A' }} />
              <Typography sx={{ fontSize: '0.72rem', color: '#86909C' }}>
                {t('navCategory.systemNormal')}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton size="small" sx={{ color: '#86909C' }}>
              <SearchIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
            <IconButton size="small" sx={{ color: '#86909C' }}>
              <AlertIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
            <ToggleButtonGroup
              value={locale}
              exclusive
              onChange={handleLocaleChange}
              size="small"
              sx={{
                height: 28,
                '& .MuiToggleButton-root': {
                  border: '1px solid #E5E6EB',
                  color: '#86909C',
                  fontSize: '0.72rem',
                  '&.Mui-selected': {
                    bgcolor: '#165DFF',
                    color: '#fff',
                    borderColor: '#165DFF',
                    '&:hover': { bgcolor: '#0E42D2' },
                  },
                },
              }}
            >
              <ToggleButton value="zh" sx={{ px: 1.2, py: 0 }}>中文</ToggleButton>
              <ToggleButton value="en" sx={{ px: 1.2, py: 0 }}>EN</ToggleButton>
            </ToggleButtonGroup>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
          <Outlet />
        </Box>

        {/* Bottom status bar */}
        <Box sx={{
          px: 3, py: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#86909C' }}>Stacklane {t('navCategory.serviceStatus')}</Typography>
          </Box>
          {['NLP Engine', 'Token Manager', 'Log Streamer'].map((svc) => (
            <Box key={svc} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#4E5969' }}>{svc}</Typography>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#00B42A' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#00B42A' }}>{t('navCategory.normal')}</Typography>
            </Box>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00B42A' }} />
            <Typography sx={{ fontSize: '0.72rem', color: '#00B42A', fontWeight: 500 }}>
              {t('navCategory.platformNormal')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
