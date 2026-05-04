import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, CardContent, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert, Switch } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Policy {
  id: number; name: string; type: string; rule: string; status: string;
}

const initialPolicies: Policy[] = [
  { id: 1, name: 'GPU Quota - Team A', type: 'quota', rule: 'max_gpu=16, max_memory=1280GB', status: 'active' },
  { id: 2, name: 'Rate Limit - External API', type: 'routing', rule: 'max_rps=200, burst=50', status: 'active' },
  { id: 3, name: 'Auto Scale - Production', type: 'scaling', rule: 'min=2, max=8, target_util=70%', status: 'active' },
  { id: 4, name: 'Access Control - Viewer', type: 'access', rule: 'read_only=true, no_deploy=true', status: 'active' },
  { id: 5, name: 'Legacy Rate Limit', type: 'routing', rule: 'max_rps=50', status: 'disabled' },
];

const Policies: React.FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState<Policy | null>(null);
  const [newPolicy, setNewPolicy] = useState({ name: '', type: 'quota', rule: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({ open: false, message: '', severity: 'success' });

  const filterTypes = ['all', 'quota', 'access', 'scaling', 'routing'];
  const filteredPolicies = tab === 0 ? policies : policies.filter(p => p.type === filterTypes[tab]);

  const handleCreate = () => {
    if (!newPolicy.name.trim() || !newPolicy.rule.trim()) return;
    const p: Policy = { id: Date.now(), name: newPolicy.name, type: newPolicy.type, rule: newPolicy.rule, status: 'active' };
    setPolicies(prev => [...prev, p]);
    setCreateOpen(false);
    setNewPolicy({ name: '', type: 'quota', rule: '' });
    setSnackbar({ open: true, message: `Policy "${p.name}" created`, severity: 'success' });
  };

  const handleEdit = (p: Policy) => {
    setEditPolicy({ ...p });
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editPolicy) return;
    setPolicies(prev => prev.map(p => p.id === editPolicy.id ? editPolicy : p));
    setEditOpen(false);
    setSnackbar({ open: true, message: `Policy "${editPolicy.name}" updated`, severity: 'success' });
  };

  const handleDelete = (p: Policy) => {
    setPolicies(prev => prev.filter(x => x.id !== p.id));
    setSnackbar({ open: true, message: `Policy "${p.name}" deleted`, severity: 'info' });
  };

  const handleToggleStatus = (p: Policy) => {
    const newStatus = p.status === 'active' ? 'disabled' : 'active';
    setPolicies(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus } : x));
    setSnackbar({ open: true, message: `Policy "${p.name}" ${newStatus}`, severity: 'info' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h2">{t('policies.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>{t('policies.create')}</Button>
      </Box>
      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label={t('policies.allTypes')} />
          <Tab label="Quota" />
          <Tab label="Access" />
          <Tab label="Scaling" />
          <Tab label="Routing" />
        </Tabs>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.name')}</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Rule</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPolicies.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
                    <TableCell><Chip label={p.type} size="small" variant="outlined" /></TableCell>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' }}>{p.rule}</TableCell>
                    <TableCell>
                      <Switch size="small" checked={p.status === 'active'} onChange={() => handleToggleStatus(p)} color="success" />
                      <Chip label={p.status} size="small" color={p.status === 'active' ? 'success' : 'default'} sx={{ ml: 0.5 }} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEdit(p)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(p)}><DeleteIcon fontSize="small" /></IconButton>
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
        <DialogTitle>{t('policies.create')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label={t('common.name')} value={newPolicy.name} onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })} placeholder="My Policy" />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={newPolicy.type} label="Type" onChange={(e) => setNewPolicy({ ...newPolicy, type: e.target.value })}>
                  {['quota', 'routing', 'scaling', 'access'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Rule" value={newPolicy.rule} onChange={(e) => setNewPolicy({ ...newPolicy, rule: e.target.value })} placeholder="max_gpu=8, max_memory=640GB" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newPolicy.name.trim() || !newPolicy.rule.trim()}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('common.edit')}</DialogTitle>
        <DialogContent>
          {editPolicy && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField fullWidth label={t('common.name')} value={editPolicy.name} onChange={(e) => setEditPolicy({ ...editPolicy, name: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={2} label="Rule" value={editPolicy.rule} onChange={(e) => setEditPolicy({ ...editPolicy, rule: e.target.value })} />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveEdit}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Policies;
