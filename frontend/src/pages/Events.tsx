import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const mockEvents = [
  { id: 1, type: 'deployment', action: 'deploy', resource: 'llama-3-70b-chat', detail: 'Deployed v1.2 with rolling strategy', severity: 'info', time: '2026-04-30 14:30' },
  { id: 2, type: 'alert', action: 'triggered', resource: 'gpu-worker-03', detail: 'Memory usage exceeds 95%', severity: 'critical', time: '2026-04-30 14:25' },
  { id: 3, type: 'scaling', action: 'scale_up', resource: 'qwen-2-72b', detail: 'Scaled from 2 to 3 replicas', severity: 'info', time: '2026-04-30 13:50' },
  { id: 4, type: 'policy', action: 'update', resource: 'rate-limit-policy', detail: 'Updated rate limit from 100 to 200 req/s', severity: 'warning', time: '2026-04-30 12:00' },
  { id: 5, type: 'service', action: 'restart', resource: 'mixtral-8x7b', detail: 'Service restarted due to OOM', severity: 'error', time: '2026-04-30 11:30' },
];

const Events: React.FC = () => {
  const { t } = useTranslation();
  const getSeverityColor = (s: string) => { switch(s) { case 'critical': return 'error'; case 'error': return 'error'; case 'warning': return 'warning'; default: return 'info'; } };

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 3 }}>{t('events.title')}</Typography>
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.time')}</TableCell>
                  <TableCell>{t('common.type')}</TableCell>
                  <TableCell>{t('events.action')}</TableCell>
                  <TableCell>{t('events.resource')}</TableCell>
                  <TableCell>{t('events.detail')}</TableCell>
                  <TableCell>Severity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockEvents.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' }}>{e.time}</TableCell>
                    <TableCell><Chip label={e.type} size="small" variant="outlined" /></TableCell>
                    <TableCell>{e.action}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{e.resource}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>{e.detail}</TableCell>
                    <TableCell><Chip label={e.severity} size="small" color={getSeverityColor(e.severity) as any} /></TableCell>
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

export default Events;
