import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, CardContent, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress } from '@mui/material';

const mockClusters = [
  { id: 1, name: 'us-east-1', region: 'US East', status: 'active', nodes: 8 },
  { id: 2, name: 'us-west-2', region: 'US West', status: 'active', nodes: 5 },
  { id: 3, name: 'cn-beijing', region: 'China North', status: 'active', nodes: 6 },
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
  const getUtilColor = (v: number) => { if (v > 90) return 'error'; if (v > 70) return 'warning'; return 'primary'; };

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 3 }}>{t('capacity.title')}</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {mockClusters.map((c) => (
          <Grid item xs={12} md={4} key={c.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5">{c.name}</Typography>
                  <Chip label={c.status} size="small" color="success" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{c.region}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>{t('capacity.nodeCount')}: {c.nodes}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>{t('capacity.nodes')}</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.name')}</TableCell>
                  <TableCell>{t('capacity.gpuType')}</TableCell>
                  <TableCell>{t('capacity.gpuCount')}</TableCell>
                  <TableCell>{t('capacity.utilization')}</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                  <TableCell>Cluster</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockNodes.map((n) => (
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
    </Box>
  );
};

export default Capacity;
