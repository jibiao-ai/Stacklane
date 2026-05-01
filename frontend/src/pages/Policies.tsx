import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, CardContent, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tabs, Tab } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const mockPolicies = [
  { id: 1, name: 'GPU Quota - Team A', type: 'quota', rule: 'max_gpu=16, max_memory=1280GB', status: 'active' },
  { id: 2, name: 'Rate Limit - External API', type: 'routing', rule: 'max_rps=200, burst=50', status: 'active' },
  { id: 3, name: 'Auto Scale - Production', type: 'scaling', rule: 'min=2, max=8, target_util=70%', status: 'active' },
  { id: 4, name: 'Access Control - Viewer', type: 'access', rule: 'read_only=true, no_deploy=true', status: 'active' },
  { id: 5, name: 'Legacy Rate Limit', type: 'routing', rule: 'max_rps=50', status: 'disabled' },
];

const Policies: React.FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = React.useState(0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h2">{t('policies.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>{t('common.create')}</Button>
      </Box>
      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label={t('common.filter') + ': All'} />
          <Tab label={t('policies.quota')} />
          <Tab label={t('policies.access')} />
          <Tab label={t('policies.scaling')} />
          <Tab label={t('policies.routing')} />
        </Tabs>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.name')}</TableCell>
                  <TableCell>{t('common.type')}</TableCell>
                  <TableCell>{t('policies.rule')}</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockPolicies.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
                    <TableCell><Chip label={p.type} size="small" variant="outlined" /></TableCell>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' }}>{p.rule}</TableCell>
                    <TableCell><Chip label={p.status} size="small" color={p.status === 'active' ? 'success' : 'default'} /></TableCell>
                    <TableCell>
                      <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
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

export default Policies;
