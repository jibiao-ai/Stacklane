import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Card, CardContent, Button, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';

const mockServices = [
  { id: 1, name: 'llama-3-70b-chat', status: 'running', runtime: 'vLLM', replicas: 3, endpoint: '/v1/chat/completions', p95: 45, throughput: 120 },
  { id: 2, name: 'qwen-2-72b', status: 'running', runtime: 'vLLM', replicas: 2, endpoint: '/v1/completions', p95: 52, throughput: 95 },
  { id: 3, name: 'codestral-22b', status: 'running', runtime: 'llama.cpp', replicas: 1, endpoint: '/v1/chat/completions', p95: 38, throughput: 150 },
  { id: 4, name: 'mixtral-8x7b', status: 'error', runtime: 'TensorRT', replicas: 2, endpoint: '-', p95: 0, throughput: 0 },
  { id: 5, name: 'phi-3-medium', status: 'pending', runtime: 'GPUStack', replicas: 1, endpoint: '-', p95: 0, throughput: 0 },
];

const Services: React.FC = () => {
  const { t } = useTranslation();
  const getStatusColor = (status: string) => {
    switch (status) { case 'running': return 'success'; case 'error': return 'error'; case 'pending': return 'warning'; default: return 'default'; }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h2">{t('services.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>{t('services.deploy')}</Button>
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
                {mockServices.map((svc) => (
                  <TableRow key={svc.id} hover>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 500 }}>{svc.name}</TableCell>
                    <TableCell><Chip label={svc.status} size="small" color={getStatusColor(svc.status) as any} /></TableCell>
                    <TableCell>{svc.runtime}</TableCell>
                    <TableCell>{svc.replicas}</TableCell>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' }}>{svc.endpoint}</TableCell>
                    <TableCell>{svc.p95 || '-'}</TableCell>
                    <TableCell>{svc.throughput || '-'}</TableCell>
                    <TableCell>
                      <IconButton size="small"><ViewIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
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

export default Services;
