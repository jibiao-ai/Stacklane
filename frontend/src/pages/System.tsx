import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Card, CardContent, Grid, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Button, TextField,
  Switch, FormControlLabel, Divider, Alert, Select, MenuItem, FormControl,
  InputLabel,
} from '@mui/material';
import {
  Settings, Notifications, Security, Backup, Speed, Info,
  Email, Webhook, Chat,
} from '@mui/icons-material';

const System: React.FC = () => {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);

  const systemInfo = {
    version: '1.0.0', go_version: 'go1.21.13', os: 'linux', arch: 'amd64',
    cpus: 32, goroutines: 128, memory_alloc: 256, memory_sys: 512,
    uptime_seconds: 345600, started_at: '2026-04-27T00:00:00Z',
  };

  const auditLogs = [
    { id: 1, username: 'admin', action: 'deploy', resource: 'service/llama-3.1', detail: 'Deployed v2.0 with canary strategy', created_at: '2026-05-01 10:30', status: 'success' },
    { id: 2, username: 'admin', action: 'update', resource: 'model/qwen-72b', detail: 'Updated model version to v2.5', created_at: '2026-05-01 09:15', status: 'success' },
    { id: 3, username: 'operator1', action: 'create', resource: 'tenant/cv-team', detail: 'Created new tenant with quota 30', created_at: '2026-04-30 16:45', status: 'success' },
    { id: 4, username: 'admin', action: 'delete', resource: 'policy/old-scaling', detail: 'Removed deprecated scaling policy', created_at: '2026-04-30 14:20', status: 'success' },
    { id: 5, username: 'john', action: 'login', resource: 'auth', detail: 'Failed login attempt', created_at: '2026-04-30 11:00', status: 'failure' },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{t('system.title')}</Typography>
          <Typography variant="body2" color="text.secondary">{t('system.subtitle')}</Typography>
        </Box>
      </Box>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
        <Tab icon={<Info />} label={t('system.infoTab')} iconPosition="start" />
        <Tab icon={<Settings />} label={t('system.configTab')} iconPosition="start" />
        <Tab icon={<Notifications />} label={t('system.notificationTab')} iconPosition="start" />
        <Tab icon={<Security />} label={t('system.auditTab')} iconPosition="start" />
        <Tab icon={<Backup />} label={t('system.backupTab')} iconPosition="start" />
      </Tabs>

      {/* System Info */}
      {tabIndex === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('system.serverInfo')}</Typography>
                <Grid container spacing={2}>
                  {[
                    { label: t('system.version'), value: systemInfo.version },
                    { label: 'Go', value: systemInfo.go_version },
                    { label: 'OS / Arch', value: `${systemInfo.os} / ${systemInfo.arch}` },
                    { label: 'CPUs', value: systemInfo.cpus },
                    { label: 'Goroutines', value: systemInfo.goroutines },
                    { label: t('system.uptime'), value: `${Math.floor(systemInfo.uptime_seconds / 86400)} days` },
                  ].map((item, i) => (
                    <Grid item xs={6} key={i}>
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      <Typography variant="body1" fontWeight={500}>{item.value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('system.resourceUsage')}</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">{t('system.memoryAlloc')}</Typography>
                    <Typography variant="h5" fontWeight={700}>{systemInfo.memory_alloc} MB</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">{t('system.memorySys')}</Typography>
                    <Typography variant="h5" fontWeight={700}>{systemInfo.memory_sys} MB</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('system.components')}</Typography>
                <Grid container spacing={2}>
                  {[
                    { name: 'MySQL 8.0', status: 'running', detail: 'stacklane-mysql:3306' },
                    { name: 'Redis 7', status: 'running', detail: 'stacklane-redis:6379' },
                    { name: 'Prometheus', status: 'running', detail: 'stacklane-prometheus:9090' },
                    { name: 'Grafana', status: 'running', detail: 'stacklane-grafana:3000' },
                    { name: 'GPUStack', status: 'connected', detail: 'External service' },
                    { name: 'Dify', status: 'disconnected', detail: 'Not configured' },
                  ].map((comp, i) => (
                    <Grid item xs={4} key={i}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" p={1} border="1px solid #eee" borderRadius={1}>
                        <Box>
                          <Typography fontWeight={500}>{comp.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{comp.detail}</Typography>
                        </Box>
                        <Chip label={comp.status} size="small" color={comp.status === 'running' || comp.status === 'connected' ? 'success' : 'default'} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Configuration */}
      {tabIndex === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('system.generalConfig')}</Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField fullWidth label={t('system.siteName')} defaultValue="Stacklane" margin="normal" />
                <TextField fullWidth label={t('system.siteUrl')} defaultValue="https://stacklane.example.com" margin="normal" />
                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('system.defaultLang')}</InputLabel>
                  <Select defaultValue="zh" label={t('system.defaultLang')}>
                    <MenuItem value="zh">Chinese</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label={t('system.sessionTimeout')} type="number" defaultValue={24} margin="normal" helperText={t('system.hours')} />
                <TextField fullWidth label={t('system.maxUploadSize')} type="number" defaultValue={500} margin="normal" helperText="MB" />
                <FormControlLabel control={<Switch defaultChecked />} label={t('system.enableRegistration')} sx={{ mt: 2 }} />
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>{t('system.performanceConfig')}</Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField fullWidth label={t('system.maxConcurrency')} type="number" defaultValue={1000} margin="normal" />
                <TextField fullWidth label={t('system.requestTimeout')} type="number" defaultValue={30} margin="normal" helperText="seconds" />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label={t('system.cacheExpiry')} type="number" defaultValue={300} margin="normal" helperText="seconds" />
                <FormControlLabel control={<Switch defaultChecked />} label={t('system.enableCache')} sx={{ mt: 2 }} />
              </Grid>
            </Grid>
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button variant="contained">{t('common.save')}</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      {tabIndex === 2 && (
        <Grid container spacing={3}>
          {[
            { icon: <Email />, channel: 'Email (SMTP)', enabled: true, config: 'smtp.example.com:465' },
            { icon: <Webhook />, channel: 'Webhook', enabled: true, config: 'https://hooks.example.com/stacklane' },
            { icon: <Chat />, channel: t('system.dingtalk'), enabled: false, config: t('system.notConfigured') },
            { icon: <Chat />, channel: t('system.feishu'), enabled: true, config: 'App ID: cli_xxxxx' },
          ].map((item, i) => (
            <Grid item xs={6} key={i}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      {item.icon}
                      <Typography variant="subtitle1" fontWeight={600}>{item.channel}</Typography>
                    </Box>
                    <Switch defaultChecked={item.enabled} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" mt={1}>{item.config}</Typography>
                  <Button size="small" sx={{ mt: 1 }}>{t('system.configure')}</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('system.alertRules')}</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>{t('system.alertRulesDesc')}</Alert>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <FormControlLabel control={<Switch defaultChecked />} label={t('system.alertGPU')} />
                  </Grid>
                  <Grid item xs={4}>
                    <FormControlLabel control={<Switch defaultChecked />} label={t('system.alertService')} />
                  </Grid>
                  <Grid item xs={4}>
                    <FormControlLabel control={<Switch defaultChecked />} label={t('system.alertSecurity')} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Audit Logs */}
      {tabIndex === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('system.auditLogs')}</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('system.time')}</TableCell>
                    <TableCell>{t('system.user')}</TableCell>
                    <TableCell>{t('system.action')}</TableCell>
                    <TableCell>{t('system.resource')}</TableCell>
                    <TableCell>{t('system.detail')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell><Typography variant="body2">{log.created_at}</Typography></TableCell>
                      <TableCell><Chip label={log.username} size="small" variant="outlined" /></TableCell>
                      <TableCell><Chip label={log.action} size="small" /></TableCell>
                      <TableCell><Typography variant="body2" fontFamily="monospace">{log.resource}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{log.detail}</Typography></TableCell>
                      <TableCell>
                        <Chip label={log.status} size="small" color={log.status === 'success' ? 'success' : 'error'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Backup */}
      {tabIndex === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('system.backupStatus')}</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">{t('system.autoBackup')}</Typography>
                    <Chip label={t('system.enabled')} size="small" color="success" sx={{ mt: 0.5 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">{t('system.interval')}</Typography>
                    <Typography fontWeight={500}>{t('system.daily')}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">{t('system.lastBackup')}</Typography>
                    <Typography fontWeight={500}>2026-05-01 04:00</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">{t('system.nextBackup')}</Typography>
                    <Typography fontWeight={500}>2026-05-02 04:00</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">{t('system.retention')}</Typography>
                    <Typography fontWeight={500}>30 {t('system.days')}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">{t('system.location')}</Typography>
                    <Typography fontWeight={500}>/backups/stacklane</Typography>
                  </Grid>
                </Grid>
                <Button variant="contained" sx={{ mt: 2 }}>{t('system.triggerBackup')}</Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('system.backupSettings')}</Typography>
                <FormControlLabel control={<Switch defaultChecked />} label={t('system.autoBackup')} />
                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('system.interval')}</InputLabel>
                  <Select defaultValue="daily" label={t('system.interval')}>
                    <MenuItem value="hourly">{t('system.hourly')}</MenuItem>
                    <MenuItem value="daily">{t('system.daily')}</MenuItem>
                    <MenuItem value="weekly">{t('system.weekly')}</MenuItem>
                  </Select>
                </FormControl>
                <TextField fullWidth label={t('system.retention')} type="number" defaultValue={30} margin="normal" helperText={t('system.days')} />
                <TextField fullWidth label={t('system.location')} defaultValue="/backups/stacklane" margin="normal" />
                <Box mt={2} display="flex" justifyContent="flex-end">
                  <Button variant="contained">{t('common.save')}</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default System;
