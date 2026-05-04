import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Select, FormControl, InputLabel, Button, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon, Download as DownloadIcon } from '@mui/icons-material';

const allEvents = [
  { id: 1, type: 'deployment', action: 'deploy', resource: 'llama-3-70b-chat', detail: 'Deployed v1.2 with rolling strategy', severity: 'info', time: '2026-05-04 14:30' },
  { id: 2, type: 'alert', action: 'triggered', resource: 'gpu-worker-03', detail: 'Memory usage exceeds 95%', severity: 'critical', time: '2026-05-04 14:25' },
  { id: 3, type: 'scaling', action: 'scale_up', resource: 'qwen-2-72b', detail: 'Scaled from 2 to 3 replicas', severity: 'info', time: '2026-05-04 13:50' },
  { id: 4, type: 'policy', action: 'update', resource: 'rate-limit-policy', detail: 'Updated rate limit from 100 to 200 req/s', severity: 'warning', time: '2026-05-04 12:00' },
  { id: 5, type: 'service', action: 'restart', resource: 'mixtral-8x7b', detail: 'Service restarted due to OOM', severity: 'error', time: '2026-05-04 11:30' },
  { id: 6, type: 'deployment', action: 'rollback', resource: 'deepseek-v3', detail: 'Rolled back to v2.1 due to high error rate', severity: 'warning', time: '2026-05-04 10:15' },
  { id: 7, type: 'security', action: 'blocked', resource: 'api-gateway', detail: 'Blocked 15 suspicious requests from IP 192.168.x.x', severity: 'critical', time: '2026-05-04 09:45' },
  { id: 8, type: 'scaling', action: 'scale_down', resource: 'phi-3-medium', detail: 'Scaled from 4 to 2 replicas (low traffic)', severity: 'info', time: '2026-05-04 08:20' },
];

const Events: React.FC = () => {
  const { t } = useTranslation();
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [search, setSearch] = useState('');

  const getSeverityColor = (s: string) => { switch(s) { case 'critical': return 'error'; case 'error': return 'error'; case 'warning': return 'warning'; default: return 'info'; } };

  const filteredEvents = allEvents.filter(e => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
    if (search && !e.resource.toLowerCase().includes(search.toLowerCase()) && !e.detail.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h2">{t('events.title')}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export CSV">
            <IconButton onClick={() => alert('Exported ' + filteredEvents.length + ' events to CSV')}><DownloadIcon /></IconButton>
          </Tooltip>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => { setTypeFilter('all'); setSeverityFilter('all'); setSearch(''); }}>{t('common.refresh')}</Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField size="small" placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 200 }} />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Type</InputLabel>
          <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)}>
            <MenuItem value="all">{t('events.allTypes')}</MenuItem>
            {['deployment', 'alert', 'scaling', 'policy', 'service', 'security'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Severity</InputLabel>
          <Select value={severityFilter} label="Severity" onChange={(e) => setSeverityFilter(e.target.value)}>
            <MenuItem value="all">{t('events.allSeverity')}</MenuItem>
            {['info', 'warning', 'error', 'critical'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <Chip label={`${filteredEvents.length} results`} size="small" sx={{ alignSelf: 'center' }} />
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Detail</TableCell>
                  <TableCell>Severity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' }}>{e.time}</TableCell>
                    <TableCell><Chip label={e.type} size="small" variant="outlined" /></TableCell>
                    <TableCell>{e.action}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{e.resource}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>{e.detail}</TableCell>
                    <TableCell><Chip label={e.severity} size="small" color={getSeverityColor(e.severity) as any} /></TableCell>
                  </TableRow>
                ))}
                {filteredEvents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#86909C' }}>{t('common.noData')}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Events;
