import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Card, CardContent, Grid, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, LinearProgress,
  Avatar, AvatarGroup,
} from '@mui/material';
import {
  Add, Delete, Edit, People, Business, Storage, Memory,
} from '@mui/icons-material';

const mockTenants = [
  { id: 1, name: 'AI Research Lab', status: 'active', quota: 100, gpu_used: 24, services: 8, models: 12, members: 15, created_at: '2026-01-15' },
  { id: 2, name: 'NLP Production', status: 'active', quota: 50, gpu_used: 18, services: 5, models: 6, members: 8, created_at: '2026-02-10' },
  { id: 3, name: 'Computer Vision', status: 'active', quota: 30, gpu_used: 12, services: 3, models: 4, members: 5, created_at: '2026-03-01' },
  { id: 4, name: 'Testing Sandbox', status: 'suspended', quota: 10, gpu_used: 0, services: 0, models: 2, members: 3, created_at: '2026-04-01' },
];

const mockMembers = [
  { id: 1, username: 'zhangwei', email: 'zhangwei@company.com', role: 'admin', locale: 'zh' },
  { id: 2, username: 'lina', email: 'lina@company.com', role: 'operator', locale: 'zh' },
  { id: 3, username: 'wangchao', email: 'wangchao@company.com', role: 'operator', locale: 'zh' },
  { id: 4, username: 'john_smith', email: 'john@company.com', role: 'viewer', locale: 'en' },
  { id: 5, username: 'liufang', email: 'liufang@company.com', role: 'viewer', locale: 'zh' },
];

const Tenants: React.FC = () => {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedTenant, setSelectedTenant] = useState<typeof mockTenants[0] | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const getRoleColor = (role: string) => {
    const colors: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
      admin: 'error', operator: 'warning', viewer: 'info',
    };
    return colors[role] || 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{t('tenants.title')}</Typography>
          <Typography variant="body2" color="text.secondary">{t('tenants.subtitle')}</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>
          {t('tenants.create')}
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Business color="primary" />
                <Typography variant="body2" color="text.secondary">{t('tenants.totalTenants')}</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>4</Typography>
              <Typography variant="body2" color="text.secondary">{t('tenants.active')}: 3</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <People color="info" />
                <Typography variant="body2" color="text.secondary">{t('tenants.totalMembers')}</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>31</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Memory color="warning" />
                <Typography variant="body2" color="text.secondary">{t('tenants.gpuAllocated')}</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>54</Typography>
              <Typography variant="body2" color="text.secondary">{t('tenants.totalQuota')}: 190</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Storage color="success" />
                <Typography variant="body2" color="text.secondary">{t('tenants.totalServices')}</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>16</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
        <Tab label={t('tenants.listTab')} />
        <Tab label={t('tenants.membersTab')} disabled={!selectedTenant} />
        <Tab label={t('tenants.quotaTab')} disabled={!selectedTenant} />
      </Tabs>

      {/* Tenant List */}
      {tabIndex === 0 && (
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.name')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                    <TableCell>{t('tenants.gpuQuota')}</TableCell>
                    <TableCell>{t('tenants.services')}</TableCell>
                    <TableCell>{t('tenants.models')}</TableCell>
                    <TableCell>{t('tenants.members')}</TableCell>
                    <TableCell>{t('tenants.createdAt')}</TableCell>
                    <TableCell>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockTenants.map((tenant) => (
                    <TableRow
                      key={tenant.id}
                      hover
                      selected={selectedTenant?.id === tenant.id}
                      onClick={() => setSelectedTenant(tenant)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#165DFF', fontSize: 14 }}>
                            {tenant.name.charAt(0)}
                          </Avatar>
                          <Typography fontWeight={500}>{tenant.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tenant.status}
                          size="small"
                          color={tenant.status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{tenant.gpu_used} / {tenant.quota}</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(tenant.gpu_used / tenant.quota) * 100}
                            sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                            color={(tenant.gpu_used / tenant.quota) > 0.8 ? 'warning' : 'primary'}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{tenant.services}</TableCell>
                      <TableCell>{tenant.models}</TableCell>
                      <TableCell>{tenant.members}</TableCell>
                      <TableCell>{tenant.created_at}</TableCell>
                      <TableCell>
                        <IconButton size="small"><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Members Tab */}
      {tabIndex === 1 && selectedTenant && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6">{selectedTenant.name} - {t('tenants.members')}</Typography>
              <Button variant="contained" startIcon={<Add />}>{t('tenants.addMember')}</Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('tenants.username')}</TableCell>
                    <TableCell>{t('tenants.email')}</TableCell>
                    <TableCell>{t('tenants.role')}</TableCell>
                    <TableCell>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{member.username.charAt(0).toUpperCase()}</Avatar>
                          <Typography>{member.username}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell><Chip label={member.role} size="small" color={getRoleColor(member.role)} /></TableCell>
                      <TableCell>
                        <IconButton size="small"><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Quota Tab */}
      {tabIndex === 2 && selectedTenant && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>{selectedTenant.name} - {t('tenants.quotaManagement')}</Typography>
            <Grid container spacing={3}>
              {[
                { label: t('tenants.gpuQuota'), used: selectedTenant.gpu_used, total: selectedTenant.quota },
                { label: t('tenants.serviceQuota'), used: selectedTenant.services, total: selectedTenant.quota * 2 },
                { label: t('tenants.modelQuota'), used: selectedTenant.models, total: selectedTenant.quota * 5 },
                { label: t('tenants.memberQuota'), used: selectedTenant.members, total: selectedTenant.quota * 3 },
              ].map((item, i) => (
                <Grid item xs={6} key={i}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" gutterBottom>{item.label}</Typography>
                      <Typography variant="h5" fontWeight={700}>{item.used} / {item.total}</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(item.used / item.total) * 100}
                        sx={{ height: 8, borderRadius: 4, mt: 1 }}
                        color={(item.used / item.total) > 0.8 ? 'error' : (item.used / item.total) > 0.6 ? 'warning' : 'primary'}
                      />
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {t('tenants.usage')}: {((item.used / item.total) * 100).toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('tenants.create')}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label={t('common.name')} margin="normal" />
          <TextField fullWidth label={t('tenants.gpuQuota')} type="number" margin="normal" defaultValue={10} />
          <TextField fullWidth label={t('tenants.description')} multiline rows={3} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={() => setCreateDialogOpen(false)}>{t('common.create')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tenants;
