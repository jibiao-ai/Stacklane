import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress,
  Tabs, Tab, Button, IconButton, Tooltip, Badge,
} from '@mui/material';
import {
  Memory as GPUIcon, Refresh as RefreshIcon, Visibility as ViewIcon,
  Speed as SpeedIcon, Thermostat as TempIcon, BatteryChargingFull as PowerIcon,
  Storage as StorageIcon, CheckCircle, Error as ErrorIcon, Circle,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell } from 'recharts';

// Mock data representing real GPUStack-synced GPU data
const mockGPUNodes = [
  { id: 1, name: 'gpu-worker-01', host: '10.0.1.101', gpuType: 'NVIDIA A100-SXM4-80GB', gpuCount: 8, utilization: 72.5, status: 'online', cluster: 'production-cluster-01' },
  { id: 2, name: 'gpu-worker-02', host: '10.0.1.102', gpuType: 'NVIDIA A100-SXM4-80GB', gpuCount: 8, utilization: 65.3, status: 'online', cluster: 'production-cluster-01' },
  { id: 3, name: 'gpu-worker-03', host: '10.0.1.103', gpuType: 'NVIDIA H100-SXM5-80GB', gpuCount: 8, utilization: 88.1, status: 'online', cluster: 'production-cluster-01' },
  { id: 4, name: 'gpu-worker-04', host: '10.0.1.104', gpuType: 'NVIDIA L40S-48GB', gpuCount: 4, utilization: 45.7, status: 'online', cluster: 'production-cluster-01' },
];

const mockGPUDevices = [
  { id: 1, node: 'gpu-worker-01', index: 0, name: 'A100-SXM4-80GB', vramTotal: 81920, vramUsed: 59392, utilization: 72, temperature: 65, powerDraw: 285, powerLimit: 400, status: 'in_use', assignedModel: 'Llama-3.1-70B-Instruct' },
  { id: 2, node: 'gpu-worker-01', index: 1, name: 'A100-SXM4-80GB', vramTotal: 81920, vramUsed: 61440, utilization: 75, temperature: 67, powerDraw: 290, powerLimit: 400, status: 'in_use', assignedModel: 'Llama-3.1-70B-Instruct' },
  { id: 3, node: 'gpu-worker-01', index: 2, name: 'A100-SXM4-80GB', vramTotal: 81920, vramUsed: 55296, utilization: 68, temperature: 62, powerDraw: 275, powerLimit: 400, status: 'in_use', assignedModel: 'Qwen-2.5-72B-Chat' },
  { id: 4, node: 'gpu-worker-01', index: 3, name: 'A100-SXM4-80GB', vramTotal: 81920, vramUsed: 53248, utilization: 65, temperature: 60, powerDraw: 260, powerLimit: 400, status: 'in_use', assignedModel: 'Qwen-2.5-72B-Chat' },
  { id: 5, node: 'gpu-worker-03', index: 0, name: 'H100-SXM5-80GB', vramTotal: 81920, vramUsed: 73728, utilization: 90, temperature: 72, powerDraw: 680, powerLimit: 700, status: 'in_use', assignedModel: 'DeepSeek-V3-671B' },
  { id: 6, node: 'gpu-worker-03', index: 1, name: 'H100-SXM5-80GB', vramTotal: 81920, vramUsed: 71680, utilization: 88, temperature: 70, powerDraw: 665, powerLimit: 700, status: 'in_use', assignedModel: 'DeepSeek-V3-671B' },
  { id: 7, node: 'gpu-worker-04', index: 0, name: 'L40S-48GB', vramTotal: 49152, vramUsed: 20480, utilization: 42, temperature: 52, powerDraw: 185, powerLimit: 350, status: 'in_use', assignedModel: 'Phi-3-Medium-14B' },
  { id: 8, node: 'gpu-worker-04', index: 1, name: 'L40S-48GB', vramTotal: 49152, vramUsed: 8192, utilization: 15, temperature: 45, powerDraw: 120, powerLimit: 350, status: 'available', assignedModel: '' },
];

const mockPoolSummary = [
  { gpuType: 'A100', totalCount: 16, available: 4, inUse: 12, totalVRAM: 1310, usedVRAM: 920, avgUtil: 69 },
  { gpuType: 'H100', totalCount: 8, available: 0, inUse: 8, totalVRAM: 655, usedVRAM: 580, avgUtil: 88 },
  { gpuType: 'L40S', totalCount: 4, available: 2, inUse: 2, totalVRAM: 192, usedVRAM: 80, avgUtil: 46 },
];

const GPUManagement: React.FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);

  const totalGPUs = mockPoolSummary.reduce((s, p) => s + p.totalCount, 0);
  const totalAvailable = mockPoolSummary.reduce((s, p) => s + p.available, 0);
  const totalVRAM = mockPoolSummary.reduce((s, p) => s + p.totalVRAM, 0);
  const usedVRAM = mockPoolSummary.reduce((s, p) => s + p.usedVRAM, 0);
  const avgUtil = mockPoolSummary.reduce((s, p) => s + p.avgUtil * p.totalCount, 0) / totalGPUs;

  const getUtilColor = (util: number) => {
    if (util >= 90) return '#F53F3F';
    if (util >= 70) return '#FF7D00';
    if (util >= 50) return '#165DFF';
    return '#00B42A';
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'online': return <Chip label={status} size="small" color="success" />;
      case 'in_use': return <Chip label="In Use" size="small" sx={{ bgcolor: '#165DFF', color: '#fff' }} />;
      case 'available': return <Chip label="Available" size="small" color="success" variant="outlined" />;
      case 'error': return <Chip label="Error" size="small" color="error" />;
      default: return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h2">{t('gpu.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('gpu.subtitle')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} size="small">
            {t('gpu.syncGPUStack')}
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">{t('gpu.totalGPUs')}</Typography>
                <GPUIcon sx={{ color: '#165DFF', fontSize: 20 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>{totalGPUs}</Typography>
              <Typography variant="body2" color="success.main">{totalAvailable} {t('gpu.available')}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">{t('gpu.avgUtilization')}</Typography>
                <SpeedIcon sx={{ color: '#FF7D00', fontSize: 20 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>{avgUtil.toFixed(1)}%</Typography>
              <LinearProgress variant="determinate" value={avgUtil} sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: '#F2F3F5', '& .MuiLinearProgress-bar': { bgcolor: getUtilColor(avgUtil) } }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">{t('gpu.totalVRAM')}</Typography>
                <StorageIcon sx={{ color: '#14C9C9', fontSize: 20 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>{totalVRAM} GB</Typography>
              <Typography variant="body2" color="text.secondary">{t('gpu.used')}: {usedVRAM} GB ({((usedVRAM/totalVRAM)*100).toFixed(0)}%)</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">{t('gpu.workerNodes')}</Typography>
                <CheckCircle sx={{ color: '#00B42A', fontSize: 20 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>{mockGPUNodes.length}</Typography>
              <Typography variant="body2" color="success.main">{t('gpu.allOnline')}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* GPU Pool Utilization Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>{t('gpu.poolUtilization')}</Typography>
          <Box sx={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockPoolSummary} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="gpuType" type="category" width={60} tick={{ fontSize: 12 }} />
                <ReTooltip />
                <Bar dataKey="avgUtil" name="Avg Utilization %" radius={[0, 4, 4, 0]}>
                  {mockPoolSummary.map((entry, index) => (
                    <Cell key={index} fill={getUtilColor(entry.avgUtil)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs: Nodes / Devices */}
      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label={t('gpu.nodesTab')} />
          <Tab label={t('gpu.devicesTab')} />
          <Tab label={t('gpu.poolTab')} />
        </Tabs>

        {tab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.name')}</TableCell>
                  <TableCell>Host</TableCell>
                  <TableCell>GPU Type</TableCell>
                  <TableCell>GPU Count</TableCell>
                  <TableCell>{t('gpu.utilization')}</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                  <TableCell>Cluster</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockGPUNodes.map((node) => (
                  <TableRow key={node.id} hover>
                    <TableCell sx={{ fontWeight: 500, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8125rem' }}>{node.name}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{node.host}</TableCell>
                    <TableCell>{node.gpuType}</TableCell>
                    <TableCell>
                      <Badge badgeContent={node.gpuCount} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}>
                        <GPUIcon fontSize="small" />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress variant="determinate" value={node.utilization} sx={{ width: 80, height: 6, borderRadius: 3, bgcolor: '#F2F3F5', '& .MuiLinearProgress-bar': { bgcolor: getUtilColor(node.utilization) } }} />
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', minWidth: 36 }}>{node.utilization}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getStatusChip(node.status)}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem' }}>{node.cluster}</TableCell>
                    <TableCell>
                      <IconButton size="small"><ViewIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 1 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Node</TableCell>
                  <TableCell>#</TableCell>
                  <TableCell>GPU</TableCell>
                  <TableCell>VRAM</TableCell>
                  <TableCell>{t('gpu.utilization')}</TableCell>
                  <TableCell><TempIcon sx={{ fontSize: 16 }} /></TableCell>
                  <TableCell><PowerIcon sx={{ fontSize: 16 }} /></TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                  <TableCell>{t('gpu.assignedModel')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockGPUDevices.map((device) => (
                  <TableRow key={device.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{device.node}</TableCell>
                    <TableCell>{device.index}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem' }}>{device.name}</TableCell>
                    <TableCell>
                      <Tooltip title={`${device.vramUsed} / ${device.vramTotal} MB`}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LinearProgress variant="determinate" value={(device.vramUsed / device.vramTotal) * 100} sx={{ width: 60, height: 6, borderRadius: 3, bgcolor: '#F2F3F5', '& .MuiLinearProgress-bar': { bgcolor: '#14C9C9' } }} />
                          <Typography variant="body2" sx={{ fontSize: '0.6875rem' }}>{(device.vramUsed/1024).toFixed(0)}G</Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Circle sx={{ fontSize: 8, color: getUtilColor(device.utilization) }} />
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{device.utilization}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{device.temperature}°C</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{device.powerDraw}W/{device.powerLimit}W</TableCell>
                    <TableCell>{getStatusChip(device.status)}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: device.assignedModel ? 'text.primary' : 'text.disabled' }}>
                      {device.assignedModel || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 2 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>GPU Type</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Available</TableCell>
                  <TableCell>In Use</TableCell>
                  <TableCell>Total VRAM</TableCell>
                  <TableCell>Used VRAM</TableCell>
                  <TableCell>Avg Utilization</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockPoolSummary.map((pool) => (
                  <TableRow key={pool.gpuType} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{pool.gpuType}</TableCell>
                    <TableCell>{pool.totalCount}</TableCell>
                    <TableCell><Chip label={pool.available} size="small" color="success" /></TableCell>
                    <TableCell><Chip label={pool.inUse} size="small" sx={{ bgcolor: '#165DFF', color: '#fff' }} /></TableCell>
                    <TableCell>{pool.totalVRAM} GB</TableCell>
                    <TableCell>{pool.usedVRAM} GB</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress variant="determinate" value={pool.avgUtil} sx={{ width: 100, height: 8, borderRadius: 4, bgcolor: '#F2F3F5', '& .MuiLinearProgress-bar': { bgcolor: getUtilColor(pool.avgUtil), borderRadius: 4 } }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{pool.avgUtil}%</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
};

export default GPUManagement;
