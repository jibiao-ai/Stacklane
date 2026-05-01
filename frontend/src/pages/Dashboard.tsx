import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Cloud as ServiceIcon,
  Memory as GPUIcon,
  Speed as LatencyIcon,
  ErrorOutline as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as HealthyIcon,
} from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const mockCostData = [
  { date: '04-24', cost: 1200 },
  { date: '04-25', cost: 1350 },
  { date: '04-26', cost: 1280 },
  { date: '04-27', cost: 1420 },
  { date: '04-28', cost: 1380 },
  { date: '04-29', cost: 1500 },
  { date: '04-30', cost: 1460 },
];

const mockRuntimeData = [
  { name: 'vLLM', value: 45 },
  { name: 'llama.cpp', value: 30 },
  { name: 'TensorRT', value: 15 },
  { name: 'GPUStack', value: 10 },
];

const COLORS = ['#165DFF', '#14C9C9', '#FF7D00', '#722ED1'];

const mockServices = [
  { name: 'llama-3-70b-chat', status: 'running', runtime: 'vLLM', latency: 45, throughput: 120 },
  { name: 'qwen-2-72b', status: 'running', runtime: 'vLLM', latency: 52, throughput: 95 },
  { name: 'codestral-22b', status: 'running', runtime: 'llama.cpp', latency: 38, throughput: 150 },
  { name: 'mixtral-8x7b', status: 'error', runtime: 'TensorRT', latency: 0, throughput: 0 },
  { name: 'phi-3-medium', status: 'pending', runtime: 'GPUStack', latency: 0, throughput: 0 },
];

const mockAlerts = [
  { id: 1, severity: 'critical', message: 'GPU Node gpu-worker-03 memory usage exceeds 95%', time: '5 min ago' },
  { id: 2, severity: 'warning', message: 'Service mixtral-8x7b health check failed', time: '12 min ago' },
  { id: 3, severity: 'warning', message: 'Cluster us-east-1 capacity utilization above 80%', time: '1 hour ago' },
];

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  const kpiCards = [
    { key: 'onlineServices', value: '12', unit: '', icon: <ServiceIcon />, color: '#165DFF', change: '+2' },
    { key: 'gpuUtilization', value: '73.5', unit: '%', icon: <GPUIcon />, color: '#14C9C9', change: '+5.2%' },
    { key: 'p95Latency', value: '47', unit: 'ms', icon: <LatencyIcon />, color: '#FF7D00', change: '-3ms' },
    { key: 'errorRate', value: '0.12', unit: '%', icon: <ErrorIcon />, color: '#F53F3F', change: '+0.02%' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'error': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 3 }}>{t('dashboard.title')}</Typography>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpiCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.key}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t(`dashboard.${card.key}`)}
                  </Typography>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{card.unit}</Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 0.5, color: card.change.startsWith('+') && card.key === 'errorRate' ? 'error.main' : 'success.main' }}>
                  {card.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Runtime Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.runtimeDist')}</Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={mockRuntimeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {mockRuntimeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Cost Trend */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.costTrend')}</Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockCostData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="cost" stroke="#165DFF" fill="#165DFF" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Service Health */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.serviceHealth')}</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('common.name')}</TableCell>
                      <TableCell>{t('common.status')}</TableCell>
                      <TableCell>{t('services.runtime')}</TableCell>
                      <TableCell>P95 (ms)</TableCell>
                      <TableCell>QPS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockServices.map((svc) => (
                      <TableRow key={svc.name} hover>
                        <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8125rem' }}>{svc.name}</TableCell>
                        <TableCell>
                          <Chip label={svc.status} size="small" color={getStatusColor(svc.status) as any} />
                        </TableCell>
                        <TableCell>{svc.runtime}</TableCell>
                        <TableCell>{svc.latency || '-'}</TableCell>
                        <TableCell>{svc.throughput || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Alerts */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>{t('dashboard.topAlerts')}</Typography>
              {mockAlerts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <HealthyIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography color="text.secondary">{t('dashboard.systemStable')}</Typography>
                </Box>
              ) : (
                mockAlerts.map((alert) => (
                  <Box key={alert.id} sx={{ p: 1.5, mb: 1, borderRadius: 1, bgcolor: alert.severity === 'critical' ? 'error.main' : 'warning.main', color: '#fff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <WarningIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        {alert.severity.toUpperCase()}
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 'auto', fontSize: '0.625rem', opacity: 0.8 }}>
                        {alert.time}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{alert.message}</Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
