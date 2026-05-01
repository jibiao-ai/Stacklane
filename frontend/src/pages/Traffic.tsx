import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Card, CardContent, Grid, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Slider, Switch, FormControlLabel,
  LinearProgress, Alert,
} from '@mui/material';
import {
  Add, Delete, Edit, PlayArrow, Stop, Refresh, ToggleOn, ToggleOff,
  Science, Speed, Shield, AltRoute,
} from '@mui/icons-material';

// Mock data
const mockRules = [
  { id: 1, name: 'Canary - Llama 3.1 v2', type: 'weight', service_id: 1, traffic_pct: 20, target_version: 'v2.0', status: 'active', priority: 100 },
  { id: 2, name: 'Header-based routing', type: 'header', service_id: 2, traffic_pct: 100, target_version: 'v1.1', status: 'active', priority: 50 },
  { id: 3, name: 'Beta users - DeepSeek', type: 'cookie', service_id: 3, traffic_pct: 10, target_version: 'v3-beta', status: 'disabled', priority: 200 },
];

const mockABTests = [
  { id: 1, name: 'Qwen 72B vs Llama 70B', status: 'running', metric_type: 'latency', started_at: '2026-04-25T10:00:00Z', variants: [
    { name: 'Control (Qwen)', traffic_pct: 50, request_count: 12500, avg_latency: 245, error_rate: 0.2 },
    { name: 'Variant A (Llama)', traffic_pct: 50, request_count: 12300, avg_latency: 198, error_rate: 0.3 },
  ]},
  { id: 2, name: 'vLLM vs GPUStack backend', status: 'completed', metric_type: 'throughput', started_at: '2026-04-20T08:00:00Z', variants: [
    { name: 'vLLM', traffic_pct: 50, request_count: 50000, avg_latency: 180, error_rate: 0.1 },
    { name: 'GPUStack', traffic_pct: 50, request_count: 49800, avg_latency: 210, error_rate: 0.15 },
  ]},
];

const mockRateLimits = [
  { id: 1, name: 'Global API limit', scope: 'global', max_requests: 10000, window_size: 60, strategy: 'sliding_window', status: 'active' },
  { id: 2, name: 'Tenant free tier', scope: 'tenant', max_requests: 100, window_size: 60, strategy: 'token_bucket', status: 'active' },
  { id: 3, name: 'Per-user limit', scope: 'user', max_requests: 30, window_size: 60, strategy: 'fixed_window', status: 'active' },
];

const mockBreakers = [
  { id: 1, name: 'Llama-3.1-70B Service', state: 'closed', failure_threshold: 5, failure_count: 1, timeout: 30, service_id: 1 },
  { id: 2, name: 'DeepSeek-V3 Service', state: 'half_open', failure_threshold: 3, failure_count: 3, timeout: 60, service_id: 3 },
  { id: 3, name: 'Mixtral Service', state: 'open', failure_threshold: 5, failure_count: 8, timeout: 30, service_id: 5 },
];

const Traffic: React.FC = () => {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'error' | 'warning' | 'default' | 'info'> = {
      active: 'success', disabled: 'default', running: 'info', completed: 'success',
      closed: 'success', half_open: 'warning', open: 'error', draft: 'default',
    };
    return colors[status] || 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{t('traffic.title')}</Typography>
          <Typography variant="body2" color="text.secondary">{t('traffic.subtitle')}</Typography>
        </Box>
        <Button variant="contained" startIcon={<Refresh />}>{t('common.refresh') || 'Refresh'}</Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <AltRoute color="primary" />
                <Typography variant="body2" color="text.secondary">{t('traffic.activeRules')}</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>2</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Science color="info" />
                <Typography variant="body2" color="text.secondary">{t('traffic.runningTests')}</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>1</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Speed color="warning" />
                <Typography variant="body2" color="text.secondary">{t('traffic.rateLimits')}</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>3</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Shield color="error" />
                <Typography variant="body2" color="text.secondary">{t('traffic.openBreakers')}</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>1</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
        <Tab label={t('traffic.rulesTab')} />
        <Tab label={t('traffic.abTestTab')} />
        <Tab label={t('traffic.rateLimitTab')} />
        <Tab label={t('traffic.circuitBreakerTab')} />
      </Tabs>

      {/* Traffic Rules */}
      {tabIndex === 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6">{t('traffic.routingRules')}</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => setRuleDialogOpen(true)}>
                {t('traffic.createRule')}
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.name')}</TableCell>
                    <TableCell>{t('traffic.type')}</TableCell>
                    <TableCell>{t('traffic.trafficPct')}</TableCell>
                    <TableCell>{t('traffic.targetVersion')}</TableCell>
                    <TableCell>{t('traffic.priority')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                    <TableCell>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell><Typography fontWeight={500}>{rule.name}</Typography></TableCell>
                      <TableCell><Chip label={rule.type} size="small" variant="outlined" /></TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress variant="determinate" value={rule.traffic_pct} sx={{ width: 60, height: 6, borderRadius: 3 }} />
                          <Typography variant="body2">{rule.traffic_pct}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{rule.target_version}</TableCell>
                      <TableCell>{rule.priority}</TableCell>
                      <TableCell><Chip label={rule.status} size="small" color={getStatusColor(rule.status)} /></TableCell>
                      <TableCell>
                        <IconButton size="small"><Edit fontSize="small" /></IconButton>
                        <IconButton size="small">{rule.status === 'active' ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}</IconButton>
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

      {/* A/B Tests */}
      {tabIndex === 1 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6">{t('traffic.abTests')}</Typography>
              <Button variant="contained" startIcon={<Add />}>{t('traffic.createTest')}</Button>
            </Box>
            {mockABTests.map((test) => (
              <Card key={test.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{test.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('traffic.metric')}: {test.metric_type} | {t('traffic.startedAt')}: {new Date(test.started_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip label={test.status} size="small" color={getStatusColor(test.status)} sx={{ mr: 1 }} />
                    {test.status === 'running' && (
                      <Button size="small" color="warning" startIcon={<Stop />}>{t('traffic.stop')}</Button>
                    )}
                  </Box>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('traffic.variant')}</TableCell>
                        <TableCell>{t('traffic.trafficPct')}</TableCell>
                        <TableCell>{t('traffic.requests')}</TableCell>
                        <TableCell>{t('traffic.avgLatency')}</TableCell>
                        <TableCell>{t('traffic.errorRate')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {test.variants.map((v, i) => (
                        <TableRow key={i}>
                          <TableCell><Typography fontWeight={500}>{v.name}</Typography></TableCell>
                          <TableCell>{v.traffic_pct}%</TableCell>
                          <TableCell>{v.request_count.toLocaleString()}</TableCell>
                          <TableCell>{v.avg_latency}ms</TableCell>
                          <TableCell>{v.error_rate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Rate Limits */}
      {tabIndex === 2 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6">{t('traffic.rateLimitConfig')}</Typography>
              <Button variant="contained" startIcon={<Add />}>{t('traffic.createLimit')}</Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.name')}</TableCell>
                    <TableCell>{t('traffic.scope')}</TableCell>
                    <TableCell>{t('traffic.maxRequests')}</TableCell>
                    <TableCell>{t('traffic.window')}</TableCell>
                    <TableCell>{t('traffic.strategy')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                    <TableCell>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockRateLimits.map((limit) => (
                    <TableRow key={limit.id}>
                      <TableCell><Typography fontWeight={500}>{limit.name}</Typography></TableCell>
                      <TableCell><Chip label={limit.scope} size="small" variant="outlined" /></TableCell>
                      <TableCell>{limit.max_requests.toLocaleString()}</TableCell>
                      <TableCell>{limit.window_size}s</TableCell>
                      <TableCell><Chip label={limit.strategy} size="small" /></TableCell>
                      <TableCell><Chip label={limit.status} size="small" color={getStatusColor(limit.status)} /></TableCell>
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

      {/* Circuit Breakers */}
      {tabIndex === 3 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6">{t('traffic.circuitBreakers')}</Typography>
              <Button variant="contained" startIcon={<Add />}>{t('traffic.createBreaker')}</Button>
            </Box>
            <Grid container spacing={2}>
              {mockBreakers.map((breaker) => (
                <Grid item xs={12} md={4} key={breaker.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1" fontWeight={600}>{breaker.name}</Typography>
                        <Chip label={breaker.state} size="small" color={getStatusColor(breaker.state)} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('traffic.failures')}: {breaker.failure_count} / {breaker.failure_threshold}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(breaker.failure_count / breaker.failure_threshold) * 100}
                        color={breaker.state === 'open' ? 'error' : breaker.state === 'half_open' ? 'warning' : 'success'}
                        sx={{ mb: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {t('traffic.timeout')}: {breaker.timeout}s
                      </Typography>
                      {breaker.state !== 'closed' && (
                        <Button size="small" variant="outlined" sx={{ mt: 1 }}>{t('traffic.reset')}</Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Create Rule Dialog */}
      <Dialog open={ruleDialogOpen} onClose={() => setRuleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('traffic.createRule')}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label={t('common.name')} margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('traffic.type')}</InputLabel>
            <Select label={t('traffic.type')} defaultValue="weight">
              <MenuItem value="weight">{t('traffic.typeWeight')}</MenuItem>
              <MenuItem value="header">{t('traffic.typeHeader')}</MenuItem>
              <MenuItem value="cookie">{t('traffic.typeCookie')}</MenuItem>
              <MenuItem value="path">{t('traffic.typePath')}</MenuItem>
            </Select>
          </FormControl>
          <Typography gutterBottom mt={2}>{t('traffic.trafficPct')}: 20%</Typography>
          <Slider defaultValue={20} min={0} max={100} valueLabelDisplay="auto" />
          <TextField fullWidth label={t('traffic.targetVersion')} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRuleDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={() => setRuleDialogOpen(false)}>{t('common.create')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Traffic;
