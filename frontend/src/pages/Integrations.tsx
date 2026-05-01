import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Button, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress,
} from '@mui/material';
import {
  Sync as SyncIcon, CheckCircle, Link as LinkIcon, Hub as HubIcon,
  CloudSync, Schedule, Memory as GPUIcon,
} from '@mui/icons-material';

const gpustackInfo = {
  status: 'connected',
  version: '0.4.1',
  endpoint: 'https://gpustack.internal:8080',
  lastSync: '2026-05-01 14:32:15',
  workers: 4,
  models: 6,
  instances: 12,
};

const gpustackWorkers = [
  { id: 'w1', name: 'gpu-worker-01', ip: '10.0.1.101', gpus: 8, status: 'active', models: 2 },
  { id: 'w2', name: 'gpu-worker-02', ip: '10.0.1.102', gpus: 8, status: 'active', models: 2 },
  { id: 'w3', name: 'gpu-worker-03', ip: '10.0.1.103', gpus: 8, status: 'active', models: 1 },
  { id: 'w4', name: 'gpu-worker-04', ip: '10.0.1.104', gpus: 4, status: 'active', models: 1 },
];

const gpustackModels = [
  { id: 'm1', name: 'Llama-3.1-70B-Instruct', backend: 'vllm', replicas: 2, ready: 2, status: 'running' },
  { id: 'm2', name: 'Qwen-2.5-72B-Chat', backend: 'vllm', replicas: 2, ready: 2, status: 'running' },
  { id: 'm3', name: 'DeepSeek-V3-671B', backend: 'vllm', replicas: 1, ready: 1, status: 'running' },
  { id: 'm4', name: 'Codestral-22B', backend: 'llama-box', replicas: 1, ready: 1, status: 'running' },
  { id: 'm5', name: 'Mixtral-8x7B', backend: 'vllm', replicas: 1, ready: 0, status: 'error' },
  { id: 'm6', name: 'Phi-3-Medium-14B', backend: 'llama-box', replicas: 1, ready: 1, status: 'running' },
];

const Integrations: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h2">{t('integrations.title')}</Typography>
          <Typography variant="body2" color="text.secondary">{t('integrations.subtitle')}</Typography>
        </Box>
      </Box>

      {/* GPUStack Integration Card */}
      <Card sx={{ mb: 3, border: '2px solid', borderColor: '#722ED1' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#722ED1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HubIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>GPUStack</Typography>
                <Typography variant="body2" color="text.secondary">
                  GPU Cluster Management & AI Model Serving Platform
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip icon={<CheckCircle sx={{ fontSize: 14 }} />} label="Connected" size="small" color="success" />
              <Button variant="outlined" startIcon={<SyncIcon />} size="small">
                {t('integrations.syncNow')}
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Version</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{gpustackInfo.version}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Workers</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{gpustackInfo.workers}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Models</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{gpustackInfo.models}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Instances</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{gpustackInfo.instances}</Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', gap: 3, fontSize: '0.75rem', color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LinkIcon sx={{ fontSize: 14 }} />
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{gpustackInfo.endpoint}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Schedule sx={{ fontSize: 14 }} />
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Last sync: {gpustackInfo.lastSync}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {/* Workers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>GPUStack Workers</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell>GPUs</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Models</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {gpustackWorkers.map((w) => (
                      <TableRow key={w.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{w.name}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{w.ip}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <GPUIcon sx={{ fontSize: 14, color: '#165DFF' }} />
                            <Typography variant="body2">{w.gpus}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell><Chip label={w.status} size="small" color="success" /></TableCell>
                        <TableCell>{w.models}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Models from GPUStack */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>GPUStack Models</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Model</TableCell>
                      <TableCell>Backend</TableCell>
                      <TableCell>Replicas</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {gpustackModels.map((m) => (
                      <TableRow key={m.id} hover>
                        <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>{m.name}</TableCell>
                        <TableCell>
                          <Chip label={m.backend} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                            {m.ready}/{m.replicas}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={m.status}
                            size="small"
                            color={m.status === 'running' ? 'success' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Other Integrations Placeholder */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>{t('integrations.otherIntegrations')}</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ opacity: 0.6 }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CloudSync sx={{ fontSize: 36, color: 'text.secondary', mb: 1 }} />
              <Typography variant="subtitle2">Dify</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>LLM Application Platform</Typography>
              <Chip label="Coming Soon" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ opacity: 0.6 }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CloudSync sx={{ fontSize: 36, color: 'text.secondary', mb: 1 }} />
              <Typography variant="subtitle2">Prometheus</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Monitoring & Alerting</Typography>
              <Chip label="Connected" size="small" color="success" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ opacity: 0.6 }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CloudSync sx={{ fontSize: 36, color: 'text.secondary', mb: 1 }} />
              <Typography variant="subtitle2">Grafana</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>Dashboards & Visualization</Typography>
              <Chip label="Connected" size="small" color="success" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Integrations;
