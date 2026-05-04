import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, CardContent, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Button, Snackbar, Alert, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon, Visibility as ViewIcon } from '@mui/icons-material';

const mockClusters = [
  { id: 1, name: 'us-east-1', region: 'US East', status: 'active', nodes: 8, totalGPU: 64, usedGPU: 48 },
  { id: 2, name: 'us-west-2', region: 'US West', status: 'active', nodes: 5, totalGPU: 40, usedGPU: 32 },
  { id: 3, name: 'cn-beijing', region: 'China North', status: 'active', nodes: 6, totalGPU: 36, usedGPU: 20 },
];

const mockNodes = [
  { id: 1, name: 'gpu-worker-01', gpuType: 'A100 80GB', gpuCount: 8, utilization: 72, status: 'online', cluster: 'us-east-1' },
  { id: 2, name: 'gpu-worker-02', gpuType: 'A100 80GB', gpuCount: 8, utilization: 85, status: 'online', cluster: 'us-east-1' },
  { id: 3, name: 'gpu-worker-03', gpuType: 'H100 80GB', gpuCount: 8, utilization: 95, status: 'online', cluster: 'us-west-2' },
  { id: 4, name: 'gpu-worker-04', gpuType: 'A100 40GB', gpuCount: 4, utilization: 45, status: 'online', cluster: 'cn-beijing' },
  { id: 5, name: 'gpu-worker-05', gpuType: 'RTX 4090', gpuCount: 4, utilization: 0, status: 'offline', cluster: 'cn-beijing' },
];

const Capacity: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const getUtilColor = (v: number) => { if (v > 90) return 'error'; if (v > 70) return 'warning'; return 'primary'; };

  const filteredNodes = selectedCluster ? mockNodes.filter(n => n.cluster === selectedCluster) : mockNodes;

  const handleRefresh = () => {
    setSnackbar({ open: true, message: 'Capacity data refreshed from GPUStack' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h2">{t('capacity.title')}</Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>{t('common.refresh')}</Button>
      </Box>

      {/* Cluster cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {mockClusters.map((c) => (
          <Grid item xs={12} md={4} key={c.id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selectedCluster === c.name ? '2px solid #165DFF' : '1px solid transparent',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#165DFF', boxShadow: '0 2px 8px rgba(22, 93, 255, 0.12)' },
              }}
              onClick={() => setSelectedCluster(selectedCluster === c.name ? null : c.name)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5">{c.name}</Typography>
                  <Chip label={c.status} size="small" color="success" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{c.region}</Typography>
                <Box sx={{ mt: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">GPU: {c.usedGPU}/{c.totalGPU}</Typography>
                    <Typography variant="body2">{Math.round(c.usedGPU / c.totalGPU * 100)}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={c.usedGPU / c.totalGPU * 100} color={getUtilColor(c.usedGPU / c.totalGPU * 100) as any} sx={{ height: 6, borderRadius: 3 }} />
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>Nodes: {c.nodes}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Nodes table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {t('capacity.nodeDetails')} {selectedCluster && <Chip label={selectedCluster} size="small" onDelete={() => setSelectedCluster(null)} sx={{ ml: 1 }} />}
            </Typography>
            <Typography variant="body2" color="text.secondary">{filteredNodes.length} nodes</Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.name')}</TableCell>
                  <TableCell>GPU Type</TableCell>
                  <TableCell>Count</TableCell>
                  <TableCell>Utilization</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                  <TableCell>{t('capacity.clusters')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNodes.map((n) => (
                  <TableRow key={n.id} hover>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{n.name}</TableCell>
                    <TableCell>{n.gpuType}</TableCell>
                    <TableCell>{n.gpuCount}</TableCell>
                    <TableCell sx={{ minWidth: 150 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress variant="determinate" value={n.utilization} color={getUtilColor(n.utilization) as any} sx={{ flexGrow: 1, height: 6, borderRadius: 3 }} />
                        <Typography variant="body2" sx={{ minWidth: 35 }}>{n.utilization}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={n.status} size="small" color={n.status === 'online' ? 'success' : 'default'} /></TableCell>
                    <TableCell>{n.cluster}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Capacity;
