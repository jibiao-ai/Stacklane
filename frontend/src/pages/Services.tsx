import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Card, CardContent, Button, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert,
  Grid, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Visibility as ViewIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface Service {
  id: number; name: string; status: string; runtime: string; replicas: number; endpoint: string; p95: number; throughput: number;
}

const initialServices: Service[] = [
  { id: 1, name: 'llama-3-70b-chat', status: 'running', runtime: 'vLLM', replicas: 3, endpoint: '/v1/chat/completions', p95: 45, throughput: 120 },
  { id: 2, name: 'qwen-2-72b', status: 'running', runtime: 'vLLM', replicas: 2, endpoint: '/v1/completions', p95: 52, throughput: 95 },
  { id: 3, name: 'codestral-22b', status: 'running', runtime: 'llama.cpp', replicas: 1, endpoint: '/v1/chat/completions', p95: 38, throughput: 150 },
  { id: 4, name: 'mixtral-8x7b', status: 'error', runtime: 'TensorRT', replicas: 2, endpoint: '-', p95: 0, throughput: 0 },
  { id: 5, name: 'phi-3-medium', status: 'pending', runtime: 'GPUStack', replicas: 1, endpoint: '-', p95: 0, throughput: 0 },
];

const Services: React.FC = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  const [newService, setNewService] = useState({ name: '', runtime: 'vLLM', replicas: 1 });

  const getStatusColor = (status: string) => {
    switch (status) { case 'running': return 'success'; case 'error': return 'error'; case 'pending': return 'warning'; default: return 'default'; }
  };

  const handleCreate = () => {
    if (!newService.name.trim()) return;
    const svc: Service = {
      id: Date.now(), name: newService.name, status: 'pending', runtime: newService.runtime,
      replicas: newService.replicas, endpoint: '/v1/chat/completions', p95: 0, throughput: 0,
    };
    setServices(prev => [...prev, svc]);
    setCreateOpen(false);
    setNewService({ name: '', runtime: 'vLLM', replicas: 1 });
    setSnackbar({ open: true, message: `Service "${svc.name}" created, deploying...`, severity: 'success' });
    // Simulate startup
    setTimeout(() => {
      setServices(prev => prev.map(s => s.id === svc.id ? { ...s, status: 'running', p95: 42, throughput: 100 } : s));
    }, 3000);
  };

  const handleDelete = (svc: Service) => {
    setServices(prev => prev.filter(s => s.id !== svc.id));
    setSnackbar({ open: true, message: `Service "${svc.name}" deleted`, severity: 'info' });
  };

  const handleView = (svc: Service) => {
    setSelectedService(svc);
    setDetailOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h2">{t('services.title')}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => setSnackbar({ open: true, message: 'Service status refreshed', severity: 'info' })}>{t('common.refresh')}</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>{t('services.create')}</Button>
        </Box>
      </Box>
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.name')}</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                  <TableCell>{t('services.runtime')}</TableCell>
                  <TableCell>{t('services.replicas')}</TableCell>
                  <TableCell>{t('services.endpoint')}</TableCell>
                  <TableCell>P95 (ms)</TableCell>
                  <TableCell>QPS</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((svc) => (
                  <TableRow key={svc.id} hover>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 500 }}>{svc.name}</TableCell>
                    <TableCell><Chip label={svc.status} size="small" color={getStatusColor(svc.status) as any} /></TableCell>
                    <TableCell>{svc.runtime}</TableCell>
                    <TableCell>{svc.replicas}</TableCell>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' }}>{svc.endpoint}</TableCell>
                    <TableCell>{svc.p95 || '-'}</TableCell>
                    <TableCell>{svc.throughput || '-'}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleView(svc)}><ViewIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(svc)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('services.create')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label={t('common.name')} value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} placeholder="my-model-service" />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>{t('services.runtime')}</InputLabel>
                <Select value={newService.runtime} label={t('services.runtime')} onChange={(e) => setNewService({ ...newService, runtime: e.target.value })}>
                  {['vLLM', 'GPUStack', 'llama.cpp', 'TensorRT-LLM'].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label={t('services.replicas')} value={newService.replicas} onChange={(e) => setNewService({ ...newService, replicas: parseInt(e.target.value) || 1 })} inputProps={{ min: 1, max: 10 }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newService.name.trim()}>{t('common.confirm')}</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Service Detail</DialogTitle>
        <DialogContent>
          {selectedService && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2"><strong>Name:</strong> {selectedService.name}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>Status:</strong> {selectedService.status}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>Runtime:</strong> {selectedService.runtime}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>Replicas:</strong> {selectedService.replicas}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>Endpoint:</strong> {selectedService.endpoint}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>P95 Latency:</strong> {selectedService.p95} ms</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>Throughput:</strong> {selectedService.throughput} QPS</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>{t('common.confirm')}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Services;
